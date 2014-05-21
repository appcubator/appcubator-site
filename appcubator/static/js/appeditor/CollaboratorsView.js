define(function(require, exports, module) {
    'use strict';

    require('backbone');

    var CollaboratorsView = Backbone.View.extend({
        css: 'app-page',

        events: {
            'click .add-collaborator-btn': 'showCollabBox',
        },

        initialize: function(options) {
            _.bindAll(this);
        },

        render: function() {
            this.$addCollaboratorForm = this.$el.find('.add-collaborator-form');
        },

        showCollabBox: function(e) {
            console.log("swag");
            $(e.currentTarget).hide();
            this.$addCollaboratorForm.fadeIn();
            this.$addCollaboratorForm.find('input[type="text"]').focus();
        }

    });

    return CollaboratorsView;
});
