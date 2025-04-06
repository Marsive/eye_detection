<template>
  <div class="llm-container">
    <!-- 标题区域 -->
    <div class="llm-header">
      <div class="tech-line left"></div>
      <h1><span class="highlight">Deepdetect</span></h1>
      <div class="tech-line right"></div>
    </div>

    <!-- 主体聊天区域 -->
    <div class="chat-container">
      <!-- 左侧会话列表 -->
      <div class="conversation-list">
        <div class="list-header">
          <h3>对话记录</h3>
          <el-button
            type="primary"
            class="new-chat-btn"
            icon="el-icon-plus"
            @click="createNewChat"
          >
            新建会话
          </el-button>
        </div>

        <div class="conversation-items">
          <div
            v-for="(chat, index) in chatHistory"
            :key="index"
            :class="['conversation-item', activeChat === index ? 'active' : '']"
            @click="switchChat(index)"
          >
            <i class="el-icon-chat-dot-round"></i>
            <div class="chat-info">
              <div class="chat-title">会话{{ index + 1 }}</div>
              <div class="chat-time">{{ chat.timestamp }}</div>
            </div>
            <div class="chat-actions">
              <i class="el-icon-more" @click.stop="showChatOptions(index)"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天内容区域 -->
      <div class="chat-content">
        <!-- 消息列表 -->
        <div class="message-list" ref="messageList">
          <template v-if="currentMessages.length > 0">
            <div
              v-for="(message, index) in currentMessages"
              :key="index"
              :class="[
                'message-item',
                message.role === 'user' ? 'user-message' : 'ai-message',
              ]"
            >
              <div class="message-avatar">
                <i
                  :class="
                    message.role === 'user' ? 'el-icon-user' : 'el-icon-cpu'
                  "
                ></i>
              </div>
              <div class="message-content">
                <div class="message-text" v-if="message.role === 'user'">
                  {{ message.content }}
                </div>
                <div
                  class="message-text markdown-content"
                  v-else-if="!message.isLoading"
                  v-html="parseMarkdown(message.content)"
                ></div>
                <div class="message-text loading-message" v-else>
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
                <!-- <div v-if="message.hasImage" class="message-image">
                  <img :src="message.imageUrl" alt="图像" />
                </div> -->
                <div class="message-time">{{ message.timestamp }}</div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="empty-chat">
              <div class="empty-icon">
                <i class="el-icon-chat-line-round"></i>
              </div>
              <h3>开始与AI助手对话</h3>
              <p>询问有关眼疾诊断、图像分析或医学知识的问题</p>

              <div class="suggestion-chips">
                <div
                  class="chip"
                  @click="usePrompt('解释一下糖尿病视网膜病变的特征')"
                >
                  解释一下糖尿病视网膜病变的特征
                </div>
                <div
                  class="chip"
                  @click="usePrompt('如何区分青光眼和白内障？')"
                >
                  如何区分青光眼和白内障？
                </div>
                <div
                  class="chip"
                  @click="usePrompt('分析眼底图像中的异常区域')"
                >
                  分析眼底图像中的异常区域
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-container">
          <div v-if="uploadedImage" class="image-preview-container">
            <div class="image-preview">
              <img :src="uploadedImage" alt="预览图像" />
              <div class="image-actions" @click="removeUploadedImage">
                <i class="el-icon-close"></i>
              </div>
            </div>
          </div>

          <div class="chat-input-wrapper">
            <textarea
              class="chat-input"
              v-model="inputMessage"
              placeholder="请输入内容，Shift + Enter 换行"
              @keydown.shift.enter.exact.prevent="handleShiftEnter"
              @keydown.enter.exact.prevent="sendMessage()"
              @keydown.shift="isShiftPressed = true"
              @keyup.shift="isShiftPressed = false"
            ></textarea>

            <div class="input-actions">
              <div class="upload-btn" @click="triggerImageUpload">
                <i class="el-icon-picture-outline"></i>
              </div>
              <input
                type="file"
                ref="imageInput"
                style="display: none"
                accept="image/*"
                @change="handleImageUpload"
              />
              <div style="flex: 1"></div>
              <el-button
                type="primary"
                class="send-btn"
                :disabled="!inputMessage.trim()"
                @click="sendMessage"
              >
                发送
                <i class="el-icon-s-promotion"></i>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from "@/api/ApiClient";
