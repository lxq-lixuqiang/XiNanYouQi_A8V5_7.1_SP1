/**
 * Created by 伟 on 2016/8/9.
 */

var change = {};
(function() {
    var m3Error,m3i18n,m3Ajax, getParam = {},wechatSystem=false,dataArray=[],initDataArray, $ = $cmp;
    define(function(require, exports, module) {
        //加载模块
        require('m3');
        m3Error = require('error');
        m3i18n = require("m3i18n");
        m3Ajax = require("ajax");
        initPage();
    });
    function initPage(){
        cmp.ready(function() {
            // wechatSystem=true;
            wechatSystem = cmp.platform.wechat || cmp.platform.wechatOrDD;//微信端或者钉钉端
            getParam = cmp.href.getParam() || {};
            initPageUI();
            initEvent();
            initData();
        });
    }
    
    //初始化事件
    function initEvent() {
        //安卓自带返回键
        // document.addEventListener("backbutton", function() {
        //     cmp.href.back();
        // });
        //点击返回
        $("header").find(".cmp-action-back").on("tap", function() {
            backFun();
        });

        //选择公司
        $(".search-person").on("tap", "li", function(event) {
            event.stopPropagation();
            if(!getParam.isScope){
                cmp.storage.save("companyId", $(this).attr("data-i"), true);
                cmp.storage.save("curCompanyId", $(this).attr("data-i"), true); 
            }
            getParam.companyid = $(this).attr("data-i");
            $(".search-company").find(".cmp-table-view-cell.is-select-active").removeClass("is-select-active");
            $(this).addClass("is-select-active");
            // change.loadData();
            if(wechatSystem){
                if(getParam.isScope){
                    var options = {   
                        business:getParam.isScope,
                        isCompanyId:$(this).attr("data-i"),
                        isCompanyName:$(this).find(".cmp-pull-left").text()
                    };
                    cmp.storage.save("addressbook_wechatChangeScopeCompanyCache",JSON.stringify(options),true);
                }else {  //记录切换的行政组织单位
                    var options = {   
                        business:getParam.isScope||false,
                        isCompanyId:$(this).attr("data-i"),
                        isCompanyName:$(this).find(".cmp-pull-left").text(),
                        isRefreshCompanyId:$(this).attr("data-i")
                    };
                    cmp.storage.save("addressbook_wechatChangeOrgCompanyCache",JSON.stringify(options),true);
                }
                
                
                cmp.href.back();
            }else{
                cmp.webViewListener.fire({
                    type:"isOrgRefresh",  //此参数必须和webview1注册的事件名相同
                    data:{
                        "isRefreshCompanyId":$(this).attr("data-i"),
                        "isCompanyId": $(this).attr("data-i"),
                        "isCompanyName":$(this).find(".cmp-pull-left").text(),
                        "business":getParam.isScope ||false
                    }, //webview2传给webview1的参数
                    success:function(){
                        cmp.href.back();
                    },
                    error:function(res){
                        console.log(res);
                    }
                });
            }
            

        });
        change.select.on("tap", ".cmp-pull-right", function(event) {
            event.stopPropagation();
            var _this = $(this);
            var dataPath = _this.parent().attr("data-path");
            change.companyList = change.childList[dataPath];
            cmp.sdk.setGestureBackState(false);//禁用手势返回
            setTimeout(function(){ //OA-180125未显示该父单位的子单位
                dataArray.push(dataPath);
                change.loadData();
            },10);
        })
    }
    //初始化页面
    function initPageUI() {
        change.select = $(".search-company");
        change.companyId = -1;
        if(!wechatSystem){
            $("header").removeClass("cmp-header-backHandle");
        }else{
            $(".search-person").removeClass("cmp-content");
        }
        //动态赋值滚动容器高度
        $(".search-person").height($(window).height() - $("header").height());
        cmp.backbutton();
        cmp.backbutton.push(backFun);
        
    }
    //返回逻辑
    function backFun(){
        if(dataArray.length==1){
            change.companyList = initDataArray;
            change.loadData();
        }else if(dataArray.length == 0){
            cmp.href.back();
        }else{
            change.companyList = change.childList[dataArray[dataArray.length-2]];
            change.loadData();
        }
        dataArray.splice(dataArray.length-1,1);
        if(dataArray.length == 0 ){
            cmp.sdk.setGestureBackState(true);//开启手势返回
        }
    }
    //获取数据及渲染
    function initData() {
        //加载数据
        change.getData = (function() {
            cmp.dialog.loading();
            var url = m3.curServerInfo.url +(wechatSystem?"/seeyon":"/mobile_portal/seeyon") + "/rest/contacts2/accounts/" + change.companyId;
            m3Ajax({
                url: url,
                type: "GET",
                success: function(res) {
                    cmp.dialog.loading(false);
                    if (res.code == 200 && res.data) {
                        change.companyList = res.data.firstAccounts;
                        if(getParam && getParam.isScope){
                            if(res.data.group_account && res.data.group_account){
                                change.companyList.unshift(res.data.group_account);
                            }
                        }
                        initDataArray = change.companyList;
                        change.childList = res.data.pathToAccounts
                        change.loadData();
                    }
                },
                error: function(res) {
                    cmp.dialog.loading(false);
                    if (res.code == -110) {
                        cmp.dialog.loading({
                            status: "nonetwork",
                            callback: function() {
                                window.location.reload();
                            }
                        });
                    } else if (res.code !== 401 && res.code !== 1001 && res.code !== 1002 && res.code !== 1003 && res.code !== 1004) {
                        cmp.dialog.loading({
                            status: "systembusy",
                            text: "<span style='color:#999;font-size: 14px;margin-top: 18px;'>" + m3i18n[cmp.language].systemBusy + "</span>",
                            callback: function() {
                                window.location.reload();
                            }
                        });

                    }
                }
            });
        }());
        //渲染数据
        change.loadData = function() {
            var html = "";
            for (var i = 0; i < change.companyList.length; i++) {
                var companyItem = change.companyList[i];
                var rightIcon = (change.childList[companyItem.path] ? '<div class="cmp-pull-right"><span class="iconfont see-icon-m3-arrow-right"></span></div>' : "");
                var addActiveCLass = getParam.companyid == companyItem.id ? ' is-select-active' : '';
                html += '<li data-i="' + companyItem.id + '"class="cmp-table-view-cell'+addActiveCLass+'" data-path="' + companyItem.path + '"> ' + '<div class="cmp-pull-left">' + (companyItem.name) + '</div> ' + rightIcon + '</li>';
            }
            change.select.html(html);
        };
    }
}());
