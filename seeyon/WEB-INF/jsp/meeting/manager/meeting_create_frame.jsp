<!DOCTYPE html>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<html class="h100b over_hidden">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <script type="text/javascript">
        if(typeof Set!="undefined"){
            var SysSet=Set;
        }
    </script>
    <%@ include file="../include/meeting_taglib.jsp"%>
    <%@ include file="../include/meeting_header.jsp"%>
    <%@ include file="meeting_create_js.jsp"%>
    <script type="text/javascript" charset="UTF-8" src="<c:url value="/apps_res/meeting/js/meetingPeople.js${v3x:resSuffix()}" />"></script>
    <script type="text/javascript" charset="UTF-8" src="<c:url value="/apps_res/meeting/js/meetingNew.js${v3x:resSuffix()}" />"></script>
    <title>${fn:escapeXml(titleLabel)}</title>
    <script type="text/javascript">
        var myBar = new WebFXMenuBar(_path);
        //保存
        if(pageX.meeting.state == 0) {
            myBar.add(new WebFXMenuButton("save", pageX.i18n.saveBtnLabel, "", [1,5], "", null));
        }
        var action = "${v3x:escapeJavascript(newVo.action)}";
        var isWaitSend = "${v3x:escapeJavascript(isWaitSend)}";
        //栏目会议室看板
        var openFrom="${v3x:escapeJavascript(openFrom)}";
        var roomParam = "${v3x:escapeJavascript(roomParam)}";
        var isPortalSection = openFrom == 'portalRoomApp';

        if(!(action !=undefined && action == "edit") || (isWaitSend !=undefined && isWaitSend == "0")){
            //调用模板
            myBar.add(new WebFXMenuButton("loadTemplate", pageX.i18n.openTemplateBtnLabel, "", [3,7], "", null));
        }
        //保存模板
        myBar.add(new WebFXMenuButton("saveAs", pageX.i18n.saveAsBtnLabel, "", [3,5], "", null));
        //正文类型
        var bodyTypeSelector;
        myBar.add(${v3x:bodyTypeSelector("v3x")});
        if(bodyTypeSelector) {
            bodyTypeSelector.disabled("menu_bodytype_" + pageX.meeting.dataFormat);
        }
        $(function(){
            $("html").addClass("h100b over_hidden");
        });
    </script>
    <style>
        tr {
            line-height: 28px;
        }

        th {
            width: 50px;
            align: right;
            white-space: nowrap;
        }
        th.firstLine{
            padding-left: 15px;
        }

        td {
            align: left;
            white-space: nowrap;
        }
        /* 正文类型浮动框受tr样式影响，导致间距过大，添加样式修正 */
        #webfx-menu-object-2 tr {
            line-height: 16px;
        }

        #webfx-menu-object-2 tr img.toolbar-button-icon {
            margin-top: 0px;
        }
        .meeting-icon-help{
            display: inline-block;
            width: 20px;
            height: 20px;
            position: relative;
            top: 5px;
            background: url(<c:url value="/apps_res/meeting/images/help.png" />) center center no-repeat;
        }
        .padding_r_5{
        	text-align: right;
        }
        .bg-gray {
		    padding-right: 0px;
		}
    </style>
