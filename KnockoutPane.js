define([
    "dojo/_base/declare",
    "dijit/layout/ContentPane",
    "knockout",
    "./KnockoutMixin"
], function(declare,
            ContentPane,
            ko,
            KnockoutMixin) {

    return declare([ContentPane, KnockoutMixin], {
        declaredClass: "KnockoutPane",
        parseOnLoad: false,
        viewModel: null,

        onLoad: function() {
            this.inherited(arguments);
            console.log("KnockoutPane onLoad; viewModel=", this.viewModel);
            if(this.viewModel && this.containerNode) {
                console.log("applying knockout bindings!");
                ko.applyBindingsToDescendants(this.viewModel, this.containerNode);
            }
        }
    });
});
