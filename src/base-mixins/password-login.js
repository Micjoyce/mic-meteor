/*
 *   The password-login mixin:
 *   - defines the `createUser` and `loginWithPassword` methods, porcelain for
 *     calling the `createUser` and `login` ddp methods
 */

import shajs from 'sha.js';
import { onLogin } from '../common/login-method';

/*
 *   Public methods
 */
// 加密密码传输
export function hashPassword(password) {
  return {
    // digest: SHA256(password),
    digest: shajs('sha256').update(password).digest('hex'),
    algorithm: 'sha-256'
  };
}

export function createUser({
  username,
  email,
  password
}) {
  const options = {
    password: hashPassword(password),
    user: {
      username,
      email
    }
  };
  return this.call('createUser', options).then(onLogin.bind(this));
}

export function loginWithPassword({
  username,
  email,
  password
}) {
  const loginParameters = {
    password: hashPassword(password),
    user: {
      username,
      email
    }
  };
  return this.call('login', loginParameters).then(onLogin.bind(this));
}

export function resetPassword(oldPassword, newPassword) {
  return this.call('changePassword', hashPassword(oldPassword), hashPassword(newPassword));
}
