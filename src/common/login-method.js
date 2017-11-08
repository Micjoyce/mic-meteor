import * as multiStorage from "./multi-storage";

export function refreshToken ({
    id,
    token
}) {
    this.userId = function () {
        return id;
    };
    this.loggedIn = true;
    return multiStorage.set(this.__login_token__, token)
        .then(() => id);
}

export function getUserToken () {
    return multiStorage.get(this.__login_token__);
}

export function onLogin ({
    id,
    token
}) {
    this.userId = function () {
        return id;
    };
    this.loggedIn = true;

    return multiStorage.set(this.__login_token__, token)
        .then(this.emit.bind(this, "loggedIn", id))
        .then(() => id);
}

export function onLogout () {
    this.userId = function () {
        return null;
    };
    this.loggedIn = false;

    return multiStorage.del(this.__login_token__)
        .then(this.emit.bind(this, "loggedOut"))
        .then(() => null);
}

export function resumeLogin () {
    return multiStorage.get(this.__login_token__)
        .then(resume => {
            if (!resume) {
                throw new Error("No login token");
            }
            return {
                resume
            };
        })
        .then(this.login.bind(this))
        .catch(onLogout.bind(this));
}
