<template>
  <div id="app">
    <div id="menu" class="hogeMenu" style="display: flex; background-color: #2d4e6f; padding: 15px;">
      <button v-on:click="save()">SAVE</button>
      <button v-on:click="load()">LOAD</button>
      <button v-on:click="loadFile('test.md')">LOAD TEST FILE</button>
    </div>
    <div class="wrap-editArea">
      <textarea class="edit-mdArea" placeholder="# Hello" :value="rawText" @input="update" :rows="rows"></textarea>
      <div class="view-text" v-html="markedText"></div>
    </div>
  </div>
</template>

<script>

var marked = require('marked');
var store = require('store')
var axios = require('axios')

export default {
  name: 'app',
  data () {
    return {
      rawText: ''
    }
  },
  computed: {
    markedText: function () {
      var html =  marked(this.rawText, { sanitize: false })
      return html
    },
    rows:function(){
        var num = this.rawText.split("\n").length;
        return (num > 4) ? num : 4;
    }
  },
  methods: {
    update: function (e) {
      this.rawText = e.target.value
    },
    save: function () {
      store.set('rawText', this.rawText)
    },
    load: function () {
      this.rawText = store.get('rawText')
    },
    loadFile: function (filename) {
      console.log(filename);
      axios.get('./static/md/' + filename).then((response) => {
        this.rawText = response.data
      }).catch((response) => {
      });
    }
  }
}

</script>

<style>
html, body {
  margin: 0;
  height: 100%;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

#app {
  height: 100vh;
  overflow: hidden;
}
 
 
.hogeMenu {
  display: flex;
  background-color: #000;
￼  padding: 15px;
  display: flex !important;
  background-color: #2d4e6f !important;
  padding: 15px !important;
}
.wrap-editArea {
  display: flex;
  width: 100%;
  height: 100%;
}
.edit-mdArea {
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #f4f9ff;
  font-size: 14px;
  font-family: 'Monaco', courier, monospace;
  padding: 20px;
  width: 50%;
  height: 100%;
}
.view-text {
  padding:20px;
  box-sizing: border-box;
}

/*textarea, #app div {
  display: inline-block;
  width: 49%;
  height: 100%;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 20px;
}*/

/*textarea {
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #f4f9ff;
  font-size: 14px;
  font-family: 'Monaco', courier, monospace;
  padding: 20px;
}*/

code {
  color: #f66;
}
</style>
