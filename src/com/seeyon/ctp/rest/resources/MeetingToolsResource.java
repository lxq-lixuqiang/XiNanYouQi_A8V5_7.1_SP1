package com.seeyon.ctp.rest.resources;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

import org.apache.commons.logging.Log;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.seeyon.apps.meeting.po.PublicResource;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.log.CtpLogFactory;
import com.seeyon.ctp.rest.resources.BaseResource;
import com.seeyon.ctp.util.DBAgent;


@Path("meetingTools")
public class MeetingToolsResource extends BaseResource { 
	
	private static Log logger = CtpLogFactory.getLog(MeetingToolsResource.class);

	@GET
	@Path("getAll")
	public Response getMeetingTools() { 
		Long accountId = Long.valueOf(AppContext.currentAccountId());
		String hql = "from PublicResource where accountId =:accountId";
		Map<String, Object> map = new HashMap<String, Object>(); 
		if(accountId != null){		
			map.put("accountId", accountId); 
		}
		List<PublicResource> lst = DBAgent.find(hql, map); 

		List<JSONObject> data = JSON.toJavaObject(JSON.parseArray(JSON.toJSON(lst).toString()), List.class);
		List<JSONObject> ret  =  new ArrayList<JSONObject>();
		for(JSONObject o : data) {
			o.put("id", o.get("id")+"");
			ret.add(o);
			
		}
		logger.info("------Result："+ret);
		return ok(ret);
	}
	
}
