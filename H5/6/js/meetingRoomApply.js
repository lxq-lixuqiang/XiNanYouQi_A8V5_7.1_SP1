var urlParam;
var cacheKey_mcStorageDatas = "m3_v5_meeting_meetingCreate_datas"; //缓存当前已经录入的数据，离开页面返回后回现
var cacheKey_mcBackDatas = "m3_v5_meeting_meetingCreate_backDatas"; //其他页面返回时，需要带回的数据

var cacheKey_mrQueryParams = "m3_v5_meeting_meetingRoomList_queryParams"; //会议室申请列表所需查询条件
var meeting_list_type_cache_key= "m3_v5_meeting_list_type"; //首页页面缓存值，需要与首页相同
var cacheKey_mrAppParams = "m3_v5_meeting_meetingModify_meetingRoomAppQueryParams"; //old会议室申请信息（判断会议室申请是否改变）
var pageX = {};
pageX.cache = {};
pageX.postData = {};
pageX.fileComponent = null;
pageX.cache.datas = {};

/**
 * 接收参数描述
 * startDate   开始时间    yyyy-MM-dd
 * endDate     结束时间    yyyy-MM-dd
 * action      执行动作
 *     applyMeetingRoom   申请会议室
 *     createMeeting      新建会议
 *     formChoose		  自定义控件选择会议室
 * roomId      会议室ID
 * cacheKey_mrlStorgeDatas    缓存key，会议室列表查询条件，申请通过后需要清除此缓存
 * cacheKey_mrocStorageDatas  缓存key，占用情况存储的数据，申请后需要清除
 * cacheKey_mcBackDatas       缓存key，申请会议室时，跳转过来后需要返回的数据
 */

//会议室界面tab页签缓存key
var mrlistKey = "m3_v5_meeting_room_list_type";

//注册缓加载
function _registLazy(){
    
      LazyUtil.addLazyStack({
          "code" : "lazy_cmp",
          "css" : [
                   _cmpPath + "/css/cmp-picker.css" + $verstion,
                   _cmpPath + "/css/cmp-accDoc.css" + $verstion,
                   _cmpPath + "/css/cmp-att.css" + $verstion,
                   _cmpPath + "/css/cmp-search.css" + $verstion,
                   _cmpPath + "/css/cmp-selectOrg.css" + $verstion,
				   _cmpPath + "/css/cmp-listView.css" + $verstion,
				   _cmpPath + "/css/cmp-dateCalender.css" + $verstion
                   ],
          "js" : [
                  _cmpPath + "/js/cmp-picker.js" + $verstion,
				  _cmpPath + "/js/cmp-popPicker.js" + $verstion,
				  _cmpPath + "/js/cmp-dateCalender.js" + $verstion,
				  _cmpPath + "/js/cmp-dtPicker-calender.js" + $verstion,
                  _cmpPath + "/js/cmp-dtPicker.js" + $verstion,
                  _cmpPath + "/js/cmp-accDoc.js" + $verstion,
                  _cmpPath + "/js/cmp-att.js" + $verstion,
                  _cmpPath + "/js/cmp-search.js" + $verstion,
                  _cmpPath + "/js/cmp-selectOrg.js" + $verstion,
                  _cmpPath + "/js/cmp-emoji.js" + $verstion,
                  _cmpPath + "/js/cmp-listView.js" + $verstion,
                  _common_v5_path + "/widget/SeeyonAttachment.s3js" + $verstion
                  ]
      });
  }

cmp.ready(function () {
	//注册懒加载
    _registLazy();
	urlParam = cmp.href.getParam();
	initPageBack();
	cmp.i18n.init(_meetingPath+"/i18n/", "MeetingResources", function() {
		setPageTitle(cmp.i18n("meeting.meetingRoomApply.application"));
		initPageData();
		initEvent();
	},meetingBuildVersion);
//	中国石油天然气股份有限公司西南油气田分公司  【增加申请人，申请部门，联系方式，参会领导预计人数，会议用品字段】  lixuqiang 2020年5月7日 start
	var cache = cmp.storage.get(cacheKey_mcStorageDatas, true);
	if(cache== null){
		$s.Meeting.create({}, {}, {
			success : function(result) {
				var userInfo = new Array();
				userInfo.push({
					id : result.userId,
					name : result.userName,
					type : "Member"
				});
				cmp.storage.save("m3_v5_meeting_selectOrg_bachCache_applicant", cmp.toJSON(userInfo), true);
				cmp.storage.save("m3_v5_meeting_selectOrg_bachCache_except_applicant", cmp.toJSON(""), true);
				_$("#applicant").value = result.userName;
				_$("#applicant_value").value = result.userId;
				_$("#applicantDepartment").value = result.userDepartment;
				_$("#appPerName").value = result.userPhone;
				loadMeetingTools();
			},
	        error : function(result){
	        	//处理异常
	        	MeetingUtils.dealError(result);
	        }
		});
	}
	
	//设置缓存数据
	setCacheDatas();
});

