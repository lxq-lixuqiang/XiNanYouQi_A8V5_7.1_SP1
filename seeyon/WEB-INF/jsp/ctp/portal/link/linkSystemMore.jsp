<%@ page contentType="text/html; charset=utf-8" isELIgnored="false"%>
<%@ include file="/WEB-INF/jsp/common/common.jsp"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title></title>
<meta name = "referrer" content="never">
<script type="text/javascript">

var tohtml = "<span class='nowLocation_content'>";
var items = [];
<c:if test="${doType == 2}">
items.push("<span class=\"color_gray2_nohover\">${ctp:i18n('system.menuname.KnowledgeCommunity')}</span>");
items.push("<a class=\"hand\" onclick=\"showMenu('"+_ctxPath+"/doc/knowledgeController.do?method=personalKnowledgeCenterIndex')\">${ctp:i18n('doc.jsp.knowledge.center')}</a>");
items.push("<a class=\"hand\" onclick=\"showMenu('"+_ctxPath+"/portal/linkSystemController.do?method=linkSystemMore&doType=2')\">${ctp:i18n('link.MyKnowledge.link')}</a>");

tohtml += items.join('>') + "</span>";

getCtpTop().showLocation(tohtml);
</c:if>
<c:if test="${doType == 1}">
items.push("<a class=\"color_gray2_nohover hand\">${ctp:i18n('system.menuname.PersonalTools')}</a>");
items.push("<a class=\"hand\" onclick=\"showMenu('"+_ctxPath+"/portal/linkSystemController.do?method=linkSystemMore&doType=1')\">${ctp:i18n('link.category.common')}</a>");

tohtml += items.join('>') + "</span>";

getCtpTop().showLocation(tohtml);
</c:if>

<c:if test="${doType == 0}">
getCtpTop().showMoreSectionLocation($.i18n('link.system.link'));
</c:if>
</script>
<style type="text/css">
	a {
	    font-size: 12px;
	    cursor: pointer;
	    color: #000;
	    text-decoration: none;
	}
</style>
</head>
<body srcoll="no" style="overflow: auto">
<table border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" align="center">
	<c:if test="${doType == 0}">
	<tr class="page2-header-line">
		<td width="100%" height="38" valign="top" class="page-list-border-LRD">
			 <table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">
		     <tr class="page2-header-line">
 		     <!--<c:if test="${doType != 0 }" >
		        <td class="common_toolbar_box clearfix border_tb font_size" >
		        <span style="font-size:25px">${doType == 1?ctp:i18n('link.category.common'):ctp:i18n('link.knowledge.link')}</span>
		        </td>
		     </c:if> -->
		        <td class="common_toolbar_box clearfix border_tb padding_r_10" align="right" valign="top">
		        	<a href="/seeyon/portal/linkSystemController.do?method=userLinkMain" class="common_button">${ctp:i18n('link.configuration.system') }</a>
		        </td>
			</tr>
			</table>
		</td>
	</tr>
	</c:if>
<tr>
<td valign="top">
  <table id="docFavoriteMoreTable" align="center" width="100%" height="100%" cellpadding="0" cellspacing="0" class="page2-list-border">
       <tr>
<!-- 		   <td height="25" class="common_toolbar_box clearfix font_size12 font_bold"> -->
<%--       		${doType == 0?'关联系统':doType == 1?'常用链接':'知识链接'} --%>
<!--            </td> -->
	   </tr>
	   <tr>
	    <td >
	      <div class="scrollList over_y_auto over_auto">
		     <table width="100%"  cellpadding="0" cellspacing="0" border="0">
			 <c:forEach items="${vos}" var="list" varStatus = "voscount">
		      <c:set value="0" var="tsize" />
				<c:forEach items="${sizeList}" var="mysize"  varStatus="sizeStatus">
		         <c:if test = "${sizeStatus.index == voscount.index}">
				 <c:set value="${mysize}" var="tsize" />
				</c:if>
			   </c:forEach>
               <c:if test = "${doType == 2 && voscount.index == 2}">
                 <tr>
                    <td height='24' valign="bottom" class="sortsHead font_size12 border_b">
                      <c:set value="" var="categoryName" />
                      <span>&nbsp;&nbsp;<span class="ico16 folder_16" style="margin:-2px 5px 0 0"></span>${ctp:i18n('link.MyKnowledge.link') }</span>
                    </td>
                 </tr>
               </c:if>
			   <tr>
				<td height='34' class="sortsHead font_size12 border_b">
				  <c:set value="${v3x:toHTML(list.categoryName)}" var="categoryName" />
                  <span>
                  <c:if test = "${doType == 2 && voscount.index > 1}">&nbsp;&nbsp;</c:if>
                  &nbsp;&nbsp;<span class="ico16 folder_16" style="margin-right:5px"></span>${ctp:i18n(categoryName)}</span>
				</td>
			   </tr>
			   <c:if test="${tsize > 0}">
			   <tr>
				<td valign="top">
					<table width="100%" border="0" cellspacing="0" cellpadding="0" class="border_b">
						<tr>
					      <c:forEach items="${list.links}" var="vo" varStatus="status">
					    	<td width='19%' class="sorts font_size12" style="padding: 8px 20px;">
					    	  <a class='defaulttitlecss' href="${vo.link}" target="_blank">
<%-- 					    	  <img src="${pageContext.request.contextPath}${vo.icon}" width="32" height="32" title='${v3x:toHTML(vo.showTile)}' border='0' align='absmiddle'> --%>
					    	  <div title='${v3x:toHTML(vo.showTile)}'>
					    	    ${v3x:toHTML(vo.name)}
					    	  </div>
					    	 </a>
					    	</td>
					    	${(status.index + 1) % 5 == 0 && !status.last ? "</tr><tr>" : ""}
							<c:set value="${(status.index + 1) % 5}" var="i" />
					   	 </c:forEach>
					   	 <c:if test="${i !=0}">
							<c:forTokens items="1,1,1,1,1" delims="," end="${5 - i - 1}">
								<td class="sorts" width="19%">&nbsp;</td>
							</c:forTokens>
						</c:if>
					</tr>
					</table>
				</td>
			</tr>
			</c:if>
		  </c:forEach>
		  </table>
		 </div>
   </td>
  </tr>
 </table>
</td>
</tr>
</table>
</body>
</html>