define([
    "knockout"
], function(ko) {

    // set up a binding between a widget's property and an observable.
    function setup_subscription(widget, prop, obs) {
        var subHdl, watchHdl;

        console.log("setup subscription observable -> widget "+String(widget)
                    +" for parameter "+prop);
        subHdl = obs.subscribe(function(v) {
            console.log("observable -> widget "+String(widget)
                        +" update:", prop, v);
            widget.set(prop, v);
        });
        if(ko.isWritableObservable(obs)) {
            console.log("setup subscription widget "+String(widget)+" -> observable"
                        +" for parameter "+prop);
            watchHdl = widget.watch(prop, function(name, oldV, newV) {
                console.log("widget "+String(widget)+" -> observable update:",
                            prop, newV);
                obs(newV);
            });
        }
        return {
            observable: obs,
            dispose: function() {
                console.log("remove subscription observable"
                            +" -> widget "+String(widget)
                            +" for parameter "+prop);
                subHdl.dispose();
                if(watchHdl) {
                    console.log("remove subscription widget "+String(widget)
                                +" -> observable"
                                +" for parameter "+prop);
                    watchHdl.unwatch();
                }
            }
        };
    }

    ko.bindingHandlers.dijit = {
        init: function(elt, valueAccessor, allBindings) {
            var klassName = valueAccessor();
            var params = ko.unwrap(allBindings.get("dijitParams")) || {};
            var initParams = {};
            for(var k in params) {
                if(params.hasOwnProperty(k)) {
                    initParams[k] = ko.unwrap(params[k]);
                }
            }
            console.log("dijit binding init class=", klassName,
                        "elt=", elt,
                        "initParams=", initParams);
            if(typeof klassName != "string")
                throw new Error("the argument to dijit must be a simple string");
            var klass = require(klassName);
            var w = new klass(initParams, elt);
            w.startup();
            var subs = {};

            // we use ko.computed instead of an update handler (which is implemented
            // using ko.computed anyway) because with an update handler we don't have
            // a suitable scope for w or subs.
            // many of knockout's default bindings also use a computed instead of an
            // update handler, so I don't feel too bad :)
            ko.computed(function() {
                console.log("dijit computed evaluation!");
                var params = ko.unwrap(allBindings.get("dijitParams")) || {};
                for(var k in subs) {
                    if(subs.hasOwnProperty(k)) {
                        console.log("checking old subscription", k);
                        var sub = subs[k];
                        if(sub.observable !== params[k]) {
                            // binding has changed (or removed) - unbind previous
                            // observable
                            sub.dispose();
                            delete subs[k];
                        }
                    }
                }
                ko.utils.objectForEach(params, function(k, param) {
                    console.log("checking new parameter", k, param);
                    if(ko.isObservable(param)) {
                        if(subs.hasOwnProperty(k)) {
                            console.log("subscription already in place", k);
                        } else {
                            w.set(k, param.peek());
                            subs[k] = setup_subscription(w, k, param);
                        }
                    } else {
                        // non-observable parameter: simply update the value
                        console.log("non-observable update:", k, param);
                        w.set(k, param);
                    }
                });
            }, null, { disposeWhenNodeIsRemoved: w.domNode });

            ko.utils.domNodeDisposal.addDisposeCallback(w.domNode, function() {
                console.log("ko-dispose: destroying widget "+String(w));
                ko.utils.objectForEach(subs, function(k, sub) { sub.dispose(); });
                subs = null;
                w.destroyRecursive(); // FIXME: preserve DOM?
                console.log("ko-dispose: done");
            });

            // as the widget might have replaced the original dom node
            // we don't let knockout process descendant bindings
            // (of the original node)
            return { controlsDescendantBindings: true };
        }
    };

    return ko;
});
