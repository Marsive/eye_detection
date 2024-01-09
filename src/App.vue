<template>
  <div id="app">
    <StarryBackground/> 
    <Header />
    <div id="main">
      <transition name="scale" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
import StarryBackground from "@/components/StarryBackground.vue";
import Header from "@/components/Header.vue";
export default {
  components:{
    StarryBackground,
    Header
  }
}
</script>

<style lang="less" scoped>
#main{
  padding:15px;
  box-sizing: border-box;
}
.scale-enter-active {
  transition: transform 0.5s ease-in-out;
  transform-origin: center;
  transform: scale(0); /* 初始状态，可以根据需要调整 */
}

.scale-enter-to {
  transform: scale(1); /* 最终状态，可以根据需要调整 */
}

/* 元素离开时的过渡样式 */
.scale-leave-active {
  transition: transform 0.5s ease-in-out;
  transform-origin: center;
  transform: scale(1); /* 初始状态，可以根据需要调整 */
}

.scale-leave-to {
  transform: scale(0); /* 最终状态，可以根据需要调整 */
}
*{
  position: relative;
  padding: 0;
  margin: 0;
}
</style>
