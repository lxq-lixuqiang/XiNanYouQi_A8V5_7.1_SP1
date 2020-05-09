/**
 * description: 通讯录模块——关联人员
 * author: Ms
 * createDate: 2017-09-27
 */


;(function() {
    var m3,m3Ajax,template,
    m3i18n,initGetItemIdArray=new Array(),markInit=true,m3Cache,ItemsdataAll=[],materMark,
    imgIdArr=[],//NameArr=[],
    imgCanLoaded = true,dataListLen="",
    selectPeploArray=[],peploMark=true,wechatSystem, $ = $cmp;
    var listViewObject;
    var key = 'aspersonelItemsKey';
    var projectTeam = {};
    define(function(require, exports, module) {
        //加载模块
        m3 = require('m3');
        require('commons');
        m3Ajax = require('ajax');
        m3i18n = require('m3i18n');
        m3Cache = require('nativeCache');
        template = require('commons/template/member-list.js');
        
        initPage();
    });
    function getGoPersonUrl(uid) {
        /*获取跳转人员信息地址*/
        var isSelf = uid == m3.userInfo.getCurrentMember().id;
        if (!arguments.length || !uid) return m3.href.map.my_personInfo;
        // var isSelf = false;
        return isSelf?m3.href.map.my_person_detail:m3.href.map.my_other_person_detail;
    }
    //获取人员全部信息
    var pepolData ="";
    // 初始化
    function initPage() {
        cmp.ready(function() {
            wechatSystem = cmp.platform.wechat || cmp.platform.wechatOrDD;//微信端或者钉钉端
            pepolData = m3.userInfo.getCurrentMember();
            document.title = fI18nData["search.m3.h5.AssociatedPersonnel"];
            initPageUI();
            loadDOM();
            backBtn();
            materMark = cmp.href.getParam();
            // initSelectPepolData();
            $('#aspersonel').on('tap', '.aspersonnel-item-cell', function(e) {
                var _this = $(this);
                if(_this.hasClass('aspersonelDel')){
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                var id = _this.attr('id');
                // cmp.href.openWebViewCatch = function() {
                //     return 1;
                // };
                // cmp.href.next(url, id,{animated:true});
                if(wechatSystem){
                    // var url = cmp.seeyonbasepath + "/m3/apps/v5/addressbook/html/addressbookView.html";
                    var options={
                        memberId:id,comeFrom:"0",pageInfo:url
                    }
                    cmp.href.next(m3.href.map.address_memberDetail,options);
                }else{
                    var url = getGoPersonUrl(id) + "&page=search-next&id=" + id + "&from=m3&enableChat=true&time=" + (new Date().getTime());
                    cmp.href.next(url, id, {
                        animated: false, 
                        openWebViewCatch: true,
                        pushInDetailPad: true,
                        nativeBanner: false
                    });
                    // m3.state.go(url, id, m3.href.animated.none, true );
                }
            });
            cmp.event.orientationChange(function(res){
                var windowHeight = window.innerHeight;
                var windowH = windowHeight - document.querySelector('header.cmp-bar-nav').offsetHeight;
                // document.querySelector('#cmpControlContent').style.height = windowH+"px" ;
                document.querySelector('.cmp-control-content.cmp-active').style.height = windowH+"px" ;
                cmp.listView("#aspersoner_scroll").refresh();
            });
            if(!wechatSystem){
                cmp.webViewListener.addEvent("checkPeople",function(data){
                    if(data){
                        loadDOM();
                    }
                });
            }
            if(Object.getOwnPropertyNames(materMark).length>0){
                if(materMark.materMarkEnable=="true"&&materMark.materMarkAddressBookEnable=="true"){
                    watermark(m3.userInfo.getCurrentMember().name, m3.userInfo.getCurrentMember().accShortName, getDate());
                }
            }
            
        });
    }
    //初始化获取所有人员
    function initSelectPepolData(callback){
        var url = m3.curServerInfo.url + '/mobile_portal/seeyon/rest/m3/contacts/concern/getAllConcernMember?option.n_a_s=1';
        cmp.dialog.loading(true);
        m3Ajax({
            type: "GET",
            url: url,
            setCache: {
                key: key,
                isShowNoNetWorkPage: false
            },
            success: function(msg){
                cmp.dialog.loading(false);
                if(msg.code == 200){
                    callback && callback(msg);
                }
            },
            error:function(msg){
                cmp.dialog.loading(false);
                console.log(msg)//网络异常提示
            }
        }); 
    }

    //事件初始化  获取人员数据
    function initData(params,options){
        //获取数据：
        var pageNo = params.pageNo;
        var pageSize = params.pageSize;
        var url = m3.curServerInfo.url + '/mobile_portal/seeyon/rest/m3/contacts/concern/getConcernMember/'+pageNo+'/'+pageSize+'?option.n_a_s=1';
        // var Url = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/addressbook/peopleRelate/" + pepolData.id;
        var successCallback = options.success;
        m3Ajax({
            type: "GET",
            url: url,
            setCache: {
                key: key,
                isShowNoNetWorkPage: false
            },
            success: function(msg,from){
                console.log(msg);
                if(msg){
                    // var _aspersonel = document.querySelector('#aspersonel');
                    var data  = msg instanceof Array ? msg:msg.data;
                    dataListLen = data.length;
                    // _aspersonel.innerHTML=''; 
                    if( from == 'native'){
                        // cmp.notification.toast(m3i18n[cmp.language].Offlinemode, "top",500);//离线提示
                        // successCallback(msg);
                    }else{
                        successCallback(msg);
                        if(markInit)getSelectOrg();
                        if(data.length != 0){
                            cmp.dialog.loading(false);
                        }
                        markInit = false;
                    }
                }
            },
            error: function(msg) { 
                console.log(msg)
                if(msg.code == "-1009"){
                    cmp.dialog.loading({
                        status:"nonetwork",//nonetwork
                        callback:function(){
                            window.location.reload();
                        }
                    });
                }
                
            }
        }); 
        
    }
    //初始化加载数据
    function renderData(result,isRefresh){
        if(!result instanceof Array)return;
        if(result.length == 0){ //空数据
            var nodata = fI18nData["search.m3.h5.nodata"];
            if(!document.querySelector('.cmp-loading.nocontent')){
                cmp.dialog.loading({status:"nocontent",text:nodata,background:"#fff" });
            }
            
        }else{
            cmp.dialog.loading(false);

            var parseData = result;
            if(isRefresh){
                AppendHtml(parseData,isRefresh);
                initGetItemId();
            }else {
                initGetItemId(function(){
                    if(initGetItemIdArray.length > 0){
                        var NewData = [];
                        for(var i=0,len=parseData.length;i<len;i++){
                            if(initGetItemIdArray.indexOf(parseData[i].id) < 0 ){
                                NewData.push(parseData[i]);
                            }
                        }
                        AppendHtml(NewData);
                    }
                });
            }
            
        }
    };  
    //保存关注人员
    function savePerson(data){
        var url = m3.curServerInfo.url + '/mobile_portal/seeyon/rest/m3/contacts/concern/saveConcernMember?option.n_a_s=1';
        m3Ajax({
            type: "POST",
            url: url,
            data:JSON.stringify(data),
            success: function(msg) {
                console.log('保存成功')
            },
            error: function(msg) {
                console.log('保存失败')
                //网络异常提示
                // cmp.notification.toastExtend(m3i18n[cmp.language].networkAbnormal, "bottom", 1000, { bg: "rgba(0, 0, 0, 0.7)", color: "#fff" });
                
            }
        }); 
    }
    //取消关注人员
    function cancelPerson(data){
        var url = m3.curServerInfo.url + '/mobile_portal/seeyon/rest/m3/contacts/concern/cancelConcernMember/' + data +'?option.n_a_s=1';
        cmp.dialog.loading(true);
        m3Ajax({
            type: "GET",
            url: url,
            success: function(msg) {
                cmp.dialog.loading(false);
                console.log('取消关注成功');
                var liDomLen = document.querySelectorAll('.aspersonnel-item-cell').length;
                if( liDomLen < 9 && dataListLen > 8 ){
                    loadDOM();
                }
                if(liDomLen < 1 ){
                    loadDOM();
                }
                cmp.listView("#aspersoner_scroll").refresh();
            },
            error: function(msg) {
                cmp.dialog.loading(false);
                console.log('取消关注失败');
            }
        }); 
    }
    //左上角返回按钮
    function backBtn() {
        cmp.backbutton();
        cmp.backbutton.push(backButton);
        $("#backBtn").on("tap", function() {
            cmp.href.back();
       });
       //安卓自带返回键
    //    document.addEventListener("backbutton", function() {
    //         cmp.href.back();
    //    });
    }
    function backButton(){
        cmp.href.back();
    }

    //初始化获取人员ID
    function initGetItemId(callback){
        var _aspersonel = document.querySelector('#aspersonel');
        var _itemCell = _aspersonel.querySelectorAll('.aspersonnel-item-cell');
        if(!_itemCell)return;
        initGetItemIdArray = [];
        for(var j=0,jlen=_itemCell.length;j<jlen;j++){
            var itemId = _itemCell[j].getAttribute('id');
            initGetItemIdArray.push(itemId);
            if(j == jlen-1){
                callback && callback();
            }
        };
    }
    
    //调用选人组件
    function getSelectOrg(){
        var getSelectOrg = document.querySelector('#getSelectOrg');
        var thisObj = {id:m3.userInfo.getId(),name:m3.userInfo.getCurrentMember().name,type:"member",disable:true};
        var OrgOptions = {};
        var noPepolArray = [];

        var timer,clickMark = true;
        cmp.event.click(getSelectOrg,function(){
            if(clickMark){
                clearTimeout(timer);
                clickMark = false;
                timer = setTimeout(function(){
                    clickMark = true;
                },700); 
                cmp.sdk.setGestureBackState(false);//禁用手势返回
                ItemsdataAll = [];
                initSelectPepolData(function(msg){
                    var parseData = msg.data;
                    noPepolArray = [];
                    for(var i=0,ilen=parseData.length;i<ilen;i++){
                        parseData[i].type = "member";
                        ItemsdataAll.push(parseData[i]);
                        noPepolArray.push(parseData[i]);
                    }
                    noPepolArray.push(thisObj);
                    OrgOptions = {
                        type:1,
                        flowType:2,
                        fillBackData:[],
                        multitype:true,
                        // lightOptsChange:false,
                        // fillback: null,
                        notSelectSelfDepartment:true,//禁止选择整个部门
                        notSelectAccount:true,   //禁止选择整个单位
                        selectType:"member", 
                        choosableType:["member"],  //只选人
                        excludeData:noPepolArray,  //被排除的不能选择的数据
                        label:["dept","org","post","team","extP"],
                        flowOptsChange:true,
                        h5header:true,
                        //showBusinessOrganization:true,
                        callback:function(res){
                            cmp.sdk.setGestureBackState(true);//开启手势返回
                            selectPeplo = [];
                            peploMark = false;
                            imgIdArr = [];
                            var result = cmp.parseJSON(res).orgResult;
                            if(result.length != 0 ){
                                var _aspersonel = document.querySelector('#aspersonel');
                                var newArray = [];
                                var IdArray = [];
                                for(var m=0,mlen=ItemsdataAll.length;m<mlen;m++){
                                    IdArray.push(ItemsdataAll[m].id);
                                } 
                                for(var j=0,jlen=result.length;j<jlen;j++){
                                    if(initGetItemIdArray.length == 0){
                                        newArray.push(result[j]);
                                        if(initGetItemIdArray.indexOf(result[j].id) == -1 ){
                                            initGetItemIdArray.push(result[j].id);
                                            selectPeploArray.push(result[j].id);
                                            AppendHtml(newArray);
                                        }  
                                    }else{
                                        for(var i=0,ilen=initGetItemIdArray.length;i<ilen;i++){  
                                            if(result[j].id != initGetItemIdArray[i] ){ //遍历当前数据中是否包含已有的id
                                                newArray.push(result[j]);
                                                if(initGetItemIdArray.indexOf(result[j].id) == -1 ){
                                                    initGetItemIdArray.push(result[j].id);
                                                    selectPeploArray.push(result[j].id);
                                                    AppendHtml(newArray);
                                                } 
                                            }
                                        } 
                                    }
                                    newArray = [];
                                    if(ItemsdataAll.length == 0 ){
                                        ItemsdataAll.push(result[j]);
                                    }else{
                                        if(IdArray.indexOf(result[j].id) == -1){
                                            ItemsdataAll.push(result[j]);
                                        }
                                    }
                                }
                                savePerson(ItemsdataAll);
                                m3Cache.setCache(key, ItemsdataAll);
                                cmp.dialog.loading(false);
                                var statusContainer = document.querySelector('.StatusContainer');
                                if(statusContainer){
                                    statusContainer.remove();
                                }
                                var loadingNocontent = document.querySelector('.cmp-loading.cmp-loading-fixed.nocontent');
                                var cmpbackdrop = document.querySelector('.cmp-backdrop');
                                if(loadingNocontent && cmpbackdrop){
                                    loadingNocontent.remove();
                                    cmpbackdrop.remove();
                                }
                                peploMark = true;
                            }
                            cmp.selectOrgDestory(getSelectOrg);
                        },
                        closeCallback:function(){
                            cmp.sdk.setGestureBackState(true);//开启手势返回
                            cmp.selectOrgDestory(getSelectOrg);
                        }
                    };
                    if (window.componentsLoaded) {
                        cmp.selectOrg(getSelectOrg,OrgOptions);
                    }
                });
            }
            
        });
        
    }

    // 渲染dom元素
    function AppendHtml(result,isRefresh){
        if(result.length == 0)return;
        var str = '';
        var ip = m3.curServerInfo.model +'://'+ m3.curServerInfo.ip +':' + m3.curServerInfo.port;
        var _aspersonel = document.querySelector('#aspersonel');//
        if(isRefresh){
            _aspersonel.innerHTML = ""; 
            peploMark = false;
            imgIdArr = [];
        }
        if(peploMark){
            imgIdArr = [];
        }
        for(var i = 0;i< result.length; i ++){
            if(peploMark){
                if(selectPeploArray.indexOf(result[i].id) > -1 ){
                    continue;
                }
            }
            
            var textRmove = fI18nData["search.m3.h5.remove"];
            var li = document.createElement('li');
            // var cliceName;
            // if(funcChina(result[i].name)){//是英文
            //     cliceName = result[i].name.substr(0,2);//截取前两位字符
            // }else{ //不是英文
            //     cliceName = result[i].name.substr(1); //截取后两位字符
            // }
            // <span>'+ cliceName +'</span>\
            var postText = result[i].post ? result[i].post.escapeHTML() : "";
            var imgUrl = ip + '/mobile_portal/seeyon/rest/orgMember/avatar/'+ result[i].id +' '; 
            li.className = 'cmp-table-view-cell aspersonnel-item-cell cmp-media';
            li.setAttribute('id',result[i].id);
            // var accountShortname = "";
            // if(result[i].accountShortname){
            //     if(m3.userInfo.getCurrentMember().accShortName != result[i].accountShortname){
            //         accountShortname = '('+ result[i].accountShortname +')';
            //     }
            // }
            // <span class="personel_shortname"> '+ accountShortname +' </span>\
            str ='<div class="cmp-slider-right cmp-disabled">\
                    <a class="cmp-btn cmp-btn-red aspersonelDel" >'+textRmove+'</a>\
                </div><a class="cmp-slider-handle" href="javascript:;">\
                    <div class="personel_refer" style="background:url('+imgUrl+') no-repeat;background-size:100% 100%;">\
                    </div>\
                    <div class="cmp-media-body personel_info">\
                        <span  class="cmp-ellipsis personel_name cmp-headtitle-fc">\
                            <span>'+result[i].name +'</span>\
                        </span>\
                        <p class="cmp-ellipsis cmp-sup-fc">'+ postText +'</p>\
                    </div>\
                </a>';
            imgIdArr.push(result[i].id);
            li.innerHTML = str;
            _aspersonel.appendChild(li);
            //右滑点击删除
            var itemDel = li.querySelector('.aspersonelDel');
            cmp.event.click(itemDel,function(e){
                cmp.listView("#aspersoner_scroll").disable();
                var liObj = e.target.parentNode.parentNode;
                var itemId = liObj.getAttribute("id");
                initGetItemIdArray.remove(itemId);
                liObj.remove();
                cancelPerson(itemId);
                cmp.listView("#aspersoner_scroll").enable();
            });
        } 
        if (imgIdArr.length > 0) {
            checkLoaded(loadHeader);
        }


    }
    Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) return i;
        }
        return -1;
    };
    Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
    //判断是否是英文
    function funcChina(obj){    
        if(/.*[\u4e00-\u9fa5]+.*$/.test(obj)) {  
            return false;   
        }   
        return true;   
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
            // $('#'+imgIdArr[index]).find('.personel_refer').html(str);

            $('#' + imgIdArr[index]).find('.personel_refer').css('backgroundImage','url(http://commons.m3.cmp/v/imgs/header.png)');
            if (index == imgIdArr.length - 1) {
                imgCanLoaded = true;
                index = 0;
            } else {
                index++;
                loadHeader();
            }
        }
        imgObj.onload = function() {
            $('#' + imgIdArr[index]).find('.personel_refer').css('backgroundImage','url(' + url + ')');
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
        }, 50);
    }

 //初始化页面，
    function initPageUI() {
        //定义公共变量
        projectTeam.num = 0;
        projectTeam.pulldownTip = {
            contentdown: m3i18n[cmp.language].pulldownTipDown, //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
            contentover: m3i18n[cmp.language].pulldownTipOver, //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
            contentrefresh: m3i18n[cmp.language].pulldownTipRefresh //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
            // contentprepage: m3i18n[cmp.language].pulldownTipPrepage
        };
        projectTeam.pullupTip = {
            contentdown: m3i18n[cmp.language].pullupTipDown, //可选，在上拉可刷新状态时，上拉刷新控件上显示的标题内容
            contentrefresh: m3i18n[cmp.language].pullupTipRefresh, //可选，正在加载状态时，上拉加载控件上显示的标题内容
            contentnomore: m3i18n[cmp.language].pullupTipNomore //可选，请求完毕若没有更多数据时显示的提醒内容；
            // contentnextpage: m3i18n[cmp.language].pullupTipNextpage
        };
    }



    //开始listView 获取渲染数据
    function loadDOM() {
        listViewObject = cmp.listView("#aspersoner_scroll", {
            config: {
                // captionType:0,
                // params: {ticket: "第二个参数"},
                params:{},
                // onePageMaxNum:10,
                pageSize: 15,
                dataFunc: function(parms,options) {
                    initData(parms,options);
                },
                renderFunc:renderData
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

        $("#aspersonel").css({
            "background-image": "url(" + watermarkUrl + ")",
            "background-repeat": "repeat",
            "background-position": "0% 0%",
            "background-size": "200px 100px"
        });
    }



})();
