<template>
  <div class="tableData-container">
      <transition name="fade" mode="out-in">
        
        <div  class="content">
        
        </div>
      </transition>
  </div>
</template>

<script>
export default {
    data(){
        return {
            config:{
                header: [],
                data: [],
                index: true,
                align: [],
                headerBGC:"#3077b1",
            },
            tableList:[]
        }
    },
    async created(){
        await this.delay(1500)
        this.getTableList()
    },
    methods:{
        delay(ms){
            return new Promise(resolve => setTimeout(resolve, ms));
        },
      
    }
}
</script>

<style scoped>
.content{
    display: flex;
    justify-content: center;
}
    .fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>