define([
  'editor/WidgetSelectorView',
  'editor/WidgetEditorView',
  'mixins/BackboneUI',
  'iui'
], function (WidgetSelectorView,
          WidgetEditorView) {

  var MobileWidgetSelectorView = WidgetSelectorView.extend({
    className : 'editor-page',
    tagName : 'div',
    selectedEl : null,
    isMobile : true,

    events : {
      'click #hover-div'     : 'hoverClicked',
      'dblclick #select-div' : 'doubleClicked',
      'mousedown #hover-div' : 'mousedown',
      'mousedown #select-div': 'mousedown',
      'mouseup #hover-div'   : 'mouseup',
      'mouseup #select-div'  : 'mouseup'
    },


    mousedown: function(e) { mouseDispatcher.isMousedownActive = true; },
    mouseup  : function(e) { mouseDispatcher.isMousedownActive = false; },

    render: function() {
      var self = this;

      var hoverDiv = document.createElement('div');
      hoverDiv.id = "hover-div";
      this.hoverDiv = hoverDiv;
      this.hideNode(hoverDiv);
      this.el.appendChild(hoverDiv);

      var selectDiv = document.createElement('div');
      selectDiv.id = "select-div";
      this.selectDiv = selectDiv;
      this.hideNode(selectDiv);
      this.el.appendChild(selectDiv);

      /*$(selectDiv).resizable({
        handles: "s",
        containment: "parent",
        resize: self.resizing,
        stop  : self.resized
      });

      $(hoverDiv).draggable({
        drag: self.moving,
        stop: self.moved,
        snapMode : "outer"
      });

      $(selectDiv).draggable({
        containment: "parent",
        drag: self.moving,
        stop: self.moved,
        snapMode : "outer"
      });*/


      selectDiv.style.zIndex = "2004";
      hoverDiv.style.zIndex = "2005";
      hoverDiv.style.position = "absolute";
      selectDiv.style.position = "absolute";

      $('.page.full').on('mousedown', this.clickedPage);

      return this;
    },

    setLayout: function(node, widgetModel) {
      $(node).show();
      var div = $('#widget-wrapper-' + widgetModel.cid);
      divTop = div.offset().top - 166;
      //var divTop = div.offset().top - 60;
      node.style.width  = '100%';
      node.style.height = ((widgetModel.get('layout').get('height') * 15)) + 'px';
      //node.style.height = "5px";
      node.style.left   = '0px';
      //node.style.top    = (divTop + widgetModel.get('layout').get('height')) + 'px';
      node.style.top    = divTop + 'px';
      $(node).resizable({
        handles: "s",
        containment: "parent",
        resize: self.resizing,
        stop  : self.resized
      });
      return node;
    },

    widgetHover: function(widgetModel) {
      if(this.selectedEl && widgetModel.cid === this.selectedEl.cid) return;
      this.hoveredEl = widgetModel;
      this.setLayout(this.hoverDiv, widgetModel);
    },

    widgetUnhover: function(widgetModel) {
      this.hideNode(this.hoverDiv);
    },

    bindLocation: function() { },

    newSelected: function(widgetModel) {
      var self = this;
      if(this.selectedEl && this.selectedEl.cid == widgetModel.cid) {
        //this.setLayout(this.selectDiv, widgetModel);
        return;
      }
      if(this.selectedEl) {
        widgetModel.get('layout').unbind('change', self.setLayout);
      }
      this.deselect();
      this.selectedEl = widgetModel;
      widgetModel.get('layout').bind('change', function() {
        self.setLayout(self.selectDiv, widgetModel);
      });
      this.hideNode(this.hoverDiv);
      //this.setLayout(this.selectDiv, widgetModel);
      document.getElementById('page-wrapper').appendChild(this.widgetEditorView.setModel(widgetModel).render().el);
    },

    resizing: function(e, ui) {
      var elem = iui.get('widget-wrapper-' + this.selectedEl.cid);
      elem.style.width = ui.size.width - 4 + 'px';
      elem.style.height = ui.size.height - 4 + 'px';
      elem.style.left = ui.position.left + 2 + 'px';
      elem.style.top  = ui.position.top + 2 + 'px';
    },

    resized: function(e, ui) {
      var left = Math.round((ui.position.left / GRID_WIDTH));
      var top  = Math.round((ui.position.top  / GRID_HEIGHT));
      var deltaHeight = Math.round((ui.size.height + 6) / GRID_HEIGHT);
      var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);
      var elem = iui.get('widget-wrapper-' + this.selectedEl.cid);
      elem.style.width = '';
      elem.style.height = '';
      this.selectedEl.get('layout').set('width', deltaWidth);
      this.selectedEl.get('layout').set('height', deltaHeight);
      this.selectedEl.get('layout').set('left', left);
      this.selectedEl.get('layout').set('top', top);
      this.setLayout(this.selectDiv, this.selectedEl);
    },

    moving: function(e, ui) {
      model = this.selectedEl;
      $('#widget-wrapper-' + widgetModel.cid).trigger('');
      if(e.target.id == "hover-div") { model = this.hoveredEl; }

      var elem = iui.get('widget-wrapper-' + model.cid);
      elem.style.top = ui.position.top + 2 + 'px';
      elem.style.left = ui.position.left + 2 + 'px';
      this.setLayout(e.target, model);
    },

    moved: function(e, ui) {
      model = this.selectedEl;
      if(e.target.id == "hover-div") { model = this.hoveredEl; }

      var top = Math.round((ui.position.top / GRID_HEIGHT));
      //var left = Math.round((ui.position.left / GRID_WIDTH));
      model.get('layout').set('top', top);
      //model.get('layout').set('left', left);
      this.setLayout(e.target, model);
    },

    deselect: function() {
      if(this.selectedEl) {
        this.selectedEl.trigger('deselected');
      }
      this.widgetEditorView.clear();
      this.selectedEl = null;
      this.hideNode(this.selectDiv);
    },

    moveSelectedDown: function(e) {
      if(!this.selectedEl) return;
      if(keyDispatcher.textEditing && keyDispatcher.textEditing === true) return;
      this.selectedEl.moveDown();
      e.preventDefault();
    },

    moveSelectedUp: function() {
      if(!this.selectedEl) return;
      if(keyDispatcher.textEditing === true) return;
      this.selectedEl.moveUp();
    },

    moveSelectedLeft: function() {
      if(!this.selectedEl) return;
      if(keyDispatcher.textEditing === true) return;
      this.selectedEl.moveLeft();
    },

    moveSelectedRight: function() {
      if(!this.selectedEl) return;
      if(keyDispatcher.textEditing === true) return;
      this.selectedEl.moveRight();
    },

    deleteSelected: function(e) {
      if(!this.selectedEl) return;
      if(keyDispatcher.textEditing === true) return;
      this.selectedEl.remove();
      e.preventDefault();
    },

    doKeyBindings: function() {
      keyDispatcher.key('down', this.moveSelectedDown);
      keyDispatcher.key('up', this.moveSelectedUp);
      keyDispatcher.key('left', this.moveSelectedLeft);
      keyDispatcher.key('right', this.moveSelectedRight);
      keyDispatcher.key('backspace', this.deleteSelected);
    },

    hoverClicked: function(e) {
      if(this.hoveredEl) {
        this.hoveredEl.trigger('selected');
      }
      mouseDispatcher.isMousedownActive = false;
    },

    clickedPage: function(e) {
      if(this.selectedEl && !this.isMouseOn(e) && !mouseDispatcher.isMousedownActive) {
        this.deselect();
      }
    },

    doubleClicked: function(e) {
      this.selectedEl.trigger('startEditing');
      this.selectedEl.bind('stopEditing', this.stoppedEditing);
      this.hideNode(this.selectDiv);
    },

    stoppedEditing: function() {
      this.setLayout(this.selectDiv, this.selectedEl);
    },

    isMouseOn: function(e) {
      var self = this;

      mouseX = e.pageX;
      mouseY = e.pageY;
      var div = $('#widget-wrapper-' + this.selectedEl.cid);
      divTop = div.offset().top,
      divLeft = div.offset().left,
      divRight = divLeft + div.width(),
      divBottom = divTop + div.height();
      if(mouseX >= divLeft && mouseX <= divRight && mouseY >= divTop && mouseY <= divBottom) {
        return true;
      }
      return false;
    },

    clear: function() { },

    hideNode: function(node) {
      node.style.height = 0;
      node.style.width = 0;
      $(node).hide();
    }

  });

  return MobileWidgetSelectorView;

});
