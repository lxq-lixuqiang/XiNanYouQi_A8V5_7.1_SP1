/**
 * Author ouyp 
 * Rev 
 * Date: 2018年12月26日 下午8:44:40
 *
 * Copyright (C) 2018 Seeyon, Inc. All rights reserved.
 *
 * This software is the proprietary information of Seeyon, Inc.
 * Use is subject to license terms.
 */
package com.seeyon.ctp.report.engine.manager;

import java.io.File;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.aspectj.lang.JoinPoint;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.aspose.imaging.internal.a.w;
import com.google.common.collect.Maps;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.SystemEnvironment;
import com.seeyon.ctp.common.exceptions.BusinessException;
import com.seeyon.ctp.common.filemanager.manager.FileManager;
import com.seeyon.ctp.common.po.filemanager.V3XFile;
import com.seeyon.ctp.report.engine.api.manager.ReportResultApi;
import com.seeyon.ctp.report.engine.result.QueryTableResultManager;
import com.seeyon.ctp.report.engine.result.StatsTableResultManager;
import com.seeyon.ctp.report.engine.result.StatsTableResultManager.CellValue;
import com.seeyon.ctp.report.phantomjs.manager.PhantomjsManager;
import com.seeyon.ctp.util.Datetimes;
import com.seeyon.ctp.util.FlipInfo;
import com.seeyon.ctp.util.JDBCAgent;

/**
 * <p>
 * Title:
 * </p>
 * <p>
 * Description:
 * </p>
 * <p>
 * Copyright: Copyright (c) 2018
 * </p>
 * <p>
 * Company: seeyon.com
 * </p>
 * <p>
 * Since Seeyon V7.1
 * </p>
 */
public class ResultAjaxManagerImpl implements ResultAjaxManager {
	// fields
	private ReportResultApi reportResultApi;
	private PhantomjsManager phantomjsManager;
	private ResultManager resultManager;
	private FileManager fileManager;

	// setters
	public void setReportResultApi(ReportResultApi reportResultApi) {
		this.reportResultApi = reportResultApi;
	}

	public void setPhantomjsManager(PhantomjsManager phantomjsManager) {
		this.phantomjsManager = phantomjsManager;
	}

	public void setResultManager(ResultManager resultManager) {
		this.resultManager = resultManager;
	}

	public void setFileManager(FileManager fileManager) {
		this.fileManager = fileManager;
	}

