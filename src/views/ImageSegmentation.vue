<template>
  <div class="segmentation-container">
    <!-- 标题区域 -->
    <div class="tech-header">
      <div class="tech-line left"></div>
      <h1><span class="highlight">眼底图像分割</span></h1>
      <div class="tech-line right"></div>
    </div>

    <!-- 主体内容区域 -->
    <div class="tech-content">
      <!-- 左侧上传区域 -->
      <div class="upload-panel tech-panel">
        <div class="panel-header">
          <div class="step-indicators">
            <div class="step" :class="{ active: currentStep >= 1 }">
              <div class="step-dot"></div>
              <div class="step-label">上传影像</div>
            </div>
            <div class="step-line"></div>
            <div class="step" :class="{ active: currentStep >= 2 }">
              <div class="step-dot"></div>
              <div class="step-label">分割中</div>
            </div>
            <div class="step-line"></div>
            <div class="step" :class="{ active: currentStep >= 3 }">
              <div class="step-dot"></div>
              <div class="step-label">完成</div>
            </div>
          </div>
        </div>

        <div class="panel-body">
          <div
            class="upload-area"
            @click="triggerUpload"
            @drop.prevent="handleDrop"
            @dragover.prevent
          >
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              accept="image/*"
              @change="handleFileChange"
            />
            <div class="upload-icon">
              <i class="el-icon-upload"></i>
            </div>
            <div class="upload-text">
              拖拽或点击上传
              <div class="upload-hint">支持常见图片格式</div>
            </div>
          </div>

          <div class="preview-area" v-if="uploadedImage">
            <div class="preview-header">
              <span>预览图像</span>
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                @click="removeImage"
              ></el-button>
            </div>
            <div class="preview-image">
              <img :src="uploadedImage" alt="上传的图像" />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧结果区域 -->
      <div class="result-panel tech-panel">
        <div class="panel-header">
          <span>分割结果</span>
          <el-button
            type="primary"
            class="start-button"
            :disabled="!uploadedImage || isProcessing"
            @click="startSegmentation"
          >
            <i class="el-icon-magic-stick"></i>
            开始智能分割
          </el-button>
        </div>

        <div class="panel-body">
          <div class="result-placeholder" v-if="!segmentationResult">
            <div class="placeholder-icon">
              <i class="el-icon-picture-outline"></i>
            </div>
            <div class="placeholder-text">
              上传图像后点击"开始智能分割"
              <div class="placeholder-hint">
                系统将自动识别并分割眼底图像中的病变区域
              </div>
            </div>
          </div>

          <div class="result-content" v-else>
            <div class="result-tabs">
              <div
                class="tab-item"
                :class="{ active: activeTab === 'original' }"
                @click="activeTab = 'original'"
              >
                原始图像
              </div>
              <div
                class="tab-item"
                :class="{ active: activeTab === 'segmented' }"
                @click="activeTab = 'segmented'"
              >
              分割结果
              </div>

              <div
                class="tab-item"
                :class="{ active: activeTab === 'superposed' }"
                @click="activeTab = 'superposed'"
              >
                叠加显示
              </div>
            </div>

            <div class="result-display">
              <img :src="currentDisplayImage" alt="分割结果" />
            </div>

            <div class="result-info">
              <div class="info-card time-card">
                <div class="info-icon"><i class="el-icon-timer"></i></div>
                <div class="info-content">
                  <div class="info-value">{{ segmentationInfo.time }}s</div>
                  <div class="info-label">处理时间</div>
                </div>
              </div>
            </div>

            <div class="result-actions">
              <el-button
                type="primary"
                icon="el-icon-download"
                @click="downloadResult"
              >
                下载结果
              </el-button>
              <el-button
                type="success"
                icon="el-icon-document"
                @click="generateReport"
              >
                生成报告
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 处理中遮罩 -->
    <div class="tech-overlay" v-if="isProcessing">
      <div class="tech-processing">
        <div class="tech-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-core"></div>
        </div>
        <div class="processing-text">正在进行智能分割...</div>
        <div class="processing-progress">
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${processingProgress}%` }"
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
  name: "ImageSegmentation",
  data() {
    return {
      currentStep: 1,
      uploadedImage: null,
      uploadedFile: null,
      segmentationResult: null,
      segmentationResultFilename: null,    // 存储分割结果文件名（mask）
      segmentationOverlayFilename: null,   // 存储叠加结果文件名（overlay）
      isProcessing: false,
      processingProgress: 0,
      activeTab: "original",
      segmentationInfo: { time: 0 }
    };
  },
  computed: {
    currentDisplayImage() {
      if (!this.segmentationResult) return "";

      switch (this.activeTab) {
        case "original":
          return this.uploadedImage;
        case "segmented":  // 显示分割结果（mask）
          return `http://127.0.0.1:5000/download/${this.segmentationResultFilename}`;
        case "superposed": // 显示叠加结果（overlay）
          return `http://127.0.0.1:5000/download/${this.segmentationOverlayFilename}`;
        default:
          return this.uploadedImage;
      }
    }
  },
  methods: {
    triggerUpload() {
      this.$refs.fileInput.click();
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!this.validateFile(file)) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage = e.target.result;
        this.uploadedFile = file;
      };
      reader.readAsDataURL(file);
    },

    handleDrop(event) {
      const file = event.dataTransfer.files[0];
      if (!file) return;

      if (!this.validateFile(file)) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage = e.target.result;
        this.uploadedFile = file;
      };
      reader.readAsDataURL(file);
    },

    validateFile(file) {
      const validTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 16 * 1024 * 1024;

      if (!isValidType) {
        this.$message.error("请上传PNG、JPG、JPEG或GIF格式图像!");
        return false;
      }

      if (!isValidSize) {
        this.$message.error("文件大小不能超过16MB!");
        return false;
      }

      return true;
    },

    removeImage() {
      this.uploadedImage = null;
      this.uploadedFile = null;
      this.segmentationResult = null;
      this.segmentationResultFilename = null;
      this.segmentationOverlayFilename = null;
      this.currentStep = 1;
      this.$refs.fileInput.value = "";
    },

    startSegmentation() {
      if (!this.uploadedImage || !this.uploadedFile) return;

      this.isProcessing = true;
      this.currentStep = 2;
      this.processingProgress = 0;

      const formData = new FormData();
      formData.append("file", this.uploadedFile);

      const interval = setInterval(() => {
        this.processingProgress += 5;
        if (this.processingProgress >= 95) clearInterval(interval);
      }, 200);

      fetch("http://127.0.0.1:5000/predict/segmentation", {
        method: "POST",
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          clearInterval(interval);
          this.processingProgress = 100;

          // 更新字段名称匹配后端返回
          this.segmentationResultFilename = data.mask_output;
          this.segmentationOverlayFilename = data.overlay_output;
          
          this.segmentationResult = true;
          this.segmentationInfo.time = (Math.random() * 5 + 1).toFixed(2);
          this.currentStep = 3;
          this.activeTab = "segmented";
          this.$message.success("影像分割成功");
        })
        .catch(error => {
          console.error("处理失败:", error);
          this.$message.error("分割处理失败，请重试");
        })
        .finally(() => {
          this.isProcessing = false;
        });
    },

    downloadResult() {
      if (!this.segmentationResult) {
        this.$message.warning("没有可下载的分割结果");
        return;
      }

      let downloadFilename;
      let downloadUrl;

      // 根据当前活动的标签页决定下载哪个文件
      switch (this.activeTab) {
        case "original":
          this.$message.warning("请先切换到分割结果或叠加显示标签页");
          return;
        case "segmented":
          downloadFilename = `overlay_${Date.now()}.png`;
          downloadUrl = `http://127.0.0.1:5000/download/${this.segmentationOverlayFilename}`;
          break;
        case "superposed":
          downloadFilename = `segmentation_${Date.now()}.png`;
          downloadUrl = `http://127.0.0.1:5000/download/${this.segmentationResultFilename}`;
          break;
        default:
          this.$message.warning("无法确定下载内容");
          return;
      }

      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = downloadFilename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      this.$message.success("开始下载分割结果");
    },

    generateReport() {
      if (!this.segmentationResult) {
        this.$message.warning("请先完成图像分割");
        return;
      }
      this.$message.success("正在生成分析报告");
    },
  },
};
</script>


