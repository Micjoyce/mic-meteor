import assign from "lodash.assign";
import EventEmitter from "wolfy87-eventemitter";

import * as ddp from "./base-mixins/ddp";
import * as login from "./base-mixins/login";
import * as methods from "./base-mixins/methods";
import * as loginWithPassword from "./base-mixins/password-login";
import * as subscriptions from "./base-mixins/subscriptions";
import * as Streamer from "./base-mixins/Streamer";

/*
 *   A mixin is a plain javascript object. Mixins are composed by merging the
 *   mixin object own enumerable properties into the Meteor's base prototype.
 *   The only exception is the `init` method. If the mixin defines an `init`
 *   method, it will _not_ be merged into the prototype, instead it'll be called
 *   at construction time.
 *
 *   Example usage:
 *   ```js
 *   import {createClass} from "meteor";
 *   import * as myMixinOne from "meteor-my-mixin-one";
 *   import * as myMixinTwo from "meteor-my-mixin-two";
 *   const Meteor = createClass([myMixinOne, myMixinTwo]);
 *   ```
 */

export function createClass (customMixins = []) {
    // Include base mixins before custom ones
    const mixins = [ddp, methods, subscriptions, login, loginWithPassword, Streamer]
        .concat(customMixins);

    const Meteor = function Meteor (...args) {
    // Call each init method
        mixins.forEach(({
            init
        }) => init && init.apply(this, args));
    };

    Meteor.prototype = Object.create(EventEmitter.prototype);
    Meteor.prototype.constructor = Meteor;
    // Merge all mixins into Meteor.prototype
    assign(Meteor.prototype, ...mixins);
    // And delete the "dangling" init property
    delete Meteor.prototype.init;

    // Return the newly constructed class
    return Meteor;
}
