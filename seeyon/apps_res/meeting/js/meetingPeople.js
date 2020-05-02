var excludeElements_emceeSelect;
var excludeElements_recorderSelect;
var excludeElements_confereesSelect;
var excludeElements_leaderSelect;
var excludeElements_impartSelect;//告知
var excludeElements_scopesSelect;

var elements_emceeArr = null;
var elements_recorderArr = null;
var elements_confereesSelectArr = null;
var elements_impartSelectArr = null;
var elements_leaderSelectArr = null;
var elements_createUserSelectArr = null;
var elements_scopesSelectArr = null;


if(typeof(elements_emceeSelect) != "undefined") {
	elements_emceeArr = elements_emceeSelect;
}
if(typeof(elements_recorderSelect) != "undefined") {
	elements_recorderArr = elements_recorderSelect;
}
if(typeof(elements_confereesSelect) != "undefined") {
	elements_confereesSelectArr = elements_confereesSelect;
}
if(typeof(elements_impartSelect) != "undefined") {
	elements_impartSelectArr = elements_impartSelect;
}
if(typeof(elements_leaderSelect) != "undefined") {
	elements_leaderSelectArr = elements_leaderSelect;
}
if(typeof(elements_createUserSelect) != "undefined") {
	elements_createUserSelectArr = elements_createUserSelect;
}
if(typeof(elements_scopesSelect) != "undefined") {
	elements_scopesSelectArr = elements_scopesSelect;
}

var isConfirmExcludeSubDepartment_confereesSelect = true;
var isConfirmExcludeSubDepartment_leaderSelect = true;
var isConfirmExcludeSubDepartment_impartSelect = true;
var isConfirmExcludeSubDepartment_scopesSelect = true;

var hiddenPostOfDepartment_confereesSelect = true;
var hiddenPostOfDepartment_leaderSelect = true;
var hiddenPostOfDepartment_impartSelect = true;
var hiddenPostOfDepartment_scopesSelect = true;

//不受职务级别控制
var isNeedCheckLevelScope_emceeSelect = false;
var isNeedCheckLevelScope_recorderSelect = false;
var isNeedCheckLevelScope_confereesSelect = false;
var isNeedCheckLevelScope_leaderSelect = false;
var isNeedCheckLevelScope_impartSelect = false;
var isNeedCheckLevelScope_scopesSelect = false;


/*********************** 选择主持人 *************************/
function selectMtPeople_emcee(elemId, idElem){
	excludeElements_emceeSelect = new Array();
	
	var arr = new Array();
	if(elements_confereesSelectArr){
		arr = arr.concat(elements_confereesSelectArr);
	}
	if (elements_impartSelectArr) {
		arr = arr.concat(elements_impartSelectArr);
	}
	if(elements_leaderSelectArr){
		arr = arr.concat(elements_leaderSelectArr);
	}
	excludeElements_emceeSelect = arr;
	eval('selectPeopleFun_' + elemId + '()');
}
function peopleCallback_emcee(elements, idElem, nameElem) {
	var emceeId = document.getElementById('emceeId').value;
	
	var elementsIds = getIdsString(elements, false);
	if(elementsIds.trim() != "") {
		
		var result = true;
		
		var confereesIds = document.getElementById('conferees').value;
		if(confereesIds != "") {
			var confereesArray = confereesIds.split(",");
			for(var i = 0 ; i<confereesArray.length ; i++) {
				if(confereesArray[i] == emceeId) {
					alert(v3x.getMessage("meetingLang.emcee_conferee_repeat"));
					result = false;
				}
			}
		}
		if(result) {
			document.getElementById(idElem).value=elementsIds;
			document.getElementById(nameElem).value=getNamesString(elements);
		}
		elements_emceeArr = elements;
	} else {
		document.getElementById(idElem).value = elementsIds;
		document.getElementById(nameElem).value = getNamesString(elements);
		elements_emceeArr = elements;
	}
}

