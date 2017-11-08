import isString from "lodash.isstring";
import isBoolean from "lodash.isboolean";
import isFunction from "lodash.isfunction";
import EventEmitter from "wolfy87-eventemitter";
import StreamerCentral from "./StreamerCentral";

const NonEmptyString = function (str) {
    if (!isString(str)) {
        return false;
    }
    return str.length > 0;
};

class Streamer extends EventEmitter {
    constructor (name, {
        useCollection = false,
        ddpConnection
    } = {}) {
        if (StreamerCentral.instances[name]) {
            console.warn("Streamer instance already exists:", name);
            return StreamerCentral.instances[name];
        }
        StreamerCentral.setupDdpConnection(name, ddpConnection);

        super();

        this.ddpConnection = ddpConnection;

        StreamerCentral.instances[name] = this;

        this.name = name;
        this.useCollection = useCollection;
        this.subscriptions = {};

        StreamerCentral.on(this.subscriptionName, (eventName, ...args) => {
            if (this.subscriptions[eventName]) {
                this.subscriptions[eventName].lastMessage = args;
                super.emit.call(this, eventName, ...args);
            }
        });

        this.ddpConnection.ddp.on("reset", () => {
            super.emit.call(this, "__reconnect__");
        });
    }

    get name () {
        return this._name;
    }

    set name (name) {
        if (!isString(name)) {
            return console.log(`set name ${name} not a string`);
        }
        this._name = name;
    }

    get subscriptionName () {
        return `stream-${this.name}`;
    }

    get useCollection () {
        return this._useCollection;
    }

    set useCollection (useCollection) {
        if (!isBoolean(useCollection)) {
            return console.log(`set useCollection ${useCollection} not a Boolean`);
        }
        this._useCollection = useCollection;
    }

    stop (eventName) {
        if (this.subscriptions[eventName] && this.subscriptions[eventName].subscription) {
            this.subscriptions[eventName].subscription.stop();
        }
        this.unsubscribe(eventName);
    }

    stopAll () {
        for (const eventName in this.subscriptions) {
            if (this.subscriptions.hasOwnProperty(eventName)) {
                this.stop(eventName);
            }
        }
    }

    unsubscribe (eventName) {
        this.removeAllListeners(eventName);
        delete this.subscriptions[eventName];
    }

    subscribe (eventName) {
        const subscribe = this.ddpConnection.subscribe(this.subscriptionName, eventName, this.useCollection, {
            onStop: () => {
                this.unsubscribe(eventName);
            }
        });
        return subscribe;
    }

    onReconnect (fn) {
        if (typeof fn === "function") {
            super.on("__reconnect__", fn);
        }
    }

    getLastMessageFromEvent (eventName) {
        const subscription = this.subscriptions[eventName];
        if (subscription && subscription.lastMessage) {
            return subscription.lastMessage;
        }
    }

    once (eventName, callback) {
        if (!NonEmptyString(eventName)) {
            return console.log(`set subscribe once eventName ${eventName} NonEmptyString`);
        }
        if (!isFunction(callback)) {
            return console.log(`set subscribe once callback ${callback} not a function`);
        }

        if (!this.subscriptions[eventName]) {
            this.subscriptions[eventName] = {
                subscription: this.subscribe(eventName)
            };
        }

        super.once(eventName, callback);
    }

    on (eventName, callback) {
        if (!NonEmptyString(eventName)) {
            return console.log(`set subscribe on eventName ${eventName} NonEmptyString`);
        }
        if (!isFunction(callback)) {
            return console.log(`set subscribe on callback ${callback} not a function`);
        }

        if (!this.subscriptions[eventName]) {
            this.subscriptions[eventName] = {
                subscription: this.subscribe(eventName)
            };
        }

        super.on(eventName, callback);
    }

    emit (...args) {
        this.ddpConnection.call(this.subscriptionName, ...args);
    }
}


/*
 *   Init Streamer
 */

export function init () {
    this.Streamer = Streamer;
}
