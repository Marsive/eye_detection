<template>

  <div id="background-container">
    <vue-particles
        class="login-bg"
      color="#39AFFD"
      :particleOpacity="0.2"
      :particlesNumber="100"
      shapeType="circle"
      :particleSize="5"
      linesColor="#8DD1FE"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.4"
      :linesDistance="150"
      :moveSpeed="3"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="push"
      >
      </vue-particles>
  </div>
</template>

<script>
export default {
  data(){
    return {

    }
  },
  components: {
  },
};
</script>


<style>
#particles-js{
  width: 99vw;
  height: 97vh;
  position: absolute;
  z-index: -1;
}
#background-container{
  width: 99vw;
  min-height: 100vh;
  position: absolute;
  z-index: -1;
  background: #051231;
}
</style>