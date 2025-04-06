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
            <div class="upload-text">点击上传眼底影像</div>
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
            <div class="upload-text">点击上传眼底影像</div>
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

      <!-- 分析结果面板 -->
      <div
        v-for="(result, index) in analysisResult"
        :key="index"
        class="result-panel"
      >
        <div class="panel-header">
          {{ index === 0 ? "左眼" : "右眼" }}分析结果
        </div>

        <div class="panel-content">
          <!-- 左侧图像 -->
          <div class="result-image-container">
            <img
              :src="index === 0 ? leftImage : rightImage"
              alt="眼底图像"
              class="result-image"
            />
          </div>

          <!-- 右侧分析数据 -->
          <div class="result-data-container">
            <!-- 基本分析信息 -->
            <div class="result-metrics">
              <div class="metric-item">
                <div class="metric-label">预测疾病类型:</div>
                <div class="metric-value disease-types">
                  <el-tag
                    v-for="(disease, i) in result.predictedClasses"
                    :key="i"
                    :type="getTagType(disease)"
                    effect="dark"
                    class="disease-tag"
                  >
                    {{ getChineseName(disease) }}
                  </el-tag>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-label">置信度:</div>
                <div class="metric-value">{{ result.confidence }}%</div>
              </div>
            </div>

            <!-- 图表区域 -->
            <div class="chart-container">
              <div :id="`chart-${result.side}`" class="prob-chart"></div>
            </div>

            <!-- 结果结论 -->
            <div
              class="analysis-conclusion"
              :class="{ abnormal: result.abnormal }"
            >
              <i
                :class="
                  result.abnormal ? 'el-icon-warning' : 'el-icon-success'
                "
              ></i>
              <span>{{ result.conclusion }}</span>
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
import * as echarts from "echarts";