	@Override
	public Object queryTableResult(Map<String, Object> params) throws BusinessException {
		JDBCAgent agent = new JDBCAgent();
		try {
			AppContext.putThreadContext("designId", params.get("designId"));
			if ("4085567871552603725".equals(params.get("designId").toString())) {
				QueryTableResultManager.TableResult result = (QueryTableResultManager.TableResult) reportResultApi
						.queryTableResult(params);
				QueryTableResultManager.FieldWrap field = new QueryTableResultManager.FieldWrap();
				field.setDisplay("预计参会人数");
				field.setFieldComType("text");
				field.setFormatType("format_thousand");
				field.setShowOrHide(true);
				field.setDataIndex(11);
				field.setKey("meeting_0_numbers");
				result.getFields().add(field);
				FlipInfo flipInfo = (FlipInfo) AppContext.getThreadContext("flipInfo");
				List<Map<String, Object>> list = flipInfo.getData();
				List<Map<String, Object>> data = result.getData();
				for (int i = 0; i < list.size(); i++) {
					Map<String, Object> map = list.get(i);
					// 不能取会议的，要取会议申请的人数
					agent.execute("select numbers from meeting where id = ?", map.get("meeting_0.ID"));
					Object numbers = agent.resultSetToMap().get("numbers");
					Map<String, Object> map2 = data.get(i);
					Map m = new HashMap();
					m.put("v", numbers);
					map2.put("11", m);
				}
				return result;
			}
			if ("8603796114228461663".equals(params.get("designId").toString())) {
				QueryTableResultManager.TableResult result = (QueryTableResultManager.TableResult) reportResultApi
						.queryTableResult(params);
				QueryTableResultManager.FieldWrap field = new QueryTableResultManager.FieldWrap();
				field.setDisplay("预计参会人数");
				field.setFieldComType("text");
				field.setFormatType("format_thousand");
				field.setShowOrHide(true);
				field.setDataIndex(12);
				field.setKey("meeting_0_numbers");
				result.getFields().add(field);
				FlipInfo flipInfo = (FlipInfo) AppContext.getThreadContext("flipInfo");
				List<Map<String, Object>> list = flipInfo.getData();
				List<Map<String, Object>> data = result.getData();
				for (int i = 0; i < list.size(); i++) {
					Map<String, Object> map = list.get(i);
					agent.execute("select numbers from meeting_room_app where id = ?",
							map.get("meeting_room_app_0.ID"));
					Object numbers = agent.resultSetToMap().get("numbers");
					Map<String, Object> map2 = data.get(i);
					Map m = new HashMap();
					m.put("v", numbers);
					map2.put("12", m);
				}
				return result;
			}
			if ("-1763432283535487673".equals(params.get("designId").toString())) {
				QueryTableResultManager.TableResult result = (QueryTableResultManager.TableResult) reportResultApi
						.queryTableResult(params);
				QueryTableResultManager.FieldWrap field = new QueryTableResultManager.FieldWrap();
				field.setDisplay("预计参会人数");
				field.setFieldComType("text");
				field.setFormatType("format_thousand");
				field.setShowOrHide(true);
				field.setDataIndex(12);
				field.setKey("meeting_0_numbers");
				result.getFields().add(field);
				FlipInfo flipInfo = (FlipInfo) AppContext.getThreadContext("flipInfo");
				List<Map<String, Object>> list = flipInfo.getData();
				List<Map<String, Object>> data = result.getData();
				for (int i = 0; i < list.size(); i++) {
					Map<String, Object> map = list.get(i);
					agent.execute("select numbers from meeting_room_app where id = ?",
							map.get("meeting_room_app_0.ID"));
					Object numbers = agent.resultSetToMap().get("numbers");
					Map<String, Object> map2 = data.get(i);
					Map m = new HashMap();
					m.put("v", numbers);
					map2.put("12", m);
				}
				return result;
			}
		} catch (SQLException e) {
			return reportResultApi.queryTableResult(params);
		} finally {
			agent.close();
		}
		return reportResultApi.queryTableResult(params);
	}

	@Override
	public Object statsTableResult(Map<String, Object> params) throws BusinessException {
		// 客开 胡超 会议室使用统计 2020-4-7 start
		JDBCAgent agent = new JDBCAgent();
		try {
			if ("3702223525420024918".equals(params.get("designId"))
					|| "6179881880964910897".equals(params.get("designId"))) {
				StatsTableResultManager.TableResult result = (StatsTableResultManager.TableResult) reportResultApi
						.statsTableResult(params);
				StatsTableResultManager.FieldWrap warp = new StatsTableResultManager.FieldWrap();
				warp.setType("S");
				warp.setDisplay("累计使用人数");
				warp.setKey("meeting_room_app_id");
				warp.setCalcType("count");
				result.getFields().add(warp);
				StatsTableResultManager.DisplayFieldWrap deFieldWrap = new StatsTableResultManager.DisplayFieldWrap();
				deFieldWrap.setAutoWidth(true);
				deFieldWrap.setColMerge(false);
				deFieldWrap.setFixLeft(false);
				deFieldWrap.setKey("6");
				deFieldWrap.setShowOrHide(true);
				deFieldWrap.setPenetratable(true);
				result.getDisplayFields().add(deFieldWrap);
				List<Map<String, CellValue>> data = result.getData();
				for (Map<String, CellValue> map : data) {
					CellValue cellValue = new CellValue();
					cellValue.put("p", true);
					// 这里只能根据名称来进行统计 统计计算数据为状态为审核为审核通过的
					agent.execute("select sum(numbers) from meeting_room_app where meetingroomid = ? and status in ('0','1') ",
							map.get("0").get("sv"));
					Map ret = agent.resultSetToMap();
					cellValue.put("v", ret.get("sum(numbers)"));
					map.put("6", cellValue);
				}
				return result;
			}
		} catch (Exception e) {
			return reportResultApi.statsTableResult(params);
		} finally {
			agent.close();
		}
		// 客开 胡超 会议室使用统计 2020-4-7 end
		return reportResultApi.statsTableResult(params);
	}