import MarkdownIt from "markdown-it";

export default {
  name: "LLMService",
  data() {
    return {
      chatHistory: [],
      activeChat: 0,
      inputMessage: "",
      isLoading: false,
      isShiftPressed: false,
      md: new MarkdownIt(),
      uploadedImage: null,
      uploadedFile: null,
      sessionIds: {},
    };
  },
  computed: {
    currentMessages() {
      return this.chatHistory[this.activeChat]?.messages || [];
    },
  },
  created() {
    // 初始化一个默认会话
    if (this.chatHistory.length === 0) {
      this.createNewChat();
    }
  },
  methods: {
    createNewChat() {
      const now = new Date();
      const timestamp = `${now.getFullYear()}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")} ${now
        .getHours()
        .toString()
        .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;

      const chatIndex = this.chatHistory.length;
      const sessionId =
        "session_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 9);

      this.chatHistory.push({
        timestamp,
        messages: [],
      });

      this.$set(this.sessionIds, chatIndex, sessionId);

      this.activeChat = chatIndex;
    },
    switchChat(index) {
      this.activeChat = index;
    },
    showChatOptions(index) {
      // 实现会话选项菜单
      this.$confirm("是否删除此会话?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.chatHistory.splice(index, 1);
          if (this.chatHistory.length === 0) {
            this.createNewChat();
          } else if (this.activeChat >= this.chatHistory.length) {
            this.activeChat = this.chatHistory.length - 1;
          }
        })
        .catch(() => {});
    },
    handleEnter(e) {
      if (e.shiftKey) {
        // Shift + Enter 换行，不发送
        return;
      }
      e.preventDefault();
      this.sendMessage();
    },

    // 获取格式化的时间
    getFormattedTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    },

    // 添加消息到当前会话
    addMessage(message) {
      this.chatHistory[this.activeChat].messages.push(message);
      this.scrollToBottom();
    },

    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messageList) {
          this.$refs.messageList.scrollTop =
            this.$refs.messageList.scrollHeight;
        }
      });
    },

    // 解析markdown内容
    parseMarkdown(content) {
      return this.md.render(content);
    },

    async sendMessage() {
      if (!this.inputMessage.trim() && !this.uploadedFile) return;

      // 添加用户消息
      const userMessage = {
        role: "user",
        content: this.inputMessage,
        timestamp: this.getFormattedTime(),
      };

      if (this.uploadedImage) {
        userMessage.hasImage = true;
        userMessage.imageUrl = this.uploadedImage;
      }

      this.addMessage(userMessage);

      const userContent = this.inputMessage;
      this.inputMessage = "";

      const tempFile = this.uploadedFile;
      this.uploadedImage = null;
      this.uploadedFile = null;

      try {
        this.isLoading = true;

        const loadingMessageId = this.addLoadingMessage();

        const sessionId = this.sessionIds[this.activeChat];

        const formData = new FormData();
        formData.append("prompt", userContent);
        formData.append("session_id", sessionId);

        if (tempFile) {
          formData.append("file", tempFile);
        }

        const response = await fetch("http://127.0.0.1:5000/predict/analysis", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        this.removeLoadingMessage(loadingMessageId);

        if (data.status === "success") {
          const aiMessage = {
            role: "assistant",
            content: data.analysis,
            timestamp: this.getFormattedTime(),
          };

          if (data.processed_file) {
            aiMessage.hasImage = true;
            aiMessage.imageUrl = `http://127.0.0.1:5000/download/${data.processed_file}`;
          }

          this.addMessage(aiMessage);
        } else {
          throw new Error(data.error || "分析失败");
        }
      } catch (error) {
        this.removeAllLoadingMessages();
        this.handleError(error);
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },

    addLoadingMessage() {
      const loadingId = Date.now();
      this.chatHistory[this.activeChat].messages.push({
        id: loadingId,
        role: "assistant",
        content: "思考中...",
        timestamp: this.getFormattedTime(),
        isLoading: true,
      });
      this.scrollToBottom();
      return loadingId;
    },

    removeLoadingMessage(id) {
      const messages = this.chatHistory[this.activeChat].messages;
      const index = messages.findIndex((msg) => msg.id === id && msg.isLoading);
      if (index !== -1) {
        messages.splice(index, 1);
      }
    },

    removeAllLoadingMessages() {
      const messages = this.chatHistory[this.activeChat].messages;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].isLoading) {
          messages.splice(i, 1);
        }
      }
    },

    handleError(error) {
      console.error("API Error:", error);
      const errorMsg =
        error.response?.data?.error || "服务暂时不可用，请稍后再试";

      this.addMessage({
        role: "system",
        content: `错误：${errorMsg}`,
        timestamp: this.getFormattedTime(),
      });
    },

    usePrompt(prompt) {
      this.inputMessage = prompt;
    },
    uploadImage() {
      this.$message.info("图像上传功能即将推出，敬请期待！");
    },
    handleShiftEnter(e) {
      return;
    },
    triggerImageUpload() {
      if (this.isLoading) return;
      this.$refs.imageInput.click();
    },
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (!this.validateImageFile(file)) {
        return;
      }

      this.uploadedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage = e.target.result;
      };
      reader.readAsDataURL(file);

      this.$refs.imageInput.value = "";
    },
    validateImageFile(file) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 16 * 1024 * 1024;

      if (!isValidType) {
        this.$message.error("只能上传PNG、JPG、JPEG或GIF格式图片!");
        return false;
      }

      if (!isValidSize) {
        this.$message.error("图片大小不能超过16MB!");
        return false;
      }

      return true;
    },
    removeUploadedImage() {
      this.uploadedImage = null;
      this.uploadedFile = null;
    },
  },
};
</script>

