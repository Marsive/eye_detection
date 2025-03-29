<template>
  <div class="data-enhancement-container">
    <div class="module-title">图像数据增强</div>

    <div class="content-wrapper">
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
            <div class="upload-placeholder" v-if="!originalImage">
              <i class="el-icon-upload"></i>
              <div class="upload-text">点击上传图像</div>
            </div>
            <img v-else :src="originalImage" class="preview-image" />
          </el-upload>
        </div>
      </div>

      <div class="right-panel">
        <div class="section-title">原始图像</div>
        <div class="image-display">
          <div v-if="!originalImage" class="empty-state">
            <i class="el-icon-picture-outline"></i>
            <p>请先上传图像</p>
          </div>
          <img v-else :src="originalImage" class="display-image" />
        </div>

        <el-button
          type="primary"
          class="process-button"
          @click="applyAugmentation"
          :disabled="!originalImage || selectedAugmentations.length === 0"
          :loading="processing"
        >
          <i class="el-icon-refresh-right"></i> 执行数据增强
        </el-button>

        <div class="section-title mt-20">增强结果</div>
        <div class="image-display">
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
              <img :src="image.url" class="display-image" />
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
import axios from "axios";

export default {
  data() {
    return {
      processing: false,
      selectedAugmentations: [],
      originalImage: "",
      originalImageFile: null, // 保存原始图像文件对象
      originalImageUrl: "", // 添加明确的originalImageUrl属性
      augmentedImages: [],
      augmentations: [
        { label: "随机旋转", value: "rotate" },
        { label: "水平翻转", value: "flip" },
        { label: "低光增强", value: "contrast" },
      ],
      uploadUrl: "/predict/lowlight", // 低光增强接口
    };
  },
  methods: {
    toggleAugmentation(value) {
      if (this.selectedAugmentations.includes(value)) {
        this.selectedAugmentations = this.selectedAugmentations.filter(
          (item) => item !== value
        );
      } else {
        this.selectedAugmentations.push(value);
      }
    },
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
      return true;
    },
    handleUploadSuccess(response) {
      if (response && response.outputs && response.outputs.length > 0) {
        // 保存原始图像路径
        this.originalImage = `/download/${response.outputs[0]}`;

        // 获取原始图像文件（用于前端处理）
        if (this.$refs.upload.uploadFiles.length > 0) {
          this.originalImageFile = this.$refs.upload.uploadFiles[0].raw;
          // 创建一个临时的URL以供前端增强功能使用
          this.originalImageUrl = URL.createObjectURL(this.originalImageFile);
        }

        this.augmentedImages = []; // 清空之前的增强结果
        this.$message.success("图像上传成功");
      } else {
        this.$message.error(response.message || "上传失败");
      }
    },
    handleUploadError(error) {
      console.error("上传错误:", error);
      this.$message.error("图像上传失败，请重试");
    },
    handleFileChange(file) {
      if (!file) return;

      // 验证已在beforeUpload中完成
      this.originalImageFile = file.raw;

      // 创建预览URL
      this.originalImageUrl = URL.createObjectURL(file.raw);
      this.originalImage = this.originalImageUrl;

      this.augmentedImages = []; // 清空之前的增强结果
      this.$message.success("图像已选择");
    },
    async applyAugmentation() {
      if (!this.originalImage || this.selectedAugmentations.length === 0)
        return;

      try {
        this.processing = true;
        this.augmentedImages = [];

        // 前端实现的增强操作
        await this.processClientSideAugmentations();

        // 如果选择了低光增强，调用后端API
        if (this.selectedAugmentations.includes("contrast")) {
          await this.processServerSideAugmentations();
        }

        this.$message.success("增强处理完成");
      } catch (error) {
        console.error("增强处理错误:", error);
        this.$message.error("增强处理失败，请重试");
      } finally {
        this.processing = false;
      }
    },

    // 前端实现的图像增强
    async processClientSideAugmentations() {
      if (!this.originalImageFile) return;

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // 创建画布
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // 设置画布大小与图像一致
          canvas.width = img.width;
          canvas.height = img.height;

          // 随机旋转
          if (this.selectedAugmentations.includes("rotate")) {
            const rotatedCanvas = this.rotateImage(img);
            const rotatedDataUrl = rotatedCanvas.toDataURL("image/jpeg");

            this.augmentedImages.push({
              url: rotatedDataUrl,
              label: "随机旋转",
              downloadUrl: rotatedDataUrl,
            });
          }

          // 水平翻转
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

        // 设置图像源
        img.src = this.originalImageUrl || this.originalImage;
      });
    },

    // 随机旋转图像
    rotateImage(img) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // 随机角度 (0-360度)
      const angle = Math.floor(Math.random() * 360);

      // 计算旋转后的画布尺寸
      const radians = (angle * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      const newWidth = Math.floor(img.width * cos + img.height * sin);
      const newHeight = Math.floor(img.width * sin + img.height * cos);

      canvas.width = newWidth;
      canvas.height = newHeight;

      // 将原点移到画布中心
      ctx.translate(newWidth / 2, newHeight / 2);
      // 旋转画布
      ctx.rotate(radians);
      // 绘制图像，并移回原点
      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );

      return canvas;
    },

    // 水平翻转图像
    flipImage(img) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      // 水平翻转
      ctx.translate(img.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, img.width, img.height);

      return canvas;
    },

    // 后端低光增强处理
    async processServerSideAugmentations() {
      if (!this.selectedAugmentations.includes("contrast")) return;

      // 只有在选择了低光增强时才调用API
      const formData = new FormData();
      formData.append("file", this.originalImageFile);

      const response = await fetch("/predict/lowlight", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("低光增强请求失败");
      }

      const result = await response.json();

      if (result && result.outputs && result.outputs.length > 0) {
        // 添加低光增强结果（通常是第一张图）
        this.augmentedImages.push({
          url: `/download/${result.outputs[0]}`,
          label: "低光增强",
          downloadUrl: `/download/${result.outputs[0]}`,
        });
      }
    },

    // 下载增强后的图像
    async downloadAugmentedImages() {
      if (!this.augmentedImages || this.augmentedImages.length === 0) return;

      try {
        for (let i = 0; i < this.augmentedImages.length; i++) {
          const image = this.augmentedImages[i];

          // 如果是数据URL，直接下载
          if (image.url.startsWith("data:")) {
            const a = document.createElement("a");
            a.href = image.url;
            a.download = `enhanced_${image.label}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          // 如果是服务器路径，使用fetch下载
          else {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `enhanced_${image.label}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }

          // 每次下载间隔500ms，避免浏览器阻止多次下载
          if (i < this.augmentedImages.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      } catch (error) {
        console.error("下载错误:", error);
        this.$message.error("下载失败，请重试");
      }
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

.preview-image {
  width: 100%;
  max-height: 150px;
  object-fit: contain;
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
  background-color: #000; /* 黑色背景更适合医学图像显示 */
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
/* 1. 增强选项按钮 */
::v-deep .el-button {
  background: rgba(42, 128, 255, 0.9) !important; /* 亮蓝色 */
  border-color: #6ad4ff !important;
  color: white !important;
}

/* 2. 激活状态按钮 */
::v-deep .el-button.active-button {
  background: linear-gradient(
    45deg,
    #6ad4ff,
    #42a5ff
  ) !important; /* 亮蓝渐变 */
}

/* 3. 上传区域背景 */
.upload-area ::v-deep .el-upload {
  display: block;
  width: 100%;
}

.upload-area ::v-deep .el-upload-dragger {
  background: rgba(16, 62, 127, 0.8) !important; /* 更亮的深蓝 */
  border-color: #42a5ff !important;
  width: 100%;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
}
</style>