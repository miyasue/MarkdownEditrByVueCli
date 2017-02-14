<template>
  <div id="app">
    <div v-html="markedText"></div>
    <textarea :value="rawText" @input="update" :rows="rows"></textarea>
  </div>
</template>

<script>

var marked = require('marked');
export default {
  name: 'app',
  data () {
    return {
      rawText: ''
    }
  },
  computed: {
    markedText: function () {
      return marked(this.rawText, { sanitize: true })
    },
    rows:function(){
        var num = this.rawText.split("\n").length;
        return (num > 4) ? num : 4;
    }
  },
  methods: {
    update: function (e) {
      this.rawText = e.target.value
    }
  }
}

</script>

<style>
#app {
  margin: 0;
  height: 100%;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #192f60;
}

textarea {
  border: 1px solid #bcddff;
  background-color: #e5f2ff;
  font-size: 14px;
  display: inline-block;
  width: 100%;
  height: 100%;
  vertical-align: top;
  box-sizing: border-box;
}

</style>