<style scoped>
.llm-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.llm-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.llm-header h1 {
  color: #39affd;
  font-size: 28px;
  margin: 0 15px;
  text-shadow: 0 0 10px rgba(57, 175, 253, 0.5);
}

.llm-header .highlight {
  color: #8dd1fe;
}

.tech-line {
  height: 2px;
  width: 150px;
  background: linear-gradient(
    90deg,
    rgba(57, 175, 253, 0),
    rgba(57, 175, 253, 0.8),
    rgba(57, 175, 253, 0)
  );
  position: relative;
}

.tech-line::before,
.tech-line::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #39affd;
  top: -2px;
  box-shadow: 0 0 8px 2px rgba(57, 175, 253, 0.6);
}

.tech-line.left::after {
  right: 0;
}

.tech-line.right::before {
  left: 0;
}

.chat-container {
  display: flex;
  flex: 1;
  background: rgba(13, 28, 64, 0.5);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(57, 175, 253, 0.3);
}

.conversation-list {
  width: 280px;
  background: rgba(16, 32, 67, 0.7);
  border-right: 1px solid rgba(57, 175, 253, 0.3);
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 15px;
  border-bottom: 1px solid rgba(57, 175, 253, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  color: #8dd1fe;
  font-size: 16px;
}

.new-chat-btn {
  background: rgba(57, 175, 253, 0.2);
  border: 1px solid rgba(57, 175, 253, 0.4);
  color: #8dd1fe;
  padding: 7px 12px;
  font-size: 12px;
}

.new-chat-btn:hover {
  background: rgba(57, 175, 253, 0.3);
  border-color: rgba(57, 175, 253, 0.6);
}

.conversation-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid transparent;
}

.conversation-item:hover {
  background: rgba(57, 175, 253, 0.1);
}

.conversation-item.active {
  background: rgba(57, 175, 253, 0.15);
  border-color: rgba(57, 175, 253, 0.3);
}

.conversation-item i {
  color: #39affd;
  font-size: 18px;
  margin-right: 10px;
}

.chat-info {
  flex: 1;
  overflow: hidden;
}

