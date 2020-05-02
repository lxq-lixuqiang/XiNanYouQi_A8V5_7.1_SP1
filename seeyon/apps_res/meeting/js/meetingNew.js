
$(function(){

	initMeetingData();

	initEvent();

	//初始化从栏目过来的情况
	initRoomSectionData();

});

/**
 * 从栏目过来的初始数据
 */
function initRoomSectionData(){
    if(isPortalSection){
        showMTRoomCallback(roomParam);
    }
}

function initMeetingData() {

	initMeetingDefaultValue();

	initAttachmentFromApp();

	initUE();
}

function initMeetingDefaultValue() {

	//会议标题
	$("#title").val(pageX.meeting.title);
	$("#title").attr("title", pageX.html.title);
	$("#title").attr("inputName", pageX.i18n.subjectLabel);
	$("#title").attr("defaultValue", pageX.i18n.subjectDefaultLabel);

	//会议开始结束时间
	$("#beginDate").val(pageX.meeting.beginDate);
	$("#endDate").val(pageX.meeting.endDate);
	$("#beginDate").attr("inputName", pageX.i18n.beginDateLabel);
	$("#endDate").attr("inputName", pageX.i18n.endDateLabel);

	//会议关联项目
	$("#projectId").val(pageX.meeting.projectId);

	//会议类型
	if(!isNull(pageX.meeting.meetingTypeId)) {
		$("#meetingTypeId").val(pageX.meeting.meetingTypeId);
		changeMeetingTypeId();
	}

	//会议方式
	if(!isNull(pageX.meeting.meetingType)) {
		$("#meetingNature").val(pageX.meeting.meetingType);
		if(pageX.meeting.meetingType == "2"){
			changeMeetingNature();
			$("#meetingPassword").val(pageX.meeting.password);
			//$("#meetingPasswordConfirm").val(pageX.meeting.password);
		}
	} else {
		$("#meetingNature").val("0");//默认普通会议
	}

	//会议格式模板
	if(!isNull(pageX.meeting.contentTemplateId)) {
		$("#contentTemplateId").val(pageX.meeting.contentTemplateId);
	} else {
		$("#contentTemplateId").val("-1");
	}

	//会议主持人
	if(pageX.meeting.emceeName == "") {
		$("#emceeName").val(pageX.i18n.emceeDefaultLabel);
	} else {
		$("#emceeName").val(pageX.meeting.emceeName);
	}
	$("#emceeName").attr("title", pageX.meeting.emceeName);
	$("#emceeName").attr("inputName", pageX.i18n.emceeLabel);
	$("#emceeName").attr("defaultValue", pageX.i18n.emceeDefaultLabel);
	
//	中国石油天然气股份有限公司西南油气田分公司  【新建会议时增加“发起者、发起部门、联系方式”字段、发起人字段必填，默认是登录人，可以修改。】  lixuqiang 2020年4月29日 stater
	//发起者
	if(pageX.meeting.userName == "") {
		$("#userName").val(pageX.i18n.userDefaultLabel);
	} else {
		$("#userName").val(pageX.meeting.userName);
	}
	$("#userName").attr("title", pageX.meeting.userName);
	$("#userName").attr("inputName", pageX.i18n.userLabel);
	$("#userName").attr("defaultValue", pageX.i18n.userDefaultLabel);
//	中国石油天然气股份有限公司西南油气田分公司  【新建会议时增加“发起者、发起部门、联系方式”字段、发起人字段必填，默认是登录人，可以修改。】  lixuqiang 2020年4月29日 end

	//会议记录人
	if(pageX.meeting.recorderName == "") {
		$("#recorderName").val(pageX.i18n.recorderDefaultLabel);
	} else {
		$("#recorderName").val(pageX.meeting.recorderName);
	}
	$("#recorderName").attr("title", pageX.meeting.recorderName);
	$("#recorderName").attr("inputName", pageX.i18n.recorderLabel);
	$("#recorderName").attr("defaultValue", pageX.i18n.recorderDefaultLabel);

	//会议参会人
	if(pageX.meeting.confereesNames == "") {
		$("#confereesNames").val(pageX.i18n.confereesDefaultLabel);
	} else {
		$("#confereesNames").val(pageX.meeting.confereesNames);
	}
	$("#confereesNames").attr("title", pageX.meeting.confereesNames);
	$("#confereesNames").attr("inputName", pageX.i18n.confereesLabel);
	$("#confereesNames").attr("defaultValue", pageX.i18n.confereesDefaultLabel);

	//会议告知人
	if(pageX.meeting.impartNames == "") {
		$("#impartNames").val(pageX.i18n.impartDefaultLabel);
	} else {
		$("#impartNames").val(pageX.meeting.impartNames);
	}
	$("#impartNames").attr("title", pageX.meeting.impartNames);
	$("#impartNames").attr("inputName", pageX.i18n.impartLabel);
	$("#impartNames").attr("defaultValue", pageX.i18n.impartDefaultLabel);

	//会议用品
	if(pageX.meeting.resourcesName == "") {
		$("#resourcesName").val(pageX.i18n.resourceDefaultLabel);
	} else {
		$("#resourcesName").val(pageX.meeting.resourcesName);
	}
	$("#resourcesName").attr("title", pageX.meeting.resourcesName);
	$("#resourcesName").attr("inputName", pageX.i18n.resourceLabel);
	$("#resourcesName").attr("defaultValue", pageX.i18n.resourceDefaultLabel);

	if(pageX.meetingRoomApp.id != "") {
		var selectRoomType = document.getElementById("selectRoomType");
		for(var i=0; i<selectRoomType.options.length; i++) {
			var obj = selectRoomType.options[i];
			if(obj.getAttribute("option2Id")==pageX.meetingRoomApp.id) {
				obj.selected = true;
			}
		}
	}

	if(pageX.meeting.id != "") {
		var disabledA = (pageX.periodicity.id != "" && pageX.html.isBatch != "true") || pageX.periodicity.id == "";
		if(disabledA == true) {
			document.getElementById("cycleA").disabled = true;
			document.getElementById("cycleA").style.cssText = "opacity:0.4;";
		}
		if (pageX.periodicity.id != "" && document.getElementById("chooseVideoRoom")) {
			document.getElementById("chooseVideoRoom").disabled = true;
			document.getElementById("chooseVideoRoom").style.cssText = "opacity:0.4;";
		}
	}
	if(pageX.meeting.isSendTextMessages != ""){
		$("#SendTextMessages").val(pageX.meeting.isSendTextMessages);
	}
}


//协同转发附件
function initAttachmentFromApp() {
	var appAffairIdObj = document.getElementById("appAffairId");
	var titleObj = document.getElementById("title");
	if(isNull(appAffairIdObj.value)) {
 		return;
	} else {
	     var type = "2";
	     var filename = titleObj.value;
	     var mimeType = 'collaboration';
	     if(document.getElementById("appName").value=="edoc"){
	    	 mimeType = 'edoc';
		 }
	     var createDate = "2000-01-01 00:00:00";
	     var fileUrl = appAffairIdObj.value;
	     var description = fileUrl;
	     var documentType = mimeType;
	     addAttachment(type, filename, mimeType, createDate, '0', fileUrl, true, null, description, documentType, documentType + ".gif");
	}
}

function initUE() {
	//detailFrame屏蔽
	if(parent.document.getElementById("sx")) {
		parent.document.getElementById("sx").rows="100%,0";
	}

	resetContextHeight();
}

//重新计算正文内容的高度
var _contentHeight = 0;//正文区域高度
function resetContextHeight(){
	try{//设置正文区域TD高度
		var tempTop = getEleTop($("#scrollListMeetingDiv")[0]);

		var cHTML = document.documentElement;
		var cBody = document.body;
		var wClientHeight = Math.max(cBody.offsetHeight, cHTML.clientHeight, cHTML.scrollHeight, cHTML.offsetHeight);

		_contentHeight = wClientHeight - tempTop;
		$("#scrollListMeetingDiv").height(_contentHeight);
		try {
			//正文组件初始化后高度就定了，这里进行重新设置
			$("#RTEEditorDiv,#officeFrameDiv").height(_contentHeight);
			_resizeCkeContent();
      	} catch(e) {}
	}catch(e){}
}

