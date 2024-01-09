<template>
  <div class="home">
    <transition name="fade" mode="out-in">
     
      <dv-border-box-10
        ><div class="naca">
          <div class="index-header" style="margin-top: 5px">
            <div>
              <dv-decoration-10
                style="width: 450px; height: 1px; margin-bottom: 45px"
              />
              <dv-decoration-8
                style="width: 180px; height: 50px"
                :color="['#568aea', '#000000']"
              />
              <div
                style="
                  width: 150px;
                  color: #eeecec;
                  font-size: 18px;
                  padding: 0 15px;
                  font-weight: bold;
                "
              >
                可视化化平台
              </div>
              <dv-decoration-8
                :reverse="true"
                style="width: 180px; height: 50px"
                :color="['#568aea', '#000000']"
              />
              <dv-decoration-10
                style="
                  width: 450px;
                  height: 1px;
                  transform: rotateY(180deg);
                  margin-bottom: 45px;
                "
              />
            </div>
            <dv-decoration-5
              style="width: 10%; height: 20px"
              :color="['#568aea', '#000000']"
            />
          </div>

          <div class="index-content">
            <div class="left">
              <div class="left-1" style="">
               
                <dv-border-box-12><div style="padding: 5px">
                  <div class="title" style="margin-top: 5px">
                    标题1
                  </div>

                  <div ref="firstMain" style="width: 100%; height: 120px"></div>
                </div></dv-border-box-12>
                <dv-border-box-12><div style="padding: 5px;padding-bottom:30px">
                  <div class="title" style="margin-top: 1px">标题1</div>
                  <dv-capsule-chart
                    
                    style="width: 80%; height: 110px"
                  />
                </div></dv-border-box-12>
                
                <dv-border-box-12><div style="padding: 15px">
                  <div class="title" style="margin-top: 5px">标题1</div>
                  <!-- <div ref="timeZhou" style="width: 100%; height: 350px"></div> -->
                  <div class="row_list" style="">
                    <ul
                      class="cases_list"
                      style="width: 100%; height: 159px; overflow: auto"
                    >
                      
                      </li>
                    </ul>
                  </div>
                </div></dv-border-box-12>
               

                
              </div>
            </div>
            <div class="cents">
              <div class="above">
                <div class="aboveOne">
                  <div style="padding: 15px">
                    <div class="title">标题1</div>
                    <div
                      style="
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        height: 120px;
                        color: #eeecec;
                      "
                    >
                      <div style="display: flex; flex: 1">
                        

                        
                      </div>
                      <div style="display: flex; flex: 1">
                       
                      </div>
                    </div>
                  </div>
                  <div style="padding: 15px">
                    <div class="title" style="margin-top: -30px">
                      标题1
                    </div>
                    <div class="content">
                      
                      <div style="width: 430px; height: 90px"></div>
                    </div>
                  </div>
                </div>
                <div class="aboveTwo">
                  <dv-border-box-12 > <div style="padding: 15px">
                  <div class="title" style="margin-top: 5px">
                    标题1
                  </div>
                  <div id="secondMian" style="width: 100%; height: 110px"></div>
                </div></dv-border-box-12>
                  <dv-border-box-12><div style="padding: 5px">
                    <div class="title" style="margin-top: 5px">
                      标题1
                    </div>
                    <div
                      ref="thirdMain"
                      style="width: 400px; height: 90px"
                    ></div>
                  </div></dv-border-box-12>
                  
                </div>
              </div>
              <div class="below">
                
                  <dv-border-box-12>
                    <div style="padding: 7px">
                      <div class="title" style="margin-top: 5px">
                        标题1
                      </div>
                      <div
                        ref="lastMain"
                        style="width: 100%; height: 200px; margin-top: 25px"
                      ></div>
                    </div>
                  </dv-border-box-12>
                
              </div>
            </div>
          </div></div
      ></dv-border-box-10>
    </transition>
  </div>
</template>

<script>
import $ from "jquery";
import LeftTop from "@/components/LeftTop.vue";
function formatter(number) {
  const numbers = number.toString().split("").reverse();
  const segs = [];

  while (numbers.length) segs.push(numbers.splice(0, 3).join(""));

  return segs.join(",").split("").reverse().join("");
}
export default {
  name: "Index",
  data() {
    return {
    
    };
  },

  components: {
    LeftTop,
  },
};
</script>

<style lang="less" scoped>
.loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.cent-1-content {
  padding: 20px;
  display: flex;
}
.right-content {
  margin-left: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.right-content div {
  display: flex;
  font-size: 15px;
  align-items: center;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.cents {
  display: flex;
  flex-direction: column;
}
.above {
  display: flex;
}
.aboveOne {
  display: flex;
  flex-direction: column;
}
.aboveTwo {
  display: flex;
  flex-direction: column;
}
.cent {
  width: 850px;
  height: 300px;
}

.cent-1 {
  margin: 10px;
  color: aliceblue;
  width: 500px;
  height: 220px;
  /* background-color: rgb(26, 26, 133); */
}

.left {
  display: flex;
  flex-direction: column;
}

.left-1 {
  margin: 15px;
  color: aliceblue;
  width: 550px;
  display: flex;
  flex-direction: column;
}
.left-2 {
  margin: 15px;
  color: aliceblue;
  width: 530px;
  display: flex;
  flex-direction: column;
}

.naca {
  // padding: 35px 15px 0 15px;
  box-sizing: border-box;
  width: 100%;
  // height: 40rem;
  display: flex;
  flex-direction: column;
}
.naca .index-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.naca .index-header div {
  display: flex;
  justify-content: center;
  align-items: center;
}
.naca .index-content {
  display: flex;
  justify-content: center;
  align-items: center;
}
.bg {
  width: 100%;
  height: 45rem;
  background-color: black;
  position: relative;
}
.title {
  color: #3f96a5;
  font-size: 18px;
  margin-top: -20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
}
.content {
  display: flex;
  align-items: center;
}
.content-word {
  width: 140px;
  height: 130px;
  background: #11193e;
  border-radius: 40px;
  border: 1px solid #3d3d3d;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.content-word-item {
  margin-left: 19px;
  margin-bottom: 10px;
  img {
    width: 20px;
    height: 20px;
  }
}
.content-word-item-title {
  font-size: 18px;
}
.content-word-item-content {
  margin-top: 5px;

  display: flex;
  align-items: center;
}
.row_list {
  list-style: none;
}
.cases_list::-webkit-scrollbar {
  display: none;
}

.cases_list li {
  display: grid;
  -ms-grid-columns: 30px 110px 60px 60px 60px 50px 100px;
  grid-template-columns: 30px 110px 60px 60px 60px 50px 100px;
  cursor: pointer;
  margin-left: 23px;
  text-align: center;
  line-height: 30px;
  color: rgb(238, 236, 236);
}
.list_time {
  height: 30px;
  overflow: auto;
}
.list_time::-webkit-scrollbar {
  display: none;
}
</style>