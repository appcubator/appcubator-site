define(function(require, exports, module) {
    'use strict';

    require('backbone');

    var UIElementListView = require('./UIElementListView');
    var StaticsEditorView = require('./StaticsEditorView');
    var BaseCSSEditorView = require('./BaseCSSEditorView');
    var FontEditorView    = require('./FontEditorView');

    var UIElementEditingView = require('./UIElementEditingView');
    var ThemesGalleryView    = require('./ThemesGalleryView');


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
                key: "buttons",
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
            'click #theme-picker-btn' : 'openThemePicker',
            'click #navigate-back'    : 'navBack'
        },


        expanded: false,

        initialize: function() {
            _.bindAll(this);

            this.model = v1UIEState;
            this.lastSave = null;
            this.deepListenTo(this.model, 'change', this.save);

            _.each(this.model.getUIElementCollections(), function(coll) {
                this.listenTo(coll, 'selected', this.styleSelected);
            }, this);

            // TODO: get this back
            var self = this;
            var currentPageInd = v1.currentApp
            v1State.get('templates').each(function(templateModel) {
                var elementsCollection = templateModel.getUIElements();
                // elementsCollection.each(this.bindWidget, this);
                this.listenToModels(elementsCollection, 'selected', function (widgetModel) {
                    self.elementSelected(widgetModel);
                });
            }, this);
            // var elementsCollection = v1State.get().get('uielements');
            // elementsCollection.each(this.bindWidget, this);

            // this.listenTo(elementsCollection, 'add', this.bindWidget);
        },

        bindWidget: function(widgetModel) {
            this.listenTo(widgetModel, 'selected', function() {

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
            this.elementsList.innerHTML += '<li id="theme-picker-btn"><a>Pick a Theme</li>';
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
                    this.expandExtra();
                    this.makeResizable();
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

            styleModel = styleModel[0];

            this.currentView = new UIElementEditingView({ model: styleModel });
            this.el.appendChild(this.currentView.render().el);

            this.setTitle(styleModel.get('class_name'));
            this.currentView.setupAce();
        },

        elementSelected: function(widgetModel) {

            if(!this.expanded) return;

            var type = widgetModel.get('type');
            if(widgetModel.isList()) {
                type = "lists";
            }
            var className = widgetModel.get('className');
            var styleModel = this.model.getStyleWithClassAndType(className, type);
            this.$el.find('.navback').show();
            //this.styleSelected(styleModel);
        },

        openThemePicker: function() {
            if(this.currentView) this.currentView.close();
            $(this.elementsList).hide();

            this.currentView = new ThemesGalleryView();
            this.el.appendChild(this.currentView.render().el);
            this.setTitle("Theme Picker");
            this.$el.find('.navback').show();
        },

        navBack: function() {
            if (this.currentView) this.currentView.close();
            this.expand();
            this.disableResizable();
            $(this.elementsList).show();
            this.setTitle("CSS Editor");
            this.$el.find('.navback').hide();
        },

        setTitle: function(str) {
            this.titleDiv.innerHTML = str;
        },

        makeResizable: function () {
            var self = this;
            this.$el.resizable({
                handles: "e",
                iframeFix: true,
                start: function(event, ui) {
                    $('#page').css('pointer-events','none');
                    self.$el.removeClass('animated');
                },
                stop: function(event, ui) {
                    $('#page').css('pointer-events','auto');
                    self.$el.addClass('animated');
                }
            });
        },

        disableResizable: function (argument) {
            if(this.$el.hasClass("ui-resizable")) {
                this.$el.resizable( "destroy" );
                this.el.style.width = '';
            }
        },

        expandExtra: function (argument) {

            if(!this.$el.hasClass('expanded')){
                this.el.className += ' expanded';
            }

            if(!this.$el.hasClass('extra')) {
                this.el.className += ' extra';
            }

            this.expanded = true;
        },

        expand: function() {
            if(!this.$el.hasClass('expanded')) {
                this.el.className += ' expanded';
            }

            if(this.$el.hasClass('extra')) {
                this.$el.removeClass('extra');
            }

            this.expanded = true;
        },

        hide: function() {
            this.$el.removeClass('expanded');
            this.disableResizable();
            this.expanded = false;
        },

        save: function() {
            var self = this;
            var json = this.model.serialize();
            var save_url = '/app/' + appId + '/uiestate/';
            // var currentTime = new Date().getTime();

            // if(this.lastSave === null || currentTime - this.lastSave < 3000) {
            //     if(this.timer) clearTimeout(this.timer);
            //     if(this.lastSave === null) {
            //         this.lastSave = currentTime + 1;
            //     }

            //     this.timer = setTimeout(this.save, 3000);
            //     return;
            // }

            // this.lastSave = currentTime;
            $.ajax({
                type: "POST",
                url: save_url,
                data: {
                    uie_state: JSON.stringify(json)
                },
                statusCode: {
                    200: function(data) {
                        console.log('Saved.');
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