//HTML正文组件高度计算需要进行重新设置，有问题
function _resizeCkeContent() {
	var tempBodyType = document.getElementById('bodyType').value;
	if(tempBodyType == "HTML") {//HTML正文才有问题
		//下面是正文组件高度兼容， 这种代码很水，无赖无其他办法
		var ckeContentClass = $("#cke_content").attr("class");
		if(ckeContentClass && ckeContentClass.length > 0){
			var tempChecNumReg = /cke_(\d+)/ig;
			var d = tempChecNumReg.exec(ckeContentClass);
			if(d) {
				var tempChecNum = d[1];//数值

				var $tempTop = $("#cke_"+tempChecNum+"_top");
				var $tempContent = $("#cke_"+tempChecNum+"_contents");
				if($tempTop && $tempContent && $tempTop.length > 0 && $tempContent.length > 0) {
					var ckeToolBarHeight = $tempTop[0].offsetHeight;
					var contentAreaHeight = _contentHeight - ckeToolBarHeight;
					$tempContent.css("height",contentAreaHeight);
				} else {
					setTimeout(_resizeCkeContent, 300);
				}
			}
		} else {
			setTimeout(_resizeCkeContent, 300);
		}
	}
}

function _insertAttCallback() {
	resetContextHeight();
}

function quoteDocumentCallback(atts) {
	if (atts) {
		deleteAllAttachment(2);
		for (var i = 0; i < atts.length; i++) {
			var att = atts[i]
			addAttachment(att.type, att.filename, att.mimeType, att.createDate,
                  att.size, att.fileUrl, true, false, att.description, null,
                  att.mimeType + ".gif", att.reference, att.category)
		}
	}
  	resetContextHeight();
}


function initEvent() {
	initBtnEvent();
	initInputEvent();
}

function initBtnEvent() {

	$("#send").click(function() {
		sendMeeting();
	});

	$("#save").click(function() {
		saveMeeting();
	});

	$("#saveAs").click(function() {
		saveAsTemplate();
	});

	$("#loadTemplate").click(function() {
		showTemplate();
	});

	$("#selectRoomType").change(function() {
		changeRoomType(this);
	});

	$("#chooseMeetingRoom").click(function() {
		showMTRoom();
	});

	var disabledVideo = (document.getElementById("chooseVideoRoom") && document.getElementById("chooseVideoRoom").disabled);
	if( disabledVideo != true) {
		$("#chooseVideoRoom").click(function() {
			showVideoMTRoom();
		});
	}

	var disabledA = document.getElementById("cycleA").disabled;
	if( disabledA != true) {
		$("#cycleA").click(function() {
			openPeriodicityDialog();
		});
	}

	$("#show_more").click(function() {
		showMore();
	});

}

function initInputEvent() {

	//主持人
	$("#emceeName").focus(function() {
		checkDefSubject($(this)[0], true);
	});
	$("#emceeName").blur(function() {
		checkDefSubject($(this)[0], false);
	});
	$("#emceeName").click(function() {
		selectMtPeople_emcee("emceeSelect", "emcee");
	});
//	中国石油天然气股份有限公司西南油气田分公司  【新建会议时增加“发起者、发起部门、联系方式”字段、发起人字段必填，默认是登录人，可以修改。】  lixuqiang 2020年4月29日 stater
	//发起者
	$("#userName").focus(function() {
		checkDefSubject($(this)[0], true);
	});
	$("#userName").blur(function() {
		checkDefSubject($(this)[0], false);
	});
	$("#userName").click(function() {
		selectMtPeople_user("userSelect", "user");
	});
//	中国石油天然气股份有限公司西南油气田分公司  【新建会议时增加“发起者、发起部门、联系方式”字段、发起人字段必填，默认是登录人，可以修改。】  lixuqiang 2020年4月29日 end

	//记录人
	$("#recorderName").focus(function() {
		checkDefSubject($(this)[0], true);
	});
	$("#recorderName").blur(function() {
		checkDefSubject($(this)[0], false);
	});
	$("#recorderName").click(function() {
		selectMtPeople_recorder("recorderSelect", "recorder");
	});

	//参会人
	$("#confereesNames").focus(function() {
		checkDefSubject($(this)[0], true);
	});
	$("#confereesNames").blur(function() {
		checkDefSubject($(this)[0], false);
	});
	$("#confereesNames").click(function() {
		selectMtPeople_conferees("confereesSelect", "conferees");
	});

	//告知人
	$("#impartNames").focus(function() {
		checkDefSubject($(this)[0], true);
	});
	$("#impartNames").blur(function() {
		checkDefSubject($(this)[0], false);
	});
	$("#impartNames").click(function() {
		selectMtPeople_impart("impartSelect", "impart");
	});

	//会议用品
	$("#resourcesName").focus(function() {
		checkDefSubject($(this)[0], true);
	});
	$("#resourcesName").blur(function() {
		checkDefSubject($(this)[0], false);
	});
	$("#resourcesName").click(function() {
		selectResources();
	});

	//开始结束时间
	$("#beginDate").click(function() {
		selectMeetingTime($(this)[0]);
	});
	$("#endDate").click(function() {
		selectMeetingTime($(this)[0]);
	});

	$("#contentTemplateId").change(function() {
		changeContentTemplate();
	});

	$("#beforeTime").change(function() {
		changeRemindFlag(this);
	});

	$("#meetingTypeId").change(function() {
		changeMeetingTypeId();
	});

	$("#meetingNature").change(function() {
		changeMeetingNature();
	});
	//OA-114491 新建会议，选择已申请的会议室后会议时间没有自动变为会议室的使用时间
    $("#selectRoomType").change(function () {
        changeMeetingTime();
    });

}

function changeMeetingTypeId() {
	var meetingTypeId = $("#meetingTypeId").val();
	if (meetingTypeId == "" || meetingTypeId == "null" || meetingTypeId == null) {
		$("#meetingTypeId").val(-1);
		return;
	}
	var requestCaller = new XMLHttpRequestCaller(this, "ajaxMeetingTypeManager", "getTypeContentString", false);
	requestCaller.addParameter(1, "Long", meetingTypeId);
	var ds = requestCaller.serviceRequest();
	if(ds) {
		$("._extendField").remove();

		var json = eval(ds);

		var table = document.getElementById("contentTable");
		var rowlen = table.rows.length;
		var initlen = 8;//目前table中只有8行
		var count = 4;//从第四行后开始增加
		if (pageX.html.showPasswordArea == "true") {
			count = 5;
		}

		var tr = table.insertRow(count);
		tr.className = "_moreField _extendField";

		var num = 0;
		var td0 = tr.insertCell(num++);

		var len = json.length;
		for(var i=0; i<json.length; i++) {
			var key = json[i];
			var keyInput = document.getElementById("meetingTypeContent_"+key);
			var keyId = keyInput.getAttribute("keyId");
			var keyName = keyInput.getAttribute("keyName");
			var value = keyInput.getAttribute("value");
			var idValue = keyInput.getAttribute("idValue");
			var label = keyInput.getAttribute("label");
			var defaultValue = keyInput.getAttribute("defaultLabel");
			var maxLength = keyInput.getAttribute("maxLength");
			var readOnly = keyInput.getAttribute("readOnly");
			var cursor = keyInput.getAttribute("cursor");

			var typeValue = value;
			if(typeValue == "" || typeValue == "null" || typeValue == null) {
				typeValue = keyInput.getAttribute("defaultLabel");
			}
			var td1 = tr.insertCell(num++);
			td1.className = "bg-gray";
			td1.style.cssText = "width:6%;min-width:60px;";

			var div1 = '<div class="padding_r_5">';
			div1    += keyInput.getAttribute("label");
			div1    += pageX.i18n.colonLabel;
			div1    += '</div>';
			td1.innerHTML = div1;

			var td2 = tr.insertCell(num++);


			if((i+1)%2 == 0) {//第2格
				td2.colSpan = 4;
			} else {
				td2.colSpan = 3;
			}

			if(num == 3) {
				//td2.style.cssText = "padding-right:24px;";
			}
			var input = "";
			if(keyId && keyId!="") {
				input += '<input type="hidden" id="'+ keyId +'" name="' + keyId + '" value="' + idValue + '" />';
			}
			input += '<input type="text"';
			input += ' id="' + keyName + '" name="' + keyName + '" ';
			input += ' value="' + typeValue.escapeQuot() + '" ';
			input += ' defaultValue="' + defaultValue + '" ';
			input += ' inputName="' + label + '"';
			input += ' onfocus="checkDefSubject(this, true)"';
			input += ' onblur="checkDefSubject(this, false)"';
			input += ' maxLength="' + maxLength + '" ';
			input += ' cursor="' + cursor + '" ';
			input += ' class="input-100per" ';

			if(readOnly == "true") {
				input += ' readOnly="' + readOnly + '" ';
			}
			input += " />";

			var div2 = '<div class="common_txtbox_wrap">';
			div2    += input;
			div2    += '</div>';

			td2.innerHTML  = div2;

			if((i+1)%2 == 0) {//第2格
				var td_last = tr.insertCell(num++);
				td_last.colSpan = 2;
				num = 0;

				tr = table.insertRow(++count);
				tr.className = "_moreField _extendField";

				var td0 = tr.insertCell(num++);
			}
		}
		if((len + 1)%2 == 0) {
			var td_last1 = tr.insertCell(num++);
			td_last1.colSpan = 6;
		}

		if($("#leaderNames")) {
			$("#leaderNames").click(function() {
				selectMtPeople_leader("leaderSelect", "leader");
			});
		}
		if($("#notice")) {
			$("#notice").click(function () {
				openNoticeDialog();
			});
		}
		if($("#plan")) {
			$("#plan").click(function () {
			    //仅为了避免会议议程弹出后，新建页面的光标显示在会议议程输入框中，没有其他实际意义
			    document.getElementById("title").focus();
				openPlanDialog();
			});
		}
	}
	resetContextHeight();
}

