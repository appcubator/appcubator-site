define([
  'mixins/BackboneModal',
  'util'
],
function() {

  var RedoController = Backbone.View.extend({
    redoStack: [],
    undoStack: [],

    initialize: function(data) {
      _.bindAll(this);
      this.startLogging();
    },

    startLogging: function () {
      var uiElements = v1State.getCurrentPage().get('uielements');
      this.bindCollection(uiElements);
    },

    bindCollection: function(coll) {
      this.listenTo(coll, 'add', this.added);
      this.listenTo(coll, 'remove', this.removed);
      this.listenTo(coll, 'change', this.changed);
      coll.each(this.bindModel);
    },

    bindModel: function(model) {
      this.listenTo(model, 'change', this.changed);
      _(model.attributes).each(function(val, key) {

        console.log(key);
        if(this.isModel(val)) { console.log("is model"); this.bindModel(val); }
        else if(this.isCollection(val)) { this.bindCollection(val); }

      }, this);
    },

    added: function(a, b, c, d, e, f, g) {
      console.log("added");
    },

    removed: function(a, b, c, d, e, f, g) {
      console.log("removed");
    },

    changed: function(model) {
      console.log("hey");
      var changeObj = {
        action: 'change',
        prevAttributes: _.clone(model._previousAttributes),
        obj: model
      };
      this.redoStack.push(changeObj);
      console.log("changed");
    },

    isModel: function(obj) {
      if(obj.attributes) return true;
      return false;
    },

    isCollection: function (obj) {
      if(obj.models) return true;
      return false;
    },

    redo: function() {
      var obj = this.redoStack.pop();
      console.log(obj.obj);
      console.log(obj.prevAttributes);
      obj.obj.attributes = _.clone(obj.prevAttributes);
      this.stopListening(obj.obj, 'change', this.changed);
      obj.obj.trigger('change');
      this.listenTo(obj.obj, 'change', this.changed);
    }
  });

  return RedoController;
});
