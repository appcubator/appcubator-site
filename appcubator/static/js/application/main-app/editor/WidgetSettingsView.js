define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('mixins/BackboneCardView');

    var GeneratorEditorView = require('app/GeneratorEditorView');
    var TemplatesEditorView = require('app/TemplatesEditorView');

    var tableTemplate = [
            '<div class="header">',
                '<div>',
                '<h2>Widget Settings Editor</h2>',
                '<div class="q-mark-circle"></div>',
                '</div>',
                '<ul class="tabs">',
                    '<li class="attributes-li right-icon">',
                    '<span>Attributes</span>',
                    '</li><li class="templates-li right-icon">',
                    '<span>Templates</span>',
                    '</li><li class="code-li right-icon">',
                    '<span>Code</span>',
                    '</li>',
                '</ul>',
            '</div>',
            '<div class="current-content"></div>',
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
            
            var strHTML = '<div class="code-view"><div class="instance sect">';

            strHTML += '<table style="margin: 15px auto;">';
            _.each(this.model.attributes, function(val, key) {
                if(key == 'layout') return;
                if(Backbone.isModel(val) || Backbone.isCollection(val)) return;

                strHTML += '<tr><td>' + key + '</td><td><input type="text" class="attr-input" id="attr-'+key+'" value="' + val +'"></td></tr>';
            });
            strHTML += '</table>';

            strHTML += [
                    '<div id="add-attribute-box">',
                        '<form style="display:none;">',
                            '<input type="text" class="property-name-input" placeholder="Template Name...">',
                            '<input type="submit" class="done-btn" value="Done">',
                        '</form>',
                        '<div class="add-button box-button">+ Create a New Template</div>',
                    '</div>'
                ].join('\n');

            strHTML += '</div></div>';

            this.currentContentPane.html(strHTML);
            this.addAttributeBox = new Backbone.NameBox({}).setElement(this.$el.find('#add-attribute-box')).render();
            this.addAttributeBox.on('submit', this.createAttribute);

            this.$el.find('.attributes-li').addClass('active');
        },

        renderCode: function() {
            var tableCodeView = new GeneratorEditorView({ generate: this.model.generate, widgetModel: this.model });
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append(tableCodeView.render().el);
            tableCodeView.setupAce();
            this.$el.find('.code-li').addClass('active');
        },

        renderTemplates: function() {
            var templatesView = new TemplatesEditorView({ generate: this.model.generate, widgetModel: this.model });
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append(templatesView.render().el);
            templatesView.setupAce();
            this.$el.find('.templates-li').addClass('active');
        },

        attributeChanged: function(e) {
            var attributeKey = String(e.currentTarget.id).replace('attr-','');
            this.model.set(attributeKey, e.currentTarget.value);
        },

        createAttribute: function(name) {
            this.model.set(name, '');
            this.reRender();
        },

        tabClicked: function(e) {
            this.$el.find('.active').removeClass('active');

            if($(e.currentTarget).hasClass('templates-li')) {
                this.renderTemplates();
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