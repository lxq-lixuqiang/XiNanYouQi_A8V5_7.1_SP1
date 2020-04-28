<%@ page isELIgnored="false"%>
<%@ page import="com.seeyon.ctp.portal.po.*"%>
<%@ taglib prefix="ctp" uri="http://www.seeyon.com/ctp"%>
<%
response.setHeader("Pragma", "No-cache");
response.setHeader("Cache-Control", "no-store");
response.setDateHeader("Expires", -1);
PortalLinkSystem ls = (PortalLinkSystem) request.getAttribute("link");
response.addHeader("X-XSS-Protection","0");
response.setContentType("text/html;charset=" + ls.getTargetCharset());
%>
<%@ include file="/WEB-INF/jsp/common/common.jsp"%>

<html>
<head>
<title></title>
<meta http-equiv="Content-Type" content="text/html; charset=<%=ls.getTargetCharset()%>">
<META HTTP-EQUIV="Pragma" CONTENT="no-cache"> 
<META HTTP-EQUIV="Cache-Control" CONTENT="no-cache"> 
<META HTTP-EQUIV="Expires" CONTENT="-1">
</head>
<script type="text/javascript">
var contpath = "${pageContext.request.contextPath}";
var _linkURL='${linkURL}';
var v3x = new V3X();
v3x.init("${pageContext.request.contextPath}", "${v3x:getLanguage(pageContext.request)}");
_ = v3x.getMessage;
v3x.loadLanguage("/apps_res/link/i18n");
if('false' == '${dataExist}'){	
   alert(v3x.getMessage("LinkLang.link_has_been_deleted"));
   window.close();
}
</script>

<body>
 <form action="${link.url}" method="${link.method}" id="theForm" name="theForm" accept-charset="${link.targetCharset}" >
	<c:forEach var="vo" items="${optionVos}">
		<input type="hidden" value="<c:out value='${vo.value.value}' escapeXml='true' />" id="${vo.option.paramSign}" name="${vo.option.paramSign}" />
	</c:forEach>
</form>
<c:set var="targetUrl" value="${linkSpaceOrSectionVO == null? link.url:linkSpaceOrSectionVO['targetPageUrl']}"></c:set>
<c:if test="${ fn:length(fn:trim(link.agentUrl)) > 0 }">
<%-- 向SSOPROXY发送请求 --%>
<form action="${ctp:evalFormulaString(link.agentUrl)}" method="POST" id="targetForm" name="targetForm"  >
	<input type="hidden" value="${targetUrl}" id="targetUrl" name="targetUrl" />
	<input type="hidden" value="${link.url}" id="ssoUrl" name="ssoUrl" />
	<c:forEach var="vo" items="${optionVos}">
        <input type="hidden" value="<c:out value='${ctp:evalFormulaString(vo.value.value)}' escapeXml='true' />" id="${vo.option.paramSign}" name="${vo.option.paramSign}" />
    </c:forEach>
	<input type="hidden" value="<c:out value='${contentForCheck}' escapeXml='true' />" id="content4Check" name="content4Check" />
	<input type="hidden" value="<c:out value='${link.targetCharset}' escapeXml='true' />" id="targetCharset" name="targetCharset" />
	<input type="hidden" value="${link.method}" id="ssoLoginMethod" name="ssoLoginMethod" />
	<input type="hidden" value="${wrongConfigPrompt}" id="wrongConfigPrompt" name="wrongConfigPrompt" />
	<input type="hidden" value="${longPrompt}" id="longPrompt" name="longPrompt" />
</form>
</c:if>

<script type="text/javascript">
alert("123465")
    var _theForm = document.getElementById("theForm");
	var targetForm = document.getElementById("targetForm");
	if(_theForm){
	  if($.trim("${contentForCheck}") != ""){
	    //如果需要内容检查
		if(${ fn:length(fn:trim(link.agentUrl)) } > 0){
		  //如果不在同一个域
		  targetForm.submit();
		} else {
		  _theForm.action = '${ctp:evalFormulaString(targetUrl)}';
		  if("${ctp:escapeJavascript(target)}" == "mainFrame"){
		    theForm.target = parent.main;
		  }
		  if("${link.method}" == "get"){
			  if(${fn:length(optionVos)} > 0){
		          self.location.href = '${ctp:evalFormulaString(targetUrl)}?<c:forEach var="vo" items="${optionVos}" varStatus="status">${vo.option.paramSign}=${ctp:evalFormulaString(vo.value.value)}<c:if test="${!status.last}">&</c:if></c:forEach>';
		      } else {
		          self.location.href = '${ctp:evalFormulaString(targetUrl)}';
		      }
		  } else {
		    theForm.submit();
		  }
		}
	  } else {
        //直接访问目标页面
	    _theForm.action = '${ctp:evalFormulaString(targetUrl)}';
	    if("${ctp:escapeJavascript(target)}" == "mainFrame"){
	      theForm.target = parent.main;
	    }
	    if("${link.method}" == "get"){
	    	if(${fn:length(optionVos)} > 0){
	    		self.location.href = '${ctp:evalFormulaString(targetUrl)}?<c:forEach var="vo" items="${optionVos}" varStatus="status">${vo.option.paramSign}=${ctp:evalFormulaString(vo.value.value)}<c:if test="${!status.last}">&</c:if></c:forEach>';
	        } else {
	            self.location.href = '${ctp:evalFormulaString(targetUrl)}';
	        }
	    } else {
	      theForm.submit();
	    }
	  }
	}	
</script>

</body>
</html>