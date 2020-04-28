<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<!-- 客开 胡超 会议相关处理 移除重复引用 2020-04-9 start-->
<%--  <%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>  --%>
<!-- 客开 胡超 会议相关处理 移除重复引用 2020-04-9 end -->
<%@ taglib uri="http://v3x.seeyon.com/taglib/core" prefix="v3x" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib uri="http://v3x.seeyon.com/bridges/spring-portlet-html" prefix="html" %>
<fmt:setBundle basename="com.seeyon.v3x.common.resources.i18n.SeeyonCommonResources" var="v3xCommonI18N"/>
<fmt:message key="common.date.pattern" var="datePattern" bundle="${v3xCommonI18N}"/>
<html:link renderURL='/meetingroom.do' var='mrUrl' />
<link rel="stylesheet" type="text/css" href="<c:url value="/common/css/default.css${v3x:resSuffix()}" />">

<%@ include file="/WEB-INF/jsp/ctp/portal/common/old_components_theme.jsp"%>

<link rel="stylesheet" type="text/css" href="<c:url value="/apps_res/meetingroom/meetingroom.css${v3x:resSuffix()}"/>">
<script type="text/javascript" charset="UTF-8" src="<c:url value='/common/js/menu/xmenu.js${v3x:resSuffix()}' />"></script>
<script type="text/javascript" charset="UTF-8" src="<c:url value='/common/js/V3X.js${v3x:resSuffix()}' />"></script>
<script type="text/javascript" charset="UTF-8" src="<c:url value='/apps_res/meetingroom/meetingroom.js${v3x:resSuffix()}' />"></script>
<script type="text/javascript" charset="UTF-8" src="<c:url value="/apps_res/meeting/js/meetingCommon.js${v3x:resSuffix()}" />"></script>
<script type="text/javascript">
<!--
var v3x = new V3X();
v3x.init("${pageContext.request.contextPath}", "${v3x:getLanguage(pageContext.request)}");
_ = v3x.getMessage;

v3x.loadLanguage("/apps_res/v3xmain/js/i18n");
v3x.loadLanguage("/apps_res/meetingroom/i18n");
//-->
</script>