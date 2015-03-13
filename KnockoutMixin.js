define([
    "dojo/_base/declare",
    "knockout"
], function(declare,
            ko) {

    return declare(null, {
        declaredClass: "KnockoutMixin",

        destroy: function(preserveDom) {
            console.log("KO destroy: " + String(this));
            if(this.domNode)
                ko.cleanNode(this.domNode);
            this.inherited(arguments);
            console.log("KO destroy: " + String(this) + ": done!");
        },

        destroyDescendants: function(preserveDom) {
            console.log("KO destroyDescendants: " + String(this));
            if(this.containerNode)
                ko.cleanNode(this.containerNode);
            this.inherited(arguments);
            console.log("KO destroyDescendants: " + String(this) + ": done!");
        }
    });
});
