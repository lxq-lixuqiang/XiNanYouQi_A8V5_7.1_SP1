/**
 * Created by 伟 on 2016/8/9.
 */
var childDepart = {};

(function() {
    var m3Error, m3i18n, m3Ajax, m3Search, nativeApi, tools, m3Scroll,getParam,imgloader,materMark={},
        recordArr = [],
        imgCanLoaded = true,
        m3ScrollObj,
        pageNum = 1,
        randomId,
        orientationTotal,
        penetratedMark = false,
        talkmark = false,
        searchPerson = {},
        $ = $cmp,
        networkState = "",wechatSystem=false,firstShow="",userInfo;
    define(function(require, exports, module) {
        //加载模块
        require('m3');
        require('commons');
        m3Error = require('error');
        m3i18n = require("m3i18n");
        m3Ajax = require("ajax");
        tools = require("tools");
        nativeApi = require("native");
        m3Scroll = require('scroll');
        imgloader = require('commons/js/cmp-img-loader.js');
        initPage();
    });
    function getGoPersonUrl(uid) {
        /*获取跳转人员信息地址*/
        var isSelf = uid == m3.userInfo.getCurrentMember().id;
        if (!arguments.length || !uid) return m3.href.map.my_personInfo;
        // var isSelf = false;
        return isSelf?m3.href.map.my_person_detail:m3.href.map.my_other_person_detail;
    }
    function initPage(){
        cmp.ready(function() {
            getParam = cmp.href.getParam();
            userInfo = m3.userInfo.getCurrentMember();
            wechatSystem = cmp.platform.wechat || cmp.platform.wechatOrDD;//微信端或者钉钉端
            try {
                recordArr = JSON.parse(cmp.storage.get('orgHistory')) || [];
            } catch (e) {}
            if(!wechatSystem){
                cmp.chat.exec("version",{//获取致信版本
                    success: function(result){
                        if(result.version == "3.0"){
                            talkmark = true;
                        }else{
                            talkmark = false;
                        }
                    },
                    error: function(err) {
                        talkmark = false;
                    }
                });
                $("header").removeClass("cmp-header-backHandle");
            }
            //获取发协同权限
            // nativeApi.getAuthorityByKey("newcoll",function(res){    //有权限
            //     if(res == "true"){
            //         penetratedMark = true;
            //     }
            // });
            initPageUI();
            initEvent();
            if(getParam.isScope){
                document.title = fI18nData["search.m3.h5.isScope"];
                $('.org-title').text(fI18nData["search.m3.h5.isScope"]);
            }else{
                document.title = fI18nData["search.m3.h5.isOrg"];
            }
            cmp.event.orientationChange(function(res){
                if(cmp.os.android){
                    setTimeout(function(){
                        setScrollZoneDomHeight();
                        initScroll(orientationTotal);
                    },600);
                }else{
                    setScrollZoneDomHeight();
                    initScroll(orientationTotal);
                }
                
            });
            nativeApi.getConfigInfo(function( ret ) {
                var data = JSON.parse(ret);
                var config = {};
                try {config = data;} catch (e) {}
                
                // console.log('返回外编人员状态为:' + config.internal);
                if(wechatSystem){  //微信端拿的是getConfigInfo接口
                    config = data.data.config;
                    firstShow = data.data.addressBookSet.firstShow;
                }
                cmp.dialog.loading(true);
                if(wechatSystem){
                    initData();
                }else{
                    nativeApi.getNetworkState(function( ret ) {
                        var state = (ret.serverStatus === 'connect');
                        networkState = state;
                        initData();
                    });
                }
                materMark={
                    materMarkAddressBookEnable:config.materMarkAddressBookEnable,//通讯录水印权限
                    materMarkDeptEnable:config.materMarkDeptEnable, //水印是否显示单位简称
                    materMarkEnable:config.materMarkEnable,//水印开关
                    materMarkNameEnable:config.materMarkNameEnable,//水印是否显示名字
                    materMarkTimeEnable:config.materMarkTimeEnable,//水印是否显示时间
                    materMarkZxEnable:config.materMarkZxEnable //致信水印权限
                }
                if(materMark.materMarkAddressBookEnable=="true"){
                    if(wechatSystem){
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
                    }else{
                        watermark(userInfo.name || cmp.member.name, userInfo.accShortName||userInfo.accName, getDate());
                    }
                    
                }
            });
        });
    };

    function popRecord(key, value) {
        var data = recordArr,
            arr = [];
        for (var i = 0;i < data.length;i++) {
            arr.push(data[i]);
            if (data[i][key] === value) {
                if (data[i - 1]) {
                    childDepart.departmentsId = data[i - 1].departmentId
                }
                break;
            }
        }
        return arr;
    }
    
    //初始化事件
    function initEvent() {
        
        cmp.backbutton();
        cmp.backbutton.push(backFun);
        //搜索框事件
        $('.m3-search').on('tap', function() {
            setTimeout(function() {
                if(getParam && getParam.isScope){
                    if(recordArr.length>0){
                        var businessId = recordArr[0].departmentId;
                        if(businessId){
                            if(wechatSystem){
                                cmp.href.next(_addressbookPath+"/layout/addressbook-search.html",{scope:true,businessId:businessId});
                            }else{
                                nativeApi.showMemberSearch(true,businessId);//进入多维组织搜索
                            }
                        }else{
                            if(wechatSystem){
                                cmp.href.next(_addressbookPath+"/layout/addressbook-search.html",{scope:false});
                            }else{
                                nativeApi.showMemberSearch(false);//进入行政组织搜索
                            }
                        }
                    }else{
                        if(wechatSystem){
                            cmp.href.next(_addressbookPath+"/layout/addressbook-search.html",{scope:false});
                        }else{
                            nativeApi.showMemberSearch(false);//进入行政组织搜索
                        } 
                    }
                }else{
                    if(wechatSystem){
                        cmp.href.next(_addressbookPath+"/layout/addressbook-search.html",{scope:false});
                    }else{
                        nativeApi.showMemberSearch(false);//进入行政组织搜索
                    }
                }
                //hideSliderItem();//收回侧滑出来的项
            }, 350)
        });
        
        //点击左上角返回
        $("header").find(".cmp-action-back").on("tap", function() {
            backFun();
        });
        //点击关闭按钮
        $('.cmp-close').on('tap', function() {
            cmp.storage.delete('curCompanyId', true);
            cmp.storage.delete('curCompanyIdDepart',true);
            if(wechatSystem){
                cmp.href.back(1);
            }else{
                cmp.href.close();
            }
        });

        //安卓自带返回键
        //  document.addEventListener("backbutton", function() {
        //      $("header").find(".cmp-action-back").trigger('tap');
        //  });


        //面包屑点击事件
        childDepart.crumbs.on("tap", "span.common", function() {
            childDepart.isChange = true;
            childDepart.num = 0;
            var departmentsId = $(this).attr("data-i");
            recordArr = popRecord('departmentId', departmentsId);
            cmp.storage.save('orgHistory', JSON.stringify(recordArr));
            cmp.storage.save("departmentId", departmentsId);
            if (recordArr.length === 1) {
                if(getParam && getParam.isMycard){
                    initCompanyData();
                }else{
                    cmp.href.back();
                }
            }else if(recordArr.length === 0){
                cmp.href.back();
            }else{
                childDepart.getData(1);
            }
        });

        //点击进入列表下级部门
        $(".search-depart").on("tap", "li", function() {
            childDepart.isChange = true;
            childDepart.num = 0;
            childDepart.departmentsId = $(this).attr("data-i");
            recordArr.push({
                departmentId: childDepart.departmentsId,
                departmentName: $(this).find('.cmp-pull-left').text()
            });
            cmp.storage.save('orgHistory', JSON.stringify(recordArr));
            cmp.storage.save("departmentId", childDepart.departmentsId);
            cmp.dialog.loading();
            cmp.sdk.setGestureBackState(false);//关闭手势返回
            childDepart.getData(1);
        });

        //点击人员进入人员信息
        $(".search-people").on("tap", "li", function(e) {
            e.preventDefault();
            e.stopPropagation();
            //hideSliderItem();//收回侧滑出来的项
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
                    animated: true, 
                    openWebViewCatch: true,
                    pushInDetailPad: true,
                    nativeBanner: false
                });
                // m3.state.go(url, {name: name, singleOpen:true,isOrganization:true}, m3.href.animated.right, true );
            }
        });

    }
    //返回逻辑
    function backFun(){
        recordArr = tools.arrRmove(recordArr, '', recordArr.length - 1);
        if (recordArr.length === 1) {
            if(getParam && getParam.isMycard){
                initCompanyData();
            }else{
                cmp.href.back();
            }
        }else if(recordArr.length === 0){
            cmp.href.back();
        }else{
            if(recordArr.length == 2){
                cmp.sdk.setGestureBackState(true);//开启手势返回
            }else{
                cmp.sdk.setGestureBackState(false);//关闭手势返回
            }
            childDepart.getData(1);
        }
    }
     // 初始化页面scroll层 区域dom的显示区
    function setScrollZoneDomHeight() {
        var scrollWarpHeight = $(window).height() - $("header").height() - parseFloat($(".cmp-table-view.search-company").css("height")) - 44;
        var personDepartWarpHeight = scrollWarpHeight - $('.scroll .m3-refresh-bar').height() - $('.scroll .m3-more-bar').height();
        $(".scroll").height(scrollWarpHeight);
        $(".search-people-depart-warp").css('minHeight', (personDepartWarpHeight || 0) + 'px');

    }
    //页面初始化，及定义公共变量
    function initPageUI() {

        //动态给滚动容器赋值高度
        setScrollZoneDomHeight();
        childDepart.parent = []; //面包屑数据
        childDepart.members = []; //人员数据
        childDepart.depart = []; //子部门数据
        childDepart.crumbs = $(".search-company li");
        childDepart.nav = $(".search-company .cmp-table-view-cell");
        childDepart.num = 0;
    }
    
    function initScroll(total) {
        var totalPage = Math.ceil(total / 20) || 1;
        console.log('totalPage');
        console.log(totalPage);
        if (!m3ScrollObj) {
            m3ScrollObj = m3Scroll({
                el: '.scroll',
                scrollbars: false,
                totalPage: totalPage,
                nextCb: function(num) {
                    childDepart.getData(num);
                }
            })
        } else {
            setTimeout(function() {
                console.log(pageNum);
                m3ScrollObj.refresh(totalPage, pageNum);
            }, 10);
        }
    }
    function onlineAjax( page, type, callback ) {
        if(wechatSystem){
            var sort="";
            if(firstShow == "member"){
                sort = "member";
                $(".search-people").insertBefore($(".search-depart"));  //人员在前，部门在后
            }else{
                sort = "department";
                $(".search-depart").insertBefore($(".search-people")); //部门在前，人员在后
            }
            getAjaxData(page, type, callback,sort);
        }else{
            nativeApi.getDepartmentMemberSortType(function(res){
                console.log(res);
                if(res == "member"){
                    $(".search-people").insertBefore($(".search-depart"));  //人员在前，部门在后
                }else{
                    res = "department";
                    $(".search-depart").insertBefore($(".search-people")); //部门在前，人员在后
                }
                getAjaxData(page, type, callback,res);
            },function(res){
                console.log(res)
                getAjaxData(page, type, callback,"member");
            });
        }
        
    }

    function getAjaxData(page, type, callback,res){
        var cache = {};
        pageNum = page || pageNum;
        randomId = Math.floor(Math.random() * 1000000000);
        childDepart.num++;
        var fromParentData = getFromPageMyDepartmentInfo();
        if (fromParentData && pageNum == 1) {
            getSuccessCallBack(fromParentData, callback, type)
            return;
        }
        if ( type === 'getNumber' ) {
            cache = {
                isShowNoNetWorkPage: false
            };
        }
        var url = m3.curServerInfo.url +(wechatSystem?"/seeyon":"/mobile_portal/seeyon")+ "/rest/contacts2/department/children/" + recordArr[recordArr.length - 1].departmentId + "/" + pageNum + "/20/"+res+"";
        
        m3Ajax({
            url: url,
            type: "GET",
            setCache: cache,
            success: function(res) {
                if (res.code == 200 && res.data) {
                    getSuccessCallBack(res, callback, type)
                }
            },
            error: function(res) {
                cmp.dialog.loading(false);
                networkState = false;
                //获取排序信息
                nativeApi.getDepartmentMemberSortType(function(res){
                    if(res == "member"){
                        $(".search-people").insertBefore($(".search-depart"));  //人员在前，部门在后
                    }else{
                        $(".search-depart").insertBefore($(".search-people")); //部门在前，人员在后
                    }
                    var page = 1;
                    nativeApi.getMemberList({
                        departmentId: recordArr[recordArr.length - 1].departmentId,
                        accountId: recordArr[0].departmentId,
                        pageNum: pageNum,
                        sortType:res
                    }, function(res) {
                        console.log(res);
                        childDepart.parent = recordArr;
                        childDepart.members = res.data.members;
                        var parents = res.data.childrenDepartments;
                        for(var i=0;i<parents.length;i++){
                            if(parents[i].internal == "0"){ //外单位 拼接“编外”
                                parents[i].name = '('+fI18nData["search.m3.h5.departInternal"]+')'+parents[i].name;
                            }
                        }
                        childDepart.depart = res.data.childrenDepartments;
                        childDepart.loadData(randomId, pageNum);
                        orientationTotal = res.total;
                        initScroll(res.total);
                        // onlineAjax(page, 'getNumber', function(ret) {
                        //     ret = ret || [];
                        //     if ( ret.length != 0 ) {
                        //         cmp.dialog.loading(false);
                        //     }
                        //     for ( var i = 0;i < ret.length;i++ ) {
                        //         $('.' + ret[i].id).text(ret[i].count || 0);
                        //     }
                        // });
                    }, function(e) {
                        console.log(e);
                        onlineAjax(page);
                    });
                },function(res){
                    onlineAjax(page);
                    console.log(res);
                });
            }
        });
        function getSuccessCallBack(res, callback, type) {
            if ( type === 'getNumber' ) {
                callback(res.data.childrenDepartments);
                return
            }
            childDepart.parent = recordArr;
            childDepart.members = res.data.members;
            childDepart.depart = res.data.childrenDepartments;
            var parents = res.data.childrenDepartments;
//            for(var i=0;i<parents.length;i++){
//                if(parents[i].internal == "0"){ //外单位 拼接“编外”
//                    parents[i].name = '('+fI18nData["search.m3.h5.departInternal"]+')'+parents[i].name;
//                }
//            }
            childDepart.loadData(randomId, pageNum);
            orientationTotal = res.data.total;
            initScroll(res.data.total);
        }
        function getFromPageMyDepartmentInfo() {
            var curCompanyId = cmp.storage.get('curCompanyIdDepart',true) || cmp.storage.get('curCompanyId', true)||cmp.storage.get('curCompanyId') || m3.userInfo.getCurrentMember().accountId || cmp.storage.get("accountid");
            var myCompanyInfo = cmp.storage.get('m3_from_myDepartmentInfo');
            myCompanyInfo = myCompanyInfo ? JSON.parse(myCompanyInfo): {};
            cmp.storage.delete('m3_from_myDepartmentInfo');
            if (myCompanyInfo && myCompanyInfo.data && (myCompanyInfo.id == curCompanyId)) {
               return myCompanyInfo.data
            } else {
                return false;
            }
        }
    }

    //获取数据，渲染数据
    function initData() {
        //如果是微信端或者//如果是多维组织进来的话，直接走在线，不走离线
        if( wechatSystem || (getParam && getParam.isScope) ){  //执行在线
            childDepart.getData = function(page) {
                onlineAjax(page);
            }
        }else{  //CMP壳
            if(networkState){  //在线的情况始终走在线数据
                childDepart.getData = function(page) {
                    onlineAjax(page);
                } 
            }else{  //离线的情况始终走离线
                childDepart.getData = function(page) {
                    console.log('pageNum');
                    console.log(pageNum);
                    pageNum = page || pageNum;
                    if(!recordArr){
                        cmp.dialog.loading(false);
                        cmp.dialog.loading({
                            status: "nocontent",
                            text: m3i18n[cmp.language].noContent
                        });
                        return;
                    };
                    //获取排序信息
                    nativeApi.getDepartmentMemberSortType(function(res){
                        if(res == "member"){
                            $(".search-people").insertBefore($(".search-depart"));  //人员在前，部门在后
                        }else{
                            $(".search-depart").insertBefore($(".search-people")); //部门在前，人员在后
                        }
                        nativeApi.getMemberList({
                            departmentId: recordArr[recordArr.length - 1].departmentId,
                            accountId: recordArr[0].departmentId,
                            pageNum: pageNum,
                            sortType:res
                        }, function(res) {
                            console.log(res);
                            childDepart.parent = recordArr;
                            childDepart.members = res.data.members;
                            var parents = res.data.childrenDepartments;
                            for(var i=0;i<parents.length;i++){
                                if(parents[i].internal == "0"){ //外单位 拼接“编外”
                                    parents[i].name = '('+fI18nData["search.m3.h5.departInternal"]+')'+parents[i].name;
                                }
                            }
                            childDepart.depart = res.data.childrenDepartments;
                            childDepart.loadData(randomId, pageNum);
                            orientationTotal = res.total;
                            initScroll(res.total);
                            onlineAjax(page, 'getNumber', function(ret) {
                                ret = ret || [];
                                if ( ret.length != 0 ) {
                                    cmp.dialog.loading(false);
                                }
                                for ( var i = 0;i < ret.length;i++ ) {
                                    $('.' + ret[i].id).text(ret[i].count || 0);
                                }
                            });
                        }, function(e) {
                            console.log(e);
                            onlineAjax(page);
                        });
                    },function(res){
                        onlineAjax(page);
                        console.log(res);
                    });
                    
                }
            }
        };
        childDepart.getData();
        //子部门渲染数据
        childDepart.loadData = function(randomId, pageNum) {
            var parentHTML = "";
            var depart = "";
            var members = "";
            var colorArray = ['#3eb0ff', '#FFD142', '#27E0B8', '#FF7FAA', '#837FFF', '#FF7F7F'];

            var departTitle;
            console.log(childDepart.depart);

            //获取部门面包屑
            for (var i = 0; i < childDepart.parent.length; i++) {
                parentHTML += "<span class='common cmp-link1-fc' data-i='" + childDepart.parent[i].departmentId + "'>" + childDepart.parent[i].departmentName.escapeHTML() + "</span> <span class='iconfont see-icon-m3-arrow-right'></span> "
            }
            childDepart.nav.html(parentHTML);
            childDepart.nav.children().last().remove();
            var width = 0;
            for (var i = 0; i < childDepart.nav.children().length; i++) {
                width += $(childDepart.nav.children()[i]).width();
            }
            setTimeout(function() {
                $(".search-company .cmp-table-view-cell")[0].scrollLeft = width - childDepart.nav.width() + 50;
            }, 300);
            //获取子部门
            for (var j = 0; j < childDepart.depart.length; j++) {
                var iconDep = 'm3-header-department';
                var departName = childDepart.depart[j].name;
                if ( childDepart.depart[j].internal === '0' ) {
                    iconDep = 'm3-header-department m3-department-out';
                    if(childDepart.depart[j].name.charAt(0) == "("){  //接口返回的编外数据，截取掉“编外”，换成国际化文字
                        var splitName = departName.split(")")[1];
                        departName = "("+fI18nData["search.m3.h5.departInternal"]+")"+splitName;
                    }
                }
                departTitle = childDepart.depart[j].name.charAt(0);  //style="background-color: ' + colorArray[(j + 1) % colorArray.length] + '"
                depart += '<li data-i="' + childDepart.depart[j].id + '" class="cmp-table-view-cell m3-department">'+
                '<div class="search-list-icon ' + iconDep + '" ></div>'+
                '<div class="cmp-pull-left">' +  departName.escapeHTML()  + '</div> '+
                '<div class="cmp-pull-right">'+
                '<span class="num ' + childDepart.depart[j].id + '">' + (childDepart.depart[j].count || '') + '</span>'+
                '<span class="iconfont see-icon-m3-arrow-right"></span></div> </li>';
            }
            
            if (pageNum > 1) {
                $(".search-depart").removeClass("display_none");
                $(".search-depart").append(depart);
            } else {
                if(depart == ""){
                    $(".search-depart").addClass("display_none");
                }else{
                    $(".search-depart").removeClass("display_none");
                }
                $(".search-depart").html(depart);
            }
            //获取部门人员
            var _departMembers = childDepart.members;
            var _departMemberLen = _departMembers.length;
            for (var k = 0; k < _departMemberLen; k++) {
                var foruserId = _departMembers[k].id;
                var foruserofficeNumber =  _departMembers[k].officeNumber;
                var forName = _departMembers[k].name;
                if(wechatSystem){
                    var imgHeadUrl = m3.curServerInfo.url + "/seeyon/rest/orgMember/avatar/" + foruserId + '?maxWidth=200';
                }else{
                    var imgHeadUrl = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/orgMember/avatar/" + foruserId + '?maxWidth=200';
                }
                
                /*临时关闭左滑功能*/
                var postText = _departMembers[k].postName ?fI18nData["search.m3.h5.post"]+":"+_departMembers[k].postName.escapeHTML() :"";
                members += '<li id="' + foruserId + '" data-i="' + foruserId + '" class="cmp-table-view-cell cmp-media list-top">'+
                    '<div data-view-url="'+imgHeadUrl+'" class="cmp-pull-left headfileurl"></div> '+
                    '<p class="message_list_title">' + forName + '</p>'+
                    '<p class="cmp-ellipsis">'+postText+'</p> </li>';
                /*原来的左滑功能*/

               /* if(foruserId == m3.userInfo.getCurrentMember().id){  //自己的数据，不能进行右滑操作
                    // members += '<li data-i="' + foruserId + '" class="cmp-table-view-cell cmp-media list-top"><div class="cmp-pull-left" style="background-image: url(\'' + (m3.curServerInfo.url + "/mobile_portal" + childDepart.members[k].iconUrl) + '\');background-size: cover;background-position: 50% 50%"></div> <p class="message_list_title">' + (childDepart.members[k].name.length > 10 ? (childDepart.members[k].name.slice(0, 10) + "...") : childDepart.members[k].name) + '</p> <p class="cmp-ellipsis">' + childDepart.members[k].postName + '</p> </li>';
                    members += '<li id="' + foruserId + '" data-i="' + foruserId + '" class="cmp-table-view-cell cmp-media list-top">'+
                    '<div class="cmp-pull-left" style="background-image:url(http://commons.m3.cmp/v/imgs/header.png);background-size: cover;background-position: 50% 50%"></div> '+
                    '<p class="message_list_title">' + forName + '</p>'+
                     '<p class="cmp-ellipsis">' + (_departMembers[k].postName || '').escapeHTML() + '</p> </li>';
                }else{
                    members +='<li id="' + foruserId + '" data-i="' + foruserId + '" class="cmp-table-view-cell cmp-media list-top">'+
                    '<div class="cmp-slider-right cmp-disabled">';
                    // 发协同
                    if(penetratedMark){
                        members += '<a class="cmp-btn operation-item in-collaboration" data={"id":"'+ foruserId +'"}>'+
                        '<div class="cmp-icon-plusnum cmp-icon-plusnum-collaboration"  >'+
                            '<span class="icon m3-icon m3-icon-newCoordination"></span>'+
                        '</div>'+
                        '</a>';
                    }
                    //打电话  ----在线模式等王飞飞那边提供了参数“officeNumber”后，再取消注释
                    // if(foruserofficeNumber && foruserofficeNumber.indexOf("*") != -1 ){
                    //     members +='<a class="cmp-btn operation-item in-phone" data={"officeNumber":"'+ foruserofficeNumber +'"}>'+
                    //     '<div class="cmp-icon-plusnum cmp-icon-plusnum-collaboration"  >'+
                    //         '<span class="icon m3-icon see-icon-m3-phone-fill"></span>'+
                    //     '</div>'+
                    //     '</a>';
                    // }
                    //发信息
                    if(talkmark){
                        members +='<a class="cmp-btn operation-item in-message" data={"id":"'+ foruserId +'","name":"'+ forName +'"}>'+
                        '<div class="cmp-icon-plusnum cmp-icon-plusnum-collaboration"  >'+
                            '<span class="icon m3-icon iconfont see-icon-m3-zhixin-fill"></span>'+
                        '</div>'+
                        '</a>';
                    }
                    members += '</div>'+
                    '<div class="cmp-slider-handle">'+
                        '<div class="cmp-pull-left" style="background-image:url(http://commons.m3.cmp/v/imgs/header.png);background-size: cover;background-position: 50% 50%"></div> '+
                        '<p class="message_list_title">' + forName + '</p>'+
                        '<p class="cmp-ellipsis">' + (childDepart.members[k].postName || '').escapeHTML() + '</p>'+
                    '</div></li>';
                }*/
                // members += '<li data-i="' + childDepart.members[k].id + '" class="cmp-table-view-cell cmp-media list-top"><div class="cmp-pull-left" style="background-image: url(\'' + (m3.curServerInfo.url + "/mobile_portal" + childDepart.members[k].iconUrl) + '\');background-size: cover;background-position: 50% 50%"></div> <p class="message_list_title">' + (childDepart.members[k].name.length > 10 ? (childDepart.members[k].name.slice(0, 10) + "...") : childDepart.members[k].name) + '</p> <p class="cmp-ellipsis">' + childDepart.members[k].postName + '</p> </li>';
                // members += '<li id="' + childDepart.members[k].id + '" data-i="' + childDepart.members[k].id + '" class="cmp-table-view-cell cmp-media list-top">'+
                // '<div class="cmp-pull-left" style="background-image:url(http://commons.m3.cmp/v/imgs/header.png);background-size: cover;background-position: 50% 50%"></div> '+
                // '<p class="message_list_title">' + (childDepart.members[k].name) + '</p>'+
                //  '<p class="cmp-ellipsis">' + (childDepart.members[k].postName || '').escapeHTML() + '</p> </li>';
               
                
            }
            $('.randomId' + randomId).remove();
            if (pageNum > 1) {
                $(".search-people").append(members);
            } else {
                $(".search-people").html(members);
            }
            if (childDepart.depart.length <= 0 && ($(".search-people li").length <= 0)) {
                //$(".search-people").html('<div class="page_null"> <span class="iconfont see-icon-m3-page-nodata"></span> <div>暂无人员</div> </div>');
                cmp.dialog.loading(false);
                cmp.dialog.loading({
                    status: "nocontent",
                    text: m3i18n[cmp.language].noContent
                });
                $(".cmp-loading.cmp-loading-fixed").css("height", parseFloat($(".cmp-loading.cmp-loading-fixed").css("height")) - parseFloat($(".search-company").css("height")) - 44);
            }else{
                cmp.dialog.loading(false);
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

        };

        //单位下的部门数据渲染
        var colorArray = ['#3eb0ff', '#FFD142', '#27E0B8', '#FF7FAA', '#837FFF', '#FF7F7F'];
        searchPerson.loadData = function() {
            // cmp.notification.alert("数据渲染完成")
            $('.nocontent').remove();
            var html = "";
            var myDepartTitle;
            var departTitle;
            var parentSpan = "<span class='common cmp-link1-fc' data-i='" + childDepart.parent[0].departmentId + "'>" + childDepart.parent[0].departmentName.escapeHTML() + "</span> ";
            childDepart.nav.html(parentSpan);
            //其他部门
            for (var i = 0; i < searchPerson.depart.length; i++) {
                var iconHead = 'm3-header-department';
                var munber = '';
                var count = searchPerson.depart[i].count;
                if( searchPerson.depart[i].internal === '1' ){ //内单位
                    munber = count?count:"";
                }
                if ( searchPerson.depart[i].internal === '0' ) { //外单位
                    iconHead = 'm3-header-department m3-department-out';
                    munber = count?count:"";
                }
                // departTitle = searchPerson.depart[i].name.charAt(0);
                departTitle = " ";
                html += '<li id="' + searchPerson.depart[i].id + '" data-i="' + searchPerson.depart[i].id + '" class="cmp-table-view-cell m3-department"><div class="search-list-icon '+ iconHead +'" style="background-color: ' + colorArray[(i + 1) % colorArray.length] + '">' + departTitle + '</div><div class="cmp-pull-left m3-department flex-1">' + (searchPerson.depart[i].name.escapeHTML()) + '</div><div class="cmp-pull-right"><span class="' + searchPerson.depart[i].id + '">' + munber + '</span><span class="iconfont see-icon-m3-arrow-right"></span></div> </li>';
               
             }
             $(".search-people").html("");
             $(".search-depart").removeClass("display_none");
             $(".search-depart").html(html);
            if (cmp.storage.get("searchPosition", true)) {
                $(".search-depart")[0].scrollTop = cmp.storage.get("searchPosition", true);
                cmp.storage.delete("searchPosition", true);
            }
            if (searchPerson.depart.length == 0) {
                cmp.dialog.loading(false);
                cmp.dialog.loading({
                    status: "nocontent",
                    text: m3i18n[cmp.language].noContent,

                });
                $(".cmp-loading.cmp-loading-fixed").css("height", parseFloat($(".cmp-loading.cmp-loading-fixed").css("height")) - parseFloat($(".search-company").css("height")) - 44);
            }
            m3ScrollObj.refresh(1, 1);
            // cmp.listView('#indexListView');
        };
    }
    //通过单位ID获取当前单位下的部门及人员数据
    function initCompanyData(){
        var curCompanyId = cmp.storage.get('curCompanyIdDepart',true) || cmp.storage.get('curCompanyId', true)||cmp.storage.get('curCompanyId') || m3.userInfo.getCurrentMember().accountId || cmp.storage.get("accountid");
        if(networkState || wechatSystem){
            var url = m3.curServerInfo.url + (wechatSystem?"/seeyon":"/mobile_portal/seeyon")+"/rest/contacts2/get/departments/" + curCompanyId + "/0/1000";
            m3Ajax({
                url: url,
                type: "GET",
                success: function(res) {
                    console.log(res);
                    if (res.code == 200 && res.data) {
                        getSuccessCallBack(res)
                    }
                },
                error: function(res) {
                    console.log(res);
                    cmp.dialog.loading(false);
                }
            });
        }else{
            nativeApi.getDepartmentList(curCompanyId, function(res) {
                getSuccessCallBack(res)
            }, function(e) {
                console.log('离线获取部门列表失败，切换本单位在线模式');
                // onlineAjaxDep();
            });
        }
        function getSuccessCallBack(res) {
            searchPerson.depart = res.data.departments;
            res.data.myDepartment && (searchPerson.myDepart = res.data.myDepartment);
            searchPerson.loadData();
        }
    };

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
        $("ul.search-people").css({
            "background-image": "url(" + watermarkUrl + ")",
            "background-repeat": "repeat",
            "background-position": "0% 0%",
            "background-size": "200px 100px"
        });
    }

}());
