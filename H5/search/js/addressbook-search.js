/**
 * Created by mashan on 2016/8/9.
 */
(function() {
    var m3i18n, m3Ajax,getParam,listView,imgloader,wechatSystem, $ = $cmp;
    define(function(require, exports, module) {
        //加载模块
        require('m3');
        m3Error = require('error');
        m3i18n = require("m3i18n");
        m3Ajax = require("ajax");
        imgloader = require('commons/js/cmp-img-loader.js');
        initPage();
    });
    function initPage(){
        cmp.ready(function() {
            wechatSystem = cmp.platform.wechat || cmp.platform.wechatOrDD;//微信端或者钉钉端
            getParam = cmp.href.getParam();
            initEvent();
            initCacheData();
        });
    }
    //微信端，根据缓存再次进行搜索操作---back数据记录
    function initCacheData(){
        var searchValue = cmp.storage.get("addressbook_search_key",true);
        if(searchValue){
            $(".cmp-input-row.cmp-search").addClass("cmp-active");
            $('#searchInput').val(searchValue);
            initData();
        }else{
            $(".cmp-input-row.cmp-search").addClass("cmp-active");
            setTimeout(function(){
                $('#searchInput').focus();
            },500);
        }
    };
    //初始化事件
    function initEvent() {
        //搜索框事件
        $('#searchInput').on('keyup', function(e) {
            if(e.keyCode == 13 ){
                $("#searchInput").blur();
                setTimeout(function(){
                    if(listView){
                        listView.loading=false;
                        listView.pullupLoading(1);
                        // listView.refresh();
                    }else{
                        initData();
                    }
                },500);
            }
        });
        //点击取消
        $(".search-title-cancel").on("tap", function() {
            cmp.href.back();
        });
        //安卓自带返回键
        document.addEventListener("backbutton", function() {
            cmp.href.back();
        });
        // 搜索出来的人员穿透
        $('ul.search-people').on('tap', '.cmp-table-view-cell', function(e) {
            e.preventDefault();
            e.stopPropagation();
            cmp.storage.save("addressbook_search_key",document.querySelector("#searchInput").value,true);
            var id = $(this).attr("data-i"),
            name = $(this).find('.message_list_title').text();
            if(wechatSystem){
                // var url = cmp.seeyonbasepath + "/m3/apps/v5/addressbook/html/addressbookView.html";
                var options={
                    memberId:id,comeFrom:"0",pageInfo:url
                }
                cmp.href.next(_addressbookPath+"/layout/addressbook-memberDetail.html",options);
            }else{
                var url = getGoPersonUrl(id) + "&page=search-next&id=" + id + "&from=m3&enableChat=true&time=" + (new Date().getTime());
                cmp.href.next(url, {name: name, singleOpen:true,isOrganization:true}, {
                    openWebViewCatch: true,
                    pushInDetailPad: true,
                    nativeBanner: false
                });
                // m3.state.go(url, {name: name, singleOpen:true,isOrganization:true}, m3.href.animated.right, true );
            }
        });
    };
    //初始化listView
    function initData() {
        
        listView = cmp.listView("#listViewData", {
            config: {
                // captionType:0,
                // params: {ticket: "第二个参数"},
                params:{},
                // onePageMaxNum:10,
                pageSize: 20,
                dataFunc: getSearchData,
                renderFunc:renderSearchData
            },
            up: {
                contentdown: m3i18n[cmp.language].pullupTipDown, //可选，在上拉可刷新状态时，上拉刷新控件上显示的标题内容
                contentrefresh: m3i18n[cmp.language].pullupTipRefresh, //可选，正在加载状态时，上拉加载控件上显示的标题内容
                contentnomore: m3i18n[cmp.language].pullupTipNomore //可选，请求完毕若没有更多数据时显示的提醒内容；
                // contentnextpage: m3i18n[cmp.language].pullupTipNextpage
            },
            down: {
                contentdown: m3i18n[cmp.language].pulldownTipDown, //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
                contentover: m3i18n[cmp.language].pulldownTipOver, //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
                contentrefresh: m3i18n[cmp.language].pulldownTipRefresh //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
                // contentprepage: m3i18n[cmp.language].pulldownTipPrepage
            }
        });
    }
    //获取数据
    function getSearchData(params,options){
        var pageNo = params.pageNo || 1;
        var pageSize = params.pageSize || 10;
        var accId = getParam.scope?getParam.businessId:'-1';//行政组织搜索全集团，多维组织搜索指定多维组织下的人员
        var data={
            accId: accId,
            key: cmp.storage.get("addressbook_search_key",true)||document.querySelector("#searchInput").value || '',
            type: 'Name,Telnum'
        };
        var url = m3.curServerInfo.url + (wechatSystem?"/seeyon/rest":"/mobile_portal/seeyon/rest") + "/addressbook/searchMember?pageNo="+pageNo+"&pageSize="+pageSize+"&option.n_a_s=1";
        var successCallback = options.success;
        m3Ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(data),
            success: function(res) {
                console.log(res);
                res.data=res.children;
                if(res.children.length < 1){
                    successCallback({total:"0",data:[]});
                    return;
                }
                successCallback(res);
            },
            error: function(res) {
                console.log(res);
            }
        });
    }
    //渲染数据
    function renderSearchData(result,isRefresh){
        var html = "";
        var info = result;
        var i=0,len=info.length;
        for(;i<len;i++){
            var item = info[i];
            var foruserId = item.i;
            var postName = item.pN;
            if(wechatSystem){
                var imgHeadUrl = m3.curServerInfo.url + "/seeyon/rest/orgMember/avatar/" + foruserId + '?maxWidth=200';
            }else{
                var imgHeadUrl = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/orgMember/avatar/" + foruserId + '?maxWidth=200';
            }
            
            var postText = postName ?fI18nData["search.m3.h5.post"]+":"+ postName.escapeHTML() :"";
            html += '<li id="' + foruserId + '" data-i="' + foruserId + '" class="cmp-table-view-cell cmp-media list-top">'+
                '<div data-view-url="'+imgHeadUrl+'" class="cmp-pull-left headfileurl"></div> '+
                '<p class="message_list_title">' + item.n + '</p>'+
                '<p class="cmp-ellipsis">'+ postText +'</p> </li>';
        }
        if(isRefresh){
            $(".search-people").html(html);
        }else{
            $(".search-people").append(html);
        }
        
        //-------新方式加载头像
        var headfileurl = $(".search-people").find('.headfileurl');
        if(headfileurl.length > 0 ){
            var i=0,len=headfileurl.length;
            var iconList = [];
            for(i;i<len;i++){
                var itemId = "items-head"+i;
                headfileurl[i].id = itemId;
                iconList.push({
                    url: $(headfileurl[i]).attr("data-view-url"),
                    selector: '#' + itemId
                });
            }
            imgloader({
                config: iconList,
                defaultUrl: 'http://commons.m3.cmp/v/imgs/header.png',
                handleType: 'background'
            });
        }
        //删除跳转缓存
        if(cmp.storage.get("addressbook_search_key",true)){
            cmp.storage.delete("addressbook_search_key",true);
        }
    };
    function getGoPersonUrl(uid) {
        /*获取跳转人员信息地址*/
        var isSelf = uid == m3.userInfo.getCurrentMember().id;
        if (!arguments.length || !uid) return m3.href.map.my_personInfo;
        // var isSelf = false;
        return isSelf?m3.href.map.my_person_detail:m3.href.map.my_other_person_detail;
    }

}());