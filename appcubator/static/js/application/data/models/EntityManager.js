define(function(require, exports, module) {
    'use strict';

    require('backbone');


    var EntityManager = Backbone.Model.extend({

        initialize: function(options) {
            _.bindAll(this);
        },

        searchCollection: function(pagesColl) {
            var self = this;

            pagesColl.each(function(pageM) {
                pageM.get('uielements').each(function(widgetM) {
                    self.searchForEntity(widgetM, pageM);
                });
            });

            return this;
        },

        searchForEntity: function(widgetM, pageM) {

            var entity = null;

            var checkIfEntity = function(model) {
                _.each(model.attributes, function(val, key) {
                    if(entity) return;
                    if(key == "entity") {
                        entity = val;
                        return;
                    }
                    else if(Backbone.isModel(val)) {
                        checkIfEntity(val);
                    }
                });
            };

            checkIfEntity(widgetM);

            if(entity) {
                if(Backbone.isModel(entity)) {
                    this.register(entity.cid, widgetM, pageM.get('name'));
                }
                else {
                    entity = v1State.getTableModelWithName(entity);
                    if(Backbone.isModel(entity)) {
                        this.register(entity.cid, widgetM, pageM.get('name'));
                    }
                }
            }
        },

        register: function(cid, widgetM, pageName) {
            if(!this.has(entityCid)) {
                this.set(entityCid, new Backbone.Collection());
            }
            this.get(entityCid).add({ widget: widgetM, pageName: pageName});
        },

        getWidgetsRelatedToTable: function(pagesColl, tableM) {
            this.searchCollectionForKey(pagesColl, "entity");
            if(this.get(tableM.cid)) {
                return this.get(tableM.cid).toJSON();
            }
            return [];
        },

        getWidgetsRelatedToPage:  function(pagesColl, pageM) {
            this.searchCollectionForKey(pagesColl, "goto");
            if(this.get(pageM.cid)) {
                return this.get(pageM.cid).toJSON();
            }
            return [];
        }

    });

    return EntityManager;
});