.chat-title {
  color: #8dd1fe;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  color: rgba(141, 209, 254, 0.6);
  font-size: 12px;
  margin-top: 4px;
}

.chat-actions {
  color: rgba(141, 209, 254, 0.6);
  font-size: 16px;
  visibility: hidden;
  transition: all 0.2s ease;
}

.conversation-item:hover .chat-actions {
  visibility: visible;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;
}

.user-message {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.user-message .message-avatar {
  margin-right: 0;
  margin-left: 12px;
  background: rgba(57, 175, 253, 0.2);
  border: 1px solid rgba(57, 175, 253, 0.4);
}

.ai-message .message-avatar {
  background: rgba(141, 209, 254, 0.2);
  border: 1px solid rgba(141, 209, 254, 0.4);
}

.message-avatar i {
  font-size: 18px;
}

.user-message .message-avatar i {
  color: #39affd;
}

.ai-message .message-avatar i {
  color: #8dd1fe;
}

.message-content {
  max-width: 80%;
  display: flex;
  flex-direction: column;
}

.user-message .message-content {
  align-items: flex-end;
}

.message-text {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.user-message .message-text {
  background: rgba(57, 175, 253, 0.1);
  border: 1px solid rgba(57, 175, 253, 0.2);
  color: #fff;
  border-top-right-radius: 0;
}

.ai-message .message-text {
  background: rgba(141, 209, 254, 0.1);
  border: 1px solid rgba(141, 209, 254, 0.2);
  color: #fff;
  border-top-left-radius: 0;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

.markdown-content :deep(code) {
  font-family: Monaco, Consolas, "Courier New", monospace;
}

.markdown-content :deep(p) {
  margin: 8px 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 20px;
}

.markdown-content :deep(a) {
  color: #39affd;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid rgba(57, 175, 253, 0.5);
  padding-left: 10px;
  margin-left: 0;
  color: rgba(255, 255, 255, 0.8);
}

.message-time {
  font-size: 12px;
  margin-top: 4px;
  color: rgba(141, 209, 254, 0.6);
  align-self: flex-end;
}

.chat-input-container {
  padding: 15px;
  background: rgba(10, 25, 54, 0.7);
  border-top: 1px solid rgba(57, 175, 253, 0.3);
  position: relative;
}

.chat-input-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(57, 175, 253, 0),
    rgba(57, 175, 253, 0.5),
    rgba(57, 175, 253, 0)
  );
}

.chat-input-wrapper {
  background: rgba(16, 32, 67, 0.6);
  border: 1px solid rgba(57, 175, 253, 0.3);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2), 0 0 5px rgba(57, 175, 253, 0.2) inset;
  transition: all 0.3s ease;
}

.chat-input-wrapper:focus-within {
  border-color: rgba(57, 175, 253, 0.6);
  box-shadow: 0 0 20px rgba(57, 175, 253, 0.2),
    0 0 10px rgba(57, 175, 253, 0.1) inset;
}

.chat-input {
  width: 100%;
  min-height: 60px;
  max-height: 150px;
  padding: 12px 15px;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  resize: none;
  line-height: 1.5;
}

.chat-input::placeholder {
  color: rgba(141, 209, 254, 0.5);
}

.input-actions {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background: rgba(13, 28, 64, 0.7);
  border-top: 1px solid rgba(57, 175, 253, 0.2);
  width: 100%;
  justify-content: space-between;
}

.upload-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(57, 175, 253, 0.1);
  color: #8dd1fe;
  cursor: pointer;
  margin-right: 10px;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background: rgba(57, 175, 253, 0.2);
  color: #39affd;
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

.upload-btn i {
  font-size: 20px;
}