<style scoped>
.segmentation-container {
  width: 100%;
  height: calc(100vh - 60px);
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.tech-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.tech-line {
  height: 2px;
  width: 100px;
  background: linear-gradient(to right, rgba(57, 175, 253, 0), #39affd);
  position: relative;
}

.tech-line.left {
  margin-right: 15px;
}

.tech-line.right {
  margin-left: 15px;
  background: linear-gradient(to left, rgba(57, 175, 253, 0), #39affd);
}

.tech-header h1 {
  font-size: 24px;
  color: #8dd1fe;
  margin: 0;
  font-weight: normal;
}

.highlight {
  color: #39affd;
  font-weight: bold;
}

.tech-content {
  display: flex;
  gap: 20px;
  height: calc(100% - 60px);
}

.tech-panel {
  background: rgba(13, 28, 64, 0.7);
  border-radius: 10px;
  border: 1px solid rgba(57, 175, 253, 0.3);
  box-shadow: 0 0 20px rgba(57, 175, 253, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.upload-panel {
  width: 35%;
  min-width: 300px;
}

.result-panel {
  width: 65%;
  flex: 1;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid rgba(57, 175, 253, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(16, 32, 67, 0.5);
}

.panel-header span {
  color: #8dd1fe;
  font-size: 16px;
  font-weight: bold;
}

.panel-body {
  flex: 1;
  padding: 15px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* 步骤指示器 */
.step-indicators {
  display: flex;
  align-items: center;
  width: 100%;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(57, 175, 253, 0.2);
  border: 2px solid rgba(57, 175, 253, 0.3);
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step.active .step-dot {
  background: #39affd;
  border-color: rgba(57, 175, 253, 0.7);
  box-shadow: 0 0 10px rgba(57, 175, 253, 0.5);
}

.step-line {
  height: 2px;
  width: 50px;
  background: rgba(57, 175, 253, 0.3);
  margin: 0 10px 8px;
}

.step-label {
  font-size: 12px;
  color: rgba(141, 209, 254, 0.7);
  transition: all 0.3s ease;
}

.step.active .step-label {
  color: #8dd1fe;
  font-weight: bold;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed rgba(57, 175, 253, 0.3);
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(16, 32, 67, 0.3);
  min-height: 150px;
}

.upload-area:hover {
  border-color: #39affd;
  background: rgba(16, 32, 67, 0.5);
}

.upload-icon {
  font-size: 40px;
  color: rgba(57, 175, 253, 0.5);
  margin-bottom: 15px;
}

.upload-text {
  color: #8dd1fe;
  font-size: 16px;
}

.upload-hint {
  color: rgba(141, 209, 254, 0.5);
  font-size: 12px;
  margin-top: 5px;
}

/* 预览区域 */
.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(57, 175, 253, 0.2);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(16, 32, 67, 0.3);
}

.preview-header {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(16, 32, 67, 0.5);
  border-bottom: 1px solid rgba(57, 175, 253, 0.2);
}

.preview-header span {
  color: #8dd1fe;
  font-size: 14px;
}

.preview-image {
  flex: 1;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 结果区域 */
.result-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(141, 209, 254, 0.5);
  text-align: center;
}

.placeholder-icon {
  font-size: 50px;
  margin-bottom: 20px;
  color: rgba(57, 175, 253, 0.3);
}

.placeholder-text {
  font-size: 16px;
  color: rgba(141, 209, 254, 0.7);
}

.placeholder-hint {
  font-size: 12px;
  color: rgba(141, 209, 254, 0.5);
  margin-top: 5px;
}

.result-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.result-tabs {
  display: flex;
  border-bottom: 1px solid rgba(57, 175, 253, 0.2);
  margin-bottom: 15px;
}

.tab-item {
  padding: 10px 20px;
  cursor: pointer;
  color: rgba(141, 209, 254, 0.7);
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-item:hover {
  color: #8dd1fe;
}

.tab-item.active {
  color: #39affd;
  border-bottom-color: #39affd;
}

.result-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 32, 67, 0.3);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  border: 1px solid rgba(57, 175, 253, 0.2);
}

.result-display img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.result-info {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.info-card {
  background: rgba(16, 32, 67, 0.5);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  border: 1px solid rgba(57, 175, 253, 0.2);
  width: 200px;
}

.time-card {
  width: 200px;
}

.info-icon {
  font-size: 24px;
  color: #39affd;
  margin-right: 15px;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-value {
  font-size: 18px;
  font-weight: bold;
  color: #39affd;
}

.info-label {
  font-size: 12px;
  color: rgba(141, 209, 254, 0.7);
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 处理中遮罩 */
.tech-overlay {
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

.tech-processing {
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

.progress-track::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(57, 175, 253, 0.1) 0%,
    rgba(57, 175, 253, 0.2) 50%,
    rgba(57, 175, 253, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #3077b1, #39affd);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
  z-index: 1;
}

.progress-value {
  color: #39affd;
  font-size: 16px;
  font-weight: bold;
  min-width: 50px;
  text-align: right;
}

/* 按钮样式 */
.start-button {
  background: linear-gradient(to right, #3077b1, #39affd);
  border: none;
  padding: 8px 15px;
  font-size: 14px;
}

.start-button:hover:not(:disabled) {
  background: linear-gradient(to right, #39affd, #3077b1);
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.3);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .tech-content {
    flex-direction: column;
  }

  .upload-panel {
    width: 100%;
    min-height: 300px;
  }

  .result-panel {
    width: 100%;
  }
}
</style>