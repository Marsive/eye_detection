import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isAuthenticated: false,
    username: ''
  },
  mutations: {
    login(state, username) {
      state.isAuthenticated = true
      state.username = username
    },
    logout(state) {
      state.isAuthenticated = false
      state.username = ''
    }
  },
  actions: {
    async login({ commit }, { username, password }) {
      // 这里调用真实登录接口
      commit('login', username)
      localStorage.setItem('username', username)
    },
    logout({ commit }) {
      commit('logout')
      localStorage.removeItem('username')
    }
  }
})