function changeMeetingTime() {
    var objS = document.getElementById("selectRoomType");
    var index = objS.selectedIndex;
    var value = objS.options[index].value;
    var text = objS.options[index].text;
    var option2id = objS.options[index].getAttribute("option2id");
    var textArray = new Array();
    var beginTime = "";
    var endTime = "";

    //选择已申请的会议室
    if (value != "mtRoom" && value != "mtPlace" && text != "") {
        textArray = text.split(" -- ");
        beginTime = textArray[0].substr(textArray[0].lastIndexOf("(")+1, textArray[0].length);
        endTime = textArray[1].split(")")[0];

        $("#beginDate").val(beginTime);
        $("#endDate").val(endTime);
        $("#roomAppBeginDate").val(beginTime);
        $("#roomAppEndDate").val(endTime);
        $("#roomId").val(value);
        $("#roomAppId").val(option2id);
    }
}

function changeMeetingNature() {
	var passwordArea = document.getElementById("passwordArea");
	if(passwordArea) {
		var className = passwordArea.getAttribute("class");
		if($("#meetingNature").val() == "1") {
			if(!className || className=="" || className.indexOf("hidden") < 0) {
				$("#passwordArea").addClass("hidden");
			}
		} else {
			if(className && className.indexOf("hidden") >= 0) {
				$("#passwordArea").removeClass("hidden");
			}
		}
	}
}

var shh_st = 0;
var shh_h = 26;
function showMore() {
	var className = $(".newinfo_more").attr("class");
    switch (shh_st) {
		case 0:
			if(className!=null && className.indexOf("hidden")) {
				$(".newinfo_more").removeClass("hidden");
				$("._moreField").show();
                $("#show_more span").removeClass("arrow_2_b");
                $("#show_more span").addClass("arrow_2_t");
                resizeFckeditor();
                setTimeout(function(){
                	resetContextHeight();
                }, 300);
			}
	        break;
	    case 1:
			if(className!=null && className.indexOf("hidden")) {
				$(".newinfo_more").addClass("hidden");
				$("._moreField").hide();
                $("#show_more span").removeClass("arrow_2_t");
                $("#show_more span").addClass("arrow_2_b");
                resizeFckeditor();
                setTimeout(function(){
                	resetContextHeight();
                }, 300);
			}
	        break;
	}
	shh_st == 0 ? shh_st = 1 : shh_st = 0;
}

//打开调用模板页面
function showTemplate() {
	var url = "meeting.do?method=openTemplateDialog"+getUrlSurffix();
	openMeetingDialog(url, v3x.getMessage("meetingLang.meeting_dialog_title0"), 520, 350, function(templateId) {
		showTemplateCallback(templateId);
	});
}
function showTemplateCallback(templateId) {
	var dataForm = document.getElementsByName("dataForm")[0];
	if (getA8Top().isCtpTop == undefined || getA8Top().isCtpTop == "undefined") {
		document.getElementById('isOpenWindow').value = "true";
    }
	dataForm["templateId"].value = templateId;
	dataForm.target = "";
	dataForm["openFrom"].value = "chooseTemplate";
	dataForm["method"].value = "create";

	dataForm.submit();
}

function changeRoomType(_this) {
	if($(_this).val() == "mtPlace") {
        /**
		 * 不允许输入会议地点
         */
		if(!pageX.isMeetingPlaceInputAble){
			return;
		}
		var mtPlaceText = $(_this).find("option:selected").text();
		if(mtPlaceText && mtPlaceText.indexOf($("#mtPlaceDefaultText").val()) == -1){
			$("#meetingPlace").val(mtPlaceText);
		}
		var url = "meeting.do?method=openAddressDialog&meetingPlace="+encodeURI($("#meetingPlace").val()) + CsrfGuard.getUrlSurffix();
		openMeetingDialog(url, v3x.getMessage("meetingLang.meeting_dialog_title1"), 350, 230, function(meetingAddress) {
			meetingAddressChangeCallback(meetingAddress);
		});
	} else {
		if(!checkPeriodicityRoomApp()) {
			//清空会议室选择
			$("#roomId").val("");
			$("#roomNeedApp").val("");
			$("#roomAppBeginDate").val("");
			$("#roomAppEndDate").val("");
			$("#roomAppId").val("");
			$("#selectRoomType").find("option").eq(0).attr("selected", true);
			$("#selectRoomType").find("option").eq(0).val("mtRoom");
			$("#selectRoomType").find("option").eq(0).attr("option2Id", null);
			$("#selectRoomType").find("option").eq(0).html(pageX.i18n.roomDecription);
		}
		$("#meetingPlace").val("");
	}
}
function meetingAddressChangeCallback(meetingAddress){
	if(meetingAddress && meetingAddress!="") {
		$("#meetingroomId").val("");
		$("#meetingPlace").val(meetingAddress);
		$("#selectRoomType").find("option:selected").html(meetingAddress);
	}
}

//使用会议格式
function changeContentTemplate() {
	var bodyType = $("#bodyType").val();
	hideOfficeOcx();
	if(confirm(v3x.getMessage("meetingLang.load_text_sure"))) {
		var dataForm = document.getElementsByName("dataForm")[0];
		if (getA8Top().isCtpTop == undefined || getA8Top().isCtpTop == "undefined") {
			document.getElementById('isOpenWindow').value = "true";
	    }
		saveAttachment();
		dataForm.target = "";
		dataForm["openFrom"].value = "chooseContent";
		dataForm["method"].value = "create";
		dataForm["portalRoomAppId"].value = pageX.html.portalRoomAppId;
		dataForm.submit();
	}else{
		$("#contentTemplateId").val(oldContentTemplateId);
	}
	showOfficeOcx();
}

var oldContentTemplateId;
function saveOldContentTemplateId(){
	oldContentTemplateId = $("#contentTemplateId").val();
}

function changeRemindFlag(obj) {
	var optionsValue;
	for(var i=0; i<obj.options.length; i++){
		if(obj.options[i].selected){
			optionsValue = obj.options[i].value;
			break;
		}
	}
	if(optionsValue == 0){
		document.getElementById("remindFlag").value=false;
	}else{
		document.getElementById("remindFlag").value=true;
	}
}

/** 选择与会资源 **/
function selectResources() {
	var url = 'meeting.do?method=openResourceDialog&type=' + $("#resourcesId").val() + CsrfGuard.getUrlSurffix();
	openMeetingDialog(url, pageX.i18n.resourceLabel, 400, 320, function(elements) {
		selectResourcesCallback(elements);
	});
}
function selectResourcesCallback(elements){
	if(elements != null) {
		$("#resourcesId").val(getIdsString(elements, false));
		$("#resourcesName").val(getNamesString(elements, true));
	}
}

