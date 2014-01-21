define([
        'mixins/DialogueView',
        'mixins/BackboneModal',
    ],
    function(DialogueView) {

        var HeaderEditorView = Backbone.ModalView.extend({
            padding: 0,
            width: 600,
            id: 'url-editor',
            //height: 150,
            events: {
                'keyup #header-editor': 'headerContentChanged',
            },

            initialize: function(pageModel) {
                _.bindAll(this);

                this.model = pageModel;
                this.render();
            },

            render: function() {
                console.log(this.model.toJSON());
                var template = '<textarea id="header-editor" style="width:100%; height: 400px;"><%= head %></textarea>';
                this.el.innerHTML = _.template(template, this.model.toJSON());
                this.$editor = this.$el.find('#header-editor');
            },

            headerContentChanged: function() {
                this.model.set('head', this.$editor.val());
            }

        });

        return HeaderEditorView;
    });