//返回页面时获取缓存数据
function getCache(){
	//获取跳转页面前的缓存
	var cache = cmp.storage.get(cacheKey_mcStorageDatas, true);
	if (cache!=null) {
		pageX.cache = cmp.parseJSON(cache);
	}
	cmp.storage["delete"](cacheKey_mcStorageDatas, true);
	
	//获取其他页面返回的数据
	var backDatasCache = cmp.storage.get(cacheKey_mcBackDatas, true);
	if(backDatasCache){
		var temp_backDatasCache = cmp.parseJSON(backDatasCache);
		//视频会议室
		if (temp_backDatasCache.videoRoomId) {
			//视频会议室
			pageX.cache.datas.videoRoomId = temp_backDatasCache.videoRoomId;
			pageX.cache.datas.videoRoomName = temp_backDatasCache.videoRoomName;
			//视频会议室相关参数
			if(temp_backDatasCache.videoRoomStartDate){
				//解析日期与时间
				var startDate = temp_backDatasCache.videoRoomStartDate;
				var p_startDate = startDate.substr(0, 10);
				var p_startDateTime = startDate.substr(11, 5);
				
				pageX.cache.datas.videoRoomStartDate = startDate;
				pageX.cache.datas.startDate = p_startDate;
				pageX.cache.datas.startDatetimeLabel = p_startDateTime;
			}
			if(temp_backDatasCache.videoRoomEndDate){
				//解析日期与时间
				var endDate = temp_backDatasCache.videoRoomEndDate;
				var p_endDate = endDate.substr(0, 10);
				var p_endDateTime = endDate.substr(11, 5);
				
				pageX.cache.datas.videoRoomEndDate = endDate;
				pageX.cache.datas.endDate = p_endDate;
				pageX.cache.datas.endDatetimeLabel = p_endDateTime;
			}
			if (temp_backDatasCache.meetingNature_value) {//会议分类设置为:视频会议
				pageX.cache.datas.meetingNature_value = temp_backDatasCache.meetingNature_value;
			}
		} else if (temp_backDatasCache.roomName) {//普通会议室
			pageX.cache.datas.meetingPlace = temp_backDatasCache.roomName;
			pageX.cache.datas.meetingPlace_value = temp_backDatasCache.roomId;
			pageX.cache.datas.meetingPlace_value1 = temp_backDatasCache.roomappId;
			pageX.meetingPlace_type = temp_backDatasCache.meetingPlace_type;
			//选择会议室类型后，第二次选择的时候直接返回时取值
			pageX.cache.meetingPlace_type = pageX.meetingPlace_type;
			if(temp_backDatasCache.startDate){
				//解析日期与时间
				var startDate = temp_backDatasCache.startDate;
				var p_startDate = startDate.substr(0, 10);
				var p_startDateTime = startDate.substr(11, 5);
				
				pageX.cache.datas.roomAppBeginDate = startDate;
				pageX.cache.datas.startDate = p_startDate;
				pageX.cache.datas.startDatetimeLabel = p_startDateTime;
			}
			if(temp_backDatasCache.endDate){
				//解析日期与时间
				var endDate = temp_backDatasCache.endDate;
				var p_endDate = endDate.substr(0, 10);
				var p_endDateTime = endDate.substr(11, 5);
				
				pageX.cache.datas.roomAppEndDate = endDate;
				pageX.cache.datas.endDate = p_endDate;
				pageX.cache.datas.endDatetimeLabel = p_endDateTime;
			}
		}
		if (typeof(pageX.meetingPlace_type) == "undefined"){
		    //上一次选择的有数据的时候，应该为上一个选择的数据
		    pageX.meetingPlace_type = pageX.cache.meetingPlace_type ? pageX.cache.meetingPlace_type : "mtRoom";
		}
		cmp.storage["delete"](cacheKey_mcBackDatas, true);
	} else if (pageX.meetingPlace_type != "mtPlace"){
	    //上一次选择的有数据的时候，应该为上一个选择的数据
	    pageX.meetingPlace_type = pageX.cache.meetingPlace_type ? pageX.cache.meetingPlace_type : "mtRoom";
	}
	
	//是否展开
	if(MeetingUtils.isNull(pageX.cache.showMore)){
		pageX.cache.showMore = false;
	}else{
		pageX.cache.showMore = pageX.cache.showMore ? false : true;
	}
}