function showVideoMTRoom () {
	var w = 1177;
	var h1 = 500;//半个窗口高
	var h2 = 700;//整个窗口高
	var l = (screen.width - w)/2;
	var t = (screen.height - h2)/2;

	var returnMr = "";
	var oldVideoRoomAppId = $("#oldVideoRoomAppId").val();

	if($("#videoRoomId").val()!="" && $("#videoRoomId").val()!="-1") {
		returnMr = $("#videoRoomId").val() + "," + $("#videoRoomAppBeginDate").val() + "," + $("#videoRoomAppEndDate").val()+ "," + oldVideoRoomAppId;
	}
	var url = "meetingroom.do?method=videoMtroom&returnMr="+returnMr+"&from=video&action=create&date="+new Date().getTime()+"&timepams="+$("#beginDate").val();
	if ($("#beginDate").val()!="" && $("#endDate").val()!="") {
		url += "&meetingBeginDate="+$("#beginDate").val()+"&meetingEndDate="+$("#endDate").val();
	}
	url += getUrlSurffix();
	openMeetingDialog(url,pageX.i18n.videoAppLabel, 1177, $("body").height()-60, function(retObj) {
		showVideoMTRoomCallback(retObj);
	});
}

function showVideoMTRoomCallback(retObj){
	if(retObj!=null && ""!=retObj) {
		var strs = retObj.split(",");
	    if(strs.length > 0) {
	    	var roomId = strs[0];
	    	var roomName = strs[1];
	    	var roomAppBeginDate = strs[2];
			var roomAppEndDate = strs[3];
			var roomAppId = "";

			$("#beginDate").val(roomAppBeginDate);
			$("#endDate").val(roomAppEndDate);
			$("#meetingNature").val(2);

			$("#videoRoomId").val(roomId);
			$("#videoRoomName").val(roomName);
			$("#videoRoomAppBeginDate").val(roomAppBeginDate);
			$("#videoRoomAppEndDate").val(roomAppEndDate);

			$("#videoRoom").val(roomName + "(" + roomAppBeginDate + " -- " + roomAppEndDate + ")");
			//显示参会密码
			changeMeetingNature();
    	}
	} else {
		//取消选择视频会议室,清空相关数据
		$("#meetingNature").val(1);

		$("#videoRoomId").val("");
		$("#videoRoomName").val("");
		$("#videoRoomAppBeginDate").val("");
		$("#videoRoomAppEndDate").val("");

		$("#videoRoom").val("");
		changeMeetingNature();
	}
	/*重新计算编辑器及正文区域高度*/
	resizeFckeditor();
    setTimeout(function(){
    	resetContextHeight();
    }, 300);
}

//添加,选择会议室弹出图形化选择界面
function showMTRoom() {
	var w = 1177;
	var h1 = 500;//半个窗口高
	var h2 = 700;//整个窗口高
	var l = (screen.width - w)/2;
	var t = (screen.height - h2)/2;

	var returnMr = "";
	var hasMeetingRoom = "noMeetingroom";
	if($("#roomId").val()!="" && $("#roomId").val()!="-1") {
		returnMr = $("#roomId").val() + "," + $("#roomAppBeginDate").val() + "," + $("#roomAppEndDate").val()+ "," + $("#oldRoomAppId").val();
	}
	var url = "meetingroom.do?method=mtroom&returnMr="+returnMr+"&action=create&meetingId="+$("#id").val()+"&periodicityId="+$("#periodicityId").val()+"&date="+new Date().getTime()+"&timepams="+$("#beginDate").val();
	if ($("#beginDate").val()!="" && $("#endDate").val()!="") {
		url += "&meetingBeginDate="+$("#beginDate").val()+"&meetingEndDate="+$("#endDate").val();
	}
	url += getUrlSurffix();
	openMeetingDialog(url, v3x.getMessage("meetingLang.meeting_meetingRoom_mrApplication"), 1177, $("body").height()-60, function(retObj) {
		showMTRoomCallback(retObj);
	});
}

function showMTRoomCallback(retObj){
	if(retObj!=null && ""!=retObj) {
		var strs = retObj.split(",");
	    if(strs.length > 0) {
	    	var roomId = strs[0];
	    	var roomName = strs[1];
	    	var roomNeedApp = strs[2];
	    	var roomAppBeginDate = strs[3];
			var roomAppEndDate = strs[4];
			var roomAppId = "";

			$("#roomId").val(roomId);
			$("#roomNeedApp").val(roomNeedApp);
			$("#beginDate").val(roomAppBeginDate);
			$("#endDate").val(roomAppEndDate);
			$("#roomAppBeginDate").val(roomAppBeginDate);
			$("#roomAppEndDate").val(roomAppEndDate);
			$("#roomAppId").val(roomAppId);
			$("#meetingPlace").val("");

			$("#selectRoomType").find("option").eq(0).attr("selected", true);
			$("#selectRoomType").find("option").eq(0).val(roomId);
			$("#selectRoomType").find("option").eq(0).attr("option2Id", roomAppId);
			$("#selectRoomType").find("option").eq(0).html(roomName + "(" + roomAppBeginDate + " -- " + roomAppEndDate + ")");
    	}
	}
}

/** 会议周期性设置 **/
function openPeriodicityDialog() {
	var url = 'meeting.do?method=openPeriodicityDialog&periodicityId='+$("#periodicityId").val() + CsrfGuard.getUrlSurffix();
	openMeetingDialog(url, pageX.i18n.cycleTitle, 328, 230, function(returnValue) {
		newPeriodicityCallback(returnValue);
	});
}
function newPeriodicityCallback(returnValue) {
	var i = 0;
	var periodicityType = returnValue[i++];
	var periodicityScope = returnValue[i++];
	var periodicityStartDate = returnValue[i++];
	var periodicityEndDate = returnValue[i++];
	$("#periodicityType").val(periodicityType);
	$("#periodicityScope").val(periodicityScope);
	$("#periodicityStartDate").val(periodicityStartDate);
	$("#periodicityEndDate").val(periodicityEndDate);
	if (periodicityType!="" && periodicityScope!="" && periodicityStartDate!="" && periodicityEndDate!="") {
		$("#category").val(1);//周期会议
		//回填会议室看板回填数据所需参数
		var requestCaller = new XMLHttpRequestCaller(this, "ajaxMeetingPeriodicityManager", "getAllMeetingTimesInPer",false);
		var i=1;
		requestCaller.addParameter(i++, "String", periodicityType);
		requestCaller.addParameter(i++, "String", periodicityScope);
		requestCaller.addParameter(i++, "String", periodicityStartDate);
		requestCaller.addParameter(i++, "String", periodicityEndDate);
		var ds = requestCaller.serviceRequest();
		$("#periodicityDates").val(ds);
	} else {
		$("#category").val(0);//普通会议
		$("#periodicityDates").val("");
		$("#periodicityId").val("");
	}
}

