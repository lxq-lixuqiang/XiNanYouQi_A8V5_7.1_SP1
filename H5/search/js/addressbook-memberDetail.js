/**
 * description: 通讯录微信端人员卡片详情
 * author: 马山
 * createDate: 2019-05-20情人节
 */
(function () {
    var id = "", name = '', memberData = {}, imgFilePath = "",wechatSystem,userInfo;
    var currentId = "";
    var m3Error, m3i18n, m3Ajax, nativeApi, isMy = true;
    var url = 'http://commons.m3.cmp/v/imgs/header.png';
    var key = 'aspersonelItemsKey',networkState = "";
    var isFormPersonShunt = getParam("isshunt") == 'true'; //是否来源于分流中转页面
    var $ = $cmp;
    define(function (require, exports, module) {
        //加载模块
        require('m3');
        require('commons');
        // m3Scroll = require('scroll');
        m3Error = require('error');
        m3i18n = require("m3i18n");
        m3Ajax = require("ajax");
        m3 = require("m3");
        m3DB = require("sqliteDB");
        nativeApi = require("native");
        // iscroll = require('iscroll1');
        // listViewFun = require('todo/js/cmp-list-view.js');
        initPage();
    });

    function getGoPersonUrl(uid) {
        /*获取跳转人员信息地址*/
        var isSelf = uid == m3.userInfo.getCurrentMember().id;
        if (!arguments.length || !uid) return m3.href.map.my_personInfo;
        // var isSelf = false;
        return isSelf ? m3.href.map.my_person_detail : m3.href.map.my_other_person_detail;
    }

    //入口函数
    function initPage() {
        cmp.ready(function () {
            userInfo = m3.userInfo.getCurrentMember();
            //左上角返回按钮
            backBtn();
            wechatSystem = cmp.platform.wechat || cmp.platform.wechatOrDD;//微信端或者钉钉端
            var data = getParams = cmp.href.getParam();
            singleOpen = data && data.singleOpen;
            if (typeof data !== 'object' && data && !data.name) {
                id = data;
            } else {
                name = data ? data.name : getParam('name') ? getParam('name') : '';
                parent = getParam("page");
                id = data.memberId;
            }
            if (id != m3.userInfo.getCurrentMember().id) {
                isMy = false;
            }
            currentId = m3.userInfo.getId();
            $('.name').text(name);
            initStyle();
            // initEvent(status,false);
            getPageNetworkState(function (status) {
                // initStyle();
                initEvent(status, false);
            });
            cmp.orientation.onOrientationChange(function (res) {
                if (cmp.os.android) {
                    setTimeout(function () {
                        setCmpHeightView(isMy);
                    }, 600);
                } else {
                    setCmpHeightView(isMy);
                }
            });
        });
    }

    // 再次封装获取状态函数
    function getPageNetworkState(callBack) {
        nativeApi.getNetworkState(function (ret) {
            console.log('当前网络为' + ret.serverStatus);
            networkState = (ret.serverStatus === 'connect' && ret.networkType != 'none');
            typeof callBack == 'function' && callBack((ret.serverStatus === 'connect'));
        })
    }

    // 给cmp-content hieght function
    function setCmpHeightView(isMyTrue) {
        var cmplistviewScroll = document.querySelector('#cmp-listview-scroll')
        var headerView = document.querySelector("#userhead.cmp-bar-nav");
        var headerHeight = headerView ? headerView.offsetHeight : 0;
        var footerHeight = 50;
        var headContent = isMyTrue ? document.querySelector('.person_header').offsetHeight + 7 : 0;
        cmplistviewScroll.style.height = (window.innerHeight - (headerHeight || 0) - (footerHeight || 0)) - headContent + "px";
    }
    //样式初始化
    function initStyle() {
        //人员头像
        $('body').removeClass('cmp-global-bg-loading');
        var personnelHead = "";
        if (id && id != currentId) { //从通讯录进入人员卡片
            // $('#userhead').removeClass('display_none'); //显示头部操作区域
            // $('#otherhead').addClass('display_none'); //显示头部操作区域
            // $('.person_header').addClass('isOther');
            // $('#isother').addClass('isother_header');
            // $('.my_module').removeClass('topImportant');
            getCache();   //获取当前key的缓存
            if(wechatSystem){
                personnelHead = m3.curServerInfo.url + "/seeyon/rest/orgMember/avatar/" + id + '?maxWidth=100';
        
            }else{
                personnelHead = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/orgMember/avatar/" + id + '?maxWidth=100';
        
            }
            
        } else { //当前登录人员自己的人员卡片
            // $('.station').addClass('display_none');
            // $('#my_personDecoder').addClass('display_none');
            var userInfoObj = m3.userInfo.getCurrentMember();
            personnelHead = userInfoObj.iconUrl;
        }
        headerUrl = personnelHead;
        $(".person_head").css({
            "background-image": "url('" + (personnelHead == "" ? url : personnelHead) + "')",
            "background-size": "cover",
            "background-position": "center center"
        });
        var imgObj = new Image();
        if(wechatSystem){
            var defaultUrl = m3.curServerInfo.url + "/seeyon/rest/orgMember/avatar/" + id + '?maxWidth=100';
        
        }else{
            var defaultUrl = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/orgMember/avatar/" + id + '?maxWidth=100';
        
        }
        imgObj.src = defaultUrl;
        imgObj.onload = function () {
            if (!m3.userInfo.getCurrentMember().iconUrl) {
                $(".person_head").css({
                    "background-image": "url('" + defaultUrl + "')",
                    "background-size": "cover",
                    "background-position": "center center"
                });
            }
            if(!wechatSystem){
                cmp.h2Base64({
                    l: 100,
                    imgUrl: defaultUrl,
                    success: function (base64) {
                        faceUrl = base64;
                        headerUrl = base64
                    },
                    error: function (e) {
                        faceUrl = '';
                        console.log(e);
                        console.log('人员头像base64装换失败');
                    }
                });
            }
        };
        imgObj.onerror = function () {
            defaultUrl = "http://commons.m3.cmp/v/imgs/header.png";
            $(".person_head").css({
                "background-image": "url('" + defaultUrl + "')",
                "background-size": "cover",
                "background-position": "center center"
            });
            cmp.h2Base64({
                l: 100,
                imgUrl: defaultUrl,
                success: function (base64) {
                    faceUrl = base64;
                    headerUrl = base64
                },
                error: function (e) {
                    faceUrl = '';
                    console.log(e);
                    console.log('人员头像base64装换失败');
                }
            });
        }
        nativeApi.getConfigInfo(function (res) {
            var data = JSON.parse(res);
            var config = {};
            try {config = data;} catch (e) {}
            
            // console.log('返回外编人员状态为:' + config.internal);
            if(wechatSystem){  //微信端拿的是getConfigInfo接口
                config = data.data.config;
            }
            console.log("返回通讯录权限：" + config.hasAddressBook);
            if (!config.hasAddressBook) {
                $('#deptLi .arrow-right').addClass('display_none');
            }
            if(wechatSystem){
                var url = cmp.origin +'/rest/addressbook/currentUser';
                m3Ajax({
                    url: url,
                    type: "GET",
                    success : function(person) {
                        var accShortName = person.waterMarkDeptName;//水印单位简称
                        var waterMarkName = person.waterMarkName;//水印人员名称
                        watermark( waterMarkName , accShortName , getDate(),config);
                    },error : function(error) {
                        console.log(error)
                    }
                }); 
            }else{
                watermark(userInfo.name||cmp.member.name, userInfo.accShortName || userInfo.accName, getDate(), config);
            }
        }, function (error) {
            console.log(error);
        });
        setCmpHeightView(true);
    }
    var isLoadedAtt = cmp.att ? true : false;
    function getCmpAttAndCamera(callback) {
        if (isLoadedAtt) {
           callback&&callback();
        } else {
            cmp.asyncLoad.css([
                _cmpSeeyonPath+'/css/cmp-att.css'
            ], function () {
            });
            cmp.asyncLoad.js([
                _cmpSeeyonPath+'/js/cmp-att.js',
                _cmpSeeyonPath+'/js/cmp-camera.js'
            ], function () {
                isLoadedAtt = true;
                callback&&callback();
            });
        }
    }
    //事件初始化
    function initEvent(networkState, edit) {
        $('#userDefined').on('touchstart', '.user-defined', function (e) {
            e.stopPropagation()
        });
        if (isMy) { //当前登陆人员
            if(wechatSystem){
                var url = m3.curServerInfo.url + "/seeyon/rest/contacts2/member/" + currentId;
            }else{
                var url = m3.curServerInfo.url + "/mobile_portal/api/contacts2/member/" + currentId;
            }
            getInfo(currentId, networkState, function (res) {
                if (res.code == 200) {
                    memberData.parentDepts = res.data.parentDepts;
                    memberData.accountId = res.data.accountId || m3.userInfo.getCurrentMember().accountId;
                    //获取个人信息
                    var data = m3.userInfo.getCurrentMember();
                    cmp.storage.delete("memberData", true);
                    personInfo(res.data, edit);
                    //自定义字段
                    if (data.isVjoin !== "1") {
                        userDefined(res.data.customFields, edit);
                    }
                    if (!edit) { //修改过字段后返回
                        //点击头像 可编辑
                        $(".person_head").on("tap", function () {
                            getPageNetworkState(function (state) {
                                if (!state) {
                                    cmp.notification.toast(fI18nData['search.m3.h5.noConnectServer'], "center");
                                    return;
                                }
                                getCmpAttAndCamera(function () {
                                    modifyAvatar();
                                });
                            });
                        });
                        eventCall(res.data);
                    }
                    // listViewFun("#cmp-listview-scroll").refresh();
                }
            }, function (res) {
                console.log(res)
            })
        } else {   //其他人员
            getInfo(id, networkState, function (res) {
                console.log(res);
                if ("200" == res.code) {
                    if (!res.data) return;
                    memberData.parentDepts = res.data.parentDepts;
                    memberData.accountId = res.data.accountId;
                    personInfo(res.data, false, true);
                    memberData = res.data;
                    cmp.storage.save("memberData", JSON.stringify(memberData), true);
                    if (res.data.isVjoin !== "1") {
                        userDefined(res.data.customFields, edit);
                    }
                    cmp.asyncLoad.js([
                        _cmpSeeyonPath+'/js/cmp-telmail.js'
                    ], function () {
                    });
                    //点击头像 可编辑
                    $(".person_head").on("tap", function () {
                        if (!networkState) {
                            cmp.notification.toast(fI18nData["search.m3.h5.notLoadHead"], 'center');
                            return;
                        }
                        getCmpAttAndCamera(function () {
                            _readFile(id);
                        });
                    });
                    // initRp(res);
                    // watermark(m3.userInfo.getCurrentMember().name, m3.userInfo.getCurrentMember().accShortName, getDate());
                    eventCall(res.data);
                    // listViewFun("#cmp-listview-scroll").refresh();
                }
            }, function (res) {
                console.log(res)
            });
        }
    }
    function getInfo(id, networkState, success, fail) {
        //判断网络状态
        if (networkState) {
            onlineGetMember(id, false, success, function (err) {
                //在线获取失败
                console.log('在线获取人员卡片数据失败，开始加载离线人员卡片');
                //获取离线人员
                nativeApi.getMemberInfo({
                    id: id,
                    accountId: cmp.storage.get('curCompanyId', true) || m3.userInfo.getCurrentMember().accountId
                }, success, function (e) {
                    console.log(e);
                    console.log('离线人员卡片数据获取失败');
                    //异常处理
                    m3Error.notify(err, 'ajax', fail);
                });
            });
        } else {
            // if ((cmp.storage.get('curCompanyId') !== null) && cmp.storage.get('curCompanyId') !== m3.userInfo.getCurrentMember().accountId) {
            //     console.log('非本单位人员');
            //     onlineGetMember(id, true, success, fail);
            // } else {
            console.log('离线获取人员卡片数据');
            nativeApi.getMemberInfo({
                id: id,
                accountId: cmp.storage.get('curCompanyId', true) || m3.userInfo.getCurrentMember().accountId
            }, success, function (e) {
                console.log('离线人员卡片数据获取失败,开始切换在线访问');
                onlineGetMember(id, true, success, function (e) {
                    console.log('在线人员获取失败');
                    fail(e);
                })
            });
            // }
        }
    }
    //在线模式--在线获取人员信息
    function onlineGetMember(id, isShowError, success, error) {
        var otherPersonUrl = m3.curServerInfo.url + (wechatSystem?"/seeyon":"/mobile_portal/seeyon")+ "/rest/m3/contacts/showPeopleCard/" + id;
        var cache = {};
        if (!isShowError) {
            cache = {isShowNoNetWorkPage: false}
        }
        m3Ajax({
            url: otherPersonUrl,
            setCache: cache,
            type: "GET",
            success: function (ret) {
                if (!ret.data.isShow) {
                    isShow = false;
                    cmp.notification.toast(fI18nData['search.m3.h5.authority1'], "center");
                    setTimeout(function(){
                        cmp.href.back();
                    },1000);
                    return;
                }
                success(ret)
            },
            error: error
        });
    }
    //获取当前key的缓存 //关注人员
    function getCache() {
        m3Cache.getCache(key, function (res) {
            if (res.data && res.data.length == 0) return;
            keyPepolDatas = (res instanceof Array) ? res : res.data;
        }, function (res) {
            console.log(res);
        });

    }
    //获取url参数
    function getParam(paramName) {
        var paramValue = "";
        var isFound = false;
        var arrSource = "";
        if (window.location.search.indexOf("?") == 0 && window.location.search.indexOf("=") > 1) {
            arrSource = unescape(window.location.search).substring(1, window.location.search.length).split("&");
            var i = 0;
            while (i < arrSource.length && !isFound) {
                if (arrSource[i].indexOf("=") > 0) {
                    if (arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase()) {
                        paramValue = arrSource[i].split("=")[1];
                        isFound = true;
                    }
                }
                i++;
            }
        }
        return paramValue;
    }
    //人员信息
    /**
     * data :人员数据
     * edit:当前人员是否进行了字段修改
     * isOther:是否是查看其他人员
     * **/
    function personInfo(data, edit, isOther) {
        if (!data) return;
        if (!edit) {  //不是编辑字段的情况下
            $('.station').text(data.postName ? data.postName.escapeHTML() : '');
            // 姓名
            $('.person_info .name').text(data.name ? data.name.escapeHTML() : '-');
            //部门
            var parentDeptsDatas = networkState ? data.parentDepts : memberData.parentDepts;
            if (parentDeptsDatas && parentDeptsDatas.length > 0) {
                var parentDeptNameArray = [];
                var parentDeptsLen = parentDeptsDatas;
                var u = 0, ulen = parentDeptsLen.length;
                for (u; u < ulen; u++) {
                    parentDeptNameArray.push(parentDeptsLen[u].departmentName);
                }
                parentDeptNameArray.splice(parentDeptNameArray.length - 1, 1);
                var newNameArray = "";
                if (parentDeptNameArray.length < 2) {
                    newNameArray = parentDeptNameArray.toString();
                } else {
                    newNameArray = parentDeptNameArray.toString().replace(/,/g, ' > ');
                }
                var parentDeptSpan = '<span class="departmentArray">' + newNameArray + '</span>';
            }
            if (data.departmentName) {
                var departmentValue = (data.inner == "0" ? "(" + fI18nData["search.m3.h5.departInternal"] + ")" : "") + data.departmentName + (parentDeptSpan || "");
            }
            $('.datainfo.departmentText').html(departmentValue);
            //主岗
            if (!data.postName) {
                $('#mainpostLi').addClass('display_none');
            } else {
                $('.datainfo.mainpostText').text(data.postName || '-');
            }
            //职务级别
            if (!data.levelName) {
                $('.datainfo.positionText').parent().parent().addClass('display_none');
            } else {
                $('.datainfo.positionText').text(data.levelName || '-');
            }
            //渲染副岗---渲染个人信息副岗固定字段
            if (data && (data.sp || data.deputyPostName)) {
                var _sp = data.sp ? data.sp : data.deputyPostName;//副岗
                var _spArray = [];
                // var _sdArraylayer = [];
                for (var i = 0; i < _sp.length; i++) {
                    if (_sp[i].sp) {
                        if (_sp[i].sd) {
                            _spArray.push(_sp[i].sd + '-' + _sp[i].sp);
                        } else {
                            _spArray.push(_sp[i].sp);
                        }
                    }
                }
                for (var j = 0; j < _spArray.length; j++) {
                    var li = document.createElement('li');
                    li.className = 'cmp-table-view-cell';
                    // var _sdData = _sdArraylayer? _sdArraylayer.toString().replace(/,/g,' > '):"";  //去掉副岗显示层级
                    // <span class="departmentArray">'+_sdData+'</span>
                    var userIndexHTML = '<div class="cmp-pull-left">\
                        <div class="datainfo">' + (_spArray[j] ? _spArray[j].escapeHTML() : '-') + '</div>\
                        <div class="text">' + fI18nData['search.m3.h5.AccessoryPost'] + '</div>\
                    </div>';
                    li.innerHTML = userIndexHTML;
                    $('.fixedField').append(li);
                    $('#vjoinConf').insertAfter(li);
                }
            }
            if (data) {
                // 渲染个人信息--电话-微博等集合

                if (data.officeNumber || (data.officeNumber == "" && isMy)) {//办公电话
                    var obj = {
                        "typeIndex": "officeNumber",
                        "type": "officenumber",
                        "info": data.officeNumber || "",
                        "text": fI18nData['search.m3.h5.officenumber']
                    }
                    filterUserData(obj);
                }
                if (data.tel || (data.tel == "" && isMy)) {//手机号码
                    var obj = {
                        "typeIndex": "tel",
                        "type": "telnumber",
                        "info": data.tel || "",
                        "text": fI18nData['search.m3.h5.phone']
                    }
                    filterUserData(obj);
                }
                if (data.email || (data.email == "" && isMy)) {//邮箱
                    var obj = {
                        "emb": data.emb,
                        "typeIndex": "email",
                        "type": "emailaddress",
                        "info": data.email || "",
                        "text": fI18nData['search.m3.h5.mailbox']
                    }
                    filterUserData(obj);
                }
                if (data.workAddress || (data.workAddress == "" && isMy)) {//工作地
                    var obj = {
                        "typeIndex": "workAddress",
                        "type": "location",
                        "info": data.workAddress || "",
                        "text": fI18nData['search.m3.h5.workAddress']
                    }
                    filterUserData(obj);
                }
                if (data.weChat || (data.weChat == "" && isMy)) {//微信
                    var obj = {
                        "typeIndex": "weChat",
                        "type": "weixin",
                        "info": data.weChat || "",
                        "text": fI18nData['search.m3.h5.weixin']
                    }
                    filterUserData(obj);
                }
                if (data.weibo || (data.weibo == "" && isMy)) {//微博
                    var obj = {
                        "typeIndex": "weibo",
                        "type": "weibo",
                        "info": data.weibo || "",
                        "text": fI18nData['search.m3.h5.weibo']
                    }
                    filterUserData(obj);
                }
                if (data.address || (data.address == "" && isMy)) {//家庭住址
                    var obj = {
                        "typeIndex": "address",
                        "istextArea": true,
                        "type": "address",
                        "info": data.address || "",
                        "text": fI18nData['search.m3.h5.HomeAddress']
                    }
                    filterUserData(obj);
                }
                if (data.postalAddress || (data.postalAddress == "" && isMy)) {//通讯地址
                    var obj = {
                        "typeIndex": "postalAddress",
                        "istextArea": true,
                        "type": "postalAddress",
                        "info": data.postalAddress || "",
                        "text": fI18nData['search.m3.h5.PostalAddress']
                    }
                    filterUserData(obj);
                }
                if (data.postcode || (data.postcode == "" && isMy)) {//邮政编码
                    var obj = {
                        "typeIndex": "postcode",
                        "type": "postalcode",
                        "info": data.postcode || "",
                        "text": fI18nData['search.m3.h5.PostalCode']
                    }
                    filterUserData(obj);
                }
            }

            // info.postName.slice(0, 10) + "...") //字符串截取
            if (data.isVjoin === "1") {
                //vjoin机构
                if (!data.vjoinOrgName) {
                    alert("vjoin机构为空，当前人员id:" + id);
                } else {
                    memberData.vjoinOrgName = (data.vjoinOrgName.length > 10 ? (data.vjoinOrgName.slice(0, 10) + "...") : info.vjoinOrgName);
                }
                //vjoin单位
                if (!data.vjoinAccName) {
                    alert("vjoin单位为空，当前人员id:" + id);
                } else {
                    memberData.vjoinAccName = (data.vjoinAccName.length > 10 ? (data.vjoinAccName.slice(0, 10) + "...") : info.vjoinAccName);
                }
                //vjoin机构
                $("#vjoinOrg").text(memberData.vjoinOrgName);
                //vjoin单位
                $("#vjoinAcc").text(memberData.vjoinAccName);

                //vjoin有的不显示
                $("#vjoinOrgLi").show();
                $("#vjoinAccLi").show();

                $("#deptLi").hide();
                $("#jobLi").hide();
                $("#code").hide();
                $("#officeNumberLi").hide();
            }
        }
        $('#myfooter').removeClass('display_none'); //显示底部操作区域
        if (isOther || !isMy) {
            setCmpHeightView(false);
        }
    }
    function filterUserData(data) {
        var li = document.createElement('li');
        li.className = data.typeIndex == "email" ? 'cmp-table-view-cell email' : 'cmp-table-view-cell';
        var value = !data.info ? " - " : data.info.escapeHTML();
        var liHTML = '<div class="cmp-pull-left">';
        liHTML += '<div class="datainfo">' + value + '</div>';
        liHTML += '<div class="text">' + (data.text ? data.text.escapeHTML() : '-') + '</div>\
        </div>';
        if (isMy) {
            if (data.type == "location") {
                li.classList.add('isEdit');
            } else {
                // liHTML += '<div class="cmp-pull-right arrow-right"><span class="iconfont see-icon-m3-arrow-right arrow-icon"></span></div>';
            }
        } else {
            liHTML += '<div class="cmp-pull-right arrow-right">';
            if(wechatSystem){
                if (data.typeIndex == "officeNumber" && data.info.indexOf('*') < 0 && data.info) {  //工作电话
                    liHTML += '<a href="tel:'+value+'" class="">'+
                    '<span id="officeNumberPhone" class="iconfont see-icon-m3-phone-fill"></span>'+
                    '</a>'; //电话
                } else if (data.typeIndex == "tel" && data.info.indexOf('*') < 0 && data.info) {  //手机
                    liHTML += '<a href="sms:'+value+'" class="">'+
                    '<span id="telSMS" class="iconfont see-icon-msg"></span>'+
                    '</a>';  //短信
                    liHTML += '<a href="tel:'+value+'" class="">'+
                    '<span id="telPhone" class="iconfont see-icon-m3-phone-fill"></span>'+
                    '</a>'; //电话
                } else if (data.typeIndex == "email" && data.info) { //邮箱
                    liHTML += '<a href="mailto:'+value+'" class="">'+
                    '<span id="email" class="iconfont see-icon-m3-email-fill"></span>'+
                    '</a>'; //邮箱
                }
            }else{
                if (data.typeIndex == "officeNumber" && data.info.indexOf('*') < 0 && data.info) {  //工作电话
                    liHTML += '<span id="officeNumberPhone" class="iconfont see-icon-m3-phone-fill"></span>'; //电话
                } else if (data.typeIndex == "tel" && data.info.indexOf('*') < 0 && data.info) {  //手机
                    liHTML += '<span id="telSMS" class="iconfont see-icon-msg"></span>';  //短信
                    liHTML += '<span id="telPhone" class="iconfont see-icon-m3-phone-fill"></span>'; //电话
                } else if (data.typeIndex == "email" && data.info) { //邮箱
                    liHTML += '<span id="email" class="iconfont see-icon-m3-email-fill"></span>'; //邮箱
                }
            }
            liHTML += '</div>';
        }
        var istextArea = data.istextArea ? data.istextArea : "";//"value":"'+(data.info?data.info.escapeHTML():'-')+'"
        var isValue = data.info ? true : false;
        if (data.typeIndex == "email") {
            li.setAttribute('entry-data', '{"isValue":"' + isValue + '","emb":"' + data.emb + '","typeIndex":"' + data.typeIndex + '","type":"' + data.type + '","title":"' + data.text + '","istextArea":"' + istextArea + '"}');
        } else {
            li.setAttribute('entry-data', '{"isValue":"' + isValue + '","typeIndex":"' + data.typeIndex + '","type":"' + data.type + '","title":"' + data.text + '","istextArea":"' + istextArea + '"}');

        }
        li.innerHTML = liHTML;
        $('#userInfoItems').append(li);
    }
    //自定义字段
    function userDefined(data, edit) {
        if (edit) return;
        data = data == undefined ? [] : data;
        // data = sortObj(data);
        if (data.length == 0) {
            $('#userDefined').addClass('display_none');
            return;
        }
        $('#userDefined').removeClass('display_none');
        if (data && (data !== "null")) {
            var html = "";
            var value, i = 0, length = data.length;
            if (!length) {
                data = [data];
                length = data.length;
            }
            for (; i < length; i++) {
                var oneData = data[i];
                //v:字段属性值 k:字段名称 m:是否可修改 n:属性名称 t:属性类型  0：文本1：数字2：日期
                if (oneData.n) {
                    if (!isMy && !oneData.v) {  //查看其他人，并且该字段有值的情况
                        continue;
                    }
                    if (oneData.m == "0" && (!oneData.v || oneData.v == "")) {
                        continue;
                    }
                    var li = document.createElement('li');
                    li.className = 'cmp-table-view-cell';
                    var value = !oneData.v ? " - " : oneData.v.escapeHTML();
                    var liHTML = '<div class="cmp-pull-left">\
                        <div class="datainfo">' + value + '</div>\
                        <div class="text">' + (oneData.n ? oneData.n.escapeHTML() : '-') + '</div>\
                    </div>';
                    if (isMy && oneData.m == "1" && (oneData.e && oneData.e == "1")) {
                        li.classList.add('isEdit');
                        // liHTML += '<div class="cmp-pull-right arrow-right"><span class="iconfont see-icon-m3-arrow-right arrow-icon"></span></div>';
                    }
                    var istextArea = true;
                    var isValue = oneData.v ? true : false;
                    li.setAttribute('entry-data', '{"isValue":"' + isValue + '","typeStyle":"' + oneData.t + '","typeIndex":"' + oneData.k + '","type":"' + oneData.k + '","title":"' + oneData.n + '","istextArea":"' + istextArea + '"}');
                    li.innerHTML = liHTML;
                    $('#userDefined').append(li);
                }
            }
        }
    }
    //修改人员头像
    function modifyAvatar() {
        var url="";
        if(wechatSystem){
            url = m3.curServerInfo.url + "/seeyon/rest/m3/common/avatarConfig";
        }else{
            url = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/m3/common/avatarConfig"
        }
        m3Ajax({
            type: "GET",
            m3CatchError: false,
            url: url,
            setCache: {
                isShowNoNetWorkPage: false
            },
            success: function (msg) {
                if (msg.code == "200") { //enable
                    //是否允许员工修改头像
                    var items = [{
                        key: "3",
                        name: fI18nData['search.m3.h5.LookbigPicture']   //查看大图
                    }, {
                        key: "2",
                        name: m3i18n[cmp.language].selectPic,   //从手机相册选择
                        config:{
                            sourceType: 2,
                            quality: 100,
                            pictureNum: 1,
                            destinationType: 1,
                            // edit:true,
                            success: function (res) {
                                getPicSuccess(res)
                            },
                            error: function (res) {
                                if (res.code == "56002") {
                                    cmp.notification.alert(fI18nData['search.m3.h5.authority1']);
                                }
                            }
                        },
                        actionCMPApi:'cmp.camera.getPictures',
                        inputType: 'picture'
                    }, {
                        key: "1",
                        name: m3i18n[cmp.language].photograph,    //拍照
                        config: {
                            sourceType: 1,
                            quality: 100,
                            destinationType: 1,
                            edit: true,
                            success: function (res) {
                                getPicSuccess(res)
                            },
                            error: function (res) {
                                if (res.code == "56002") {
                                    cmp.notification.alert(fI18nData['search.m3.h5.authority1']);
                                }
                            }
                        },
                        actionCMPApi:'cmp.camera.getPictures',
                        inputType: 'photo'
                    }];
                    if(msg.data.allowUpdateAvatar == "disable"){
                        items = [{
                            key: "3",
                            name: fI18nData['search.m3.h5.LookbigPicture']   //查看大图
                        }];
                    }
                    cmp.dialog.actionSheet(items, m3i18n[cmp.language].cancel, function (item) {
                        if (item.key == "1") {
                            if (msg.data.allowUpdateAvatar == "disable"){
                                if (!networkState) {
                                    cmp.notification.toast(fI18nData["search.m3.h5.notLoadHead"], 'center');
                                    return;
                                }
                                _readFile(id);
                            }else{
                                cmp.camera.getPictures({
                                    sourceType: 1,
                                    quality: 100,
                                    destinationType: 1,
                                    edit: true,
                                    success: function (res) {
                                        getPicSuccess(res)
                                    },
                                    error: function (res) {
                                        if (res.code == "56002") {
                                            cmp.notification.alert(fI18nData['search.m3.h5.authority1']);
                                        }
                                    }
                                });
                            }
                            
                        } else if (item.key == "2") {
                            cmp.camera.getPictures({
                                sourceType: 2,
                                quality: 100,
                                pictureNum: 1,
                                destinationType: 1,
                                // edit:true,
                                success: function (res) {
                                    getPicSuccess(res)
                                },
                                error: function (res) {
                                    if (res.code == "56002") {
                                        cmp.notification.alert(fI18nData['search.m3.h5.authority1']);
                                    }
                                }
                            });
                        } else if (item.key == "3") {
                            if (!networkState) {
                                cmp.notification.toast(fI18nData["search.m3.h5.notLoadHead"], 'center');
                                return;
                            }
                            _readFile(id);
                        }
                    }, function (e) {  //点击取消的回调函数
                    });
                }
            },
            error: function (msg) {
                cmp.notification.toast(fI18nData['search.m3.h5.noConnectServer'], "center");
            }
        });
    }
    //上传修改头像
    function getPicSuccess(res) {
        imgFilePath = res.files[0].filepath;
        if ((res.files[0].type == "jpeg" || res.files[0].type == "png" || res.files[0].type == "gif" || res.files[0].type == "jpg") && parseInt(res.files[0].fileSize) < 5242880) {
            cmp.dialog.loading(true);
            var url = "";
            if(wechatSystem){
                url = m3.curServerInfo.url + "/seeyon/rest/attachment?token=&firstSave=true&applicationCategory=13&option.n_a_s=1";
            }else{
                url = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/attachment?token=&firstSave=true&applicationCategory=13&option.n_a_s=1"
            }
            cmp.att.upload({ //附件上传接口
                url: url,
                fileList: [{
                    filepath: imgFilePath //单个文件路径
                }],
                progress: function (result) {
                },
                success: function (uploadRes) {
                    var fileUrl = {
                        "fileId": JSON.parse(uploadRes.response).atts[0].fileUrl
                    };
                    var responseParse = JSON.parse(uploadRes.response);
                    var date = responseParse.atts[0].createdate;
                    if(wechatSystem){
                        var uploadPicUrl = m3.curServerInfo.url + "/seeyon/rest/m3/individual/modifyportrait";
                    }else{
                        var uploadPicUrl = m3.curServerInfo.url + "/mobile_portal/seeyon/rest/m3/individual/modifyportrait";
                    }
                    
                    var resAttsData = responseParse.atts[0];
                    $(".person_head").attr("img-data", '{"fileUrl":"' + resAttsData.fileUrl + '","filename":"' + resAttsData.filename + '","id":"' + resAttsData.id + '","createdate":"' + resAttsData.createdate + '"}');
                    m3Ajax({
                        url: uploadPicUrl,
                        m3CatchError: false,
                        data: JSON.stringify(fileUrl),
                        setCache: {
                            isShowNoNetWorkPage: false
                        },
                        success: function (msg) {
                            cmp.dialog.loading(false);
                            if ("200" == msg.code) {
                                var modifyHead = m3.userInfo.getCurrentMember().iconUrl + "1"; //防止缓存,每次修改头像改变url
                                m3.userInfo.setPic(modifyHead);
                                $(".person_head").css({
                                    "background-image": "url('" + (modifyHead) + "')",
                                    "background-size": "cover",
                                    "background-position": "center center"
                                });
                                cmp.webViewListener.fire({type: "com.seeyon.m3.my.changeIcon", data: [1]});
                            }
                        },
                        error: function (msg) {
                            cmp.dialog.loading(false);
                        }
                    });
                },
                error: function (error) {
                    cmp.dialog.loading(false);
                    cmp.notification.toast(m3i18n[cmp.language].uploadPicFailed, "center");
                }
            });
        } else {
            cmp.notification.toast(m3i18n[cmp.language].uploadPicTip, "center");
        }
    }
    //水印效果
    function watermark(userName, accShortName, date, info) {
        /* {
            水印内容：
                "materMarkNameEnable" : "false",    姓名
                "materMarkDeptEnable" : "true",     单位
                "materMarkTimeEnable" : "false",    时间
            是否设置水印：
                "materMarkEnable" : "true"
            }*/
        console.log(info)
        // var info = m3.userInfo.getCurrentMember();
        if (info.materMarkEnable == "true" && info.materMarkAddressBookEnable == "true") {
            var name = "";
            var dept = "";
            var time = "";
            if (info.materMarkNameEnable == "true") {
                name = userName;
            }
            if (info.materMarkDeptEnable == "true") {
                dept = accShortName;
            }
            if (info.materMarkTimeEnable == "true") {
                time = date;
            }
            var watermarkUrl = cmp.watermark({
                userName: name,
                department: dept,
                date: time
            }).toBase64URL();

            $("ul").css({
                "background-image": "url(" + watermarkUrl + ")",
                "background-repeat": "repeat",
                "background-position": "0% 0%",
                "background-size": "200px 100px"
            });
        }
    }
    //通讯录水印 时间
    function getDate() {
        var date = new Date;
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }
        var day = date.getDate();
        if (day < 10) {
            day = '0' + day;
        }
        var dateStr = year + "-" + month + "-" + day;
        return dateStr
    }
    //左上角返回按钮
    function backBtn() {

        $(".backBtn").on("tap", function () {
            if (!cmp.href.getParam() && getParam("from") && getParam("from") == "uc") {
                cmp.closeWebView();
            } else {
                cmp.href.back(isFormPersonShunt ? 2 : undefined);
            }
        });
        //安卓自带返回键
        document.addEventListener("backbutton", function () {
            cmp.href.back(isFormPersonShunt ? 2 : undefined);
        });
    }
    //查看大图
    function _readFile(id) {
        if(wechatSystem){
            var url = m3.curServerInfo.url + '/seeyon/rest/orgMember/avatar/' + id +'?timesp='+new Date().getTime();
        }else{
            var url = m3.curServerInfo.url + '/mobile_portal/seeyon/rest/orgMember/avatar/' + id +'?timesp='+new Date().getTime();
        }
        function touchHoldCall(headerUrl){
            //提示框
            var items = [{
                key: "1",
                name: fI18nData["search.m3.h5.savePicture"]
            }];
            cmp.dialog.actionSheet(items, m3i18n[cmp.language].cancel, function (item) {
                if (item.key == "1") {
                    cmp.att.download({
                        url: headerUrl,
                        title: "user-head.png",
                        progress: function (result) {
                            //do something with progress result
                        },
                        success: function (result) {
                            cmp.notification.toast(fI18nData["search.m3.h5.saveSuccess"], "center");
                        },
                        error: function (e) {
                            console.log(e)
                        }
                    });
                }
            });
        }
        var contentDiv = $('<div class="person-view-userimg cmp-user-select-none"><span class="see-icon-picture"></span></div>')[0];
        var imgHtml = $('<img class="user-maximg" id="userlogoimg"/>')[0];
        document.body.appendChild(contentDiv);
        imgHtml.src = url;
        imgHtml.onload = function () {
            $(contentDiv).html('').append(imgHtml);
            if (contentDiv) {
                cmp.event.touchHold(userlogoimg, function (e) {
                    e.stopPropagation();
                    touchHoldCall(url);
                }, false);
            }
        };
        imgHtml.onerror = function () {
            var headerUrl = "http://commons.m3.cmp/v/imgs/header.png";
            imgHtml.src = headerUrl;
            $(contentDiv).html('').append(imgHtml);
            if (contentDiv) {
                cmp.event.touchHold(userlogoimg, function (e) {
                    e.stopPropagation();
                    touchHoldCall(headerUrl);
                }, false);
            }
        };
        contentDiv.addEventListener("tap", function () {
            contentDiv.remove();
        }, false);
        
    };
    // 打电话发短信集合--事件操作
    function eventCall(data) {
        var datas = {
            "officeNumber": data.officeNumber,
            "userNameStr": data.name,
            "phoneNumber": data.tel,
            "officeNumber": data.officeNumber,
            "email": data.email,
            "faceUrl": data.iconUrl
        }
        var officeNumber = datas.officeNumber,
            userNameStr = datas.userNameStr,
            phoneNumber = datas.phoneNumber,
            officeNumber = datas.officeNumber,
            email = datas.email,
            faceUrl = datas.faceUrl;
        //发协同
        $('#callaffair').on("tap", function () {
            var url = "/seeyon/m3/apps/v5/collaboration/html/newCollaboration.html";
            cmp.href.next(url,{openFrom: "newCollaboration", members: id});
        });
        if(!wechatSystem){ //微协同不允许执行原生事件
            //发短信
            $("#telSMS").on("tap", function () {
                if ($(this).hasClass('disable')) return;
                var items = [{
                    key: "1",
                    name: m3i18n[cmp.language].sendMessage
                }];
                cmp.dialog.actionSheet(items, m3i18n[cmp.language].cancel, function (item) {
                    if (item.key == "1") {
                        cmp.tel.sms({
                            phoneNum: phoneNumber // 手机号码
                        }, function (success) {
                        }, function (error) {
                            //没有权限，弹出提示
                            cmp.notification.toast(m3i18n[cmp.language].NoPermissions, "center");
                        });
                    }
                });
            });
            /*点击列表中工作电话、手机、邮箱操作*/
            //拨打工作电话
            $("#officeNumberPhone").on("tap", function () {
                if (officeNumber) {
                    var items = [{
                        key: "1",
                        name: m3i18n[cmp.language].callOfficePhone //拨打工作电话
                    }, {
                        key: "2",
                        name: m3i18n[cmp.language].Copy
                    }];

                    cmp.dialog.actionSheet(items, m3i18n[cmp.language].cancel, function (item) {
                        if (item.key == "1") {
                            cmp.tel.call({
                                phoneNum: officeNumber
                            }, function (success) {
                            }, function (error) {
                                //没有权限，弹出提示
                                cmp.notification.toast(m3i18n[cmp.language].NoPermissions, "center");
                            });
                        } else if (item.key == "2") {
                            cmp.pasteboard.setString({value: officeNumber});
                            cmp.notification.toast(m3i18n[cmp.language].CopySuccess, "center");

                        }
                    });
                }
            });
            //拨打手机
            $("#telPhone").on("tap", function () {
                if (phoneNumber && (phoneNumber != "******")) {
                    var items = [{
                        key: "1",
                        name: m3i18n[cmp.language].callPhone //拨打手机
                    }, {
                        key: "2",
                        name: m3i18n[cmp.language].Copy //复制
                    }];
                    cmp.dialog.actionSheet(items, m3i18n[cmp.language].cancel, function (item) {
                        if (item.key == "1") {
                            cmp.tel.call({
                                phoneNum: phoneNumber
                            }, function (success) {
                            }, function (error) {
                                //没有权限，弹出提示
                                cmp.notification.toast(m3i18n[cmp.language].NoPermissions, "center");
                            });
                        } else if (item.key == "2") {
                            //复制手机号到剪贴板
                            cmp.pasteboard.setString({value: phoneNumber});
                            cmp.notification.toast(m3i18n[cmp.language].CopySuccess, "center");

                        }
                    }, function (e) { //点击取消的回调函数
                    });
                }
            });
            //发邮件
            $("#email").on("tap", function () {
                if (email) {
                    var items = [{
                        key: "1",
                        name: m3i18n[cmp.language].sendEmail
                    }, {
                        key: "2",
                        name: m3i18n[cmp.language].Copy
                    }];
                    cmp.dialog.actionSheet(items, m3i18n[cmp.language].cancel, function (item) {
                            if (item.key == "1") {
                                cmp.mail.send({
                                    receiver: email,
                                    bodystr: '',
                                    attname: '',
                                    attdata: '',
                                    success: null,
                                    error: null
                                })
                            } else if (item.key == "2") {
                                //复制手机号到剪贴板
                                cmp.pasteboard.setString({value: email});
                                cmp.notification.toast(m3i18n[cmp.language].CopySuccess, "center");

                            }
                        },
                        //点击取消的回调函数
                        function (e) {
                        });
                }
            });
        }
        

    }
    
})();