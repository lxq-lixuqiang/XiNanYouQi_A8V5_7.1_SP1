/**
 * Created by 伟 on 2016/8/9.
 */
var searchPerson = {};
(function() {
    var m3i18n, m3Ajax, nativeApi, isOutMember,isGroup,userData,businessScroll=null,changeOrgCompany,changeScopeCompany,
        //面包屑
        recordArr = [],getParam="",currentId="",isScope=false,materMark={},orgJurisdiction=false,
        //当前选中的companyId
        curCompanyId,isOrgSwitch = true,wechatSystem=false,mark= true, $ = $cmp;
    define(function(require, exports, module) {
        //加载模块
        require('m3');
        urlParams = require("tools").getParamByUrl(window.location.search);
        m3Error = require('error');
        m3i18n = require("m3i18n");
        m3Ajax = require("ajax");
        nativeApi = require('native');
        initPage();
    });
    //初始化变量
    function initPageBaseInfo() {
        m3Search = '';
        posX = undefined;
        isOutMember = undefined;
        isGroup = undefined;
        recordArr = [];
        parent = undefined;
        userData = m3.userInfo.getCurrentMember() || {};
        getParam = (urlParams.ParamHrefMark || (urlParams.isfromnative == "true") || (urlParams.fromApp == "xiaozhiSpeechInput"));
        currentId = userData.id;
        curCompanyId = cmp.storage.get('curCompanyId', true)||cmp.storage.get('curCompanyId') || m3.userInfo.getCurrentMember().accountId || cmp.storage.get("accountid");
        networkState="";
        
    }
    function partialRefreshPage() {
        initPageUI();
        cmp.listView('#indexListView').refresh();
    }
    //从其他模块进入通讯录
    function initSourceWithBack() {
        //从其他模块进入通讯录-顶部导航显示返回
        if (getParam) {
            $('body').removeClass('from-app');
            $('body').addClass('from-page');
        } else {
            //从底部导航进入通讯录
            $('body').removeClass('from-page');
            $('body').addClass('from-app');
        }
    }
    //删除所有缓存
    function deleteAllCache () {
        cmp.storage.delete('curCompanyId', true);
        cmp.storage.delete("isMycurCompanyId");
        cmp.storage.delete("isMyorgHistory");
        cmp.storage.delete("isMydepartmentId_custom");
        cmp.storage.delete("addressbook_wechatChangeScopeNavCache",true);
        cmp.storage.delete("addressbook_wechatChangeOrgCache",true);
    }
    /**
     * addressbook_wechatChangeOrgCache :记录是否激活行政组织页签，否则就是多维组织页签
     * addressbook_wechatChangeOrgCompanyCache  :记录切换的行政组织单位
     * addressbook_wechatChangeScopeCompanyCache ：记录切换的多维组织单位
     * addressbook_wechatChangeScopeNavCache :记录多维组织页签缓存
     */
    function initPage(){
        cmp.ready(function() {
			debugger;
            
            wechatSystem = cmp.platform.wechat || cmp.platform.wechatOrDD || !cmp.platform.CMPShell;//微信端或者钉钉端
            if(wechatSystem){
                var wechatChangeOrgCompanyCache = cmp.storage.get("addressbook_wechatChangeOrgCompanyCache",true);
                var wechatChangeScopeCompanyCache = cmp.storage.get("addressbook_wechatChangeScopeCompanyCache",true);
                if(wechatChangeOrgCompanyCache){  //缓存的行政组织单位
                    changeOrgCompany = JSON.parse(wechatChangeOrgCompanyCache);
                    setTimeout(function(){
                        refreshCompanyData(changeOrgCompany);
                    },1000);
                }
                if(wechatChangeScopeCompanyCache){  //缓存的多维组织单位
                    changeScopeCompany = JSON.parse(wechatChangeScopeCompanyCache);
                    setTimeout(function(){
                        refreshCompanyData(changeScopeCompany);
                    },1000);
                }

            }else{
                cmp.webViewListener.addEvent("isOrgRefresh",function(e){
                    refreshCompanyData(e);
                });
            }
            refreshCacheChange();
            initPageBaseInfo();
            nativeApi.getConfigInfo(function( ret ) {
                var data = JSON.parse(ret);
                var config = {};
                try {config = data;} catch (e) {}
                if(wechatSystem){  //微信端拿的是getConfigInfo接口
                    config = data.data.config;
                    var loginAccountId = data.data.loginAccount;
                    cmp.storage.save("accountid",loginAccountId);
                    m3.curServerInfo.companyId = loginAccountId;
                    if(!curCompanyId || curCompanyId=="-1" || curCompanyId.indexOf("a")>-1 ){
                       curCompanyId = loginAccountId; 
                    }
                    // var user = m3.userInfo.getCurrentMember();
                    // user.accountId = loginAccountId;
                    // m3.userInfo.setCurrentMember(user);
                }
                // internal:true是内部人员，false是编外人员
                isOutMember = !config.internal;//编外人员
                isGroup = !config.isGroup;//是否是集团
                if(config.hasBusinessorganization){  //有多维组织权限的话才显示按钮
                    $("#isScope").show();
                }else{
                    orgJurisdiction = true;//只有通讯录
                    $("#isOrg").text(fI18nData["search.m3.h5.searchPeople"]);//无多为组织改成通讯录文字
                    $("#isOrg").removeClass("cmp-active cmp-app-bgc1");
                }
                materMark={
                    materMarkAddressBookEnable:config.materMarkAddressBookEnable,//通讯录水印权限
                    materMarkDeptEnable:config.materMarkDeptEnable, //水印是否显示单位简称
                    materMarkEnable:config.materMarkEnable,//水印开关
                    materMarkNameEnable:config.materMarkNameEnable,//水印是否显示名字
                    materMarkTimeEnable:config.materMarkTimeEnable,//水印是否显示时间
                    materMarkZxEnable:config.materMarkZxEnable //致信水印权限
                }
                //监听多维组织业务线切换的时候
                cmp.listView('#indexListView');
                partialRefreshPage();
                initEvent();
                initData();
                if(!wechatSystem){
                    setTimeout(function () {
                        bindDidAppearEvent();
                    }, 2500);
                    offlineDownStateAndTip();//离线通讯录下载
                    if(materMark.materMarkAddressBookEnable=="true"){
                        watermark(userData.name || cmp.member.name, userData.accShortName ||userData.accName, getDate());
                    }
                }else{
                    var url = cmp.origin +'/rest/addressbook/currentUser';
                    m3Ajax({
                        url: url,
                        type: "GET",
                        success : function(person) {
                            var accShortName = person.waterMarkDeptName;//水印单位简称
                            var waterMarkName = person.waterMarkName;//水印人员名称
                            if(materMark.materMarkAddressBookEnable=="true"){
                                watermark( waterMarkName , accShortName , getDate());
                            }
                        },error : function(error) {
                        }
                    });
                }
                

                
                
            });
            
            cmp.event.orientationChange(function(res){
                if(cmp.os.android){
                    setTimeout(function(){
                        refreshListViewHeight();
                    },600);
                }else{
                    refreshListViewHeight();
                }
            });
            
        });
    }
    //刷新当前记录在哪个页签下
    function refreshCacheChange(){
        var wechatChangeOrgCache = cmp.storage.get("addressbook_wechatChangeOrgCache",true);
        if(wechatChangeOrgCache =="false"){ //多维组织激活状态
            if(!changeScopeCompany || !changeScopeCompany.business){
                setTimeout(function(){
                    $("#isScope").trigger("tap");
                },1000);
            }else{
                $("#isOrg").removeClass("cmp-active cmp-app-bgc1");
                $("#isScope").addClass("cmp-active cmp-app-bgc1");
                $("#isScopeContent").show();
                $("#isOrgContent").hide();
            }
        }
    }
    //刷新切换单位后的数据
    function refreshCompanyData(event){
        if(event.business){//多维组织
            //通过单位ID获取所有业务线
            mark = false;
            getBusinessAcount(event.isCompanyId,function(res){
                var company = {
                    id:event.isCompanyId,
                    name:event.isCompanyName
                }
                var arrow ='<span class="iconfont see-icon-change-company company-icon-right"></span>';
                if(isGroup || isOutMember){
                    arrow="";
                }
                //公司名称
                var companyHTML = '<li class="cmp-table-view-cell" data-company-id="'+company.id+'">'+
                '<div class="cmp-pull-left company_name flex-1">' + company.name + '</div> '+
                '<div class="cmp-pull-right">' + arrow + '</div> </li>';
                $(".search-company.isScope").html(companyHTML);
                initScopeData(company.id);
            });
        }else if(event.isRefreshCompanyId){
            cmp.storage.save("curCompanyId", event.isRefreshCompanyId, true);
            if(!wechatSystem){
                userData = m3.userInfo.getCurrentMember() || {}
                currentId = userData.id;
                curCompanyId = cmp.storage.get('curCompanyId', true)||cmp.storage.get('curCompanyId') || m3.userInfo.getCurrentMember().accountId || cmp.storage.get("accountid");
                
                partialRefreshPage();
            }
        }
    }
    //初始化页面
    function initPageUI() {
        searchPerson.company = {};
        searchPerson.depart = [];
        searchPerson.myDepart = {};
        searchPerson.model = m3.curServerInfo.model;
        searchPerson.address = m3.curServerInfo.ip;
        searchPerson.port = m3.curServerInfo.port;
        searchPerson.canChange = true;
        initSourceWithBack();
        if(!wechatSystem){
            $("#shortcutEntry").show();
        }
        getNetWork(function(){
            initDepartListView(true);
        }, function () {
            if(!wechatSystem)initDepartListView(false);
        });
    }
    function initData() {
        searchPerson.loadAccount = function() {
            var companyName = (searchPerson.company && searchPerson.company.name || '').escapeHTML();
            var companyId = (searchPerson.company && searchPerson.company.id) ? searchPerson.company.id :"";
            var companyHeaderSrc = cmp.origin +"/rest/orgMember/groupavatar?maxWidth=200&groupId="+ companyId +"&groupName="+companyName;
            var companyHTML = "";
            var arrow = (searchPerson.canChange ? '<span class="iconfont see-icon-change-company company-icon-right"></span>' : "");
            //是否为外遍人员
            if (isGroup || isOutMember) {
                arrow = '';
            }
            //公司名称
            companyHTML += '<li class="cmp-table-view-cell" data-company-id="'+companyId+'"><div class="cmp-pull-left company_name flex-1">' + companyName + '</div> <div class="cmp-pull-right">' + arrow + '</div> </li>';
            $(".search-company.isOrg").html(companyHTML);
            // if (isOrgSwitch) {
            //     $(".search-company.isOrg").html(companyHTML);
            // } else {
            //     $(".search-company.isScope").html(companyHTML);
            // }
        }
        searchPerson.loadData = function() {
        	debugger;
            cmp.dialog.loading(false);
            var nocontentNode = $("#isOrgContent .cmp-loading.cmp-loading-fixed.nocontent");
            if (nocontentNode&&nocontentNode.length) {
                nocontentNode.remove();
            }
            //渲染数据到页面
            var colorArray = ['#3eb0ff', '#FFD142', '#27E0B8', '#FF7FAA', '#837FFF', '#FF7F7F'];
            var html = "";
            var myDepartTitle;
            var departTitle, loadIconUrl = searchPerson && searchPerson.company && searchPerson.company.iconUrl ? searchPerson.company.iconUrl : '';
            if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(loadIconUrl)) {
                searchPerson.company && (searchPerson.company.iconUrl += "&showType=small");
            }
            //我的部门
            if (searchPerson.myDepart.name && (searchPerson.company.id == curCompanyId)) {
                cmp.storage.save("isMydepartmentId_custom",searchPerson.myDepart.id);
            }
            //其他部门
            for (var i = 0; i < searchPerson.depart.length; i++) {
                var iconHead = 'm3-department';
                var munber = '';
                var count = searchPerson.depart[i].count;
                if( searchPerson.depart[i].internal === '1' ){ //内单位
                    munber = count?count:"";
                }
                if ( searchPerson.depart[i].internal === '0' ) { //外单位
                    iconHead = 'm3-department m3-department-out';
                    munber = count?count:"";
                }
                
                departTitle = searchPerson.depart[i].name.charAt(0);
                html += '<li id="' + searchPerson.depart[i].id + '" data-count="'+count+'" data-i="' + searchPerson.depart[i].id + '" class="cmp-table-view-cell ' + iconHead + '"><div class="search-list-icon m3-header-department" style="background-color: ' + colorArray[(i + 1) % colorArray.length] + '">' + departTitle + '</div><div class="cmp-pull-left m3-department flex-1">' + (searchPerson.depart[i].name.escapeHTML()) + '</div><div class="cmp-pull-right"><span class="' + searchPerson.depart[i].id + '">' + munber + '</span><span class="iconfont see-icon-m3-arrow-right"></span></div> </li>';

            }
            $(".search-depart.isOrg").html(html);
            if (cmp.storage.get("searchPosition", true)) {
                $(".search-depart.isOrg")[0].scrollTop = cmp.storage.get("searchPosition", true);
                cmp.storage.delete("searchPosition", true);
            }
            if (searchPerson.depart.length == 0) {
                cmp.dialog.loading(false);
                var height = $('#isOrgContent').height() - 74;
                var dom = createNocontent(height);
                dom.style.top = '0px';
                dom.style.position = 'relative';
                $('#indexListView .search-depart').append(dom);

            }
            cmp.listView('#indexListView');
        };
    }
    //刷新高度
    function refreshListViewHeight(){
        // var windowH = window.innerHeight;
        // var header = document.querySelector("header.cmp-bar");
        // var cmpContent = document.querySelector('.cmp-control-content');
        // var headerH = header.offsetHeight;
        // cmpContent.style.height = windowH - headerH - 143 +"px";
        cmp.listView('#indexListView').refresh();
    }
    function getNetWork(callback, failCallback){
        nativeApi.getNetworkState(function( ret ) {
            var state = (ret.serverStatus === 'connect');
            if(state){
                callback && callback();
            }else {
                typeof failCallback == 'function' && failCallback();
                return false;
            }
        });
    };
    //初始化事件
    function initEvent() {
        //获取融云权限
        if(!wechatSystem){
            cmp.chat.exec("version",{//获取致信版本
                success: function(result){
                    //群聊
                    var disableClick = false;
                    $('#group').removeClass("display_none");
                    if(result.version == "3.0"){
                        $('#group').on("tap",function(){
                            if (!disableClick) {
                                disableClick = true;
                                setTimeout(function () {
                                    disableClick = false;
                                }, 1000);
                                var rongyun = "http://uc.v5.cmp/v/html/ucGroupListPage.html";
                                // var defualt = "http://uc.v5.cmp/v/html/ucGroupList.html";
                                m3.state.go(rongyun, null, m3.href.animated.left, true);
                            }
    
                        });
                    } else if(result.version == "2.0") {
                        $('#group').on("tap",function(){
                            if (!disableClick) {
                                disableClick = true;
                                setTimeout(function () {
                                    disableClick = false;
                                }, 1000);
                                // var rongyun = "http://uc.v5.cmp/v/html/ucGroupListPage.html";
                                var defualt = "http://uc.v5.cmp/v/html/ucGroupList.html";
                                m3.state.go(defualt, null, m3.href.animated.left, true);
                            }
                        });
                    }else{
                        $('#group').addClass("display_none");
                    }
                },
                error: function(err) {
                    $('#group').addClass("display_none");
                }
            });
        }
        
        //搜索框事件
        $('.m3-search').on('tap', function() {
            var isScopeMark = $("#isOrg").hasClass("cmp-active")?false:true;
            setTimeout(function() {
                if(isScopeMark && !orgJurisdiction ){
                    var activeLi = document.querySelector(".business-cell.active");
                    var businessId="";
                    if(activeLi){
                        var info = JSON.parse(activeLi.getAttribute("info"));
                        businessId = info.id;
                        if(wechatSystem){
                            var options = {
                                isCompanyId:$(".search-company.isScope").find("li.cmp-table-view-cell").attr("data-company-id"),
                                isCompanyName:$(".search-company.isScope").find("li.cmp-table-view-cell").find(".cmp-pull-left").text(),
                                recordArr:{
                                    departmentId:info.id ,
                                    departmentName:info.name
                                }
                            };
                            cmp.storage.save("addressbook_wechatChangeScopeNavCache",JSON.stringify(options),true);
                        }
                    }
                    if(businessId){
                        if(wechatSystem){
                            cmp.href.next(_addressbookPath+"/layout/addressbook-search.html",{scope:true,businessId:businessId});
                        }else{
                            nativeApi.showMemberSearch(true,businessId);//进入多维组织搜索
                        }
                    }else{
                        cmp.notification.toast(cmp.i18n("search.m3.h5.nobusiness"), "center");
                    }
                }else{
                    if(wechatSystem){
                        cmp.href.next(_addressbookPath+"/layout/addressbook-search.html",{scope:false});
                    }else{
                        nativeApi.showMemberSearch(false);//进入行政组织搜索
                    }
                }
            }, 350);
        });
        //跳转到切换企业
        $("ul.search-company").on("tap", "li", function() {
            if ( isGroup || isOutMember ) {
                return
            }
            var isScopeMark = $("#isOrg").hasClass("cmp-active")?false:true;
            if(isScopeMark && wechatSystem && !orgJurisdiction ){ //记录多为组织页签，
                var activeLi = document.querySelector(".business-cell.active");
                if(activeLi){
                    var info = JSON.parse(activeLi.getAttribute("info"));
                    var options = {
                        isCompanyId:$(".search-company.isScope").find("li.cmp-table-view-cell").attr("data-company-id"),
                        isCompanyName:$(".search-company.isScope").find("li.cmp-table-view-cell").find(".cmp-pull-left").text(),
                        recordArr:{
                            departmentId:info.id ,
                            departmentName:info.name
                        }
                    };
                    cmp.storage.save("addressbook_wechatChangeScopeNavCache",JSON.stringify(options),true);
                }
            }
            if (searchPerson.canChange) {
            	var status = ($("#isOrg").hasClass("cmp-active") || orgJurisdiction) ? false:true;
                var options = {companyid: $(this).attr('data-company-id'),isScope:status};
                if(wechatSystem){
                    cmp.href.next(_addressbookPath+"/layout/addressbook-changeCompany.html",options,{openWebViewCatch: 0});
                }else{
                    m3.state.go(m3.href.map.search_company,options , m3.href.animated.left, true);
                }
            }
        });

        //跳转下一级部门
        $("ul.search-depart").on("tap", "li", function() {
            var departmentId = $(this).attr("data-i");
            var _curCompanyId;
            var isScopeMark = $("#isOrg").hasClass("cmp-active")?false:true;

//			中国石油天然气股份有限公司西南油气田分公司  【在一级单位显示部门的同时也显示下面所有单位】  lixuqiang 2020年5月9日 start
            var departmentCount = $(this).attr("data-count");
            if(departmentCount==''|| departmentCount==undefined || departmentCount==null || departmentCount=='null'){
            	curCompanyId = departmentId;
            	getOnlineAccountInfoFn();
            	return;
            }
//			中国石油天然气股份有限公司西南油气田分公司  【在一级单位显示部门的同时也显示下面所有单位】  lixuqiang 2020年5月9日 end
            
            if(isScopeMark && !orgJurisdiction ){ //多维组织的下一级部门
                var activeLi = document.querySelector(".business-cell.active");
                var info = JSON.parse(activeLi.getAttribute("info"));
                recordArr = [{
                    departmentId:info.id ,
                    departmentName:info.name
                },{
                    departmentId: departmentId,
                    departmentName: $(this).find('.m3-department').text()
                }];
                var options = {
                    isCompanyId:$(".search-company.isScope").find("li.cmp-table-view-cell").attr("data-company-id"),
                    isCompanyName:$(".search-company.isScope").find("li.cmp-table-view-cell").find(".cmp-pull-left").text(),
                    recordArr:recordArr[0]
                };
                cmp.storage.save("addressbook_wechatChangeScopeNavCache",JSON.stringify(options),true);
            }else{  //行政组织的下一级
                recordArr = [{
                    departmentId: curCompanyId,
                    departmentName: $('.search-company.isOrg').find('.company_name').text()
                },{
                    departmentId: departmentId,
                    departmentName: $(this).find('.m3-department').text()
                }];
            }
            cmp.storage.save('orgHistory', JSON.stringify(recordArr));
            cmp.storage.save("departmentId", departmentId);
            cmp.storage.save("searchPosition", $(".search-depart.isOrg")[0].scrollTop, true);

            var goTime = new Date().getTime();
            var url = m3.href.map.search_nextDept+'&companyId='+_curCompanyId+'&departmentId='+departmentId+'&openpagetime='+goTime;
            if(wechatSystem){
                cmp.href.next(_addressbookPath+"/layout/addressbook-next.html",{isScope:isScopeMark && !orgJurisdiction });
            }else{
                m3.state.go(url, {isScope:isScopeMark && !orgJurisdiction }, m3.href.animated.left, true);
            }
        });

        //我的部门
        $('#myDepartment').on("tap",function(){
            SaveMyDepartments();
        });
        //关注人员
        $('#aspersonel').on("tap",function(){
            if(wechatSystem){
                cmp.href.next(_addressbookPath+"/layout/aspersonnel.html",materMark);
            }else{
                m3.state.go(m3.href.map.address_aspersonnel, materMark, m3.href.animated.left, true);
            }
        });

        //项目组
        $('#projectTeam').on("tap",function(){
            if(!wechatSystem)m3.state.go(m3.href.map.project_team, materMark, m3.href.animated.left, true);
        });

        //点击进入行政组织
        $("#isOrg").on("tap",function(){
            isScope = false;
            cmp.storage.save("addressbook_wechatChangeOrgCache","true",true);
            $("#isScope").removeClass("cmp-active cmp-app-bgc1");
            $(this).addClass("cmp-active cmp-app-bgc1");
            $("#isOrgContent").show();
            $("#isScopeContent").hide();
            if(!wechatSystem){
                $("#shortcutEntry").show();
            }
        });
        
        //点击进入多维组织列表
        $("#isScope").on("tap",function(){
            isScope = true;
            cmp.storage.save("addressbook_wechatChangeOrgCache","false",true);
            $("#isOrg").removeClass("cmp-active cmp-app-bgc1");
            $(this).addClass("cmp-active cmp-app-bgc1");
            $("#isScopeContent").show();
            $("#isOrgContent").hide();
            if(!wechatSystem){
                $("#shortcutEntry").hide();
            }
            if(mark){
                mark=false;
                cmp.listView('#scopeListView');
                var companyName = (m3.userInfo.getCurrentMember().accName || '').escapeHTML();
                var companyId = m3.userInfo.getCurrentMember().accountId || cmp.storage.get("accountid");
                if(changeScopeCompany){
                    companyName = changeScopeCompany.isCompanyName;
                    companyId = changeScopeCompany.isCompanyId;
                }
                var companyHTML = "";
                var arrow = '<span class="iconfont see-icon-change-company company-icon-right"></span>';
                if(isGroup || isOutMember){
                    arrow="";
                }
                //公司名称
                companyHTML += '<li class="cmp-table-view-cell" data-company-id="'+companyId+'"><div class="cmp-pull-left company_name flex-1">' + companyName + '</div> <div class="cmp-pull-right">' + arrow + '</div> </li>';
                
                $(".search-company.isScope").html(companyHTML);
                initScopeData(companyId);
                cmp.listView('#scopeListView').refresh();
            }
            refreshBusinessNav();
        });
        cmp.backbutton();
        if (!getParam) {
            cmp.backbutton.push(cmp.closeM3App);
        } else {
            // if(urlParams.fromApp && urlParams.fromApp == "xiaozhiSpeechInput"){
                
            // }
            //点击左上角按钮 跳转到我的页面
            $("header").find(".cmp-action-back").on("tap", function() {
                deleteAllCache();
                cmp.href.back();
            });
            cmp.backbutton.push(function () {
                deleteAllCache();
                cmp.href.back();
            });
        }
        document.addEventListener("backbutton",function(){
            cmp.storage.delete("curCompanyId",true);
            cmp.storage.delete("curCompanyId");
            cmp.href.back();
        },false);
    }

    //初始化多维组织数据
    function initScopeData (compantId){
        var comId = compantId?compantId:curCompanyId;
        //初始化通过单位获取所有信息--先获取业务线
        getBusinessAcount(comId,function(res){
            var businessDatas,nodata=false;
            if(res && res.length==0){
                nodata = true;
                $(".businessLine").hide();
                businessDatas = [{id:comId,name:m3.userInfo.getCurrentMember().accName}];
            }else{
                businessDatas = res;
                $(".businessLine").show();
                renderBusinessData(businessDatas);//加载业务线页签
                var height = window.innerHeight - document.querySelector(".cmp-segmented_title_content").offsetHeight-100;
                $(".scroll-content").css("height",height);
            }
            if(!nodata){ //如果有业务线数据-先用当前第一个业务线获取部门数据
                initScopeDepartData(businessDatas[0].id);
            }
            if(nodata){//如果无数据
                $(".search-depart.isScope").html("");
                var nocontent = $("#isScopeContent .search-person .cmp-nocontent.nocontent");
                if(nocontent.length==0){
                    var dialog_nocontent = createNocontent($(".scroll-content").height());
                    $("#isScopeContent .search-person").append(dialog_nocontent); 
                }else{
                    nocontent[0].style.height = $(".scroll-content").height()+60+"px";
                }
                $(".scroll-content").css("height",$(".scroll-content").height()+100);
                
            }
            cmp.listView('#scopeListView').refresh();
        });
    }
    //加载多维组织页签
    function renderBusinessData(data){
        if(data && data.length>0){
            var html = "";
            var i=0,len=data.length;
            for(;i<len;i++){
                var itemData = data[i];
                var itemDataString = JSON.stringify(itemData).escapeHTML();
                var active = i==0?"active":"";
                html +='<li class="'+active+' business-cell cmp-ellipsis" info="'+itemDataString+'">'+itemData.name+'</li>';  
                
            }
            $("#businessData").html(html);
            refreshBusinessNav(data);
            var wechatChangeCompanyCache = cmp.storage.get("addressbook_wechatChangeScopeNavCache",true);
            if(wechatChangeCompanyCache){
                var changeCompany = JSON.parse(wechatChangeCompanyCache);
                var recordArrCache = changeCompany.recordArr;
                if(recordArrCache){
                    var widthMove=0;
                    var isDepart = false;
                    for(var i=0,len=$("#businessData").find("li.business-cell").length;i<len;i++){
                        var itemCell = $($("#businessData").find("li.business-cell")[i]);
                        var attr = JSON.parse(itemCell.attr("info"));
                        widthMove+=(itemCell.width()+30)/2;
                        if(attr.id == recordArrCache.departmentId ){
                            isDepart = true;
                            //执行数据更新--业务线
                            var activeAll = document.querySelector(".business-cell.active");
                            if(activeAll){
                                activeAll.classList.remove("active");
                            }
                            itemCell.addClass("active");
                            businessScroll.scrollTo(-widthMove,0);
                            var lineId = attr.id;
                            setTimeout(function(){
                                initScopeDepartData(lineId,function(){
                                    fillBusinessNavClick();
                                });
                            },1000);
                            break;
                        }
                    }
                    if(!isDepart){
                        fillBusinessNavClick(); 
                    }
                }else{
                    fillBusinessNavClick(); 
                }
            }else{
                fillBusinessNavClick();
            }
        }
    }
    //多维组织页签点击事件遍历
    function fillBusinessNavClick(){
        var business_cell = document.querySelectorAll(".business-cell");
        for(var j=0,jlen=business_cell.length;j<jlen;j++){
            var cellItem = business_cell[j];
            //点击业务线页签
            cmp.event.click(cellItem,function(event){
                var target = event.target;
                if($(target).hasClass("active")){ return; }
                var activeAll = document.querySelector(".business-cell.active");
                if(activeAll){
                    activeAll.classList.remove("active");
                }
                $(target).addClass("active")
                //执行数据更新--业务线
                var lineId = JSON.parse($(target).attr("info")).id;
                var lineName = JSON.parse($(target).attr("info")).name;
                initScopeDepartData(lineId);
            });
        }
    }
    //刷新多维组织页签滚动
    function refreshBusinessNav(data){
        var width=0;
        var business_cell = document.querySelectorAll(".business-cell");
        for(var j=0,jlen=business_cell.length;j<jlen;j++){
            var cellItem = business_cell[j];
            width+=cellItem.offsetWidth||100;
        }
        var resultWidth;
        if(data && data.length==1){
            business_cell[0].style.maxWidth = "100%";
            resultWidth = document.body.offsetWidth;
        }else{
            resultWidth = width+50;
        }
        $("#businessScroll .scroller").width(resultWidth);
        if(businessScroll){
            businessScroll.refresh();
        }else{
            businessScroll = new cmp.iScroll("#businessScroll",{
                vScroll:false, hScroll:true,x: 0, y: 0
            });
        }
    }
    //获取所有多维组织业务线  id:当前单位ID
    function getBusinessAcount(id,callback){
        var scopeCurCompanyId = id ? id : curCompanyId;
        //获取所有业务线
        cmp.dialog.loading(true);
        var url = cmp.origin + '/rest/addressbook/business/'+scopeCurCompanyId+"?option.n_a_s=1";
        cmp.ajax({
            url: url,
            type: "GET",
            success: function(res) {
                console.log(res);
                cmp.dialog.loading(false);
                var backdrop = document.querySelector('.cmp-backdrop.cmp_bomb_box_backdrop');
                if(backdrop){
                    backdrop.remove();
                }
                callback && callback(res);
            },
            error:function(res){
                console.log(res);
                cmp.dialog.loading(false);
                var backdrop = document.querySelector('.cmp-backdrop.cmp_bomb_box_backdrop');
                if(backdrop){
                    backdrop.remove();
                }
            }
        });
    }
    //通过业务线ID，获取首页部门信息
    function initScopeDepartData(id,callback){
        cmp.dialog.loading(true);
        var businessId = id;
        var urlDepart = cmp.origin +'/rest/addressbook/firstBusinessDepts/'+businessId+"?pageNo=0&pageSize=1500";
        cmp.ajax({
            url: urlDepart,
            type: "GET",
            success: function(res) {
                console.log(res);
                cmp.dialog.loading(false);
                var backdrop = document.querySelector('.cmp-backdrop.cmp_bomb_box_backdrop');
                if(backdrop){
                    backdrop.remove();
                }
                //渲染部门
                var children = res.children;
                var nocontent = $("#isScopeContent .search-person .cmp-nocontent.nocontent");
                if(children && children.length>0){
                    var iconHead = "m3-department";
                    var departHTML = "";
                    for(var i=0,len=children.length;i<len;i++){
                        var itemData = children[i];
                        departHTML += '<li id="' + itemData.i + '" data-i="' + itemData.i + '" '+
                        'class="cmp-table-view-cell ' + iconHead + '">'+
                        '<div class="search-list-icon m3-header-department">' + itemData.n.charAt(0) + '</div>'+
                        '<div class="cmp-pull-left m3-department flex-1">' + itemData.n.escapeHTML() + '</div>'+
                        '<div class="cmp-pull-right">'+
                        '<span class="' + itemData.i + '">' + itemData.nm + '</span>'+
                        '<span class="iconfont see-icon-m3-arrow-right"></span>'+
                        '</div></li>';
                    }
                    $(".search-depart.isScope").html(departHTML);
                    if(nocontent && nocontent.length>0){
                        for(var i=0,len=nocontent.length;i<len;i++){
                            nocontent[i].remove();
                        }
                    }
                }else{
                    $(".search-depart.isScope").html("");
                    if(nocontent.length==0){
                        var dialog_nocontent = createNocontent($(".scroll-content").height());
                        $("#isScopeContent .search-person").append(dialog_nocontent);
                    }
                }
                callback && callback();
            },
            error:function(res){
                console.log(res);
                cmp.dialog.loading(false);
                var backdrop = document.querySelector('.cmp-backdrop.cmp_bomb_box_backdrop');
                if(backdrop){
                    backdrop.remove();
                }
            }
        });
    }
    //创建无内容提示框
    function createNocontent(height){
        var dialoContent = document.createElement("div");
        dialoContent.className = "cmp-nocontent cmp-loading-fixed nocontent";
        dialoContent.style.height = height+"px";
        // dialoContent.style.bottom = 0;
        dialoContent.style.top = "1px";
        dialoContent.style.display = "-webkit-box";
        var dialog = '<div class="cmp-loadStatus cmp-status-nocontent">'+
        '<div class="loading-logo"></div><div class="cmp-loading-text">'+m3i18n[cmp.language].noContent+'</div></div>';
        dialoContent.innerHTML = dialog;
        return dialoContent;
    }

    // 在线时缓存当前部门层级，用于跳转我的部门
    function SaveMyDepartments(){
        // var id = cmp.storage.get("isMydepartmentId_custom");
        var id = searchPerson.myDepart && searchPerson.myDepart.id ? searchPerson.myDepart.id : cmp.storage.get("isMydepartmentId_custom");
        cmp.storage.save('isMydepartmentId_custom', id);
        nativeApi.getNetworkState(function( ret ) {
            var state = (ret.serverStatus === 'connect');
            if(state){
                nativeApi.getDepartmentMemberSortType(function(res){
                    getMyDepartmentData(res);
                },function(res){
                    console.log(res);
                });
            }else{
                //离线获取部门层级
                nativeApi.getMemberInfo({
                    id: currentId,
                    accountId: cmp.storage.get('curCompanyId',true) || m3.userInfo.getCurrentMember().accountId
                }, function(res){
                    var parents = res.data.parentDepts;
//                    for(var i=0;i<parents.length;i++){
//                        if(parents[i].internal == "0"){ //外单位 拼接“编外”
//                            parents[i].departmentName = '('+fI18nData["search.m3.h5.departInternal"]+')'+parents[i].departmentName;
//                        }
//                    }
                    cmp.storage.save('curCompanyIdDepart', res.data.accountId,true);
                    cmp.storage.save('orgHistory', JSON.stringify(res.data.parentDepts));
                    m3.state.go(m3.href.map.search_nextDept, null, m3.href.animated.left, true);
                }, function(e) {
                    m3.state.go(m3.href.map.search_nextDept, null, m3.href.animated.left, true);
                    console.log(e);
                });
            }
        });
    }
    //获取跳转我的部门的数据
    function getMyDepartmentData(res){
        var id = searchPerson.myDepart && searchPerson.myDepart.id ? searchPerson.myDepart.id : cmp.storage.get("isMydepartmentId_custom");
        var resSort = res =="" ?"department":"member" ;
        var url = m3.curServerInfo.url + (wechatSystem?"/seeyon":"/mobile_portal/seeyon") + "/rest/contacts2/department/children/" + id + "/1/20/"+resSort+"";
        var cache = {
            isShowNoNetWorkPage: false
        };
        m3Ajax({
            url: url,
            type: "GET",
            setCache: cache,
            success: function(res) {
                if (res.code == 200 && res.data) {
                    var childrenAccountId = res.data.members.length ? res.data.members[0].accountId : m3.userInfo.getCurrentMember().accountId;
                    var childrenDepartments = res.data.parents;
                    cmp.storage.save('curCompanyIdDepart', childrenAccountId);
                    cmp.storage.save('orgHistory', JSON.stringify(childrenDepartments));
                    cmp.storage.save('m3_from_myDepartmentInfo', JSON.stringify({
                        data: res,
                        id: childrenAccountId
                    }));
                    if(wechatSystem){
                        cmp.href.next(_addressbookPath+"/layout/addressbook-next.html", null);
                    }else{
                        m3.state.go(m3.href.map.search_nextDept, null, m3.href.animated.left, true);
                    }
                }
            },
            error: function(res) {
                cmp.dialog.loading(false);
                //离线获取部门层级
                nativeApi.getMemberInfo({
                    id: currentId,
                    accountId: cmp.storage.get('curCompanyId',true) || m3.userInfo.getCurrentMember().accountId
                }, function(res){
                    cmp.storage.save('curCompanyIdDepart', res.data.accountId);
                    cmp.storage.save('orgHistory', JSON.stringify(res.data.parentDepts));
                    m3.state.go(m3.href.map.search_nextDept, null, m3.href.animated.left, true);
                }, function(e) {
                    m3.state.go(m3.href.map.search_nextDept, null, m3.href.animated.left, true);
                    console.log(e);
                });
            }
        });
    }


    //初始化列表数据，先判断网络状态
    function initDepartListView (obool) {
        cmp.listView('#indexListView').refresh();
        cmp.dialog.loading(false);
        cmp.dialog.loading({
            status: "global",
            calcHClass: 'scroll_up_zone',
        });
        if (!obool) {
            if(!wechatSystem)getOfflineAccountInfoFn();
        } else {
            getOnlineAccountInfoFn();
        }
    }
    /*通讯录新逻辑*/
    // 条件页面onshow 、didAppear 事件
    function bindDidAppearEvent() {
        document.addEventListener("com.seeyon.m3.phone.webBaseVC.didAppear",function (event) {
            shouldReloadPage();
        });
        //iOS的didAppear触发与安卓不一致，Android每次页面切换回触发，iOS仅仅一级页面切换触发
        if ( cmp.os.ios ) {
            document.addEventListener("resume",function(){
                shouldReloadPage()
            },false);
        }
        function shouldReloadPage() {
            var s = $('.search-person .search-depart.isOrg');
            if(s && s[0].offsetHeight) {
                var list = $('.search-person .search-depart.isOrg li');
                if (!list || !list.length) {
                    partialRefreshPage();
                }
            }
        }
    }
    //获取离线下载状态----
    function offlineDownStateAndTip() {
        var tipText = {
            loading:fI18nData["search.m3.h5.downloadingAddress"],
            success:fI18nData["search.m3.h5.downloadedAddress"],
            fail:fI18nData["search.m3.h5.downloadFailAddress"]
        };
        function getDownloadState () {
            nativeApi.getDownloadState(function (res) {
                console.log("离线通讯录下载状态："+res);
                if(res == 0) {
                    setTipsStatus('success')
                } else if (res == 1) {
                    setTipsStatus('loading')
                } else if (res == 3) {
                    setTipsStatus('fail')
                } else{
                    setTipsStatus('success')
                }
            }, function () {
                setTipsStatus('fail')
            });
        }
        /**
         * @function name setTipsStatus
         * @description
         * @author ybjuejue
         * @createDate 2018/11/15/015
         * @params status
         */
        getDownloadState();
        function setTipsStatus(status, errorClick) {
            if ($('.cmp-state-dialog-toast')) {
                $('.cmp-state-dialog-toast').remove();
            }
            if (status != 'success') {
                var stateDiv = document.createElement('div');
                stateDiv.className = "cmp-state-dialog-toast";
                var spanIcon = '<span class="state-icon iconfont see-icon-prompt-line"></span><div id="stateDiv" class="stateDiv">'+tipText[status]+'</div>';
                stateDiv.innerHTML = spanIcon;
                document.body.appendChild(stateDiv);
                if (status == 'fail') {
                    $('#stateDiv').on("tap",function(){
                        if (typeof errorClick == 'function') {
                            errorClick();
                        } else{
                            nativeApi.retryDownload(function(){
                                getDownloadState();
                            },function(res){
                                console.log(res);//重试失败
                            });
                        }
                    });
                }
            }
        };
    }
    /*这是网络错误显示区 h代办使用时本门区*/
    function severNotConnectPage(h) {
        cmp.dialog.loading(false);
        cmp.dialog.loading({
            // dom: '.cmp-control-content.cmp-active',
            status: "systembusy",
            calcHClass: 'scroll_up_zone',
            text: "<span style='color:#999;font-size: 14px;margin-top: 18px;'>" + m3i18n[cmp.language].systemBusy + "</span>",
            callback: function() {
                partialRefreshPage();
            }
        });
        if (h) {
            var systembusyZone = $(".cmp-loading.cmp-loading-fixed.systembusy");
            systembusyZone.height(Math.floor(systembusyZone.height() - 74) + 'px')
        }
    }
    //单位人员在线数据开始
    function getOnlineDepInfoFn() {
        console.log('单位人员在线数据开始');
        var url = m3.curServerInfo.url+(wechatSystem? "/seeyon":"/mobile_portal/seeyon")+"/rest/contacts2/get/departments/" + curCompanyId + "/0/1000";
        m3Ajax({
            url: url,
            type: "GET",
            // setCache: cache,
            success: function(res) {
                console.log(res);
                if (res.code == 200 && res.data) {
                    console.log('单位人员在线数据完成');
                    res.data.myDepartment = res.data.myDepartment || {};
                    res.data.departments = res.data.departments || [];
                    searchPerson.depart = res.data.departments;
                    res.data.myDepartment && (searchPerson.myDepart = (res.data.myDepartment||{}));
                    cmp.dialog.loading(false);
                    searchPerson.loadData();
                } else {
                    console.log('单位人员在线数据失败转离线');
                    getOfflineDepInfoFn();
                }
            },
            error: function(res) {
                console.log(res);
                console.log('单位人员在线数据失败转离线');
                getOfflineDepInfoFn();
            }
        });
    }
    //单位人员离线数据开始
    function getOfflineDepInfoFn() {
        console.log('单位人员离线数据开始');
        nativeApi.getDepartmentList(m3.userInfo.getCurrentMember().accountId, function(res) {
            console.log('单位人员离线数据完成');
            console.log(res);
            res.data.departments = res.data.departments || [];
            res.data.myDepartment = res.data.myDepartment || {};
            var parents = res.data.departments;
            if(parents && parents.length>0){
                for(var i=0;i<parents.length;i++){
                    if(parents[i].internal == "0"){ //外单位 拼接“编外”
                        parents[i].name = '('+fI18nData["search.m3.h5.departInternal"]+')'+parents[i].name;
                    }
                }
            }
            searchPerson.depart = res.data.departments;
            res.data.myDepartment && (searchPerson.myDepart = res.data.myDepartment);
            searchPerson.loadData();
        }, function(e) {
            console.log('离线获取部门列表失败');
            severNotConnectPage(true)
        })
    }
    //公司，单位在线模式开始
    function getOnlineAccountInfoFn() {
        console.log('公司，单位在线模式开始');
        var url = m3.curServerInfo.url+(wechatSystem? "/seeyon":"/mobile_portal/seeyon")+"/rest/contacts2/get/account/" + curCompanyId;
        m3Ajax({
            url: url,
            type: "GET",
            // setCache: cache,
            success: function(res) {
                if (res.code == 200 && res.data) {
                    if(res.data.account.id=="-1"){
                        curCompanyId = cmp.storage.get('curCompanyId', true)|| m3.userInfo.getCurrentMember().accountId || cmp.storage.get('curCompanyId') || cmp.storage.get("accountid");
                        getOnlineAccountInfoFn();
                        return;
                    }
                    console.log('公司，单位在线模式完成');
                    //奇葩的逻辑，后台不给权限异常，只给你返回来一堆空，呵呵哒
                    if (!res.data.account.id || typeof res.data.account.id === 'undefined') {
                        cmp.notification.alert(fI18nData["search.m3.h5.authority"], function() {
                            cmp.href.back();
                        }, "", "<span>" + m3i18n['zh-CN']['ok'] + "</span>"); //"我知道了"
                        return;
                    }
                    if(wechatSystem){
                        var user = m3.userInfo.getCurrentMember();
                        if(!user.accName){
                            user.accName = res.data.account.name;
                            cmp.storage.save("userId_" + cmp.member.name + "server_" + m3.curServerInfo.url + 'companyId_' + m3.curServerInfo.companyId, JSON.stringify(user),true);
                        }
                    }
                    

                    searchPerson.company = res.data.account || {};
                    searchPerson.canChange = res.data.account.hasChildren;
                    searchPerson.loadAccount();
                    getOnlineDepInfoFn();
                } else {
                    console.log('公司，单位在线模式失败转离线');
                    getOfflineAccountInfoFn();
                }
            },
            error: function(res) {
                console.log('公司，单位在线模式失败转离线');
                cmp.dialog.loading(false);
                getOfflineAccountInfoFn();
            }
        });
    }
    //公司，本单位，离线模式
    function getOfflineAccountInfoFn() {
        if(wechatSystem){
            severNotConnectPage();
        }else{
            nativeApi.getAccountInfo(m3.userInfo.getCurrentMember().accountId, function(res) {
                console.log('公司，本单位，离线模式');
                console.log(res);
                searchPerson.company = res.data.account || {};
                console.log(searchPerson.company);
                searchPerson.canChange = true;
                searchPerson.loadAccount();
                getOfflineDepInfoFn();
                // getAccount(true, 'showArrow');
            }, function(e) {
                console.log('公司，本单位，离线获取失败');
                severNotConnectPage();
            });
        }

    }
    /*通讯录新逻辑---end*/


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