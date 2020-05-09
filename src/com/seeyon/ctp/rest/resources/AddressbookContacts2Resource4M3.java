package com.seeyon.ctp.rest.resources;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.seeyon.apps.addressbook.webmodel.AddressBookObject;
import com.seeyon.apps.addressbook.webmodel.AddressBookUnit;
import com.seeyon.ctp.organization.bo.V3xOrgAccount;
import com.seeyon.ctp.rest.bo.contacts.ContactsAccount;
import com.seeyon.ctp.rest.bo.contacts.ContactsDepartment;
import com.seeyon.ctp.rest.bo.contacts.ContactsMember2;
import com.seeyon.ctp.rest.util.ContactsConvertUtil2;
import com.seeyon.ctp.rest.util.ResponseResult;
import com.seeyon.ctp.rest.util.ResultCode;
import com.seeyon.ctp.util.FlipInfo;
import com.seeyon.ctp.util.Strings;

/**
 * m3手机通讯录接口
 *
 */
@Path("/contacts2")
@Produces({MediaType.APPLICATION_JSON })
@Consumes(MediaType.APPLICATION_JSON)
@SuppressWarnings("unchecked")
public class AddressbookContacts2Resource4M3  extends AddressbookBaseResources{
	
	private static Log logger = LogFactory.getLog(AddressbookContacts2Resource4M3.class);
	
