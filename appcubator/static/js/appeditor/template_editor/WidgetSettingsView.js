define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('mixins/BackboneCardView');

    var GeneratorEditorView = require('app/GeneratorEditorView');
    var TemplatesEditorView = require('app/TemplatesEditorView');
    var WidgetModelEditorView = require('editor/WidgetModelEditorView');

    var tableTemplate = [
            '<div class="header">',
                '<div>',
                '<h2>Widget Settings Editor</h2>',
                '<div class="q-mark-circle"></div>',
                '</div>',
                '<ul class="tabs">',
                    '<li class="attributes-li right-icon">',
                    '<span>Settings</span>',
                    '</li><li class="code-li right-icon">',
                    '<span>Generated Code</span>',
                    '</li><li class="right-icon info-li">',
                    '<span>More Info</span>',
                    '</li>',
                '</ul>',
            '</div>',
            '<div class="current-content">',
            '</div>',
    ].join('\n');

    var TableView = Backbone.CardView.extend({

        className: 'widget-settings-pane',
        subviews: [],

        events: {
            'change .attribs'     : 'changedAttribs',
            'click .q-mark-circle': 'showTableTutorial',
            'click .right-icon'   : 'tabClicked',
            'keyup .attr-input'   : 'attributeChanged'
        },


        initialize: function(widgetModel) {
            _.bindAll(this);
            this.model = widgetModel;
        },

        render: function() {
            this.el.innerHTML = _.template(tableTemplate, this.model.serialize());
            this.el.id = 'table-' + this.model.cid;
            this.currentContentPane = this.$el.find('.current-content');
            this.renderAttributes();

            return this;
        },

        reRender: function() {
            this.el.innerHTML = '';
            this.render();
        },

        renderAttributes: function() {
            
            this.$el.find('.current-content').html('');

            var modelEditorView = new WidgetModelEditorView(this.model);
            this.currentContentPane.append(modelEditorView.render().el);

            this.$el.find('.attributes-li').addClass('active');
        },

        renderCode: function() {
            var tableCodeView = new GeneratorEditorView({ generate: this.model.generate, widgetModel: this.model });
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append(tableCodeView.render().el);
            this.$el.find('.code-li').addClass('active');
        },

        renderInfo: function() {
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append('<p>Documentation about this widget would go here</p>');
            this.$el.find('.info-li').addClass('active');
        },

        tabClicked: function(e) {
            this.$el.find('.active').removeClass('active');

            if($(e.currentTarget).hasClass('info-li')) {
                this.renderInfo();
            }
            else if($(e.currentTarget).hasClass('attributes-li')) {
                this.renderAttributes();
            }
            else if($(e.currentTarget).hasClass('code-li')) {
                this.renderCode();
            }
        },

        onClose: function() {
            this.model.trigger('rerender');
        }

    });

    return TableView;
});
