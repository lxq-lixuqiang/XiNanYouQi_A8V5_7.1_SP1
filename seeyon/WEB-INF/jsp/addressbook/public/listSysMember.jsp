<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://v3x.seeyon.com/taglib/core" prefix="v3x"%>
<%@ include file="../header.jsp"%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<script type="text/javascript">
	//getA8Top().showLocation(1006,"<fmt:message key='addressbook.team.system.label' />");
</script>
<script type="text/javascript" src="<c:url value='/apps_res/addressbook/js/public.js${v3x:resSuffix()}'/>"></script>
<script src="<c:url value="/common/waterMark/js/waterMark.js${v3x:resSuffix()}" />"></script>
<link type="text/css" rel="stylesheet" href="<c:url value='/apps_res/doc/css/docMenu.css${v3x:resSuffix()}' />">
<link rel="stylesheet" type="text/css" href="<c:url value="/common/css/layout.css${v3x:resSuffix()}" />">
</head>
<body scroll="no" onresize="resizeRightBody(500,'treeandlist','60%')" onclick="parent.hideMenu();">

<div class="main_div_row2" id="listMember_div">
	<script type="text/javascript" charset="UTF-8" src="<c:url value="/apps_res/addressbook/js/addressbook.js${v3x:resSuffix()}"/>"></script>
	<script type="text/javascript">
		var rightMenu = new RightMenu("${pageContext.request.contextPath}");
		<c:if test="${v3x:hasPlugin('uc')}">
            //rightMenu.AddItem("sendMessage","<fmt:message key='message.sendDialog.title'  />","<c:url value='/apps_res/v3xmain/images/online.gif'/>","rbpm","sendMessage","sendMessage");
        </c:if>
		<c:if test="${isCanSendSMS}">
		    rightMenu.AddItem("sendSMS", "<fmt:message key='top.alt.sendMobileMsg' bundle='${v3xMainI18N}' />", [6,3] ,"rbpm","sendSMS","sendSMS");
        </c:if>
		rightMenu.AddItem("sendMail", "<fmt:message key='addressbook.email.label' />", "<c:url value='/common/images/left/icon/fayoujian.gif'/>","rbpm","sendMail","sendMail");
		document.writeln(rightMenu.GetMenu());
        var waterMarkImg = '';
        var waterMarkImgP = '';
        window.onload = function(){
            addWaterMark({"appType": "addressbook","isMobile":false,"imgInfo":true},function(result){
                if(result && (result.show === true || result.print === true)){
                    var waterMarkImgRv = result.img;
                    var printImg = result.printImg;
                    if(waterMarkImgRv !== ''){
                        waterMarkImg = waterMarkImgRv;
                    }
                    if(printImg !== ''){
                        waterMarkImgP = printImg;
                    }
                    if(waterMarkImg!==""){
                        $(".bDiv").css("background-image","url("+waterMarkImg+")");
                    }
                }
            });
        };
	</script>
  <div class="right_div_row2">
  	<input type="hidden" id="isTeamManager" value="${v3x:toHTML(isTeamManager)}" />
  	<input type="hidden" id="teamId" value="${v3x:toHTML(teamId)}" />
    <div class="top_div_row2"><%@ include file="../toolbar.jsp"%></div>
    <div class="center_div_row2" id="scrollListDiv" style="overflow: hidden;top:40px;">
    <div style="margin:0 10px;">
      <input type="hidden" id="resultCount" value="${resultCount}" />
