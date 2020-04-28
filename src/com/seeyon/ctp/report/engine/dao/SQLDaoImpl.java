/**
 * Author ouyp 
 * Rev 
 * Date: 2017年09月29日 下午4:10:55
 *
 * Copyright (C) 2017 Seeyon, Inc. All rights reserved.
 *
 * This software is the proprietary information of Seeyon, Inc.
 * Use is subject to license terms.
 */
package com.seeyon.ctp.report.engine.dao;

import java.text.MessageFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.SystemInitializer;
import com.seeyon.ctp.common.log.CtpLogFactory;
import com.seeyon.ctp.datasource.annotation.DataSourceName;
import com.seeyon.ctp.dubbo.RefreshInterfacesAfterUpdate;
import com.seeyon.ctp.report.engine.api.ReportConstants.UnionMode;
import com.seeyon.ctp.report.engine.api.interfaces.SqlDaoInterface;
import com.seeyon.ctp.report.engine.api.interfaces.SqlDaoInterface.AbstractSqlDaoInterface;
import com.seeyon.ctp.report.engine.bean.SimpleField;
import com.seeyon.ctp.report.engine.sql.JoinTable;
import com.seeyon.ctp.report.engine.sql.SQLCriterion;
import com.seeyon.ctp.util.FlipInfo;
import com.seeyon.ctp.util.JDBCAgent;

/**
 * <p>Title: SQL查询</p>
 * <p>Description: </p>
 * <p>Copyright: Copyright (c) 2017</p>
 * <p>Company: seeyon.com</p>
 * <p>Since Seeyon CAP4.0</p>
 */
@SuppressWarnings("unchecked")
public class SQLDaoImpl extends AbstractSqlDaoInterface implements SQLDao,SystemInitializer {
    private static final Log LOG = CtpLogFactory.getLog(SQLDaoImpl.class);
    Map<DataSourceName,SqlDaoInterface> providers = new HashMap<DataSourceName, SqlDaoInterface>();

    @Override
	public void initialize() {
    	
    	updateSqlDao();
    }
	@Override
	public void destroy() {}

	@RefreshInterfacesAfterUpdate(inface=SqlDaoInterface.class)
    public void updateSqlDao(){
		providers.clear();
		Map<String, SqlDaoInterface> interfaces = AppContext.getBeansOfType(SqlDaoInterface.class);
		for(Entry<String, SqlDaoInterface> entry : interfaces.entrySet()){
			DataSourceName name = entry.getValue().name();
			LOG.info("register sqldao : " + name + "(" + entry.getKey() + ")");
			providers.put(name, entry.getValue());
		}
    }
    
	@Override
	public DataSourceName name() {
		return DataSourceName.MAIN;
	}
	
	@Override
    public List<Map<String, Object>> findBy(SQLCriterion sqlCriterion) {
        try {
            SQLEntity sqlEntity = getSQLEntity(sqlCriterion);
            Map<String, Object> params = sqlCriterion.getParams();
            LOG.info("dataSourceName: " + sqlCriterion.getDataSourceName() + "; SQL语句：" + sqlEntity.getSql() + "; 参数：" + params);
            SqlDaoInterface sqlDao = providers.get(sqlCriterion.getDataSourceName());
            if(sqlDao ==null){
            	LOG.warn("dataSource "  + sqlCriterion.getDataSourceName() + " not found, use default datasource");
            	sqlDao = this;//默认使用自己
            }
            List<Map<String, Object>> list = sqlDao.find(sqlEntity.getSql(), params);
            return getResultList(sqlEntity, list);
        } catch (Exception e) {
            LOG.error("SQL执行报错：", e);
          throw new RuntimeException(e);
        }
    }

