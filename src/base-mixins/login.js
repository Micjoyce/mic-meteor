/*
 *   Login mixin:
 *    - defines the `login` and `logout` methods
 *    - exposes the `userId` and `loggedIn` public properties
 */

/**
 * loginParameters 可选参数
 * 1.{ user: { email: 'email', username: 'username' }, password} // email | username 只需要一个
 * 2.{ resume: 'token' } // 通过token登录
 */

import {
  onLogin,
  onLogout,
  resumeLogin,
  refreshToken,
  getUserToken
} from '../common/login-method';

/*
 *   Public methods
 */

export function login(loginParameters) {
  return this.call('login', loginParameters).then(onLogin.bind(this));
}

export function logout() {
  return this.call('logout').then(onLogout.bind(this));
}

/*
 *   Init method
 */

export function init() {
  this.userId = function() {
    return null;
  };
  this.refreshToken = refreshToken;
  this.getUserToken = getUserToken;
  this.onLogin = onLogin;
  this.onLogout = onLogout;
  this.loggedIn = false;
  this.ddp.on('connected', resumeLogin.bind(this));
}
