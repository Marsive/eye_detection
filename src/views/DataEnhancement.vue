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
            :class="{'active-button': selectedAugmentations.includes(option.value)}"
            @click="toggleAugmentation(option.value)">
            {{ option.label }}
          </el-button>
        </div>
        
        <div class="section-title mt-20">上传眼底图像</div>
        <div class="upload-area">
          <el-upload
            class="image-uploader"
            action="#"
            :show-file-list="false"
            :on-change="handleImageUpload"
            :auto-upload="false"
            :limit="1">
            <div class="upload-placeholder" v-if="!originalImage">
              <i class="el-icon-upload"></i>
              <div class="upload-text">点击上传图像</div>
            </div>
            <img v-else :src="originalImage" class="preview-image">
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
          <img v-else :src="originalImage" class="display-image">
        </div>
        
        <el-button 
          type="primary" 
          class="process-button" 
          @click="applyAugmentation" 
          :disabled="!originalImage || selectedAugmentations.length === 0"
          :loading="processing">
          <i class="el-icon-refresh-right"></i> 执行数据增强
        </el-button>
        
        <div class="section-title mt-20">增强结果</div>
        <div class="image-display">
          <div v-if="!augmentedImage" class="empty-state">
            <i class="el-icon-data-analysis"></i>
            <p>增强结果将显示在这里</p>
          </div>
          <img v-else :src="augmentedImage" class="display-image">
          <el-button 
            v-if="augmentedImage" 
            type="success" 
            class="download-button"
            @click="downloadAugmentedImages">
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
      originalImage: '',
      augmentedImage: '',
      augmentations: [
        { label: '随机旋转', value: 'rotation' },
        { label: '水平翻转', value: 'flip' },
        { label: '亮度对比度调整', value: 'brightness_contrast' }
      ]
    };
  },
  methods: {
    toggleAugmentation(value) {
      if (this.selectedAugmentations.includes(value)) {
        this.selectedAugmentations = this.selectedAugmentations.filter(item => item !== value);
      } else {
        this.selectedAugmentations.push(value);
      }
    },
    handleImageUpload(file) {
      this.originalImage = URL.createObjectURL(file.raw);
      this.augmentedImage = ''; // 清空之前的增强结果
    },
    async applyAugmentation() {
      if (!this.originalImage || this.selectedAugmentations.length === 0) return;
      
      try {
        this.processing = true;
        // 模拟处理延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        // 实际应替换为API调用
        this.augmentedImage = this.originalImage;
        this.$message.success('增强处理完成');
      } catch (error) {
        this.$message.error('处理失败');
      } finally {
        this.processing = false;
      }
    },
    downloadAugmentedImages() {
      if (!this.augmentedImage) return;
      const a = document.createElement('a');
      a.href = this.augmentedImage;
      a.download = 'enhanced_image.png';
      a.click();
    }
  }
};
</script>

<style scoped>
.data-enhancement-container {
  padding: 20px;
  color: #fff;
}

.module-title {
  font-size: 24px;
  color: #39AFFD;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 0 0 10px rgba(57, 175, 253, 0.5);
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.left-panel, .right-panel {
  flex: 1;
  background: rgba(13, 28, 64, 0.7);
  border-radius: 12px;
  box-shadow: 0 0 25px rgba(57, 175, 253, 0.2);
  border: 1px solid rgba(57, 175, 253, 0.3);
  padding: 20px;
}

.section-title {
  font-size: 18px;
  color: #39AFFD;
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
  color: #39AFFD;
  margin-bottom: 10px;
}

.upload-text {
  color: #8DD1FE;
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
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8DD1FE;
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
  background: linear-gradient(45deg, #6ad4ff, #42a5ff) !important; /* 亮蓝渐变 */
}

/* 3. 上传区域背景 */
.upload-area ::v-deep .el-upload-dragger {
  background: rgba(16, 62, 127, 0.8) !important; /* 更亮的深蓝 */
  border-color: #42a5ff !important;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
}
</style>