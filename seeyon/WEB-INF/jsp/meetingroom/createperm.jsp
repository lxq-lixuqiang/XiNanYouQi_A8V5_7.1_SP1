<%@ page isELIgnored="false" import="com.seeyon.ctp.common.AppContext,java.util.Locale"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://www.seeyon.com/ctp" prefix="ctp" %>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title></title>
<%@ include file="header.jsp" %>
<%
Locale locale = AppContext.getLocale();
String ctxPath = request.getContextPath();
%>
<script type="text/javascript">
var _ctxPath = "<%=ctxPath%>",_locale='<%=locale%>';
</script>
<script type="text/javascript" src="/seeyon/i18n_<%=locale%>.js${v3x:resSuffix()}"></script>
<script type="text/javascript" src="<c:url value="/common/js/jquery-debug.js" />"></script>
<script type="text/javascript" src="<c:url value="/common/image/jquery.touchTouch-debug.js${ctp:resSuffix()}" />"></script>
<c:set value="${pageContext.request.contextPath}" var="path" />
<link rel="stylesheet" href="${path}/common/all-min.css" />
<link rel="stylesheet" href="${path}/skin/dist/common/skin.css" />
<link rel="stylesheet" href="${path}/common/image/css/touchTouch.css${ctp:resSuffix()}">
<script type="text/javascript">
function init(){
	var status = "${v3x:escapeJavascript(bean.meetingRoomApp.status)}";
	if(status != "0" || "${v3x:escapeJavascript(param.from)}"=="yesApp") {
		setReadOnly();
		
		var bbArea = document.getElementById("bottom_button_area")
		if (bbArea) {
		    bbArea.style.display = "none";
		}
		var bArea = document.getElementById("bottom_area")
		if (bArea) {
		    bArea.style.bottom = "0px";
		}
	}
	
	var isIE = (navigator.userAgent.indexOf('MSIE')>=0) || (navigator.userAgent.indexOf('Trident')>=0);
	if(isIE){
		showPircture();
	}
}

$(function() {
	showPircture();
});

function showPircture(){
	var attaArray = new Array();
	var $show = $(".contentText").children();
	$show.each(function() {
		var map = {};
        var t = $(this);
		var t_id = t.attr("showId");
        var t_date = t.attr("showDate");
        var t_type = t.attr("showType");
		var t_name = t.attr("fileName");
		var _src = $(this)[0].src;
		map["dataId"] = t_id;
        map["src"] = _src;
        attaArray.push(map);
	});
	
	if(attaArray.length>0){
		var dataTimestamp = new Date().getTime();
		//加时间戳，避免ID重复  OA-101976
		var id = "showImg" + dataTimestamp;
		$($show).touch({
			id: id,//查看器ID，唯一
			datas: attaArray,  //图片数据
			onClick: {pre:function(){},after:function(){}}
		});
	}
}

function doSubmit(){
	if(checkForm(document.myForm)){
		if(confirm('<fmt:message key='mr.alert.confirmPerm'/>？')){
			document.myForm.submit();
		}
	}
}
	
//isValid 人员是否是有效的，换句话说就是是否已经离职，离职不允许弹出人员卡片
function displayPeopleCard(memberId, isValid){
	if(!isValid || isValid == "false"){
    	return ;
	}
	showV3XMemberCardWithOutButton(memberId);
}

function _submitCallback(errorMsg) {
	if(errorMsg != "") {
		alert(errorMsg);
	}
	if (typeof doMeeetingSign_pending == "function") {
		doMeeetingSign_pending();
	}
	if(window.dialogArguments && window.dialogArguments.callback) {
		window.dialogArguments.callback();
	} else if(window.dialogArguments && window.dialogArguments.dialogDealColl) {
		window.dialogArguments.dialogDealColl.close();
		var href = window.dialogArguments.location.href;
		window.dialogArguments.location.href = href;
	} else if(window.dialogArguments) {
		window.dialogArguments.getA8Top().reFlesh();
		parent.window.close();
	} else {
		if(parent.window.listFrame) {
			var href = parent.listFrame.location.href;
			parent.listFrame.location.href = href;
		} else {
			parent.window.close();
		}
	}
}

</script>
<link rel="stylesheet" type="text/css" href="<c:url value="/common/css/layout.css${v3x:resSuffix()}" />">
</head>
<body onload="init()">

<form name="myForm" action="meetingroom.do?method=execPerm" method="post" target="hiddenIframe">
<input type="hidden" name="CSRFTOKEN" value="${sessionScope['CSRFTOKEN']}" />
<input type="hidden" value="${affairId }" name="affairId" />
<input type="hidden" name="id" value="${bean.meetingRoomApp.id }" />

