import Vue from 'vue'
import Router from 'vue-router'

import Editor from 'components/Editor'
import Login from 'components/Login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Editor',
      component: Editor
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/login_callback',
      name: 'login_callback',
      component: Login
    }
  ]
})

this.a.beforeEach((to, from, next) => {
  var axios = require('axios');
  var store = require('store');

  if (to.path === '/login') {
    axios.post('https://h6nvvb5vnb.execute-api.ap-northeast-1.amazonaws.com/prod/oauth-request-token', {})
    .then(function (response) {
      console.log(response.data);
      location.href = response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
  } else if (to.path === '/') {
    next();

    var token = store.get('token')
    if (token) {
      console.log("tokenあり");
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
        } else {
          console.log("Cognito Identify Id: " + AWS.config.credentials.identityId);
          next();
        }
      });
    } else {
      console.log("tokenなし");
      location.href = "http://localhost:8080/#/login"
    }

  } else if (to.path === '/login_callback') {
    var url = window.location.toString();
    var oauth_token = url.match(/oauth_token=([0-9A-z_]+)/)[1];
    var oauth_verifier = url.match(/oauth_verifier=([0-9A-z_]+)/)[1];
    axios.post('https://h6nvvb5vnb.execute-api.ap-northeast-1.amazonaws.com/prod/oauth-access-token', {
        oauth_token: oauth_token,
        oauth_verifier: oauth_verifier
      })
      .then(function (response) {
        var oauth_token = response.data.match(/oauth_token=([0-9A-z_-]+)/)[1];
        var oauth_token_secret = response.data.match(/oauth_token_secret=([0-9A-z_-]+)/)[1];
        store.set('token', oauth_token + ";" + oauth_token_secret)
        location.href = "http://localhost:8080/#/"
      })
      .catch(function (error) {
        console.log(error);
      });
  }
});
