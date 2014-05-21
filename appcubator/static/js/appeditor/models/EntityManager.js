define(function(require, exports, module) {
    'use strict';

    require('backbone');

    /* Convenience methods for coordinating delete model events */
    var EntityManager = Backbone.Model.extend({

        initialize: function(options) {
            _.bindAll(this);
            this.pages = options.pages;
        },

        getWidgetsRelatedToTable: function(tableM) {
            var widgetsWithEntity = this.searchPageWidgetCollectionForKey(this.pages, "entity", function(val) {
                if(Backbone.isModel(val)) {
                    return val.cid == tableM.cid;
                }
                else {
                    var table = v1State.getTableModelWithName(val);
                    return val == table.cid;
                }
            });

            return widgetsWithEntity;
        },

        getWidgetsRelatedToPage:  function(pageM) {
            var widgetsWithGoto = this.searchPageWidgetCollectionForKey(this.pages, "goto", function(val) {
                return val == "internal://" + pageM.get('name');
            });
            var widgetsWithHref = this.searchPageWidgetCollectionForKey(this.pages, "href", function(val) {
                return val == "internal://" + pageM.get('name');
            });

            return _.union(widgetsWithGoto, widgetsWithHref);
        },

        getLinksRelatedToPage: function(pageM) {
            var linksWithUrl= this.searchPageNavCollectionForKey(this.pages, "url", function(val) {
                return val == "internal://" + pageM.get('name');
            });

            return linksWithUrl;
        },

        getWidgetsRelatedToField:  function(fieldM) {
            var widgetsWithField = this.searchPageWidgetCollectionForKey(this.pages, "field_name", function(val) {
                return val == fieldM.get('name');
            });

            return widgetsWithField;
        },

        searchPageNavCollectionForKey: function(pagesColl, key, truthTest) {
            var self = this;
            var links = [];

            console.log(pagesColl);

            pagesColl.each(function(pageM) {
                var pageName = pageM.get('name');
                pageM.get('navbar').get('links').each(function(navLinkM) {
                    var navlink = self.searchForKeyInWidget(navLinkM, key, truthTest);
                    if(navlink) {
                        links.push({ link: navLinkM, pageName: pageName, section: "navigation bar" });
                    }
                });
                pageM.get('footer').get('links').each(function(navLinkM) {
                    var navlink = self.searchForKeyInWidget(navLinkM, key, truthTest);

                    if(navlink) {
                        links.push({ link: navLinkM, pageName: pageName, section: "footer" });
                    }
                });
            });

            return links;
        },

        searchPageWidgetCollectionForKey: function(pagesColl, key, truthTest) {
            var self = this;
            var widgets = [];

            console.log(pagesColl);

            pagesColl.each(function(pageM) {
                var pageName = pageM.get('name');

                pageM.get('uielements').each(function(widgetM) {
                    var widget = self.searchForKeyInWidget(widgetM, key, truthTest);

                    if(widget) {
                        widgets.push({ widget: widgetM, pageName: pageName});
                    }
                });
            });

            return widgets;
        },

        searchForKeyInWidget: function(widgetM, key, truthTest) {
            var lookingFor = null;

            var checkIfEntity = function(model) {
                _.each(model.attributes, function(val, attribKey) {
                    if(lookingFor) return;
                    if(attribKey == key && truthTest(val)) {
                        lookingFor = val;
                        return;
                    }
                    else if(Backbone.isModel(val)) {
                        checkIfEntity(val);
                    }
                    else if(Backbone.isCollection(val)) {
                        val.each(checkIfEntity);
                    }
                });
            };

            checkIfEntity(widgetM);

            return lookingFor;
        }

    });

    return EntityManager;
});
