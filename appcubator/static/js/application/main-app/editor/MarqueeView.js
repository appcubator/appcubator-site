define([
  'editor/WidgetEditorView',
  'mixins/BackboneUI',
  'iui'
],
function(WidgetEditorView) {

  var WidgetSelectorView = Backbone.UIView.extend({
    className : 'marquee-view',
    tagName : 'div',
    isDrawing: false,
    origin: {
      x: 0, y: 0
    },

    events : {

    },

    initialize: function(){
      _.bindAll(this);
    },

    mousedown: function(e) {
      if(mouseDispatcher.isMousedownActive) {
        return true;
      }

      this.$el.show();
      this.isDrawing = true;


      var coorX = e.pageX;
      var coorY = e.pageY;
      var dist = this.getPageTopLeft();
      coorX -= dist.left;
      coorY -= dist.top;

      this.setTop(coorY);
      this.setLeft(coorX);
      this.setWidth(6);
      this.setHeight(6);

      this.origin.x = coorX;
      this.origin.y = coorY;

    },

    mouseup: function(e) {
      this.isDrawing = false;
      this.setZero();
    },

    mousemove: function(e) {
      e.returnValue = false;
      if(!this.isDrawing) return;

      var coorX = e.pageX;
      var coorY = e.pageY;
      var dist = this.getPageTopLeft();
      coorX -= dist.left;
      coorY -= dist.top;

      if(coorX < 0 || coorY < 0) {
        return;
      }

      var distWidth = this.origin.x - coorX;
      var distHeight = this.origin.y - coorY;
      var diffWidth = Math.abs(this.origin.x - coorX);
      var diffHeight = Math.abs(this.origin.y - coorY);


      this.setWidth(diffWidth);
      if(distWidth == diffWidth) {
        this.setLeft(this.origin.x - diffWidth);
      }
      else {
        this.setLeft(this.origin.x);
      }

      this.setHeight(diffHeight);
      if(distHeight == diffHeight) {
        this.setTop(this.origin.y - diffHeight);
      }
      else {
        this.setTop(this.origin.y);
      }

    },

    setZero: function() {
      this.$el.hide();
      this.setWidth(0);
      this.setHeight(0);
    },

    render: function() {
      // window.addEventListener('mouseup', this.mouseup);
      // document.getElementById('page').addEventListener('mousedown', this.mousedown);
      // document.getElementById('page').addEventListener('mousemove', this.mousemove);
      this.el.className = 'marquee-view';
      this.el.id = 'marquee-view';
      this.container = document.getElementById('elements-container');
      this.setZero();
      return this;
    },

    getPageTopLeft: function() {
      var rect = this.container.getBoundingClientRect();
      var docEl = document.documentElement;
      return {
          left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0),
          top: rect.top + (window.pageYOffset || docEl.scrollTop || 0)
      };
    }

  });

  return WidgetSelectorView;

});
