package com.seeyon.cap4.form.bean.fieldCtrl;

import com.seeyon.cap4.form.bean.FormAuthViewFieldBean;
import com.seeyon.cap4.form.bean.FormDataMasterBean;
import com.seeyon.cap4.form.bean.FormFieldBean;
import com.seeyon.cap4.form.bean.FormFieldComEnum;
import com.seeyon.cap4.form.modules.engin.formula.FormulaEnums;
import com.seeyon.cap4.form.util.Enums;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.exceptions.BusinessException;
import com.seeyon.ctp.common.log.CtpLogFactory;
import com.seeyon.ctp.organization.bo.V3xOrgAccount;
import com.seeyon.ctp.organization.bo.V3xOrgEntity;
import com.seeyon.ctp.organization.bo.V3xOrgPost;
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
 * 岗位控件
 */
public class FormFieldPost extends FormFieldOrgCtrl {
    private static final Log LOGGER = CtpLogFactory.getLog(FormFieldPost.class);

    @Override
    public String getKey() {
        return FormFieldComEnum.EXTEND_POST.getKey();
    }

    @Override
    public boolean authNotNullAndValIsNull(FormDataMasterBean formDataMasterBean, FormFieldBean field, FormAuthViewFieldBean authViewFieldBean, Object val) {
        return super.authNotNullAndValIsNull(formDataMasterBean, field, authViewFieldBean, val);
    }

    public void init(){
        this.setIcon("xuangangwei");
    }

    @Override
    public String getText() {
        return FormFieldComEnum.EXTEND_POST.getText();
    }

    @Override
    public Integer getSort() {
        return FormFieldComEnum.EXTEND_POST.ordinal();
    }

    @Override
    public Enums.FieldType[] getFieldType() {
        return new Enums.FieldType[]{Enums.FieldType.VARCHAR};
    }

    @Override
    @SuppressWarnings("unchecked")
    List<V3xOrgEntity> getV3xOrgEntityList(List<V3xOrgAccount> accountList, String string, String name, String code, int externalType) throws BusinessException {
        OrgManager orgManager = (OrgManager) AppContext.getBean("orgManager");
        List<V3xOrgEntity> orgEntityList = orgManager.getEntityNoRelation(V3xOrgPost.class.getSimpleName(), "name", name, null, false ,true, true);
        return orgEntityList;
    }

    @Override
    public void getDisplayValue4Ctrl(FormFieldBean fieldBean, Object[] returnArr, String valueStr, boolean needSub, boolean forExport) throws BusinessException {
        OrgManager extendPostOrgManager = (OrgManager) AppContext.getBean("orgManager");
        if (extendPostOrgManager != null && !StringUtil.checkNull(valueStr) && NumberUtils.isNumber(valueStr)) {
            try {
                V3xOrgPost orgPost = extendPostOrgManager.getPostById(Long.parseLong(valueStr.trim()));
                if (orgPost != null) {
                	// 2020.5.9 客开 lee 取消不同登录人查看表单时括弧显示单位
                    /*if (!forExport && !orgPost.getOrgAccountId().equals(AppContext.currentAccountId())) {
                        V3xOrgAccount acc = extendPostOrgManager.getAccountById(orgPost.getOrgAccountId());
                        returnArr[1] = orgPost.getName() + "(" + acc.getShortName() + ")";
                    } else {
                        if (forExport) {
                            int postNums = this.getOrgNum(fieldBean, orgPost.getName());
                            if (postNums > 1) {
                                V3xOrgAccount acc = extendPostOrgManager.getAccountById(orgPost.getOrgAccountId());
                                returnArr[1] = orgPost.getName() + "(" + acc.getShortName() + ")";
                            } else {
                                returnArr[1] = orgPost.getName();
                            }
                        } else {
                            returnArr[1] = orgPost.getName();
                        }
                    }*/
                	returnArr[1] = orgPost.getName();
                    returnArr[2] = "Post|" + valueStr;
                } else {
                    returnArr[1] = "";
                    returnArr[2] = "";
                }
            } catch (Exception e) {
                LOGGER.warn("获取表单数据失败：岗位ID（" + valueStr + "):" + e.getMessage(), e);
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
                V3xOrgPost orgPost = orgManager.getPostById(Long.parseLong(valueStr));
                return orgPost.getName()+"("+valueStr+")";
            }catch (Exception e){
                LOGGER.warn("获取签章数据失败", e);
            }
        }
        return valueStr;
    }

    @Override
    public List<String[]> getListShowDefaultVal(Integer externalType) {
        return null;
    }

    @Override
    public String[] getDefaultVal(String defaultValue) {
        String[] returnValue = new String[2];
        returnValue[0] = FormulaEnums.FormulaVar.org_currentUserPostId.getValue();
        returnValue[1] = FormulaEnums.FormulaVar.org_currentUserPost.getValue();
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
        //多岗位使用父类的
        if (this instanceof FormFieldMultiPost) {
            return super.getAuthDefaultValueMap(fieldBean, formId);
        }

        Map<String, Object> returnMap = new HashMap<String, Object>(16);
        Map<String, String> disableMap;//确定哪些输入框或选择框能编辑
        List<String[]> data_system = new ArrayList<String[]>();//系统变量选项

        disableMap = FormFieldUtil.getDisableMap2AuthDefaultValue("disabled", "", "");
        data_system.add(new String[]{FormulaEnums.FormulaVar.org_currentUserPostId.getKey(), FormulaEnums.FormulaVar.org_currentUserPostId.getText()});

        returnMap.put("disableMap", disableMap);
        returnMap.put("data_handWork", null);
        returnMap.put("data_system", data_system);
        return returnMap;
    }
}