var sendCount = 0;
var checkRoomChangeFlag = true;
var checkPeriodicityDateIsPast = false;//周期会议时间是否发生在过去
function sendMeeting() {
	//客开 胡超 参会人数校验 2020-4-8 start
	var reg= /^[1-9]\d*$/;
	var num = $("#numbers").val()
	if(num==null || $.trim(num)==""){
		alert("请填写预计人数！")
		return;
	}
	if(!reg.test(num)){
		alert("预计人数必须整数！")
		return;
	}
	//客开 胡超 参会人数校验 2020-4-8 end
    sendCount++;
    if(sendCount>1){
        alert(v3x.getMessage("meetingLang.meeting_submit_repeat"));
        return;
    }
    setApplicationButtons(true);
	var theForm = document.getElementsByName("dataForm")[0];

	var currentDate = pageX.html.systemNowDatetime;
	var currentDatetime = Date.parse(currentDate.replace(/\-/g,"/"));

	var beginDate = document.getElementById('beginDate').value;
	var beginDatetime = Date.parse(beginDate.replace(/\-/g,"/"));

	var endDate = document.getElementById('endDate').value;
	var endDatetime = Date.parse(endDate.replace(/\-/g,"/"));

	var roomAppBeginDate = document.getElementById('roomAppBeginDate').value;
	var roomAppBeginDatetime = Date.parse(roomAppBeginDate.replace(/\-/g,"/"));

	var roomAppEndDate = document.getElementById('roomAppEndDate').value;
	var roomAppEndDatetime = Date.parse(roomAppEndDate.replace(/\-/g,"/"));

	setMeetingNutureValue();

	//周期性设置后，不能选择提前审批好的会议室!
	if(!checkPeriodicityRoomApp()) {
	    sendCount = 0;
	    setApplicationButtons(false);
		return;
	}

	//校验密码输入是否满足要求(a-zA-Z0-9@-_*,最大10个字符)
	if(!checkPassword()){
	    sendCount = 0;
	    setApplicationButtons(false);
		return;
	}

	if(!checkForm(theForm)){
	    sendCount = 0;
	    setApplicationButtons(false);
		return false;
	}

	if(!checkMeetingDate()) {
	    sendCount = 0;
	    setApplicationButtons(false);
		return false;
	}

	if(!checkFieldData()) {
	    sendCount = 0;
	    setApplicationButtons(false);
		return false;
	}
	//瞩目视频会议的会议时间是视频会议室使用时间
	if (pageX.meetingVideoRoomApp.isChooseVideoMeetingRoom=="true") {
		var videoRoomAppBeginDate = document.getElementById('videoRoomAppBeginDate').value;
		var videoRoomAppBeginDatetime = Date.parse(videoRoomAppBeginDate.replace(/\-/g,"/"));

		var videoRoomAppEndDate = document.getElementById('videoRoomAppEndDate').value;
		var videoRoomAppEndDatetime = Date.parse(videoRoomAppEndDate.replace(/\-/g,"/"));

		if(!checkMeetingNutureDate(currentDatetime, videoRoomAppBeginDatetime, videoRoomAppEndDatetime)) {
			sendCount = 0;
			setApplicationButtons(false);
			return false;
		}
	} else {
		if(!checkMeetingNutureDate(currentDatetime, beginDatetime, endDatetime)) {
			sendCount = 0;
			setApplicationButtons(false);
			return false;
		}
	}

	if(!checkDateIsPast()) {
	    sendCount = 0;
	    setApplicationButtons(false);
	    checkPeriodicityDateIsPast = false;
		return false;
	}

	if(!checkMeetingRoomUsed(roomAppBeginDate, roomAppEndDate, roomAppBeginDatetime, roomAppEndDatetime)) {
	    sendCount = 0;
	    setApplicationButtons(false);
		return false;
	}

	if(!checkPeriodicityChange()) {
	    sendCount = 0;
	    setApplicationButtons(false);
	    checkRoomChangeFlag = true;
		return false;
	}
	if(checkRoomChangeFlag) {
	    if(!checkMeetingRoomChange()) {
	        sendCount = 0;
	        setApplicationButtons(false);
	        return false;
	    }
	}
	if(!checkPeriodicity4VideoRoom()) {
	    sendCount = 0;
	    setApplicationButtons(false);
		return false;
	}

	if(!checkConfereesConflict(beginDatetime, endDatetime)) {
		return false;
	}

	submitForm();

}

function submitForm() {

	var theForm = document.getElementsByName("dataForm")[0];

	var saveSuccess = meetingSaveOffice();
	if(!saveSuccess){
		return;
	}
	saveAttachment();
	cloneAllAttachments();
	setAttachmentParameter();

	setRoomParameter();

	setFormValueNull();

	if (getA8Top().isCtpTop == undefined || getA8Top().isCtpTop == "undefined") {
		document.getElementById('isOpenWindow').value = "true";
    }
	if (getA8Top().isCtpTop) {
		theForm.target="_self";
	} else {
		theForm.target="hiddenIframe";
	}
	theForm["method"].value = "send";
	theForm.action = theForm.action + "?" + getUrlSurffix();
	theForm.submit();
}

function saveMeeting() {
	//客开 胡超 参会人数校验 2020-4-8 start
	var reg= /^[1-9]\d*$/;
	var num = $("#numbers").val();
	if(num==null || $.trim(num)==""){
		alert("请填写预计人数")
		return;
	}
	if(!reg.test(num)){
		alert("预计人数必须整数！")
		return;
	}
	//客开 胡超 参会人数校验 2020-4-8 end
    sendCount++;
    if(sendCount>1){
        alert(v3x.getMessage("meetingLang.meeting_submit_repeat"));
        return;
    }
    setApplicationButtons(true);
	var theForm = document.getElementsByName("dataForm")[0];

	if(!checkForm(theForm)){
	    sendCount = 0;
	    setApplicationButtons(false);
        return false;
    }

	if(!checkFieldData()) {
	    sendCount = 0;
	    setApplicationButtons(false);
        return false;
    }

	//结束时间不能小于或等于开始时间
    if(!checkMeetingDate()) {
        sendCount = 0;
        setApplicationButtons(false);
        return false;
    }

    var saveSuccess = meetingSaveOffice();
	if(!saveSuccess){
		return;
	}
	saveAttachment();
	cloneAllAttachments();
	setAttachmentParameter();

	setFormValueNull();

	if (getA8Top().isCtpTop == undefined || getA8Top().isCtpTop == "undefined") {
		document.getElementById('isOpenWindow').value = "true";
    }
	if (getA8Top().isCtpTop) {
		theForm.target="_self";
	} else {
		theForm.target="hiddenIframe";
	}
	theForm["method"].value = "save";
	theForm.action = theForm.action + "?" + getUrlSurffix();
	theForm.submit();
}

function meetingSaveOffice(){
	var bodyType = document.getElementById("bodyType");
	if(bodyType) {
		bodyType = bodyType.value;
	    if(bodyType != 'OfficeWord' && bodyType != 'OfficeExcel' && bodyType != 'WpsWord' && bodyType != 'WpsExcel'){
	    	return true;
	    }
	}
	try {
		document.getElementById("content").value = OfficeAPI.getOfficeOcxRecordID();
	} catch(e) {}
	return OfficeAPI.saveOffice();
}

/** 保存模板 **/
function saveAsTemplate() {
    sendCount++;
    if(sendCount>1){
        alert(v3x.getMessage("meetingLang.meeting_submit_repeat"));
        return;
    }
    setApplicationButtons(true);
	var theForm = document.getElementsByName("dataForm")[0];
	//验证标题、与会人、开始时间、结束时间等必填字段
    if(!checkForm(theForm)){
        sendCount = 0;
        setApplicationButtons(false)
        return false;
    }
    //各字段是否包含特殊字符
    if(!checkFieldData()) {
        sendCount = 0;
        setApplicationButtons(false);
        return false;
    }
    //结束时间不能小于或等于开始时间
    if(!checkMeetingDate()) {
        sendCount = 0;
        setApplicationButtons(false);
        return false;
    }

	var requestCaller = new XMLHttpRequestCaller(this, "ajaxMeetingValidationManager", "checkTemplateNameRepeat", false);
	requestCaller.addParameter(1, "String", $("#title").val());
	requestCaller.addParameter(2, "Long", $("#templateId").val());
	var result = requestCaller.serviceRequest();
	if(result == "false") {
		hideOfficeOcx();
		if(window.confirm(v3x.getMessage("meetingLang.template_already_exist_confirm_save", $("#title").val()))) {
			saveMeetingTemplate();
        }else{
        	sendCount = 0;
			showOfficeOcx();
        }
	} else {
		saveMeetingTemplate();
	}
}

/**
 * 执行模版保存或覆盖保存操作
 */
function saveMeetingTemplate(){
	var saveSuccess = meetingSaveOffice();
	if(!saveSuccess){
		return;
	}
	saveAttachment();
	document.getElementById('dataForm').target="hiddenIframe";
	document.getElementById('method').value = "saveAsTemplate";
	document.getElementById('dataForm').action = document.getElementById('dataForm').action + "?" + getUrlSurffix();
	document.getElementById('dataForm').submit();
	sendCount = 0;
	setApplicationButtons(false);
}

/******************************** 校验表单 *********************************/
function checkPeriodicityRoomApp() {

	if(document.getElementById("periodicityType").value != "") {

		if(!checkPeriodicityRoomAppIsCan()) {
			alert(v3x.getMessage("meetingLang.meeting_priodicity_meetingRoom_notChoose"));
			var selectRoomType = document.getElementById("selectRoomType");
			selectRoomType.options[0].selected = true;

			var chooseMeetingRoom = document.getElementById("chooseMeetingRoom");
			if(chooseMeetingRoom) {
				chooseMeetingRoom.disabled = "";
				chooseMeetingRoom.onclick = showMTRoom;
			}
			cleanMeetingParams();//清空之前选择的会议室的参数
			return false;
		}
	}
	return true;
}