function loadMeetingTools(){
	cmp.ajax({
        url :cmp.seeyonbasepath + '/rest/meetingTools/getAll',
        type: "GET",
        headers: {
            'Accept' : 'application/json; charset=utf-8',
            'Accept-Language' : cmp.language,
            'Content-Type': 'application/json; charset=utf-8',
            'token' : cmp.token,
            'option.n_a_s' : '1'
        },
        success: function(result){
            if(result) {
            	var tempHtml = "";
            	for(var i =0;i<result.length;i++){
            		tempHtml += "<input type='checkbox' id=checked" + i + " name='tools' value="+result[i].id+" /> "+ result[i].name +"<br/>";
            	}
            	document.getElementById("toolsText").innerHTML = tempHtml;
            	console.log(document.getElementById("toolsText"));
            } else {
                alert("请求出错！");
            }
        },
        error: function(error){
            if(!cmp.errorHandler(error)){//错误处理先由cmp平台处理，如果平台处理不了，再使用自己的处理规则
                alert("请求发生错误了");
            }
        }
    });

}
function showHidden(){
	if(document.getElementById("toolsLi").style.display == 'inline'){
		document.getElementById("toolsLi").style.display = 'none';
	}else{
		document.getElementById("toolsLi").style.display = 'inline';
	}
}
//设置申请人
function setApplicantValue(result){
	var  returnId= result[0].id;
	_$("#applicant_value").value = returnId;
	//设置发起部门、联系方式
	cmp.ajax({
        url :cmp.seeyonbasepath + '/rest/meeting/getUserDepartment?id='+returnId,
        type: "GET",
        headers: {
            'Accept' : 'application/json; charset=utf-8',
            'Accept-Language' : cmp.language,
            'Content-Type': 'application/json; charset=utf-8',
            'token' : cmp.token,
            'option.n_a_s' : '1'
        },
        success: function(result){
        	_$("#applicantDepartment").value = result.userDepartment;
			_$("#appPerName").value = result.userPhone;
        },
        error: function(error){
            if(!cmp.errorHandler(error)){//错误处理先由cmp平台处理，如果平台处理不了，再使用自己的处理规则
                alert("请求发生错误了");
            }
        }
    });
	
	//处理互斥情况
	dealCache();
}
function dealCache(){
	var cache_conferees = cmp.storage.get("m3_v5_meeting_selectOrg_bachCache_conferees", true);//参会人
	var cache_applicant = cmp.storage.get("m3_v5_meeting_selectOrg_bachCache_applicant", true);
	
	var hideObj_conferees = MeetingUtils.mergeArray(cmp.parseJSON(cache_conferees), {});
	addExceptStyle(hideObj_conferees);
	cmp.storage.save("m3_v5_meeting_selectOrg_bachCache_except_conferees", cmp.toJSON(hideObj_conferees), true);

	var hideObj_applicant = MeetingUtils.mergeArray(cmp.parseJSON(cache_conferees), {});
	addExceptStyle(hideObj_applicant);
	cmp.storage.save("m3_v5_meeting_selectOrg_bachCache_except_applicant", cmp.toJSON(hideObj_applicant), true);
}
//中国石油天然气股份有限公司西南油气田分公司  【增加申请人，申请部门，联系方式，参会领导预计人数，会议用品字段】  lixuqiang 2020年5月7日 end


function initPageBack() {
	//cmp控制返回
    cmp.backbutton();
    cmp.backbutton.push(_goBack);
}

function _goBack() {
	cmp.href.back();
}

function initPageData(){
	_$("#romeName").innerHTML = urlParam.roomName;
	_$("#startDate").value = urlParam.startDate.substr(0, 10);
	_$("#startDatetimeLabel").value = urlParam.startDate.substr(11, 5);
	_$("#endDate").value = urlParam.endDate.substr(0, 10);
	_$("#endDatetimeLabel").value = urlParam.endDate.substr(11, 5);
	
	if(urlParam.action == "createMeeting" || urlParam.action == "formChoose"){
		_$(".apply_wrap").remove();
	}else{
		setAttValue("description", "placeholder", cmp.i18n("meeting.meetingRoomApply.inputDescription"));
	}

}

