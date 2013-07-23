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

        if(this.isModel(val)) { this.bindModel(val); }
        else if(this.isCollection(val)) { this.bindCollection(val); }

      }, this);
    },

    added: function(model, collection) {
      var changeObj = {
        action: 'added',
        obj: model,
        collection: collection
      };
      this.redoStack.push(changeObj);
    },

    removed: function(model, collection) {
      var changeObj = {
        action: 'removed',
        obj: model,
        collection: collection
      };
      this.redoStack.push(changeObj);
    },

    changed: function(model) {
      var changeObj = {
        action: 'changed',
        prevAttributes: _.clone(model._previousAttributes),
        obj: model
      };
      this.redoStack.push(changeObj);
    },

    isModel: function(obj) {
      if(obj && obj.attributes) return true;
      return false;
    },

    isCollection: function (obj) {
      if(obj && obj.models) return true;
      return false;
    },

    redo: function() {
      var obj = this.redoStack.pop();
      if(!obj) return;

      switch(obj.action) {
        case "added":
          this.stopListening(obj.collection, 'remove', this.removed);
          obj.collection.remove(obj.obj);
          this.listenTo(obj.collection, 'remove', this.removed);
          break;
        case "removed":
          this.stopListening(obj.collection, 'add', this.added);
          obj.collection.add(obj.obj);
          this.listenTo(obj.collection, 'add', this.added);
          break;
        case "changed":
          obj.obj.attributes = _.clone(obj.prevAttributes);
          this.stopListening(obj.obj, 'change', this.changed);
          obj.obj.trigger('change');
          if(obj.obj.has('top')) {
            obj.obj.trigger('change:left');
            obj.obj.trigger('change:top');
            obj.obj.trigger('change:width');
            obj.obj.trigger('change:height');
          }
          this.listenTo(obj.obj, 'change', this.changed);
          break;
      }
    }
  });

  return RedoController;
});
