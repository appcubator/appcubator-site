define(function(require, exports, module) {

    'use strict';

    var UIElementCollection = require('collections/UIElementCollection');

    var ThemeModel = Backbone.Model.extend({

        initialize: function(themeState) {
            this.set('basecss', themeState.basecss || "font-size:14px;");
            //this.set('pages', new PageDesignCollection(themeState.pages));

            this.set('buttons', new UIElementCollection(themeState["buttons"], "button"));
            this.set('images', new UIElementCollection(themeState["images"], "image"));
            this.set('headerTexts', new UIElementCollection(themeState["headerTexts"], "header-text"));
            this.set('texts', new UIElementCollection(themeState["texts"], "text"));
            this.set('links', new UIElementCollection(themeState["links"], "link"));
            this.set('textInputs', new UIElementCollection(themeState["textInputs"], "text-input"));
            this.set('passwords', new UIElementCollection(themeState["passwords"], "password"));
            this.set('textAreas', new UIElementCollection(themeState["textAreas"], "text-area"));
            this.set('lines', new UIElementCollection(themeState["lines"], "line"));
            this.set('dropdowns', new UIElementCollection(themeState["dropdowns"], "dropdown"));
            this.set('boxes', new UIElementCollection(themeState["boxes"], "box"));
            this.set('forms', new UIElementCollection((themeState["forms"] || []), "form"));
            this.set('lists', new Backbone.Collection((themeState["lists"] || []), "list"));
            this.set('fonts', new Backbone.Collection(themeState["fonts"] || []));
        },

        getUIElementCollections: function() {

            return [this.get('buttons'), this.get('images'), this.get('headerTexts'),
                this.get('texts'), this.get('links'), this.get('textInputs'),
                this.get('passwords'), this.get('textAreas'), this.get('lines'),
                this.get('dropdowns'), this.get('boxes'), this.get('forms'),
                this.get('lists')];
        },

        getStyleWithClassAndType: function(className, type) {
            var model = null;

            if (!this.has(type))
            {
                type = this.rectifier(type);
                if (!this.has(type)) return null;
            }

            this.get(type).each(function(styleModel) {
                if (styleModel.get('class_name') == className) {
                    model = styleModel;
                }
            });

            return model;
        },

        getUIEVals: function(type) {

            if(this.has(type)) {
                return this.get(type);
            }

            switch(type) {
                case "button":
                    return this.getUIEVals("buttons");
                case "header":
                    return this.getUIEVals("headerTexts");
                case "image":
                    return this.getUIEVals("images");
                case "text":
                    return this.getUIEVals("texts");
                case "link":
                    return this.getUIEVals("links");
                case "line":
                    return this.getUIEVals("lines");
                case "box":
                    return this.getUIEVals("boxes");
                case "create-form":
                case "form":
                    return this.getUIEVals("forms");
            }

            return this.getUIEVals("texts");
        },

        getBaseClass: function (type) {
            if(this.has(type)) {
                return this.get(type).first().get('class_name');
            }
            return null;
        },

        getBaseStyleOf: function(type) {

            if(this.has(type)) {
                return this.get(type).first();
            }

            if(this.has(this.rectifier(type))) {
                return this.get(this.rectifier(type)).first();
            }

            return null;
        },

        rectifier: function (falseType) {
            switch(falseType) {
                case "button":
                    return "buttons";
                case "header":
                    return "headerTexts";
                case "image":
                    return "images";
                case "text":
                    return "texts";
                case "link":
                    return "links";
                case "line":
                    return "lines";
                case "box":
                    return "boxes";
                case "form":
                    return "forms";
            }

            return null;
        },

        serialize: function() {
            var json = _.clone(this.attributes);

            json["buttons"] = this.get('buttons').serialize();
            json["images"] = this.get('images').serialize();
            json["headerTexts"] = this.get('headerTexts').serialize();
            json["texts"] = this.get('texts').serialize();
            json["links"] = this.get('links').serialize();
            json["textInputs"] = this.get('textInputs').serialize();
            json["passwords"] = this.get('passwords').serialize();
            json["textAreas"] = this.get('textAreas').serialize();
            json["lines"] = this.get('lines').serialize();
            json["dropdowns"] = this.get('dropdowns').serialize();
            json["boxes"] = this.get('boxes').serialize();
            json["forms"] = this.get('forms').serialize();
            json["lists"] = this.get('lists').serialize();
            json["fonts"] = this.get('fonts').serialize();

            return json;
        }

    });

    return ThemeModel;
});
