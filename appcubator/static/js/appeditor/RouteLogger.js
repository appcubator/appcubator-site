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
      util.log_to_server('visited page', {page_name: router || "unknown" }, appID);
    }
  };

  return RouteLogger;

});