function initEvent(){
	cmp.event.click(document.querySelector("#applyBtn"), submitForm);
	
	cmp.event.click(document.querySelector("#showStartDate"), cmpData_start);
	cmp.event.click(document.querySelector("#showEndDate"), cmpData_end);
	
	_$("#applicant").addEventListener("tap", function(){
		MeetingUtils.selectOrg("applicant", setApplicantValue, {
			showBusinessOrganization:true,
			maxSize : 1,
			minSize : 1,
			selectType:"member",
			type:2
		})
	});
	_$("#leader").addEventListener("tap", function(){
		MeetingUtils.selectOrg("leader", setLeaderValue, {
			showBusinessOrganization:true,
			selectType:"member",
			type:2
		})
	});
}
function setLeaderValue(result){
	var tempHtml = "";
	for(var i = 0 ; i < result.length ; i++){
		tempHtml += result[i].type + "|" + result[i].id + ",";
	}
	tempHtml = tempHtml.substr(0, tempHtml.length -1);
	_$("#leader_value").value = tempHtml;
	
	//处理互斥情况
	dealCache();
}
//设置缓存中的数据
function setCacheDatas(){
	getCache();
	//还原所有输入数据
	for(var key in pageX.cache.datas){
		//客开 胡超
		if(_$("#" + key)){
			_$("#" + key).value = pageX.cache.datas[key];
		}
	}
	
	var cacheKey = new Array("applicant");
	cmp.storage.save("m3_v5_meeting_selectOrg_bachCacheKey", cmp.toJSON(cacheKey), true);
}

function cmpData_start(){
	cmpData("startDate");
}
function cmpData_end(){
	cmpData("endDate");
}
//调用日期组件
function cmpData(id){
	var options = {
		type : "",
		MinutesScale : "5",
		value : _$("#" + id).value + " " + _$("#"+id+"timeLabel").value
	};
	var picker = new cmp.DtPicker(options);
	picker.show(function(rs) {
		_$("#"+id).value = rs.value.substr(0, 10);
		_$("#"+id+"timeLabel").value = rs.value.substr(11, 5);
		picker.dispose();
	});
}

