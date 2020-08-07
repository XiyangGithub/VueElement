<template>
    <div>
        <!--面包屑导航区域-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图区域-->
        <el-card>
            <!--搜索与添加区域-->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容"
                    v-model="queryInfo.query" clearable
                    @clear="getUserList"> <!--clear清空文本框事件 -->
                        <el-button @click="getUserList" slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="5">
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>
            <!--用户列表区域-->
            <el-table :data="userList" border stripe>
                <!--索引列 type="index"-->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <!--作用域插槽 状态栏操作 {{scope.row}}-->
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <!--作用域插槽 操作栏操作 -->
                    <template slot-scope="scope">
                        <!--修改按钮-->
                        <el-button type="primary" icon="el-icon-edit"
                                   size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        <!--删除按钮-->
                        <el-button type="danger" icon="el-icon-delete"
                                   size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        <!--分配角色按钮-->
                        <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
                            <el-button @click="setRole(scope.row)" type="warning" icon="el-icon-setting" size="mini"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!--分页区域-->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[1, 2, 5, 10]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <!--添加用户的对话框-->
            <!--用于对话框的显示与隐藏 :visible.sync="addDialogVisible"-->
        <el-dialog
                title="添加用户"
                :visible.sync="addDialogVisible"
                @close="addDialogClosed"
                width="50%">
            <!--内容主体区域-->
                <!--
                prop="username":对应表单验证规则
                :model="addForm" ：数据绑定对象
                :rules="addFormRules"：表单验证规则对象
                label-width="70px" ：指定文本所占宽度
                ref="addFormRef" ：表单的引用（清空输入历史使用了）
                 -->
            <el-form :model="addForm" :rules="addFormRules"
                     ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!--对话框底部按钮区域-->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!--修改用户的对话框-->
        <el-dialog
                title="修改用户"
                :visible.sync="editDialogVisible"
                @close="editDialogClosed"
                width="30%">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef"  label-width="80px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" ></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile" ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!--分配角色的对话框-->
        <el-dialog
                title="分配角色"
                :visible.sync="setRoleDialogVisible"
                @close="setRoleDialogClosed"
                width="30%">
            <div>
                <p>当前的用户：{{userInfo.username}}</p>
                <p>当前的角色：{{userInfo.role_name}}</p>
                <p>分配角色：
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option
                                v-for="item in rolesList"
                                :key="item.id"
                                :label="item.roleName"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Users",
        data() {
            // 自定义验证邮箱的规则
            var checkEmail = (rule, value, cb) => {
                // 验证邮箱的正则表达式
                const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
                if (regEmail.test(value)) {
                    // 合法的邮箱
                    return cb()
                }
                // 不合法的邮箱
                cb(new Error('请输入合法的邮箱'))
            }
            // 自定义验证手机号的规则
            var checkMobile = (rule, value, cb) => {
                // 验证手机号的正则表达式
                const regMobile = /^1[3-56789]\d{9}$/;
                if (regMobile.test(value)) {
                    // 合法的手机号
                    return cb()
                }
                // 不合法的手机号
                cb(new Error('请输入合法的手机号'))
            }
            return {
                // 获取用户列表的参数对象
                queryInfo:{
                    query: '',
                    // 当前的页数
                    pagenum: 1,
                    // 当前每页显示多少条数据
                    pagesize: 5
                },
                // 所有用户列表
                userList:[],
                // 总数据条数
                total:0,
                // 控制添加用户对话框的显示与隐藏
                addDialogVisible: false,
                // 添加用户的表单数据对象
                addForm:{
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                },
                // 添加表单的验证规则对象
                addFormRules:{
                    username:[
                        { required: true, message: '请输入用户名称', trigger: 'blur' },
                        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                    ],
                    password:[
                        { required: true, message: '请输入用户名密码', trigger: 'blur' },
                        { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
                    ],
                    email:[
                        { required: true, message: '请输入用户名邮箱', trigger: 'blur' },
                        { validator: checkEmail, trigger: 'blur'}
                    ],
                    mobile:[
                        { required: true, message: '请输入用户名手机', trigger: 'blur' },
                        { validator: checkMobile, trigger: 'blur'}
                    ]
                },
                // 控制修改用户对话框的显示与隐藏
                editDialogVisible: false,
                // 查询到的用户信息对象
                editForm:{},
                // 修改表单的验证规则对象
                editFormRules: {
                    email:[
                        { required: true, message: '请输入用户邮箱', trigger: 'blur' },
                        { validator: checkEmail, trigger: 'blur'}
                    ],
                    mobile:[
                        { required: true, message: '请输入用户手机', trigger: 'blur' },
                        { validator: checkMobile, trigger: 'blur'}
                    ]
                },
                // 控制分配角色对话框的显示与隐藏
                setRoleDialogVisible: false,
                // 需要被分配角色的用户信息
                userInfo: {},
                // 所有角色的数据列表
                rolesList: [],
                // 分配角色已选中的角色id值
                selectedRoleId: ''
            }
        },
        created() {
            this.getUserList();
        },
        methods:{
            // 获取用户列表
            async getUserList() {
                const {data: res} = await this.$http.get('users',
                    {params:this.queryInfo
                    })
                if (res.meta.status !==200){
                    return this.$message.error('获取用户列表失败！')
                }
                this.userList = res.data.users
                this.total = res.data.total
                // console.log(res)
            },
            // 监听 pagesize 改变的事件
            handleSizeChange(newSize) {
                // console.log(newSize)
                this.queryInfo.pagesize = newSize
                this.getUserList()
            },
            // 监听页码值改变的事件
            handleCurrentChange(newPage) {
                // console.log(newPage)
                this.queryInfo.pagenum = newPage
                this.getUserList()
            },
            // 监听 switch开关状态的改变
            async userStateChanged(userInfo) {
                // console.log(userInfo)
                const {data: res} = await this.$http.put
                (`users/${userInfo.id}/state/${userInfo.mg_state}`)
                if (res.meta.status !==200) {
                    userInfo.mg_state = !userInfo.mg_state
                    return this.$message.error('更新用户状态失败！')
                }
                this.$message.success('更新用户状态成功！')
            },
            // 监听添加用户对话框的关闭事件
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            // 点击按钮，添加新用户
            addUser() {
                this.$refs.addFormRef.validate(async valid => {
                    // console.log(valid)
                    if (!valid) return
                    // valid 未true 可以发起添加用户的网络请求
                    const {data: res} = await this.$http.post
                    ('users',this.addForm)
                    if (res.meta.status !== 201) {
                        return this.$message.error('添加用户失败！')
                    }
                    this.$message.success('添加用户成功！')
                    // 同时隐藏添加用户的对话框
                    this.addDialogVisible = false
                    // 从新获取用户的列表数据
                    this.getUserList()
                })
            },
            // 展示修改用户对话框
            async showEditDialog(id) {
                // console.log(id)
                const {data: res} = await this.$http.get('users/' + id)
                console.log(res)
                if (res.meta.status !== 200) {
                    return this.$message.error('查询用户信息失败！')
                }
                this.editForm = res.data
                this.editDialogVisible = true;
            },
            // 监听修改用户对话框的关闭事件
            editDialogClosed() {
                // 这里只做了表单验证重置
                this.$refs.editFormRef.resetFields()
            },
            // 修改用户信息并提交
            editUserInfo() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return
                    // 发起修改 用户信息的数据请求
                    const {data: res} = await this.$http.put('users/' + this.editForm.id,{
                        email: this.editForm.email,
                        mobile: this.editForm.mobile
                    })
                    if (res.meta.status !== 200) {
                        return this.$message.error('更新用户失败！')
                    }
                    // 更新用户成功
                    // 1.关闭对话框
                    this.editDialogVisible = false
                    // 2.刷新数据列表
                    this.getUserList()
                    // 3.提示修改成功
                    this.$message.success('更新用户信息成功！')
                })
            },
            // 根据id删除用户信息
            async removeUserById(id) {
                // console.log(id)
                // 弹框提示是否真正删除此用户
                const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).catch(err => err)
                // 如果用户确认删除，则返回值为字符串 confirm
                // 如果用户取消删除，则返回值为字符串 cancel
                // console.log(confirmResult)
                if (confirmResult !== 'confirm') {
                    return this.$message.info('已取消删除！')
                }
                const {data: res} = await this.$http.delete('users/' + id)
                if (res.meta.status !== 200) {
                    return this.$message.error('删除用户失败！')
                }
                this.$message.success('删除用户成功！')
                this.getUserList()
            },
            // 展示分配角色的对话框
            async setRole(userInfo) {
                this.userInfo = userInfo
                // 在展示对话框之前，获取所有角色的列表
                const {data: res} = await this.$http.get('roles')
                if (res.meta.status !== 200) {
                    return this.$message.error('获取角色列表失败！')
                }
                this.rolesList = res.data
                // console.log(this.rolesList)
                this.setRoleDialogVisible = true;
            },
            // 分配角色对话框 点击确定按钮分配角色
            async saveRoleInfo() {
                if (!this.selectedRoleId) {
                    return this.$message.error('请选择要分配的角色！')
                }
                const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,{
                    rid:this.selectedRoleId
                })
                console.log(res)
                if (res.meta.status !== 200) {
                    return this.$message.error('更新角色失败！')
                }
                this.$message.success('更新角色成功！')
                this.getUserList()
                this.setRoleDialogVisible = false
            },
            // 分配角色对话框的关闭事件
            setRoleDialogClosed() {
                this.selectedRoleId = ''
                this.userInfo = {}
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-table{
        margin-top: 15px;
        font-size: 12px;
    }
    .el-pagination{
        margin-top: 15px;
    }
</style>
