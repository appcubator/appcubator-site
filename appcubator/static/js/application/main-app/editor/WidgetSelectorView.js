define([
  'mixins/BackboneUI',
  'iui'
],
function() {

  var WidgetSelectorView = Backbone.UIView.extend({
    className : 'editor-page',
    tagName : 'div',
    selectedEl : null,
    isMobile : false,

    events : {
      'click #hover-div'     : 'hoverClicked',
      'dblclick #select-div' : 'doubleClicked',
      'mousedown #hover-div' : 'mousedown',
      'mousedown #select-div': 'mousedown',
      'mouseup #hover-div'   : 'mouseup',
      'mouseup #select-div'  : 'mouseup'
    },

    initialize: function(widgetsCollection){
      _.bindAll(this, 'render',
                      'clear',
                      'setLayout',
                      'widgetHover',
                      'widgetUnhover',
                      'newSelected',
                      'resizing',
                      'resized',
                      'moving',
                      'moved',
                      'bindWidget',
                      'mousedown',
                      'mouseup',
                      'deselect',
                      'hideNode',
                      'doKeyBindings',
                      'moveSelectedDown',
                      'moveSelectedUp',
                      'moveSelectedLeft',
                      'moveSelectedRight',
                      'deleteSelected',
                      'hoverClicked',
                      'clickedPage',
                      'isMouseOn',
                      'stoppedEditing',
                      'unbindAll');

      var self = this;

      this.widgetsCollection    = widgetsCollection;
      this.widgetsCollection.bind('add', this.bindWidget);
      var WidgetEditorView = require('editor/WidgetEditorView');
      this.widgetEditorView = new WidgetEditorView();
      this.widgetEditorView.isMobile = self.isMobile;

      this.widgetsCollection.each(self.bindWidget);
      this.doKeyBindings();
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

      $(selectDiv).resizable({
        handles: "n, e, s, w, nw, ne, sw, se",
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
      });


      selectDiv.style.zIndex = "2004";
      hoverDiv.style.zIndex = "2005";
      hoverDiv.style.position = "absolute";
      selectDiv.style.position = "absolute";

      $('.page.full').on('mousedown', this.clickedPage);

      return this;
    },

    bindWidget: function(widget) {
      var self = this;

      widget.bind('remove', function() {
        self.deselect();
      });

      widget.bind('hovered', function() {
        self.widgetHover(widget);
      });

      widget.on('unhovered', function() {
        self.widgetUnhover(widget);
      });

      widget.on('selected', function() {
        self.widgetUnhover(widget);
        self.newSelected(widget);
      });

      widget.on('deselect', function() {
        self.deselect();
      });

      widget.on('editModeOn', function() {
        self.unbindAll();
      });
    },

    unbindAll: function() {
      var self = this;
      var widget = this.selectedEl;
      widget.on('editModeOff', function() {
        self.bindWidget(widget);
      });

      widget.unbind('hovered');
      widget.unbind('unhovered');
      widget.unbind('selected');
      this.selectDiv.style.height = 0;
      this.selectDiv.style.width = 0;
      this.selectDiv.style.left = (((widget.get('layout').get('width') + widget.get('layout').get('left')) * 80) + 4) + 'px';
    },

    setLayout: function(node, widgetModel) {
      $(node).show();
      node.style.width  = ((widgetModel.get('layout').get('width') * 80) + 4) + 'px';
      node.style.height = ((widgetModel.get('layout').get('height') * 15) + 4) + 'px';
      node.style.left   = ((widgetModel.get('layout').get('left') * 80) - 2) + 'px';
      node.style.top    = ((widgetModel.get('layout').get('top') * 15) - 2) + 'px';
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
        this.setLayout(this.selectDiv, widgetModel);
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
      this.setLayout(this.selectDiv, widgetModel);
      this.selectDiv.appendChild(this.widgetEditorView.setModel(widgetModel).render().el);
    },

    resizing: function(e, ui) {
      var elem = iui.get('widget-wrapper-' + this.selectedEl.cid);
      elem.style.width = ui.size.width - 4 + 'px';
      elem.style.height = (ui.size.height - 4) + 'px';
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
      if(e.target.id == "hover-div") { model = this.hoveredEl; }

      g_guides.hideAll();
      g_guides.showVertical(ui.position.left / GRID_WIDTH);
      g_guides.showVertical(ui.position.left / GRID_WIDTH + model.get('layout').get('width'));
      g_guides.showHorizontal(ui.position.top / GRID_HEIGHT);
      g_guides.showHorizontal(ui.position.top / GRID_HEIGHT + model.get('layout').get('height'));

      var elem = iui.get('widget-wrapper-' + model.cid);
      elem.style.top = ui.position.top + 2 + 'px';
      elem.style.left = ui.position.left + 2 + 'px';
    },

    moved: function(e, ui) {
      g_guides.hideAll();

      model = this.selectedEl;
      if(e.target.id == "hover-div") { model = this.hoveredEl; }

      var top = Math.round((ui.position.top / GRID_HEIGHT));
      var left = Math.round((ui.position.left / GRID_WIDTH));

      if(model.get('layout').get('left') == left) {
        model.get('layout').trigger('change:left');
      }
      else {
        model.get('layout').set('left', left);
      }

      if(model.get('layout').get('top') == top) {
        model.get('layout').trigger('change:top');
      }
      else {
        model.get('layout').set('top', top);
      }

      this.newSelected(model);
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
      if(keyDispatcher.textEditing === true) return;
      this.selectedEl.moveDown();
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
      e.preventDefault();
      this.selectedEl.remove();
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
      // this.selectedEl.trigger('startEditing');
      // this.selectedEl.bind('stopEditing', this.stoppedEditing);
      // this.hideNode(this.selectDiv);
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

    clear: function() { this.widgetEditorView.clear(); },

    hideNode: function(node) {
      node.style.height = 0;
      node.style.width = 0;
      $(node).hide();
    }

  });

  return WidgetSelectorView;

});
