define([
  'editor/WidgetEditorView',
  'editor/MultiSelectorView',
  'mixins/BackboneUI',
  'util'
],
function(WidgetEditorView,
         MultiSelectorView) {

  var WidgetSelectorView = Backbone.UIView.extend({
    className : 'marquee-view',
    tagName : 'div',
    isDrawing: false,

    origin: { x: 0, y: 0 },
    clientOrigin: { x: 0, y: 0 },
    events : { },

    initialize: function(){
      _.bindAll(this);
      this.multiSelectorView = new MultiSelectorView();
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

      this.clientOrigin.x = e.clientX;
      this.clientOrigin.y = e.clientY;
    },

    mouseup: function(e) {
      var Xcor = e.clientX;
      var Ycor = e.clientY;
      var arr = v1State.getCurrentPage().get('uielements').filter(function(widget){
        var elem = document.getElementById('widget-wrapper-' + widget.cid);
        return util.isRectangleIntersectElement(this.clientOrigin.x, this.clientOrigin.y, Xcor, Ycor, elem);
      }, this);

      this.isDrawing = false;
      this.setZero();

      if(arr.length == 1) {
        arr[0].trigger('selected');
      }
      else if(arr.length > 1) {
        this.multiSelectorView.setContents(arr);
      }
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

      this.iterateWidgets(this.clientOrigin.x, this.clientOrigin.y, e.clientX, e.clientY);

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

    iterateWidgets: function(Xorigin, Yorigin, Xcor, Ycor) {

      this.currentPage = v1State.getCurrentPage();
      if(Xcor%3>=1 & Ycor%3>=1) return;

      this.currentPage.get('uielements').each(function(widget){
        var elem = document.getElementById('widget-wrapper-'+ widget.cid);
        if(util.isRectangleIntersectElement(Xorigin, Yorigin, Xcor, Ycor, elem)) {
          $(elem).addClass('red-border');
        }
        else {
          $(elem).removeClass('red-border');
        }
      });

    },

    setZero: function() {
      this.$el.hide();
      this.setWidth(0);
      this.setHeight(0);

      v1State.getCurrentPage().get('uielements').each(function(widget){
        var elem = document.getElementById('widget-wrapper-'+ widget.cid);
        $(elem).removeClass('red-border');
      });
    },

    render: function() {
      window.addEventListener('mouseup', this.mouseup);
      document.getElementById('page').addEventListener('mousedown', this.mousedown);
      document.getElementById('page').addEventListener('mousemove', this.mousemove);
      this.el.className = 'marquee-view';
      this.el.id = 'marquee-view';
      this.container = document.getElementById('elements-container');
      this.setZero();
      this.multiSelectorView.render();
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