</head>
<body class="h100b over_hidden">
<div class="newDiv h100b w100b">
    <form id="dataForm" name="dataForm" action="meeting.do" method="post" class="h100b w100b">
        <input type="hidden" id="method" name="method" value="send" />
        <input type="hidden" name="CSRFTOKEN" value="${sessionScope['CSRFTOKEN']}" />
        <!-- 页面入口参数 -->
        <input type="hidden" id="isOpenWindow" name="isOpenWindow" value="" />
        <input type="hidden" id="actionName" name="actionName" value="${fn:escapeXml(newVo.action)}"/>
        <!-- 会议主表元素 -->
        <input type="hidden" id="id" name="id" value="${newVo.meeting.id }" /> <input type="hidden" id="templateId" name="templateId" value="${newVo.meeting.templateId }" /> <input type="hidden" id="bodyType" name="bodyType" value="${newVo.meeting.dataFormat }" /> <input type="hidden" id="category" name="category" value="${newVo.meeting.category }" /> <input type="hidden" id="isHasAtt" name="isHasAtt" value="" />
        <!-- 图形化会议室 -->
        <input type="hidden" id="roomNeedApp" name="roomNeedApp" value="${fn:escapeXml(newVo.roomNeedApp)}" /> <input type="hidden" id="roomId" name="roomId" value="${fn:escapeXml(newVo.roomId)}" /> <input type="hidden" id="oldRoomId" name="oldRoomId" value="${fn:escapeXml(newVo.roomId)}" /> <input type="hidden" id="roomAppId" name="roomAppId" value="${fn:escapeXml(newVo.roomAppId)}" /><input type="hidden" id="oldRoomAppId" name="oldRoomAppId" value="${newVo.meetingRoomApp.id}" /> <input type="hidden" id="roomAppBeginDate" name="roomAppBeginDate" value="${ctp:formatDateTime(newVo.meetingRoomApp.startDatetime)}" /> <input type="hidden" id="roomAppEndDate" name="roomAppEndDate" value="${ctp:formatDateTime(newVo.meetingRoomApp.endDatetime)}" />
        <!-- 手工输入地址 -->
        <input type="hidden" id="meetingPlace" name="meetingPlace" value="${newVo.meeting.meetPlace}" />
        <input type="hidden" id="mtPlaceDefaultText"  name="mtPlaceDefaultText" value="${fn:escapeXml(roomInput)}"/>
        <!-- 周期性会议设置 -->
        <input type="hidden" id="periodicityId" name="periodicityId" value="${newVo.periodicity.id }" /> <input type="hidden" id="periodicityType" name="periodicityType" value="${newVo.periodicity.periodicityType }" /> <input type="hidden" id="periodicityScope" name="periodicityScope" value="${newVo.periodicity.scope }" /> <input type="hidden" id="periodicityStartDate" name="periodicityStartDate" value="${periodicityStartDateValue }" /> <input type="hidden" id="periodicityEndDate" name="periodicityEndDate" value="${periodicityEndDateValue }" /> <input type="hidden" id="isBatch" name="isBatch" value="${fn:escapeXml(newVo.isBatch) }" />
        <input type="hidden" id="oldPeriodicityType" name="oldPeriodicityType" value="${newVo.periodicity.periodicityType }" /> <input type="hidden" id="oldPeriodicityScope" name="oldPeriodicityScope" value="${newVo.periodicity.scope }" /> <input type="hidden" id="oldPeriodicityStartDate" name="oldPeriodicityStartDate" value="${periodicityStartDateValue }" /> <input type="hidden" id="oldPeriodicityEndDate" name="oldPeriodicityEndDate" value="${periodicityEndDateValue }" />
        <!-- 区分调用模板与会议格式 -->
        <input type="hidden" id="openFrom" name="openFrom" value="" />
        <!-- 转发会议参数 -->
        <input type="hidden" id="appAffairId" name="appAffairId" value="${fn:escapeXml(newVo.appAffairId) }" /> <input type="hidden" id="appSummaryId" name="appSummaryId" value="${fn:escapeXml(newVo.appSummaryId) }" /> <input type="hidden" id="appName" name="appName" value="${fn:escapeXml(newVo.appName) }" />
        <!-- 从主体直接新建会议传递的appid -->
        <input type="hidden" id="portalRoomAppId" name="portalRoomAppId"/>
        <%--这个是设置周期性后，通过ajax计算出所有会议日期，用于图形化会议中(显示出所有周期会议有关选中的会议室) --%>
        <input type="hidden" id="periodicityDates" />
        <input type="hidden" id="checkRoomChangeFlag"  name="checkRoomChangeFlag" value="true"/>
        <!-- 视频会议室相关参数 -->
        <input type="hidden" id="videoRoomId"  name="videoRoomId" value="${fn:escapeXml(newVo.videoRoomId)}"/>
        <input type="hidden" id="oldVideoRoomAppId"  name="oldVideoRoomAppId" value="${fn:escapeXml(newVo.videoRoomAppId)}"/>
        <input type="hidden" id="videoRoomName"  name="videoRoomName" value="${fn:escapeXml(newVo.videoRoomName)}"/>
        <input type="hidden" id="videoRoomAppBeginDate"  name="videoRoomAppBeginDate" value="${fn:escapeXml(videoRoomAppBeginDate)}"/>
        <input type="hidden" id="videoRoomAppEndDate"  name="videoRoomAppEndDate" value="${fn:escapeXml(videoRoomAppEndDate)}"/>

        <!-- toolbar内容 -->
        <div id="toolbar-div" class="w100b">
            <div class="webfx-menu-bar" style="background: #f1f1f1; border: none;">
                <script>document.write(myBar);</script>
            </div>
        </div>
        <%-- 会议字段内容 --%>
        <div id="meeting-fields-div" class="w100b" style="background: #f7f7f7; padding: 10px 0 5px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" id="contentTable" style="background: #f7f7f7;border-spacing: 5px;">
                <tr>
                    <!-- 发送 -->
                    <td rowspan="3" style="width: 5%; padding-left: 10px;"><a id="send" class="align_center display_inline-block new_btn" style="line-height: 26px;margin-top: -36px;">${sendBtn }</a></td>
                    <!-- 会议名称 -->
                    <th class="firstLine" style="width: 30px;">
                        <div class="padding_r_5">${fn:escapeXml(subjectLabel)}${fn:escapeXml(colonLabel)}</div>
                    </th>
                    <td colspan="3">
                        <div class="common_txtbox_wrap">
                            <input type="text" class="validate" id="title" name="title" value="${fn:escapeXml(newVo.meeting.title)}" maxlength="60" validate="notNull,isDefaultValue" placeholder="${subjectDefaultLabel}"/>
                        </div>
                    </td>
                    <!-- 开始时间 -->
                    <th>
                        <div class="padding_r_5">${fn:escapeXml(beginDateLabel) }${colonLabel}</div>
                    </th>
                    <td style="width: 120px;">
                        <div class="common_txtbox_wrap">
                            <input type="text" class="cursor-hand" name="beginDate" id="beginDate" value="${fn:escapeXml(beginDateValue) }" readonly validate="notNull" />
                        </div>
                    </td>
                    <!-- 结束时间 -->
                    <th style="padding-left:0px;">
                        <div class="padding_r_5">${fn:escapeXml(endDateLabel) }${colonLabel }</div>
                    </th>
                    <td colspan="2" style="min-width: 120px;">
                        <div class="common_txtbox_wrap">
                            <input type="text" class="cursor-hand" name="endDate" id="endDate" value="${fn:escapeXml(endDateValue) }" readonly validate="notNull" />
                        </div>
                    </td>
                    <%-- 周期性 --%>
                    <td style="width: 70px;"><span class="padding_l_20"> <a id="cycleA" class="common_button common_button_icon comp"> <em class="ico16 cycleMeeting_16"></em> <fmt:message key='mt.periodic' />
							</a>
						</span></td>
                    <th colspan="4" align="left">
                        <%--签到二维码--%>
                        <div style="display: inline-block;width: 50%">
                            <input type="checkbox" id="qrCodeSign" name="qrCodeSign" value="1" <c:if test="${newVo.meeting.qrCodeSign==1}">checked</c:if>/>
                            <span>${ctp:i18n("meeting.screen.page.label.signqrcode")}</span>
                            <a href="#" title="${ctp:i18n("meeting.common.label.signQRCodeTips")}"><span class="meeting-icon-help"></span></a>
                        </div>
                        <%--外部会议--%>
                        <div style="display: inline-block;width: 50%;visibility:<c:if test="${!enablePublicMeeting}">hidden;</c:if>">
                            <input type="checkbox" name="isPublic" value="1" <c:if test="${newVo.meeting.isPublic==1}">checked</c:if>/>
                            <span>${ctp:i18n("meeting.common.label.externalMeeting")}</span>
                            <a href="#" title="${ctp:i18n("meeting.common.label.externalMeetingTips")}"><span class="meeting-icon-help"></span></a>
                        </div>
                    </th>
                    <td style="width: 70px">&nbsp;</td>
                </tr>
                <tr>
                	<!-- 中国石油天然气股份有限公司西南油气田分公司  【新建会议时增加“发起者、发起部门、联系方式”字段、发起人字段必填，默认是登录人，可以修改。】  lixuqiang 2020年4月29日 start -->
                    <!-- 发起者 -->
                    <th class="firstLine">
                        <div class="padding_r_5">发起者${colonLabel }</div>
                    </th>
                    <td>
                        <div style="min-width: 80px;" class="common_txtbox_wrap" >
                        	<input type="hidden" id="userId" name="userId" value="${user.id}" />
							<input type="text" class="cursor-hand" id="userName" name="userName" readonly="true" />
                        </div>
                    </td>
                    <!-- 中国石油天然气股份有限公司西南油气田分公司  【新建会议时增加“发起者、发起部门、联系方式”字段、发起人字段必填，默认是登录人，可以修改。】  lixuqiang 2020年4月29日 end -->
                            
                    <!-- 主持人 -->
                    <th>
                        <div class="padding_r_5">${emceeIdLabel }${colonLabel }</div>
                    </th>
                    <td>
                        <div class="common_txtbox_wrap">
                            <!-- 中国石油天然气股份有限公司西南油气田分公司  【新建会议时主持人和记录人不设置必填】  lixuqiang 2020年4月28日 start -->
                            <input type="hidden" id="emceeId" name="emceeId" value="${newVo.meeting.emceeId }" />
