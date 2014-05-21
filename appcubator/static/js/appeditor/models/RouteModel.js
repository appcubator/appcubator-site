define([
        'models/UrlModel'
        ],
    function(UrlModel) {

        var RouteModel = Backbone.Model.extend({

            defaults: {
                "name": "default-page"
            },

            initialize: function(bone) {
                bone = bone || {};
                if (bone.url && bone.url.length === 0) {
                    // homepage shouldn't have a customizable url
                    if (this.get('name') === 'Homepage') {
                        bone.url = [];
                    } else {
                        bone.url = [this.get('name') || "Page Name"];
                    }
                }

                this.set('url', new UrlModel(bone.url || {}));
            },

            getUrlString: function() {
                return '/' + this.get('url').toJSON().join('/');
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
                // TODO: fix this
                // var access = this.get('access_level');

                // if (access == "all") {
                //     return v1State.get('users').getCommonProps();
                // }
                // if (access == "users") {
                //     return v1State.get('users').getCommonProps();
                // }

                // var model = v1State.get('users').getUserTableWithName(access);
                // return model.getFieldsColl().models;

                return [];
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

            getDataLang: function() {
                var str = "internal://" + this.get('name');
                return str;
            },

            getPageContextDatalang: function() {
                var entities = this.getContextEntities();
                return "Page." + entities[0];
            },

            validate: function() {
                var valid = true;
                var name = this.get('name');
                if (!util.isAlphaNumeric(name) || util.doesStartWithKeywords(name)) {
                    return false;
                }
            },

            setupUrl: function(name) {
                name = name.toLowerCase().replace(/ /g, '_');
                name = name.replace(/[^a-zA-Z0-9\s]+/g, '_');
                var urlparts = { value: name.toLowerCase().replace(/ /g, '_') };
                this.get('url').get('urlparts').reset([urlparts]);
            },

            isContextFree: function() {
                return (!this.get('url').get('urlparts').some(function(part) { return (/\{\{([^\}]+)\}\}/g).test(part.get('value')); }));
            },

            hasSearchList: function(searchOn) {
                var hasSearchList = false;
                this.get('uielements').each(function(widgetM) {
                    if(widgetM.isSearchList() && widgetM.get('data').get('container_info').get('entity').get('name') == searchOn) {
                        hasSearchList = true;
                    }
                });
                return hasSearchList;
            },

            toJSON: function() {
                var json = _.clone(this.attributes);
                if(json.url) { json.url = this.get('url').serialize(); }
                // json.navbar = this.get('navbar').serialize();
                // json.footer = this.get('footer').serialize();
                // json.uielements = this.get('uielements').serialize();
                return json;
            }
        });

        return RouteModel;
    });
