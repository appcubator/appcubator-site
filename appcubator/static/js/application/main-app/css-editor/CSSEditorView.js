define(function(require, exports, module) {
    'use strict';

    var UIElementListView = require('./UIElementListView');
    var StaticsEditorView = require('./StaticsEditorView');
    var BaseCSSEditorView = require('./BaseCSSEditorView');

    var FontEditorView    = require('./FontEditorView');

    var UIElementEditingView = require('./UIElementEditingView');

    require('app/templates/AnalyticsTemplates');
    require('backbone');

    var CSSEditorView = Backbone.View.extend({

        elements: [{
                id: "basecss",
                key: "basecss",
                text: "Base CSS"
            }, {
                id: "fonts",
                key: "fonts",
                text: "Fonts"
            }, {
                id: "button",
                key: "headerTexts",
                text: "Button"
            }, {
                id: "image",
                key: "images",
                text: "Images"
            }, {
                id: "header-text",
                key: "headerTexts",
                text: "Headers"
            }, {
                id: "text",
                key: "texts",
                text: "Texts"
            }, {
                id: "link",
                key: "links",
                text: "Links"
            }, {
                id: "text-input",
                key: "textInputs",
                text: "Text Inputs"
            }, {
                id: "password",
                key: "passwords",
                text: "Password Inputs"
            }, {
                id: "text-area",
                key: "textAreas",
                text: "Text Area"
            }, {
                id: "line",
                key: "lines",
                text: "Lines"
            }, {
                id: "dropdown",
                key: "dropdowns",
                text: "Dropdowns"
            }, {
                id: "box",
                key: "boxes",
                text: "Boxes"
            }, {
                id: "form",
                key: "forms",
                text: "Forms"
            }, {
                id: "list",
                key: "lists",
                text: "Lists"
            }, {
                id: "statics",
                key: "statics",
                text: "Static Files"
            }

        ],

        events: {
            'click #navigate-back': 'navBack'
        },

        initialize: function() {
            _.bindAll(this);

            this.model = v1UIEState;
            this.lastSave = null;
            this.deepListenTo(this.model, 'change', this.save);

            _.each(this.model.getUIElementCollections(), function(coll) {
                this.listenTo(coll, 'selected', this.styleSelected);
            }, this);

            var elementsCollection = v1State.getCurrentPage().get('uielements');
            elementsCollection.each(this.bindWidget, this);

            this.listenTo(elementsCollection, 'add', this.bindWidget);
        },

        bindWidget: function(widgetModel) {
            this.listenTo(widgetModel, 'selected', function() {
                this.elementSelected(widgetModel);
            });
        },

        render: function() {
            var self = this;

            /* Top Row */
            var titleEl = document.createElement('div');
            titleEl.className = 'title';
            this.titleDiv = titleEl;
            this.$el.find('.top-row').append(this.titleDiv);

            /* Elements List */
            this.elementsList = document.createElement('ul');
            _.each(this.elements, function(element) {
                var id = element.id;
                var liEl = document.createElement('li');
                liEl.id = id;
                var aEl = document.createElement('a');
                aEl.innerHTML = element.text;
                liEl.appendChild(aEl);
                this.elementsList.appendChild(liEl);

                $(liEl).bind('click', function() {
                    self.showElementType(id, element.key, element.text);
                });

            }, this);
            this.el.appendChild(this.elementsList);

            this.setTitle("CSS Editor");
            this.$el.find('.navback').hide();

            return this;
        },

        showElementType: function(type, key, text) {

            switch (type) {
                case "basecss":
                    
                    var editorView = new BaseCSSEditorView(this.model);
                    $(this.elementsList).hide();
                    this.setTitle("Base CSS");
                    this.el.appendChild(editorView.render().el);
                    editorView.setupAce();
                    this.currentView = editorView;
                    this.$el.find('.navback').show();

                    break;
                
                case "fonts":

                    var fontEditorView = new FontEditorView(this.model);
                    $(this.elementsList).hide();
                    this.setTitle("Fonts");
                    this.el.appendChild(fontEditorView.render().el);
                    this.currentView = fontEditorView;
                    this.$el.find('.navback').show();

                    break;

                case "statics":

                    var staticsEditor = new StaticsEditorView(this.model);
                    $(this.elementsList).hide();
                    this.setTitle("Static Files");
                    this.el.appendChild(staticsEditor.render().el);
                    this.currentView = staticsEditor;
                    this.$el.find('.navback').show();

                    break;

                default:
                    
                    var listView = new UIElementListView(this.model.get(key), type);
                    $(this.elementsList).hide();
                    this.setTitle(text);
                    this.el.appendChild(listView.render().el);
                    this.currentView = listView;
                    this.$el.find('.navback').show();
                    
                    break;
            }
        },

        styleSelected: function(styleModel) {
            if(this.currentView) this.currentView.close();
            $(this.elementsList).hide();

            this.currentView = new UIElementEditingView(styleModel);
            this.el.appendChild(this.currentView.render().el);
            this.setTitle(styleModel.get('class_name'));
            this.currentView.setupAce();
        },

        elementSelected: function(widgetModel) {
            var type = widgetModel.get('data').get('nodeType');
            var className = widgetModel.get('data').get('class_name');
            var styleModel = this.model.getStyleWithClassAndType(className, type);
            this.$el.find('.navback').show();
            this.styleSelected(styleModel);
        },


        navBack: function() {
            this.currentView.close();
            $(this.elementsList).show();
            this.setTitle("CSS Editor");
            this.$el.find('.navback').hide();
        },

        setTitle: function(str) {
            this.titleDiv.innerHTML = str;
        },

        expand: function() {
            // this.el.className += ' expanded';
        },

        hide: function() {
            // this.$el.removeClassName('expanded');
        },

        save: function() {
            var self = this;
            var json = this.model.toJSON();
            var save_url = '/app/' + appId + '/uiestate/';
            var currentTime = new Date().getTime();
            
            if(this.lastSave === null || currentTime - this.lastSave < 3000) {
                if(this.timer) clearTimeout(this.timer);
                if(this.lastSave === null) {
                    this.lastSave = currentTime + 1;
                }

                this.timer = setTimeout(this.save, 3000);
                return;
            }

            this.lastSave = currentTime;
            $.ajax({
                type: "POST",
                url: save_url,
                data: {
                    uie_state: JSON.stringify(json)
                },
                statusCode: {
                    200: function(data) {
                        console.log('Saved.');
                        if(self.timer) clearTimeout(self.timer);
                        self.model.trigger('synced');
                    },
                    500: function() {
                        alert('Server Error');
                    }
                },
                dataType: "JSON"
            });
        }

    });

    return CSSEditorView;
});