define([
  'jquery'
],
function() {

  var RouteLogger = function(options) {
      this.router = options.router;
      this.router.bind('route', this.logRoute, this);
  };

  RouteLogger.prototype.logRoute = function(router, route, params) {
    var appID = route[0];
    if(router) {
      $.ajax({
        type: 'POST',
        url: '/app/'+appID+'/log/routes/',
        data: {
          "page_name": router || 'unknown'
        },
        dataType: 'JSON'
      });
    }
  };

  return RouteLogger;

});