function checkPeriodicityRoomAppIsCan() {
	var action = pageX.action;
	var oldRoomAppId = pageX.meeting.roomAppId;
	var roomAppId = getSelectedOption(document.getElementById("selectRoomType")).getAttribute("option2Id");
	if(!isNull(roomAppId)) {
		//新建会议
		if(isNull(oldRoomAppId)) {
			return false;
		}
		//编辑会议(周期会议批量)||会议室看板申请会议室后新建会议
		if(!isNull(oldRoomAppId) && (roomAppId!=oldRoomAppId || action == "create")) {
			return false;
		}
	}
	return true;
}

function checkPeriodicity4VideoRoom() {
	if(pageX.meeting.state!="0" && document.getElementById("category").value == "1") {
		//选择了视频会议室
		if (document.getElementById("videoRoomId").value != "") {
			alert(v3x.getMessage("meetingLang.meeting_priodicity_videoRoom_notChoose"));
			cleanPeriodicityParams();
			return false;
		}

	}

	return true;
}

function checkOldRoomAppNeedCancel() {
	var oldRoomAppId = pageX.meeting.roomAppId;
	if(!isNull(oldRoomAppId)) {
		return false;
	}
	return true;
}

function getSelectedOption(selectObj) {
	var selectRoomType = document.getElementById("selectRoomType");
	for(var i=0; i<selectObj.options.length; i++) {
		var obj = selectObj.options[i];
		if(obj.selected) {
			return obj;
		}
	}
	return "";
}

function cleanMeetingParams(){
	if(document.getElementById("selectRoomType").options) {
		document.getElementById("meetingPlace").value = "";
		document.getElementById("roomId").value = "";
		document.getElementById("roomNeedApp").value = "";
		document.getElementById("roomAppBeginDate").value = "";
		document.getElementById("roomAppEndDate").value = "";
		document.getElementById("roomAppId").value = "";
	}
}

function cleanPeriodicityParams(){
	document.getElementById("periodicityId").value = "";
	document.getElementById("periodicityType").value = "";
	document.getElementById("periodicityScope").value = "";
	document.getElementById("periodicityStartDate").value = "";
	document.getElementById("periodicityEndDate").value = "";
	document.getElementById("periodicityDates").value = "";
	document.getElementById("category").value = "0";
}

function checkMeetingDate() {
	var result = document.getElementById('beginDate').value >= document.getElementById('endDate').value;
	if(result) {
		alert(v3x.getMessage("meetingLang.date_validate"));
		return false;
	}
	return true;
}

function checkSelectConferees(element) {
	if(!isDefaultValue(element)) {
		selectMtPeople_conferees('confereesSelect','conferees');
		return false;
	}
	return true;
}

function checkFieldData() {
	var titleObj = document.getElementById("title");
	if(titleObj && titleObj.value.length > 85) {
		alert(v3x.getMessage("meetingLang.name_validate"));
		return false;
	} else if(titleObj && validateValue(titleObj.value)){
		alert(v3x.getMessage("meetingLang.name_validate_special_char"));//"会议名称不能包含特殊字符（# ￥ % & ~ < > / | \ \" '），请重新录入！"
		return false;
	}

	var selectRoomTypeObj = document.getElementById("selectRoomType");
	var selectRoomTypeText = selectRoomTypeObj.options[selectRoomTypeObj.selectedIndex].text;
	var selectRoomTypeValue = selectRoomTypeObj.options[selectRoomTypeObj.selectedIndex].value;

	var meetingPlaceObj = document.getElementById("meetingPlace");
	if(meetingPlaceObj && selectRoomTypeValue=="mtPlace") {
		if(meetingPlaceObj.value.length == 0) {
			alert(v3x.getMessage("meetingLang.meeting_params_address_notEmpty"));
			return false;
		} else if(meetingPlaceObj.value.lenght > 60) {
			alert(v3x.getMessage("meetingLang.meeting_params_room_name_exceed"));
			return false;
		}
	}

	//验证参会领导，最多35人
	var leaderIdEle = document.getElementById("leader");
	if(leaderIdEle) {
	    var leaderIdVal = leaderIdEle.value;
	    var idArray = leaderIdVal.split(",");
	    if(idArray.length > 35) {//参会领导最大数量为35,请重新选择
	        alert(v3x.getMessage("meetingLang.meeting_alert_create_leaderMaxSize"));
	        return false;
	    }
	}

	var attenderObj = document.getElementById("attender");
	if(_isDefualtValue(attenderObj)){
		attenderObj.value = attenderObj.defaultValue;
	}

	var telObj = document.getElementById("tel");
	if(_isDefualtValue(telObj)){
		telObj.value = telObj.defaultValue;
    }

	return true;
}

function checkMeetingNutureDate(currentDate, beginDate, endDate) {
	if(document.getElementById("meetingNature").value == '2'){
    	if(currentDate > beginDate) {
	       alert(v3x.getMessage("meetingLang.meeting_not_before_now"));
	       return false;
    	}
    	if(currentDate > endDate) {
	       alert(v3x.getMessage("meetingLang.meeting_not_before_now"));
	       return false;
    	}
    }
	return true;
}

function checkPassword(){
	if ($("#meetingPassword").length >0) {
		var password = $.trim( $("#meetingPassword").val());
		if(password!=""){
			var regExp = /^[A-Za-z0-9@\-_*]{0,10}$/;
			if(!regExp.test(password)) {
				alert(v3x.getMessage("meetingLang.meeting_video_password"));
				return false;
			}
		}
	}
	return true;
}

function checkDateIsPast() {
	var beginDate = document.getElementById('beginDate').value;
	var beginDatetime = Date.parse(beginDate.replace(/\-/g,"/"));
	var endDate = document.getElementById('endDate').value;
	var endDatetime = Date.parse(endDate.replace(/\-/g,"/"));

	var periodicityType = "";
	//周期会议——批量编辑
	if (!(pageX.periodicity.id != "" && pageX.html.isBatch != "true")){
	    periodicityType = document.getElementById('periodicityType').value;
	}
	var periodicityScope = document.getElementById('periodicityScope').value;
	var periodicityStartDate = document.getElementById('periodicityStartDate').value;
	var periodicityEndDate = document.getElementById('periodicityEndDate').value;

	var requestCaller = new XMLHttpRequestCaller(this, "ajaxMeetingValidationManager", "checkDateIsPast", false);
	var i = 1;
	requestCaller.addParameter(i++, "Long", beginDatetime);
	requestCaller.addParameter(i++, "Long", endDatetime);
	requestCaller.addParameter(i++, "String", periodicityType);
	requestCaller.addParameter(i++, "String", periodicityScope);
	requestCaller.addParameter(i++, "String", periodicityStartDate);
	requestCaller.addParameter(i++, "String", periodicityEndDate);

	var ds = requestCaller.serviceRequest();

	if(ds == "true") {//保存和发送才需要提示 OA-18227
	    var flag;
	    if (periodicityType != "" && !(pageX.periodicity.id != "" && pageX.html.isBatch != "true")) {
	    	checkPeriodicityDateIsPast = true;
			//周期会议的开始时间不能小于当前时间，请重新选择!
			alert(v3x.getMessage("meetingLang.begin_date_validate_periodicity"));
			flag = false;
	    } else {
	        //会议开始时间小于当前时间,此会议发生在过去,确认提交吗?
	        if(getA8Top().isOffice){
		        getA8Top().hideOfficeObj && getA8Top().hideOfficeObj();
		    }
	        flag = confirm(v3x.getMessage("meetingLang.begin_date_validate"));
	        if(getA8Top().isOffice){
		        getA8Top().showOfficeObj && getA8Top().showOfficeObj();
		    }
	    }
		return flag;
	}
	return true;
}

