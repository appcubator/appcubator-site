define([
  'key'
],
function () {

  var KeyDispatcher = function() {
    this.bindings = {};

    this.bind = function(keyComb, fn, type) {
      key(keyComb, fn);
      if(type) { this.store(keyComb, fn ,type); }
    };

    this.unbind = function(keyComb, fn, type) {
      key.unbind(keyComb);
    },

    this.store = function(keyComb, fn, type) {
      if(!this.bindings[type]) { this.bindings[type] = []; }
      this.bindings[type].push({key: keyComb, type: type});
    };

  };

  return KeyDispatcher;
});