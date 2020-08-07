import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../components/Login"
import Home from "../components/Home"
import Welcome from "../components/Welcome"
import Users from "../view/user/Users"
import Rights from "../view/power/Rights"
import Roles from "../view/power/Roles"
import Cate from "../view/goods/Cate"
import Params from "../view/goods/Params"
import GoodsList from "../view/goods/List"

Vue.use(VueRouter)

const routes = [
  //  重定向到登录页面
  {path: '/', redirect: '/login'},
  {path: '/login', component: Login},
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children:[
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: GoodsList
      }
    ]
  }
];

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to,from,next) => {
  // to 将要访问的路径
  // from 代表从那个路径跳转而来
  // next 是一个函数 表示放行
  // next() 放行 next('/login') 强制跳转
  if (to.path === '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
