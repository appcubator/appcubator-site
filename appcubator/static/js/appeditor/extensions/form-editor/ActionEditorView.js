define([
        'models/FormFieldModel',
        'models/ActionModel',
        'tutorial/TutorialView',
        'mixins/BackboneModal',
        'mixins/SelectView',
        'jquery-ui'
    ],
    function(FormFieldModel, ActionModel, TutorialView) {

        var FormEditorTemplates = {};
        FormEditorTemplates.actionPane = [
            '<small>Choose options from the list below.</small>',
            '<ul class="current-actions"></ul>',
            '<div class="section-header">Options</div>',
            '<ul class="action goto-list">',
            '</ul>',
            '<ul class="action relational-list">',
            '</ul>',
            '<ul class="action email-list">',
            '</ul>'
        ].join('\n');


        var ActionEditorView = Backbone.View.extend({
            tagName: 'div',
            className: 'form-action-editor',

            events: {
                'click li.goto-action': 'gotoActionClicked',
                'click li.relational-action': 'relationalActionClicked',
                'click li.email-action': 'emailActionClicked',
                'click li.current-action': 'currentActionClicked'
            },

            initialize: function(formModel, entityModel) {
                _.bindAll(this);

                this.model = formModel;
                this.entityM = entityModel;

                // this.listenTo(this.model.get('actions'), 'add', this.actionAdded);
                // this.listenTo(this.model.get('actions'), 'remove', this.actionRemoved);
                // this.listenTo(this.model, 'change:goto', this.changedGoto);

                this.possibleRelationalActions = [];
                //this.model.getRelationalActions(v1State.getCurrentPage());
                this.possibleEmailActions = [];
                //this.model.getEmailActions();
                this.possibleGotos = [];
                //this.model.getPossibleGotos();
            },

            render: function(text) {
                this.el.innerHTML = _.template(FormEditorTemplates.actionPane, {});

                // this.renderRelations();
                // this.renderGotos();
                // this.renderEmails();

                // this.model.get('actions').each(function(action) {
                //     this.$el.find('.current-actions').append('<li id="action-' + action.cid + '" class="current-action">' + action.getNL() + '<div class="remove-from-list"></div></li>');
                // }, this);

                return this;
            },

            renderRelations: function() {
                this.possibleRelationalActions.each(function(actionModel, ind) {
                    this.$el.find('.relational-list').append('<li id="action-' + actionModel.cid + '" class="relational-action">' + actionModel.get('nl_description') + '<div class="add-to-list"></div></li>');
                }, this);
            },

            renderEmails: function() {
                this.possibleEmailActions.each(function(actionModel, ind) {
                    this.$el.find('.email-list').append('<li id="action-' + actionModel.cid + '" class="email-action">' + actionModel.get('nl_description') + '<div class="add-to-list"></div></li>');
                }, this);
            },

            renderGotos: function() {
                var entitiyName = this.entityM.get('name');
                var redirect = this.model.get('goto');

                if (redirect) {
                    this.$el.find('.current-actions').append('<li id="action-' + redirect.cid + '" class="current-action goto-action">Go to ' + redirect.get('page_name') + '<div class="remove-from-list"></div></li>');
                }

                this.possibleGotos.each(function(actionModel, ind) {
                    this.$el.find('.goto-list').append('<li id="page-' + actionModel.cid + '" class="goto-action">Go to ' + actionModel.get('page_name') + '<div class="add-to-list"></div></li>');
                }, this);
            },


            gotoActionClicked: function(e) {
                if ($(e.currentTarget).hasClass('current-action')) return;
                var pageCid = (e.target.id || e.target.parentNode.id).replace('page-', '');
                this.model.set('goto', this.possibleGotos.get(pageCid));
            },

            relationalActionClicked: function(e) {
                var actionCid = (e.target.id || e.target.parentNode.id).replace('action-', '');
                var actionModel = this.possibleRelationalActions.get(actionCid);
                this.model.addAction(actionModel);
            },

            emailActionClicked: function(e) {
                var actionCid = (e.target.id || e.target.parentNode.id).replace('action-', '');
                var actionModel = this.possibleEmailActions.get(actionCid);
                this.model.addAction(actionModel);
            },

            currentActionClicked: function(e) {
                if ($(e.currentTarget).hasClass('goto-action')) return;
                var actionCid = (e.target.id || e.target.parentNode.id).replace('action-', '');
                this.model.get('actions').remove(actionCid);
            },

            actionAdded: function(actionModel) {
                this.$el.find('.current-actions').append('<li id="action-' + actionModel.cid + '" class="current-action">' + actionModel.getNL() + '<div class="remove-from-list"></div></li>');
            },

            changedGoto: function() {
                this.$el.find('.goto-action.current-action').remove();
                var redirect = this.model.get('goto');
                var page_name = redirect.get('page_name').replace('internal://', '');

                this.$el.find('.current-actions').append('<li id="action-' + redirect.cid + '" class="current-action goto-action">Go to ' + page_name + '<div class="remove-from-list"></div></li>');
            },

            actionRemoved: function(actionModel) {
                this.$el.find('#action-' + actionModel.cid).remove();
            }

        });

        return ActionEditorView;
    });