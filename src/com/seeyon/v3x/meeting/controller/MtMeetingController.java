package com.seeyon.v3x.meeting.controller;

import com.google.common.collect.Maps;
import com.seeyon.apps.addressbook.manager.AddressBookManager;
import com.seeyon.apps.addressbook.po.AddressBookSet;
import com.seeyon.apps.agent.bo.AgentModel;
import com.seeyon.apps.agent.bo.MemberAgentBean;
import com.seeyon.apps.doc.api.DocApi;
import com.seeyon.apps.doc.bo.DocResourceBO;
import com.seeyon.apps.edoc.api.EdocApi;
import com.seeyon.apps.edoc.enums.EdocEnum;
import com.seeyon.apps.meeting.api.MeetingVideoManager;
import com.seeyon.apps.meeting.constants.MeetingBarCodeConstant;
import com.seeyon.apps.meeting.constants.MeetingConstant;
import com.seeyon.apps.meeting.constants.MeetingConstant.MeetingNatureEnum;
import com.seeyon.apps.meeting.constants.MeetingConstant.MeetingStateEnum;
import com.seeyon.apps.meeting.constants.MeetingConstant.SummaryStateEnum;
import com.seeyon.apps.meeting.constants.MeetingPathConstant;
import com.seeyon.apps.meeting.manager.MeetingApplicationHandler;
import com.seeyon.apps.meeting.manager.MeetingBarCodeManager;
import com.seeyon.apps.meeting.manager.MeetingManager;
import com.seeyon.apps.meeting.manager.MeetingResourcesManager;
import com.seeyon.apps.meeting.manager.MeetingSettingManager;
import com.seeyon.apps.meeting.manager.MeetingSummaryManager;
import com.seeyon.apps.meeting.manager.MeetingTypeManager;
import com.seeyon.apps.meeting.manager.MeetingTypeRecordManager;
import com.seeyon.apps.meeting.manager.PublicResourceManager;
import com.seeyon.apps.meeting.po.*;
import com.seeyon.apps.meeting.util.MeetingDateUtil;
import com.seeyon.apps.meeting.util.MeetingHelper;
import com.seeyon.apps.meeting.util.MeetingUtil;
import com.seeyon.apps.meeting.vo.MeetingMemberVO;
import com.seeyon.apps.meetingroom.manager.MeetingRoomManager;
import com.seeyon.apps.meetingroom.po.MeetingRoom;
import com.seeyon.apps.project.api.ProjectApi;
import com.seeyon.apps.project.bo.ProjectBO;
import com.seeyon.apps.taskmanage.api.TaskmanageApi;
import com.seeyon.apps.videoconference.util.VideoConferenceConfig;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.affair.manager.AffairManager;
import com.seeyon.ctp.common.appLog.AppLogAction;
import com.seeyon.ctp.common.appLog.manager.AppLogManager;
import com.seeyon.ctp.common.authenticate.domain.User;
import com.seeyon.ctp.common.constants.ApplicationCategoryEnum;
import com.seeyon.ctp.common.constants.SystemProperties;
import com.seeyon.ctp.common.content.affair.constants.StateEnum;
import com.seeyon.ctp.common.content.affair.constants.SubStateEnum;
import com.seeyon.ctp.common.controller.BaseController;
import com.seeyon.ctp.common.excel.DataRecord;
import com.seeyon.ctp.common.excel.DataRow;
import com.seeyon.ctp.common.excel.FileToExcelManager;
import com.seeyon.ctp.common.exceptions.BusinessException;
import com.seeyon.ctp.common.filemanager.domain.ReplaceBase64Result;
import com.seeyon.ctp.common.filemanager.manager.AttachmentManager;
import com.seeyon.ctp.common.filemanager.manager.FileManager;
import com.seeyon.ctp.common.i18n.LocaleContext;
import com.seeyon.ctp.common.i18n.ResourceBundleUtil;
import com.seeyon.ctp.common.i18n.ResourceUtil;
import com.seeyon.ctp.common.po.affair.CtpAffair;
import com.seeyon.ctp.common.po.filemanager.Attachment;
import com.seeyon.ctp.common.usermessage.UserMessageManager;
import com.seeyon.ctp.organization.bo.V3xOrgAccount;
import com.seeyon.ctp.organization.bo.V3xOrgDepartment;
import com.seeyon.ctp.organization.bo.V3xOrgEntity;
import com.seeyon.ctp.organization.bo.V3xOrgMember;
import com.seeyon.ctp.organization.bo.V3xOrgPost;
import com.seeyon.ctp.organization.bo.V3xOrgVisitor;
import com.seeyon.ctp.organization.dao.OrgHelper;
import com.seeyon.ctp.organization.manager.OrgManager;
import com.seeyon.ctp.util.DBAgent;
import com.seeyon.ctp.util.Datetimes;
import com.seeyon.ctp.util.Strings;
import com.seeyon.ctp.util.UUIDLong;
import com.seeyon.ctp.util.json.JSONUtil;
import com.seeyon.v3x.common.security.SecurityCheck;
import com.seeyon.v3x.meeting.MeetingException;
import com.seeyon.v3x.meeting.contants.MeetingContentEnum;
import com.seeyon.v3x.meeting.domain.MtComment;
import com.seeyon.v3x.meeting.domain.MtMeeting;
import com.seeyon.v3x.meeting.domain.MtReply;
import com.seeyon.v3x.meeting.domain.MtReplyWithAgentInfo;
import com.seeyon.v3x.meeting.manager.MtMeetingManager;
import com.seeyon.v3x.meeting.manager.MtReplyManager;
import com.seeyon.v3x.meeting.util.Constants;
import com.seeyon.v3x.meeting.util.MeetingMsgHelper;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * 会议的Controller
 * @author wolf
 * @editer xut、Rookie Young
 */
public class MtMeetingController extends BaseController {

    private final static Log log = LogFactory.getLog(MtMeetingController.class);

    private MtMeetingManager mtMeetingManager;
    private MeetingManager meetingManager;
    private AffairManager affairManager;
    private AttachmentManager attachmentManager;
    private MtReplyManager replyManager;
    private ProjectApi projectApi;
    private OrgManager orgManager;
    private AppLogManager appLogManager;
    private DocApi docApi;
    private MeetingRoomManager meetingRoomManager;
    private MeetingTypeManager meetingTypeManager;
    private FileToExcelManager fileToExcelManager;
    private EdocApi edocApi;
    private com.seeyon.ctp.common.ctpenumnew.manager.EnumManager enumManagerNew;
    private MeetingApplicationHandler meetingApplicationHandler;
    private MeetingTypeRecordManager meetingTypeRecordManager;
    private MeetingSummaryManager meetingSummaryManager;
    private TaskmanageApi taskmanageApi;
    private MeetingResourcesManager meetingResourcesManager;
    private PublicResourceManager publicResourceManager;
    private UserMessageManager userMessageManager;
    private MeetingSettingManager meetingSettingManager;
    private MeetingBarCodeManager meetingBarCodeManager;
    private FileManager fileManager;
    private AddressBookManager addressBookManager;

    /****************************** 依赖注入 **********************************/
    public void setAffairManager(AffairManager affairManager) {
        this.affairManager = affairManager;
    }
    public void setOrgManager(OrgManager orgManager) {
        this.orgManager = orgManager;
    }
    public void setAttachmentManager(AttachmentManager attachmentManager) {
        this.attachmentManager = attachmentManager;
    }
    public void setMtMeetingManager(MtMeetingManager mtMeetingManager) {
        this.mtMeetingManager = mtMeetingManager;
    }
    public void setAppLogManager(AppLogManager appLogManager) {
        this.appLogManager = appLogManager;
    }
    public void setMeetingRoomManager(MeetingRoomManager meetingRoomManager) {
        this.meetingRoomManager = meetingRoomManager;
    }

    public void setReplyManager(MtReplyManager replyManager) {
        this.replyManager = replyManager;
    }
    public void setMeetingTypeManager(MeetingTypeManager meetingTypeManager) {
        this.meetingTypeManager = meetingTypeManager;
    }
    public void setMeetingApplicationHandler(MeetingApplicationHandler meetingApplicationHandler) {
        this.meetingApplicationHandler = meetingApplicationHandler;
    }
    public void setMeetingManager(MeetingManager meetingManager) {
        this.meetingManager = meetingManager;
    }
    public void setEnumManagerNew(com.seeyon.ctp.common.ctpenumnew.manager.EnumManager enumManagerNew) {
        this.enumManagerNew = enumManagerNew;
    }
    public void setEdocApi(EdocApi edocApi) {
        this.edocApi = edocApi;
    }
    public void setDocApi(DocApi docApi) {
        this.docApi = docApi;
    }
    public void setProjectApi(ProjectApi projectApi) {
        this.projectApi = projectApi;
    }
    public void setFileToExcelManager(FileToExcelManager fileToExcelManager) {
        this.fileToExcelManager = fileToExcelManager;
    }
    public void setMeetingTypeRecordManager(MeetingTypeRecordManager meetingTypeRecordManager) {
        this.meetingTypeRecordManager = meetingTypeRecordManager;
    }
    public void setTaskmanageApi(TaskmanageApi taskmanageApi) {
        this.taskmanageApi = taskmanageApi;
    }
    public MeetingResourcesManager getMeetingResourcesManager() {
        return meetingResourcesManager;
    }
    public void setMeetingResourcesManager(MeetingResourcesManager meetingResourcesManager) {
        this.meetingResourcesManager = meetingResourcesManager;
    }
    public PublicResourceManager getPublicResourceManager() {
        return publicResourceManager;
    }
    public void setPublicResourceManager(PublicResourceManager publicResourceManager) {
        this.publicResourceManager = publicResourceManager;
    }
    public void setUserMessageManager(UserMessageManager userMessageManager) {
        this.userMessageManager = userMessageManager;
    }
    public void setMeetingSettingManager(MeetingSettingManager meetingSettingManager) {
        this.meetingSettingManager = meetingSettingManager;
    }
    public void setMeetingBarCodeManager(MeetingBarCodeManager meetingBarCodeManager) {
        this.meetingBarCodeManager = meetingBarCodeManager;
    }

    public void setFileManager(FileManager fileManager) {
        this.fileManager = fileManager;
    }

