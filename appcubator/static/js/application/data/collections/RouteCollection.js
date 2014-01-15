define(function(require, exports, module) {

    require('backbone');

    var RouteModel = require('models/RouteModel');

    var RouteCollection = Backbone.Collection.extend({
        
        model: RouteModel,
        uniqueKeys: ["name"],

        getContextFreePages: function() {
            var pagesList = _(this.getContextFreePageModels()).map(function(pageM) {
                return pageM.get('name');
            });
            return pagesList;
        },

        getContextFreePageModels: function() {
            var pagesList = [];
            this.each(function(page) {
                if (!page.get('url').get('urlparts').some(function(part) {
                    return (/\{\{([^\}]+)\}\}/g).test(part.get('value'));
                })) {
                    pagesList.push(page);
                }
            });

            return pagesList;
        },

        getPagesWithEntityName: function(entityName) {
            var pagesList = [];
            this.each(function(page) {
                if (page.doesContainEntityName(entityName)) {
                    pagesList.push(page.get('name'));
                }
            });

            return pagesList;
        },

        getPageModelsWithEntityName: function(entityName) {
            var pagesList = [];
            this.each(function(page) {
                if (page.doesContainEntityName(entityName)) {
                    pagesList.push(page);
                }
            });

            return pagesList;
        },

        removePagesWithContext: function(tableM) {
            var arr = this.getPageModelsWithEntityName(tableM.get('name'));
            _.each(arr, function(pageM) {
                this.remove(pageM);
            }, this);
        }

    });

    return RouteCollection;
});