	@Override
	public Object getReportBarResult(Map<String, Object> params) throws BusinessException {
		return reportResultApi.getStatsBarResult(params);
	}

	@Override
	public Object getReportLineResult(Map<String, Object> params) throws BusinessException {
		return reportResultApi.getStatsLineResult(params);
	}

	@Override
	public Object getReportPieResult(Map<String, Object> params) throws BusinessException {
		return reportResultApi.getStatsPieResult(params);
	}

	@Override
	public Object getReportRadarResult(Map<String, Object> params) throws BusinessException {
		return reportResultApi.getStatsRadarResult(params);
	}

	@Override
	public FlipInfo findStatsPenetrateDetails(FlipInfo fi, Map<String, Object> params) throws BusinessException {
		return reportResultApi.findStatsPenetrateDetails(fi, params);
	}

	@Override
	public Map<String, Object> screenSlot(Map<String, Object> params) throws BusinessException {
		AppContext.putSessionContext(String.valueOf(AppContext.currentUserId()), params);
		HttpServletRequest request = AppContext.getRawRequest();
		int screenHeight = MapUtils.getIntValue(params, "screenHeight");
		int screenWidth = MapUtils.getIntValue(params, "screenWidth");
		Long designId = MapUtils.getLong(params, "designId");
		AppContext.putSessionContext("conditionSql", params.get("conditionSql"));
		String url = "/report4Result.do?method=showResult&viewModel=screenSlot&designId=" + designId;
		String base64 = phantomjsManager.renderBase64(request, url, screenHeight, screenWidth);

		Map<String, Object> result = Maps.newHashMap();

		String returnType = (String) params.get("returnType");
		if (returnType != null && "base64".equalsIgnoreCase(returnType)) {
//			String fileName = v3XFile.getFilename();
//			File file = fileManager.getFile(v3XFile.getId(), v3XFile.getCreateDate());
//			result.put("url", file);
			result.put("base64", base64);
		} else {
			V3XFile v3XFile = fileManager.saveBase64Img(base64, null, null);// 将base64信息存储到磁盘上
			StringBuilder urlStr = new StringBuilder();// 拼接图片url地址
			urlStr.append(SystemEnvironment.getContextPath());
			urlStr.append("/fileUpload.do?method=showRTE&fileId=");
			urlStr.append(v3XFile.getId());
			urlStr.append("&createDate=");
			urlStr.append(Datetimes.format(v3XFile.getCreateDate(), Datetimes.dateStyle));
			urlStr.append("&type=image");
			result.put("url", urlStr.toString());
		}

		return result;
	}

	/**
	 * <p>
	 * Title: AOP对象
	 * </p>
	 * <p>
	 * Description:
	 * </p>
	 * <p>
	 * Copyright: Copyright (c) 2019
	 * </p>
	 * <p>
	 * Company: seeyon.com
	 * </p>
	 * <p>
	 * Since Seeyon V7.1
	 * </p>
	 */
	public static class ResultAjaxAop {
		/**
		 * <description>截图前置拦截</description>
		 *
		 * @param jp
		 * @author: ouyp
		 * @since: Seeyon V7.1
		 * @date: 2019年1月3日 下午8:57:26
		 */
		@SuppressWarnings("unchecked")
		public void beforeScreenSlot(JoinPoint jp) {
			Object[] args = jp.getArgs();
			Map<String, Object> params = (Map<String, Object>) args[0];
			String viewModel = MapUtils.getString(params, "viewModel");
			if (StringUtils.equals(viewModel, "screenSlot")) {
				String sessionKey = String.valueOf(AppContext.currentUserId());
				Map<String, Object> tmpObj = (Map<String, Object>) AppContext.getSessionContext(sessionKey);
				if (tmpObj != null) {
					params.clear();
					params.putAll(tmpObj);
				}
				AppContext.removeSessionArrribute(sessionKey);
			}
		}
	}

	@Override
	public FlipInfo getStatsPenetrateList(FlipInfo fi, Map<String, Object> params) throws BusinessException {
		return resultManager.getStatsPenetrateData(fi, params);
	}

	@Override
	public Object getReportFunnelResult(Map<String, Object> params) throws BusinessException {
		return reportResultApi.getStatsFunnelResult(params);
	}
}
