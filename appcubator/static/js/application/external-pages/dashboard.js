require.config({
    paths: {
        "jquery": "../../libs/jquery/jquery",
        "bootstrap": "../../libs/bootstrap/bootstrap",
        "app": "../main-app",
        "util": "../../libs/util/util",
        "mixins": "../../mixins",
        "backbone": "../../libs/backbone-amd/backbone",
        "underscore": "../../libs/underscore-amd/underscore",
        "jquery-ui": "../../libs/jquery-ui/jquery-ui"
    },

    shim: {
        "bootstrap": {
            deps: ["jquery"]
        },
        "backbone": {
            exports: "Backbone",
            deps: ["underscore", "jquery"]
        },
        "underscore": {
            exports: "_"
        },
        "jquery": {
            exports: "$"
        }
    }

});

require([
        'app/OverviewPageView',
        '../main-app/GarageView',
        '../main-app/WorldView',
        'util',
        'backbone'
],
function(OverviewPageView, GarageView, WorldView) {

    var DashboardsView = Backbone.View.extend({
        el: document.getElementById('dashboards'),

        events: {
            'click .menu-item' : 'changePage'
        },

        initialize: function() {
            this.render();
            console.log("INIT");
        },

        changePage: function(e) {
            var appId = e.currentTarget.id.replace('menu-item-','');
            $('.current').removeClass('current');
            $('#dashboard-' + appId).addClass('current');

            console.log(appId);
            this.dashboardView = new OverviewPageView({ appId: appId });
            this.dashboardView.setElement(document.getElementById('dashboard-' + appId)).render();
        }
    });

  $(document).ready(function() {
    new DashboardsView();
    Backbone.history.start({pushState: true});
  });

});