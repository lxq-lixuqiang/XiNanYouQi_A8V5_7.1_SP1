package com.seeyon.apps.meetingroom.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.web.servlet.ModelAndView;

import bsh.StringUtil;

import com.seeyon.apps.meetingroom.manager.MeetingRoomListManager;
import com.seeyon.apps.meetingroom.manager.MeetingRoomManager;
import com.seeyon.apps.meetingroom.po.MeetingRoom;
import com.seeyon.apps.meetingroom.po.MeetingRoomPerm;
import com.seeyon.apps.meetingroom.po.MeetingRoomRecord;
import com.seeyon.apps.meetingroom.util.MeetingRoomRoleUtil;
import com.seeyon.apps.meetingroom.vo.MeetingRoomListVO;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.authenticate.domain.User;
import com.seeyon.ctp.common.controller.BaseController;
import com.seeyon.ctp.common.excel.DataRecord;
import com.seeyon.ctp.common.excel.DataRow;
import com.seeyon.ctp.common.excel.FileToExcelManager;
import com.seeyon.ctp.common.i18n.ResourceUtil;
import com.seeyon.ctp.common.supervise.bo.SuperviseWebModel;
import com.seeyon.ctp.common.workflowmanage.manager.WorkflowManageManager;
import com.seeyon.ctp.organization.OrgConstants.Role_NAME;
import com.seeyon.ctp.organization.bo.V3xOrgDepartment;
import com.seeyon.ctp.organization.bo.V3xOrgMember;
import com.seeyon.ctp.organization.manager.OrgManager;
import com.seeyon.ctp.util.CommonTools;
import com.seeyon.ctp.util.DateUtil;
import com.seeyon.ctp.util.FlipInfo;
import com.seeyon.ctp.util.JDBCAgent;
import com.seeyon.ctp.util.Strings;
import com.seeyon.ctp.util.annotation.AjaxAccess;
import com.seeyon.ctp.util.annotation.CheckRoleAccess;
import com.seeyon.ocip.common.org.OrgDepartment;

/**
 * 
 * @author 唐桂林
 *
 */
public class MeetingRoomListController extends BaseController {
	
	private MeetingRoomListManager meetingRoomListManager;
	private MeetingRoomManager meetingRoomManager;
	private FileToExcelManager fileToExcelManager;
	private OrgManager orgManager;
	private WorkflowManageManager workflowManageManager;
	
	/**
	 * 会议室登记列表页面
	 * 
	 * @param request
	 * @param response
	 * @return 转到listadd.jsp页面
	 * @throws Exception
	 */
	@CheckRoleAccess(roleTypes = {Role_NAME.MeetingRoomAdmin,Role_NAME.AccountAdministrator})
	public ModelAndView listAdd(HttpServletRequest request, HttpServletResponse response) throws Exception {
		boolean isAdmin = MeetingRoomRoleUtil.isMeetingRoomAdminRole();
		boolean isAccountAdmin = MeetingRoomRoleUtil.isAdministrator();
		if (!isAdmin && !isAccountAdmin) {
			return refreshWorkspace();
		}
		// 不同的角色跳转不同的页面
		String viewName = "meetingroom/listadd";
		if (isAccountAdmin) {
			viewName = "meetingroom/listaddaccount";
		}
		ModelAndView mav = new ModelAndView(viewName);
		String selectCondition = request.getParameter("selectCondition");
		String name = request.getParameter("name");
		Integer status = Strings.isBlank(request.getParameter("status")) ? null : Integer.parseInt(request.getParameter("status"));
		String seatCountCondition = request.getParameter("seatCountCondition");
		String seatCountStr = request.getParameter("seatCount");
		
		User currentUser = AppContext.getCurrentUser();
		
		Map<String, Object> conditionMap = new HashMap<String, Object>();
		conditionMap.put("status", status);
		conditionMap.put("selectCondition", selectCondition);
		conditionMap.put("name", name);
		conditionMap.put("seatCountCondition", seatCountCondition);
		conditionMap.put("seatCountStr", seatCountStr);
		conditionMap.put("userId", currentUser.getId());
		conditionMap.put("accountId", currentUser.getLoginAccount());
		
		// 单位管理员的查询项
		String mngdepIdCondition = request.getParameter("mngdepId");
		if (mngdepIdCondition != null && mngdepIdCondition.length() > 0) {
			String applyrange = request.getParameter("applyrange");
			mav.addObject("conditionValue", applyrange);
			conditionMap.put("mngdepId", mngdepIdCondition);
		}
		String adminname = request.getParameter("adminname");
		List<Long> madIds = MeetingRoomRoleUtil.getMeetingRoomAdminIdList(currentUser.getLoginAccount());
		if (Strings.isNotBlank(adminname) && null != madIds && !madIds.isEmpty()) {
			// 查询本单位下的所有会议室管理员,然后比对姓名
			List<V3xOrgMember> meetingRoomAdmins = MeetingRoomRoleUtil.getMeetingRoomAdminList(currentUser.getLoginAccount());
			String adminIds = "";
			for (V3xOrgMember member : meetingRoomAdmins) {
				if ((member.getName().equals(adminname) || member.getName().contains(adminname))
						&& madIds.contains(member.getId())) {
					adminIds += member.getId() + ",";
				}
			}
			if (Strings.isNotBlank(adminIds)) {
				conditionMap.put("adminIds", adminIds.substring(0, adminIds.length() - 1));
			} else {
				conditionMap.put("adminIds", "null");
			}
			mav.addObject("conditionValue", adminname);
		}
		
		List<MeetingRoomListVO> voList = this.meetingRoomListManager.findRoomList(conditionMap);
		mav.addObject("list", CommonTools.pagenate(voList));
		
		if (Strings.isNotBlank(selectCondition)) {
			mav.addObject("selectCondition", selectCondition);
			if (Strings.isNotBlank(name)) {
				mav.addObject("conditionValue", name);
			} else if (status != null) {
				mav.addObject("conditionValue", status);
			} else if(Strings.isNotBlank(seatCountStr) && Strings.isNotBlank(seatCountCondition)) {
				mav.addObject("conditionValue", new String[] { seatCountStr, seatCountCondition });
			}
		}
		return mav;
	}
	
