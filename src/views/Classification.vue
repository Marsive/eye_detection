<template>
  <div class="classification-container">
    <!-- 标题区域 -->
    <div class="tech-header">
      <div class="tech-line left"></div>
      <h1>眼底图像 <span class="highlight">分类识别</span></h1>
      <div class="tech-line right"></div>
    </div>

    <!-- 主体内容区域 -->
    <div class="tech-content">
      <!-- 左侧上传区域 -->
      <div class="upload-card">
        <div class="card-header">
          <i class="el-icon-picture-outline"></i>
          <span>左眼影像</span>
        </div>
        <div class="card-body">
          <div
            class="upload-area"
            @click="triggerUpload('left')"
            @drop.prevent="handleDrop($event, 'left')"
            @dragover.prevent
            v-if="!leftImage"
          >
            <input
              type="file"
              ref="leftFileInput"
              style="display: none"
              accept="image/dicom,image/*"
              @change="handleFileChange($event, 'left')"
            />
            <div class="upload-icon">
              <i class="el-icon-upload"></i>
            </div>
            <div class="upload-text">点击上传DICOM影像</div>
          </div>

          <div class="image-container" v-if="leftImage">
            <img :src="leftImage" alt="左眼影像" />
            <div class="image-actions">
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                size="mini"
                @click="removeImage('left')"
              ></el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧上传区域 -->
      <div class="upload-card">
        <div class="card-header">
          <i class="el-icon-picture-outline"></i>
          <span>右眼影像</span>
        </div>
        <div class="card-body">
          <div
            class="upload-area"
            @click="triggerUpload('right')"
            @drop.prevent="handleDrop($event, 'right')"
            @dragover.prevent
            v-if="!rightImage"
          >
            <input
              type="file"
              ref="rightFileInput"
              style="display: none"
              accept="image/dicom,image/*"
              @change="handleFileChange($event, 'right')"
            />
            <div class="upload-icon">
              <i class="el-icon-upload"></i>
            </div>
            <div class="upload-text">点击上传DICOM影像</div>
          </div>

          <div class="image-container" v-if="rightImage">
            <img :src="rightImage" alt="右眼影像" />
            <div class="image-actions">
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                size="mini"
                @click="removeImage('right')"
              ></el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div class="action-area">
      <el-button
        type="primary"
        class="analyze-button"
        :disabled="!canAnalyze"
        @click="startAnalysis"
      >
        <i class="el-icon-video-play"></i>
        开始智能分析
      </el-button>
    </div>

    <!-- 结果展示区域 -->
    <div class="result-area" v-if="analysisResult">
      <div class="result-header">
        <div class="tech-line left"></div>
        <h2>分析结果</h2>
        <div class="tech-line right"></div>
      </div>

      <div class="result-cards">
        <div
          class="result-card"
          v-for="(result, index) in analysisResult"
          :key="index"
        >
          <div class="result-image">
            <img :src="index === 0 ? leftImage : rightImage" alt="眼底图像" />
          </div>
          <div class="result-info">
            <div class="result-title">
              {{ index === 0 ? "左眼" : "右眼" }}分析结果
            </div>
            <div class="result-item" v-for="(item, i) in result.items" :key="i">
              <div class="item-name">{{ item.name }}:</div>
              <div class="item-value" :class="{ abnormal: item.abnormal }">
                {{ item.value }}
                <i v-if="item.abnormal" class="el-icon-warning-outline"></i>
              </div>
            </div>
            <div
              class="result-conclusion"
              :class="{ abnormal: result.abnormal }"
            >
              <i
                :class="result.abnormal ? 'el-icon-warning' : 'el-icon-success'"
              ></i>
              {{ result.conclusion }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 处理中遮罩 -->
    <div class="processing-overlay" v-if="isProcessing">
      <div class="processing-content">
        <div class="tech-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-core"></div>
        </div>
        <div class="processing-text">正在进行智能分析...</div>
        <div class="processing-progress">
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: processingProgress + '%' }"
            ></div>
          </div>
          <div class="progress-value">{{ processingProgress }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Classification",
  data() {
    return {
      leftImage: null,
      rightImage: null,
      leftProgress: 0,
      rightProgress: 0,
      isProcessing: false,
      processingProgress: 0,
      analysisResult: null,
    };
  },
  computed: {
    canAnalyze() {
      return (this.leftImage || this.rightImage) && !this.isProcessing;
    },
  },
  methods: {
    triggerUpload(side) {
      this.$refs[side + "FileInput"].click();
    },

    handleFileChange(event, side) {
      const file = event.target.files[0];
      if (!file) return;

      this.simulateUpload(file, side);
    },

    handleDrop(event, side) {
      const file = event.dataTransfer.files[0];
      if (!file) return;

      this.simulateUpload(file, side);
    },

    simulateUpload(file, side) {
      // 模拟上传进度
      const reader = new FileReader();

      reader.onload = (e) => {
        this[side + "Image"] = e.target.result;
        this[side + "Progress"] = 100;
      };

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          this[side + "Progress"] = Math.round((e.loaded / e.total) * 100);
        }
      };

      reader.readAsDataURL(file);
    },

    startAnalysis() {
      this.isProcessing = true;
      this.processingProgress = 0;

      // 模拟分析过程
      const interval = setInterval(() => {
        this.processingProgress += 5;

        if (this.processingProgress >= 100) {
          clearInterval(interval);
          this.isProcessing = false;
          this.showResults();
        }
      }, 200);
    },

    showResults() {
      // 模拟分析结果
      this.analysisResult = [
        {
          abnormal: true,
          conclusion: "检测到糖尿病视网膜病变",
          items: [
            { name: "视网膜出血", value: "已检测到", abnormal: true },
            { name: "硬性渗出", value: "已检测到", abnormal: true },
            { name: "棉絮斑", value: "未检测到", abnormal: false },
            { name: "视网膜微血管瘤", value: "已检测到", abnormal: true },
            { name: "新生血管", value: "未检测到", abnormal: false },
          ],
        },
      ];

      if (this.rightImage) {
        this.analysisResult.push({
          abnormal: false,
          conclusion: "未检测到明显异常",
          items: [
            { name: "视网膜出血", value: "未检测到", abnormal: false },
            { name: "硬性渗出", value: "未检测到", abnormal: false },
            { name: "棉絮斑", value: "未检测到", abnormal: false },
            { name: "视网膜微血管瘤", value: "未检测到", abnormal: false },
            { name: "新生血管", value: "未检测到", abnormal: false },
          ],
        });
      }
    },

    removeImage(side) {
      this[side + "Image"] = null;
      this[side + "Progress"] = 0;
      this[side + "File"] = null;
      if (this.$refs[side + "FileInput"]) {
        this.$refs[side + "FileInput"].value = "";
      }
    },
  },
};
</script>

