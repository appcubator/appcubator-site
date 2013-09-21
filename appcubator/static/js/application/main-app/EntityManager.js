define(function(require, exports, module) {
    'use strict';

    require('backbone');

    var WidgetRegister = Backbone.Model.extend({
        initialize: function(bone) {
            bone.widgetM.on('remove', this.remove);
        }
    });

    var EntityManager = Backbone.Model.extend({

        relations : {},

        initialize: function(options) {
            _.bindAll(this);

            this.pages = options.pages;
            this.bindExisting(this.pages);
            this.relations = {};
        },

        bindExisting: function(pagesColl) {
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

        register: function(entityCid, widgetM, pageName) {
            if(!this.relations[entityCid]) {
                this.relations[entityCid] = new Backbone.Collection({ model: WidgetRegister});
            }

            this.relations[entityCid].push({ widget: widgetM, pageName: pageName});
        },

        getWidgetsRelatedToTable: function(tableM) {
            if(this.relations[tableM.cid]) {
                return this.relations[tableM.cid].toJSON();
            }
            return [];
        }

    });

    return EntityManager;
});
