import Vue from 'vue'
import Router from 'vue-router'

import Editor from 'components/Editor'
import Login from 'components/Login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/editor',
      name: 'Editor',
      component: Editor
    },
    {
      path: '/login_callback',
      name: 'login_callback',
      component: Login
    }
  ]
})

this.a.beforeEach((to, from, next) => {
  console.log(to.path);

  var axios = require('axios');
  var store = require('store');

  if (to.path === '/') {
    var token = store.get('token')
    if (token) {
      location.href = "http://editor.fox-track.com/#/editor"
    } else {
      next();
    }
  } else if (to.path === '/login') {
    var token = store.get('token')
    if (token) {
      location.href = "http://editor.fox-track.com/#/editor"
    } else {
      axios.post('https://h6nvvb5vnb.execute-api.ap-northeast-1.amazonaws.com/prod/oauth-request-token', {})
      .then(function (response) {
        console.log(response.data);
        location.href = response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  } else if (to.path === '/editor') {
    var token = store.get('token')
    if (token) {
      AWS.config.region = 'ap-northeast-1';
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: 'ap-northeast-1:cf19de2d-8566-466d-9000-d5b4fb4bc169',
          Logins: {
            'api.twitter.com': token
          }
      });
      AWS.config.credentials.get(function(err) {
        console.log('F0');
        if (err) {
          console.log("ERROR!!");
          location.href = "http://editor.fox-track.com/#"
        } else {
          console.log("Cognito Identify Id: " + AWS.config.credentials.identityId);
          next();
        }
      });
    } else {
      location.href = "http://editor.fox-track.com/#"
    }

  } else if (to.path === '/login_callback') {
    var url = window.location.toString();
    var oauth_token = url.match(/oauth_token=(.+)&/)[1];
    var oauth_verifier = url.match(/oauth_verifier=([0-9A-z]+)#/)[1];
    axios.post('https://h6nvvb5vnb.execute-api.ap-northeast-1.amazonaws.com/prod/oauth-access-token', {
        oauth_token: oauth_token,
        oauth_verifier: oauth_verifier
      })
      .then(function (response) {
        var oauth_token = response.data.match(/oauth_token=([0-9A-z_-]+)/)[1];
        var oauth_token_secret = response.data.match(/oauth_token_secret=([0-9A-z_-]+)/)[1];
        store.set('token', oauth_token + ";" + oauth_token_secret)
        location.href = "http://editor.fox-track.com/#"
      })
      .catch(function (error) {
        console.log(error);
      });
  } else {
    next();
  }
});
