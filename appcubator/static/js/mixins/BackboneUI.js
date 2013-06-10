define([
  'backbone',
  'jquery-ui'
],

function(Backbone) {

  Backbone.UIView = Backbone.View.extend({

    resizableAndDraggable: function() {
      var self = this;

      $(self.el).resizable({
        handles: "n, e, s, w, nw, ne, sw, se",
        // grid: [80, 15],
        containment: "parent",
        resize: self.resizing,
        stop  : self.resized
      });

      self.$el.draggable({
        containment: "parent",
        //grid: [80, 15],
        drag: self.moving,
        stop: self.moved,
        snapMode : "outer"
      });

      this.setPosition("absolute");
    },

    draggable: function() {
      var self = this;
      self.$el.draggable({
        containment: parent,
        grid: [80, 15],
        drag: self.moving,
        stop: self.moved
      });
    },

    resizable: function() {
      var self = this;
      self.$el.resizable({
        handles: "n, e, s, w, se",
        grid: 30,
        resize: self.resizing,
        stop: self.resized
      });

      this.setPosition("absolute");
    },

    disableResizeAndDraggable: function() {
      if(this.$el.hasClass('ui-resizable')) {
        $(this.el).resizable("disable");
      }
      if(this.$el.hasClass('ui-draggable')) {
        $(this.el).draggable("disable");
      }
    },

    clear : function() {
      this.disableResizeAndDraggable();
      this.el.className = this.className;
      this.el.innerHTML = '';
    },

    setLeft : function(val) {
      this.el.style.left = val + "px";
    },

    setRight : function(val) {
      this.el.style.right = val + "px";
    },

    setTop: function(val) {
      this.el.style.top = val + "px";
    },

    setHeight: function(val) {
      this.el.style.height = val + "px";
    },

    setWidth: function(val) {
      this.el.style.width = val + "px";
    },

    setBottom: function(val) {
      this.el.style.bottom = val + "px";
    },

    setPosition: function(val) {
      this.el.style.position = val;
    }

  });

  return Backbone;

});
