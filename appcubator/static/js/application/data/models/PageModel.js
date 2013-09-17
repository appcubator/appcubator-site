define(function(require, exports, module) {
    'use strict';


    var WideRowCollection = require('collections/WideRowCollection'),
        UrlModel   = require('models/UrlModel'),
        NavbarModel = require('models/NavbarModel'),
        FooterModel = require('models/FooterModel');

    var PageModel = Backbone.Model.extend({
        defaults: {
            "name": "default-page",
            "access_level": "all",
            "uielements": []
        },

        _currentColumn: null,

        initialize: function(bone) {
            bone = bone || {};
            var self = this;
            if (bone.url && bone.url.urlparts.length === 0) {
                // homepage shouldn't have a customizable url
                if (this.get('name') === 'Homepage') {
                    bone.url.urlparts = [];
                } else {
                    bone.url.urlparts = [this.get('name') || "Page Name"];
                }
            }
            console.log(bone);
            this.set('url', new UrlModel(bone.url || {}));
            this.set('navbar', new NavbarModel(bone.navbar || {}));
            this.set('footer', new FooterModel(bone.footer || {}));
            this.set('rows', new WideRowCollection(bone.rows||[]));
        },

        getHeight: function() {
            var height = 0;

            this.get('rows').each(function(rowM) {
                var layout = rowM.get('height');
                height += layout;
            });

            return height;
        },

        addToContext: function(tableM) {
            this.get('url').get('urlparts').push({
                value: '{{' + tableM.get('name') + '}}'
            });
        },

        hasContext: function(tableM) {
            return this.doesContainEntityName(tableM.get('name'));
        },

        doesContainEntityName: function(entityName) {
            return _.contains(this.get('url').get('urlparts').pluck('value'), '{{' + entityName + '}}');
        },

        getContextEntities: function() {
            var entities = [];
            this.get('url').get('urlparts').each(function(urlPart) {
                var part = urlPart.get('value');
                if (/{{([^\}]+)}}/g.exec(part)) entities.push(/\{\{([^\}]+)\}\}/g.exec(part)[1]);
            });
            return entities;
        },

        getContextSentence: function() {
            var entities = [];
            this.get('url').get('urlparts').each(function(urlPart) {
                if (/{{([^\}]+)}}/g.exec(urlPart.get('value'))) entities.push(/\{\{([^\}]+)\}\}/g.exec(urlPart.get('value'))[1]);
            });

            if (entities.length === 0) {
                return "";
            } else if (entities.length === 1) {
                return "Page has a " + entities[0];
            } else {
                var str = "Page has ";
                _(entities).each(function(val, ind) {
                    if (ind == entities.length - 1) {
                        str += "and a " + val;
                    } else {
                        str += "a " + val + " ";
                    }
                });

                return str;
            }
        },

        getFields: function() {
            var access = this.get('access_level');

            if (access == "all") {
                return v1State.get('users').getCommonProps();
            }
            if (access == "users") {
                return v1State.get('users').getCommonProps();
            }

            var model = v1State.get('users').getUserTableWithName(access);
            return model.getFieldsColl().models;
        },

        updatePageName: function(urlModel, newPageName) {
            this.set('page_name', newPageName);
        },

        getLinkLang: function(contextArgs) {
            var str = "internal://" + this.get('name');
            var entities = this.getContextEntities();
            if (entities.length) {
                str += '/?' + entities[0] + '=' + this.getPageContextDatalang();
            }
            return str;
        },

        getPageContextDatalang: function() {
            var entities = this.getContextEntities();
            return "Page." + entities[0];
        },

        setCurrentColumn: function(columnM) {
            this._currentColumn = columnM;
        },

        getCurrentColumn: function() {
            return this._currentColumn;
        },

        toJSON: function() {
            var json = _.clone(this.attributes);
            json.url = this.get('url').toJSON();
            json.navbar = this.get('navbar').toJSON();
            json.footer = this.get('footer').toJSON();
            json.uielements = this.get('uielements').toJSON();
            return json;
        }
    });

    return PageModel;
});