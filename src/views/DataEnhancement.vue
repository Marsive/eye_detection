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
            :show-file-list="false"
            :before-upload="beforeUpload"
            name="file"
            :with-credentials="false"
            :limit="1"
            ref="upload"
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
          <div class="buttons-container">
            <el-button
              v-if="enhancedImages.length > 0"
              type="success"
              size="small"
              @click="downloadEnhancedImages"
            >
              <i class="el-icon-download"></i> 下载增强图像
            </el-button>
            <el-button
              v-if="enhancedImages.length > 0"
              type="primary"
              size="small"
              @click="showCanvasEditor"
            >
              <i class="el-icon-edit"></i> 更多功能
            </el-button>
          </div>
        </div>
        <div class="image-display">
          <div v-if="enhancedImages.length === 0" class="empty-state">
            <i class="el-icon-data-analysis"></i>
            <p>增强结果将显示在这里</p>
          </div>
          <div v-else class="image-content">
            <img
              :src="enhancedImages[currentImageIndex].url"
              class="display-image"
            />
            <div class="image-label">
              增强图像 {{ currentImageIndex + 1 }} / {{ enhancedImages.length }}
            </div>
            <div class="navigation-buttons" v-if="enhancedImages.length > 1">
              <el-button
                type="primary"
                icon="el-icon-arrow-left"
                circle
                @click="prevImage"
                :disabled="currentImageIndex === 0"
              ></el-button>
              <el-button
                type="primary"
                icon="el-icon-arrow-right"
                circle
                @click="nextImage"
                :disabled="currentImageIndex === enhancedImages.length - 1"
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
        class="enhance-button"
        @click="applyLowLightEnhancement"
        :disabled="!uploadedImageUrl || processing"
        :loading="processing"
      >
        <i class="el-icon-magic-stick"></i> 执行低光增强
      </el-button>
    </div>

    <!-- 画布编辑器弹窗 -->
    <div
      class="canvas-editor-overlay"
      v-if="showEditor"
      @click.self="closeCanvasEditor"
    >
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
                <i class="el-icon-refresh-right"></i> 旋转90°
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
          <el-button
            type="danger"
            size="small"
            circle
            @click="closeCanvasEditor"
          >
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
import axios from "axios";