<div id="bottom_area" style="position:absolute; top:10px;bottom:50px;width:100%; overflow:auto;padding-top:10px;">

<table width="700" border="0" cellspacing="0" cellpadding="0" align="center">
<tr>

	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.meetingroomname'/>:</td>
	<td width="200" nowrap="nowrap" class="new-column" style="table-layout:fixed;word-break:break-all">
		<c:out value="${v3x:escapeJavascript(bean.meetingRoom.name) }"></c:out>
	</td>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.meetName'/>:</td>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
	<c:if test="${bean.meetingName != null}">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.meetName'/>" class="input-300px" value="${bean.meetingName}" readonly />
	</c:if>
	<c:if test="${bean.meetingName == null}">
		<fmt:message key='mr.label.no'/>
	</c:if>
	</td>
</tr>
		
<tr>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.appPerson'/>:</td>
	<c:set var="isProxy" value="${proxy?'proxy-true':'' }"/>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.appPerson'/>" class="input-300px" value="${v3x:toHTML(v3x:showMemberNameOnly(bean.meetingRoomApp.perId))}" readonly />
	</td>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.appDept'/>:</td>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.appDept'/>" class="input-300px" value="${v3x:toHTML(departmentName) }" readonly />
	</td>
</tr>
		
<tr>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.startDatetime'/>:</td>
	<td width="35%" nowrap="nowrap" class="new-column">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.startDatetime'/>" class="input-300px" disabled value="<fmt:formatDate value="${bean.meetingRoomApp.startDatetime}" pattern="yyyy-MM-dd HH:mm"/>" />
	</td>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.endDatetime'/>:</td>
	<td width="35%" nowrap="nowrap" class="new-column">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.endDatetime'/>" class="input-300px" disabled value="<fmt:formatDate value="${bean.meetingRoomApp.endDatetime}" pattern="yyyy-MM-dd HH:mm"/>" />
	</td>
</tr>
	
<tr>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.seatCount'/>:</td>
	<c:set var="isProxy" value="${proxy?'proxy-true':'' }"/>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.seatCount'/>" class="input-300px" value="${bean.meetingRoom.seatCount}" readonly />
	</td>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.eqdescription'/>:</td>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.eqdescription'/>" class="input-300px" value="${bean.meetingRoom.eqdescription}" readonly />
	</td>
</tr>

<tr>
	<!--客开胡超 会议添加参会领导和预计参会人员申请联系方式 start 2020-4-7 -->
	<td width="12%" nowrap="nowrap" class="bg-gray">参会领导:</td>
	<c:set var="isProxy" value="${proxy?'proxy-true':'' }"/>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.joinCount'/>" class="input-300px" value="${leaderNames}" readonly />
	</td>
	<td width="12%" nowrap="nowrap" class="bg-gray">申请人联系方式:</td>
	<c:set var="isProxy" value="${proxy?'proxy-true':'' }"/>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.joinCount'/>" class="input-300px" value="${phone}" readonly />
	</td>
	<!--客开胡超 会议添加参会领导和预计参会人员申请联系方式 end  2020-4-7-->
</tr>
<tr>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.joinCount'/>:</td>
	<c:set var="isProxy" value="${proxy?'proxy-true':'' }"/>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.joinCount'/>" class="input-300px" value="${count}" readonly />
	</td>
	<!--客开胡超 会议添加参会领导和预计参会人员申请联系方式 start 2020-4-7 -->
	<td width="12%" nowrap="nowrap" class="bg-gray">预计参会人数:</td>
	<c:set var="isProxy" value="${proxy?'proxy-true':'' }"/>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.joinCount'/>" class="input-300px" value="${numbers}" readonly />
	</td>
	<!--客开胡超 会议添加参会领导和预计参会人员申请联系方式 end  2020-4-7-->
</tr>
	
<tr>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.meetingRoomUse'/>:</td>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }" style="height:40px;">
		<textarea rows="2" cols="" name="app_description" style="width:100%;">${bean.meetingRoomApp.description}</textarea>
	</td>

	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.place'/>:</td>
	<c:set var="isProxy" value="${proxy?'proxy-true':'' }"/>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }" style="vertical-align:top; padding-top:3px;">
		<input type="text" name="asset_name" inputName="<fmt:message key='mr.label.place'/>" class="input-300px" value="${v3x:toHTML(bean.meetingRoom.place)}" readonly />
	</td>	
</tr>
	
