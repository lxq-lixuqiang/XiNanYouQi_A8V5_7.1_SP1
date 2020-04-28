package com.seeyon.apps.meeting.manager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import com.seeyon.apps.meeting.dao.MeetingDao;
import com.seeyon.apps.meeting.vo.ConfereesConflictVO;
import com.seeyon.apps.meeting.vo.MeetingMemberVO;
import com.seeyon.ctp.common.exceptions.BusinessException;
import com.seeyon.ctp.organization.bo.V3xOrgMember;
import com.seeyon.ctp.organization.dao.OrgHelper;
import com.seeyon.ctp.organization.manager.OrgManager;
import com.seeyon.ctp.util.Strings;
import com.seeyon.v3x.meeting.domain.MtMeeting;

/**
 * 
 * @author 唐桂林
 *
 */
public class ConfereesConflictManagerImpl implements ConfereesConflictManager {

	private OrgManager orgManager;
	private MeetingDao meetingDao;
	private MeetingManager meetingManager;
	
	/**
	 * ajax请求：校验参会人员是否有会议冲突
	 * @param confereesParameterMap
	 * @return
	 * @throws BusinessException
	 */
	@Override
	public boolean checkConfereesConflict(MtMeeting meeting) throws BusinessException {
		//除本身会议外，存在交叉的会议集合
        List<MtMeeting> meetingList = meetingDao.getPublishedMeetingListByDateAnOutId(meeting.getBeginDate(), meeting.getEndDate(), meeting.getMeetingId());
		if(Strings.isEmpty(meetingList)){
			return false;
		}

		/**
		 * 获取当前会议的人员属性
		 */
		//主持人
		Long emceeId = meeting.getEmceeId();
		//记录人
		Long recorderId = meeting.getRecorderId();
		//与会人
		List<Long> confereeIds = new ArrayList<Long>();
		if(!Strings.isEmpty(meeting.getConferees())){
			confereeIds = OrgHelper.getMemberIdsByTypeAndId(meeting.getConferees(), orgManager);
		}
		//参会领导
		List<Long> leaderIds = new ArrayList<Long>();
		if(!Strings.isEmpty(meeting.getLeader())){
			leaderIds = OrgHelper.getMemberIdsByTypeAndId(meeting.getLeader(), orgManager);
		}

        for(MtMeeting mtMeeting : meetingList){
        	MeetingMemberVO memberVo = meetingManager.getAllTypeMember(mtMeeting.getId(),null);
        	List<String> types = new ArrayList<String>();
        	types.add(MeetingMemberVO.emceeMember);
        	types.add(MeetingMemberVO.recorderMember);
        	types.add(MeetingMemberVO.confereesMember);
        	types.add(MeetingMemberVO.leaderMember);
        	List<Long> memberIds = memberVo.getMembersInclude(types);

			/**
			 * 和当前会议对比
			 */
			if(memberIds.contains(emceeId)){
				return true;
			}
			if(memberIds.contains(recorderId)){
				return true;
			}
			for(Long confereeId : confereeIds){
				if(memberIds.contains(confereeId)){
					return true;
				}
			}
			for(Long leaderId : leaderIds){
				if(memberIds.contains(leaderId)){
					return true;
				}
			}
        }
        return false;
	}
	
	/**
	 * 有会议冲突的参会人员冲突列表
	 * @param confereesParameterMap
	 * @return
	 * @throws BusinessException
	 */
	@Override
	public List<ConfereesConflictVO> findConflictVOListForMessage(MtMeeting meeting) throws BusinessException {
		List<ConfereesConflictVO> conflictList = new ArrayList<ConfereesConflictVO>();
		//除本身会议外，存在交叉的会议集合
        List<MtMeeting> meetingList = meetingDao.getPublishedMeetingListByDateAnOutId(meeting.getBeginDate(), meeting.getEndDate(), meeting.getId());
		if(Strings.isEmpty(meetingList)){
			return conflictList;
		}

		MeetingMemberVO vo = meetingManager.getAllTypeMember(meeting.getId(), meeting);
		List<Long> allMembers = vo.getAllMembers();//当前会议所有人员

        for(MtMeeting mtMeeting : meetingList){
        	MeetingMemberVO memberVo = meetingManager.getAllTypeMember(mtMeeting.getId(),null);
        	
        	List<String> types = new ArrayList<String>();
        	types.add(MeetingMemberVO.emceeMember);
        	types.add(MeetingMemberVO.recorderMember);
        	types.add(MeetingMemberVO.confereesMember);
        	types.add(MeetingMemberVO.leaderMember);
        	List<Long> members = memberVo.getMembersInclude(types);

        	for(Long memberId : members){
        		if(allMembers.contains(memberId)){
        			ConfereesConflictVO conflict = new ConfereesConflictVO();
        			conflict.setId(memberId);
        			conflict.setMtTitle(mtMeeting.getTitle());
        	       	conflictList.add(conflict);
        		}
        	}
        }
        
        return conflictList;
	}
	
