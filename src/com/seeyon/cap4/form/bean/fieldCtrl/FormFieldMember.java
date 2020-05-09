package com.seeyon.cap4.form.bean.fieldCtrl;

import com.seeyon.cap4.form.bean.FormAuthViewFieldBean;
import com.seeyon.cap4.form.bean.FormDataMasterBean;
import com.seeyon.cap4.form.bean.FormFieldBean;
import com.seeyon.cap4.form.bean.FormFieldComEnum;
import com.seeyon.cap4.form.modules.engin.formula.CustomSelectEnums;
import com.seeyon.cap4.form.modules.engin.formula.FormulaEnums;
import com.seeyon.cap4.form.util.Enums;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.exceptions.BusinessException;
import com.seeyon.ctp.common.log.CtpLogFactory;
import com.seeyon.ctp.organization.OrgConstants;
import com.seeyon.ctp.organization.bo.V3xOrgAccount;
import com.seeyon.ctp.organization.bo.V3xOrgEntity;
import com.seeyon.ctp.organization.bo.V3xOrgMember;
import com.seeyon.ctp.organization.manager.OrgManager;
import com.seeyon.ctp.util.StringUtil;
import com.seeyon.ctp.util.Strings;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.logging.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by chenxb on 2017-8-14.
 * 人员控件
 */
public class FormFieldMember extends FormFieldOrgCtrl {
    private static final Log LOGGER = CtpLogFactory.getLog(FormFieldMember.class);

    @Override
    public String getKey() {
        return FormFieldComEnum.EXTEND_MEMBER.getKey();
    }

    @Override
    public boolean authNotNullAndValIsNull(FormDataMasterBean formDataMasterBean, FormFieldBean field, FormAuthViewFieldBean authViewFieldBean, Object val) {
        return super.authNotNullAndValIsNull(formDataMasterBean, field, authViewFieldBean, val);
    }

    public void init(){
        this.setIcon("xuanren");
    }
    @Override
    public String getText() {
        return FormFieldComEnum.EXTEND_MEMBER.getText();
    }

    @Override
    public Integer getSort() {
        return FormFieldComEnum.EXTEND_MEMBER.ordinal();
    }

    @Override
    public Enums.FieldType[] getFieldType() {
        return new Enums.FieldType[]{Enums.FieldType.VARCHAR};
    }

    @Override
    @SuppressWarnings("unchecked")
    List<V3xOrgEntity> getV3xOrgEntityList(List<V3xOrgAccount> accountList, String string, String name, String code, int externalType) throws BusinessException {
        List<V3xOrgEntity> orgEntityList = new ArrayList<V3xOrgEntity>();
        OrgManager orgManager = (OrgManager) AppContext.getBean("orgManager");
        // OA-153940 名字重复就不返回，前端导入时提示重复或者不存在
        List<V3xOrgMember> v3xOrgMembers = orgManager.getMemberByName(string);
        if(v3xOrgMembers.size() == 0){
            for (V3xOrgAccount v3xOrgAccount : accountList) {
                Map<String, V3xOrgMember> memberMap = orgManager.getMemberNamesMap(v3xOrgAccount.getId(), externalType);
                V3xOrgMember member = memberMap.get(string);
                if (member != null && !orgEntityList.contains(member)) {
                    orgEntityList.add(member);
                }
            }
        }
        if(v3xOrgMembers.size() > 1){// 通过名字查询到大于1了，说明没有加编号
            return orgEntityList;
        }else if(v3xOrgMembers.size() == 1){
            orgEntityList.add(v3xOrgMembers.get(0));
        }
        return orgEntityList;
    }

