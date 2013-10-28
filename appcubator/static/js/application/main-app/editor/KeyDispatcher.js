define([
  'jquery.hotkeys'
],
function () {

  var KeyDispatcher = function() {
    
    this.bindings = {};
    this.environments  = [ document ];
    this.store = [];

    this.addEnvironment = function(env) {
      this.environments.push(env);
      this.initializeEnvironment(env);
    };

    this.bind = function(keyComb, fn, type) {
      _.each(this.environments, function(env) {
        $(env).bind('keydown', keyComb, fn);
      });
    };

    this.bindComb = function(keyComb, fn, type) {
      this.store.push({keyComb: keyComb, fn: fn, type: type });
      _.each(this.environments, function(env) {
        $(env).bind('keydown', keyComb, fn);
      });
    };

    this.unbind = function(keyComb, fn, type) {
      _.each(this.environments, function(env) {
        $(env).unbind('keydown', keyComb, fn);
      });
      this.removeFromStore(keyComb, fn, type);
    };

    this.removeFromStore = function(keyComb, fn, type) {
      var indToRemove = [];
      _.each(this.store, function(binding, ind) {
        if(binding.keyComb == keyComb && binding.fn == fn) {
          intToRemove.push(ind);
        }
      });
    };

    this.initializeEnvironment = function(env) {
      _.each(this.store, function(binding) {
        $(env).bind('keydown', binding.keyComb, binding.fn);
      });
    };

  };

  return KeyDispatcher;
});