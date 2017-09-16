import * as multiStorage from './multi-storage';
import Cookies from 'js-cookie';

export function refreshToken({
  id,
  token
}) {
  this.userId = function() {
    return id;
  };
  this.loggedIn = true;
  // 设置cookies
  Cookies.set('seer_uid', id);
  Cookies.set('seer_token', token);
  return multiStorage.set(this.__login_token__, token)
    .then(() => id);
}

export function onLogin({
  id,
  token
}) {
  this.userId = function() {
    return id;
  };
  this.loggedIn = true;
  // 设置cookies
  Cookies.set('seer_uid', id);
  Cookies.set('seer_token', token);

  return multiStorage.set(this.__login_token__, token)
    .then(this.emit.bind(this, 'loggedIn', id))
    .then(() => id);
}

export function onLogout() {
  this.userId = function() {
    return null;
  };
  this.loggedIn = false;
  // 移除cookies
  Cookies.remove('seer_uid');
  Cookies.remove('seer_token');

  return multiStorage.del(this.__login_token__)
    .then(this.emit.bind(this, 'loggedOut'))
    .then(() => null);
}

export function resumeLogin() {
  return multiStorage.get(this.__login_token__)
    .then(resume => {
      if (!resume) {
        throw new Error('No login token');
      }
      return {
        resume
      };
    })
    .then(this.login.bind(this))
    .catch(onLogout.bind(this));
}