<tr>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key="mr.label.room.photo"/>:</td>
	<td width="35%" nowrap="nowrap" class="new-column" style="height: 170px">
		<span style="width: 180px; height: 156px; text-align: center; ">
			<c:choose>
				<c:when test="${not empty imageIds}">
					<div class="contentText" style="width: 180px; height: 156px; text-align: center;border:1px #CCC solid;" > 
						<c:forEach var="imgid" items="${attatchImage}" varStatus="vs">
							<fmt:formatDate var="imageDate" pattern="yyyy-MM-dd" value="${imgid==null ? null : imgid.createdate}" />
							<html:link renderURL="/fileUpload.do?method=showRTE&fileId=${imgid.fileUrl}&createDate=${imageDate}&type=image" var="imgURL" />
							<c:set value="${imgURL}" var="_url"/>
							<c:choose>
								<c:when test="${vs.count==1}">
									<img id="imageId_${vs.count}" src="${_url}"  style="width:180px; height:156px;" showId="${imgURL}" showDate="${imageDate}" fileName="${imgid.filename}" title='<fmt:message key="mr.label.room.seemore"/>'/>
								</c:when>
								<c:otherwise>
									<img id="imageId_${vs.count}" src="${_url}"  style="display:none;width:180px; height:156px;" showId="${imgURL}" showDate="${imageDate}" fileName="${imgid.filename}" title='<fmt:message key="mr.label.room.seemore"/>'/>
								</c:otherwise>
								</c:choose>
						</c:forEach>
					</div>
				</c:when>
				<c:otherwise>
					<img id="imageId" src="<c:url value='/apps_res/meetingroom/images/no_picture.png'/>" width="180px;" height="156px;" />
				</c:otherwise>
			</c:choose>
		</span>
		<input type="hidden" id="image" name="image" value="${imageIds==null ? null : imageIds }"/>
	</td>
	<%-- 会议用品 --%>
	<c:if test="${resourcesName!=''}">
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key="mt.resource"/>:</td>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
		<textarea name="asset_name" inputName="<fmt:message key='mt.resource'/>"style="width:302px;height: 156px; white-space:normal;" readonly >${resourcesName}</textarea>
	</td>
	</c:if>
</tr>
	
<tr>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key="mr.label.reviewPerson"/>:</td>
	<td width="35%" nowrap="nowrap" class="new-column ${isProxy }">
		<c:set var="isValid" value="${v3x:getMember(bean.meetingRoom.perId).isValid}"/>
		<a href="#" onclick="displayPeopleCard('${bean.meetingRoom.perId }','${isValid}')" style="color:#000;">${v3x:toHTML(v3x:showOrgEntitiesOfIds(peradmin, 'Member', ''))}</a>
    	<c:if test="${not empty proxyName}">
        	<font color="red"> (<fmt:message key="mr.agent.label1"><fmt:param>${v3x:toHTML(proxyName)}</fmt:param></fmt:message>)</font>
		</c:if>
	</td>
</tr>
	
<tr>
	<td width="12%" nowrap="nowrap" class="bg-gray">&nbsp;</td>
	<td width="35%" colspan="3" nowrap="nowrap" class="new-column">
		<label for="permStatus1">
		<input type="radio" id="permStatus1" name="permStatus" value="1" ${bean.meetingRoomPerm.isAllowed != 2 ? "checked" : "" } />
		<fmt:message key='mr.label.allowed'/>&nbsp;&nbsp;</label>
		
		<label for="permStatus2">
		<input type="radio" id="permStatus2" name="permStatus" value="2" ${bean.meetingRoomPerm.isAllowed == 2 ? "checked" : "" } />
		<fmt:message key='mr.label.notallowed'/>
		</label>
	</td>
</tr>
	
<tr>
	<td width="12%" nowrap="nowrap" class="bg-gray"><fmt:message key='mr.label.note'/>:</td>
	<td width="82%" colspan="3" nowrap="nowrap" class="new-column">
		<textarea name="description" inputName="<fmt:message key='mr.label.note'/>" validate="maxLength" maxSize="85" style="width:716px;height: 80px;">${bean.meetingRoomPerm.description }</textarea>
	</td>
</tr>

</table>

</div>

<div id="bottom_button_area" class="bg-advance-bottom border-top" align="center" style="position:absolute;bottom:0;width:100%;line-height:42px;background:#F3F3F3;">
	<input type="button" onclick="doSubmit()" class="button-default-2 button-default_emphasize" value="<fmt:message key='common.button.ok.label' bundle="${v3xCommonI18N}" />" />&nbsp;
	<input type="button" onclick="javascript:parent.listFrame.location.reload()" class="button-default-2" value="<fmt:message key='common.button.cancel.label' bundle="${v3xCommonI18N}" />" />
</div>

</form>

<iframe name="hiddenIframe" style="display:none"></iframe>

<script type="text/javascript">
getDetailPageBreak();
</script>

</body>
</html>
