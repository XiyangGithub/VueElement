<template>
    <div>
        <!--面包屑导航区域-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--面包屑导航区域-->
        <el-card>
            <el-row>
                <el-col :span="8">

                </el-col>
                <el-col :span="4"></el-col>
            </el-row>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "List",
        data() {
            return {

            }
        },
        created() {

        },
        methods: {

        }
    }
</script>

<style scoped>

</style>