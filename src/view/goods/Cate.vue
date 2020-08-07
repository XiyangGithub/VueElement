<template>
    <div>
        <!--面包屑导航区域-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图区域-->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!--表格区域-->
            <tree-table class="treeTable" :data="catelist"
                        :selection-type="false"
                        :expand-type="false"
                        show-index
                        index-text="#"
                        border
                        :columns="columns">
                <!--自定义是否有效-->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success"
                       style="color: lightgreen"
                       v-if="scope.row.cat_deleted===false"></i>
                    <i class="el-icon-error" style="color: red" v-else></i>
                </template>
                <!--排序-->
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level===1" size="mini" type="success">二级</el-tag>
                    <el-tag v-else size="mini" type="warning">三级</el-tag>
                </template>
                <!--操作-->
                <template slot="opt" slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>

            <!--分页区域-->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="querInfo.pagenum"
                    :page-sizes="[3, 5, 10, 15]"
                    :page-size="querInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>

        <!--添加分类的对话框-->
        <el-dialog
                title="添加分类"
                @close="addCateDialogClosed"
                :visible.sync="addCateDialogVisible"
                width="30%">
            <!--添加分类的表单-->
            <el-form :model="addCateForm"
                     :rules="addCateFormRules"
                     ref="addCateFormRef"
                     label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <!--options用来指定数据源 -->
                    <el-cascader
                            clearable
                            v-model="selectedKeys"
                            :options="parentCateList"
                            :props="{ expandTrigger: 'hover',
                                        value: 'cat_id',label: 'cat_name',children: 'children',
                                        checkStrictly:true
                                     }"
                            @change="parentCateChange">
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Cate",
        data() {
            return {
                // 获取商品分类的查询条件
                querInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                // 商品分类的数据列表，默认为空
                catelist: [],
                // 分类总数据数量
                total: 0,
                // 为table指定列的定义
                columns:[
                    {
                        label: '分类名称',
                        prop: 'cat_name'
                    },
                    {
                        label: '是否上架',
                        // 表示，将当前列定义为模板列
                        type: 'template',
                        // 表示当前这一列使用模板名称
                        template: 'isok'
                    },
                    {
                        label: '排序',
                        // 表示，将当前列定义为模板列
                        type: 'template',
                        // 表示当前这一列使用模板名称
                        template: 'order'
                    },
                    {
                        label: '操作',
                        // 表示，将当前列定义为模板列
                        type: 'template',
                        // 表示当前这一列使用模板名称
                        template: 'opt'
                    }
                ],
                // 控制添加分类对话框的显示与隐藏
                addCateDialogVisible: false,
                // 添加分类的表单对象
                addCateForm: {
                    // 将要添加的分类名称
                    cat_name: '',
                    // 父级分类id
                    cat_pid: 0,
                    // 分类的等级 默认是要添加一级分类
                    cat_level: 0
                },
                // 添加分类的表单验证规则对象
                addCateFormRules: {
                    cat_name: [
                        { required: true, message: '请输入分类名称', trigger: 'blur' }
                    ]
                },
                // 父级分类的列表
                parentCateList: [],
                // 指定级联选择器的配置对象
                // cascaderProps:{
                //     value: 'cat_id',
                //     label: 'cat_name',
                //     children: 'children'
                // },
                // 选中的父级分类的id数组
                selectedKeys:[]
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            // 获取商品分类
            async getCateList() {
                const {data: res} = await this.$http.get('categories', {params: this.querInfo})
                console.log(res)
                if (res.meta.status !== 200) {
                    return this.$message.error('获取分类列表失败！')
                }
                // console.log(res.data)
                // 把数据列表赋值给catelist
                this.catelist = res.data.result
                // 为总数据条数赋值
                this.total = res.data.total
            },
            // 监听pagesize改变
            handleSizeChange(newSize) {
                this.querInfo.pagesize = newSize
                this.getCateList()
            },
            // 监听pagenum改变
            handleCurrentChange(newPage) {
                this.querInfo.pagenum = newPage
                this.getCateList()
            },
            // 点击按钮 展示添加分类的对话框
            showAddCateDialog() {
                // 先获取父级分类的数据列表
                this.getParentCateList()
                // 再展示添加分类对话框
                this.addCateDialogVisible = true
            },
            // 获取父级分类的数据列表
            async getParentCateList() {
                const {data: res} = await this.$http.get('categories',{params: {type:2}})
                if (res.meta.status !== 200) {
                    return this.$message.error('获取父级分类数据失败！')
                }
                // console.log(res.data)
                this.parentCateList = res.data
            },
            // 选择项发生变化时触发这个函数
            parentCateChange() {
                console.log(this.selectedKeys)
                // 如果selectedKeys数组中的length大于0 证明选择了父级分类
                // 反之就说明没有选中任何父级分类（就是一级分类）
                if (this.selectedKeys.length > 0) {
                    // 父级分类id
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
                    // 为当前分类的等级赋值
                    this.addCateForm.cat_level = this.selectedKeys.length;
                    return;
                } else {
                    // 父级分类id
                    this.addCateForm.cat_pid = 0
                    // 为当前分类的等级赋值
                    this.addCateForm.cat_level = 0
                }
            },
            // 点击添加分类对话框确认按钮 添加新的分类
             addCate() {
                this.$refs.addCateFormRef.validate(async valid => {
                    if (!valid) return
                    const {data: res} =await this.$http.post('categories',this.addCateForm)
                    // console.log(res)
                    if (res.meta.status !== 201) {
                         this.$message.error(res.meta.msg)
                    }else {
                        this.$message.success(res.meta.msg)
                        this.getCateList()
                        this.addCateDialogVisible = false
                    }
                })
            },
            // 监听对话框的关闭事件，重置表单数据
            addCateDialogClosed() {
                // 首先要拿到表单的引用addCateFormRef
                this.$refs.addCateFormRef.resetFields()
                this.selectedKeys = []
                this.addCateForm.cat_level = 0
                this.addCateForm.cat_pid = 0
            }
        }
    }
</script>

<style lang="less" scoped>
    .treeTable{
        margin-top: 15px;
    }
</style>
