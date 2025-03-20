<template>
  <div class="login-container">
    <div class="welcome-text">欢迎使用智能眼疾识别平台</div>
    <div class="login-form">
      <div class="login-title">用户登录</div>
      <el-form
        ref="authForm"
        :model="authForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="authForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="authForm.password"
            type="password"
            placeholder="请输入密码"
            @keyup.enter.native="handleLogin"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-button"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      authForm: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "长度在 6 到 20 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    handleLogin() {
      this.$refs.authForm.validate((valid) => {
        if (valid) {
          this.$message.success("登录成功！");
          localStorage.setItem("username", this.authForm.username);
          this.$router.push("/dashboard");
        }
      });
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
}

.welcome-text {
  font-size: 28px;
  color: #39affd;
  text-shadow: 0 0 15px rgba(57, 175, 253, 0.7);
  text-align: center;
  margin-bottom: 30px;
  font-weight: bold;
  letter-spacing: 2px;
}

.login-form {
  width: 400px;
  position: relative;
  z-index: 100;
  background: rgba(13, 28, 64, 0.7);
  border-radius: 12px;
  box-shadow: 0 0 25px rgba(57, 175, 253, 0.2);
  border: 1px solid rgba(57, 175, 253, 0.3);
  backdrop-filter: blur(10px);
  padding: 30px;
}

.login-title {
  font-size: 22px;
  font-weight: bold;
  color: #39affd;
  text-shadow: 0 0 10px rgba(57, 175, 253, 0.5);
  text-align: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
  background: linear-gradient(to right, #3077b1, #39affd);
  border: none;
  height: 40px;
  font-size: 16px;
}

.login-button:hover {
  background: linear-gradient(to right, #39affd, #3077b1);
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.5);
}

/* 修改表单标签颜色 */
::v-deep .el-form-item__label {
  color: #8DD1FE;
}

/* 修改输入框样式 */
::v-deep .el-input__inner {
  background-color: rgba(16, 32, 67, 0.6);
  border: 1px solid rgba(57, 175, 253, 0.3);
  color: #fff;
}

::v-deep .el-input__inner:focus {
  border-color: #39AFFD;
  box-shadow: 0 0 8px rgba(57, 175, 253, 0.5);
}

::v-deep .el-input__inner::placeholder {
  color: rgba(141, 209, 254, 0.5);
}

/* 错误提示文字颜色 */
::v-deep .el-form-item__error {
  color: #ff6b6b;
}
</style> 