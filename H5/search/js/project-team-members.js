/**
 * 项目组-人员信息 by 伟 on 2016/12/14.
 */

var projectMembers = {};
(function() {
    var m3Error,m3i18n,m3Ajax,imgCanLoaded = true,imgIdArr = [],materMark, $ = $cmp;
    define(function(require, exports, module) {
        //加载模块
        require('m3');
        require('commons');
        m3Error = require('error');
        m3i18n = require("m3i18n");
        m3Ajax = require("ajax");

        initPage();
    });
    function initPage(){
        cmp.ready(function() {
            materMark = cmp.href.getParam().materMark;
            initPageUI();
            initEvent();
            initData();
            loadDOM();
            if(Object.getOwnPropertyNames(materMark).length>0){
                if(materMark.materMarkEnable=="true"&&materMark.materMarkAddressBookEnable=="true"){
                    watermark(m3.userInfo.getCurrentMember().name, m3.userInfo.getCurrentMember().accShortName, getDate());
                }
            }
        });
    }
    function getGoPersonUrl(uid) {
        /*获取跳转人员信息地址*/
        var isSelf = uid == m3.userInfo.getCurrentMember().id;
        if (!arguments.length || !uid) return m3.href.map.my_personInfo;
        // var isSelf = false;
        return isSelf?m3.href.map.my_person_detail:m3.href.map.my_other_person_detail;
    }
    //初始化事件
    function initEvent() {
        //点击返回
        $("header").find(".cmp-action-back").on("tap", function() {
            cmp.href.back();
        });

        //安卓自带返回键
        document.addEventListener("backbutton", function() {
            cmp.href.back();
        });

        //点击人员
        var timer,clickMark = true;
        $(".search-depart").on("tap", "li", function() {
            if(clickMark){
                clearTimeout(timer);
                clickMark = false;
                timer = setTimeout(function(){
                    clickMark = true;
                },300);
                var id = $(this).attr("data-i");
                var url = getGoPersonUrl(id) + "&page=project-team-project&id=" + id + "&from=m3&enableChat=true";
                cmp.href.next(url, '', {
                    openWebViewCatch: true,
                    pushInDetailPad: true,
                    nativeBanner: false
                });
                // m3.state.go(getGoPersonUrl(id) + "&page=project-team-project&id=" + id + "&from=m3&enableChat=true","",1,1);
           
            }
         });
        cmp.event.orientationChange(function(res){
            var windowH = window.innerHeight;
            var headerH = document.querySelector("header.cmp-bar-nav.cmp-bar").offsetHeight;
            var cmpControl = document.querySelector(".cmp-control-content.cmp-active");
            var height = windowH - headerH;
            cmpControl.style.height = height+"px";
            cmp.listView("#pullrefresh").refreshHeight(height);
        });
    }
    //初始化页面
    function initPageUI() {
        //ajax分页pageNum
        projectMembers.num = 0;
        //获取上一页面传递的数据
        projectMembers.parentData = cmp.href.getParam();
        //标题 -- 项目组名称
        $(".cmp-title").html(projectMembers.parentData.title);

        //listView 提示
        projectMembers.pulldownTip = {
            contentdown: m3i18n[cmp.language].pulldownTipDown, //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
            contentover: m3i18n[cmp.language].pulldownTipOver, //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
            contentrefresh: m3i18n[cmp.language].pulldownTipRefresh, //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
            contentprepage: m3i18n[cmp.language].pulldownTipPrepage
        };
        projectMembers.pullupTip = {
            contentdown: m3i18n[cmp.language].pullupTipDown, //可选，在上拉可刷新状态时，上拉刷新控件上显示的标题内容
            contentrefresh: m3i18n[cmp.language].pullupTipRefresh, //可选，正在加载状态时，上拉加载控件上显示的标题内容
            contentnomore: m3i18n[cmp.language].pullupTipNomore, //可选，请求完毕若没有更多数据时显示的提醒内容；
            contentnextpage: m3i18n[cmp.language].pullupTipNextpage
        };
    }
    //获取数据、渲染数据方法
    function initData() {
        //获取数据
        projectMembers.getData = function(param, options) {
            projectMembers.num = param["pageNo"];
            var url = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/contacts2/projectTeam/members/" + projectMembers.parentData.id + "/" + projectMembers.num + "/20";
            m3Ajax({
                url: url,
                type: "GET",
                success: function(res) {
                    console.log(res);
                    if (res.code == 200 && res.data) {
                        options.success(res.data);
                    }
                },
                error: function(res) {
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
        };
        //渲染数据
        projectMembers.loadData = function(data, isRefresh) {
            var html = "";
            imgIdArr = [];
            for (var i = 0; i < data.length; i++) {
                // html += '<li data-i="' + data[i].id + '" class="cmp-table-view-cell cmp-media list-top"><div class="cmp-pull-left"  style="background-image: url('+m3.curServerInfo.url + '/mobile_portal' + data[i].iconUrl + ');background-size: cover;background-position: 50% 50%"></div> <p class="message_list_title">' + (data[i].name.length > 10 ? (data[i].name.slice(0, 10) + "...") : data[i].name) + '</p> <p class="cmp-ellipsis">' + data[i].postName.escapeHTML() + '</p> </li>';
                html += '<li id="'+data[i].id+'" data-i="' + data[i].id + '" class="cmp-table-view-cell cmp-media list-top"><div class="cmp-pull-left"  style="background-image: url('+m3.curServerInfo.url + '/mobile_portal/seeyon/rest/orgMember/avatar/'+ data[i].id + '?maxWidth=200);background-size: cover;background-position: 50% 50%"></div> <p class="message_list_title">' + (data[i].name.length > 10 ? (data[i].name.slice(0, 10) + "...") : data[i].name) + '</p> <p class="cmp-ellipsis">' + (data[i].postName || '').escapeHTML() + '</p> </li>';
                imgIdArr.push(data[i].id);
                // NameArr.push(data[i].name);
            }
            isRefresh ? $(".search-depart").html(html) : $(".search-depart").append(html);
            if (imgIdArr.length > 0) {
                checkLoaded(loadHeader);
            }
        };
    }
    //cmp-listView 渲染页面
    function loadDOM() {
        cmp.listView("#pullrefresh", {
            config: {
                pageSize: 20,
                dataFunc: function(params, option) {
                    projectMembers.getData(params, option);
                },
                renderFunc: projectMembers.loadData,
                onePageMaxNum: 100,
                params: [{}],
                isClear: false,
                crumbsID: projectMembers.parentData.id
            },
            up: projectMembers.pullupTip,
            down: projectMembers.pulldownTip
        });
    }



    var index = 0;
    function loadHeader() {
        imgCanLoaded = false;
        var imgObj = new Image(),
            url = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/orgMember/avatar/" + imgIdArr[index] + '?maxWidth=200';
        imgObj.src = url;
        imgObj.onerror = function() {
            // var cliceName;
            // if(funcChina(NameArr[index])){
            //     cliceName = NameArr[index].substr(0,2);//截取前两位字符
            // }else{//不是英文
            //     cliceName = NameArr[index].substr(1);//截取后两位字符
            // }
            // var str = '<span class="cliceName">'+cliceName+'</span>';
            // $('#'+imgIdArr[index]).find('.cmp-pull-left').html(str);

            $('#' + imgIdArr[index]).find('.cmp-pull-left').css('backgroundImage','url(http://commons.m3.cmp/v/imgs/header.png)');
            if (index == imgIdArr.length - 1) {
                imgCanLoaded = true;
                index = 0;
            } else {
                index++;
                loadHeader();
            }
        }
        imgObj.onload = function() {
            $('#' + imgIdArr[index]).find('.cmp-pull-left').css('backgroundImage','url(' + url + ')');
            if (index == imgIdArr.length - 1) {
                imgCanLoaded = true;
                index = 0;
            } else {
                index++;
                loadHeader();
            }
        }
    }
    
    function checkLoaded(callback) {
        var time = setInterval(function() {
            if (imgCanLoaded) {
                callback();
                clearInterval(time);
            }
        }, 50)
    }

    //通讯录水印 时间
    function getDate() {
        var date = new Date;var year = date.getFullYear();var month = date.getMonth() + 1;
        if (month < 10) { month = '0' + month; }
        var day = date.getDate();
        if (day < 10) {day = '0' + day;}
        var dateStr = year + "-" + month + "-" + day;
        return dateStr
    }
    //水印效果
    function watermark(userName, accShortName, date) {
        /* {
        水印内容：
            "materMarkNameEnable" : "false",    姓名
            "materMarkDeptEnable" : "true",     单位
            "materMarkTimeEnable" : "false",    时间
        是否设置水印：
            "materMarkEnable" : "true"
        }*/
        var name = materMark.materMarkNameEnable=="true"? userName:"";
        var dept = materMark.materMarkDeptEnable=="true"? accShortName:"";
        var time = materMark.materMarkTimeEnable=="true"? date:"";
        var watermarkUrl = cmp.watermark({
            userName: name,
            department: dept,
            date: time
        }).toBase64URL();

        $("ul.search-depart").css({
            "background-image": "url(" + watermarkUrl + ")",
            "background-repeat": "repeat",
            "background-position": "0% 0%",
            "background-size": "200px 100px"
        });
    }


}());
