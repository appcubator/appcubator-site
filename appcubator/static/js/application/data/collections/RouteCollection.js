define(function(require, exports, module) {

    require('backbone');

    var RouteModel = require('models/RouteModel');

    var RouteCollection = Backbone.Collection.extend({

        model: RouteModel,
        uniqueKeys: ["name"],

        getRouteWithTemplate: function(templateModel) {

            var templateName = templateModel.get('name');
            var routeM = null;
            this.each(function(routeModel) {
                if(routeModel.get('name') == templateName) {
                    routeM = routeModel;
                }
            });

            return routeM;
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
