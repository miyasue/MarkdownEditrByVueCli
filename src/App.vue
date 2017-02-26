<template>
  <div id="app">
    <button v-on:click="loadListFromCognito()">リロード</button>
    <select v-model="selected">
      <option v-for="record in records" v-bind:value="record.key">
        {{ record.key }}
      </option>
    </select>

    <input v-model="newRecordName" placeholder="new record name">
    <button v-on:click="newRecord">新規作成</button>
    <div id="menu" class="hogeMenu" style="display: flex; background-color: #2d4e6f; padding: 15px;">
      <button class="menuButton" v-on:click="save()">ローカルセーブ</button>
      <button class="menuButton" v-on:click="load()">ローカルロード</button>
      <!-- <button class="menuButton" v-on:click="loadFile('test.md')">LOAD TEST FILE</button> -->
      <button class="menuButton" v-on:click="saveListToCognito()">Cognitoへセーブ</button>
      <button class="menuButton" v-on:click="exec()">EXEC</button>
    </div>
    <div class="wrap-editArea">
      <!-- <textarea class="edit-mdArea" placeholder="# Hello" :value="rawText" @input="update" :rows="rows"></textarea> -->
      <textarea class="edit-mdArea" placeholder="# Hello" v-model="rawText"></textarea>
      <div class="view-text" v-html="markedText"></div>
    </div>
  </div>
</template>

<script>
import 'aws-sdk/dist/aws-sdk';
const AWS = window.AWS;
const identityPoolId = '';

var marked = require('marked');
var store = require('store');
var axios = require('axios');
var co = require('co');

var SyncSessionToken = '';
var DatasetSyncCount = 0;

AWS.config.region = 'ap-northeast-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId
});

export default {
  name: 'app',
  data () {
    return {
      newRecordName: '',
      rawText: '',
      selected: 'One',
      records: []
    }
  },
  created: function () {
    this.loadListFromCognito();
  },
  watch: {
    selected: function (key) {
      var value;
      this.records.forEach(function(record){
        if (record.key == key) {
          value = record.value;
        }
      });
      this.rawText = value;
    }
  },
  computed: {
    markedText: function () {
      var html =  marked(this.rawText, { sanitize: false })
      return html
    }
  },
  methods: {
    exec: function () {
      this.loadListFromCognito();
    },
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
    },
    loadListFromCognito: function () {
      function getRecords() {
        return new Promise(function(resolve) {
          var cognitosync = new AWS.CognitoSync();
          cognitosync.listRecords({
            DatasetName: 'FOX',
            IdentityId: AWS.config.credentials.identityId,
            IdentityPoolId: identityPoolId
          }, function(err, res){
              if(err) {
                console.log(err);
              } else {
                SyncSessionToken = res.SyncSessionToken;
                DatasetSyncCount = res.DatasetSyncCount;
                var records = res.Records.map(function(record){
                  return { key: record.Key ,value: record.Value };
                });
                resolve(records);
              }
          });
        });
      }
      getRecords().then((response) => {
        this.records = response;
        this.selected = this.records[0].key;
        this.rawText = this.records[0].value;
      }).catch((response) => {
      });
    },

    saveListToCognito: function () {
      var cognitosync = new AWS.CognitoSync();
      var params = {
        DatasetName: 'FOX',
        IdentityId: AWS.config.credentials.identityId,
        IdentityPoolId: identityPoolId,
        SyncSessionToken: SyncSessionToken,
        RecordPatches: [{
            Key: this.selected,
            Op: 'replace',
            SyncCount: DatasetSyncCount,
            Value: this.rawText
        }]
      };
      cognitosync.updateRecords(params, function(err, data) {
        if(err){
          console.log(err);
        } else {
          console.log(data);
        }
      });
    },

    newRecord: function (event) {
      console.log(this.newRecordName);
      var cognitosync = new AWS.CognitoSync();
      var params = {
        DatasetName: 'FOX',
        IdentityId: AWS.config.credentials.identityId,
        IdentityPoolId: identityPoolId,
        SyncSessionToken: SyncSessionToken,
        RecordPatches: [{
            Key: this.newRecordName,
            Op: 'replace',
            SyncCount: DatasetSyncCount,
            Value: ''
        }]
      };
      cognitosync.updateRecords(params, function(err, data) {
        if(err){
          console.log(err);
        } else {
          console.log(data);
          this.newRecordName = '';
        }
      });
      this.loadListFromCognito();
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


button.menuButton {
    font-size: 1.4em;
    font-weight: bold;
    padding: 4;
    background-color: #2d4e6f;
    color: #fff;
    border-style: none;
}

button.menuButton:hover {
    background-color: #fff;
    color: #2d4e6f;
}

code {
  color: #f66;
}
</style>
