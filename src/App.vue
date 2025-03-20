<template>
  <div id="app">
    <TechBackground/> 
    <template v-if="isAuthenticated">
      <Header />
      <div id="main">
        <transition name="scale" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
    </template>
    <template v-else>
      <router-view></router-view>
    </template>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import TechBackground from './components/TechBackground.vue'

export default {
  name: 'App',
  components: {
    Header,
    TechBackground
  },
  computed: {
    isAuthenticated() {
      return localStorage.getItem('username') !== null
    }
  }
}
</script>

<style>
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: auto;
}

#app {
  position: relative;
  min-height: 100vh;
  width: 100%;
}

#main {
  position: relative;
  z-index: 10;
  padding-top: 60px; /* 为顶部导航栏留出空间 */
  padding-bottom: 20px; /* 底部留出空间 */
  min-height: calc(100vh - 80px); /* 确保内容区域高度合适 */
  overflow-y: auto; /* 允许内容区域滚动 */
}

.login-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  position: relative;
  z-index: 10;
}

.scale-enter-active, .scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter, .scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>