    public void setAddressBookManager(AddressBookManager addressBookManager) {
        this.addressBookManager = addressBookManager;
    }
    
    
    /**
     * 显示会议详细页面，或预览会议
     */
    public ModelAndView detail(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String idStr = request.getParameter("id");
        MtMeeting bean = null;
        Long meetingId = null;
        String proxyId = request.getParameter("proxyId");
        boolean isImpart =  Boolean.valueOf(request.getParameter("isImpart"));
        boolean fromPigeonhole = "true".equals(request.getParameter("fromPigeonhole"))? true:false;
        User user = AppContext.getCurrentUser();
        ModelAndView mav = null;
        List<Attachment> attachments = null;
        if(request.getParameter("preview") != null) {
            mav = new ModelAndView("meeting/user/template_preview");
        } else {
            if(Strings.isNotBlank(idStr)) {
                meetingId = Long.parseLong(idStr);
                bean = meetingManager.getMeetingById(meetingId);
            } else {
                bean = new MtMeeting();
            }

            //入口-关联项目-会议
            boolean canVisit = false;
            boolean isQuote = Strings.isBlank(request.getParameter("isQuote")) ? false : Boolean.parseBoolean(request.getParameter("isQuote"));
            if(isQuote) {
                int baseApp = Strings.isBlank(request.getParameter("baseApp")) ? 6 : Integer.parseInt(request.getParameter("baseApp"));
                long baseObjectId = Strings.isBlank(request.getParameter("baseObjectId")) ? -1 : Long.parseLong(request.getParameter("baseObjectId"));
                if(baseApp == ApplicationCategoryEnum.taskManage.key()) {//任务模块中的关联文档-会议
                    if(baseObjectId != -1) {
                    	//TODO DEV 2015-08-20 还没有给这个接口
                        /*canVisit = taskmanageApi.validateTask(request.getParameter("baseObjectId"));*/
                    }
                }
            }

            // 如果是从文档中心打开，则不验证是否为与会人员
            if(Strings.isNotBlank(request.getParameter("fromdoc"))) {//xiangfan 修改为 isNotBlank GOV-4924
                if(bean == null) {
                    super.rendJavaScript(response, "parent.refreshIfInvalid();");
                    return null;
                } else {
                	boolean isStillInConferees = this.mtMeetingManager.isStillInConferees(Long.valueOf(proxyId), bean);
                    if((bean.getState() == Constants.DATA_STATE_SAVE && "10".equals(request.getParameter("state"))) || (!isStillInConferees && Strings.isBlank(request.getParameter("eventId")))) {
                        if(Strings.isNotBlank(proxyId) && !"0".equals(proxyId) && !"-1".equals(proxyId) && Strings.isDigits(proxyId)) {
                            if(!isStillInConferees) {
                                super.rendJavaScript(response, "parent.refreshIfInvalid();");
                                return null;
                            }
                        }
                    }
                }
            }
            if(!canVisit) { 
                //当前人是否在改会议中，会议创建人排除掉 （fromPigeonhole:不是来自于借阅文档）
                if(null != bean && !fromPigeonhole && !isQuote && !AppContext.getCurrentUser().getId().equals(bean.getCreateUser())
                        && !this.mtMeetingManager.isStillInConferees(AppContext.getCurrentUser().getId(), bean)){
                    Locale local = LocaleContext.getLocale(request);
                    String label = ResourceBundleUtil.getString("com.seeyon.v3x.meeting.resources.i18n.MeetingResources", local, "meeting.cancel",bean.getTitle());
                    StringBuilder sb = new StringBuilder();
                    sb.append("alert('"+ label +"');");
                    sb.append("if(parent.parent.window.dialogArguments && parent.parent.window.dialogArguments.callback){\n");
                    sb.append("  parent.parent.window.dialogArguments.callback();\n");//从栏目打开，关闭窗口并刷新对应栏目
                    sb.append("} else {parent.parent.window.close();}");
                    super.rendJavaScript(response, sb.toString());
                    return null;
                }
                // SECURITY 访问安全检查
                if(!SecurityCheck.isLicit(request, response, ApplicationCategoryEnum.meeting, user, meetingId, null, null)) {
                    return null;
                }
            }
            /*********************** 只读状态修改为已读 start ****************************/
            // 查看会议时，写入会议阅读信息
            //bean.getState() != 0 0:暂存状态,MeetingStateEnum
            if(bean != null && bean.getState() != 0 && bean.getCreateUser() != null) {
                long affairId = Strings.isBlank(request.getParameter("affairId")) ? -1 : Long.parseLong(request.getParameter("affairId"));
                //首页待办事项入口、首页代理事项入口
                if(affairId != -1) {
                    CtpAffair affair = affairManager.get(affairId);
                    if(affair != null) {
                        if(!"inform".equals(affair.getNodePolicy())) {//非告知人
                            isImpart = false;
                        }
                    }
                }
            }
            /*********************** 只读状态修改为已读 end ****************************/
            if(request.getParameter("oper") != null) { // 只显示正文
                
                String oper = request.getParameter("oper");
                if("onlyContent".equalsIgnoreCase(oper) || "onlySummary".equalsIgnoreCase(oper)) {
                	mav = new ModelAndView("meeting/user/onlyContent");
                	mav.addObject("_oper", oper);
                }else {
                	mav = new ModelAndView("meeting/user/showContent");
                }
                
                mav.addObject("language", AppContext.getLocale().getLanguage());

                //xiangfan 修改为getReceiptOpinion不需要查询出回执状态为-100的，点击查看 状态为-100，这里回执意见是需要过滤掉的
                List<MtReply> replyList = replyManager.getReceiptOpinion(bean.getId(),bean);
                mav.addObject("replySize", replyList.size());
                mav.addObject("replyList", replyList);
                //遍历自己的回执状态
                mav.addObject("feedbackFlag", "null");
                //查询我的代理人（帮我做事情的人）
                List<Long> agentMemberIds = MemberAgentBean.getInstance().getAgentToMemberId(ApplicationCategoryEnum.meeting.key(),user.getId());
                if(Strings.isNotEmpty(replyList)){
                    boolean replyflag = false;
                    for (MtReply mtReply:  replyList){

                        if(user.getId().equals(mtReply.getUserId()) || (agentMemberIds != null && agentMemberIds.contains(mtReply.getUserId()) )) {
                            if(mtReply.getFeedbackFlag() == 3){
                                mav.addObject("feedbackFlag", "null");
                            }else{
                                mav.addObject("feedbackFlag", mtReply.getFeedbackFlag());
                                if(mtReply.getFeedbackFlag() == 2){
                                    mav.addObject("feedbackFlag", 1);
                                }
                            }

                            replyflag = true;
                        }
                        if(replyflag){
                            break;
                        }
                    }
                    if(replyflag == false){
                        mav.addObject("feedbackFlag", "null");
                    }
                }
                mav.addObject("proxyId", proxyId);
                
                boolean hasEdoc = AppContext.hasPlugin("edoc");
                
                mav.addObject("hasEdocPlugin", hasEdoc);
                mav.addObject("hasNewCollMenu", AppContext.getCurrentUser().hasResourceCode("F01_newColl"));
                mav.addObject("hasSendEdocMenu", AppContext.getCurrentUser().hasResourceCode("F20_newSend"));
                
                boolean isEdocCreateRole = false;
                if(hasEdoc){
                    isEdocCreateRole = edocApi.isEdocCreateRole(user.getId(), user.getLoginAccount(), EdocEnum.edocType.sendEdoc.ordinal());
                }
                mav.addObject("isEdocCreateRole", isEdocCreateRole);
                
                attachments = attachmentManager.getByReference(bean.getId());
                List<MtComment> mtComments = this.mtMeetingManager.getAllCommentByMeetingId(meetingId);
                Map<Long, List<MtComment>> commentsMap = new HashMap<Long, List<MtComment>>();
                MeetingHelper.modulateCommentOpinion(commentsMap, replyList, mtComments);
                mav.addObject("comments", commentsMap);
                mav.addObject("MtCreateUserId", bean.getCreateUser());
                mav.addObject("meetingState", bean.getState());
                mav.addObject("curUserName", orgManager.getMemberById(user.getId()).getName());
                //获得会议纪要
                if(bean.getRecordState() == MtMeeting.SUMMARY_RECORDSTATE_YES){
                    MeetingSummary summary =  meetingSummaryManager.getSummaryById(bean.getRecordId());
                    //xiangfan 添加MtSummary.SUMMARY_STATE_PASSED，MtSummary.SUMMARY_STATE_PUBLISH等条件 修复GOV-2376，只有纪要审核通过或直接发布的才能在会议的下方显示
                    if(null != summary && (summary.getState()==SummaryStateEnum.passed.key() || summary.getState()==SummaryStateEnum.publish.key())){
                        List<Attachment> summarySattachments = attachmentManager.getByReference(summary.getId(), summary.getId());
                        if(summarySattachments != null){
                            attachments.addAll(summarySattachments);
                        }
                        mav.addObject("summary", summary);
                    }
                    if (summary!=null){
                        try {
                            // 此处是为了升级历史数据
                            ReplaceBase64Result base64Result = fileManager.replaceBase64Image(summary.getContent());
                            if( base64Result.isConvertBase64Img() ){// 替换过正文内容才执行更新
                                summary.setContent(base64Result.getHtml());
                                DBAgent.update(summary);
                            }
                        } catch (Exception e) {// 查看时，如果转换失败就不转换了
                            logger.error("将正文中base64编码图片转为URL时发生异常！",e);
                        }
                    }
                }
                if(MeetingUtil.isVideoPluginAvailable() && MeetingNatureEnum.video.key().equals(bean.getMeetingType())) {
                    if("HTML".equals(bean.getDataFormat())) {
                        try {
                            MeetingVideoManager meetingVideoManager = meetingApplicationHandler.getMeetingVideoHandler();
                            List<Long> list = OrgHelper.getMemberIdsByTypeAndId(bean.getConferees(), orgManager);
                            long userId = AppContext.currentUserId();
                            if(meetingVideoManager != null && (list.contains(userId) || bean.getEmceeId() == userId || bean.getRecorderId() == userId) &&
                                    MeetingHelper.isPending(bean.getState()) && MeetingHelper.isRoomPass(bean.getRoomState())) {

                                String content = Strings.isEmpty(bean.getContent()) ? "" : bean.getContent();
                                bean.setContent(content + meetingVideoManager.getVideoUrlContent(bean.getVideoMeetingId()));
                            }
                        } catch (Exception e) {
                            log.error("", e);
                        }
                    }
                }
                
                //获取会议任务(已经结束的会议才能新建任务和查看任务)
                if(AppContext.hasPlugin("taskmanage") && (bean.getState() == 20 //已开始
        				|| bean.getState() == 30 //已结束
        				|| bean.getState() == 31 //提前结束
        				|| bean.getState() == 40 //已总结
        				|| bean.getState() == -10)){ //已归档
                	mav.addObject("task_all", taskmanageApi.countTaskSource(ApplicationCategoryEnum.meeting.getKey(), bean.getId(), null, -1));
                	mav.addObject("task_unfinished", taskmanageApi.countTaskSource(ApplicationCategoryEnum.meeting.getKey(), bean.getId(), null, -2));
                	mav.addObject("task_overdue", taskmanageApi.countTaskSource(ApplicationCategoryEnum.meeting.getKey(), bean.getId(), null, 6));
                	mav.addObject("task_finished", taskmanageApi.countTaskSource(ApplicationCategoryEnum.meeting.getKey(), bean.getId(), null, 4));
                	mav.addObject("task_canceled", taskmanageApi.countTaskSource(ApplicationCategoryEnum.meeting.getKey(), bean.getId(), null, 5));
                	mav.addObject("showMeetingTask",true);
                }else{
                	mav.addObject("showMeetingTask",false);
                }
                
            } else {// 只显示标题时间
                mav = new ModelAndView("meeting/user/meeting_list_detail_iframe");
                String statType = request.getParameter("statType");
                boolean showJoinButtom = true;
                // 处理会议室
                if(bean != null) {
                    
                    String roomName = meetingRoomManager.getRoomNameById(bean.getRoom(), bean.getMeetPlace());
                    //当前时间晚于会议结束时间，不能参会
                    if(MeetingDateUtil.compareDate(new Date(), bean.getEndDate())){
                    	showJoinButtom = false;
                    }
                    mav.addObject("roomName", roomName);
                    mav.addObject("proxyId", proxyId);
                    attachments = attachmentManager.getByReference(bean.getId(), bean.getId());
                    //重要会议的六项要根据会议分类的设置来显示
                    mav.addObject("mtch", meetingTypeRecordManager.getTypeRecordByMeetingId(bean.getId()));
                    mav.addObject("statType", statType);
                }
                mav.addObject("showJoinButtom", showJoinButtom);

                if(MeetingUtil.hasMeetingVideoPlugin() && bean != null && MeetingNatureEnum.video.key().equals(bean.getMeetingType())) {
                	boolean joinFlag = ((bean.getEmceeId()!=null && user.getId().longValue()==bean.getEmceeId().longValue()) || (bean.getRecorderId()!=null && user.getId().longValue()==bean.getRecorderId().longValue()));
	                Map<String, Object> paramMap = new HashMap<String, Object>();
	                paramMap.put("joinType", joinFlag ? 1 : 2 );
	                paramMap.put("password", bean.getMeetingPassword());
	                paramMap.put("confKey", bean.getConfKey());
	                paramMap.put("url", "/mtMeeting.do?method=listMain&stateStr=10");
	                paramMap.put("meetingId", bean.getId());
	                
	                MeetingVideoManager meetingVideoManager = null;
	                try {
	                	meetingVideoManager = meetingApplicationHandler.getMeetingVideoHandler();
	                } catch (Exception e) {
	                	log.error(e.getLocalizedMessage(),e);
	                }
	                if(meetingVideoManager != null) {
		                mav.addObject("joinImportUrl", meetingVideoManager.getJoinImportUrl());
		                mav.addObject("joinButtonClkFunName", meetingVideoManager.getJoinButtonClkFunName());
		                mav.addObject("joinButtonClkFunParmas", meetingVideoManager.getJoinButtonClkFunParmas(paramMap));
		                if (meetingVideoManager.canChooseVideoMeetingRoom()) {
		                	if(bean != null){
		                		String videoMeetingDetail = bean.getVideoMeetingId();
		                		if(Strings.isNotBlank(videoMeetingDetail)){
									try {
										mav.addObject("showVideoRoom", true);
										Map<String, Object> ext4Map = JSONUtil.parseJSONString(videoMeetingDetail, Map.class);
										String videoRoomName = (String) ext4Map.get("videoRoomName");//视频会议室名称
			                			String meetingVideoId = (String)ext4Map.get("bmId");//视频会议号
			                			String videoRoomId = (String)ext4Map.get("videoRoomId");//视频会议室Id
			                			if (Strings.isNotBlank(meetingVideoId)) {
			                				videoRoomName += "(" + ResourceUtil.getString("meeting.video.number.name") + meetingVideoId + ")";
			                			}
			                			mav.addObject("videoRoomName", videoRoomName);
			                			mav.addObject("password", bean.getMeetingPassword());
			                			mav.addObject("videoRoomId", videoRoomId);
			                			String videoURL = "";
			                			if (bean.getEmceeId()!=null && user.getId().longValue()==bean.getEmceeId().longValue()) {
			                				videoURL = (String) ext4Map.get("bmCompereUrl");
			                			} else {
			                				videoURL = (String) ext4Map.get("bmUrl");
			                			}
			                			mav.addObject("videoURL", videoURL);
									} catch (Exception e) {
										//OA-157910  公司协同：已发会议列表有个会议查看报错
										mav.addObject("showVideoRoom", false);
									}
		                		}
		                	}
		                }
	                }
                }
            }
        }

        int meetingIsEnd = 1;
        if(bean!=null && (bean.getState() == MeetingStateEnum.send.key() || bean.getState() == MeetingStateEnum.start.key())){
            meetingIsEnd = 0;
        }
        //会议是否开始
        mav.addObject("meetingIsEnd", meetingIsEnd);
        mav.addObject("fromPigeonhole", fromPigeonhole);
        /******************************** 视频会议 start **********************************/
        if(bean!=null && Constants.VIDEO_MEETING.equals(bean.getMeetingType())){
            mav.addObject("videoConfStatus", VideoConferenceConfig.VIDEO_CONF_STATUS);
        }
        if(VideoConferenceConfig.MULTIPLE_MASTER_SERVER_ENABLE){
            mav.addObject("multipleMasterServerEnable", "enable");
        }
        /******************************** 视频会议 end **********************************/

        boolean mtHoldTimeInSameDay = false;
        if(bean!=null && bean.getBeginDate()!=null && bean.getEndDate()!=null) {
            mtHoldTimeInSameDay = Datetimes.format(bean.getBeginDate(), Datetimes.dateStyle).equals(Datetimes.format(bean.getEndDate(), Datetimes.dateStyle));
        }
        //添加判断告知
        mav.addObject("isImpart",isImpart);
        //获取国际化js文件名
        Locale locale = AppContext.getLocale();
        String localeStr = "zh-cn";
        if (locale.equals(Locale.ENGLISH)){
            localeStr = "en";
        }
        else if (locale.equals(Locale.TRADITIONAL_CHINESE)){
            localeStr = "zh-tw";
        }
        mav.addObject("localeStr", localeStr); 
        String officeOcxUploadMaxSize = SystemProperties.getInstance().getProperty("officeFile.maxSize");
        mav.addObject("officeOcxUploadMaxSize", officeOcxUploadMaxSize);

        if(Strings.isNotBlank(proxyId) && !"0".equals(proxyId) && !"-1".equals(proxyId)){
            mav.addObject("currentUserId",Long.parseLong(proxyId));
        }else{
            mav.addObject("currentUserId",AppContext.currentUserId());
        }

        return mav.addObject("bean", bean).addObject("attachments", attachments).addObject("mtHoldTimeInSameDay", mtHoldTimeInSameDay);
    }

