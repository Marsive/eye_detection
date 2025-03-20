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
            @click="createNewChat">
            新建会话
          </el-button>
        </div>
        
        <div class="conversation-items">
          <div 
            v-for="(chat, index) in chatHistory" 
            :key="index"
            :class="['conversation-item', activeChat === index ? 'active' : '']"
            @click="switchChat(index)">
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
              :class="['message-item', message.role === 'user' ? 'user-message' : 'ai-message']">
              <div class="message-avatar">
                <i :class="message.role === 'user' ? 'el-icon-user' : 'el-icon-cpu'"></i>
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
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
                <div class="chip" @click="usePrompt('解释一下糖尿病视网膜病变的特征')">
                  解释一下糖尿病视网膜病变的特征
                </div>
                <div class="chip" @click="usePrompt('如何区分青光眼和白内障？')">
                  如何区分青光眼和白内障？
                </div>
                <div class="chip" @click="usePrompt('分析眼底图像中的异常区域')">
                  分析眼底图像中的异常区域
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <!-- 输入区域 -->
        <div class="chat-input-container">
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
              <div style="flex: 1;"></div>
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
export default {
  name: 'LLMService',
  data() {
    return {
      chatHistory: [],
      activeChat: 0,
      inputMessage: '',
      isLoading: false,
      isShiftPressed: false
    }
  },
  computed: {
    currentMessages() {
      return this.chatHistory[this.activeChat]?.messages || [];
    }
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
      const timestamp = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      this.chatHistory.push({
        timestamp,
        messages: []
      });
      
      this.activeChat = this.chatHistory.length - 1;
    },
    switchChat(index) {
      this.activeChat = index;
    },
    showChatOptions(index) {
      // 实现会话选项菜单
      this.$confirm('是否删除此会话?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.chatHistory.splice(index, 1);
        if (this.chatHistory.length === 0) {
          this.createNewChat();
        } else if (this.activeChat >= this.chatHistory.length) {
          this.activeChat = this.chatHistory.length - 1;
        }
      }).catch(() => {});
    },
    handleEnter(e) {
      if (e.shiftKey) {
        // Shift + Enter 换行，不发送
        return;
      }
      e.preventDefault();
      this.sendMessage();
    },
    sendMessage() {
      if (!this.inputMessage.trim()) return;
      
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // 添加用户消息
      this.chatHistory[this.activeChat].messages.push({
        role: 'user',
        content: this.inputMessage,
        timestamp
      });
      
      const userMessage = this.inputMessage;
      this.inputMessage = '';
      
      // 滚动到底部
      this.$nextTick(() => {
        if (this.$refs.messageList) {
          this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight;
        }
      });
      
      // 模拟AI响应
      this.isLoading = true;
      setTimeout(() => {
        const aiResponse = this.generateResponse(userMessage);
        const responseTime = new Date();
        const responseTimestamp = `${responseTime.getHours().toString().padStart(2, '0')}:${responseTime.getMinutes().toString().padStart(2, '0')}`;
        
        this.chatHistory[this.activeChat].messages.push({
          role: 'assistant',
          content: aiResponse,
          timestamp: responseTimestamp
        });
        
        this.isLoading = false;
        
        // 滚动到底部
        this.$nextTick(() => {
          if (this.$refs.messageList) {
            this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight;
          }
        });
      }, 1000);
    },
    generateResponse(message) {
      // 简单的响应生成逻辑
      if (message.includes('糖尿病') || message.includes('视网膜病变')) {
        return '糖尿病视网膜病变是糖尿病的常见并发症，特征包括微血管瘤、出血点、硬性渗出、棉絮斑、新生血管等。早期可能没有明显症状，但随着病情进展可能导致视力下降甚至失明。定期眼底检查对早期发现和治疗至关重要。';
      } else if (message.includes('青光眼') || message.includes('白内障')) {
        return '青光眼和白内障是两种不同的眼部疾病。青光眼主要是由于眼内压升高导致视神经损伤，症状包括视野缺损、眼痛等；白内障则是晶状体混浊导致视力模糊、视物变形等。诊断需要专业眼科检查，包括眼压测量、视野检查、裂隙灯检查等。';
      } else if (message.includes('眼底') || message.includes('图像')) {
        return '眼底图像分析是眼科诊断的重要手段。异常区域可能包括出血点、渗出物、微血管瘤等。我们的AI系统可以帮助识别这些异常区域，提高诊断准确性。建议上传眼底图像以获取更精确的分析结果。';
      } else {
        return '作为眼科AI助手，我可以回答关于眼疾诊断、治疗和预防的问题。您可以询问特定眼病的症状、诊断方法，或者上传眼底图像进行分析。';
      }
    },
    usePrompt(prompt) {
      this.inputMessage = prompt;
    },
    uploadImage() {
      this.$message.info('图像上传功能即将推出，敬请期待！');
    },
    handleShiftEnter(e) {
      // Shift + Enter 换行，不发送
      return;
    },
    triggerImageUpload() {
      this.$refs.imageInput.click();
    },
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.uploadImage();
      }
    }
  }
}
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
  color: #39AFFD;
  font-size: 28px;
  margin: 0 15px;
  text-shadow: 0 0 10px rgba(57, 175, 253, 0.5);
}

.llm-header .highlight {
  color: #8DD1FE;
}

.tech-line {
  height: 2px;
  width: 150px;
  background: linear-gradient(90deg, rgba(57, 175, 253, 0), rgba(57, 175, 253, 0.8), rgba(57, 175, 253, 0));
  position: relative;
}

.tech-line::before, .tech-line::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #39AFFD;
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
  color: #8DD1FE;
  font-size: 16px;
}

.new-chat-btn {
  background: rgba(57, 175, 253, 0.2);
  border: 1px solid rgba(57, 175, 253, 0.4);
  color: #8DD1FE;
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
  color: #39AFFD;
  font-size: 18px;
  margin-right: 10px;
}

.chat-info {
  flex: 1;
  overflow: hidden;
}

.chat-title {
  color: #8DD1FE;
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
  color: #39AFFD;
}

.ai-message .message-avatar i {
  color: #8DD1FE;
}

.message-content {
  max-width: 80%;
  display: flex;
  flex-direction: column;
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
}

.ai-message .message-text {
  background: rgba(141, 209, 254, 0.1);
  border: 1px solid rgba(141, 209, 254, 0.2);
  color: #fff;
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
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, 
    rgba(57, 175, 253, 0), 
    rgba(57, 175, 253, 0.5), 
    rgba(57, 175, 253, 0));
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
  box-shadow: 0 0 20px rgba(57, 175, 253, 0.2), 0 0 10px rgba(57, 175, 253, 0.1) inset;
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
  color: #8DD1FE;
  cursor: pointer;
  margin-right: 10px;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background: rgba(57, 175, 253, 0.2);
  color: #39AFFD;
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
  color: #8DD1FE;
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
  color: #39AFFD;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
}

.empty-chat h3 {
  font-size: 22px;
  margin-bottom: 10px;
  color: #8DD1FE;
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
</style>