//中国石油天然气股份有限公司西南油气田分公司  【发起部门和联系方式系统自动带出】  lixuqiang 2020年4月29日 start
function selectMtPeople_user(elemId, idElem){
	excludeElements_emceeSelect = new Array();
	
	var arr = new Array();
	if(elements_confereesSelectArr){
		arr = arr.concat(elements_confereesSelectArr);
	}
	if (elements_impartSelectArr) {
		arr = arr.concat(elements_impartSelectArr);
	}
	if(elements_leaderSelectArr){
		arr = arr.concat(elements_leaderSelectArr);
	}
	excludeElements_emceeSelect = arr;
	eval('selectPeopleFun_' + elemId + '()');
}
function peopleCallback_user(elements, idElem, nameElem) {
	$.ajaxSettings.async = false;
	$.get("/seeyon/meeting.do?method=getOtherInfo&memberId="+elements[0].id,
		function(data){
			var data1 = data.split(",");
			$("#phoneInfo").val(data1[0]);
			$("#currentDepartment").val(data1[1]);
			$("#userDepartmentName").val(data1[2]);
			$.ajaxSettings.async = true;
	})
	
	var emceeId = document.getElementById('userId').value;
	
	var elementsIds = getIdsString(elements, false);
	if(elementsIds.trim() != "") {
		
		var result = true;
		
		var confereesIds = document.getElementById('conferees').value;
		if(confereesIds != "") {
			var confereesArray = confereesIds.split(",");
			for(var i = 0 ; i<confereesArray.length ; i++) {
				if(confereesArray[i] == emceeId) {
					alert(v3x.getMessage("meetingLang.emcee_conferee_repeat"));
					result = false;
				}
			}
		}
		if(result) {
			document.getElementById(idElem).value=elementsIds;
			document.getElementById(nameElem).value=getNamesString(elements);
		}
		elements_emceeArr = elements;
	} else {
		document.getElementById(idElem).value = elementsIds;
		document.getElementById(nameElem).value = getNamesString(elements);
		elements_emceeArr = elements;
	}
}
//中国石油天然气股份有限公司西南油气田分公司  【发起部门和联系方式系统自动带出】  lixuqiang 2020年4月29日 end

/*********************** 选择记录人 *************************/
function selectMtPeople_recorder(elemId, idElem){
	excludeElements_recorderSelect = new Array();
	
	var arr = new Array();
	if(elements_confereesSelectArr){
		arr = arr.concat(elements_confereesSelectArr);
	}
	if (elements_impartSelectArr) {
		arr = arr.concat(elements_impartSelectArr);
	}
	if(elements_leaderSelectArr){
		arr = arr.concat(elements_leaderSelectArr);
	}
	excludeElements_recorderSelect = arr;
	eval('selectPeopleFun_' + elemId + '()');
}
function peopleCallback_recorder(elements, idElem, nameElem){
	var recorderId = 0;
	if(document.getElementById('recorderId')) {
		recorderId = document.getElementById('recorderId').value;
	}
	
	var elementsIds = getIdsString(elements, false);
	if(elementsIds.trim() != "") {
		var result = true;
		
		var confereesIds = document.getElementById('conferees').value;
		if(confereesIds != "") {
			var confereesArray = confereesIds.split(",");
			for(var i = 0 ; i<confereesArray.length ; i++) {
				if(confereesArray[i] == recorderId) {
					alert(v3x.getMessage("meetingLang.recorder_conferee_repeat"));
					result = false;
				}
			}
		}
		if(result) {
			document.getElementById(idElem).value=elementsIds;
			document.getElementById(nameElem).value=getNamesString(elements);
		}
		elements_recorderArr = elements;
	} else {
		document.getElementById(idElem).value = elementsIds;
		document.getElementById(nameElem).value = getNamesString(elements);
		elements_recorderArr = elements;
	}
}


/*********************** 选择参会人 *************************/
function selectMtPeople_conferees(elemId, idElem){
	excludeElements_confereesSelect = new Array();

	var arr = new Array();
	if(elements_emceeArr){
		arr = arr.concat(elements_emceeArr);
	}
	if(elements_recorderArr){
		arr = arr.concat(elements_recorderArr);
	}
	if (elements_impartSelectArr) {
		arr = arr.concat(elements_impartSelectArr);
	}
	if(elements_leaderSelectArr){
		arr = arr.concat(elements_leaderSelectArr);
	}
	excludeElements_confereesSelect = arr;
	eval('selectPeopleFun_' + elemId + '()');
}
function peopleCallback_conferees(elements, idElem, nameElem){
	var emceeId = document.getElementById('emceeId').value;
	var recorderId = 0;
	if(document.getElementById('recorderId')) {
		recorderId = document.getElementById('recorderId').value;
	}
	
	var elementsIds = getIdsString(elements, true);
	if(elementsIds.trim() != "") {
		var result = true;
		
		var elementsIdsArray = elementsIds.split(",");
		for(var i = 0 ; i<elementsIdsArray.length ; i++) {
			if(elementsIdsArray[i] == emceeId) {
				alert(v3x.getMessage("meetingLang.emcee_conferee_repeat"));
				result = false;
			} else if(elementsIdsArray[i] == recorderId) {
				alert(v3x.getMessage("meetingLang.recorder_conferee_repeat"));
				result = false;
			}
		}
		if(result) {
			document.getElementById(idElem).value = elementsIds;
			document.getElementById(nameElem).value = getNamesString(elements);
		}
		elements_confereesSelectArr = elements;
	} else {
		document.getElementById(idElem).value = elementsIds;
		document.getElementById(nameElem).value = getNamesString(elements);
		elements_confereesSelectArr = elements;
	}
}