	@Override
    public FlipInfo findBy(SQLCriterion sqlCriterion,FlipInfo flipInfo) {
        try {
        	//客开 胡超 start 
        	if("4085567871552603725".equals(AppContext.getThreadContext("designId")) ){
        	  	LinkedHashMap<String,String> selects = sqlCriterion.getSelects();
            	selects.put("meeting_0.ID", "meeting_0.ID");
            	sqlCriterion.setSelects(selects);
        	}
        	if("8603796114228461663".equals(AppContext.getThreadContext("designId"))) {
        		LinkedHashMap<String,String> selects = sqlCriterion.getSelects();
            	selects.put("meeting_room_app_0.ID", "meeting_room_app_0.ID");
            	sqlCriterion.setSelects(selects);
        	}
        	if("-1763432283535487673".equals(AppContext.getThreadContext("designId"))) {
        		LinkedHashMap<String,String> selects = sqlCriterion.getSelects();
            	selects.put("meeting_room_app_0.ID", "meeting_room_app_0.ID");
            	sqlCriterion.setSelects(selects);
        	}
        	//客开 胡超 end 
            SQLEntity sqlEntity = getSQLEntity(sqlCriterion);
            Map<String, Object> params = sqlCriterion.getParams();
            LOG.info("dataSourceName: " + sqlCriterion.getDataSourceName() + "; SQL语句：" + sqlEntity.getSql() + "; 参数params：" + params.toString());
            SqlDaoInterface sqlDao = providers.get(sqlCriterion.getDataSourceName());
            if(sqlDao ==null){
            	LOG.warn("dataSource "  + sqlCriterion.getDataSourceName() + " not found, use default datasource");
            	sqlDao = this;//默认使用自己
            }
        	flipInfo = sqlDao.findPaging(sqlEntity.getSql(), params,flipInfo);
        	flipInfo.setData(getResultList(sqlEntity, flipInfo.getData()));
        	flipInfo.setTotal(flipInfo.getTotal());
        	//客开 胡超 start 
        	AppContext.putThreadContext("flipInfo", flipInfo);
        	//客开 胡超 end 
            return flipInfo;
        } catch (Exception e) {
            LOG.error("SQL执行报错：", e);
          throw new RuntimeException(e);
        } 
    }
    
    /** 
     * <description>获取转换后结果集</description>
     *
     * @param sqlEntity
     * @param data
     * @return
     * @author: ouyp
     * @since: Seeyon CAP4.0
     * @date: 2017年11月22日 下午3:25:36 
     */
    private List<Map<String, Object>> getResultList(SQLEntity sqlEntity, List<Map<String, Object>> data) {
        List<Map<String, Object>> result = Lists.newArrayList();
        for (Map<String, Object> map : data) {
            Map<String, Object> m = Maps.newHashMap();
            result.add(m);
            for (Map.Entry<String, String> entry : sqlEntity.getBiMap().entrySet()) {
                m.put(entry.getKey(), map.get(entry.getValue()));
            }
        }
        return result;
    }
    
    /**
     * <description>获取SQL语句及别名键值对</description>
     *
     * @param sqlCriterion
     * @return
     * @author: ouyp
     * @since: Seeyon CAP4.0
     * @date: 2017年11月22日 下午3:11:44
     */
    public SQLEntity getSQLEntity(SQLCriterion sqlCriterion) {
        SQLEntity sqlEntity = new SQLEntity();
        if(UnionMode.union.name().equals(sqlCriterion.getUnionMode()) || UnionMode.unionAll.name().equals(sqlCriterion.getUnionMode()) ){
	        Map<String, String> biMap = getBiMap(sqlCriterion);
        	StringBuilder sql = new StringBuilder();
        	List<SQLCriterion> subSqls = sqlCriterion.getSubSqlCriterions();
        	for (int index = 0; index < subSqls.size(); index++) {
        		SQLCriterion sqlCr = subSqls.get(index);
        		if(index > 0 && UnionMode.unionAll.name().equals(sqlCriterion.getUnionMode())){
        			sql.append(" union all ");
        		}
        		sql.append(getBaseSQLEntity(sqlCr).getSql());
        	}
        	//order by
        	LinkedHashMap<String, String> orders = sqlCriterion.getOrders();
        	if (MapUtils.isNotEmpty(orders)) {
        		sql.append(" order by ");
        		for (Map.Entry<String, String> entry : orders.entrySet()) {
        			String biName = biMap.get(entry.getKey());
        			sql.append(nullsFirstConvert(biName, entry.getValue())).append(",");//别名转换点2
        		}
        		sql.deleteCharAt(sql.length() - 1);
        	}
        	sqlEntity = new SQLEntity(sql.toString(), biMap);
        }else{
        	sqlEntity = getBaseSQLEntity(sqlCriterion);
        }
        return sqlEntity;
    }

