<template>
  <div id="header">
    <!-- 左侧标题 -->
    <div id="header-left">
      <h1>眼疾智能分析平台</h1>
    </div>
    <!-- 中间导航栏 -->
    <div id="header-nav">
      <div
        :class="['header-nav-item', $route.path === item.path ? 'active' : '', 'cool-border']"
        @click="routerChange(item.path)"
        v-for="item in filteredRoutes"
        :key="item.path"
      >
        <router-link class="nav content" :to="item.path">
          {{ item.meta.name }}
        </router-link>
        <!-- 四个装饰角 -->
        <div :class="[$route.path === item.path ? 'top-left' : '', 'corner']"></div>
        <div :class="[$route.path === item.path ? 'top-right' : '', 'corner']"></div>
        <div :class="[$route.path === item.path ? 'bottom-left' : '', 'corner']"></div>
        <div :class="[$route.path === item.path ? 'bottom-right' : '', 'corner']"></div>
      </div>
    </div>
    <!-- 右侧时间显示 -->
    <div id="header-time">
      {{ currentDateTime }}
    </div>
    <div class="Login" @click="handleLogout">
      退出
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      routerLink: [], // 动态加载的导航路由
      currentDateTime: this.getCurrentDateTime(), // 当前日期时间
    };
  },
  computed: {
    filteredRoutes() {
      // 只显示有name属性的路由
      return this.routerLink.filter(route => route.meta && route.meta.name);
    }
  },
  created() {
    // 从路由对象中获取所有的路由
    this.routerLink = this.$router.options.routes;
    // 定时器每秒更新时间
    this.interval = setInterval(() => {
      this.currentDateTime = this.getCurrentDateTime();
    }, 1000);
  },
  methods: {
    // 获取当前时间的格式化字符串
    getCurrentDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    routerChange(path) {
      this.$router.push(path);
    },
    handleLogout() {
      localStorage.removeItem('username');
      this.$message.success('已退出登录');
      this.$router.push('/');
    }
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.interval);
  }
};
</script>

<style lang="less" scoped>
#header {
  display: flex;
  padding: 10px 50px;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: rgba(5, 18, 49, 0.8);
  backdrop-filter: blur(5px);
  height: 60px;
  
  #header-left {
    h1 {
      color: #fff;
      font-size: 23px;
      margin: 0;
    }
  }
  
  #header-nav {
    display: flex;
    margin-left: 50px;
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
    
    .header-nav-item {
      margin-right: 18px;
      padding: 8px 20px;
      border: 1px solid transparent;
      border-radius: 80px;
      white-space: nowrap;
    }
    
    .header-nav-item.active {
      background: #1b2d4a;
    }
    
    .nav {
      text-decoration: none;
      color: #52a2e4;
      font-size: 15px;
    }
  }
  
  #header-time {
    color: #52a2e4;
    font-size: 17px;
    margin-left: auto;
    margin-right: 20px;
  }
}

/* 登录注册按钮容器样式 */
.Login {
  text-decoration: none;
  color: #52a2e4;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 5px 15px;
}

/* 鼠标悬停状态 */
.Login:hover {
  color: #6ab7ff;
  transform: translateY(-1px);
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 2px;
    background: linear-gradient(90deg, #6ab7ff 0%, #52a2e4 100%);
    animation: underline 0.3s forwards;
  }
}

/* 点击状态 */
.Login:active {
  transform: translateY(1px);
  color: #3d8bc9;
}

/* 下划线动画 */
@keyframes underline {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* 角落装饰 */
.corner {
  position: absolute;
  width: 0;
  height: 0;
  border: 0px solid transparent;
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
</style>