export default {
  data() {
    return {
      processing: false,
      originalImageFile: null, // 记录本地上传的文件对象
      originalImageUrl: "", // 本地预览URL
      uploadedImageUrl: "", // 上传预览URL
      enhancedImages: [], // 存放增强后的结果
      currentImageIndex: 0, // 当前显示的图像索引
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
      originalImageData: null, // 添加原始图像数据存储
      eraserSize: 20, // 橡皮擦大小（像素）
      showEraserPreview: false, // 是否显示橡皮擦预览
    };
  },
  methods: {
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
      this.originalImageFile = file;
      this.uploadedImageUrl = URL.createObjectURL(file);
      return false;
    },
    applyLowLightEnhancement() {
      if (!this.originalImageFile) {
        this.$message.warning("请先上传图像");
        return;
      }

      this.processing = true;
      const formData = new FormData();
      formData.append("file", this.originalImageFile);

      axios
        .post(this.uploadUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          this.handleUploadSuccess(response.data);
        })
        .catch((error) => {
          this.handleUploadError(error);
        });
    },
    handleUploadSuccess(response) {
      this.processing = false;
      if (response && response.outputs && response.outputs.length > 0) {
        this.enhancedImages = response.outputs.map((output, index) => ({
          url: output.base64_data, // "data:image/jpeg;base64,...."
          label: `增强图像 ${index + 1}`,
          filename: output.filename,
        }));
        this.$message.success("低光增强完成");
      } else {
        this.$message.error(response.message || "增强失败");
      }
      this.currentImageIndex = 0; // 重置当前显示图像索引
    },
    handleUploadError(error) {
      this.processing = false;
      console.error("上传错误:", error);
      this.$message.error("图像处理失败，请重试");
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
      if (e) e.stopPropagation();
      this.originalImageFile = null;
      this.originalImageUrl = "";
      this.uploadedImageUrl = ""; // 重置预览
      this.enhancedImages = []; // 可选：清空增强结果
      if (this.$refs.upload) this.$refs.upload.clearFiles();
      this.$message.success("图像已删除");
      this.currentImageIndex = 0;
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
      if (!canvas) {
        console.error("找不到画布元素");
        return;
      }

      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      if (!this.ctx) {
        console.error("无法获取2D上下文");
        return;
      }

      console.log("正在初始化画布...");

      // 加载当前增强图像到画布
      const currentImage = this.enhancedImages[this.currentImageIndex];
      if (!currentImage) {
        console.error("没有图像可以加载");
        return;
      }

      const img = new Image();
      img.crossOrigin = "Anonymous"; // 解决跨域问题

      img.onload = () => {
        console.log("图像已加载到画布", img.width, img.height);

        // 设置画布尺寸与图像一致
        canvas.width = img.width;
        canvas.height = img.height;

        // 清除画布
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制图像
        this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 保存初始状态 - 存储包含原始图像的画布状态
        this.saveCanvasState();

        // 保存当前图像，以便后续操作
        this.currentImage = img;

        // 创建一个引用，存储原始图像数据
        this.originalImageData = this.ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        // 添加鼠标事件
        this.addCanvasEvents();

        // 添加完成后设置画布鼠标样式
        this.updateCanvasCursor();
      };

      img.onerror = (e) => {
        console.error("画布加载图像失败:", e, currentImage.url);
        this.$message.error("加载图像到画布失败");
      };

      console.log("正在加载图像:", currentImage.url);
      img.src = currentImage.url;
    },

    // 添加画布事件
    addCanvasEvents() {
      const canvas = this.canvas;
      console.log("正在添加画布事件监听器");

      // 移除旧的事件监听器，防止重复
      canvas.removeEventListener("mousedown", this.handleMouseDown);
      canvas.removeEventListener("mousemove", this.handleMouseMove);
      canvas.removeEventListener("mouseup", this.handleMouseUp);
      canvas.removeEventListener("mouseleave", this.handleMouseLeave);

      // 使用类方法而非匿名函数，便于移除
      canvas.addEventListener("mousedown", this.handleMouseDown);
      canvas.addEventListener("mousemove", this.handleMouseMove);
      canvas.addEventListener("mouseup", this.handleMouseUp);
      canvas.addEventListener("mouseleave", this.handleMouseLeave);

      console.log("画布事件监听器已添加");
    },

    // 鼠标事件处理程序
    handleMouseDown(e) {
  if (this.currentTool !== "brush" && this.currentTool !== "eraser") return;

  this.isDrawing = true;

  const rect = this.canvas.getBoundingClientRect();
  const scaleX = this.canvas.width / rect.width;
  const scaleY = this.canvas.height / rect.height;

  this.lastX = (e.clientX - rect.left) * scaleX;
  this.lastY = (e.clientY - rect.top) * scaleY;

  if (this.currentTool === "brush") {
    this.ctx.beginPath();
    this.ctx.arc(
      this.lastX,
      this.lastY,
      this.ctx.lineWidth / 2,
      0,
      Math.PI * 2
    );
    this.ctx.fillStyle = "#39affd";
    this.ctx.fill();
  } else if (this.currentTool === "eraser") {
    const eraseSize = this.eraserSize / 2;
    const x = this.lastX - eraseSize;
    const y = this.lastY - eraseSize;
    const width = eraseSize * 2;
    const height = eraseSize * 2;

    const validX = Math.max(0, Math.min(x, this.canvas.width - width));
    const validY = Math.max(0, Math.min(y, this.canvas.height - height));

    const currentData = this.ctx.getImageData(validX, validY, width, height);
    const originalData = this.originalImageData;

    if (originalData) {
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          const currentIndex = (j * width + i) * 4;
          const origX = validX + i;
          const origY = validY + j;

          if (
            origX >= 0 &&
            origX < this.canvas.width &&
            origY >= 0 &&
            origY < this.canvas.height
          ) {
            const origIndex = (origY * this.canvas.width + origX) * 4;

            currentData.data[currentIndex] = originalData.data[origIndex];
            currentData.data[currentIndex + 1] = originalData.data[origIndex + 1];
            currentData.data[currentIndex + 2] = originalData.data[origIndex + 2];
            currentData.data[currentIndex + 3] = originalData.data[origIndex + 3];
          }
        }
      }

      this.ctx.putImageData(currentData, validX, validY);
    }
  }
},

    handleMouseMove(e) {
      // 获取画布的实际尺寸和显示尺寸
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      // 计算当前位置，考虑缩放因素
      const currentX = (e.clientX - rect.left) * scaleX;
      const currentY = (e.clientY - rect.top) * scaleY;

      // 如果当前工具是橡皮擦，显示预览
      if (this.currentTool === "eraser" && this.showEraserPreview) {
        // 恢复画布到上一个状态（清除之前的预览）
        this.ctx.putImageData(
          this.editHistory[this.editHistory.length - 1],
          0,
          0
        );

        // 绘制橡皮擦预览（半透明圆形）
        this.ctx.beginPath();
        this.ctx.arc(currentX, currentY, this.eraserSize / 2, 0, Math.PI * 2);
        this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // 红色半透明边框
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }

      if (!this.isDrawing) return;

      if (this.currentTool === "brush") {
        this.ctx.strokeStyle = "#39affd";
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
      } else if (this.currentTool === "eraser") {
        // 在橡皮擦路径上创建多个点，恢复原始图像数据
        const steps = Math.max(
          Math.abs(currentX - this.lastX),
          Math.abs(currentY - this.lastY)
        );

        const stepSize = Math.max(1, Math.floor(steps / 10));

        for (let i = 0; i < steps; i += stepSize) {
          const ratio = steps === 0 ? 0 : i / steps;
          const x = Math.round(this.lastX + (currentX - this.lastX) * ratio);
          const y = Math.round(this.lastY + (currentY - this.lastY) * ratio);

          const eraseSize = this.eraserSize / 2; // 使用动态橡皮擦大小
          const left = Math.max(0, x - eraseSize);
          const top = Math.max(0, y - eraseSize);
          const width = Math.min(eraseSize * 2, this.canvas.width - left);
          const height = Math.min(eraseSize * 2, this.canvas.height - top);

          if (width > 0 && height > 0 && this.originalImageData) {
            const currentData = this.ctx.getImageData(left, top, width, height);

            for (let j = 0; j < height; j++) {
              for (let k = 0; k < width; k++) {
                const destX = left + k;
                const destY = top + j;

                if (
                  destX >= 0 &&
                  destX < this.canvas.width &&
                  destY >= 0 &&
                  destY < this.canvas.height
                ) {
                  const destIndex = (j * width + k) * 4;
                  const srcIndex = (destY * this.canvas.width + destX) * 4;

                  currentData.data[destIndex] =
                    this.originalImageData.data[srcIndex];
                  currentData.data[destIndex + 1] =
                    this.originalImageData.data[srcIndex + 1];
                  currentData.data[destIndex + 2] =
                    this.originalImageData.data[srcIndex + 2];
                  currentData.data[destIndex + 3] =
                    this.originalImageData.data[srcIndex + 3];
                }
              }
            }

            this.ctx.putImageData(currentData, left, top);
          }
        }
      }

      this.lastX = currentX;
      this.lastY = currentY;
    },

    handleMouseUp() {
      if (this.isDrawing) {
        console.log("鼠标释放");
        this.isDrawing = false;
        this.saveCanvasState();
      }
    },

    handleMouseLeave() {
      if (this.isDrawing) {
        console.log("鼠标离开");
        this.isDrawing = false;
        this.saveCanvasState();
      }
    },

    // 设置当前工具
    setTool(tool) {
      console.log("选择工具:", tool);
      this.currentTool = tool;

      // 控制橡皮擦预览的显示
      if (tool === "eraser") {
        this.showEraserPreview = true;
      } else {
        this.showEraserPreview = false;
      }

      this.updateCanvasCursor();

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

      // 保存当前状态
      this.saveCanvasState();

      // 交换宽高
      const newWidth = canvas.height;
      const newHeight = canvas.width;

      // 创建临时画布
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      // 复制当前画布内容到临时画布
      tempCtx.drawImage(canvas, 0, 0);

      // 调整主画布尺寸（宽高互换）
      canvas.width = newWidth;
      canvas.height = newHeight;

      // 清除主画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 在主画布上执行旋转变换
      ctx.save();
      ctx.translate(canvas.width, 0); // 移动到右上角
      ctx.rotate(Math.PI / 2); // 旋转90度（π/2弧度）
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.restore();

      // 更新原始图像数据，确保橡皮擦功能正常工作
      this.originalImageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // 更新currentImage，确保后续操作正常
      const img = new Image();
      img.src = canvas.toDataURL();
      this.currentImage = img;

      // 保存旋转后的状态
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

      // 更新原始图像数据
      this.originalImageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // 更新当前图像
      const img = new Image();
      img.src = canvas.toDataURL();
      this.currentImage = img;

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

    // 检查图像URL是否可访问
    checkImageUrl(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    },

    // 导航到上一张图片
    prevImage() {
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--;
      }
    },

    // 导航到下一张图片
    nextImage() {
      if (this.currentImageIndex < this.enhancedImages.length - 1) {
        this.currentImageIndex++;
      }
    },

    // 设置鼠标样式
    updateCanvasCursor() {
      if (!this.canvas) return;

      if (this.currentTool === "brush") {
        this.canvas.style.cursor = "crosshair";
      } else if (this.currentTool === "eraser") {
        // 使用你提供的 SVG 图标作为光标
        const svgCursor = `
      <svg t="1743949358173" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4275" width="32" height="32">
        <path d="M554.3 850.7L981 424c12.5-12.5 12.5-32.8 0-45.3L636.7 34.6c-12.5-12.5-32.8-12.5-45.3 0L90.5 535.5c-50 50-50 131 0 181l272.1 270.3c24 23.8 56.4 37.2 90.2 37.2H864c17.7 0 32-14.3 32-32s-14.3-32-32-32H599.5c-57 0-85.6-68.9-45.2-109.3z m71.1-736.9l276.4 276.4c6.2 6.2 6.2 16.4 0 22.6L607.9 706.6l-299-299 293.8-293.9c6.3-6.2 16.4-6.2 22.7 0.1zM135.8 580.7l127.9-127.9 299 299-127.9 127.9c-25 25-65.5 25-90.5 0L135.8 671.3c-25-25-25-65.6 0-90.6z" fill="#1296db" p-id="4276"></path>
      </svg>
    `;
        // 将 SVG 编码为 base64 格式，并设置光标
        const encodedSvg = encodeURIComponent(svgCursor);
        this.canvas.style.cursor = `url('data:image/svg+xml;utf8,${encodedSvg}') 16 16, auto`;
      } else {
        this.canvas.style.cursor = "default";
      }
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

.buttons-container {
  display: flex;
  gap: 10px;
  align-items: center;
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
  overflow: hidden; /* 避免滚动条 */
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

.image-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.display-image {
  max-width: 100%;
  max-height: calc(100% - 40px); /* 保留空间给标签和导航按钮 */
  object-fit: contain;
}

.navigation-buttons {
  position: absolute;
  bottom: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
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
  background-color: #000;
  overflow: hidden; /* 避免滚动条 */
}

.edit-canvas {
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 0 20px rgba(57, 175, 253, 0.2);
  background-color: #000;
  touch-action: none; /* 防止触摸设备上的默认行为干扰画布操作 */
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

  .editor-content {
    padding: 10px;
  }

  .edit-canvas {
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
