/* eslint prefer-spread: "error" */

import EventEmitter from "wolfy87-eventemitter";

class StreamerCentralClass extends EventEmitter {
    constructor () {
        super();

        this.instances = {};
        this.ddpConnections = {}; // since each Streamer instance can provide its own ddp connection, store them by streamer name
    }

    setupDdpConnection (name, ddpConnection) {
    // make sure we only setup event listeners for each ddp connection once
        if (ddpConnection.hasMeteorStreamerEventListeners) {
            return;
        }
        ddpConnection.ddp.on("changed", msg => {
            if (msg && msg.msg === "changed" && msg.collection && msg.fields && msg.fields.eventName && msg.fields.args) {
                msg.fields.args.unshift(msg.fields.eventName);
                msg.fields.args.unshift(msg.collection);
                this.emit.apply(this, msg.fields.args);
            }
        });
        // store ddp connection
        this.storeDdpConnection(name, ddpConnection);
    }

    storeDdpConnection (name, ddpConnection) {
    // mark the connection as setup for Streamer, and store it
        ddpConnection.hasMeteorStreamerEventListeners = true;
        this.ddpConnections[name] = ddpConnection;
    }
}

const StreamerCentral = new StreamerCentralClass();
export default StreamerCentral;