/*********************** 选择告知人 *************************/
function selectMtPeople_impart(elemId, idElem){
	excludeElements_impartSelect = new Array();
	
	var arr = new Array();
	//排除登录用户
	/*if (elements_createUserSelectArr) {
	    arr = arr.concat(elements_createUserSelectArr);
	}*/
	if(elements_emceeArr){
		arr = arr.concat(elements_emceeArr);
	}
	if(elements_recorderArr){
		arr = arr.concat(elements_recorderArr);
	}
	if(elements_confereesSelectArr){
		arr = arr.concat(elements_confereesSelectArr);
	}
	if(elements_leaderSelectArr){
		arr = arr.concat(elements_leaderSelectArr);
	}
	excludeElements_impartSelect = arr;
	eval('selectPeopleFun_' + elemId + '()');
}
function peopleCallback_impart(elements, idElem, nameElem){
	var emceeId = document.getElementById('emceeId').value;
	var recorderId = 0;
	if(document.getElementById('recorderId')) {
		recorderId = document.getElementById('recorderId').value;
	}
	
	var elementsIds = getIdsString(elements, true);
	if(elementsIds.trim() != "") {
		
		var result = true;
		
		var elementsIdsArray = elementsIds.split(",");
		for(var i = 0 ; i<elementsIdsArray.length ; i++) {
			if(elementsIdsArray[i] == emceeId) {
				alert(v3x.getMessage("meetingLang.emcee_conferee_repeat"));
				result = false;
			} else if(elementsIdsArray[i] == recorderId) {
				alert(v3x.getMessage("meetingLang.recorder_conferee_repeat"));
				result = false;
			}
		}
		if(result) {
			document.getElementById(idElem).value = elementsIds;
			document.getElementById(nameElem).value = getNamesString(elements);
		}
		elements_impartSelectArr = elements;
	} else {
		document.getElementById(idElem).value = elementsIds;
		document.getElementById(nameElem).value = getNamesString(elements);
		elements_impartSelectArr = elements;
	}
}


/*********************** 选择领导人 *************************/
function selectMtPeople_leader(elemId, idElem) {
	
	excludeElements_leaderSelect = new Array();

	var arr = new Array();
	if(elements_emceeArr){
		arr = arr.concat(elements_emceeArr);
	}
	if(elements_recorderArr){
		arr = arr.concat(elements_recorderArr);
	}
	if(elements_confereesSelectArr){
		arr = arr.concat(elements_confereesSelectArr);
	}
	if (elements_impartSelectArr) {
		arr = arr.concat(elements_impartSelectArr);
	}
	excludeElements_leaderSelect = arr;
	eval('selectPeopleFun_' + elemId + '()');
}
function peopleCallback_leader(elements, idElem, nameElem) {
	var emceeId = document.getElementById('emceeId').value;
	var recorderId = 0;
	if(document.getElementById('recorderId')) {
		recorderId = document.getElementById('recorderId').value;
	}
	
	var result = true;
	
	var elementsIds = getIdsString(elements, true);
	if(elementsIds.trim() != "") {
		var elementsIdsArray = elementsIds.split(",");
		for(var i = 0 ; i<elementsIdsArray.length ; i++) {
			if(elementsIdsArray[i] == emceeId) {
				alert(v3x.getMessage("meetingLang.emcee_conferee_repeat"));
				result = false;
			} else if(elementsIdsArray[i] == recorderId) {
				alert(v3x.getMessage("meetingLang.recorder_conferee_repeat"));
				result = false;
			}
		}
	}
	
	elements_leaderSelectArr = elements;
	
	if(result) {
		document.getElementById(idElem).value = elementsIds;
		document.getElementById(nameElem).value = getNamesString(elements);
		elements_leaderSelectArr = elements;
	}
}


/*********************** 选择实际参会人 *************************/
function selectMtPeople_scopes(elemId, idElem) {
	excludeElements_scopesSelect = new Array();

	eval('selectPeopleFun_' + elemId + '()');
}
function peopleCallback_scopes(elements, idElem, nameElem) {	
	var elementsIds = getIdsString(elements, true);
	if(elementsIds.trim() != "") {
		document.getElementById(idElem).value = elementsIds;
		document.getElementById(nameElem).value = getNamesString(elements);
		
		elements_scopesSelectArr = elements;
	} else {
		document.getElementById(idElem).value = elementsIds;
		document.getElementById(nameElem).value = getNamesString(elements);
	}
}
