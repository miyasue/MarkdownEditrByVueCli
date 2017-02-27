<template>
  <div id="app">
    <div class="menu">
      MENU
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  components: {
  }
}
</script>

<style>
html, body {
  margin: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  bottom: 0;
  overflow: hidden;
}
.menu {
  display: flex;
  background-color: #7f7fff;
  padding: 15px;
}
</style>
