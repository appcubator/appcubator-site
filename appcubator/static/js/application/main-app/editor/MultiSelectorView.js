define([
  'mixins/BackboneUI',
  'util'
],
function() {

  var WidgetSelectorView = Backbone.UIView.extend({
    className : 'multi-selector',
    tagName : 'div',
    contents: [],

    events : {
      // 'click #hover-div'     : 'hoverClicked',
      // 'click #select-div'    : 'doubleClicked',
      // 'mousedown #hover-div' : 'mousedown',
      // 'mousedown #select-div': 'mousedown',
      // 'mouseup #hover-div'   : 'mouseup',
      // 'mouseup #select-div'  : 'mouseup'
    },

    initialize: function(){
      _.bindAll(this);
      var self = this;
      this.doKeyBindings();
    },

    setContents: function(arr) {
      this.contents = arr;
      this.selectAll();
    },

    // mousedown: function(e) { mouseDispatcher.isMousedownActive = true; },
    // mouseup  : function(e) { mouseDispatcher.isMousedownActive = false; },

    render: function() {
      $('.page.full').on('mousedown', this.clickedPage);
      return this;
    },

    bindWidget: function(widget) {

    },

    unbindAll: function() {
    },


    moveSelectedDown: function(e) {
      if(!this.contents.length) return;
      if(keyDispatcher.textEditing === true) return;
      _(this.contents).each(function(widgetModel) {
        widgetModel.moveDown();
      });

      e.preventDefault();
    },

    moveSelectedUp: function() {
      if(!this.contents.length) return;
      if(keyDispatcher.textEditing === true) return;
      _(this.contents).each(function(widgetModel) {
        widgetModel.moveUp();
      });
    },

    moveSelectedLeft: function() {
      if(!this.contents.length) return;
      if(keyDispatcher.textEditing === true) return;
      _(this.contents).each(function(widgetModel) {
        widgetModel.moveLeft();
      });
    },

    moveSelectedRight: function() {
      if(!this.contents.length) return;
      if(keyDispatcher.textEditing === true) return;
      _(this.contents).each(function(widgetModel) {
        widgetModel.moveRight();
      });
    },

    deleteSelected: function(e) {
      if(!this.contents.length) return;
      if(keyDispatcher.textEditing === true) return;
      e.preventDefault();
      _(this.contents).each(function(widgetModel) {
        widgetModel.remove();
      });
    },

    doKeyBindings: function() {
      keyDispatcher.bind('down', this.moveSelectedDown);
      keyDispatcher.bind('up', this.moveSelectedUp);
      keyDispatcher.bind('left', this.moveSelectedLeft);
      keyDispatcher.bind('right', this.moveSelectedRight);
      keyDispatcher.bind('backspace', this.deleteSelected);
    },

    selectAll: function() {
      _(this.contents).each(function(widgetModel) {
        $('#widget-wrapper-'+widgetModel.cid).addClass('red-border');
      });
    },

    unselectAll: function() {
      _(this.contents).each(function(widgetModel) {
        $('#widget-wrapper-'+widgetModel.cid).removeClass('red-border');
      });
    },

    empty: function() {
      this.contents = [];
      this.unselectAll();
    },

    clickedPage: function(e) {
      this.empty();
    },

    remove: function() {
      keyDispatcher.unbind('down', this.moveSelectedDown);
      keyDispatcher.unbind('up', this.moveSelectedUp);
      keyDispatcher.unbind('left', this.moveSelectedLeft);
      keyDispatcher.unbind('right', this.moveSelectedRight);
      keyDispatcher.unbind('backspace', this.deleteSelected);
      $('.page.full').off('mousedown', this.clickedPage);
      Backbone.View.prototype.remove.call(this);
    }
  });

  return WidgetSelectorView;

});