	public ModelAndView listMyApp(HttpServletRequest request, HttpServletResponse response) throws Exception {
		ModelAndView mav = new ModelAndView("meetingroom/listmyapp");
		
		// 右侧下拉查询参数
		String condition = request.getParameter("condition");
		//OA-113629在会议资源-预定撤销页面直接点击查询，报js
		if (Strings.isEmpty(condition)) {
		    condition = null;
		}
		String textfield = request.getParameter("textfield");
		String textfield1 = request.getParameter("textfield1");
		
		Map<String, Object> conditionMap = new HashMap<String, Object>();
		conditionMap.put("userId", AppContext.currentUserId());
		conditionMap.put("condition", condition);
		conditionMap.put("textfield", textfield);
		conditionMap.put("textfield1", textfield1);
		
		List<MeetingRoomListVO> voList = this.meetingRoomListManager.findMyRoomAppList(conditionMap,null);
		
		mav.addObject("list", voList);
		mav.addObject("selectCondition", condition);
		mav.addObject("textfield", textfield);
		mav.addObject("textfield1", textfield1);
		mav.addObject("flag", request.getParameter("flag"));
		mav.addObject("isAdmin", MeetingRoomRoleUtil.isMeetingRoomAdminRole());
		mav.addObject("systemNowDatetime", DateUtil.currentDate());
		
		return mav;
	}
	
	
	/**
	 * 会议室申请列表页面
	 * 
	 * @param request
	 * @param response
	 * @return 转到listperm.jsp页面
	 * @throws Exception
	 */
	@CheckRoleAccess(roleTypes={Role_NAME.MeetingRoomAdmin})
	public ModelAndView listPerm(HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!MeetingRoomRoleUtil.isMeetingRoomAdminRole()) {
			return refreshWorkspace();
		}
		
		ModelAndView mav = new ModelAndView("meetingroom/listperm");
		
		// 右侧下拉查询参数
		String condition = request.getParameter("condition");
		String textfield = request.getParameter("textfield");
		String textfield1 = request.getParameter("textfield1");
		
		User currentUser = AppContext.getCurrentUser();
		