<form id="memberform" method="post">
				<v3x:table data="${members}" var="member" leastSize="0" htmlId="memberlist" showHeader="true" showPager="true" className="sort ellipsis"  isChangeTRColor="false">
					<v3x:column width="5%" align="left" label="<input type='checkbox' onclick='selectAll(this, \"id\")'/>">
						<input type='checkbox' style="float: left; margin-top: 4px;" name='id' value="<c:out value="${member.v3xOrgMember.id}"/>" userName="<c:out value="${member.v3xOrgMember.name}" />"/>
					</v3x:column>
				<c:set var="click" value="showV3XMemberCard('${member.v3xOrgMember.id}',window)"/>				
				<c:set var="memberName" value="${member.v3xOrgMember.name}"/>
				<c:choose>
					<c:when test="${member.v3xOrgMember.telNumber != '' || member.v3xOrgMember.emailAddress != ''}">
						<c:set var="onmouseover" value="showEditImage('${member.v3xOrgMember.id }')"/>
						<c:set var="onmouseout" value="removeEditImage('${member.v3xOrgMember.id }')"/>
					</c:when>
					<c:otherwise>
						<c:set var="onmouseover" value=""/>
						<c:set var="onmouseout" value=""/>
					</c:otherwise>
				</c:choose>		
				<v3x:column  align="left" width="15%" label="addressbook.username.label"  onmouseover="${onmouseover }" onmouseout="${onmouseout }" className="sort"   type="string">
					<a class="defaulttitlecss div-float" title="${v3x:toHTML(memberName)}" href="javascript:${click}">${v3x:toHTML(memberName)} </a>
					<div class="div-float-right" id="edit${member.v3xOrgMember.id }" onclick="OnMouseUp(new AddressBook('${member.v3xOrgMember.id}','${member.v3xOrgMember.telNumber }','${member.v3xOrgMember.emailAddress }','${v3x:toHTML(member.v3xOrgMember.name)}'))" title="<fmt:message key='addressbook.done.label' />" ></div>
				</v3x:column>
                <c:if test="${addressBookSet.gender}">
                    <v3x:column align="left" width="6%" label="addressbook.gender.label" type="string"
                                className="sort" alt="${member.gender }">
                        ${member.gender }&nbsp;
                    </v3x:column>
                </c:if>
                
                <!-- 中国石油天然气股份有限公司西南油气田分公司  【增加显示单位信息(单位字段)】  lixuqiang 2020年5月8日 start -->
                <v3x:column  width="20%" align="left" label="单位" type="string"
				 className="cursor-hand sort" alt="${v3x:getAccount(member.v3xOrgMember.orgAccountId).shortName}" value="${v3x:getAccount(member.v3xOrgMember.orgAccountId).shortName}">
				</v3x:column>
                <!-- 中国石油天然气股份有限公司西南油气田分公司  【增加显示单位信息(单位字段)】  lixuqiang 2020年5月8日 end -->
  
				<v3x:column  align="left" width="15%" label="addressbook.company.department.label" type="string"
				value="${v3x:showDepartmentFullPath(member.v3xOrgMember.orgDepartmentId)}" className="cursor-hand sort"
				 alt="${v3x:showDepartmentFullPath(member.v3xOrgMember.orgDepartmentId)}">
                </v3x:column>
                
                <c:if test="${addressBookSet.memberPost}">
                <v3x:column align="left" width="15%" label="addressbook.company.post.label" type="string"
                    value="${member.postName}" className="sort" alt="${member.postName}" >
                </v3x:column>
                </c:if>
                <c:if test="${addressBookSet.memberSecondPost}">
				<v3x:column align="left" width="15%" label="addressbook.account_form.secondPost.label" type="string"
				value="${member.secondPosts}" className="sort" alt="${member.secondPosts}" >
				</v3x:column>
            	</c:if>
                <c:if test="${addressBookSet.memberLevel}">
                <v3x:column align="left" width="15%"  label="addressbook.company.level.label${v3x:suffix()}" type="string"
                    value="${member.levelName}" className="sort" alt="${member.levelName}" >
                </v3x:column>
                </c:if>
                <c:if test="${addressBookSet.memberPhone}">
                <v3x:column align="left" width="10%"  label="addressbook.company.telephone.label" type="string"
                    className="cursor-hand sort" alt="${member.v3xOrgMember.officeNum}" >
                 ${v3x:toHTML(member.v3xOrgMember.officeNum) } &nbsp;
                </v3x:column>
                </c:if>
                <c:if test="${addressBookSet.memberMobile}">
                <v3x:column align="left" width="10%" label="addressbook.mobilephone.label" type="string"
                    className="cursor-hand sort" alt="${member.mobilePhone }">
                 ${member.mobilePhone } &nbsp;
                </v3x:column>
                </c:if>
                <c:if test="${addressBookSet.memberEmail}">
                <v3x:column align="left" width="10%" label="addressbook.company.email.label" type="string"
                    className="cursor-hand sort" alt="${member.v3xOrgMember.emailAddress }">
                 ${member.v3xOrgMember.emailAddress } &nbsp;
                </v3x:column>
                </c:if>
                <c:if test="${addressBookSet.memberWX}">
                <v3x:column align="left" width="10%" label="addressbook.weixin.label" type="string"
                    className="cursor-hand sort" alt="${member.v3xOrgMember.weixin }">
                 ${member.v3xOrgMember.weixin } &nbsp;
                </v3x:column>
                </c:if>
                <c:if test="${addressBookSet.memberWB}">
                <v3x:column align="left" width="10%" label="addressbook.weibo.label" type="string"
                    className="cursor-hand sort" alt="${member.v3xOrgMember.weibo }">
                 ${member.v3xOrgMember.weibo } &nbsp;
                </v3x:column>
                </c:if>
                <c:if test="${addressBookSet.memberHome}">
                <v3x:column align="left" width="10%" label="addressbook.address.label" type="string"
                    className="cursor-hand sort" alt="${member.v3xOrgMember.address }">
                 ${member.v3xOrgMember.address } &nbsp;
                </v3x:column>
                </c:if>
                <c:if test="${addressBookSet.memberCode}">
                <v3x:column align="left" width="10%" label="addressbook.postalcode.label" type="string"
                    className="cursor-hand sort" alt="${member.v3xOrgMember.postalcode }">
                 ${member.v3xOrgMember.postalcode } &nbsp;
                </v3x:column>
                </c:if>
                <c:if test="${addressBookSet.memberAddress}">
                <v3x:column align="left" width="10%" label="addressbook.postAddress.label" type="string"
                    className="cursor-hand sort" alt="${member.v3xOrgMember.postAddress }">
                 ${member.v3xOrgMember.postAddress } &nbsp;
                </v3x:column>
                </c:if>
                <c:if test="${addressBookSet.workLocal}">
                <v3x:column align="left" width="15%"  label="addressbook.company.worklocal.label" type="string"
                    value="${member.worklocalStr}" className="sort" alt="${member.worklocalStr}" >
                </v3x:column>
                </c:if>
             <c:forEach items="${bean}" var="bean" varStatus="status">
	 	     <v3x:column align="left" width="28%" label="${v3x:toHTML(bean.label)}" type="string" className="sort">
              <c:forEach items="${member.customerAddressbookValueMap}" var="valueMap" varStatus="status">
                     <c:if test="${valueMap.key==bean.id}">
                        ${valueMap.value}
                     </c:if>
		     </c:forEach>
		  	 &nbsp;
            </v3x:column>
		  	</c:forEach>
			</v3x:table>
			</form>
			<iframe id="theLogIframe" name="theLogIframe" frameborder="0" marginheight="0" marginwidth="0" ></iframe>
    </div>
    </div>
  </div>
</div>
<script>
initIpadScroll("listMember_div",520,700);
</script>
</body>
</html>