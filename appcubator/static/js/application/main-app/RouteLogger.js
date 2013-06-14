define([
  'jquery'
],
function() {

  var RouteLogger = function(options) {
      this.router = options.router;
      this.pageNames = {
          'index': 'App Page',
          'showInfoPage': 'Domain&SEO',
          'showEntitiesPage': 'Tables',
          'showThemesPage' : 'Themes',
          'showPagesPage' : 'Pages',
          'showEditor' : 'Editor',
      };

      this.router.bind('route', this.logRoute, this);
  };

  RouteLogger.prototype.logRoute = function(router, route, params) {
    var appID = route[0];
    var pageName = this.pageNames[router];
    return; //temporarily prevent route logging
    if(pageName) {
      $.ajax({
        type: 'POST',
        url: '/app/'+appID+'/log/routes/',
        data: {
          "page_name": pageName || 'unknown'
        },
        dataType: 'JSON'
      });
    }
  };

  return RouteLogger;

});
