<template>
  <div id="editor">
    <div class="edit">
      <div class="edit-list">
        <button class="list-button" v-on:click="loadListFromCognito()">リロード</button>
        <button class="list-button" v-on:click="saveListToCognito()">セーブ</button>
        <input class="list-search" v-model="search">
        <ul class="list-cell">
          <li class="list-cell" v-for="record in filteredRecords" v-on:click="loadWithKey(record.key)">
            {{ record.key }}
          </li>
        </ul>
        <div class="new">
          <input class="list-new-record-name"　v-model="newRecordName" placeholder="名前">
          <button class="list-new-record-button" v-on:click="newRecord">新規作成</button>
        </div>
      </div>
      <textarea class="edit-raw" placeholder="# Hello" v-model="rawText"></textarea>
      <div class="edit-md" v-html="markedText"></div>
    </div>
  </div>
</template>

<script>
import 'aws-sdk/dist/aws-sdk';
const AWS = window.AWS;
const identityPoolId = 'ap-northeast-1:cf19de2d-8566-466d-9000-d5b4fb4bc169';

var marked = require('marked');
var store = require('store');
var axios = require('axios');
var co = require('co');

var SyncSessionToken = '';
var DatasetSyncCount = 0;

export default {
  name: 'editor',
  data () {
    return {
      search: '',
      newRecordName: '',
      rawText: '',
      selected: '',
      records: []
    }
  },
  created: function () {
    this.loadListFromCognito();
  },
  computed: {
    markedText: function () {
      var html =  marked(this.rawText, { sanitize: false })
      return html
    },
    filteredRecords: function () {
      var self = this
      return self.records.filter(function (record) {
      return record.key.indexOf(self.search) !== -1
    })
}
  },
  methods: {
    loadWithKey: function (key) {
      var value;
      this.records.forEach(function(record){
        if (record.key == key) {
          value = record.value;
        }
      });
      this.selected = key;
      this.rawText = value;
    },
    exec: function () {
      console.log(self.records);
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

.edit {
  display: flex;
  height: 100vh;
}

.edit-list {
  width: 10vw;
  background-color: #a8a8ff;
}

.edit-raw {
  width: 40vw;
  border: none;
  background-color: #e0e0ff;
  padding:20px;
  outline: 0;
}

.edit-md {
  width: 50vw;
  background-color: #f4f4ff;
  padding: 20px;
}

button.list-button {
    width: 100%;
    color: #2d4e6f;
    outline: 0;
    padding: 10px;
}

input.list-search {
  width: 100%;
  padding: 0px;
}

ul.list-cell {
    width: 100%;
    list-style:none;
    padding:10px;
    background:#337fcc;
}

ul.list-cell.ui {
    width: 100%;
    color: #FF0000;
}

div.new {
  width: 10vw;
  bottom: 0;
  position: fixed;
}

.list-new-record-name {
  width: 90%;
}

.list-new-record-button {
  width: 95%;
  color: #2d4e6f;
  outline: 0;
  padding: 10px;
}

</style>