    /**
     * <p>Title: 取基础的sql实体</p>
     * <p>Description: </p>
     * <p>Copyright: Copyright (c) 2018</p>
     * <p>Company: seeyon.com</p>
     * <p>author : fucz</p>
     * <p>since V5 7.1 </p>
     */
    private SQLEntity getBaseSQLEntity(SQLCriterion sqlCriterion) {
    	Map<String, String> biMap = getBiMap(sqlCriterion);
        StringBuilder sql = new StringBuilder();
    	//select部分
    	sql.append("SELECT ");
    	if (sqlCriterion.isDistinct()) {
    		sql.append(" distinct ");
    	}
    	for (Map.Entry<String, String> entry : sqlCriterion.getSelects().entrySet()) {
    		sql.append(entry.getValue()).append(" ").append(biMap.get(entry.getKey())).append(","); //别名转换点1
    		
    	}
    	sql.deleteCharAt(sql.length() - 1);
    	
    	//FROM ... JOIN XX ON XX.id = xxx.id
    	List<JoinTable> joinTables = sqlCriterion.getJoinTables();
    	JoinTable first = sqlCriterion.getJoinTables().get(0);
    	sql.append(" FROM ").append(first.getTableName()).append(" ").append(first.getAliasTableName());
    	for (int i = 1, len = joinTables.size(); i < len; i++) {
    		JoinTable joinTable = joinTables.get(i);
    		sql.append(" ").append(joinTable.getJoinType().getValue()).append(" ").append(joinTable.getTableName()).append(" ").append(joinTable.getAliasTableName()).append(" on ");
    		for (int j = 0; j < joinTable.getConnect().size(); j ++) {
    			if (j != 0) {
    				sql.append(" and ");
    			}
    			SimpleField[] pair = joinTable.getConnect().get(j);
    			if(JDBCAgent.isPostgreSQLRuntime()){
    				String pattern = "cast({0} as varchar)";
    				sql.append(" ").append(MessageFormat.format(pattern, pair[0].whereSql())).append(" = ").append(MessageFormat.format(pattern, pair[1].whereSql()));
    			}else{
    				sql.append(" ").append(pair[0].whereSql()).append(" = ").append(pair[1].whereSql());
    			}
    		}
    		if(StringUtils.isNotBlank(joinTable.getExtraSql())) {
    			sql.append(" ").append(joinTable.getExtraSql()).append(" ");
    		}
    	}
    	
    	//where 
    	sql.append(sqlCriterion.getWhereSql().sql());
    	
    	//Group BY
    	LinkedHashMap<String, String> groups = sqlCriterion.getGroups();
    	if (MapUtils.isNotEmpty(groups)) {
    		sql.append(" group by ");
    		for (Map.Entry<String, String> entry : groups.entrySet()) {
    			sql.append(entry.getValue()).append(",");
    		}
    		sql.deleteCharAt(sql.length() - 1);
    	}
    	
    	//ORder by
    	LinkedHashMap<String, String> orders = sqlCriterion.getOrders();
    	if (MapUtils.isNotEmpty(orders)) {
    		sql.append(" order by ");
    		for (Map.Entry<String, String> entry : orders.entrySet()) {
    			String biName = biMap.get(entry.getKey());
    			sql.append(nullsFirstConvert(biName, entry.getValue())).append(",");//别名转换点2
    		}
    		sql.deleteCharAt(sql.length() - 1);
    	}
    	return new SQLEntity(sql.toString(), biMap);
    }
    /**
     * <description>获取别名转换键值对</description>
     *
     * @param sqlCriterion
     * @return
     * @author: ouyp
     * @since: Seeyon CAP4.0
     * @date: 2017年11月22日 下午3:00:37
     */
    private Map<String, String> getBiMap(SQLCriterion sqlCriterion) {
        Map<String, String> biMap = Maps.newHashMap();
        int i = 0;
        for (String key : sqlCriterion.getSelects().keySet()) {
            biMap.put(key, "f" + i++);
        }
        return biMap;
    }
    /**
     * <description>排序字段采用nulls first</description>
     *
     * @param field
     * @param orderBy
     * @return
     * @author: ouyp
     * @since: Seeyon CAP4.0
     * @date: 2017年12月11日 下午12:04:45
     */
    private String nullsFirstConvert(String field, String orderBy) {
        String orderStr = "";
        if (JDBCAgent.isOracleRuntime() || JDBCAgent.isDMRuntime()) {
            if ("asc".equalsIgnoreCase(orderBy)) {
                orderStr = field + " " + orderBy + " nulls first"; 
            } else {
                orderStr = field + " " + orderBy + " nulls last";
            }
        } else {
            orderStr = field + " " + orderBy;
        }
        return orderStr;
    }
}