    @Override
    public void getDisplayValue4Ctrl(FormFieldBean fieldBean, Object[] returnArr, String valueStr, boolean needSub, boolean forExport) throws BusinessException {
        OrgManager extendMemberOrgManager = (OrgManager) AppContext.getBean("orgManager");
        if (extendMemberOrgManager != null && !StringUtil.checkNull(valueStr) && NumberUtils.isNumber(valueStr)) {
            try {
                V3xOrgMember member = extendMemberOrgManager.getMemberById(Long.parseLong(valueStr.trim()));
                if (member != null) {
                    returnArr[2] = "Member|" + valueStr;
                    // 2020.5.9 客开 lee 取消不同登录人查看表单时括弧显示单位
                    /*if (!forExport && !member.getOrgAccountId().equals(AppContext.currentAccountId())) {
                        V3xOrgAccount acc = extendMemberOrgManager.getAccountById(member.getOrgAccountId());
                        returnArr[1] = member.getName() + "(" + acc.getShortName() + ")";
                    } else {
	                    if (forExport && Strings.isNotBlank(member.getCode())) {
	                    	int memberNums = this.getOrgNum(fieldBean, member.getName());
	                    	if (memberNums > 1) {// 有重名,OA-155134
	                    		returnArr[1] = member.getName() + "(" + member.getCode() + ")";
	                    	} else {
	                    		returnArr[1] = member.getName();
	                    	}
	                    } else {
	                    	returnArr[1] = member.getName();
	                    }
                    }*/
                    returnArr[1] = member.getName();
                } else {
                    returnArr[1] = "";
                    returnArr[2] = "";
                }
            } catch (Exception e) {
                LOGGER.warn("获取表单数据失败：人员ID（" + valueStr + "):" + e.getMessage(), e);
                returnArr[1] = valueStr;
            }
        } else {
            if (!StringUtil.checkNull(valueStr) && !NumberUtils.isNumber(valueStr)) {
                returnArr[1] = valueStr;
            } else {
                returnArr[0] = null;
                returnArr[1] = "";
                returnArr[2] = "";
            }
        }
    }

    /**
     * 获取签章保护数据
     */
    public String getProtectedValue(Object value) {
        String valueStr = this.getDbValue(value);
        if(Strings.isNotBlank(valueStr)){
            try{
                OrgManager orgManager = (OrgManager) AppContext.getBean("orgManager");
                V3xOrgMember member = orgManager.getMemberById(Long.parseLong(valueStr));
                return member.getName()+"("+valueStr+")";
            }catch (Exception e){
                LOGGER.warn("获取签章数据失败", e);
            }
        }
        return valueStr;
    }

    @Override
    public List<String[]> getListShowDefaultVal(Integer externalType) {
        List<String[]> result = new ArrayList<String[]>();
        result.add(new String[]{FormulaEnums.FormulaVar.org_currentUserId.getKey(), FormulaEnums.FormulaVar.org_currentUserId.getText()});
        if (externalType == OrgConstants.ExternalType.Inner.ordinal()) {//内部
            result.add(new String[]{CustomSelectEnums.SystemVar4CustomSelect.org_currentUserDeptManagerId.getKey(), CustomSelectEnums.SystemVar4CustomSelect.org_currentUserDeptManagerId.getText()});
            result.add(new String[]{CustomSelectEnums.SystemVar4CustomSelect.org_currentUserSuperiorDeptManagerId.getKey(), CustomSelectEnums.SystemVar4CustomSelect.org_currentUserSuperiorDeptManagerId.getText()});
        }
        return result;
    }

    @Override
    public String[] getDefaultVal(String defaultValue) {
        String[] returnValue = new String[2];
        returnValue[0] = FormulaEnums.FormulaVar.org_currentUserId.getValue();
        returnValue[1] = FormulaEnums.FormulaVar.org_currentUserTrueName.getValue();
        return returnValue;
    }

    /**
     * 字段在初始值设置页面上显示的元素
     *
     * @param fieldBean 当前字段
     * @param formId    当前编辑表单ID
     */
    @Override
    public Map<String, Object> getAuthDefaultValueMap(FormFieldBean fieldBean, Long formId) throws BusinessException {
        Map<String, Object> returnMap = new HashMap<String, Object>(16);
        Map<String, String> disableMap;//确定哪些输入框或选择框能编辑
        List<String[]> data_system = new ArrayList<String[]>();//系统变量选项

        disableMap = FormFieldUtil.getDisableMap2AuthDefaultValue("", "", "");
        data_system.add(new String[]{FormulaEnums.FormulaVar.org_currentUserId.getKey(), FormulaEnums.FormulaVar.org_currentUserId.getText()});

        returnMap.put("disableMap", disableMap);
        returnMap.put("data_handWork", null);
        returnMap.put("data_system", data_system);
        return returnMap;
    }
}
