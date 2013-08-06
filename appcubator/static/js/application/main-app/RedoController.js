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
      this.undoStack.push(changeObj);
    },

    removed: function(model, collection) {
      var changeObj = {
        action: 'removed',
        obj: model,
        collection: collection
      };
      this.undoStack.push(changeObj);
    },

    changed: function(model) {
      var changeObj = {
        action: 'changed',
        prevAttributes: _.clone(model._previousAttributes),
        obj: model
      };
      this.undoStack.push(changeObj);
    },

    isModel: function(obj) {
      if(obj && obj.attributes) return true;
      return false;
    },

    isCollection: function (obj) {
      if(obj && obj.models) return true;
      return false;
    },

    undo: function() {
      var obj = this.undoStack.pop();
      if(!obj) return;
      var reverted_obj = this.pushChange(obj);
      this.redoStack.push(reverted_obj);
    },

    redo: function() {
      var obj = this.redoStack.pop();
      console.log(obj);
      if(!obj) return;
      this.pushChange(obj);
      //this.redoStack.push(obj);
    },

    pushChange: function(obj) {

      var revertedObj = {};

      switch(obj.action) {
        case "added":
          this.stopListening(obj.collection, 'remove', this.removed);
          obj.collection.remove(obj.obj);
          this.listenTo(obj.collection, 'remove', this.removed);

          revertedObj.action = "removed";
          revertedObj.collection = obj.collection;
          revertedObj.obj = obj.obj;
          break;
        case "removed":
          this.stopListening(obj.collection, 'add', this.added);
          obj.collection.add(obj.obj);
          this.listenTo(obj.collection, 'add', this.added);

          revertedObj.action = "added";
          revertedObj.collection = obj.collection;
          revertedObj.obj = obj.obj;
          break;
        case "changed":
          revertedObj.prevAttributes = _.clone(obj.obj.attributes);

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

          revertedObj.action = "changed";
          revertedObj.obj = obj.obj;

          break;
      }

      return revertedObj;
    }
  });

  return RedoController;
});