var isSubmit = false;
function submitForm() {
	var reg= /^[1-9]\d*$/;
	var num = _$("#number").value;
	if(num==null || num==""){
		createAlter("请填写预计人数！", null);
		return true;
	}
	if(!reg.test(num)){
		createAlter("预计人数必须是正整数！", null);
		return true;
	}
	
	//防止重复点击
	if(isSubmit){
		return;
	}
	isSubmit = true;
	
	var action = urlParam.action;
	var p_startDate = _$("#startDate").value + " " + _$("#startDatetimeLabel").value;
	var p_endDate = _$("#endDate").value + " " + _$("#endDatetimeLabel").value;

	if(action == "createMeeting"){
		if(Date.parse(new Date()) > Date.parse(new Date(p_startDate.replace(/\-/g, "/")))){
			createAlter(cmp.i18n("meeting.meetingRoomList.beforeNowTime"));
			isSubmit = false;
			return;
		}
		
		var meetingCreateCache = {
			roomId : urlParam.roomId,
			roomName : urlParam.roomName,
			startDate : p_startDate,
			endDate : p_endDate,
			meetingPlace_type : "apply"
		};
		cmp.storage.save(urlParam.cacheKey_mcBackDatas, cmp.toJSON(meetingCreateCache), true);

		//清空查询条件缓存
		cmp.storage["delete"](urlParam.cacheKey_mrlStorgeDatas, true);
		//清空占用情况页面缓存
		cmp.storage["delete"](urlParam.cacheKey_mrocStorageDatas, true);
		
		cmp.href.back(3);
		return;
	} else if (action == "formChoose") {
		if(Date.parse(new Date()) > Date.parse(new Date(p_startDate.replace(/\-/g, "/")))){
			createAlter(cmp.i18n("meeting.meetingRoomList.beforeNowTime"));
			isSubmit = false;
			return;
		}
		
		//清空查询条件缓存
		cmp.storage["delete"](urlParam.cacheKey_mrlStorgeDatas, true);
		//清空占用情况页面缓存
		cmp.storage["delete"](urlParam.cacheKey_mrocStorageDatas, true);
		
		var cacheValue = {};
		var roomId = urlParam.roomId;
		var roomNeedApp = urlParam.roomNeedApp;
		var display = urlParam.roomName+"("+p_startDate+"--"+p_endDate+")";//表单展示值
		var value = urlParam.roomName+","+roomNeedApp+","+p_startDate+","+p_endDate+","+roomId;//表单保存值
		cacheValue.display = display;
		cacheValue.value = value;
		cmp.storage.save(urlParam.formChooseKey, cmp.toJSON(cacheValue), true);
		
		if(cmp.platform.CMPShell){
			//触发M3webview事件
			cmp.webViewListener.fire({
		        type:"webview_event_chooseMeetingRoom",
		        data:{
		        	display : display,
		        	value : value
		        },
		        success:function(){
		        },
		        error:function(error){
					console.log(error);
		        }
		    });
		    setTimeout(function(){
		    	cmp.href.closePage();
		    },500);
		}else{
			cmp.href.back(3);
		}
		return;
	}
	
	var emojiUtil = cmp.Emoji();
	var discription = emojiUtil.EmojiToString(_$("#description").value);
	
	var obj = document.getElementsByName("tools");  
	var toolIds=''; //存值
	for(var i=0;i<obj.length;i++){
		if(obj[i].checked) 
			toolIds += obj[i].value+',';   
	}
	if(toolIds != ''){
		toolIds = toolIds.substring(0,toolIds.length-1);
	}
	
	var paramData = {
		roomId : urlParam.roomId,
		description : discription,
		startDatetime : p_startDate,
		endDatetime : p_endDate,
		num:num,
		applicantValue:_$("#applicant_value").value,
		applicantDepartment:_$("#applicantDepartment").value,
		leaderValue:_$("#leader_value").value,
		toolIds:toolIds
	};
	
	var temp_empty = checkEmpty();
	if(typeof(temp_empty) != "undefined"){
        createAlter(temp_empty);
		isSubmit = false;
		return;
	}
	
	//用于计算的变量
	var temp_startDate = Date.parse(new Date(p_startDate.replace(/\-/g, "/")));
	var temp_endDate = Date.parse(new Date(p_endDate.replace(/\-/g, "/")));
	var temp_now = Date.parse(new Date());
	
	//校验时间
	if(temp_startDate >= temp_endDate){
        createAlter(cmp.i18n("meeting.meetingRoomApply.checkTime"));
		isSubmit = false;
		return;
	}
	if(temp_startDate <= temp_now){
        createAlter(cmp.i18n("meeting.meetingRoomApply.startTimeError"));
		isSubmit = false;
		return;
	}
	
	$s.Meeting.execApp({}, paramData, {
		success : function(result) {
			if(result["errorMsg"] && result["errorMsg"]!="") {
				createAlter(result["errorMsg"], null);
        		isSubmit = false;
        		return;
			}
			//触发所有webview刷新事件
			MeetingUtils.fireAllWebviewEvent();

			//清空查询条件缓存
			cmp.storage["delete"](urlParam.cacheKey_mrlStorgeDatas, true);
			//清空占用情况页面缓存
			cmp.storage["delete"](urlParam.cacheKey_mrocStorageDatas, true);
			
			if(result["roomAppState"]){
				try{
					var message;
					if(result["roomAppState"] == 0){  // 待审核
						message = cmp.i18n("meeting.meetingRoomApply.publish1");
					}else if(result["roomAppState"] == 1){ // 审核通过
						message = cmp.i18n("meeting.meetingRoomApply.publish");
					}
					createAlter(message, function(){
						if(MeetingUtils.isFromM3NavBar()){
							cmp.href.closePage();
						}else{
							setTimeout(function(){
								cmp.storage.save(mrlistKey,"mrApproveList",true);
								/**
								 * 添加判断如果是ipad就关闭webview
								 */
								cmp.href.isInDetailPad(function(ret){
									if(ret){
										cmp.href.closePage();
									}else{
										cmp.href.replaceNode(_meetingPath + "/html/meetingRoomAdminApproveList.html");
									}
								});
							}, 1)
						}
					});
				}catch(err){
					alert(err);
				}
			}
		},
		error : function(result){
        	//处理异常
        	MeetingUtils.dealError(result);
		}
	});
}

function createAlter(msg, callback){
	cmp.notification.alert(msg, callback, cmp.i18n("meeting.page.dialog.note"), cmp.i18n("meeting.page.dialog.OK"));
}

//检查必录项
function checkEmpty(){
	var empty = cmp.i18n("meeting.meetingRoomApply.empty");
	
	var startDate = _$("#startDate").value;
	if(typeof(startDate) == "undefined" || startDate == ""){
		return cmp.i18n("meeting.meetingRoomApply.startTime") + empty;
	}
	
	var endDate = _$("#endDate").value;
	if(typeof(endDate) == "undefined" || endDate == ""){
		return cmp.i18n("meeting.meetingRoomApply.endTime") + empty;
	}
}

function setAttValue(id, type, value){
	document.getElementById(id).setAttribute(type, value);
}