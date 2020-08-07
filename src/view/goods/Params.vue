<template>
    <div>
        <!--面包屑导航区域-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图区域-->
        <el-card>
            <!--头部警告区域-->
            <el-alert
                    title="注意：只允许为第三级分类设置相关参数"
                    :closable="false"
                    show-icon
                    type="warning">
            </el-alert>
            <!--选择商品分类区域-->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!--选择商品分类的级联选择框-->
                    <!--options用来指定数据源 -->
                    <el-cascader
                            clearable
                            v-model="selectedCateKeys"
                            :options="catelist"
                            :props="{ expandTrigger: 'hover',
                                        value: 'cat_id',label: 'cat_name',children: 'children',
                                        checkStrictly:true
                                     }"
                            @change="paramsChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!--tabs页签区域-->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button @click="addDialogVisible=true" type="primary" size="mini" :disabled="isBtnDisabled">添加参数</el-button>
                    <!--动态参数表格-->
                    <el-table :data="manyTableData" border stripe>
                        <!--展开行-->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!--循环渲染Tag标签-->
                                <el-tag v-for="(item,i) in scope.row.attr_vals"
                                        :key="i" @close="handleClose(i,scope.row)" closable>
                                    {{item}}
                                </el-tag>
                                <!--输入文本框-->
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!--添加按钮-->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!--索引列-->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button @click="showEditDialog(scope.row)"
                                           size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                                <el-button @click="removeParams(scope.row)"
                                           size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button @click="addDialogVisible=true" type="primary" size="mini" :disabled="isBtnDisabled">添加属性</el-button>
                    <!--静态属性表格-->
                    <el-table :data="onlyTableData" border stripe>
                        <!--展开行-->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!--循环渲染Tag标签-->
                                <el-tag v-for="(item,i) in scope.row.attr_vals"
                                        :key="i" @close="handleClose(i,scope.row)" closable>
                                    {{item}}
                                </el-tag>
                                <!--输入文本框-->
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!--添加按钮-->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!--索引列-->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button @click="showEditDialog(scope.row)"
                                           size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                                <el-button @click="removeParams(scope.row)"
                                           size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!--添加参数对话框-->
        <el-dialog
                :title="'添加'+titleText"
                :visible.sync="addDialogVisible"
                width="30%"
                @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!--修改参数对话框-->
        <el-dialog
                :title="'修改'+titleText"
                :visible.sync="editDialogVisible"
                width="30%"
                @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    export default {
        name: "Params",
        data(){
            return {
                // 商品分类列表
                catelist: [],
                // 级联选择框双向绑定到的数组
                selectedCateKeys: [],
                // 被激活的tabs页签的名称
                activeName: 'many',
                // 动态参数的数据
                manyTableData: [],
                // 静态参数的数据
                onlyTableData: [],
                // 控制添加属性对话框的显示与隐藏
                addDialogVisible: false,
                // 添加参数的表单数据对象
                addForm: {
                    attr_name: ''
                },
                // 添加表单的验证规则
                addFormRules: {
                    attr_name: [
                        { required: true, message: '请输入参数名称', trigger: 'blur' }
                    ]
                },
                // 控制修改对话框的显示与隐藏
                editDialogVisible: false,
                // 修改的表单数据对象
                editForm: {},
                // 修改表单的验证规则对象
                editFormRules: {
                    attr_name: [
                        { required: true, message: '请输入参数名称', trigger: 'blur' }
                    ]
                }

            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            // 获取所有的商品分类列表
            async getCateList(){
                const {data: res} = await this.$http.get('categories')
                if (res.meta.status !== 200) {
                    this.$message.error('获取商品列表失败！');
                } else {
                    this.catelist = res.data
                    // console.log(this.catelist)
                }
            },
            // 级联选择框选中项变化 会触发这个函数
            paramsChange() {
               this.getParamsData()
            },
            // tab页签点击事件的处理函数
            handleTabClick() {
                // console.log(this.activeName)
                this.getParamsData()
            },
            // 获取参数的数据列表
            async getParamsData() {
                // 证明选中的不是三级分类
                if (this.selectedCateKeys.length !== 3) {
                    this.selectedCateKeys = [];
                    this.manyTableData = [];
                    this.onlyTableData = [];
                } else {
                    // 证明选中的是三级分类
                    // console.log('是三级分类'+this.selectedCateKeys)
                    // 根据所选分类id 和当前所处的面板 获取对应的参数
                    const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
                        {params:{sel:this.activeName}})
                    if (res.meta.status !== 200) {
                        this.$message.error('获取参数列表失败！');
                    } else {
                        // 循环数据 用逗号分隔字符串成数组
                        res.data.forEach(item => {
                            // 三元表达式的判断
                            item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                            // 控制单行文本框显示与隐藏
                            item.inputVisible = false
                            // 单行文本框输入的值
                            item.inputValue = ''
                        })
                        console.log(res.data)
                        if (this.activeName === 'many') {
                            this.manyTableData = res.data;
                        } else {
                            this.onlyTableData = res.data
                        }
                    }
                }
            },
            // 监听添加属性对话框的关闭事件
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            // 点击对话框确定按钮，添加参数
            addParams() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) {
                        return this.$message.error('请输入。。。')
                    } else {
                        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,
                            {
                                attr_name: this.addForm.attr_name,
                                attr_sel: this.activeName
                            })
                        console.log(res)
                        if (res.meta.status !== 201) {
                            return this.$message.error('添加参数失败！');
                        } else {
                            this.$message.success(res.meta.msg)
                            this.addDialogVisible = false
                            this.getParamsData()
                        }
                    }
                })
            },
            // 点击按钮展示修改的对话框
            showEditDialog(row) {
                // console.log(row)
                this.editForm = row
                this.editDialogVisible = true
            },
            // 清空表单预验证
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            // 点击对话框确定按钮 修改参数
            editParams() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) {
                        return;
                    } else {
                        const {data: res} = await this.$http.put
                        (`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                            {
                                attr_name:this.editForm.attr_name,
                                attr_sel:this.activeName
                            })
                        if (res.meta.status !== 200) {
                            return this.$message.error('修改参数失败！');
                        } else {
                            this.$message.success(res.meta.msg)
                            this.getParamsData()
                            this.editDialogVisible = false
                        }
                    }
                })
            },
            // 根据id删除对应的属性
            async removeParams(row) {
                const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err=>err)
                if (confirmResult !== 'confirm') {
                    // 用户取消的删除操作confirmResult==confirm字符串
                    return this.$message.info('已取消删除！');
                } else {
                    // 用户确定要删除
                    const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${row.attr_id}`)
                    if (res.meta.status !== 200) {
                        return this.$message.error('删除参数失败！');
                    } else {
                        this.$message.success(res.meta.msg)
                        this.getParamsData()
                    }
                }
            },
            // 文本框失去焦点 或者摁下enter键都会触发
            async handleInputConfirm(row){
                if (row.inputValue.trim().length === 0) {
                    row.inputValue = '';
                    row.inputVisible = false;
                    return;
                } else {
                    // 如果没有return 则证明用户输入了内容
                    // console.log('要提交请求')
                    row.attr_vals.push(row.inputValue.trim())
                    row.inputValue = ''
                    row.inputVisible = false
                    // 需要发起请求 保存这次操作到数据库中
                    this.saveAttrVals(row)
                }
            },
            // 将对attr_vals的操作保存到数据库
            async saveAttrVals(row) {
                // 需要发起请求 保存这次操作到数据库中
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
                    {
                        attr_name: row.attr_name,
                        attr_sel: row.attr_sel,
                        attr_vals: row.attr_vals.join(',')
                    })
                console.log(res)
                if (res.meta.status !== 200) {
                    return this.$message.error('修改参数项失败！');
                } else {
                    this.$message.success(res.meta.msg)
                }
            },
            // 点击按钮展示文本输入框
            showInput(row) {
                console.log(row)
                row.inputVisible = true
                // 让文本框自动获取焦点
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                })
            },
            // 删除对应的参数可选项
            handleClose(i,row) {
                row.attr_vals.splice(i, 1)
                this.saveAttrVals(row)
            }
        },
        computed: {
            // 如果按钮需要被禁用 则返回true 否者返回false
            isBtnDisabled() {
                if (this.selectedCateKeys.length !== 3) {
                    return true
                } else {
                    return false
                }
            },
            // 当前选中的三级分类的Id
            cateId() {
                if (this.selectedCateKeys.length === 3) {
                    return this.selectedCateKeys[2];
                } else {
                    return null
                }
            },
            // 动态计算标题的文本
            titleText() {
                if (this.activeName === 'many') {
                    return '动态参数';
                } else {
                    return '静态属性'
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .cat_opt{
        margin: 15px 0;
    }
    .el-tag{
        margin: 10px;
    }
    .input-new-tag{
        width: 150px;
    }
</style>
