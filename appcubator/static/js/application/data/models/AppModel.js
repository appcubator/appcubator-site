define(function(require, exports, module) {

    'use strict';

    require('backbone');

    var AppInfoModel = require('models/AppInfoModel'),
        NodeModelCollection = require('collections/NodeModelCollection'),
        TemplateCollection = require('collections/TemplateCollection'),
        PluginsModel = require('models/PluginsModel'),
        RouteCollection = require('collections/RouteCollection');


    var AppModel = Backbone.Model.extend({

        currentPage: null,
        lazy: {},

        initialize: function(aState) {
            if (!aState) return;

            this.set('info', new AppInfoModel(aState.info));
            this.set('models', new NodeModelCollection(aState.models));
            this.set('templates', new TemplateCollection(aState.templates));
            this.set('plugins', new PluginsModel(aState.plugins || {}));
            this.set('routes', new RouteCollection(aState.routes || []));

            Backbone.Regrettable.bind(this.get('templates'));
            Backbone.Regrettable.bind(this.get('models'));
            Backbone.Regrettable.bind(this.get('routes'));

        },

        getTableModelWithName: function(nameStr) {
            var tableM = this.get('models').getTableWithName(nameStr);
            return tableM;
        },

        getTableModelWithCid: function(cid) {
            var tableM = this.get('models').get(cid);
            return tableM;
        },

        lazySet: function(key, coll) {
            this.lazy[key] = coll;
            this.set(key, new Backbone.Collection([]));
        },

        get: function(key) {
            if (this.lazy[key]) {
                this.set(key, this.lazy[key]);
                delete this.lazy[key];
            }

            return AppModel.__super__.get.call(this, key);
        },

        serialize: function(options) {
            var json = _.clone(this.attributes);
            json.info = json.info.serialize(options);
            json.models = json.models.serialize(options);
            json.templates = json.templates.serialize(options);
            json.routes = json.routes.serialize(options);
            json.plugins = json.plugins.serialize(options);

            return json;
        }
    });

    return AppModel;
});