    public MeetingSummaryManager getMeetingSummaryManager() {
		return meetingSummaryManager;
	}

	public void setMeetingSummaryManager(MeetingSummaryManager meetingSummaryManager) {
		this.meetingSummaryManager = meetingSummaryManager;
	}

	/**
     * 查看会议Frame页面
     */
    public ModelAndView myDetailFrame(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ModelAndView mav = new ModelAndView("meeting/user/showMeetingFrame");
        String id = request.getParameter("id");
        Long meetingId = Long.parseLong(id);
        MtMeeting bean = meetingManager.getMeetingById(meetingId);
        StringBuilder sb = new StringBuilder();
        User user = AppContext.getCurrentUser();
        
        /* xiangfan 添加，被撤销后参会人不允许再次冲消息弹出框打开会议 GOV-4902*/
        response.setContentType("text/html;charset=UTF-8");
        if(bean == null || (null != bean && bean.getCreateUser().longValue() != user.getId() && (bean.getRoomState() == 0 ||
                bean.getRoomState() == 2))){
            sb.append("alert('"+ResourceUtil.getString("meeting.status.cancel")+"');");
            sb.append("if(window.dialogArguments && window.dialogArguments.callback){\n");
            sb.append("  window.dialogArguments.callback();\n");
            sb.append("} else {parent.window.close();}");
            super.rendJavaScript(response, sb.toString());
            return null;
        } else if(null != bean && bean.getState() == Constants.DATA_STATE_SAVE && bean.getCreateUser().longValue() != user.getId()){
            String label = ResourceUtil.getString("meeting.cancel",bean.getTitle());
            sb.append("alert('"+StringEscapeUtils.escapeJavaScript(label)+"');");
            sb.append("if(window.dialogArguments && window.dialogArguments.callback){\n");
            sb.append("  window.dialogArguments.callback();\n");
            sb.append("} else {parent.window.close();}");
            super.rendJavaScript(response, sb.toString());
            return null;
        } else if(bean != null) {
            //如果是点老G6领导查阅的消息链接打开，则提示不能打开
            long userId = AppContext.currentUserId();
            String lookLeaders = bean.getLookLeaders();
            if(Strings.isNotBlank(lookLeaders) && lookLeaders.indexOf(String.valueOf(userId))>-1){
                sb.append("alert('"+ResourceUtil.getString("meeting.view.nofunction")+"');");
                sb.append("parent.window.close();");
                super.rendJavaScript(response, sb.toString());
                return null;
            }
        }
        if(bean != null){
            mav.addObject("meetingTitle", bean.getTitle());
        }
        mav.addObject("affairId", request.getParameter("affairId"));
        return mav;
    }