	@Override
	public List<ConfereesConflictVO> findConflictVOListForShow(MtMeeting meeting) throws BusinessException {
		List<ConfereesConflictVO> conflictList = new ArrayList<ConfereesConflictVO>();
		//除本身会议外，存在交叉的会议集合
        List<MtMeeting> meetingList = meetingDao.getPublishedMeetingListByDateAnOutId(meeting.getBeginDate(), meeting.getEndDate(), meeting.getMeetingId());
		if(Strings.isEmpty(meetingList)){
			return conflictList;
		}
        
		
        for(MtMeeting mtMeeting : meetingList){
        	MeetingMemberVO memberVo = meetingManager.getAllTypeMember(mtMeeting.getId(),null);
        	List<String> types = new ArrayList<String>();
        	types.add(MeetingMemberVO.emceeMember);
        	types.add(MeetingMemberVO.recorderMember);
        	types.add(MeetingMemberVO.confereesMember);
        	types.add(MeetingMemberVO.leaderMember);
        	List<Long> members = memberVo.getMembersInclude(types);
        	
        	//与会人
    		String[] confereeArr = meeting.getConferees().split(",");
    		for(String conferee : confereeArr) {
    			String data[] = conferee.split("[|]");
    			//客开 胡超 与会人可以为空 start
    			if(data.length < 2) {
    				continue;
    			}
    			//客开 胡超 与会人可以为空 end
    			List<V3xOrgMember> memberList = orgManager.getMembersByType(data[0], Long.valueOf(data[1]));
    			for(V3xOrgMember member : memberList){
    				if(members.contains(member.getId())){
    					ConfereesConflictVO conflict = new ConfereesConflictVO();
            			conflict.setId(Long.valueOf(data[1]));
            			conflict.setMtTitle(mtMeeting.getTitle());
            			conflict.setBeginDate(mtMeeting.getBeginDate());
            			conflict.setEndDate(mtMeeting.getEndDate());
            			conflict.setCollideType(data[0]);
            			conflict.setMeetingUserType(2);
            	       	conflictList.add(conflict);
            	       	break;
    				}
    			}
    		}
    		//参会领导
    		String[] leaderArr = meeting.getLeader().split(",");
    		for(String leader : leaderArr) {
    			if (Strings.isBlank(leader)) {
    				continue;
    			}
    			String data[] = leader.split("[|]");
    			List<V3xOrgMember> memberList = orgManager.getMembersByType(data[0], Long.valueOf(data[1]));
    			for(V3xOrgMember member : memberList){
    				if(members.contains(member.getId())){
    					ConfereesConflictVO conflict = new ConfereesConflictVO();
    					conflict.setId(Long.valueOf(data[1]));
    					conflict.setMtTitle(mtMeeting.getTitle());
    					conflict.setBeginDate(mtMeeting.getBeginDate());
    					conflict.setEndDate(mtMeeting.getEndDate());
    					conflict.setCollideType(data[0]);
    					conflict.setMeetingUserType(3);
    					conflictList.add(conflict);
    					break;
    				}
    			}
    		}
        	
        	if(members.contains(meeting.getEmceeId())){
        		ConfereesConflictVO conflict = new ConfereesConflictVO();
    			conflict.setId(meeting.getEmceeId());
    			conflict.setMtTitle(mtMeeting.getTitle());
    			conflict.setBeginDate(mtMeeting.getBeginDate());
    			conflict.setEndDate(mtMeeting.getEndDate());
    			conflict.setCollideType("Member");
    			conflict.setMeetingUserType(0);
    	       	conflictList.add(conflict);
        	}
        	if(members.contains(meeting.getRecorderId()) && !meeting.getEmceeId().equals(meeting.getRecorderId())){
        		ConfereesConflictVO conflict = new ConfereesConflictVO();
    			conflict.setId(meeting.getRecorderId());
    			conflict.setMtTitle(mtMeeting.getTitle());
    			conflict.setBeginDate(mtMeeting.getBeginDate());
    			conflict.setEndDate(mtMeeting.getEndDate());
    			conflict.setCollideType("Member");
    			conflict.setMeetingUserType(1);
    	       	conflictList.add(conflict);
        	}
        }
        
		Comparator<ConfereesConflictVO> com = new ConfereesConflictVO();
        Collections.sort(conflictList, com);
        
        return conflictList;
	}

	public void setOrgManager(OrgManager orgManager) {
		this.orgManager = orgManager;
	}
	public void setMeetingDao(MeetingDao meetingDao) {
		this.meetingDao = meetingDao;
	}
	public void setMeetingManager(MeetingManager meetingManager) {
		this.meetingManager = meetingManager;
	}
}
