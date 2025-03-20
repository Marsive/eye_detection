# 智能眼疾识别平台

![Python Version](https://img.shields.io/badge/python-3.7%2B-blue)
![License](https://img.shields.io/badge/License-MulanPSL2-green)

基于深度学习的智能眼疾识别系统，提供高效的眼部疾病检测和分类功能。支持多种常见眼疾的识别，助力医疗影像分析。

## 功能特性

- 支持视网膜图像分类
- 多种常见眼疾识别（糖尿病视网膜病变、青光眼等）
- 基于深度学习的图像分析模型
- 可视化检测结果输出
- 支持批量图像处理
- 模型性能评估模块

基于Vue2+SpringBoot+MyBatis的智能医疗平台，实现视网膜图像分析、眼疾检测和可视化报告生成。

## 技术架构
### 前端技术栈
- ​**Vue2**：渐进式前端框架[2,3](@ref)
- ​**Vue Router**：SPA路由管理[1,4](@ref)
- ​**Axios**：RESTful API调用
- ​**Element UI**：可视化组件库[3](@ref)

### 后端技术栈
- ​**SpringBoot 2**：快速开发框架[8](@ref)
- ​**MyBatis 3**：持久层框架[9,10](@ref)
- ​**MySQL 8**：关系型数据库
- ​**Redis 6**：缓存服务



## 安装指南

### 环境要求
- Python 3.7+
- PyTorch 1.8+
- OpenCV 4.2+
- NumPy
- Pillow

### 安装步骤
1. 克隆仓库：
```bash
git clone https://github.com/Marsive/eye_detection.git
cd eye_detection
