<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-text">
        <h1>欢迎使用眼疾智能分析平台</h1>
        <p>本平台集成了多种眼底图像处理和分析功能，助力医疗诊断与研究</p>
      </div>
      <div class="user-greeting">
        <span>您好，{{ username }}</span>
        <span class="last-login">上次登录: {{ lastLoginTime }}</span>
      </div>
    </div>

    <!-- 功能卡片区域 -->
    <div class="features-grid">
      <!-- 数据增强功能 -->
      <div class="feature-card">
        <div class="feature-icon">
          <i class="el-icon-picture-outline-round"></i>
        </div>
        <div class="feature-content">
          <h3>数据增强</h3>
          <p>提供多种图像增强算法，优化医疗影像质量</p>
          <div class="feature-tips">
            <ul>
              <li>支持随机旋转、水平翻转等多种增强方式</li>
              <li>可调整亮度、对比度等参数</li>
              <li>批量处理多张图像</li>
            </ul>
          </div>
          <el-button type="primary" @click="$router.push('/DataAEnhancement')" class="feature-button">
            立即使用
          </el-button>
        </div>
      </div>

      <!-- 分类识别功能 -->
      <div class="feature-card">
        <div class="feature-icon">
          <i class="el-icon-view"></i>
        </div>
        <div class="feature-content">
          <h3>分类识别</h3>
          <p>基于深度学习的眼疾智能诊断系统</p>
          <div class="feature-tips">
            <ul>
              <li>支持多种眼底疾病的自动识别</li>
              <li>提供详细的诊断报告和置信度</li>
              <li>基于大规模医学数据集训练</li>
            </ul>
          </div>
          <el-button type="primary" @click="$router.push('/classification')" class="feature-button">
            开始诊断
          </el-button>
        </div>
      </div>

      <!-- 分割推理功能 -->
      <div class="feature-card">
        <div class="feature-icon">
          <i class="el-icon-crop"></i>
        </div>
        <div class="feature-content">
          <h3>分割推理</h3>
          <p>精确的病变区域分割与标注功能</p>
          <div class="feature-tips">
            <ul>
              <li>自动识别并标注病变区域</li>
              <li>支持多种分割算法</li>
              <li>提供分割结果的可视化展示</li>
            </ul>
          </div>
          <el-button type="primary" @click="$router.push('/segmentation')" class="feature-button">
            开始分析
          </el-button>
        </div>
      </div>

      <!-- 智能助手功能 -->
      <div class="feature-card">
        <div class="feature-icon">
          <i class="el-icon-chat-dot-round"></i>
        </div>
        <div class="feature-content">
          <h3>智能助手</h3>
          <p>基于大语言模型的智能诊断助手</p>
          <div class="feature-tips">
            <ul>
              <li>提供专业的医学知识问答</li>
              <li>辅助解读分析结果</li>
              <li>生成诊断报告建议</li>
            </ul>
          </div>
          <el-button type="primary" @click="$router.push('/llms')" class="feature-button">
            咨询助手
          </el-button>
        </div>
      </div>
    </div>

    <!-- 使用指南区域 -->
    <div class="usage-guide">
      <h2>快速上手指南</h2>
      <div class="guide-steps">
        <div class="guide-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>上传图像</h4>
            <p>在各功能模块中上传您需要分析的眼底图像</p>
          </div>
        </div>
        <div class="guide-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>选择功能</h4>
            <p>根据需求选择相应的处理或分析功能</p>
          </div>
        </div>
        <div class="guide-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>获取结果</h4>
            <p>系统将自动处理并展示分析结果</p>
          </div>
        </div>
        <div class="guide-step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>导出报告</h4>
            <p>可将分析结果导出为报告或保存图像</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统状态信息 -->
    <div class="system-status">
      <div class="status-item">
        <i class="el-icon-cpu"></i>
        <span>系统状态: 正常运行中</span>
      </div>
      <div class="status-item">
        <i class="el-icon-refresh"></i>
        <span>最近更新: 2023-03-15</span>
      </div>
      <div class="status-item">
        <i class="el-icon-document"></i>
        <span><a href="#" @click.prevent="showDocumentation">查看完整使用文档</a></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      username: localStorage.getItem('username') || '用户',
      lastLoginTime: this.formatDate(new Date())
    }
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    showDocumentation() {
      this.$message({
        message: '使用文档正在准备中，敬请期待！',
        type: 'info'
      });
    }
  }
}
</script>

<style lang="less" scoped>
.dashboard {
  min-height: 100vh;
  background: #0a1639;
  padding: 30px;
}

.welcome-banner {
  background: linear-gradient(90deg, rgba(13, 28, 64, 0.9) 0%, rgba(26, 54, 121, 0.9) 100%);
  border-radius: 10px;
  padding: 20px 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(57, 175, 253, 0.3);
}

.welcome-text h1 {
  color: #39AFFD;
  margin: 0 0 10px 0;
  font-size: 24px;
  text-shadow: 0 0 10px rgba(57, 175, 253, 0.3);
}

.welcome-text p {
  color: #8DD1FE;
  margin: 0;
  font-size: 16px;
}

.user-greeting {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: #8DD1FE;
}

.last-login {
  font-size: 12px;
  margin-top: 5px;
  opacity: 0.8;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.feature-card {
  background: rgba(13, 28, 64, 0.7);
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(57, 175, 253, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #39AFFD, #6ad4ff);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(57, 175, 253, 0.2);
}

.feature-icon {
  font-size: 40px;
  color: #39AFFD;
  margin-bottom: 15px;
  text-align: center;
}

.feature-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.feature-content h3 {
  color: #39AFFD;
  margin: 0 0 10px 0;
  text-align: center;
  font-size: 20px;
}

.feature-content p {
  color: #8DD1FE;
  margin: 0 0 15px 0;
  text-align: center;
}

.feature-tips {
  background: rgba(57, 175, 253, 0.1);
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 15px;
  flex: 1;
}

.feature-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #8DD1FE;
}

.feature-tips li {
  margin-bottom: 5px;
  font-size: 14px;
}

.feature-button {
  align-self: center;
  width: 100%;
  background: linear-gradient(to right, #3077b1, #39AFFD);
  border: none;
}

.feature-button:hover {
  background: linear-gradient(to right, #39AFFD, #3077b1);
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.5);
}

.usage-guide {
  background: rgba(13, 28, 64, 0.7);
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
  border: 1px solid rgba(57, 175, 253, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.usage-guide h2 {
  color: #39AFFD;
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 22px;
}

.guide-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.guide-step {
  display: flex;
  align-items: flex-start;
}

.step-number {
  background: linear-gradient(135deg, #3077b1, #39AFFD);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
}

.step-content h4 {
  color: #39AFFD;
  margin: 0 0 5px 0;
}

.step-content p {
  color: #8DD1FE;
  margin: 0;
  font-size: 14px;
}

.system-status {
  background: rgba(13, 28, 64, 0.7);
  border-radius: 10px;
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  border: 1px solid rgba(57, 175, 253, 0.3);
}

.status-item {
  color: #8DD1FE;
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.status-item i {
  margin-right: 8px;
}

.status-item a {
  color: #39AFFD;
  text-decoration: none;
}

.status-item a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .welcome-banner {
    flex-direction: column;
    text-align: center;
  }
  
  .user-greeting {
    align-items: center;
    margin-top: 15px;
  }
  
  .system-status {
    flex-direction: column;
    align-items: center;
  }
  
  .status-item {
    margin: 8px 0;
  }
}
</style> 