		Map<String, Object> conditionMap = new HashMap<String, Object>();
		conditionMap.put("userId", currentUser.getId());
		conditionMap.put("condition", condition);
		conditionMap.put("textfield", textfield);
		conditionMap.put("textfield1", textfield1);
		List<MeetingRoomListVO> voList = this.meetingRoomListManager.findRoomPermList(conditionMap,null);
		mav.addObject("list", voList);
//		中国石油天然气股份有限公司西南油气田分公司  【展示参会领导、参会人数、会议用品】  lixuqiang 2020年4月29日 start
		List<Map<String,Object>> otherList = new ArrayList<Map<String,Object>>();
		JDBCAgent agent2 = new JDBCAgent();
		try {
			for (int i = 0; i < voList.size(); i++) {
				Map<String,Object> otherMap = new HashMap<String,Object>();
				agent2.execute("select * from meeting_room_app where id = ?", voList.get(i).getRoomAppId());
				Map map = agent2.resultSetToMap();
				Long id = (Long) map.get("id");
				String numbers = (String) map.get("numbers");
				String leader = (String) map.get("leader");
				String meetingToolIds = (String) map.get("resources");
				String name = "";
				if (StringUtils.isNotBlank(leader)) {
					String[] members = leader.split(",");
					for (String m : members) {
						String[] split = m.split("[|]");
						if(split.length>1){
							name += orgManager.getMemberById(Long.valueOf(split[1])).getName() + ",";
						}
					}
					if (name.length() > 1) {
						name = name.substring(0, name.length() - 1);
					}
				}
				otherMap.put("id", id);
				otherMap.put("numbers", numbers); //参与人数
				otherMap.put("leaderNames", name); //参会领导
				String resourcesNames = new String();
				if(!StringUtils.isBlank(meetingToolIds)){
					String[] meetingToolIds2 = meetingToolIds.split(",");
					for (int j = 0; j < meetingToolIds2.length; j++) {
						String res = String.valueOf(meetingToolIds2[j]);
						if (StringUtils.isNotBlank(res)) {
							agent2.execute("select name from public_resource where id in (" + res + ")");
							List<Map<String, Object>> list = (List<Map<String, Object>>) agent2.resultSetToList();
							for (Map o : list) {
								resourcesNames += o.get("name") + ",";
							}
						}
					}
					if (StringUtils.isNotBlank(resourcesNames)) {
						resourcesNames = resourcesNames.substring(0, resourcesNames.length() - 1);
					}
				}
				otherMap.put("resourcesName", resourcesNames); //会议用品
				otherList.add(otherMap);
			}	
			mav.addObject("otherList", otherList);
		} catch (Exception e) {
			logger.error("展示参会领导、参会人数、会议用品异常",e);
		}finally {
			agent2.close();
		}
//				中国石油天然气股份有限公司西南油气田分公司  【展示参会领导、参会人数、会议用品】  lixuqiang 2020年4月29日 end
		