<style scoped>
.classification-container {
  width: 100%;
  height: calc(100vh - 60px);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.tech-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.tech-header h1 {
  color: #8dd1fe;
  font-size: 24px;
  margin: 0 15px;
  text-shadow: 0 0 10px rgba(57, 175, 253, 0.5);
}

.highlight {
  color: #39affd;
  font-weight: bold;
}

.tech-line {
  height: 2px;
  width: 100px;
  background: linear-gradient(to right, rgba(57, 175, 253, 0), #39affd);
  position: relative;
}

.tech-line.left {
  background: linear-gradient(to right, rgba(57, 175, 253, 0), #39affd);
}

.tech-line.right {
  background: linear-gradient(to right, #39affd, rgba(57, 175, 253, 0));
}

.tech-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex: 1;
  min-height: 300px;
}

.upload-card {
  flex: 1;
  background: rgba(13, 28, 64, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(57, 175, 253, 0.3);
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
}

.card-header {
  background: rgba(16, 32, 67, 0.8);
  padding: 10px 15px;
  color: #8dd1fe;
  font-size: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(57, 175, 253, 0.2);
}

.card-header i {
  margin-right: 8px;
  color: #39affd;
}

.card-body {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-area {
  width: 100%;
  height: 100%;
  border: 2px dashed rgba(57, 175, 253, 0.3);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 30px;
  box-sizing: border-box;
}

.upload-area:hover {
  border-color: #39affd;
  background: rgba(57, 175, 253, 0.05);
}

.upload-icon {
  font-size: 40px;
  color: rgba(57, 175, 253, 0.6);
  margin-bottom: 15px;
}

.upload-text {
  color: #8dd1fe;
  text-align: center;
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.image-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-actions button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-actions button:hover {
  background: rgba(255, 255, 255, 0.4);
}

.action-area {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.analyze-button {
  background: linear-gradient(to right, #3077b1, #39affd);
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.2);
  transition: all 0.3s ease;
}

.analyze-button:hover:not(:disabled) {
  background: linear-gradient(to right, #39affd, #3077b1);
  box-shadow: 0 0 20px rgba(57, 175, 253, 0.4);
  transform: translateY(-2px);
}

.analyze-button:disabled {
  background: rgba(57, 175, 253, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.result-area {
  margin-top: 20px;
  padding-bottom: 30px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.result-header h2 {
  color: #8dd1fe;
  font-size: 20px;
  margin: 0 15px;
}

.result-cards {
  display: flex;
  gap: 20px;
}

.result-card {
  flex: 1;
  background: rgba(13, 28, 64, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(57, 175, 253, 0.3);
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.1);
  overflow: hidden;
  display: flex;
}

.result-image {
  width: 40%;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(57, 175, 253, 0.2);
}

.result-image img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
}

.result-info {
  flex: 1;
  padding: 15px;
}

.result-title {
  color: #39affd;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
  border-bottom: 1px solid rgba(57, 175, 253, 0.2);
  padding-bottom: 10px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.item-name {
  color: #8dd1fe;
}

.item-value {
  color: #8dd1fe;
  display: flex;
  align-items: center;
}

.item-value.abnormal {
  color: #ff6b6b;
}

.item-value i {
  margin-left: 5px;
}

.result-conclusion {
  margin-top: 15px;
  padding: 10px;
  background: rgba(16, 32, 67, 0.5);
  border-radius: 4px;
  color: #39affd;
  display: flex;
  align-items: center;
  font-weight: bold;
}

.result-conclusion.abnormal {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.result-conclusion i {
  margin-right: 8px;
  font-size: 18px;
}

.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 18, 49, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.processing-content {
  background: rgba(13, 28, 64, 0.9);
  border-radius: 10px;
  padding: 30px;
  width: 400px;
  text-align: center;
  border: 1px solid rgba(57, 175, 253, 0.4);
  box-shadow: 0 0 30px rgba(57, 175, 253, 0.3);
}

.tech-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top-color: #39affd;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.spinner-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, #39affd 0%, rgba(57, 175, 253, 0) 70%);
  border-radius: 50%;
  opacity: 0.7;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

.processing-text {
  color: #8dd1fe;
  font-size: 18px;
  margin-bottom: 20px;
}

.processing-progress {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.progress-track {
  flex: 1;
  height: 8px;
  background: rgba(16, 32, 67, 0.8);
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #3077b1, #39affd);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-value {
  color: #39affd;
  font-size: 16px;
  font-weight: bold;
  min-width: 50px;
  text-align: right;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .tech-content {
    flex-direction: column;
  }

  .result-cards {
    flex-direction: column;
  }
}
</style>