	/**
	 * 我的群聊
	 * @param req
	 * @param resp
	 * @param memberId
	 * @return
	 */
	@GET
	@Path("/chat/{memberId}")
	public Response myChat(@PathParam("memberId") String memberId){
		return null;
	} 
	/**
	 * 我的常用联系人
	 * @param req
	 * @param resp
	 * @param memberId
	 * @return
	 */
	@GET
	@Path("/frequentContacts/{memberId}")
	public Response frequentContacts(@PathParam("memberId") String memberId){
		try {
			long start = System.currentTimeMillis();
			 AddressBookObject addressBookObject = super._getRecentData(memberId);
			List<ContactsMember2> result=ContactsConvertUtil2.coverMembers(addressBookObject.getChildren());
			long end = System.currentTimeMillis();
			logger.info(req.getRequestURI()+" times: "+(end-start));
			return m3Ok(new ResponseResult(result));
		} catch (Exception e) {
			logger.error("",e);
			ResponseResult rr = new ResponseResult(
					ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	} 
	/**
	 *项目组
	 * @param req
	 * @param resp
	 * @param
	 * @return
	 */
	@GET
	@Path("/member/projectTeam/{pageNo}/{pageSize}")
	public Response projectTeam(@PathParam("pageNo") int pageNo, @PathParam("pageSize") int pageSize){
		try {
			long start = System.currentTimeMillis();
			FlipInfo fi = new FlipInfo();
			fi.setSize(pageSize);
			fi.setPage(pageNo);
			AddressBookObject addressBookObject = super._getTeam("3",fi);
			Map<String,Object> resultMap = new HashMap<String, Object>();
			resultMap.put("data", ContactsConvertUtil2.coverTeams(addressBookObject.getChildren()));
			resultMap.put("total", (addressBookObject.getTotal()));
			long end = System.currentTimeMillis();
			logger.info(req.getRequestURI()+" times: "+(end-start));
			return m3Ok(new ResponseResult(resultMap));
		} catch (Exception e) {
			logger.error("",e);
			ResponseResult rr = new ResponseResult(
					ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	}
	/**
	 * 项目组下人员
	 * @param req
	 * @param resp
	 * @param teamId
	 * @return
	 */
	@GET
	@Path("/projectTeam/members/{teamId}/{pageNo}/{pageSize}")
	public Response projectTeamMembers(@PathParam("teamId") String teamId,@PathParam("pageNo") int pageNo,@PathParam("pageSize") int pageSize){
		try {
			long start = System.currentTimeMillis();
			FlipInfo fi = new FlipInfo();
			fi.setSize(pageSize);
			fi.setPage(pageNo);
			AddressBookObject addressBookObject = super._getTeamMember(teamId,fi);
			List<ContactsMember2> result=ContactsConvertUtil2.coverMembers(addressBookObject.getChildren());
			Map<String,Object> resultMap = new HashMap<String, Object>();
			resultMap.put("data", result);
			resultMap.put("total", addressBookObject.getTotal());
			long end = System.currentTimeMillis();
			logger.info(req.getRequestURI()+" times: "+(end-start));
			return m3Ok(new ResponseResult(resultMap));
		} catch (Exception e) {
			logger.error("",e);
			ResponseResult rr = new ResponseResult(
					ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	}
	
	/**
	 * 获取单位列表
	 * @return
	 */
	@Path("/accounts/{accountId}")
	@GET
	public Response  allAccounts(@PathParam("accountId") String accountId){
		try {
			long start = System.currentTimeMillis();
			//用来拿切换单位第一页
			AddressBookObject addressBookObject = super._accounts(accountId);
			List<ContactsAccount> firstResult=ContactsConvertUtil2.coverAccounts(addressBookObject.getChildren());
			
			//拿所有单位包括所有子单位
			FlipInfo fi = new FlipInfo();
			fi.setSize(1000);
			fi.setPage(1);
			Map<String, Object> childAccounts = super._childAccounts("-1",fi);
			List<ContactsAccount> allResult=ContactsConvertUtil2.coverAccounts((List<Object>)(childAccounts.get("children")));
			//返回结果集
			Map<String,Object> result = new HashMap<String, Object>();
			//切换企业的第一页数据
			result.put("firstAccounts", firstResult);

			//外层添加集团信息 wangxk
			String id=addressBookObject.getId().toString();
			String name=addressBookObject.getName();
			Map<String,String> groupMap=new HashMap<String, String>();
			groupMap.put("id",id);
			groupMap.put("name",name);
			result.put("group_account",groupMap);
			//外层添加集团信息 wangxk

			//构建path集
			Map<String,List<Object>> pathMap = new HashMap<String, List<Object>>();
			for(ContactsAccount acc : allResult){
				String patentPath = acc.getParentPath();
				if(StringUtils.isNotBlank(patentPath)){
					List<Object> pathToAcc = pathMap.get(patentPath);
					if(pathToAcc == null){
						pathToAcc = new LinkedList<Object>();
					}
					pathToAcc.add(acc);
					pathMap.put(patentPath, pathToAcc);
				}
			}
			result.put("pathToAccounts", pathMap);
			long end = System.currentTimeMillis();
			logger.info(req.getRequestURI()+" times: "+(end-start));
			return m3Ok(new ResponseResult(result));
		} catch (Exception e) {
			logger.error("",e);
			ResponseResult rr = new ResponseResult(
					ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	}
	
	/**
	 * 获取单位信息
	 * @param req HttpServletRequest
	 * @param resp HttpServletResponse
	 * @param accountId 单位ID
	 * @return Response
	 */
	@GET
	@Path("/get/account/{accountId}")
	public Response getAccouts(@PathParam("accountId") String accountId) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			// 单位信息
			AddressBookUnit addressBookUnit = super._getAccountInfo(accountId);
			ContactsAccount account=ContactsConvertUtil2.coverAccount(addressBookUnit);
			
			AddressBookObject addressBookObject = super._accounts("-1");
			account.setHasChildren(Strings.isEmpty(addressBookObject.getChildren()) ? false : true);
		
			map.put("account", account);
			
			return m3Ok(new ResponseResult(map));
		} catch (Exception e) {
			logger.error("",e);
			ResponseResult rr = new ResponseResult(ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	}
	/**
	 * 获取单位下的部门列表　我的部门信息
	 */
	@GET
	@Path("/get/departments/{accountId}/{pageNo}/{pageSize}")
	public Response getDepartments(@PathParam("accountId") String accountId, @PathParam("pageNo") int pageNo, @PathParam("pageSize") int pageSize){
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			AddressBookUnit addressBookUnit = super._currentDepartment();
			
			FlipInfo fi = new FlipInfo();
			fi.setSize(pageSize);
			fi.setPage(pageNo);
			Map<String, Object> firstDepts = super._getSubDeptOfAccount(accountId,fi);
			
			// 我的部门信息
			ContactsDepartment mydepart=ContactsConvertUtil2.coverDepartment(addressBookUnit);
			// 单位下一级子部门列表
			List<ContactsDepartment> delist = new ArrayList<ContactsDepartment>();
			if(firstDepts != null) {
				delist = ContactsConvertUtil2.coverDepartments((List<Object>)(firstDepts.get("children")));
			}
			if(mydepart!=null && accountId.equals(mydepart.getAccountId())){
				map.put("myDepartment", mydepart);
			}
			
//			中国石油天然气股份有限公司西南油气田分公司  【在一级单位显示部门的同时也显示下面所有单位】  lixuqiang 2020年5月9日 start
			fi.setSize(1000);
			fi.setPage(1);
			Map<String, Object> childAccounts = super._childAccounts("-1",fi);
			ContactsAccount currentAccount = new ContactsAccount();
			List<ContactsAccount> showAccounts = new ArrayList<ContactsAccount>();
			List<ContactsAccount> allResult=ContactsConvertUtil2.coverAccounts((List<Object>)(childAccounts.get("children")));
			for(ContactsAccount account : allResult){
				if(accountId.equals(account.getId())){
					currentAccount = account;
					break;
				}
			}
			for(ContactsAccount account : allResult){
				if(currentAccount.getPath().equals(account.getPath())){
            		continue;
            	}
				if((currentAccount.getPath().length()+4) == account.getPath().length()){
					if(account.getPath().indexOf(currentAccount.getPath()) !=-1){
	            		showAccounts.add(account);
	            	}
				}
			}
			for (ContactsAccount account : showAccounts) {
				ContactsDepartment department = new ContactsDepartment();
				department.setAccountId(accountId);
				department.setInternal("1");
				department.setId(account.getId());
				department.setName(account.getName());
				delist.add(department);
			}
//			中国石油天然气股份有限公司西南油气田分公司  【在一级单位显示部门的同时也显示下面所有单位】  lixuqiang 2020年5月9日 end
	        
			map.put("departments", delist);
			return m3Ok(new ResponseResult(map));
		} catch (Exception e) {
			logger.error("",e);
			ResponseResult rr = new ResponseResult(ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	}
	
	/**
	 * 获取单位下的部门列表　我的部门信息
	 */
	@Path("/account/departments/{accountId}")
	@GET
	public Response getDepartments(@PathParam("accountId") String accountId){
		Map<String, Object> map = new HashMap<String, Object>();
		if (accountId == null) {
			return m3Ok(new ResponseResult(map));
		}
		try {
			long start = System.currentTimeMillis();
			//获取所有单位列表
			AddressBookObject addressBookObject = super._accounts("-1");
			// 单位信息
			AddressBookUnit addressBookUnit = super._getAccountInfo(accountId);
			// 我的部门信息
			 AddressBookUnit currentDepartment = super._currentDepartment();
			// 单位下一级子部门列表
			 FlipInfo fi = new FlipInfo();
			 fi.setSize(1000);
			 fi.setPage(0);
			 Map<String, Object> firstDepts = super._getSubDeptOfAccount(accountId,fi);
			 
			 
			// 单位信息
			ContactsAccount account=ContactsConvertUtil2.coverAccount(addressBookUnit);
			account.setHasChildren(Strings.isEmpty(addressBookObject.getChildren())?false:true);
			// 我的部门信息
			ContactsDepartment mydepart=ContactsConvertUtil2.coverDepartment(currentDepartment);
			// 单位下一级子部门列表
			List<ContactsDepartment> delist = new ArrayList<ContactsDepartment>();
			if(firstDepts != null) {
				delist = ContactsConvertUtil2.coverDepartments((List<Object>)(firstDepts.get("children")));
			}
			map.put("account", account);
			if(mydepart!=null && accountId.equals(mydepart.getAccountId())){
				map.put("myDepartment", mydepart);
			}
			map.put("departments", delist);
			long end = System.currentTimeMillis();
			logger.info(req.getRequestURI()+" times: "+(end-start));
			return m3Ok(new ResponseResult(map));
		} catch (Exception e) {
			logger.error("",e);
			ResponseResult rr = new ResponseResult(
					ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	}
	
	/**
	 * 搜索
	 */
	@Path("/account/search/{accountId}/{pageNo}/{pageSize}")
	@POST
	public Response search(@PathParam("accountId") String accountId,@PathParam("pageNo") int pageNo,@PathParam("pageSize") int pageSize,Map<String,String> condition){
		if(condition==null){
			return m3Ok(new ResponseResult());
		}
		Map<String,Object> entity=new HashMap<String, Object>();
		entity.put("key", condition.get("condition"));
		entity.put("accId", accountId);
		entity.put("type", "Name,Telnum");
		try {
			FlipInfo fi = new FlipInfo();
			fi.setSize(pageSize);
			fi.setPage(pageNo);
			Map<String, Object> map=super._searchMember(entity,fi);
			//返回结果
			Map<String,Object> result=new HashMap<String, Object>();
            List<ContactsMember2>data = ContactsConvertUtil2.coverMembers((List<Object>)(map.get("children")));
            result.put("total", map.get("total"));
            result.put("data", data);
			return m3Ok(new ResponseResult(result));
		} catch (Exception e) {
		    // 记录详细错误日志
			logger.error("",e);
			ResponseResult rr = new ResponseResult(
					ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	}
	
	/**
	 * 获取部门下的子部门和人员列表
	 */
	@Path("/department/children/{departmentId}/{pageNo}/{pageSize}/{sortType}")
	@GET
	public Response getChildByDepartmentId(@PathParam("departmentId") String departmentId,@PathParam("pageNo") int pageNo, @PathParam("pageSize") int pageSize,@PathParam("sortType") String sortType){
		Map<String, Object> map = new HashMap<String, Object>();
		if(departmentId==null){
			return m3Ok(new ResponseResult(map));
		}

		if(sortType==null){
		    sortType = "member";
        }

        if(!("member".equals(sortType) || "department".equals(sortType))){
		    sortType = "member";
        }
		try {
			long start = System.currentTimeMillis();
			FlipInfo fi = new FlipInfo();
			fi.setSize(pageSize);
			fi.setPage(pageNo);
			Map<String, Object> subDeptInfo = super._getSubDeptInfo(departmentId, sortType,fi);
			 //当前部门的父部门链条
			AddressBookObject addressBookObject = super._getDeptPath(departmentId);

			Map<String, Object> r = ContactsConvertUtil2.subDepartmentsAndMembers(((List<Object>)subDeptInfo.get("children")));
			// 子部门
			map.put("childrenDepartments", r.get("childrenDepartments"));
			// 部门中人员列表
			map.put("members", r.get("members"));
			map.put("total", subDeptInfo.get("total"));
			// 当前部门的父部门链条
			//List<Map<String, Object>> parents = new LinkedList<Map<String, Object>>();
			map.put("parents",ContactsConvertUtil2.coverParentDepart(addressBookObject.getChildren()));
			long end = System.currentTimeMillis();
			logger.info(req.getRequestURI()+" times: "+(end-start));
			return m3Ok(new ResponseResult(map));
		} catch (Exception e) {
			logger.error("",e);
			ResponseResult rr = new ResponseResult(
					ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	}

	/**
	 * 获取人员详情
	 * @param memberId
	 * @return
	 */
	@GET
	@Path("/member/{memberId}")
	public Response getMemberDetail(@PathParam("memberId") String memberId){
		try {
			long start = System.currentTimeMillis();
			Map<String, Object> map = super._getPeopleCardInfo(memberId);
			ContactsMember2 result=ContactsConvertUtil2.coverPeopleCardInfo(map);
			long end = System.currentTimeMillis();
			logger.info(req.getRequestURI()+" times: "+(end-start));
			return m3Ok(new ResponseResult(result));
		} catch (Exception e) {
			logger.error("",e);
			ResponseResult rr = new ResponseResult(
					ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	}
	
	/**
	 * 获取单位详情
	 * @param req
	 * @param resp
	 * @param accountId
	 * @return
	 */
	@GET
	@Path("/account/{accountId}")
	public Response getAccount(@PathParam("accountId") String accountId){
		try {
			long start = System.currentTimeMillis();
			// 单位信息
			AddressBookUnit addressBookUnit = super._getAccountInfo(accountId);
			ContactsAccount account=ContactsConvertUtil2.coverAccount(addressBookUnit);
			long end = System.currentTimeMillis();
			logger.info(req.getRequestURI()+" times: "+(end-start));
			return m3Ok(new ResponseResult(account));
		} catch (Exception e) {
			logger.error("",e);
			ResponseResult rr = new ResponseResult(
					ResultCode.RESULT_CODE_SEVER_ERROR, e.getMessage());
			return status(500, rr);
		}
	}

}
