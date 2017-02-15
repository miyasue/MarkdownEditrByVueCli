<template>
  <div id="app">
    <textarea placeholder="# Hello" :value="rawText" @input="update" :rows="rows"></textarea>
    <div v-html="markedText"></div>
    <div id="menu">
      <button v-on:click="save()">SAVE</button>
      <button v-on:click="load()">LOAD</button>
    </div>
  </div>
</template>

<script>

var marked = require('marked');
var store = require('store')

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
      // var html = hl("for(var i=0;i<10;i++)alert(i);");
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
      store.set('rawText', this.rawText);

    },
    load: function () {
      var a = store.get('rawText')
      this.rawText = a;
    }
  }
}

</script>

<style>
html, body, #app {
  margin: 0;
  height: 95vh;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

div#menu {
    display: flex;
}

textarea, #app div {
  display: inline-block;
  width: 49%;
  height: 95vh;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 20px;
}

textarea {
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #f4f9ff;
  font-size: 14px;
  font-family: 'Monaco', courier, monospace;
  padding: 20px;
}

code {
  color: #f66;
}
</style>
