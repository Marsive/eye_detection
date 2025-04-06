<template>
  <div class="data-enhancement-container">
    <div class="module-title">图像数据增强</div>

    <div class="content-wrapper">
      <!-- 左侧面板：增强选项 + 上传区域 -->
      <div class="left-panel">
        <div class="section-title">数据增强选项</div>
        <div class="enhancement-options">
          <el-button
            v-for="option in augmentations"
            :key="option.value"
            :class="{
              'active-button': selectedAugmentations.includes(option.value),
            }"
            @click="toggleAugmentation(option.value)"
          >
            {{ option.label }}
          </el-button>
        </div>

        <div class="section-title mt-20">上传眼底图像</div>
        <div class="upload-area">
          <el-upload
            class="image-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            name="file"
            :with-credentials="false"
            :limit="1"
            ref="upload"
          >
            <div class="upload-placeholder" v-if="!originalImageUrl">
              <i class="el-icon-upload"></i>
              <div class="upload-text">点击上传图像</div>
            </div>
            <div v-else class="preview-container">
              <img :src="originalImageUrl" class="preview-image" />
              <div class="delete-button" @click.stop="removeUploadedImage">
                <i class="el-icon-delete"></i>
              </div>
            </div>
          </el-upload>
        </div>
      </div>

      <!-- 右侧面板：原始图像显示 + 执行增强按钮 + 增强结果 -->
      <div class="right-panel">
        <div class="section-title">原始图像</div>
        <div class="image-display" ref="originalImageContainer">
          <div v-if="!originalImageUrl" class="empty-state">
            <i class="el-icon-picture-outline"></i>
            <p>请先上传图像</p>
          </div>
          <!-- 使用本地预览URL展示原图 -->
          <img
            v-else
            :src="originalImageUrl"
            class="display-image"
            ref="originalImageElement"
          />
        </div>

        <el-button
          type="primary"
          class="process-button"
          @click="applyAugmentation"
          :disabled="!originalImageUrl || selectedAugmentations.length === 0"
          :loading="processing"
        >
          <i class="el-icon-refresh-right"></i> 执行数据增强
        </el-button>

        <div class="section-title mt-20">增强结果</div>
        <div class="image-display" :style="resultContainerStyle">
          <div
            v-if="!augmentedImages || augmentedImages.length === 0"
            class="empty-state"
          >
            <i class="el-icon-data-analysis"></i>
            <p>增强结果将显示在这里</p>
          </div>
          <div v-else class="enhanced-images-container">
            <div
              v-for="(image, index) in augmentedImages"
              :key="index"
              class="enhanced-image-item"
            >
              <img :src="image.url" class="display-image" :style="imageStyle" />
              <div class="image-label">{{ image.label }}</div>
            </div>
          </div>
          <el-button
            v-if="augmentedImages && augmentedImages.length > 0"
            type="success"
            class="download-button"
            @click="downloadAugmentedImages"
          >
            <i class="el-icon-download"></i> 下载增强图像
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      processing: false,
      selectedAugmentations: [],
      originalImage: "", // 用来存储服务器返回的图像路径
      originalImageFile: null, // 记录本地上传的文件对象
      originalImageUrl: "", // 本地预览URL
      augmentedImages: [], // 存放所有增强后（含客户端/服务器等）的结果
      augmentations: [
        { label: "随机旋转", value: "rotate" },
        { label: "水平翻转", value: "flip" },
        { label: "低光增强", value: "contrast" },
      ],
      // 上传地址，注意这里指向后端的"低光增强"接口
      uploadUrl: "http://127.0.0.1:5000/predict/lowlight",
      // 用于保持图像显示一致性的样式
      resultContainerStyle: {
        height: "300px",
      },
      imageStyle: {},
    };
  },
  mounted() {
    // 添加窗口大小变化监听
    window.addEventListener("resize", this.updateImageContainerSize);
  },
  beforeDestroy() {
    // 移除监听器
    window.removeEventListener("resize", this.updateImageContainerSize);
  },
  methods: {
    // 更新图像容器尺寸以保持一致
    updateImageContainerSize() {
      // 检查原图元素是否存在
      if (this.$refs.originalImageElement) {
        // 取原图容器的宽高
        const container = this.$refs.originalImageContainer;
        if (container) {
          this.resultContainerStyle = {
            height: `${container.clientHeight}px`,
          };
        }
      }
    },

    toggleAugmentation(value) {
      const index = this.selectedAugmentations.indexOf(value);
      if (index > -1) {
        this.selectedAugmentations.splice(index, 1);
      } else {
        this.selectedAugmentations.push(value);
      }
    },

    // 上传前的检查，同时可以在这里记录本地 File 对象
    beforeUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isImage) {
        this.$message.error("只能上传图片文件!");
        return false;
      }
      if (!isLt5M) {
        this.$message.error("图片大小不能超过 5MB!");
        return false;
      }

      // 记录下文件对象，用于后续客户端旋转/翻转处理
      this.originalImageFile = file;
      // 本地预览URL
      this.originalImageUrl = URL.createObjectURL(file);

      return true;
    },

    // 上传成功后回调
    handleUploadSuccess(response) {
      if (response && response.outputs && response.outputs.length > 0) {
        // 保存服务器返回的图像路径
        this.originalImage = `http://127.0.0.1:5000/download/${response.outputs[0]}`;

        // 确保我们仍然有本地文件对象用于前端处理
        if (this.$refs.upload.uploadFiles.length > 0) {
          this.originalImageFile = this.$refs.upload.uploadFiles[0].raw;
        }

        // 清空之前的增强结果列表
        this.augmentedImages = [];
        this.$message.success("图像上传成功并完成服务器增强");

        // 更新图像容器尺寸
        this.$nextTick(this.updateImageContainerSize);
      } else {
        this.$message.error(response.message || "上传失败");
      }
    },

    // 上传出错回调
    handleUploadError(error) {
      console.error("上传错误:", error);
      this.$message.error("图像上传失败，请重试");
    },

    // 点击执行数据增强按钮
    async applyAugmentation() {
      if (!this.originalImageUrl || this.selectedAugmentations.length === 0)
        return;
      try {
        this.processing = true;
        // 每次点击处理时先清空之前的增强结果
        this.augmentedImages = [];

        // 先执行前端的旋转、翻转处理
        await this.processClientSideAugmentations();

        // 如果选择了"低光增强"，再执行服务器端处理
        if (this.selectedAugmentations.includes("contrast")) {
          await this.processServerSideAugmentations();
        }

        // 更新结果显示尺寸
        this.$nextTick(this.updateImageContainerSize);
        this.$message.success("增强处理完成");
      } catch (error) {
        console.error("增强处理错误:", error);
        this.$message.error("增强处理失败，请重试");
      } finally {
        this.processing = false;
      }
    },

    // 前端处理（旋转 + 翻转）
    async processClientSideAugmentations() {
      if (!this.originalImageFile) return;

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // 记录原始图像尺寸用于显示
          const originalWidth = img.width;
          const originalHeight = img.height;

          // 记录图像尺寸以保持一致的显示效果
          this.imageStyle = {
            width: `${originalWidth}px`,
            height: `${originalHeight}px`,
            objectFit: "contain",
          };

          if (this.selectedAugmentations.includes("rotate")) {
            const rotatedCanvas = this.rotateImage(img);
            const rotatedDataUrl = rotatedCanvas.toDataURL("image/jpeg");
            this.augmentedImages.push({
              url: rotatedDataUrl,
              label: "随机旋转",
              downloadUrl: rotatedDataUrl,
            });
          }

          if (this.selectedAugmentations.includes("flip")) {
            const flippedCanvas = this.flipImage(img);
            const flippedDataUrl = flippedCanvas.toDataURL("image/jpeg");
            this.augmentedImages.push({
              url: flippedDataUrl,
              label: "水平翻转",
              downloadUrl: flippedDataUrl,
            });
          }

          resolve();
        };
        // 使用本地预览地址作为图像源确保处理的是原始图像
        img.src = this.originalImageUrl;
      });
    },

    // 随机旋转
    rotateImage(img) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      // 这里随便转个随机角度
      const angle = Math.random() * 360;
      const radians = (angle * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));

      // 计算旋转后画布需要多大尺寸
      canvas.width = Math.floor(img.width * cos + img.height * sin);
      canvas.height = Math.floor(img.width * sin + img.height * cos);

      // 画布中心旋转
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(radians);
      // 绘制原图
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      return canvas;
    },

    // 水平翻转
    flipImage(img) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      // 水平翻转
      ctx.translate(img.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      return canvas;
    },

    // 服务器端处理低光增强
    async processServerSideAugmentations() {
      // 这里需要把原图文件再发给后端
      if (!this.originalImageFile) return;
      const formData = new FormData();
      formData.append("file", this.originalImageFile);

      // 发送请求
      const response = await axios.post(this.uploadUrl, formData);

      if (
        response.data &&
        response.data.outputs &&
        response.data.outputs.length > 0
      ) {
        // 使用服务器返回的增强后图像URL
        const serverImgUrl = `http://127.0.0.1:5000/download/${response.data.outputs[0]}`;
        this.augmentedImages.push({
          url: serverImgUrl,
          label: "低光增强",
          downloadUrl: serverImgUrl,
        });
      } else {
        throw new Error(response.data.message || "低光增强请求失败");
      }
    },

    // 下载所有增强图
    async downloadAugmentedImages() {
      for (const image of this.augmentedImages) {
        const a = document.createElement("a");
        a.href = image.downloadUrl; // 使用下载URL
        a.download = `enhanced_${image.label}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // 下载间隔，防止同时触发下载事件冲突
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    },

    // 删除上传图片
    removeUploadedImage(e) {
      // 阻止事件冒泡，避免触发上传
      if (e) {
        e.stopPropagation();
      }

      // 清空所有图像相关数据
      this.originalImage = "";
      this.originalImageFile = null;
      this.originalImageUrl = "";
      this.augmentedImages = [];
      this.imageStyle = {};

      // 重置上传组件
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles();
      }

      this.$message.success("图像已删除");
    },
  },
};
</script>

<style scoped>
.data-enhancement-container {
  padding: 20px;
  color: #fff;
}

.module-title {
  font-size: 24px;
  color: #39affd;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 0 0 10px rgba(57, 175, 253, 0.5);
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.left-panel,
.right-panel {
  flex: 1;
  background: rgba(13, 28, 64, 0.7);
  border-radius: 12px;
  box-shadow: 0 0 25px rgba(57, 175, 253, 0.2);
  border: 1px solid rgba(57, 175, 253, 0.3);
  padding: 20px;
}

.section-title {
  font-size: 18px;
  color: #39affd;
  margin-bottom: 15px;
}

.mt-20 {
  margin-top: 20px;
}

.enhancement-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed rgba(57, 175, 253, 0.5);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
}

.upload-placeholder i {
  font-size: 48px;
  color: #39affd;
  margin-bottom: 10px;
}

.upload-text {
  color: #8dd1fe;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  width: 100%;
  max-height: 150px;
  object-fit: contain;
}

.delete-button {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  background: rgba(255, 107, 107, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.delete-button:hover {
  background: rgba(255, 107, 107, 1);
  transform: scale(1.1);
}

.delete-button i {
  color: white;
  font-size: 16px;
}

.image-display {
  height: 300px;
  border: 1px solid rgba(57, 175, 253, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: auto;
  background-color: #000; /* 医学图像用黑底可能更友好 */
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8dd1fe;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 10px;
}

.display-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.enhanced-images-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 10px;
}

.enhanced-image-item {
  margin-bottom: 15px;
  text-align: center;
}

.image-label {
  margin-top: 5px;
  color: #8dd1fe;
  font-size: 14px;
}

.process-button {
  width: 100%;
  margin: 20px 0;
  height: 40px;
}

.download-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

/* 修改后的颜色方案 */
::v-deep .el-button {
  background: rgba(42, 128, 255, 0.9) !important; /* 亮蓝 */
  border-color: #6ad4ff !important;
  color: white !important;
}

::v-deep .el-button.active-button {
  background: linear-gradient(45deg, #6ad4ff, #42a5ff) !important; /* 渐变 */
}

.upload-area ::v-deep .el-upload-dragger {
  background: rgba(16, 62, 127, 0.8) !important; /* 深蓝 */
  border-color: #42a5ff !important;
  width: 100%;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
}

/* 新增和修改的样式 */
.result-layout {
  display: flex;
  gap: 20px;
  width: 100%;
}

.result-images {
  width: 25%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-box {
  background: rgba(13, 28, 64, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(57, 175, 253, 0.3);
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.1);
  overflow: hidden;
}

.image-title {
  background: rgba(16, 32, 67, 0.8);
  padding: 10px 15px;
  color: #8dd1fe;
  font-size: 16px;
  border-bottom: 1px solid rgba(57, 175, 253, 0.2);
  text-align: center;
}

.image-display {
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
}

.image-display img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
}

.result-analysis {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-panel {
  background: rgba(13, 28, 64, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(57, 175, 253, 0.3);
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.1);
  overflow: hidden;
}

.panel-header {
  background: rgba(16, 32, 67, 0.8);
  padding: 12px 15px;
  color: #39affd;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(57, 175, 253, 0.2);
  text-align: center;
}

.analysis-content {
  padding: 20px;
}

.result-metrics {
  background: rgba(16, 32, 67, 0.5);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.metric-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.metric-label {
  color: #8dd1fe;
  font-weight: bold;
  width: 120px;
  flex-shrink: 0;
}

.metric-value {
  color: #39affd;
  font-weight: bold;
}

.disease-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.disease-tag {
  margin-right: 5px;
}

.chart-container {
  height: 300px;
  margin: 20px 0;
}

.prob-chart {
  width: 100%;
  height: 100%;
}

.analysis-conclusion {
  margin-top: 15px;
  padding: 12px;
  background: rgba(16, 32, 67, 0.5);
  border-radius: 8px;
  color: #39affd;
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.analysis-conclusion.abnormal {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.analysis-conclusion i {
  margin-right: 10px;
  font-size: 20px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .result-layout {
    flex-direction: column;
  }

  .result-images {
    width: 100%;
    flex-direction: row;
  }

  .image-box {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .result-images {
    flex-direction: column;
  }
}
</style>