function checkMeetingRoomUsed(beginDate, endDate, beginDatetime, endDatetime) {
	var selectRoomTypeObj = document.getElementById("selectRoomType");
	var selectRoomTypeText = selectRoomTypeObj.options[selectRoomTypeObj.selectedIndex].text;
	var selectRoomTypeValue = selectRoomTypeObj.options[selectRoomTypeObj.selectedIndex].value;
	var option2Id = selectRoomTypeObj.options[selectRoomTypeObj.selectedIndex].getAttribute("option2Id");

	if(selectRoomTypeValue != "mtPlace") {
		if(!option2Id && option2Id!=null) {
			// 如果会议时间选择正确
			if( beginDate!=null && beginDate.length==16 && endDate!=null && endDate.length==16) {

				//周期会议-单次编辑
				if(pageX.periodicity.id != "" && pageX.html.isBatch != "true") {
					document.getElementById('periodicityType').value = "";
				}

				var meetingroomId =  selectRoomTypeValue;
				var meetingId = document.getElementById("id").value;
				var periodicityId = document.getElementById('periodicityId').value;
				var periodicityType = document.getElementById('periodicityType').value;
				var periodicityScope = document.getElementById('periodicityScope').value;
				var periodicityStartDate = document.getElementById('periodicityStartDate').value;
				var periodicityEndDate = document.getElementById('periodicityEndDate').value;
				var roomAppStartDate = document.getElementById("roomAppBeginDate").value;
				var roomAppEndDate = document.getElementById("roomAppEndDate").value;
				var roomAppStartHHmmss = "";
				var roomAppEndHHmmss = "";
				if(roomAppStartDate != "") {
					roomAppStartHHmmss = roomAppStartDate.split(" ")[1] + ":00";
				}
				if(roomAppEndDate != "") {
					roomAppEndHHmmss = roomAppEndDate.split(" ")[1] + ":00";
				}

				var oldMeetingBeginDatetime = "-1";
				//已发周期会议-批量修改
				if(!(pageX.periodicity.id != "" && pageX.html.isBatch != "true")) {
					if(pageX.meeting.beginDate!="" && pageX.meeting.state!="0") {
						if(periodicityStartDate != ""){
							oldMeetingBeginDatetime = Date.parse(periodicityStartDate.replace(/\-/g,"/") + " " + pageX.meeting.beginDate.split(" ")[1]);
						}else{
							oldMeetingBeginDatetime = Date.parse(pageX.meeting.beginDate.replace(/\-/g,"/"));
						}
					}
				}
				var requestCaller = new XMLHttpRequestCaller(this, "ajaxMeetingValidationManager", "checkRoomUsed", false);
				var i = 1;
				requestCaller.addParameter(i++, "String", meetingroomId);
				requestCaller.addParameter(i++, "String", "");
				requestCaller.addParameter(i++, "String", meetingId);
				requestCaller.addParameter(i++, "Long", oldMeetingBeginDatetime);
				requestCaller.addParameter(i++, "Long", beginDatetime);
				requestCaller.addParameter(i++, "Long", endDatetime);
				requestCaller.addParameter(i++, "String", periodicityId);
				requestCaller.addParameter(i++, "String", periodicityType);
				requestCaller.addParameter(i++, "String", periodicityScope);
				requestCaller.addParameter(i++, "String", periodicityStartDate);
				requestCaller.addParameter(i++, "String", periodicityEndDate);
				requestCaller.addParameter(i++, "String", roomAppStartHHmmss);
				requestCaller.addParameter(i++, "String", roomAppEndHHmmss);

				var ds = requestCaller.serviceRequest();
				if(ds=="true") {
					return true;
				} else if(ds=="timeerror") {
					alert(v3x.getMessage("meetingLang.meetingroom_timeerror"));
					return false;
				} else if(ds=="timefalse") {
					alert(v3x.getMessage("meetingLang.meetingroom_used"));
						return false;
				} else if(ds=="appfalse") {
					alert(v3x.getMessage("meetingLang.meetingroom_appfalse"));
					return false;
				} else if(ds=="delete") {
					alert(v3x.getMessage("meetingLang.meetingroom_delete"));
					return false;
				} else if(ds=="false") {
					//您选择的会议室在选择的会议时间段内已被占用，您确定要继续发起这个会议吗？
					alert(v3x.getMessage("meetingLang.meetingroom_used"));
						return false;
				} else if(ds=="${meetingId}") {
					return true;
				} else {
					alert(v3x.getMessage("meetingLang.meetingroom_used"));
					return false;
				}
			} else {//如果会议时间选择不正确
				alert(v3x.getMessage("meetingLang.meetingroom_time_error"));
				return false;
			}

		}
	}
	return true;
}

function checkPeriodicityChange() {
	if(pageX.meeting.state!="0" && pageX.periodicity.id != "") {

		//周期会议-单条编辑，不做该提示
		if(!(pageX.periodicity.id != "" && pageX.html.isBatch != "true")) {

			if(pageX.periodicity.id != document.getElementById("periodicityId").value
					|| pageX.periodicity.periodicityType != document.getElementById("periodicityType").value
					|| pageX.periodicity.scope != document.getElementById("periodicityScope").value
					|| pageX.periodicity.startDate != document.getElementById("periodicityStartDate").value
					|| pageX.periodicity.endDate != document.getElementById("periodicityEndDate").value) {
			    checkRoomChangeFlag = false;
				if(!checkOldRoomAppNeedCancel()) {
				    //您对周期性设置进行了改变，原有会议室会被撤销，是否提交?
					if(!confirm(v3x.getMessage("meetingLang.meetingroom_periodicity_changed"))) {
						return false;
					}
				}
			}
		}
	}

	return true;
}

function checkConfereesConflict(beginDatetime, endDatetime) {
	//非周期性会议验证参会人员冲突情况
	if(document.getElementById("periodicityType").value == "") {
		var meetingId = document.getElementById("id").value;
		var emceeId = document.getElementById("emceeId").value;
		var userId = document.getElementById("userId").value;
		var recorderId = document.getElementById("recorderId").value;
		var conferees = document.getElementById("conferees").value;
		var leaderIdEle = document.getElementById("leader");
		var leader = "";
		if(leaderIdEle) {
			leader = leaderIdEle.value;
		}

		var requestCaller = new XMLHttpRequestCaller(this,"ajaxMeetingValidationManager","checkConfereesConflict",false);
		var i = 1;
		requestCaller.addParameter(i++,"String",meetingId);
		requestCaller.addParameter(i++,"Long",beginDatetime);
	  	requestCaller.addParameter(i++,"Long",endDatetime);
	  	requestCaller.addParameter(i++,"String",emceeId);
	  	requestCaller.addParameter(i++,"String",recorderId);
	  	requestCaller.addParameter(i++,"String",conferees);
	  	requestCaller.addParameter(i++,"String",leader);

	  	var ds = requestCaller.serviceRequest();
	  	if(ds == "true") {
	  		var url = "meeting.do?method=openMeetingConfereesRepeatDialog&meetingId="+meetingId+"&beginDatetime="+beginDatetime+"&endDatetime="+endDatetime+"&emceeId="+emceeId+"&recorderId="+recorderId;
	  		url += getUrlSurffix();
	  		openMeetingDialog(url, pageX.i18n.collideTitleLabel, 600, 560, function() {
	  			submitForm();
	  		},null,function(){
	  			sendCount = 0;
	  			commonDialogClose('win123');
	  		});
	  	}
	  	else {
	  		return true;
	  	}
	} else {
		return true;
	}
}

function checkMeetingRoomChange() {
    //检测会议室审核通过后，再修改会议时，是否修改了时间
    var selectRoomTypeObj = document.getElementById("selectRoomType");
    var selectRoomTypeValue = selectRoomTypeObj.options[selectRoomTypeObj.selectedIndex].value;
    var meetingroomId =  selectRoomTypeValue;
    var meetingId = document.getElementById("id").value;
    var meetingBeginDate = document.getElementById('beginDate').value;
    var meetingEndDate = document.getElementById('endDate').value;
    var roomAppBeginDate = $("#roomAppBeginDate").val();
    var roomAppEndDate = $("#roomAppEndDate").val();
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxMeetingValidationManager", "permedRoomMeetingIsUpdateTime", false);
    requestCaller.addParameter(1, "String", meetingBeginDate);
    requestCaller.addParameter(2, "String", meetingEndDate);
    requestCaller.addParameter(3, "String", meetingId);
    requestCaller.addParameter(4, "String", meetingroomId);
    requestCaller.addParameter(5, "String", pageX.meeting.roomAppId);
    requestCaller.addParameter(6, "String", roomAppBeginDate);
    requestCaller.addParameter(7, "String", roomAppEndDate);

    var ds = requestCaller.serviceRequest();
    if(ds === "true"){
        //您已申请了会议室，会议时间与会议室使用时间不符，是否提交?
        if(!confirm(v3x.getMessage("meetingLang.meetingroom_time_neq_meeting_time"))){
            return;
        }
    }
    //您已重新申请了会议室，原有会议室会被撤销，是否提交?
    if(ds === "changeRoom"){
    	if (checkPeriodicityDateIsPast) {
    		//周期会议的开始时间不能小于当前时间，请重新选择!
    		alert(v3x.getMessage("meetingLang.begin_date_validate_periodicity"));
    		return false;
    	}
        //"您已重新申请了会议室，原有会议室会被撤销，是否提交?"
        if(!confirm(v3x.getMessage("meetingLang.meetingroom_changed"))){
            return;
        }
    }

    return true;
}

