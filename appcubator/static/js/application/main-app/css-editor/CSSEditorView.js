define(function(require, exports, module) {
    'use strict';

    var UIElementListView = require('./UIElementListView');

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
            'click #navigate-back' : 'navBack'
        },

        initialize: function() {
            this.model = v1UIEState;
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

            return this;
        },

        showElementType: function(type, key, text) {

            switch(type) {
                case "basecss":
                    break;
                default:
                    var listView = new UIElementListView(this.model.get(key), type);
                    $(this.elementsList).hide();
                    this.setTitle(text);
                    this.el.appendChild(listView.render().el);
                    this.currentView = listView;
            }

        },

        navBack: function() {
            this.currentView.close();
            $(this.elementsList).show();
            this.setTitle("CSS Editor");
        },

        setTitle: function(str) {
            this.titleDiv.innerHTML = str;
        },

        expand: function() {
            // this.el.className += ' expanded';
        },

        hide: function() {
            // this.$el.removeClassName('expanded');
        }

    });

    return CSSEditorView;
});