<template>
  <div id="header" >
      <div id="header-left">
          <h1>数据分析可视化系统</h1>
      </div>
      <div id="header-nav">
            <div  :class="['header-nav-item',activePath == item.path ? 'active' : '','cool-border']" @click="routerChange(item.path)" v-for="item in routerLink">
                    <router-link class="nav content" :to="item.path">
                        {{item.meta.name}}
                    </router-link>
                    <div :class="[activePath == item.path ? 'top-left' : '','corner']" ></div>
                    <div :class="[activePath == item.path ? 'top-right' : '','corner']"></div>
                    <div :class="[activePath == item.path ? 'bottom-left' : '','corner']"></div>
                    <div :class="[activePath == item.path ? 'bottom-right' : '','corner']"></div>
            </div>
            
      </div>
      <div id="header-time">
          {{ currentDateTime }}
      </div>
  </div>
</template>

<script>
export default {
    data(){
        return {
            activePath:"/",
            routerLink:[],
            currentDateTime: this.getCurrentDateTime()
        }
    },
    created(){
        this.routerLink = this.$router.options.routes;
        this.activePath = this.$route.path
        this.interval = setInterval(() => {
            this.currentDateTime = this.getCurrentDateTime();
        }, 1000);
    },
    methods:{
        getCurrentDateTime() {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },
        routerChange(path){
            this.activePath = path
        }
    }
}
</script>

<style lang="less" scoped>
        #header-time{
            color:#52a2e4;
            font-size: 17px;
        }
        .cool-border {
            position: relative;
        }
        
        .corner {
            position: absolute;
            width: 0;
            height: 0;
            border: 5px solid transparent;
        }
        
        .top-left {
            top: 0;
            left: 0;
            border-top-color: #fff;
            border-left-color: #fff;
        }
        .top-right {
            top: 0;
            right: 0;
            border-top-color: #fff;
            border-right-color: #fff;
        }
        .bottom-left {
            bottom: 0;
            left: 0;
            border-bottom-color: #fff;
            border-left-color: #fff;
        }
        .bottom-right {
            bottom: 0;
            right: 0;
            border-bottom-color: #fff;
            border-right-color: #fff;
        }
        
        .content {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    #header{
        display: flex;
        padding: 10px 150px 0 150px;
        align-items: center;
        justify-content: space-between;
        #header-left{
            h1{
                color:#fff;
                font-size: 23px;
            }
        }
        #header-nav{
            display: flex;
            .header-nav-item{
                margin-right: 15px;
                padding:10px 40px;
                border: 1px solid transparent;
                border-radius: 80px;
            }
            .header-nav-item.active{
                background: #1b2d4a;
            }
            .nav{
                text-decoration: none;
                color:#52a2e4;
                font-size: 15px;
            }
        }
        // #header-time{
        //     font-size: 17px;
        // }
    }
</style>