export default {
  name: "Classification",
  data() {
    return {
      leftImage: null,
      rightImage: null,
      leftFile: null,
      rightFile: null,
      leftProgress: 0,
      rightProgress: 0,
      isProcessing: false,
      processingProgress: 0,
      analysisResult: null,
      // 疾病名称映射表
      diseaseMap: {
        AMD: "年龄相关性黄斑变性",
        Cataract: "白内障",
        Diabetes: "糖尿病视网膜病变",
        Glaucoma: "青光眼",
        Hypertension: "高血压视网膜病变",
        Myopia: "近视",
        Normal: "正常",
        Other: "其他"
      },
      charts: [] // 存储图表实例，用于后续管理
    };
  },
  computed: {
    canAnalyze() {
      return (this.leftImage || this.rightImage) && !this.isProcessing;
    },
  },
  methods: {
    // 获取疾病的中文名称
    getChineseName(disease) {
      return this.diseaseMap[disease] || disease;
    },
    
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
      // 验证文件
      if (!this.validateFile(file)) return;

      this[side + "File"] = file; // 保存文件对象以便后续上传

      // 生成预览
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

    validateFile(file) {
      const validTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 16 * 1024 * 1024; // 16MB

      if (!isValidType) {
        this.$message.error("请上传PNG、JPG、JPEG或GIF格式图像!");
        return false;
      }

      if (!isValidSize) {
        this.$message.error("图像大小不能超过16MB!");
        return false;
      }

      return true;
    },

    startAnalysis() {
      if (!this.canAnalyze) return;

      this.isProcessing = true;
      this.processingProgress = 0;
      this.analysisResult = null;
      
      // 清空之前的图表实例
      this.charts.forEach(chart => {
        chart.dispose();
      });
      this.charts = [];

      // 准备FormData
      const formData = new FormData();

      // 添加左右眼图像（如果有）
      if (this.leftFile) {
        formData.append("file", this.leftFile);
      }
      if (this.rightFile) {
        formData.append("file", this.rightFile);
      }

      // 设置阈值策略
      formData.append("threshold_strategy", "per_class");

      // 模拟进度条
      const interval = setInterval(() => {
        this.processingProgress += 5;
        if (this.processingProgress >= 95) {
          clearInterval(interval);
        }
      }, 200);

      // 调用API
      fetch("http://127.0.0.1:5000/predict/class", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("分类请求失败");
          }
          return response.json();
        })
        .then((data) => {
          clearInterval(interval);
          this.processingProgress = 100;

          // 处理API返回的结果
          if (
            data.message === "Classification completed" &&
            data.results &&
            data.results.length > 0
          ) {
            this.processClassificationResults(data.results);
            
            // 确保DOM渲染完成后初始化图表
            this.$nextTick(() => {
              setTimeout(() => {
                this.initCharts();
              }, 100);
            });
          } else {
            throw new Error(data.error || "分类失败");
          }
        })
        .catch((error) => {
          clearInterval(interval);
          console.error("分类错误:", error);
          this.$message.error(error.message || "分类处理失败，请重试");
        })
        .finally(() => {
          setTimeout(() => {
            this.isProcessing = false;
          }, 500);
        });
    },

    processClassificationResults(results) {
      // 处理每个图像的结果
      this.analysisResult = results.map((result, idx) => {
        // 准备概率数据供柱状图使用
        const chartData = [];
        
        // 疾病和概率对应关系
        const diseaseNames = ["AMD", "Cataract", "Diabetes", "Glaucoma", "Hypertension", "Myopia", "Normal", "Other"];
        
        for (let i = 0; i < diseaseNames.length; i++) {
          chartData.push({
            name: diseaseNames[i],
            chineseName: this.getChineseName(diseaseNames[i]),
            value: result.all_probs[i],
            isPredicted: result.predicted_classes.includes(diseaseNames[i])
          });
        }

        // 获取预测的类别并去除"Normal"
        const abnormalClasses = result.predicted_classes
          .filter(cls => cls !== "Normal")
          .map(cls => this.getChineseName(cls));

        return {
          side: idx === 0 ? "left" : "right",
          abnormal: abnormalClasses.length > 0,
          conclusion:
            abnormalClasses.length > 0
              ? `检测到异常: ${abnormalClasses.join(", ")}`
              : "未检测到明显异常",
          chartData: chartData,
          predictedClasses: result.predicted_classes,
          confidence: (result.confidence * 100).toFixed(1),
        };
      });
    },

    getBarColor(isPredicted) {
      return isPredicted ? "#ff6b6b" : "#39affd";
    },

    removeImage(side) {
      this[side + "Image"] = null;
      this[side + "Progress"] = 0;
      this[side + "File"] = null;
      if (this.$refs[side + "FileInput"]) {
        this.$refs[side + "FileInput"].value = "";
      }
    },

    // 初始化所有图表
    initCharts() {
      if (!this.analysisResult) return;

      this.analysisResult.forEach((result) => {
        const chartId = `chart-${result.side}`;
        const chartDom = document.getElementById(chartId);

        if (!chartDom) {
          console.error(`图表容器不存在: ${chartId}`);
          return;
        }

        // 检查是否已经存在chart实例，如果存在则销毁
        const existingChart = echarts.getInstanceByDom(chartDom);
        if (existingChart) {
          existingChart.dispose();
        }

        const myChart = echarts.init(chartDom);
        this.charts.push(myChart); // 保存图表实例

        // 准备数据
        const xAxisData = result.chartData.map(item => item.chineseName);
        const seriesData = result.chartData.map(item => ({
          value: (item.value * 100).toFixed(1),
          itemStyle: {
            color: item.isPredicted ? '#ff6b6b' : '#39affd'
          }
        }));

        // 图表配置
        const option = {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
            formatter: function(params) {
              const data = params[0];
              return `${data.name}: ${data.value}%`;
            }
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "8%",
            top: "3%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: xAxisData,
            axisLabel: {
              interval: 0,
              rotate: 30,
              color: "#8dd1fe",
              fontSize: 10,
            },
            axisTick: {
              alignWithLabel: true,
              lineStyle: {
                color: "#8dd1fe",
              },
            },
            axisLine: {
              lineStyle: {
                color: "#8dd1fe",
              },
            },
          },
          yAxis: {
            type: "value",
            name: "概率 (%)",
            nameTextStyle: {
              color: "#8dd1fe",
            },
            axisLabel: {
              color: "#8dd1fe",
              formatter: "{value}%",
            },
            axisLine: {
              lineStyle: {
                color: "#8dd1fe",
              },
            },
            splitLine: {
              lineStyle: {
                color: "rgba(57, 175, 253, 0.2)",
              },
            },
          },
          series: [
            {
              name: "疾病概率",
              type: "bar",
              barWidth: "60%",
              data: seriesData,
              label: {
                show: true,
                position: "top",
                formatter: "{c}%",
                color: "#8dd1fe",
              },
            },
          ],
        };

        myChart.setOption(option);
        
        // 确保图表正常显示
        myChart.resize();

        // 响应窗口大小变化
        window.addEventListener("resize", () => {
          myChart.resize();
        });
        
        console.log(`图表 ${chartId} 已初始化`);
      });
    },

    getTagType(disease) {
      if (disease === "Normal") return "success";
      const diseaseTypes = {
        AMD: "danger",
        Glaucoma: "danger",
        Diabetes: "warning",
        Cataract: "warning",
        Hypertension: "warning",
        Myopia: "info",
        Other: "info",
      };
      return diseaseTypes[disease] || "danger";
    },
  },
  // 当组件销毁时清理图表实例
  beforeDestroy() {
    this.charts.forEach(chart => {
      chart.dispose();
    });
    this.charts = [];
  }
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

/* 新的结果面板样式 */
.result-panel {
  background: rgba(13, 28, 64, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(57, 175, 253, 0.3);
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
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

.panel-content {
  display: flex;
  padding: 20px;
}

.result-image-container {
  width: 30%;
  min-width: 250px;
  padding-right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.result-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
  background-color: #000;
}

.result-data-container {
  flex: 1;
  min-width: 0; /* 避免弹性盒子溢出 */
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
  background: rgba(16, 32, 67, 0.3);
  border-radius: 8px;
  padding: 10px;
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

.analysis-conclusion {
  display: flex;
  align-items: center;
  background: rgba(16, 32, 67, 0.5);
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  color: #3dfd7d;
  font-weight: bold;
}

.analysis-conclusion.abnormal {
  color: #ff6b6b;
}

.analysis-conclusion i {
  margin-right: 10px;
  font-size: 20px;
}

/* 结果对照布局 */
.result-layout {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 20px;
}

.result-panel {
  background: rgba(13, 28, 64, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(57, 175, 253, 0.3);
  box-shadow: 0 0 15px rgba(57, 175, 253, 0.1);
  overflow: hidden;
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

  .result-layout {
    flex-direction: column;
  }

  .panel-content {
    flex-direction: column;
  }

  .result-image-container {
    width: 100%;
    padding-right: 0;
    padding-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .disease-types {
    flex-direction: column;
  }
  
  .disease-tag {
    margin-bottom: 5px;
  }
}
</style>

