/**
 * 项目组 by 伟 on 2016/12/14.
 */

var projectTeam = {};
(function() {
    var m3Error,m3i18n,m3Ajax,materMark, $ = $cmp;
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
            materMark = cmp.href.getParam();
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

        //点击进入项目组人员列表
        $("ul.search-depart").on("tap", "li", function() {
            var id = $(this).attr("data-i");
            var title = $(this).children(".cmp-pull-left").html();
            m3.state.go(m3.href.map.project_team_members, { "id": id, "title": title ,"materMark":materMark}, m3.href.animated.left, true);
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
    //初始化页面，
    function initPageUI() {
        //定义公共变量
        projectTeam.num = 0;
        projectTeam.pulldownTip = {
            contentdown: m3i18n[cmp.language].pulldownTipDown, //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
            contentover: m3i18n[cmp.language].pulldownTipOver, //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
            contentrefresh: m3i18n[cmp.language].pulldownTipRefresh, //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
            contentprepage: m3i18n[cmp.language].pulldownTipPrepage
        };
        projectTeam.pullupTip = {
            contentdown: m3i18n[cmp.language].pullupTipDown, //可选，在上拉可刷新状态时，上拉刷新控件上显示的标题内容
            contentrefresh: m3i18n[cmp.language].pullupTipRefresh, //可选，正在加载状态时，上拉加载控件上显示的标题内容
            contentnomore: m3i18n[cmp.language].pullupTipNomore, //可选，请求完毕若没有更多数据时显示的提醒内容；
            contentnextpage: m3i18n[cmp.language].pullupTipNextpage
        };
    }
    //获取数据、渲染数据方法
    function initData() {
        //获取数据
        projectTeam.getData = function(param, options) {
            projectTeam.num = param["pageNo"];
            var url = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/contacts2/member/projectTeam/" + projectTeam.num + "/20";
            m3Ajax({
                url: url,
                setCache: {
                    key: 'projectMember',
                    isShowNoNetWorkPage: false
                },
                type: "GET",
                success: function(res) {
                    console.log(res);
                    if (res.code == 200 && res.data) {
                        options.success(res.data);
                    }
                },
                error: function(res) {
                    if (res.code == -110) {
                        cmp.dialog.loading(false);
                        cmp.dialog.loading({
                            status: "nonetwork",
                            callback: function() {
                                window.location.reload();
                            }
                        });
                    } else if(res.code == "-1009"){
                        cmp.dialog.loading({
                            status: "nonetwork",
                            callback: function() {
                                window.location.reload();
                            }
                        });
                    } else if (res.code !== 401 && res.code !== 1001 && res.code !== 1002 && res.code !== 1003 && res.code !== 1004) {
                        cmp.dialog.loading(false);
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
        projectTeam.loadData = function(data, isRefresh) {
            var html = "";
            var colorArray = ['#3eb0ff', '#FFD142', '#27E0B8', '#FF7FAA', '#837FFF', '#FF7F7F'];
            for (var i = 0, len = data.length; i < len; i++) {
                //左侧简称
                var shortName = data[i].name.slice(0, 2);
                html += '<li data-i="' + data[i].id + '" class="cmp-table-view-cell"><div class="search-list-icon"><img src="../img/pic.png"></div><div class="cmp-pull-left">' + (data[i].name.length > 10 ? (data[i].name.slice(0, 10) + "...").escapeHTML() : data[i].name.escapeHTML()) + '</div><div class="cmp-pull-right">' + data[i].count + '<span class="iconfont see-icon-m3-arrow-right"></span></div> </li>';
            }
            isRefresh ? $(".search-depart").html(html) : $(".search-depart").append(html);
        };
    }

    //开始listView 获取渲染数据
    function loadDOM() {
        cmp.listView("#pullrefresh", {
            config: {
                pageSize: 20,
                dataFunc: function(params, option) {
                    projectTeam.getData(params, option);
                },
                renderFunc: projectTeam.loadData,
                onePageMaxNum: 100,
                params: [{}],
                isClear: false,
                crumbsID: "A"
            },
            up: projectTeam.pullupTip,
            down: projectTeam.pulldownTip
        });
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