/******************************** 处理参数 *********************************/
function setFormValueNull() {
	var mtTitle = document.getElementById("mtTitle");
	if(mtTitle && mtTitle.value==mtTitle.getAttribute("defaultValue")) {
		mtTitle.value = "";
	}

	var leader = document.getElementById("leader");
	if(leader && leader.value==leader.getAttribute("defaultValue")) {
		leader.value = "";
	}

	var attender = document.getElementById("attender");
	if(attender && attender.value==attender.getAttribute("defaultValue")) {
		attender.value = "";
	}

	var tel = document.getElementById("tel");
	if(tel && tel.value==tel.getAttribute("defaultValue")) {
		tel.value = "";
	}

	var note = document.getElementById("notice");
	if(note && note.value==note.getAttribute("defaultValue")) {
		note.value = "";
	}

	var plan = document.getElementById("plan");
	if(plan && plan.value==plan.getAttribute("defaultValue")) {
		plan.value = "";
	}
}

function setFormDefaultValue() {
	var mtTitle = document.getElementById("mtTitle");
	if(mtTitle && mtTitle.value=="") {
		mtTitle.value = tTitle.getAttribute("defaultLabel");
	}

	var leader = document.getElementById("leader");
	if(leader && leader.value=="") {
		leader.value = leader.getAttribute("leader");
	}

	var attender = document.getElementById("attender");
	if(attender && attender.value=="") {
		attender.value = attender.getAttribute("attender");
	}

	var tel = document.getElementById("tel");
	if(tel && tel.value=="") {
		tel.value = tel.getAttribute("tel");
	}

	var note = document.getElementById("note");
	if(note && note.value=="") {
		note.value = note.getAttribute("note");
	}

	var plan = document.getElementById("plan");
	if(plan && plan.value=="") {
		plan.value = plan.getAttribute("plan");
	}
}

function setRoomParameter() {
	var selectRoomType = document.getElementById("selectRoomType");
	for(var i=0; i<selectRoomType.options.length; i++) {
		var obj = selectRoomType.options[i];
		if(obj.selected) {
			var option2Id = obj.getAttribute("option2Id");
			if(option2Id && option2Id!="") {
				document.getElementById("roomAppId").value = option2Id;
			}
		}
	}
	document.getElementById("checkRoomChangeFlag").value = checkRoomChangeFlag;
}

function setAttachmentParameter() {
  	if(fileUploadAttachments.size() > 0) {
      	document.getElementById("isHasAtt").value = "true";
  	} else {
     	document.getElementById("isHasAtt").value = "false";
  	}
}

function setMeetingNutureValue() {
	var videoRoomId = document.getElementById("videoRoomId").value;
	//没有选择视频会议室时,会议分类为普通会议
	if (pageX.meetingVideoRoomApp.isChooseVideoMeetingRoom=="true" && (videoRoomId == "" || videoRoomId == "-1")) {
		document.getElementById("meetingNature").value = "1";
	}
}

/******************************** 页面跳转 *********************************/
function gotoList(fromOpen, msg) {
	if(msg && msg!="") {
		alert(msg);
		sendCount = 0;
	    setApplicationButtons(false);
		return;
	}
	refreshSection();
	try{
		if (!getA8Top().isCtpTop) {
			var winOpener = getA8Top().opener;
			if (winOpener.getA8Top) {
				var _win = winOpener.getA8Top().mainIframe;
				if (_win && _win.detailIframe && _win.detailIframe.meetingMainIframe && _win.detailIframe.meetingMainIframe.listFrame) {
					var win = _win.detailIframe.meetingMainIframe.listFrame;
					var url = win.location.href;
					if (url.indexOf("meetingNavigation.do") != -1 || url.indexOf("meeting.do") != -1 || url.indexOf("meetingList.do") != -1) {
						if (fromOpen == "save") {
							win.location = "meetingList.do?method=listWaitSendMeeting&listType=listWaitSendMeeting"+getUrlSurffix();
						} else {
							win.location = "meetingList.do?method=listSendMeeting&listType=listSendMeeting"+getUrlSurffix();
						}
					}
				}
				//日程栏目
				var arrangeTimeUrl = winOpener.location.href;
				if(_win && arrangeTimeUrl && arrangeTimeUrl.indexOf("calEvent.do?method=arrangeTime") != -1){
					winOpener.location.reload();
				}
				if (winOpener.vPortal && winOpener.vPortal.sectionHandler != undefined) {
					winOpener.vPortal.sectionHandler.reload("pendingSection",true);
					winOpener.vPortal.sectionHandler.reload("agentSection",true);
					winOpener.vPortal.sectionHandler.reload("eventCalViewSetion",true);//日程栏目
					winOpener.vPortal.sectionHandler.reload("meetingProjectSection",true);//日程栏目
					winOpener.vPortal.sectionHandler.reload("meetingRoomSection",true);//会议室看板
				}
			}
		}

		setTimeout(function(){
			getA8Top().opener = null;
		    getA8Top().close();
		}, 10);
	}catch(e){

		if(getA8Top().opener){
			setTimeout(function(){
				getA8Top().opener = null;
			    getA8Top().close();
			}, 10);
		}else{
			window.location.href = 'about:blank';
			window.close();
		}

	}
}

//如果是项目会议 就需要刷新 项目计划/会议/事件  栏目
function refreshSection(){
	try{
		var _win = getA8Top().opener.getCtpTop().$("#main")[0].contentWindow.$("#body")[0].contentWindow;
		if (_win != undefined) {
  		if (_win.sectionHandler != undefined) {
  		  	//刷新 项目计划/会议/事件  栏目
             // _win.sectionHandler.reload("projectPlanAndMtAndEvent",true);
  			_win.sectionHandler.reload("meetingProjectSection",true);
          }
		}
	}catch(e){}
}

/******************************** 工具方法 *********************************/

//日期时间选择事件
function selectMeetingTime(thisDom) {
	var evt = v3x.getEvent();
	var x = evt.clientX?evt.clientX:evt.pageX;
	var y = evt.clientX?evt.clientX:evt.pageY;
	whenstart(_path, thisDom, x, y,'datetime');
}

function _isDefualtValue(e) {
	if(e != null) {
		//判断是否是默认值
		var defalutValue = e.getAttribute("defaultValue");
		if(defalutValue != null && defalutValue != "" && defalutValue != "undefined" && e.value == defalutValue){
			return true;
		}
		return false;
	}
    return false;
}

//从字符串时间转换成Long时间
function stringTimeToLongTime(stringTime) {
	if(stringTime!=null && stringTime.length==16) {
		var time = new Date(stringTime.substring(0,4),stringTime.substring(5,7)-1,stringTime.substring(8,10),stringTime.substring(11,13),stringTime.substring(14,16));
		return time.getTime() + "";
	} else {
		return "";
	}
}

//校验会议名称特殊字符
function validateValue(v){
	var patrn = /^[^#￥%&~<>/|\"']*$/;
	if(!patrn.test(v)){
		return true;
	}
	return false;
}

function isNull(objectId) {
	if(objectId==null || objectId=="null" || objectId=="" || objectId=="0" || objectId=="-1") {
		return true;
	}
	return false;
}

function getUrlSurffix(){
	return CsrfGuard.getUrlSurffix();
}

/****************按钮操作********************/
/**
 * state:true(置灰按钮)、false(释放按钮)
 */
function setApplicationButtons(state){
    var saveButton = document.getElementById("save");// 保存待发
    if (saveButton){
        saveButton.disabled = state;
    }
    var loadTemplateButton = document.getElementById("loadTemplate");// 调用模板
    if (loadTemplateButton){
        loadTemplateButton.disabled = state;
    }
    var bodyTypeSelectorButton = document.getElementById("bodyTypeSelector");// 正文类型
    if (bodyTypeSelectorButton){
        bodyTypeSelectorButton.disabled = state;
    }
    var saveAsButton = document.getElementById("saveAs");// 存为模板
    if (saveAsButton){
        saveAsButton.disabled = state;
    }
    var sendButton = document.getElementById("send");// 发送
    if (sendButton){
        sendButton.disabled = state;
    }
}