    /**
     * 查看会议详细内容页面
     */
    public ModelAndView mydetail(HttpServletRequest request, HttpServletResponse response) throws Exception {
        response.setContentType("text/html;charset=UTF-8");
        ModelAndView mav = new ModelAndView("meeting/user/meeting_detail_chrome37_iframe");
        return mav;
    }

    /**
     * 解决Chrome37问题，在中间加一层iframe
     * @Author      : xuqiangwei
     * @Date        : 2014年11月22日下午4:01:39
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    public ModelAndView mydetailChrome37(HttpServletRequest request, HttpServletResponse response) throws Exception {
        response.setContentType("text/html;charset=UTF-8");
        ModelAndView mav = new ModelAndView("meeting/user/meeting_detail_iframe");
        String fisearch = request.getParameter("fisearch");
        String proxy = request.getParameter("proxy");//是否被代理
        String proxyId = request.getParameter("proxyId");//被代理人的Id
        String fromdoc = request.getParameter("fromdoc");
        String eventId = request.getParameter("eventId");
        String affairId = request.getParameter("affairId");
        String statType = request.getParameter("statType");
        String id = request.getParameter("id");//会议ID
        String listType = request.getParameter("listType");
        User user = AppContext.getCurrentUser();
        Long userId = user.getId();
        mav.addObject("fisearch", fisearch == null ? 0 : fisearch);
        Long meetingId = Long.parseLong(id);
        MtMeeting bean = meetingManager.getMeetingById(meetingId);
        if(bean == null){
            String label = ResourceUtil.getString("meeting.not.exist");
            String sb = createRendJs(label, true);
            super.rendJavaScript(response, sb);
            return null;
        }
        try {
            // 此处是为了升级历史数据
            ReplaceBase64Result result = fileManager.replaceBase64Image(bean.getContent());
            if( result.isConvertBase64Img() ){// 替换过正文内容才执行更新
                bean.setContent(result.getHtml());
                DBAgent.update(bean);
            }
        } catch (Exception e) {// 查看时，如果转换失败就不转换了
            logger.error("将正文中base64编码图片转为URL时发生异常！",e);
        }

        String isCollCube = request.getParameter("isCollCube");
        String isColl360  = request.getParameter("isColl360");
        mav.addObject("isCollCube", isCollCube);
        mav.addObject("isColl360", isColl360);
        mav.addObject("statType", statType);
        
        boolean toCloseWin = true;//设置JS是否关闭窗口标识
        
        if("1".equals(isCollCube)){
            
            toCloseWin = false;
            
            String _senderId  = request.getParameter("senderId");//发起人
            String _dealer_Id = request.getParameter("dealerId");//处理人
            boolean viewFlag = false;
            List<CtpAffair> allAffair = affairManager.getAffairs(ApplicationCategoryEnum.meeting, bean.getId());
            if(null != allAffair && allAffair.size()>0){
                for(int a=0; a < allAffair.size(); a++){
                    CtpAffair cAffair = allAffair.get(a);
                    if(Strings.isNotBlank(_dealer_Id) && cAffair.getMemberId().equals(Long.parseLong(_dealer_Id))){
                        viewFlag = true;
                        break;
                    }
                    if(Strings.isNotBlank(_senderId) && cAffair.getSenderId().equals(Long.parseLong(_senderId))){
                        viewFlag = true;
                        break;
                    }
                }
                if(!viewFlag){
                    PrintWriter out = response.getWriter();
                    out.println("<script>");
                    out.println("alert('"+ResourceUtil.getString("collaboration.alert.chuantou.label2")+"')");
                    out.println("</script>");
                    out.flush();
                    return null;
                }
            }else if(Strings.isNotBlank(_dealer_Id) && (null == allAffair || allAffair.size() == 0)){
                    PrintWriter out = response.getWriter();
                    out.println("<script>");
                    out.println("alert('"+ResourceUtil.getString("collaboration.alert.chuantou.label2")+"')");
                    out.println("</script>");
                    out.flush();
                    return null;
            }
        }
        if("1".equals(isColl360)){//360过来
            
            toCloseWin = false;
            
            String _senderId  = request.getParameter("senderId");//发起人
            String _dealer_Id = request.getParameter("dealerId");//处理人
            boolean viewFlag = false;
            List<CtpAffair> allAffair = affairManager.getAffairs(ApplicationCategoryEnum.meeting, bean.getId());
            if(null != allAffair && allAffair.size()>0){
                for(int a=0; a < allAffair.size(); a++){
                    CtpAffair cAffair = allAffair.get(a);
                    if(Strings.isNotBlank(_dealer_Id) && cAffair.getMemberId().equals(Long.parseLong(_dealer_Id))){
                        viewFlag = true;
                        break;
                    }
                    if(Strings.isNotBlank(_senderId) && cAffair.getSenderId().equals(Long.parseLong(_senderId)) &&
                            (StateEnum.col_done.getKey()==cAffair.getState().intValue()||StateEnum.col_sent.getKey() == cAffair.getState().intValue()
                                    ||StateEnum.col_pending.getKey() == cAffair.getState().intValue())){
                        viewFlag = true;
                        break;
                    }
                }
                if(!viewFlag){
                    PrintWriter out = response.getWriter();
                    out.println("<script>");
                    out.println("alert('"+ResourceUtil.getString("collaboration.alert.chuantou.label2")+"')");
                    out.println("</script>");
                    out.flush();
                    return null;
                }
            }else if(Strings.isNotBlank(_senderId) && (null == allAffair || allAffair.size() == 0)){
                    PrintWriter out = response.getWriter();
                    out.println("<script>");
                    out.println("alert('"+ResourceUtil.getString("collaboration.alert.chuantou.label2")+"')");
                    out.println("</script>");
                    out.flush();
                    return null;
            }
        }
        
        CtpAffair affair = null;
        if(Strings.isNotBlank(affairId)) {
        	affair = affairManager.get(Long.valueOf(affairId));
        }else if(Strings.isNotBlank(id)){
        	//判断代理。获取代理的事项
        	Long affairUserId = userId;
        	if (!MeetingUtil.isIdBlank(proxyId)) {
        		affairUserId =  Long.parseLong(proxyId);
        	}
        	List<CtpAffair> list = this.affairManager.getAffairs(ApplicationCategoryEnum.meeting, Long.parseLong(id), affairUserId);
            if(CollectionUtils.isNotEmpty(list)){
                affair = list.get(0);
            }
        }
        
        if(affair != null) {
            if(affair.getMemberId().longValue() != userId.longValue()) {
                proxyId = String.valueOf(affair.getMemberId());
            }
            //由‘未读’标记为 ‘已读’
            if(affair.getSubState() == null || affair.getSubState() == SubStateEnum.col_pending_unRead.key()){
                //发起人既是主持人或记录人，默认更新为参加状态
                if((bean.getEmceeId().longValue()==affair.getMemberId() && bean.getCreateUser().longValue()==affair.getMemberId()) ||
                        (bean.getRecorderId().longValue()==affair.getMemberId() && bean.getCreateUser().longValue()==affair.getMemberId())) {
                    affair.setSubState(SubStateEnum.meeting_pending_join.key());
                }else {
                    affair.setSubState(SubStateEnum.col_pending_read.key());
                }
                this.affairManager.updateAffair(affair);
            }
            if ("inform".equals(affair.getNodePolicy())) {
                mav.addObject("isImpart", true);
            } else {
                mav.addObject("isImpart", false);
            }
        }
        
        // 从代理事项里过来的
        mav.addObject("fagent", MeetingUtil.isIdBlank(proxyId) ? 0 : 1 );

        //入口-关联项目-会议
        boolean canVisit = false;
        boolean isQuote = Strings.isBlank(request.getParameter("isQuote")) ? false : Boolean.parseBoolean(request.getParameter("isQuote"));
        if(isQuote) {
            int baseApp = Strings.isBlank(request.getParameter("baseApp")) ? 6 : Integer.parseInt(request.getParameter("baseApp"));
            long baseObjectId = Strings.isBlank(request.getParameter("baseObjectId")) ? -1 : Long.parseLong(request.getParameter("baseObjectId"));
            if(baseApp == ApplicationCategoryEnum.taskManage.key()) {//任务模块中的关联文档-会议
                if(baseObjectId != -1) {
                    if(null!=bean && bean.getState()==Constants.DATA_STATE_SAVE) {//待发
                        Locale local = LocaleContext.getLocale(request);
                        String label = ResourceBundleUtil.getString("com.seeyon.v3x.meeting.resources.i18n.MeetingResources", local, "meeting.view.permission",new Object[]{});
                        StringBuilder sb = new StringBuilder();
                        sb.append("alert('"+ label +"');\n");
                        sb.append("if(window.dialogArguments && window.dialogArguments.callback){\n");
                        sb.append("  window.dialogArguments.callback();\n");
                        sb.append("}else if(parent.window.dialogArguments && parent.window.dialogArguments.callback){\n");
                        sb.append("  parent.window.dialogArguments.callback();\n");//从栏目打开，关闭窗口并刷新对应栏目
                        sb.append("} else {");
                        if(toCloseWin){
                            sb.append("parent.window.close();");
                        }
                        sb.append("}");
                        super.rendJavaScript(response, sb.toString());
                        return null;
                    }
                    //TODO DEV 2015-08-20 还没有给这个接口
                    /*canVisit = taskmanageApi.validateTask(request.getParameter("baseObjectId"));*/
                }
            }
        }

        // 如果是从文档中心打开，则不验证是否为与会人员
        if(Strings.isNotBlank(fromdoc)) {//xiangfan 修改为 isNotBlank GOV-4924
            if(bean == null) {
                super.rendJavaScript(response, "parent.refreshIfInvalid();");
                return null;
            } else {
                if((bean.getState() == Constants.DATA_STATE_SAVE && "10".equals(request.getParameter("state"))) || (!this.mtMeetingManager.isStillInConferees(userId, bean) && Strings.isBlank(eventId))) {
                    if(Strings.isNotBlank(proxyId) && !"0".equals(proxyId) && !"-1".equals(proxyId) && Strings.isDigits(proxyId)) {
                        if(!this.mtMeetingManager.isStillInConferees(Long.valueOf(proxyId), bean)) {
                            super.rendJavaScript(response, "parent.refreshIfInvalid();");
                            return null;
                        }
                    }
                }
            }
        }

        // SECURITY 访问安全检查
        if(!canVisit) {
            //撤销重新发起，查看会议，需要判断当前人是否依旧在该会议中
            if(null != bean && !isQuote && !AppContext.getCurrentUser().getId().equals(bean.getCreateUser())
                    && !this.mtMeetingManager.isStillInConferees(AppContext.getCurrentUser().getId(), bean)){
                Locale local = LocaleContext.getLocale(request);
                String label = ResourceBundleUtil.getString("com.seeyon.v3x.meeting.resources.i18n.MeetingResources", local, "meeting.view.permission",new Object[]{});
                if(bean.getState() == Constants.DATA_STATE_SAVE && bean.getCreateUser().longValue() != user.getId()){
                    label = ResourceBundleUtil.getString("com.seeyon.v3x.meeting.resources.i18n.MeetingResources", local, "meeting.cancel",bean.getTitle());
                }

                
                String sb = createRendJs(label, toCloseWin);
                super.rendJavaScript(response, sb);
                return null;
            }
            if(!SecurityCheck.isLicit(request, response, ApplicationCategoryEnum.meeting, user, meetingId, null, null)) {
                return null;
            }
        }
        if(!MeetingUtil.isIdBlank(proxyId)) {
        	proxy = "1";
        }
        if(bean != null) {
            String feedBack = request.getParameter("feedback");
            String feedBackFlag = request.getParameter("feedbackFlag");
            if(Strings.isNotBlank(feedBackFlag)) {
            	Date now = new Date();
            	if (bean.getEndDate().before(now)) {
            		String sb = createRendJs(ResourceUtil.getString("meeting.status.finish"), toCloseWin);//会议已结束
            		super.rendJavaScript(response, sb);
            		return null;
            	}
            }
            //TODO 
            //会议通知回执,查看时不执行该逻辑
            if(Strings.isNotBlank(feedBackFlag)) {
            	String msg = mtMeetingManager.replyMeetingFeedBack(bean,feedBack,feedBackFlag,user,proxy,proxyId,request);
            	if("myReplyNotEmpty".equals(msg)){
            		super.rendJavaScript(response, "parent.closeMtWindow('saveMtReply');try{parent.doMeeetingSign_pending('"+meetingId+"')}catch(e){}");
            		return null;
            	}
            }
        }
        if(bean != null) {
        	mav.addObject("meetingTitle", bean.getTitle());
        }
        mav.addObject("id", id);
        mav.addObject("proxy", proxy);
        mav.addObject("proxyId", proxyId);
        mav.addObject("listType", listType);
        
        //同步消息
        userMessageManager.updateSystemMessageStateByUserAndReference(AppContext.currentUserId(), Long.valueOf(id));
        
        return mav;
    }

    /**
     * 会议回执
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    public ModelAndView reply(HttpServletRequest request, HttpServletResponse response) throws Exception {
        //是否被代理
        String proxy = request.getParameter("proxy");
        //被代理人的Id
        String proxyId = request.getParameter("proxyId");
        User user = AppContext.getCurrentUser();

        String id = request.getParameter("id");
        Long meetingId = Long.parseLong(id);
        MtMeeting bean = meetingManager.getMeetingMainFieldsById(meetingId);

        String feedBack = request.getParameter("feedback");
        String feedBackFlag = request.getParameter("feedbackFlag");

        if(Strings.isNotBlank(feedBackFlag)) {
            String msg = mtMeetingManager.replyMeetingFeedBack(bean,feedBack,feedBackFlag,user,proxy,proxyId,request);
            if("myReplyNotEmpty".equals(msg)){
                super.rendJavaScript(response, "parent.closeMtWindow('saveMtReply');try{parent.doMeeetingSign_pending('"+id+"')}catch(e){}");
            }
        }
        return null;
    }

    private String createRendJs(String label, boolean closeWin){
        StringBuilder sb = new StringBuilder();
        sb.append("alert('"+ label +"');\n");
        sb.append("if(window.dialogArguments && window.dialogArguments.callback){\n");
        sb.append("  window.dialogArguments.callback();\n");
        sb.append("}else if(parent.window.dialogArguments && parent.window.dialogArguments.callback){\n");
        sb.append("  parent.window.dialogArguments.callback();\n");//从栏目打开，关闭窗口并刷新对应栏目
        sb.append("} else if(parent.window.listFrame){parent.window.listFrame.location.reload();");
        //sb.append("} else if(parent && parent.parent){parent.parent.window.close();}");
        sb.append("} else {");
        if(closeWin){
            sb.append("parent.window.getA8Top().close();"); 
        }
        sb.append("}");
        return sb.toString();
    }

    /**
     * 查看会议时，对会议回执表添加数据
     * @Author      : xuqw
     * @Date        : 2015年4月10日下午1:12:17
     * @param bean 会议对象
     * @param userId 需要添加回执记录的人员ID
     * @throws BusinessException 
     */
    private void addReplyRecord(MtMeeting bean, Map<Long, MtReply> replys, Long userId) throws BusinessException{
    	MtReply mtReply = new MtReply();
    	mtReply.setFeedbackFlag(MeetingConstant.MeetingReplyFeedbackFlagEnum.noreply.key());
    	if(replys.get(userId) != null){
    		mtReply = replys.get(userId);
    	}
        mtReply.setMeetingId(bean.getId());
        mtReply.setUserId(userId);
      
        //新建会议时会添加回执，因此查看会议不修改回执状态,只修改为已查看状态
        mtReply.setLookState(1);
        mtReply.setLookTime(new Timestamp(new Date().getTime()));
        replyManager.save(mtReply);
    }
    
    /**
     * 人员是否在会议的参会人或参会领导中
     * @Author      : xuqw
     * @Date        : 2015年4月10日下午1:47:35
     * @return
     * @throws BusinessException 
     */
    private boolean isInMeetingRole(Long meetingId, Long userId) throws BusinessException{
        
        boolean ret = false;
        
        MeetingMemberVO vo = meetingManager.getAllTypeMember(meetingId, null);
        List<Long> leaders = vo.getLeader(); //参会领导
        List<Long> conferees = vo.getConferees(); //与会人
        
        //是否在参会领导中
        for (Long leader : leaders) {
            if (leader.equals(userId)) {
                ret = true;
            }
        }
        //是否在与会人中
        for (Long conferee : conferees) {
            if (conferee.equals(userId)) {
                ret = true;
            }
        }
        
        return ret;
    }

    /**
     * 会议详情右边的iframe
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    public ModelAndView showMtDiagram(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ModelAndView mav = new ModelAndView("meeting/user/showMtDiagram");

        String idStr = request.getParameter("id");
        MtMeeting bean = meetingManager.getMeetingById(Long.valueOf(idStr));

        mav.addObject("bean", bean);
        mav.addObject("id", idStr);

        Map<Long, MtReply> list_allReply = replyManager.findAllByMeetingId(bean.getId());
        MeetingMemberVO meetingMember = meetingManager.getAllTypeMember(bean.getId(), bean);

        String proxy = request.getParameter("proxy");
        String proxyId = request.getParameter("proxyId");
        boolean viewAsAgent = Constants.PASSIVE_AGENT_FLAG.equals(proxy) && Strings.isNotBlank(proxyId);
        Long memberId = viewAsAgent ? NumberUtils.toLong(proxyId) : AppContext.currentUserId();

        boolean isImpart = Boolean.valueOf(request.getParameter("isImpart"));

        mav.addObject("proxy", proxy);
        mav.addObject("proxyId", proxyId);
        mav.addObject("isImpart",isImpart);
        mav.addObject("fisearch", StringUtils.defaultString(request.getParameter("fisearch"), "0"));


        if(!MeetingHelper.isWait(bean.getState())) {
        	MtReply reply = list_allReply.get(memberId);
        	if (null != reply) {
        		reply.setLookState(1);
        		reply.setLookTime(new Timestamp(System.currentTimeMillis()));
        		replyManager.update(reply);
        	}
        }

        //发起人的回执
        List<MtReplyWithAgentInfo> senderExList = MeetingHelper.getReplyWithAgent(meetingMember.getSenderMembers(),list_allReply);

        //主持人的回执
        List<MtReplyWithAgentInfo> emceeExList = MeetingHelper.getReplyWithAgent(meetingMember.getEmceeMembers(),list_allReply);

        //记录人的回执
        List<MtReplyWithAgentInfo> recorderExList = MeetingHelper.getReplyWithAgent(meetingMember.getRecorderMembers(),list_allReply);

        //参会领导的回执
        List<MtReplyWithAgentInfo> replyLeaderExList = MeetingHelper.getReplyWithAgent(meetingMember.getLeaderMembers(),list_allReply);

        //与会人的回执
        List<MtReplyWithAgentInfo> replyExList = MeetingHelper.getReplyWithAgent(meetingMember.getConfereesMembers(),list_allReply);

        //告知人的回执
        List<MtReplyWithAgentInfo> impartExList = MeetingHelper.getReplyWithAgent(meetingMember.getImpartMembers(),list_allReply);

        // 邀请时选人界面过滤人员
        List<MtReplyWithAgentInfo> excludeReplyExList = new ArrayList<MtReplyWithAgentInfo>();
        if(senderExList.isEmpty()){
            MtReplyWithAgentInfo senderEx = new MtReplyWithAgentInfo();
            senderEx.setReplyUserId(bean.getCreateUser());
            excludeReplyExList.add(senderEx);
        }else{
            excludeReplyExList.addAll(senderExList);
        }
        excludeReplyExList.addAll(senderExList);
        excludeReplyExList.addAll(emceeExList);
        excludeReplyExList.addAll(recorderExList);
        excludeReplyExList.addAll(replyExList);
        excludeReplyExList.addAll(replyLeaderExList);
        excludeReplyExList.addAll(impartExList);

        mav.addObject("emceeAffair", emceeExList.isEmpty() ? null : emceeExList.get(0));
        mav.addObject("recorderAffair", recorderExList.isEmpty() ? null : recorderExList.get(0));
        mav.addObject("waitSendImparts",impartExList);
        mav.addObject("affairImparts", impartExList);
        mav.addObject("replyExList", replyExList);
        mav.addObject("replyLeaderExList", replyLeaderExList);
        mav.addObject("excludeReplyExList", excludeReplyExList);

        // 会议类型
        MeetingType mt = meetingTypeManager.getMeetingTypeById(bean.getMeetingTypeId());
        mav.addObject("meetingTypeName", mt == null ? "" : ResourceUtil.getString(mt.getName()));

        //各种人数统计
        Object[] feedbackUsers = mtMeetingManager.getMeetingReplyUsers(bean.getId(),meetingMember);
        mav.addObject("feedbackUsers", feedbackUsers);

        /**
         * 我的回执
         */
        MtReply reply_1 = list_allReply.get(memberId);
        if(reply_1 != null) {
            mav.addObject("myReply", reply_1 );
        }

        /**
         * 判断会议是否可以看到回执页面
         * (回执页面包括回执态度和填写意见)
         *
         * 在会议中(!affairList.isEmpty())
         * 不是发起人(!bean.getCreateUser().equals(memberId))
         *
         */
        String replyFlag = "false";

        Map<String, Object> conditions = new HashMap<String, Object>(16);
        conditions.put("app", ApplicationCategoryEnum.meeting.key());
        conditions.put("objectId", Long.valueOf(idStr));
        conditions.put("memberId", memberId);
        List<CtpAffair> affairList = affairManager.getByConditions(null, conditions);

        if(MeetingHelper.isPending(bean.getState()) && !affairList.isEmpty()) {
            if(!bean.getCreateUser().equals(memberId)){
                replyFlag = "true";
            }
        }
        mav.addObject("replyFlag", replyFlag);

        //关联项目
        if(bean.getProjectId() != null && !com.seeyon.ctp.common.constants.Constants.GLOBAL_NULL_ID.equals(bean.getProjectId())) {
            if(AppContext.hasPlugin("project")){
                ProjectBO project = projectApi.getProject(bean.getProjectId());
                if(project != null && ProjectBO.STATE_DELETE != project.getProjectState()){
                    mav.addObject("projectName", project.getProjectName());
                }
            }
        }

        //添加会议资源
        List<MeetingResources> recourceList = meetingResourcesManager.getMeetingResourceListByMeetingId(bean.getId());
        if(Strings.isNotEmpty(recourceList)) {
            List<Long> resourceIdList = new ArrayList<Long>();
            for(MeetingResources resources : recourceList) {
                resourceIdList.add(resources.getResourceId());
            }
            Map<Long, PublicResource> resourceMap = publicResourceManager.getResourceMapById(resourceIdList);
            String resourcesName="";
            for (PublicResource resourcesNameVo : resourceMap.values()){
                resourcesName += resourcesNameVo.getName() + ",";
            }
            if(Strings.isBlank(resourcesName)){
                bean.setRecordName(resourcesName);
            }else{
                bean.setResourcesName(resourcesName.substring(0, resourcesName.length() - 1));
            }
        }
        
        //重要会议的六项要根据会议分类的设置来显示
        mav.addObject("mtch", meetingTypeRecordManager.getTypeRecordByMeetingId(bean.getId()));

        //是否开启二维码签到
        mav.addObject("qrCodeSign",bean.getQrCodeSign() != null && bean.getQrCodeSign() == MeetingBarCodeConstant.QrcodeEnable.enable.key());

        //参会情况计数
        int[] itemCount = new int[feedbackUsers.length];
        for(int i=0;i<feedbackUsers.length;i++){
            List<?> fl = (List<?>)feedbackUsers[i];
            itemCount[i] = fl.size();
        }
        mav.addObject("itemCount", itemCount);

        /**
         * 附件
         */
        List<Attachment> sattachments = attachmentManager.getByReference(bean.getId(), reply_1 != null ? reply_1.getId() : 0L);
        if(sattachments != null && sattachments.size() != 0) {
            mav.addObject("attachments", sattachments);
        }

        //会议类型中的具体项
        MeetingType meetingType = meetingTypeManager.getMeetingTypeById(bean.getMeetingTypeId());
        String content = "";
        if(meetingType != null){
            content = meetingType.getContent();
        }
        if(Strings.isNotBlank(content)){
            String[] ids = content.split(",");
            for(int i=0;i<ids.length;i++){
                int key = Integer.parseInt(ids[i]);

                MeetingContentEnum[] enums = MeetingContentEnum.values();
                if (enums != null) {
                    for (MeetingContentEnum enum1 : enums) {
                        if (enum1.getKey() == key) {
                            mav.addObject(enum1.name(), "true");
                        }
                    }
                }
            }
        }
        
        /**
         * at的人员范围
         */
        List<Map<String,Object>> allMembers = meetingMember.getAllMemberObj();
        mav.addObject("atScope",JSONUtil.toJSONString(allMembers));

        boolean isQuote = "true".equals(request.getParameter("isQuote"));
        boolean showInviting = !isQuote && (bean.getState() == 10 || bean.getState() == 20) && bean.getRoomState() != 0 && bean.getRoomState() != 2;
        mav.addObject("showInviting", showInviting);

        return mav;
    }

    /**
     *  获取会议目标为除otherMemberIds 的全体与会人员ID集合，未对代理人进行处理
     * @param currentMemberIds Type|Ids
     * @param otherMemberIds
     * @return
     */
    public List<MtReplyWithAgentInfo> getImpartMemberIds(String currentMemberIds,List<Long> conferees,Map<String,String> otherMemberIds) {

        List<MtReplyWithAgentInfo> memberIds = new ArrayList<MtReplyWithAgentInfo>();
        if (Strings.isNotBlank(currentMemberIds)) {
            Set<V3xOrgMember> orgMember = null;
            try {
                orgMember = this.orgManager.getMembersByTypeAndIds(currentMemberIds);
                if(orgMember!=null && orgMember.size()>0) {
                    for(V3xOrgMember member : orgMember) {
                        Long memberId = member.getId();
                        if(memberId !=null && otherMemberIds.containsValue(String.valueOf(memberId)) && conferees.contains(memberId)) {
                            continue;
                        }
                        MtReplyWithAgentInfo exMr = new MtReplyWithAgentInfo();
                        exMr.setReplyUserId(member.getId());
                        memberIds.add(exMr);
                    }
                }
            } catch(Exception e) {
                log.error("获取会议目标为除otherMemberIds 的全体与会人员ID集合，未对代理人进行处理", e);
            }
        }
        return memberIds;
    }

    //private static MtMeetingComparator mtMeetingComparator = new MtMeetingComparator();

    // 一个部门、组...根据sortId排序
    /*private static class MtMeetingComparator implements Comparator<V3xOrgMember> {

        public int compare(V3xOrgMember m1, V3xOrgMember m2) {
            return m1.getSortId().compareTo(m2.getSortId());
        }
    }*/

    /**
     * 获取会议的参会领导,不包括主持人、记录人
     */
    private List<V3xOrgMember> getReplyLeader(MtMeeting meeting) {
        return mtMeetingManager.getMtMembersByStrValue(meeting.getEmceeId(), meeting.getRecorderId(), meeting.getLeader());
    }

    /**
     * 获取参会人员和参会领导集合，不包括会议主持和会议记录人
     * @Author      : xuqiangwei
     * @Date        : 2014年10月14日下午7:29:34
     * @param meeting
     * @return
     
    private List<V3xOrgMember> getReplyMemberAndLeader(MtMeeting meeting) {

        String typeAndIds = meeting.getConferees();
        if(Strings.isNotBlank(meeting.getLeader())){
            typeAndIds = typeAndIds + "," +meeting.getLeader();
            if(typeAndIds.endsWith(",")){
                typeAndIds = typeAndIds.substring(0, typeAndIds.length()-1);
            }
        }
        return mtMeetingManager.getMtMembersByStrValue(meeting.getEmceeId(), meeting.getRecorderId(), typeAndIds);
    }*/

    public ModelAndView showSummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ModelAndView mav = new ModelAndView("meeting/user/showSummary");
        //String idStr = request.getParameter("id");
        /*MtSummaryTemplate summary = null;
        List<Attachment> attachments = new ArrayList<Attachment>();
        List<MtSummaryTemplate> list = mtSummaryTemplateManager.findByProperty("meetingId", Long.valueOf(idStr));
        if(list.size() > 0) {
            summary = list.get(0);
            attachments = attachmentManager.getByReference(summary.getId(), summary.getId());
        }
        mav.addObject("attachments", attachments);
        mav.addObject("summary", summary);*/
        return mav;
    }

    public ModelAndView pigeonhole(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String listMethod = request.getParameter("listMethod") == null ? "listMyMeeting" : request.getParameter("listMethod");
        String listType = request.getParameter("listType") == null ? "listMyPublishOpenedMeeting" : request.getParameter("listType");
        String menuId = request.getParameter("menuId") == null ? "2102" : request.getParameter("menuId");
        String ids = request.getParameter("id");
        String folders = request.getParameter("folders");
        MtMeeting bean = null;
        boolean result = true;
        if(StringUtils.isNotBlank(ids)) {
            String[] idA = ids.split(",");
            List<Long> idList = new ArrayList<Long>();
            List<MtMeeting> beans = new ArrayList<MtMeeting>();
            for(String id : idA) {
                if(StringUtils.isNotBlank(id)) {
                    idList.add(Long.valueOf(id));
                }
                bean = meetingManager.getMeetingById(Long.valueOf(id));
                beans.add(bean);
                if(bean.getState() == Constants.DATA_STATE_SAVE || bean.getState() == Constants.DATA_STATE_SEND || bean.getState() == Constants.DATA_STATE_START) {
                    result = false;
                    break;
                }
            }
            if(result) {
                this.mtMeetingManager.pigeonhole(idList);
                if(Strings.isNotBlank(folders)) {
                    User user = AppContext.getCurrentUser();
                    String[] folderArray = folders.split(",");
                    for(int i = 0; i < beans.size(); i++) {
                        Long fid = Long.parseLong(folderArray[i]);
                        DocResourceBO res = docApi.getDocResource(fid);
                        String forderName = docApi.getDocResourceName(res.getParentFrId());
                        appLogManager.insertLog(AppContext.getCurrentUser(), AppLogAction.Meeting_Document, user.getName(), beans.get(i).getTitle(), forderName);
                    }
                }
                // 归档后删除原来的全文检索信息
                //for(Long id : idList) {}
                    //this.indexManager.deleteFromIndex(com.seeyon.ctp.common.constants.ApplicationCategoryEnum.meeting, id);
            } else {
                MeetingException e = new MeetingException("meeting_no_pigeonhole", bean.getTitle());
                request.getSession().setAttribute("_my_exception", e);
                return this.redirectModelAndView("/mtMeeting.do?method=listMain&listMethod=" + listMethod + "&listType=" + listType+"&menuId="+menuId);
            }
        }
        return this.redirectModelAndView("/mtMeeting.do?method=listMain&listMethod=" + listMethod + "&listType=" + listType+"&menuId="+menuId);
    }

    /**
     * 进入关联文档添加页面框架
     */
    public ModelAndView list4QuoteFrame(HttpServletRequest request, HttpServletResponse response) {
        return new ModelAndView("collaboration/list4QuoteFrame");
    }

    /**
     * 我的会议列表左侧菜单页面
     */
    public ModelAndView mymtListLeft(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return new ModelAndView("meeting/user/mymt_meeting_list_left");
    }

    /**
     * 我的会议列表主页面
     */
    public ModelAndView mymtListHome(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return new ModelAndView("meeting/user/mymt_homeEntry");
    }

    /**
     * 我的会议列表主页面
     */
    public ModelAndView mymtListMain(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String from = request.getParameter("from");
        ModelAndView mavin = new ModelAndView("meeting/user/mymt_meeting_list_main");
        mavin.addObject("from", from);
        return mavin;
    }

    /**
     * 意见震荡回复 --xiangfan
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    public ModelAndView doComment(HttpServletRequest request, HttpServletResponse response) throws Exception{
        String meetingId = request.getParameter("meetingId");
        String replyId = request.getParameter("replyId");
        String proxyId = Strings.isBlank(request.getParameter("proxyId"))? "" : request.getParameter("proxyId");
        String proxy = "";//格式 '名称|id'
        User user = AppContext.getCurrentUser();
        Long userId = user.getId();
        
        boolean isHidden = request.getParameterValues("isHidden") != null;
        
        if(Strings.isBlank(replyId)) {
        	String[] replyIds = request.getParameterValues("replyId");
        	if(replyIds.length > 1) {
        		replyId = replyIds[replyIds.length - 1]; 
        	}
        }
        if(Strings.isBlank(replyId) || Strings.isBlank(meetingId)){
            super.rendJavaScript(response, "alert('"+ResourceUtil.getString("meeting.exception.replyError")+"');");
            return null;
        }

        Timestamp now = new Timestamp(System.currentTimeMillis());
        MtComment mtComment = new MtComment();
        mtComment.setIdIfNew();
        mtComment.setIsHidden(isHidden);
        if(isHidden){
            String showToIds = request.getParameter("showToId");
            mtComment.setShowToId(showToIds);
        }
        mtComment.setCreateDate(now);
        mtComment.setMeetingId(Long.parseLong(meetingId));
        mtComment.setReplyId(Long.parseLong(replyId));
        mtComment.setContent(request.getParameter("content"));
        
        if(Strings.isNotBlank(proxyId) && NumberUtils.isNumber(proxyId) && !"-1".equals(proxyId)){
            Long lProxyId = Long.parseLong(proxyId);
            if(!userId.equals(lProxyId)){
                V3xOrgMember member = this.orgManager.getMemberById(lProxyId);
                if(member != null){
                    proxy = member.getName() + "|" + proxyId;
                    mtComment.setProxyId(proxyId);
                }
            }
        }
        mtComment.setCreateUserId(userId);
        this.mtMeetingManager.saveComment(mtComment);
        this.attachmentManager.create(ApplicationCategoryEnum.meeting, Long.parseLong(meetingId), mtComment.getId(), request);
        //发送消息所需参数准备
        boolean sendMsg = request.getParameterValues("sendMsg") != null;
        MtReply reply = replyManager.getById(Long.parseLong(replyId));
        MtMeeting meeting = meetingManager.getMeetingById(Long.parseLong(meetingId));
        String messageReceiverStr = "";
        //消息推送人
        if (sendMsg) {
            messageReceiverStr = request.getParameterValues("messageReceiver")[0];
            //给消息推送人、发起人和被回复人发送消息
            MeetingMsgHelper.sendMessage(messageReceiverStr, mtComment, reply, meeting, AppContext.getCurrentUser());
        }
        
        super.rendJavaScript(response, "parent.MtReplyCommentOK('" + Datetimes.formateToLocaleDatetime(now) + "','" + proxy + "')");
        return null;
    }

//    /**
//     * 会议统计
//     * @param request
//     * @param response
//     * @return
//     * @throws Exception
//     */
//    public ModelAndView meetingStat(HttpServletRequest request, HttpServletResponse response)throws Exception {
//        ModelAndView mav = new ModelAndView("meeting/user/meeting_stat");
//        String listType = request.getParameter("listType");
//        Long reportId = ReportsEnum.MeetingJoinStatistics.getKey();
//        if("meetingRoleStat".equals(listType))
//            reportId = ReportsEnum.MeetingJoinRoleStatistics.getKey();
//        /*if("meetingReplyStat".equals(listType)) {//统计回执情况
//        } else {//统计参与角色
//        }*/
//        mav.addObject("listType", listType);
//        mav.addObject("reportId", reportId);
//        return mav;
//    }


    public ModelAndView showCommenter(HttpServletRequest request,HttpServletResponse response) {
        ModelAndView mav = new ModelAndView("meeting/user/pushMessageList");
        Long meetingId = Long.parseLong(request.getParameter("meetingId"));
        List<MtReply> lists = new ArrayList<MtReply>();
        List<MtReply> replies = this.replyManager.findByPropertyNoInit("meetingId", meetingId);
        try {
			List<MtReply> meetingPerson = meetingManager.getAllMeetingPersonByMId(meetingId);
			Map<Long,MtReply> replyMap = new HashMap<Long,MtReply>();
			boolean containCreateUser = false;
			MtMeeting meeting = meetingManager.getMeetingById(meetingId);
			for(MtReply reply : replies){
				replyMap.put(reply.getUserId(), reply);
			}
			for(MtReply mr : replies){
			    if(mr.getUserId().longValue() == meeting.getCreateUser().longValue()){
			        containCreateUser = true;
			        break;
			    }
			}
			
			for(MtReply mr : meetingPerson){
				if(!containCreateUser && mr.getUserId().longValue() == meeting.getCreateUser().longValue()){
			        containCreateUser = true;
			    }
				MtReply mtReply = replyMap.get(mr.getUserId());
				if(null!=mtReply){
					lists.add(mtReply);
				}else{
					lists.add(mr);
				}
			}
			
			if(!containCreateUser){
			    MtReply mr = new MtReply(UUIDLong.longUUID(), meeting.getCreateUser(), meetingId, Constants.FEEDBACKFLAG_ATTEND);
			    if(mr.getUserId().longValue() != meeting.getEmceeId() && mr.getUserId().longValue() != meeting.getRecorderId())
			        mr.setType("createUser");//如果只是发起人，需要标注一下，便于前段展示
			    lists.add(mr);
			}
			mav.addObject("meetingCreateUserId", meeting.getCreateUser());
			mav.addObject("meetingRecorderId", meeting.getRecorderId());
			mav.addObject("meetingEmceeId", meeting.getEmceeId());
		//} catch (BusinessException e) {
        } catch (Exception e) {
			log.error("获取会议所有人出错", e);
		}
        return mav.addObject("replyList", lists);
    }

    /**
     * 导出参会人员
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    public ModelAndView transExportExcelMeeting(HttpServletRequest request,
            HttpServletResponse response) throws Exception {
        String idStr = request.getParameter("id");
        Long meetingId = Long.valueOf(idStr);

        /**
         * 会议记录
         */
        MtMeeting meeting = meetingManager.getMeetingById(Long.valueOf(idStr));

        /**
         * 会议所有相关人员
         */
        MeetingMemberVO memberVo = meetingManager.getAllTypeMember(meetingId, null);

        /**
         * 会议所有人的回执
         */
        Map<Long, MtReply> allReply = replyManager.findAllByMeetingId(meetingId);
        Map<Long, MtReply> allMemberReplyMap = new HashMap<Long, MtReply>(16);
        for(Map.Entry<Long,MtReply> entry : allReply.entrySet()){
            MtReply reply = entry.getValue();
            allMemberReplyMap.put(reply.getUserId(),reply);
        }

        /**
         * 所有签到信息
         */
        List<MeetingQrcodeSign> qrcodeSignList = meetingBarCodeManager.findQrSignByMeetingId(meetingId);
        Map<Long,String> qrcodeSignMap = Maps.newHashMap();
        for(MeetingQrcodeSign sign: qrcodeSignList){
            qrcodeSignMap.put(sign.getMemberId(), Datetimes.format(sign.getSignDate(), Datetimes.datetimeStyle));
        }

        /**
         * 准备需要导出的数据
         * 1.会议中所有人员
         * 2.访客
         */
        List<V3xOrgMember> allMembers = new ArrayList<V3xOrgMember>();
        allMembers.addAll(memberVo.getLeaderMembers());
        allMembers.addAll(memberVo.getSenderMembers());
        allMembers.addAll(memberVo.getEmceeMembers());
        allMembers.addAll(memberVo.getRecorderMembers());
        allMembers.addAll(memberVo.getConfereesMembers());
        allMembers.addAll(memberVo.getImpartMembers());
        allMembers.addAll(memberVo.getExternalMembers());

        List<Map<String,Object>> allMemberInfo = new ArrayList<Map<String, Object>>();
        Map<Long,Object> hash = new HashMap<Long, Object>(16);
        boolean hasExternalUnit = false;

        for(V3xOrgMember member : allMembers){
            Map<String,Object> props;
            if(!hash.containsKey(member.getId())){
                props = new HashMap<String, Object>(16);
                MtReply reply = allMemberReplyMap.get(member.getId());
                String signTime = qrcodeSignMap.get(member.getId());
                props.put("member",member);
                props.put("feedback",feedbackFlag2Name(reply != null ? reply.getFeedbackFlag() : Constants.FEEDBACKFLAG_NOREPLY));
                props.put("role", memberVo.getRolesByMemberId(member.getId()));
                props.put("sign",signTime != null ? signTime : "");
                //判断是否包含外单位人员
                if(!member.getOrgAccountId().equals(meeting.getAccountId()) || member.isVisitor()){
                    hasExternalUnit = true;
                }
                hash.put(member.getId(),props);
                allMemberInfo.add(props);
            }
        }

        /**
         * 准备表头
         */
        List<String> colNames = new ArrayList<String>();
        List<Short> colWidth = new ArrayList<Short>();
        //序号
        colNames.add(ResourceUtil.getString("meeting.export.serialNumber"));
        colWidth.add((short) 12);
        //姓名
        colNames.add(ResourceUtil.getString("meeting.export.name"));
        colWidth.add((short) 12);
        //性别
        colNames.add(ResourceUtil.getString("meeting.export.sex"));
        colWidth.add((short) 12);
        //单位
        if(hasExternalUnit){
            colNames.add(ResourceUtil.getString("meeting.export.unit"));
            colWidth.add((short) 36);
        }
        //所属部门
        colNames.add(ResourceUtil.getString("meeting.export.department"));
        colWidth.add((short) 36);
        //岗位
        colNames.add(ResourceUtil.getString("meeting.export.post"));
        colWidth.add((short) 24);
        //手机
        colNames.add(ResourceUtil.getString("meeting.export.phone"));
        colWidth.add((short) 24);
        //邮箱
        colNames.add(ResourceUtil.getString("meeting.export.email"));
        colWidth.add((short) 24);
        //工作地
        colNames.add(ResourceUtil.getString("meeting.export.workplace"));
        colWidth.add((short) 36);
        //回执状态
        colNames.add(ResourceUtil.getString("meeting.export.feedbackstatus"));
        colWidth.add((short) 12);
        //签到时间
        if(meeting.getQrCodeSign() !=null && meeting.getQrCodeSign() == MeetingBarCodeConstant.QrcodeEnable.enable.key()){
            colNames.add(ResourceUtil.getString("meeting.export.checkInTime"));
            colWidth.add((short) 24);
        }
        //角色
        colNames.add(ResourceUtil.getString("meeting.common.label.meetingRole"));
        colWidth.add((short) 24);

        /**
         * 填充数据
         */
        List<DataRow> rows = new ArrayList<DataRow>();
        for(int i = 0;i < allMemberInfo.size();i++){
            DataRow row = new DataRow();
            Map<String,Object> memberInfo = allMemberInfo.get(i);
            V3xOrgMember member = (V3xOrgMember) memberInfo.get("member");
            V3xOrgVisitor visitor = null;
            if(member.isVisitor()){
                visitor = orgManager.getVisitorById(member.getId());
            }

            //序号
            row.addDataCell(String.valueOf(i + 1),7);
            //姓名
            row.addDataCell(member.getName(),1);
            /**
             * 性别
             */
            String sex ="";
            if(member.getGender()!=null){
                if(V3xOrgEntity.MEMBER_GENDER_MALE==member.getGender()){
                    sex=ResourceUtil.getString("meeting.export.male");
                } else if(V3xOrgEntity.MEMBER_GENDER_FEMALE==member.getGender()){
                    sex=ResourceUtil.getString("meeting.export.female");
                }
            }
            row.addDataCell(sex, 1);
            /**
             * 单位
             */
            if(hasExternalUnit){
	            String accountName;
	            if(visitor != null){
	                accountName = visitor.getAccount_name();
	            }else{
	                V3xOrgAccount account = orgManager.getAccountById(member.getOrgAccountId());
	                accountName = account.getName();
	            }
	            row.addDataCell(accountName, 1);
            }
            /**
             * 部门
             */
            String deptName = "";
            if(!member.isVisitor()){
                V3xOrgDepartment dept = orgManager.getDepartmentById(member.getOrgDepartmentId());
                deptName = dept.getName();
            }
            row.addDataCell(deptName,1);

            /**
             * 岗位
             */
            String postName = "";
            V3xOrgPost post = orgManager.getPostById(member.getOrgPostId());
            //编外人员、外部人员没有岗位
            if(post != null) {
            	postName = post.getName();
            }
            row.addDataCell(postName,1);

            /**
             * 手机
             */
            String telNumber;
            if(visitor != null){
                telNumber = visitor.getMobile();
            }else{
                //1.先取到人员所在单位的通讯录设置规则
                AddressBookSet addressBookSet = addressBookManager.getAddressbookSetByAccountId(member.getOrgAccountId());
                //2.再判断人员1 是否可见  人员2 的手机号码，逐个校验
                boolean canSeeTel = addressBookManager.checkPhone(AppContext.currentUserId(), member.getId(), member.getOrgAccountId(), addressBookSet);

                telNumber = canSeeTel ? member.getTelNumber() : "******";
            }
            row.addDataCell(telNumber, 1);

            //邮箱
            row.addDataCell(member.getEmailAddress(), 1);
            /**
             * 工作地
             */
            String workplace = "";
            if (member.getLocation() != null ){
                workplace = enumManagerNew.parseToName(member.getLocation());
            }
            row.addDataCell(workplace, 1);
            //回执状态
            row.addDataCell((String) memberInfo.get("feedback"), 1);
            //签到时间
            if(meeting.getQrCodeSign() !=null && meeting.getQrCodeSign() == MeetingBarCodeConstant.QrcodeEnable.enable.key()){
                row.addDataCell((String) memberInfo.get("sign"),1);
            }
            //身份
            row.addDataCell((String) memberInfo.get("role"),1);

            rows.add(row);
        }

        /**
         * 设置excel表数据
         */
        DataRecord dr = new DataRecord();
        // 会议日期开始时间
        Date beginDate = meeting.getBeginDate();
        String meetingDate = Datetimes.formatDate(beginDate);
        String[] date = meetingDate.split("-");
        // 会议日期：
        dr.setSubTitle(ResourceUtil.getString("meeting.export.createDate")+date[0]+ResourceUtil.getString("meeting.export.year")+
                date[1]+ResourceUtil.getString("meeting.export.month")+date[2]+ResourceUtil.getString("meeting.export.day"));
        //会议名称+参会人名单
        dr.setTitle(meeting.getTitle()+ResourceUtil.getString("meeting.export.participants"));
        //会议名称+参会人名单
        dr.setSheetName(meeting.getTitle()+ResourceUtil.getString("meeting.export.participants"));

        //设置表头
        dr.setColumnName(colNames.toArray(new String[colNames.size()]));
        //设置数据列
        dr.addDataRow(rows.toArray(new DataRow[rows.size()]));
        /**
         * 设置列宽
         */
        short[] shorts = new short[colWidth.size()];
        for(int i = 0;i < colWidth.size();i++){
            shorts[i] = colWidth.get(i);
        }
        dr.setColumnWith(shorts);

        this.fileToExcelManager.save(response, ResourceUtil.getString("meeting.export.participantsName"),new DataRecord[] {dr});
        return null;
    }
    
	private String feedbackFlag2Name(Integer feedbackFlag) {
		String feedbackName = ResourceUtil.getString("meeting.channel.source.3.label");
		if (Constants.FEEDBACKFLAG_NOREPLY == feedbackFlag){
            feedbackName = ResourceUtil.getString("meeting.channel.source.1.label");
        }else if (Constants.FEEDBACKFLAG_ATTEND == feedbackFlag){
            feedbackName = ResourceUtil.getString("meeting.channel.source.2.label");
        }else if (Constants.FEEDBACKFLAG_UNATTEND == feedbackFlag) {
			feedbackName = ResourceUtil.getString("meeting.channel.source.4.label");
		}else if(Constants.FEEDBACKFLAG_IMPART == feedbackFlag){
            feedbackName = ResourceUtil.getString("meeting.channel.source.5.label");
        }
		return feedbackName;
	}
	/**
	 * 会议二维码打印页面
	 */
	public ModelAndView showBarCodePrint(HttpServletRequest request, HttpServletResponse response) throws BusinessException{
		ModelAndView mv = new ModelAndView(MeetingPathConstant.bar_code_print);
		Long meetingId = Strings.isBlank(request.getParameter("id")) ? -1L : Long.parseLong(request.getParameter("id"));
		MtMeeting meeting = this.meetingManager.getMeetingById(meetingId);
		if(meeting == null) {
			return refreshWorkspace();
		}

		mv.addObject("from","meeting");
		MeetingRoom room = meetingRoomManager.getRoomById(meeting.getRoom() == null ? -1L : meeting.getRoom());
		if(room != null){
			mv.addObject("meetingRoom",room.getName());
		}
		MeetingScreenSet screenSet = meetingSettingManager.getMeetingScreenSet(meeting.getAccountId());
		mv.addObject("logoId",screenSet == null? null :screenSet.getLogoId());
		
        String beginTime = Datetimes.format(meeting.getBeginDate(), Datetimes.datetimeWithoutSecondStyle);
        String endTime = Datetimes.format(meeting.getEndDate(), Datetimes.datetimeWithoutSecondStyle);
        if(beginTime.substring(0, 9).equals(endTime.substring(0, 9))){
        	mv.addObject("meetingTime",beginTime + " - " + endTime.substring(10));
        }else{
        	mv.addObject("meetingTime",beginTime + " - " + endTime);
        }

        if(meeting.getQrCodeCheckIn() != null){
            mv.addObject("qrCodeFile",fileManager.getV3XFile(meeting.getQrCodeCheckIn()));
        }
		mv.addObject("bean",meeting);
		return mv;
	} 
	
    

}
