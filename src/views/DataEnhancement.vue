<template>
  <div class="data-enhancement-container">
    <div class="module-title">眼底图像低光增强</div>

    <div class="content-wrapper">
      <!-- 左侧面板：上传区域 -->
      <div class="left-panel">
        <div class="section-title">上传眼底图像</div>
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
            :auto-upload="false"
          >
            <div class="upload-placeholder" v-if="!uploadedImageUrl">
              <i class="el-icon-upload"></i>
              <div class="upload-text">点击上传图像</div>
            </div>
            <div v-else class="preview-container">
              <img :src="uploadedImageUrl" class="preview-image" />
              <div class="delete-button" @click.stop="removeUploadedImage">
                <i class="el-icon-delete"></i>
              </div>
            </div>
          </el-upload>
        </div>
      </div>

      <!-- 右侧面板：增强结果 -->
      <div class="right-panel">
        <div class="section-title-container">
          <div class="section-title">增强结果</div>
          <el-button
            v-if="enhancedImages.length > 0"
            type="primary"
            size="small"
            class="more-features-btn"
            @click="showCanvasEditor"
          >
            <i class="el-icon-edit"></i> 更多功能
          </el-button>
        </div>
        <div class="image-display">
          <div v-if="enhancedImages.length === 0" class="empty-state">
            <i class="el-icon-data-analysis"></i>
            <p>增强结果将显示在这里</p>
          </div>
          <div v-else class="enhanced-images-container">
            <div v-for="(image, index) in enhancedImages" :key="index" class="enhanced-image-item">
              <img :src="image.url" class="display-image" />
              <div class="image-label">增强图像 {{ index + 1 }}</div>
            </div>
          </div>
          <el-button
            v-if="enhancedImages.length > 0"
            type="success"
            class="download-button"
            @click="downloadEnhancedImages"
          >
            <i class="el-icon-download"></i> 下载增强图像
          </el-button>
        </div>
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div class="action-area">
      <el-button
        type="primary"
        class="enhance-button"
        @click="applyLowLightEnhancement"
        :disabled="!uploadedImageUrl || processing"
        :loading="processing"
      >
        <i class="el-icon-magic-stick"></i> 执行低光增强
      </el-button>
    </div>

    <!-- 画布编辑器弹窗 -->
    <div class="canvas-editor-overlay" v-if="showEditor" @click.self="closeCanvasEditor">
      <div class="canvas-editor-container">
        <div class="editor-header">
          <div class="editor-title">图像编辑</div>
          <div class="editor-tools">
            <el-button-group>
              <el-button 
                type="primary" 
                size="small" 
                :class="{ 'active-tool': currentTool === 'rotate' }" 
                @click="setTool('rotate')"
              >
                <i class="el-icon-refresh-right"></i> 随机旋转
              </el-button>
              <el-button 
                type="primary" 
                size="small" 
                :class="{ 'active-tool': currentTool === 'flip' }" 
                @click="setTool('flip')"
              >
                <i class="el-icon-sort"></i> 水平翻转
              </el-button>
              <el-button 
                type="primary" 
                size="small" 
                :class="{ 'active-tool': currentTool === 'brush' }" 
                @click="setTool('brush')"
              >
                <i class="el-icon-brush"></i> 画笔
              </el-button>
              <el-button 
                type="primary" 
                size="small" 
                :class="{ 'active-tool': currentTool === 'eraser' }" 
                @click="setTool('eraser')"
              >
                <i class="el-icon-delete"></i> 橡皮擦
              </el-button>
              <el-button 
                type="primary" 
                size="small" 
                @click="undoOperation" 
                :disabled="!canUndo"
              >
                <i class="el-icon-back"></i> 撤销操作
              </el-button>
            </el-button-group>
          </div>
          <el-button type="danger" size="small" circle @click="closeCanvasEditor">
            <i class="el-icon-close"></i>
          </el-button>
        </div>
        <div class="editor-content">
          <canvas ref="canvas" class="edit-canvas"></canvas>
        </div>
        <div class="editor-footer">
          <el-button type="primary" @click="saveEditedImage">保存</el-button>
          <el-button @click="closeCanvasEditor">取消</el-button>
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
      originalImageFile: null, // 记录本地上传的文件对象
      originalImageUrl: "", // 本地预览URL
      enhancedImages: [], // 存放增强后的结果
      // 上传地址
      uploadUrl: "http://127.0.0.1:5000/predict/lowlight",

      // 画布编辑器相关
      showEditor: false,
      canvas: null,
      ctx: null,
      currentTool: null,
      canUndo: false,
      editHistory: [],
      currentImage: null,
      isDrawing: false,
      lastX: 0,
      lastY: 0,
    };
  },
  methods: {
    // 上传前的检查
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

      // 记录文件对象
      this.originalImageFile = file;
      // 本地预览URL
      this.originalImageUrl = URL.createObjectURL(file);

      return false; // 不自动上传
    },

    // 上传成功后回调
    handleUploadSuccess(response) {
      if (response && response.outputs && response.outputs.length > 0) {
        this.processing = false;

        // 将后端返回的所有图片添加到增强结果中
        const enhancedImages = response.outputs.map((output, index) => ({
          url: `http://127.0.0.1:5000/download/${output}`,
          label: `增强图像 ${index + 1}`,
          filename: output,
        }));

        this.enhancedImages = enhancedImages;

        this.$message.success("低光增强完成");
      } else {
        this.processing = false;
        this.$message.error(response.message || "增强失败");
      }
    },

    // 上传出错回调
    handleUploadError(error) {
      this.processing = false;
      console.error("上传错误:", error);
      this.$message.error("图像处理失败，请重试");
    },

    // 执行低光增强
    applyLowLightEnhancement() {
      if (!this.originalImageFile) {
        this.$message.warning("请先上传图像");
        return;
      }

      this.processing = true;

      // 创建FormData并添加文件
      const formData = new FormData();
      formData.append("file", this.originalImageFile);

      // 使用el-upload的submit方法
      this.$refs.upload.submit();

      this.$message.info("正在处理图像，请稍候...");
    },

    // 下载增强图像
    async downloadEnhancedImages() {
      if (!this.enhancedImages || this.enhancedImages.length === 0) {
        this.$message.warning("没有可下载的增强图像");
        return;
      }

      for (const image of this.enhancedImages) {
        const a = document.createElement("a");
        a.href = image.url;
        a.download = image.filename || `enhanced_image_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // 下载间隔，防止同时触发下载事件冲突
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      this.$message.success("开始下载增强图像");
    },

    // 删除上传图片
    removeUploadedImage(e) {
      if (e) {
        e.stopPropagation();
      }

      // 清空所有图像相关数据
      this.originalImageFile = null;
      this.originalImageUrl = "";

      // 重置上传组件
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles();
      }

      this.$message.success("图像已删除");
    },

    // 显示画布编辑器
    showCanvasEditor() {
      if (this.enhancedImages.length === 0) {
        this.$message.warning("没有可编辑的增强图像");
        return;
      }

      this.showEditor = true;

      // 下一个事件循环再初始化画布，确保DOM已渲染
      this.$nextTick(() => {
        this.initCanvas();
      });
    },

    // 初始化画布
    initCanvas() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;

      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");

      // 加载第一张增强图像到画布
      const img = new Image();
      img.onload = () => {
        // 设置画布尺寸与图像一致
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制图像
        this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 保存初始状态
        this.saveCanvasState();
        this.currentImage = img;

        // 添加鼠标事件
        this.addCanvasEvents();
      };

      img.src = this.enhancedImages[0].url;
    },

    // 添加画布事件
    addCanvasEvents() {
      const canvas = this.canvas;

      canvas.addEventListener("mousedown", (e) => {
        if (this.currentTool !== "brush" && this.currentTool !== "eraser")
          return;

        this.isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
      });

      canvas.addEventListener("mousemove", (e) => {
        if (!this.isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        if (this.currentTool === "brush") {
          this.ctx.strokeStyle = "#39affd";
          this.ctx.lineWidth = 5;
          this.ctx.lineCap = "round";
          this.ctx.beginPath();
          this.ctx.moveTo(this.lastX, this.lastY);
          this.ctx.lineTo(currentX, currentY);
          this.ctx.stroke();
        } else if (this.currentTool === "eraser") {
          this.ctx.globalCompositeOperation = "destination-out";
          this.ctx.strokeStyle = "rgba(0,0,0,1)";
          this.ctx.lineWidth = 20;
          this.ctx.lineCap = "round";
          this.ctx.beginPath();
          this.ctx.moveTo(this.lastX, this.lastY);
          this.ctx.lineTo(currentX, currentY);
          this.ctx.stroke();
          this.ctx.globalCompositeOperation = "source-over";
        }

        this.lastX = currentX;
        this.lastY = currentY;
      });

      canvas.addEventListener("mouseup", () => {
        if (this.isDrawing) {
          this.isDrawing = false;
          this.saveCanvasState();
        }
      });

      canvas.addEventListener("mouseleave", () => {
        if (this.isDrawing) {
          this.isDrawing = false;
          this.saveCanvasState();
        }
      });
    },

    // 设置当前工具
    setTool(tool) {
      this.currentTool = tool;

      if (tool === "rotate") {
        this.rotateImage();
      } else if (tool === "flip") {
        this.flipImage();
      }
    },

    // 旋转图像
    rotateImage() {
      if (!this.canvas || !this.ctx || !this.currentImage) return;

      const canvas = this.canvas;
      const ctx = this.ctx;
      const img = this.currentImage;

      // 随机角度 (0-360度)
      const angle = Math.floor(Math.random() * 360);
      const radians = (angle * Math.PI) / 180;

      // 保存当前状态
      this.saveCanvasState();

      // 计算旋转后的画布尺寸
      const diagonal = Math.sqrt(
        canvas.width * canvas.width + canvas.height * canvas.height
      );
      const newWidth = diagonal;
      const newHeight = diagonal;

      // 创建临时画布以避免失真
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;

      // 在临时画布上绘制旋转后的图像
      tempCtx.translate(newWidth / 2, newHeight / 2);
      tempCtx.rotate(radians);
      tempCtx.drawImage(img, -img.width / 2, -img.height / 2);

      // 更新主画布尺寸
      canvas.width = newWidth;
      canvas.height = newHeight;

      // 将临时画布内容绘制到主画布
      ctx.drawImage(tempCanvas, 0, 0);

      this.$message.success(`图像已旋转 ${angle}°`);
      this.saveCanvasState();
    },

    // 水平翻转图像
    flipImage() {
      if (!this.canvas || !this.ctx || !this.currentImage) return;

      const canvas = this.canvas;
      const ctx = this.ctx;

      // 保存当前状态
      this.saveCanvasState();

      // 创建临时画布
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      // 复制当前画布内容
      tempCtx.drawImage(canvas, 0, 0);

      // 清除主画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 水平翻转绘制
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(tempCanvas, 0, 0);

      // 重置变换
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      this.$message.success("图像已水平翻转");
      this.saveCanvasState();
    },

    // 保存画布状态用于撤销
    saveCanvasState() {
      if (!this.canvas) return;

      const imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.editHistory.push(imageData);

      // 限制历史记录数量以节省内存
      if (this.editHistory.length > 10) {
        this.editHistory.shift();
      }

      this.canUndo = this.editHistory.length > 1;
    },

    // 撤销操作
    undoOperation() {
      if (this.editHistory.length <= 1) return;

      // 移除当前状态
      this.editHistory.pop();

      // 获取上一个状态
      const previousState = this.editHistory[this.editHistory.length - 1];

      // 恢复上一个状态
      this.ctx.putImageData(previousState, 0, 0);

      this.canUndo = this.editHistory.length > 1;
    },

    // 保存编辑后的图像
    saveEditedImage() {
      if (!this.canvas) return;

      // 获取画布数据URL
      const dataUrl = this.canvas.toDataURL("image/jpeg");

      // 创建新的增强图像对象
      const newImage = {
        url: dataUrl,
        label: "编辑后的图像",
        filename: `edited_image_${Date.now()}.jpg`,
        isEdited: true,
      };

      // 添加到增强图像列表
      this.enhancedImages.push(newImage);

      this.closeCanvasEditor();
      this.$message.success("编辑后的图像已保存");
    },

    // 关闭画布编辑器
    closeCanvasEditor() {
      this.showEditor = false;
      this.currentTool = null;
      this.canUndo = false;
      this.editHistory = [];
      this.currentImage = null;
      this.isDrawing = false;
    },
  },
};
</script>

<style scoped>
.data-enhancement-container {
  padding: 20px;
  color: #fff;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
}

.module-title {
  font-size: 24px;
  color: #39affd;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(57, 175, 253, 0.5);
}

.content-wrapper {
  display: flex;
  gap: 20px;
  flex: 1;
  margin-bottom: 20px;
}

.left-panel,
.right-panel {
  flex: 1;
  background: rgba(13, 28, 64, 0.7);
  border-radius: 12px;
  box-shadow: 0 0 25px rgba(57, 175, 253, 0.2);
  border: 1px solid rgba(57, 175, 253, 0.3);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.section-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 18px;
  color: #39affd;
  margin-bottom: 15px;
}

.more-features-btn {
  position: absolute;
  top: 20px;
  right: 20px;
}

.upload-area {
  border: 2px dashed rgba(57, 175, 253, 0.5);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 200px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
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
  flex: 1;
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
  height: 100%;
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

.action-area {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding: 10px 0;
}

.enhance-button {
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 4px;
  background: linear-gradient(to right, #3077b1, #39affd);
  border: none;
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.3);
  transition: all 0.3s ease;
}

.enhance-button:hover:not(:disabled) {
  background: linear-gradient(to right, #39affd, #3077b1);
  box-shadow: 0 0 20px rgba(57, 175, 253, 0.5);
  transform: translateY(-2px);
}

.download-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

/* 画布编辑器样式 */
.canvas-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 18, 49, 0.8);
  backdrop-filter: blur(5px); /* 添加高斯模糊 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.canvas-editor-container {
  background: rgba(13, 28, 64, 0.9);
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(57, 175, 253, 0.3);
  border: 1px solid rgba(57, 175, 253, 0.4);
  width: 90%;
  max-width: 1000px;
  height: 80%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  padding: 15px;
  border-bottom: 1px solid rgba(57, 175, 253, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-title {
  font-size: 18px;
  color: #39affd;
  font-weight: bold;
}

.editor-tools {
  display: flex;
  gap: 10px;
}

.editor-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: auto;
  background-color: #000;
}

.edit-canvas {
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 0 20px rgba(57, 175, 253, 0.2);
  background-color: #000;
}

.editor-footer {
  padding: 15px;
  border-top: 1px solid rgba(57, 175, 253, 0.3);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.active-tool {
  background: linear-gradient(45deg, #6ad4ff, #42a5ff) !important;
  border-color: #8dd1fe !important;
}

/* 全局样式覆盖 */
::v-deep .el-button {
  background: rgba(42, 128, 255, 0.9) !important;
  border-color: #6ad4ff !important;
  color: white !important;
}

::v-deep .el-button:hover {
  background: rgba(57, 175, 253, 0.8) !important;
}

::v-deep .el-button.active-button {
  background: linear-gradient(45deg, #6ad4ff, #42a5ff) !important;
}

.upload-area ::v-deep .el-upload {
  width: 100%;
  height: 100%;
}

.upload-area ::v-deep .el-upload-dragger {
  background: rgba(16, 62, 127, 0.8) !important;
  border-color: #42a5ff !important;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .canvas-editor-container {
    width: 95%;
    height: 90%;
  }

  .editor-tools {
    margin-top: 10px;
  }

  .editor-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
