# 医学影像分析平台 API 接口文档

## 一、简介

医学影像分析平台API提供包括影像分割、智能分析、低光增强和疾病分类的服务，基于Flask和PyTorch开发，适用于医学影像处理与诊断辅助。

## 二、接口列表

### 1. 影像分割接口

- **路径**: `/predict/segmentation`
- **方法**: `POST`
- **描述**: 根据图片尺寸自动选择合适的模型进行影像分割。
- **请求参数**:
  - 文件字段名：`file` (支持格式：PNG, JPG, JPEG, GIF)
- **响应示例**:

```json
{
  "message": "Prediction completed",
  "output": "prediction_example.png"
}
```

### 2. 智能分析接口

- **路径**: `/predict/analysis`
- **方法**: `POST`
- **描述**: 使用预训练大语言模型进行医学影像分析，可进行连续对话。
- **请求参数**:
  - 文件字段名：`file` (可选)
  - 字符串字段：
    - `prompt`: 分析提示词
    - `session_id`: 对话会话标识
- **响应示例**:

```json
{
  "status": "success",
  "analysis": "视网膜未见明显异常。",
  "processed_file": "image.png",
  "history": [
    {"role": "user", "content": "请分析是否有视网膜病变"},
    {"role": "assistant", "content": "视网膜未见明显异常。"}
  ]
}
```

### 3. 低光增强接口

- **路径**: `/predict/lowlight`
- **方法**: `POST`
- **描述**: 使用RetinexFormer对上传的医学影像进行低光环境下的增强。
- **请求参数**:
  - 文件字段名：`file`（支持多张上传）
- **响应示例**:

```json
{
  "message": "Lowlight enhancement completed",
  "outputs": ["enhanced_img1.jpg", "enhanced_img2.jpg"]
}
```

### 4. 多标签疾病分类接口

- **路径**: `/predict/class`
- **方法**: `POST`
- **描述**: 基于ResNet_CSRA模型进行多标签分类预测。
- **请求参数**:
  - 文件字段名：`file`（支持多张上传）
  - 字符串字段（可选）：
    - `threshold_strategy`: 阈值策略（micro, macro, per_class），默认`per_class`
- **响应示例**:

```json
{
  "message": "Classification completed",
  "results": [
    {
      "filename": "eye_img.jpg",
      "predicted_classes": ["AMD", "Glaucoma"],
      "confidence": 0.97,
      "all_probs": [0.97, 0.20, 0.15, 0.88, 0.10, 0.05, 0.02, 0.30]
    }
  ]
}
```

### 5. 文件下载接口

- **路径**: `/download/<filename>`
- **方法**: `GET`
- **描述**: 下载处理后的医学影像文件。

## 三、注意事项

- 上传文件的最大大小为16MB。
- 上传图像文件应为支持的格式：PNG, JPG, JPEG, GIF。
- 大语言模型接口支持连续对话，确保session_id的一致性。

## 四、错误响应

通用错误示例:

```json
{
  "error": "具体错误描述信息"
}
```

## 五、技术说明

- 影像分割：使用FarMamba模型。
- 智能分析：基于OLLAMA接口调用本地微调后大语言模型。
- 低光增强：RetinexFormer模型，GPU优化。
- 疾病分类：ResNet_CSRA模型，多标签输出。

## 六、依赖与运行

- Python环境，Flask，Flask-RESTX，PyTorch。
- GPU推荐用于图像增强和分类任务。

## 七、Swagger文档

访问路径：`/docs/`