		mav.addObject("selectCondition", condition);
		mav.addObject("textfield", textfield);
		mav.addObject("textfield1", textfield1);
		mav.addObject("flag", request.getParameter("flag"));
		

//		中国石油天然气股份有限公司西南油气田分公司  【会议室审核导出】  lixuqiang 2020年4月30日 stater
		String doExecl = request.getParameter("doExecl");
		if(doExecl!=null && doExecl!="" && doExecl.equals("1")){
			mav.addObject("currentExecl", "");
			JDBCAgent agent = new JDBCAgent();
			try {
	    		String[] colNames = new String[12];
	    		colNames[0] = ResourceUtil.getString("会议名称", new Object[0]);
	    		colNames[1] = ResourceUtil.getString("申请人", new Object[0]);
	    		colNames[2] = ResourceUtil.getString("处室名称", new Object[0]);
	    		colNames[3] = ResourceUtil.getString("会议名称", new Object[0]);
	    		colNames[4] = ResourceUtil.getString("申请时间", new Object[0]);
	    		colNames[5] = ResourceUtil.getString("开始使用时间", new Object[0]);
	    		colNames[6] = ResourceUtil.getString("结束使用时间", new Object[0]);
	    		colNames[7] = ResourceUtil.getString("审核状态", new Object[0]);
	    		colNames[8] = ResourceUtil.getString("使用状态", new Object[0]);
	    		colNames[9] = ResourceUtil.getString("参会领导", new Object[0]);
	    		colNames[10] = ResourceUtil.getString("预计人数", new Object[0]);
	    		colNames[11] = ResourceUtil.getString("会议用品", new Object[0]);
	    		
	    		DataRecord dr = new DataRecord();
	    		dr.setColumnName(colNames);
	    		dr.setTitle("会议室审核");
	    		dr.setSheetName("会议室审核");
	    		

	    		FlipInfo flipInfo = new FlipInfo();
	    		flipInfo.setSize(-1);
	    		List<MeetingRoomListVO> voList1 = this.meetingRoomListManager.findRoomPermList(conditionMap,flipInfo);
	    		List<Object[]> rows = new ArrayList();
	    		if (Strings.isNotEmpty(voList1)) {
	    			Object[] obj = null;
	    			for (int i = 0; i < voList1.size(); i++) {
	    				obj = new Object[12];
	    				obj[0] = voList1.get(i).getRoomName();
	    				V3xOrgMember v3xOrgMember = orgManager.getMemberById(voList1.get(i).getAppPerId());
	    				obj[1] = v3xOrgMember.getName();
	    				V3xOrgDepartment v3xOrgDepartment =  orgManager.getDepartmentById(v3xOrgMember.getOrgDepartmentId());
	    				obj[2] = v3xOrgDepartment.getName();
	    				obj[3] = voList1.get(i).getMeetingName();
	    				obj[4] = voList1.get(i).getAppDatetime();
	    				obj[5] = voList1.get(i).getStartDatetime();
	    				obj[6] = voList1.get(i).getEndDatetime();
	    				obj[7] = voList1.get(i).getAppStatusName();
	    				obj[8] = voList1.get(i).getUsedStatusName();
	    				
	    				agent.execute("select * from meeting_room_app where id = ?", voList1.get(i).getRoomAppId());
	    				Map map = agent.resultSetToMap();
	    				Long id = (Long) map.get("id");
	    				String numbers = (String) map.get("numbers");
	    				String leader = (String) map.get("leader");
	    				String meetingToolIds = (String) map.get("resources");
	    				String name = "";
	    				if (StringUtils.isNotBlank(leader)) {
	    					String[] members = leader.split(",");
	    					for (String m : members) {
	    						String[] split = m.split("[|]");
	    						if(split.length>1){
	    							name += orgManager.getMemberById(Long.valueOf(split[1])).getName() + ",";
	    						}
	    					}
	    					if (name.length() > 1) {
	    						name = name.substring(0, name.length() - 1);
	    					}
	    				}
	    				obj[9] = name;
	    				obj[10] = numbers;
	    				String resourcesNames = new String();
	    				if(!StringUtils.isBlank(meetingToolIds)){
	    					String[] meetingToolIds2 = meetingToolIds.split(",");
	    					for (int j = 0; j < meetingToolIds2.length; j++) {
	    						String res = String.valueOf(meetingToolIds2[j]);
	    						if (StringUtils.isNotBlank(res)) {
	    							agent.execute("select name from public_resource where id in (" + res + ")");
	    							List<Map<String, Object>> list = (List<Map<String, Object>>) agent.resultSetToList();
	    							for (Map o : list) {
	    								resourcesNames += o.get("name") + ",";
	    							}
	    						}
	    					}
	    					if (StringUtils.isNotBlank(resourcesNames)) {
	    						resourcesNames = resourcesNames.substring(0, resourcesNames.length() - 1);
	    					}
	    				}
	    				obj[11] = resourcesNames;
	    				rows.add(obj);
	    			}
	    		}
	    		this.workflowManageManager.exportToExcel(response, this.fileToExcelManager, "会议室审核", rows, colNames, "会议室审核", "sheet1");
	    		
	        }catch(Exception e){
	        	logger.error("会议室审核导出异常",e);
	        }finally {
				agent.close();
			}
		}
//		中国石油天然气股份有限公司西南油气田分公司  【会议室审核导出】  lixuqiang 2020年4月30日 end
		return mav;
	}
	
	
	/**
	 * 统计列表页面
	 * 
	 * @param request
	 * @param response
	 * @return 转到listtotal.jsp页面
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	@CheckRoleAccess(roleTypes = Role_NAME.MeetingRoomAdmin)
	public ModelAndView listTotal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!MeetingRoomRoleUtil.isMeetingRoomAdminRole()) {
			return refreshWorkspace();
		}
		
		ModelAndView mav = new ModelAndView("meetingroom/listtotal");
		
		Map<String, Object> conditionMap = new HashMap<String, Object>();
		conditionMap.put("startDatetime", request.getParameter("startDatetime"));
		conditionMap.put("endDatetime", request.getParameter("endDatetime"));
		conditionMap.put("userId", AppContext.currentUserId());
		
		List list = this.meetingRoomListManager.findMyRoomStatList(conditionMap);
		
		mav.addObject("startDatetime", conditionMap.get("startDatetime"));
		mav.addObject("endDatetime", conditionMap.get("endDatetime"));
		mav.addObject("list", list);
		return mav;
	}
	
	/**
	 * 统计结果导出
	 * 
	 * @param request
	 * @param response
	 * @return null,不跳转页面
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	@CheckRoleAccess(roleTypes={Role_NAME.MeetingRoomAdmin})
	public ModelAndView listTotalExport(HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!MeetingRoomRoleUtil.isMeetingRoomAdminRole()) {
			return refreshWorkspace();
		}
		Map<String, Object> conditionMap = new HashMap<String, Object>();
		conditionMap.put("startDatetime", request.getParameter("startDatetime"));
		conditionMap.put("endDatetime", request.getParameter("endDatetime"));
		conditionMap.put("userId", AppContext.currentUserId());
		
		List list = this.meetingRoomListManager.findMyRoomStatList(conditionMap);
		
		String[] colNames = new String[4];
		colNames[0] = ResourceUtil.getString("mr.label.meetingroomname", new Object[0]);
		colNames[1] = ResourceUtil.getString("mr.label.nowmonth", new Object[0]);
		colNames[2] = ResourceUtil.getString("mr.label.total", new Object[0]);
		colNames[3] = ResourceUtil.getString("mr.label.from", new Object[0]) + conditionMap.get("startDatetime") + ResourceUtil.getString("mr.label.to", new Object[0]) + conditionMap.get("endDatetime");
		
		DataRecord dr = new DataRecord();
		dr.setColumnName(colNames);
		dr.setTitle(ResourceUtil.getString("mr.tab.meetingtotal", new Object[0]));
		dr.setSheetName(ResourceUtil.getString("mr.tab.meetingtotal", new Object[0]));
		
		if (Strings.isNotEmpty(list)) {
			List<Long> roomIdList = new ArrayList<Long>(); 
			for (int i = 0; i < list.size(); i++) {
				HashMap h = (HashMap) list.get(i);
				MeetingRoomRecord record = (MeetingRoomRecord) h.get("MeetingRoomRecord");
				roomIdList.add(record.getRoomId());
			}
			
			Map<Long, MeetingRoom> roomMap = meetingRoomManager.getRoomMap(roomIdList);
			
			DataRow[] datarow = new DataRow[list.size()];
			for (int i = 0; i < list.size(); i++) {
				HashMap h = (HashMap) list.get(i);
				MeetingRoomRecord record = (MeetingRoomRecord) h.get("MeetingRoomRecord");
				datarow[i] = new DataRow();
				datarow[i].addDataCell(roomMap.get(record.getRoomId()).getName(), 1);
				datarow[i].addDataCell(String.valueOf(h.get("MonthTotal")) + ResourceUtil.getString("mr.label.hour", new Object[0]), 1);
				datarow[i].addDataCell(String.valueOf(h.get("AllTotal")) + ResourceUtil.getString("mr.label.hour", new Object[0]), 1);
				datarow[i].addDataCell(String.valueOf(h.get("SectionTotal"))+ ResourceUtil.getString("mr.label.hour", new Object[0]), 1);
			}
			dr.addDataRow(datarow);
		}
		this.fileToExcelManager.save(response, ResourceUtil.getString("mr.tab.meetingtotal",new Object[0]), new DataRecord[] { dr });
		return null;
	}
	
	/****************************** 依赖注入 **********************************/
	public void setMeetingRoomListManager(MeetingRoomListManager meetingRoomListManager) {
		this.meetingRoomListManager = meetingRoomListManager;
	}
	public void setMeetingRoomManager(MeetingRoomManager meetingRoomManager) {
		this.meetingRoomManager = meetingRoomManager;
	}
	public void setFileToExcelManager(FileToExcelManager fileToExcelManager) {
		this.fileToExcelManager = fileToExcelManager;
	}
	public void setOrgManager(OrgManager orgManager) {
		this.orgManager = orgManager;
	}
	public void setWorkflowManageManager(WorkflowManageManager workflowManageManager) {
		this.workflowManageManager = workflowManageManager;
	}
	
}