.send-btn {
  background: linear-gradient(to right, #3077b1, #39affd);
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-right: 20px;
}

.send-btn:hover:not(:disabled) {
  background: linear-gradient(to right, #39affd, #3077b1);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(57, 175, 253, 0.3);
}

.send-btn:disabled {
  background: rgba(57, 175, 253, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.send-btn i {
  margin-left: 5px;
  font-size: 16px;
}

.key-hint {
  display: inline-block;
  background: rgba(57, 175, 253, 0.1);
  border: 1px solid rgba(57, 175, 253, 0.3);
  border-radius: 4px;
  padding: 0 6px;
  font-size: 12px;
  color: #8dd1fe;
  margin-left: 5px;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(141, 209, 254, 0.7);
  text-align: center;
  padding: 0 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: #39affd;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

.empty-chat h3 {
  font-size: 22px;
  margin-bottom: 10px;
  color: #8dd1fe;
}

.empty-chat p {
  font-size: 14px;
  margin-bottom: 30px;
  max-width: 400px;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 600px;
}

.chip {
  background: rgba(57, 175, 253, 0.1);
  border: 1px solid rgba(57, 175, 253, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chip:hover {
  background: rgba(57, 175, 253, 0.2);
  border-color: rgba(57, 175, 253, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(57, 175, 253, 0.2);
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(13, 28, 64, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(57, 175, 253, 0.4);
  border-radius: 4px;
  transition: all 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(57, 175, 253, 0.6);
}

/* 加载中消息动画 */
.loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  min-width: 60px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(141, 209, 254, 0.8);
  margin: 0 3px;
  animation: dot-pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0%,
  60%,
  100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.conversation-items,
.message-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(57, 175, 253, 0.4) rgba(13, 28, 64, 0.3);
}

.ai-message .loading-message {
  background: rgba(141, 209, 254, 0.1);
  border: 1px solid rgba(141, 209, 254, 0.2);
  color: #fff;
  border-top-left-radius: 0;
}

.chat-input-wrapper {
  background: rgba(16, 32, 67, 0.6);
  border: 1px solid rgba(57, 175, 253, 0.3);
  border-radius: 8px;
  padding: 10px;
}

.chat-input {
  width: 100%;
  min-height: 60px;
  max-height: 150px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  resize: none;
  outline: none;
  padding: 5px;
}

.input-actions {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.upload-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(57, 175, 253, 0.1);
  border: 1px solid rgba(57, 175, 253, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: rgba(57, 175, 253, 0.2);
}

.upload-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-btn i {
  color: #39affd;
  font-size: 18px;
}

.send-btn {
  background: rgba(57, 175, 253, 0.2);
  border: 1px solid rgba(57, 175, 253, 0.4);
  color: #8dd1fe;
}

.send-btn:hover {
  background: rgba(57, 175, 253, 0.3);
  border-color: rgba(57, 175, 253, 0.6);
}

/* Image preview styles */
.image-preview-container {
  margin-bottom: 10px;
  padding: 0 5px;
}

.image-preview {
  position: relative;
  display: inline-block;
  max-width: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(57, 175, 253, 0.3);
}

.image-preview img {
  width: 100%;
  max-height: 150px;
  object-fit: contain;
  display: block;
}

.image-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-actions:hover {
  background: rgba(0, 0, 0, 0.7);
}

.image-actions i {
  color: #fff;
  font-size: 14px;
}

/* Message image styles */
.message-image {
  margin-top: 8px;
  max-width: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(57, 175, 253, 0.3);
}

.message-image img {
  width: 100%;
  max-height: 150px;
  object-fit: contain;
  display: block;
}

/* Loading animation */
.loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  background: #8dd1fe;
  border-radius: 50%;
  margin: 0 3px;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Empty chat state */
.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(141, 209, 254, 0.6);
  text-align: center;
  padding: 20px;
}

.empty-icon {
  font-size: 48px;
  color: rgba(57, 175, 253, 0.3);
  margin-bottom: 20px;
}

.empty-chat h3 {
  color: #8dd1fe;
  margin-bottom: 10px;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
}

.chip {
  background: rgba(57, 175, 253, 0.1);
  border: 1px solid rgba(57, 175, 253, 0.3);
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 13px;
  color: #8dd1fe;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip:hover {
  background: rgba(57, 175, 253, 0.2);
  border-color: rgba(57, 175, 253, 0.5);
}
</style>