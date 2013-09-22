define(function(require, exports, module) {
    'use strict';

    require('backbone');


    var EntityManager = Backbone.Model.extend({

        initialize: function(options) {
            _.bindAll(this);
            this.pages = options.pages;
        },

        getWidgetsRelatedToTable: function(tableM) {
            var widgetsWithEntity = this.searchCollectionForKey(this.pages, "entity", function(val) {
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
            var widgetsWithGoto = this.searchCollectionForKey(this.pages, "goto", function(val) {
                return val == "internal://" + pageM.get('name');
            });
            var widgetsWithHref = this.searchCollectionForKey(this.pages, "href", function(val) {
                return val == "internal://" + pageM.get('name');
            });
            return _.union(widgetsWithGoto, widgetsWithHref);
        },


        getWidgetsRelatedToField:  function(fieldM) {
            var widgetsWithField = this.searchCollectionForKey(this.pages, "field_name", function(val) {
                return val == fieldM.get('name');
            });

            return widgetsWithField;
        },

        searchCollectionForKey: function(pagesColl, key, truthTest) {
            var self = this;
            var widgets = [];
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
