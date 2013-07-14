define([
  'jquery.hotkeys'
],
function () {

  var KeyDispatcher = function() {
    this.bindings = {};

    this.bind = function(keyComb, fn, type) {
      $(document).bind('keydown', keyComb, fn);
    };

    this.bindComb = function(keyComb, fn, type) {
      $(document).bind('keydown', keyComb, fn);
    },

    this.unbind = function(keyComb, fn, type) {
      $(document).unbind('keydown', fn);
    },

    this.store = function(keyComb, fn, type) {
      if(!this.bindings[type]) { this.bindings[type] = []; }
      this.bindings[type].push({key: keyComb, type: type});
    };

  };

  return KeyDispatcher;
});