<input type="text" class="cursor-hand" id="emceeName" name="emceeName" readonly="true" />
                        	<!-- 中国石油天然气股份有限公司西南油气田分公司  【新建会议时主持人和记录人不设置必填】  lixuqiang 2020年4月28日 end -->
                        </div>
                    </td>
                    <!-- 记录人 -->
                    <th>
                        <div class="padding_r_5">${recorderIdLabel }${colonLabel }</div>
                    </th>
                    <td>
                        <div class="common_txtbox_wrap">
                            <input type="hidden" id="recorderId" name="recorderId" value="${newVo.meeting.recorderId }" /> <input type="text" class="cursor-hand" id="recorderName" name="recorderName" readonly="true" />
                        </div>
                    </td>
                    <!-- 会议地点 -->
                    <th>
                        <div class="padding_r_5">${placeLabel }${colonLabel }</div>
                    </th>
                    <td colspan="2" style="min-width: 200px;">
                        <div class="common_selectbox_wrap">
                            <select id="selectRoomType" name="selectRoomType">
                                <c:choose>
                                    <c:when test="${newVo.myMeetingroomAppedName != null}">
                                        <option value="${newVo.myMeetingroomAppedName.optionId }" option2Id="${newVo.myMeetingroomAppedName.option2Id }">${newVo.myMeetingroomAppedName.optionName }</option>
                                    </c:when>
                                    <c:otherwise>
                                        <c:if test="${isMeetingPlaceInputAble}">
                                            <option value="mtRoom">&lt;${ctp:i18n("mt.meMeeting.decription")}&gt;</option>
                                        </c:if>
                                        <c:if test="${!isMeetingPlaceInputAble}">
                                            <option value="mtRoom">&lt;${ctp:i18n("meeting.page.label.selectMeetingRoom")}&gt;</option>
                                        </c:if>
                                    </c:otherwise>
                                </c:choose>
                                <c:choose>
                                    <c:when test="${newVo.meeting.meetPlace!=null && newVo.meeting.meetPlace != ''}">
                                        <option value="mtPlace" selected="selected">${newVo.meeting.meetPlace }</option>
                                    </c:when>
                                    <c:otherwise>
                                        <c:if test="${isMeetingPlaceInputAble}">
                                            <option value="mtPlace">&lt;${roomInput }&gt;</option>
                                        </c:if>
                                    </c:otherwise>
                                </c:choose>
                                <c:forEach items="${newVo.meetingroomAppedNameList}" var="listVo">
                              
                                    <option value="${listVo.optionId }" option2Id="${listVo.option2Id }">${listVo.optionName }</option>
                                </c:forEach>
                            </select>
                        </div>
                    </td>
                    <!-- 申请会议室 -->
                    <td colspan="1"><c:if test="${newVo.isShowRoom}">
                        <div class="padding_l_20" style="width: 70px;">
                            <div id="chooseMeetingRoom" class="common_button common_button_icon comp" style="width: auto;"> <em class="ico16 process_16"> </em>${roomAppLabel }
                            </div>
                        </div>
                    </c:if>
                    </td>
                    <!-- 提前提醒 -->
                    <th>
                        <div class="padding_r_5">${beforeTimeLabel }${mtMtMeetingRemind }${colonLabel }</div>
                    </th>
                    <td colspan="1"><input type="hidden" id="remindFlag" name="remindFlag" value="${newVo.meeting.remindFlag}" />
                        <div class="common_selectbox_wrap">
                            <select style="width:70px;" id="beforeTime" name="beforeTime" onchange="changeRemindFlag(this)" value="${newVo.meeting.beforeTime}" align="right">
                                <v3x:metadataItem metadata="${newVo.meetingRemindTimeEnum}" showType="option" name="beforeTime" selected="${newVo.meeting.beforeTime}" />
                            </select>
                        </div>
                    </td>
                </tr>
                <tr>
                    <!-- 联系方式 -->
                    <th class="firstLine">
                        <div class="padding_r_5">联系方式${colonLabel }</div>
                    </th>
                    <td>
                        <div class="common_txtbox_wrap" style="background: #fff">
                            <input id="phoneInfo" disabled="disabled" style="background: #fff;color:#000;" name="phoneInfo" value="${userPhone}" type="text" />
                        </div>
                    </td>
                	<!-- 中国石油天然气股份有限公司西南油气田分公司  【参会领导字段放在与会人员前边，且该字段为非必填项】  lixuqiang 2020年4月28日 start -->
                    <th>
                        <div class="padding_r_5">${leaderLabel}${colonLabel }</div>
                    </th>
                    <td colspan="1.5">
                        <div class="common_txtbox_wrap">
                        <input type="hidden" id="leader" name="leader" value="${fn:escapeXml(leaderNameList )}" />
						<input type="text" id="leaderNames" name="leaderNames" value="${leaderDefaultLabel }" readonly="true"  defaultvalue="${leaderDefaultLabel }" onfocus="checkDefSubject(this,true)" onblur="checkDefSubject(this,true)" maxlength="85" />
                        </div>
                    </td>
                    <!-- 中国石油天然气股份有限公司西南油气田分公司  【参会领导字段放在与会人员前边，且该字段为非必填项】  lixuqiang 2020年4月28日 end -->
                    
                    <!-- 参会人员 -->
                    <th class="firstLine">
                        <div class="padding_r_5">${joinLabel }${colonLabel }</div>
                    </th>
                    <td colspan="1.5">
                        <div class="common_txtbox_wrap">
                            <input type="hidden" id="conferees" name="conferees" value="${fn:escapeXml(newVo.meeting.conferees)}" /> <input type="text" class="cursor-hand" id="confereesNames" name="confereesNames" readonly="true"  />
                        </div>
                    </td>
                    <!--客开胡超 会议人数展示 2020-04-15 start   -->
                    <th class="firstLine">
                        <div class="padding_r_5">预计人数${colonLabel }</div>
                    </th>
                    <td colspan="0.5">
                        <div class="common_txtbox_wrap">
                         <input type="number" class="cursor-hand" id="numbers" name="numbers" value ="${numbers}"  />
                        </div>
                    </td>
                    <!--客开胡超 会议人数展示 2020-04-15 end   -->
                    <!-- 告知人 -->
                    <th>
                        <div class="padding_r_5">${impartLabel }${colonLabel }</div>
                    </th>
                    <td colspan="1" style="width: 200px;">
                        <div class="common_txtbox_wrap">
                            <input type="hidden" id="impart" name="impart" value="${fn:escapeXml(newVo.meeting.impart)}" /> <input type="text" class="cursor-hand" id="impartNames" name="impartNames" readonly="true" />
                        </div>
                    </td>
                    <!--所属项目 -->
                    <th style="visibility:<c:if test="${!ctp:hasPlugin('project')}">hidden;</c:if>">
                        <div class="padding_r_5">${projectIdLabel }${colonLabel }</div>
                    </th>
                    <td colspan="3" style="visibility:<c:if test="${!ctp:hasPlugin('project')}">hidden;</c:if>">
                        <div class="common_selectbox_wrap">
                            <select id="projectId" name="projectId" class="input-100per">
                                <option value="-1" selected="true">&lt;${selectLabel }${projectIdLabel }&gt;</option>
                                <c:forEach items="${newVo.meetingProjectNameList}" var="listVo">
                                    <option value='${listVo.optionId}'>${v3x:toHTML(listVo.optionName)}</option>
                                </c:forEach>
                            </select>
                        </div>
                    </td>

                    <!-- 更多 -->
                    <td valign="middle" align="left" style="width: 70px"><a href="javascript:void(0);" id="show_more" class="margin_l_10" onclick="return false;"> <span class="ico16 arrow_2_t" style="margin-bottom: 2px;"></span>${moreLabel }
                    </a></td>
                </tr>
                <!--更多-->
                <tr class="newinfo_more">
                    <td style="width: 80px;">&nbsp;</td>
                    <!-- 发起部门 -->
                    <th class="firstLine">
                        <div class="padding_r_5" id="userDepartmentName">${userDepartmentName}${colonLabel }</div>
                    </th>
                    <td>
                        <div class="common_txtbox_wrap" style="background: #fff">
                            <input type="text" style="background: #fff;color:#000;" id="currentDepartment" disabled="disabled" name="currentDepartment" value="${userDepartment }"/>
                        </div>
                    </td>
                    <!-- 会议格式 -->
                    <th>
                        <div class="padding_r_5">${templateIdLabel }${colonLabel }</div>
                    </th>
                    <td>
                        <div style="min-width: 80px;" class="common_selectbox_wrap">
                            <select id="contentTemplateId" name="contentTemplateId" onclick="saveOldContentTemplateId()">
                                <option value="-1">&lt;${selectLabel }${templateIdLabel }&gt;</option>
                                <c:forEach items="${newVo.meetingContentTemplateNameList}" var="listVo">
                                    <option value='${listVo.optionId}'>${v3x:toHTML(listVo.optionName)}</option>
                                </c:forEach>
                            </select>
                        </div>
                    </td>
                    <%--会议用品 --%>
                    <th>
                        <div class="padding_r_5">${resourceLabel }${colonLabel }</div>
                    </th>
                    <td>
                        <div style="min-width: 80px;" class="common_txtbox_wrap">
                            <input type="hidden" id="resourcesId" name="resourcesId" value="${fn:escapeXml(newVo.resourcesId)}" /> <input type="text" id="resourcesName" name="resourcesName" value="${fn:escapeXml(newVo.resourcesName)}" readonly="readonly" class="cursor-hand" />
                        </div>
                    </td>
                    <c:if test="${!newVo.isChooseVideoMeetingRoom }">
                        <%--会议方式 --%>
                        <th>
                            <div class="padding_r_5">${meetingNatureLabel }${colonLabel }</div>
                        </th>
                        <td style="width: 130px;">
                            <div style="min-width: 80px;" class="common_selectbox_wrap clearfix">
                                <select id="meetingNature" name="meetingNature">
                                    <c:forEach items="${newVo.meetingNatureNameList}" var="listVo">
                                        <option value='${listVo.optionId}' title="${v3x:toHTML(listVo.optionName)}">${v3x:toHTML(listVo.optionName)}</option>
                                    </c:forEach>
                                </select>
                            </div>
                        </td>
                    </c:if>
                    <c:if test="${newVo.isChooseVideoMeetingRoom }">
                        <input type="hidden" id="meetingNature"  name="meetingNature" value="1"/>
                        <!-- 视频会议地点 -->
                        <th>
                            <div class="padding_r_5">${videoLabel } ${colonLabel }</div>
                        </th>
                        <td style="width: 130px;" colspan="3">
                            <div style="min-width: 80px;" class="common_txtbox_wrap">
                                <input type="text" class="cursor-hand" id="videoRoom" name="videoRoom" readonly="true" title="" inputname="${videoLabel }" placeholder="${videoPlaceholdLabel }" value="${fn:escapeXml(newVo.showVideoRoom)}">
                            </div>
                        </td>
                        <!-- 视频会议室 -->
                        <td style="width: 120px;">
                            <div class="padding_l_20" style="width: 70px;">
                                <div id="chooseVideoRoom" class="common_button common_button_icon comp" style="width: auto;"> <em class="ico16 process_16"> </em>${videoAppLabel }
                                </div>
                            </div>
                        </td>

                    </c:if>
                    <%--会议分类 --%>
                    <th style="padding-left:0px;">
                        <div class="padding_r_5">${categoryLabel }${colonLabel }</div>
                    </th>
                    <td colspan="${ctp:hasPlugin('sms') ? '1' : '3' }">
                        <div class="common_selectbox_wrap clearfix">
                            <select id="meetingTypeId" name="meetingTypeId">
                                <option value="-1"><fmt:message key="mt.meetingType.input" /></option>
                                <c:forEach items="${newVo.meetingTypeNameList}" var="listVo" varStatus="status">
                                    <c:if test="${status.count == 1}">
                                        <option value='${listVo.optionId}' selected title="${v3x:toHTML(listVo.optionName)}">${v3x:toHTML(listVo.optionName)}</option>
                                    </c:if>
                                    <c:if test="${status.count != 1}">
                                        <option value='${listVo.optionId}' title="${v3x:toHTML(listVo.optionName)}">${v3x:toHTML(listVo.optionName)}</option>
                                    </c:if>
                                </c:forEach>
                            </select>
                        </div>
                    </td>
                    <!-- 发送短信 -->
                    <c:if test="${ctp:hasPlugin('sms') }">
                        <th>
                            <div class="padding_r_5">${mtMtMeetingMessages}${colonLabel }</div>
                        </th>
                        <td style="width:4%;" colspan="3">
                            <div class="common_selectbox_wrap clearfix ">
                                <select align="right" id="SendTextMessages" name="SendTextMessages">
                                    <option value=1><fmt:message key="mt.mtMeeting.yes" /></option>
                                    <option value=0 selected="selected"><fmt:message key="mt.mtMeeting.no" /></option>
                                </select>
                            </div>
                        </td>
                    </c:if>
                    <td style="width: 70px">&nbsp;</td>
                </tr>
                <c:if test="${(v3x:hasPlugin('videoconference') || v3x:hasPlugin('mplus')) && newVo.isVideoEnable && newVo.isShowPassword}">
                    <tr id="passwordArea" class="hidden">
                        <td style="width: 80px;">&nbsp;</td>
                        <!-- 参会密码 -->
                        <th colspan="1" nowrap="nowrap" style="padding: 6px">
                            <div class="padding_r_5">${passwordLabel }${colonLabel }</div>
                        </th>
                        <td>
                            <div class="common_txtbox_wrap">
                                <input type="text" class="w100b" id="meetingPassword" name="meetingPassword" maxlength="10" value="${v3x:toHTML(bean.meetingPassword) }" />
                            </div>
                        </td>
                        <!-- 是否显示到会议视频列表 -->
                        <c:if test="${newVo.isShowOuterList }">
                            <th>&nbsp;</th>
                            <td colspan="7"><input type="checkbox" id="meetingCharacter" name="meetingCharacter" value="${newVo.meeting.meetingCharacter}" checked="${newVo.meeting.meetingCharacter }" /> ${characterLabel }</td>
                        </c:if>
                        <c:if test="${!newVo.isShowOuterList }">
                            <td colspan="8">&nbsp;
                            </th>
                        </c:if>
                        <td style="width: 70px">&nbsp;</td>
                    </tr>
                </c:if>
                <tr>
                    <td align="left" colspan="14">
							<span style="display: inline-block; margin-left: 100px; margin-top: 5px; margin-bottom: 5px;">
								<span class="font_size12 color_666 margin_r_20 hand" onclick="insertAttachment(null, null, '_insertAttCallback', 'false')"> <span class="ico16 affix_16 margin_b_5"></span>${ctp:i18n('mt.meeting.localfile')}
								</span>
								<span class="font_size12 color_666 hand" onclick="quoteDocument()"> <span class="ico16 associated_document_16 margin_b_5"></span>${ctp:i18n('mt.meeting.relative')}
								</span>
							</span>
                    </td>
                </tr>
                <tr id="attachment2TR" style="display: none; height: 32px; line-height: 32px;">
                    <td>&nbsp;</td>
                    <td nowrap="nowrap" height="18">
                        <!--< fmt:message key="common.mydocument.label" bundle="${v3xCommonI18N}" />: --> <span class="ico16 associated_document_16 margin_b_5 margin_r_5"></span>(<span id="attachment2NumberDiv"></span>)
                    </td>
                    <td colspan="12">
                        <div></div>
                        <div id="attachment2Area" style="overflow: auto; max-height: 70px;"></div>
                    </td>
                    <td>&nbsp;</td>
                </tr>
                <tr id="attachmentTR" style="display: none; height: 32px; line-height: 32px;">
                    <td>&nbsp;</td>
                    <td><span class="ico16 affix_16 margin_b_5"></span>(<span id="attachmentNumberDiv"></span>)</td>
                    <td class="value" colspan="12">
                        <div style="overflow: auto; max-height: 70px;">
                            <v3x:fileUpload originalAttsNeedClone="${fn:escapeXml(newVo.originalBodyNeedClone)}" attachments="${attachments}" canDeleteOriginalAtts="true" />
                        </div>
                    </td>
                    <td>&nbsp;</td>
                </tr>
            </table>
        </div>
        <div id="content-div" class="w100b">
            <div style="width: 100%;" class="newCreatDiv" id="scrollListMeetingDiv">
                <v3x:editor htmlId="content" content="${newVo.contentVo.content}" type="${newVo.contentVo.dataFormat}" originalNeedClone="${fn:escapeXml(newVo.originalBodyNeedClone)}" createDate="${newVo.contentVo.createDate}" category="<%=ApplicationCategoryEnum.meeting.getKey()%>" />
            </div>
        </div>
        
    </form>
</div>
<iframe name="hiddenIframe" width="0" height="0" style="display: none"></iframe>
</body>
</html>