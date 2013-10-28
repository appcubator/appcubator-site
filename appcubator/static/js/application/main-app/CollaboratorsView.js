define(function(require, exports, module) {
    'use strict';

    require('backbone');

    var CollaboratorsView = Backbone.View.extend({
        css: 'app-page',

        events: {
            'click #add-collaborator-btn': 'showCollabBox',
        },

        initialize: function(options) {
            _.bindAll(this);
        },

        render: function() {
            console.log(this.$el.find('.add-collaborator-form'));
            console.log(this.el);
            this.$addCollaboratorForm = this.$el.find('.add-collaborator-form');
        },

        showCollabBox: function(e) {

            $(e.currentTarget).hide();
            this.$addCollaboratorForm.fadeIn();
            this.$addCollaboratorForm.find('input[type="text"]').focus();
        }

    });

    return CollaboratorsView;
});