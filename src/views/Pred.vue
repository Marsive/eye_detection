<template>
  <div class="pred-container">
    <div class="left">
        <div class="title">
          <img src="../assets/logo.png" style="width:80px;height:80px;" alt="">
           LOGO
        </div>
       
    </div>
    <div class="right">
      <div class="top">
        
            <div class="content">
              <div class="title">
              </div>
              
            </div>
       
      </div>
      <div class="top bottom">
        
            <div class="content">
              <div class="title">
              </div>
             
            </div>
      
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pred',
  data(){
    return {

    }
  },
  created(){

  },
  methods:{
   
  },
  components: {
    
  }
}
</script>

<style lang="less" scoped>
  .button{
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;
  }
  button{
    width: 80%;
    height: 100%;
    background: #26fffd;
    color:rgb(0, 0, 0);
    border-radius: 15px;
    
  }
  .pred-container{
    display: flex;
    width: 100%;
    height: 100vh;
    .left{
      width: 800px;
      display: flex;
      flex-direction: column;
      align-items: center;
      .title{
        color:#26fffd;
        margin-top: 80px;
        font-size: 38px;
        font-weight: bold;
      }
      .form{
        margin-top: 35px;
        .form-group{
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          .form-label{
            margin-right: 25px;
            font-size: 18px;
            color:#fff;
          }
          .form-control input{
            border-radius: 15px;
            background: #d3dcf7;
            border: none;
            outline: none;
            padding: 0 5px;
            height: 25px;
            width: 200px;
          }
          .form-control select{
            border-radius: 15px;
            background: #d3dcf7;
            border: none;
            outline: none;
            padding: 0 5px;
            height: 25px;
            width: 210px;
          }
        }
      }
    }
    .right{
      flex: 1;
      .top{
        margin-top: 30px;
        width: 80%;
        // height: 500px;
        .content{
          padding:15px 25px;
          .title{
            display: flex;
            justify-content: center;
            color:#fff;
            font-weight: bold;
            font-size: 18px;
          }
          .word{
            font-size: 20px;
            color:orange;
            margin-top:15px;
            padding:0 20px;
            background: linear-gradient(to right, orange, #26fffd);
            -webkit-background-clip: text; /* 使用文本作为背景剪辑 */
            color: transparent; /* 隐藏文字本身的颜色 */
            display: inline-block; /* 确保渐变应用在文字上 */
          }
        }
      }
      .bottom{
        margin-top: 30px;
        width: 80%;
        height: 200px;
      }
    }
  }
</style>
