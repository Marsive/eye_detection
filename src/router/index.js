import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../views/Index.vue'
import Pred from '../views/Pred.vue'
import TableData from '../views/TableData.vue'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'Index',
    component: Index,
    meta: { name: '首页' }
}, {
    path: '/pred',
    name: 'Pred',
    component: Pred,
    meta: { name: "在线预测" }
}, 
// {
//     path: '/history',
//     name: 'history',
//     component: History,
//     meta: { name: "电网历史" }
// }, 
{
    path: '/tableData',
    name: 'TableData',
    component: TableData,
    meta: { name: "数据表格" }
}]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router