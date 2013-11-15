define(function(require, exports, module) {
    'use strict';

    var UIElementListView = require('./UIElementListView');
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

            switch (type) {
                case "basecss":
                    break;
                case "fonts":
                    break;
                default:
                    var listView = new UIElementListView(this.model.get(key), type);
                    $(this.elementsList).hide();
                    this.setTitle(text);
                    this.el.appendChild(listView.render().el);
                    this.currentView = listView;
            }

        },

        styleSelected: function(styleModel) {
            if(this.currentView) this.currentView.close();
            
            this.currentView = new UIElementEditingView(styleModel);
            this.el.appendChild(this.currentView.render().el);
            this.setTitle(styleModel.get('class_name'));
            this.currentView.setUpAce();
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
        },

        save: function() {
            console.log('trynna save');
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