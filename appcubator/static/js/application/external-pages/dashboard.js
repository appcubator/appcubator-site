require.config({
    paths: {
        "jquery": "../../libs/jquery/jquery",
        "jquery-ui": "../../libs/jquery-ui/jquery-ui",
        "bootstrap": "../../libs/bootstrap/bootstrap",
        "app": "../main-app",
        "util": "../../libs/util/util",
        "util.filepicker": "../../libs/util/util.filepicker",
        "mixins": "../../mixins",
        "backbone": "../../libs/backbone-amd/backbone",
        "underscore": "../../libs/underscore-amd/underscore",
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
        },
        "jquery-ui": {
            exports: "$",
            deps: ['jquery']
        },
        "util.filepicker": {
            deps: ['util'],
            exports: "util"
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
        },

        render: function() {

            this.dashboardView = new OverviewPageView({ appId: initAppId });
            this.dashboardView.setElement(document.getElementById('dashboard-' + initAppId)).render();

        },

        changePage: function(e) {
            var appId = e.currentTarget.id.replace('menu-item-','');
            $('.current').removeClass('current');
            $('.selected').removeClass('selected');
            $('#menu-item-' + appId).addClass('selected');
            $('#dashboard-' + appId).addClass('current');

            if(this.dashboardView) this.dashboardView.undelegateEvents();
            appUrl = app_urls[appId];
            app = apps[appId];
            this.dashboardView = new OverviewPageView({ appId: appId });
            this.dashboardView.setElement(document.getElementById('dashboard-' + appId)).render();
        }
    });

  $(document).ready(function() {
    new DashboardsView();
    Backbone.history.start({pushState: true});

    $( document ).tooltip({
      position: {
        my: "center bottom-20",
        at: "center top",
        using: function( position, feedback ) {
          $( this ).css( position );
          $( "<div>" )
            .addClass( "arrow" )
            .addClass( feedback.vertical )
            .addClass( feedback.horizontal )
            .appendTo( this );
        }
      }
    });
  });

});