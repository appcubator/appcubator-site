define([
  'jquery.hotkeys'
],
function () {

  var KeyDispatcher = function() {
    this.bindings = {};
    this.environments  = [ document ];

    this.addEnvironment = function(env) {
      this.environments.push(env);
    };

    this.bind = function(keyComb, fn, type) {
      _.each(this.environments, function(env) {
        $(env).bind('keydown', keyComb, fn);
      });
    };

    this.bindComb = function(keyComb, fn, type) {
      _.each(this.environments, function(env) {
        $(env).bind('keydown', keyComb, fn);
      });
    };

    this.unbind = function(keyComb, fn, type) {
      _.each(this.environments, function(env) {
        $(env).unbind('keydown', keyComb, fn);
      });
    };

    this.store = function(keyComb, fn, type) {
      if(!this.bindings[type]) { this.bindings[type] = []; }
      this.bindings[type].push({key: keyComb, type: type});
    };

  };

  return KeyDispatcher;
});