define([
  'editor/WidgetSelectorView',
  'mixins/BackboneUI',
  'util'
],
function(WidgetSelectorView) {

  var ListWidgetSelectorView = WidgetSelectorView.extend({
    className : 'editor-list',
    tagName : 'div',
    selectedEl : null,
    isMobile : false,

    positionHorizontalGrid : 1,
    positionVerticalGrid   : 1,

    events : {
      'click #list-hover-div'     : 'hoverClicked',
      'dblclick #list-select-div' : 'doubleClicked',
      'mousedown #list-hover-div' : 'mousedown',
      'mousedown #list-select-div': 'mousedown',
      'mouseup #list-hover-div'   : 'mouseup',
      'mouseup #list-select-div'  : 'mouseup'
    },

    initialize: function(widgetsCollection, parentEl){
      _.bindAll(this);

      var self = this;

      this.widgetsCollection    = widgetsCollection;
      this.listenTo(this.widgetsCollection, 'add', this.bindWidget, true);
      var WidgetEditorView = require('editor/WidgetEditorView');
      this.widgetEditorView = new WidgetEditorView();
      this.widgetEditorView.isMobile = self.isMobile;

      this.parentEl = parentEl;

      this.widgetsCollection.each(function(widget) {
        self.bindWidget(widget, false);
      });

      this.doKeyBindings();
    },

    mousedown: function(e) { mouseDispatcher.isMousedownActive = true; mouseDispatcher.isItemMousedownActive = true; },
    mouseup  : function(e) { mouseDispatcher.isMousedownActive = false; mouseDispatcher.isItemMousedownActive = false; },

    render: function() {
      var self = this;

      var hoverDiv = document.createElement('div');
      hoverDiv.id = "list-hover-div";
      this.hoverDiv = hoverDiv;
      this.hideNode(hoverDiv);
      this.el.appendChild(hoverDiv);

      var selectDiv = document.createElement('div');
      selectDiv.id = "list-select-div";
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
      hoverDiv.style.zIndex = "2003";
      hoverDiv.style.position = "absolute";
      selectDiv.style.position = "absolute";

      $(this.parentEl).on('mousedown', this.clickedPage);

      return this;
    },

    bindWidget: function(widget, isNew) {
      var self = this;

      this.listenTo(widget, 'remove', function() {
        this.deselect();
      });

      this.listenTo(widget, 'hovered', function() {
        self.widgetHover(widget);
      });

      this.listenTo(widget, 'unhovered', function() {
        self.widgetUnhover(widget);
      });

      this.listenTo(widget, 'selected', function() {
        self.widgetUnhover(widget);
        self.newSelected(widget);
      });

      this.listenTo(widget, 'deselect', function() {
        this.deselect();
      });

      this.listenTo(widget, 'editModeOn', function() {
        self.unbindAll();
      });

      if(isNew) { widget.trigger('selected'); }
    },

    unbindAll: function() {
      var widget = this.selectedEl;
      widget.on('editModeOff', function() {
        self.bindWidget(widget);
      });

      this.stopListening(widget, ['hovered, unhovered, selected']);

      this.selectDiv.style.height = 0;
      this.selectDiv.style.width = 0;
      this.selectDiv.style.left = (((widget.get('layout').get('width') + widget.get('layout').get('left') + 1) * 1) + 4) + 'px';
    },

    setLayout: function(node, widgetModel) {
      if(!node) return;
      $(node).show();
      node.style.width  = ((widgetModel.get('layout').get('width') * 1)) + 'px';
      node.style.height = ((widgetModel.get('layout').get('height') * 1)) + 'px';
      node.style.left   = ((widgetModel.get('layout').get('left') * 1)) + 'px';
      node.style.top    = ((widgetModel.get('layout').get('top') * 1)) + 'px';
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
        this.stopListening(widgetModel.get('layout'), 'change', self.setLayout);
      }

      this.deselect();
      this.selectedEl = widgetModel;
      this.listenTo(widgetModel.get('layout'), 'change', function() {
        self.setLayout(self.selectDiv, widgetModel);
      });

      this.hideNode(this.hoverDiv);
      this.setLayout(this.selectDiv, widgetModel);
      this.selectDiv.appendChild(this.widgetEditorView.setModel(widgetModel).render().el);
    },

    resizing: function(e, ui) {
      if(!this.selectedEl) return;
      var elem = util.get('widget-wrapper-' + this.selectedEl.cid);
      elem.style.width = ui.size.width - 2 + 'px';
      elem.style.height = (ui.size.height - 2) + 'px';
      elem.style.left = ui.position.left + 1 + 'px';
      elem.style.top  = ui.position.top + 1 + 'px';
    },

    resized: function(e, ui) {
      if(!this.selectedEl) return;
      var left = Math.round((ui.position.left / 1));
      var top  = Math.round((ui.position.top  / 1));
      var deltaHeight = Math.round((ui.size.height ));
      var deltaWidth = Math.round((ui.size.width));
      var elem = util.get('widget-wrapper-' + this.selectedEl.cid);
      elem.style.width = '';
      elem.style.height = '';

      if(deltaHeight <= 8) deltaHeight = 15;
      if(deltaWidth <= 8) deltaWidth = 15;

      this.selectedEl.get('layout').set('width', deltaWidth);
      this.selectedEl.get('layout').set('height', deltaHeight);
      this.selectedEl.get('layout').set('left', left);
      this.selectedEl.get('layout').set('top', top);
      this.setLayout(this.selectDiv, this.selectedEl);
    },

    moving: function(e, ui) {
      model = this.selectedEl;
      if(e.target.id == "list-hover-div") { model = this.hoveredEl; }
      var elem = util.get('widget-wrapper-' + model.cid);
      elem.style.top = ui.position.top + 1 + 'px';
      elem.style.left = ui.position.left + 1 + 'px';
    },

    moved: function(e, ui) {
      model = this.selectedEl;
      if(e.target.id == "list-hover-div") { model = this.hoveredEl; }
      var top = Math.round((ui.position.top / 1));
      var left = Math.round((ui.position.left / 1));

      if(top < 0) top = 1;
      if(left < 0) left = 1;

      model.get('layout').set('top', top);

      if(left == model.get('layout').get('left')) {
        model.get('layout').trigger('change:left');
      }
      model.get('layout').set('left', left);

      this.newSelected(model);
    },

    deselect: function() {
      if(this.selectedEl) {
        this.selectedEl.trigger('deselected');
      }
      this.widgetEditorView.clear();
      this.selectedEl = null;
      this.hideNode(this.selectDiv);
      this.hideNode(this.hoverDiv);
    },

    // moveSelectedDown: function(e) {
    //   if(!this.selectedEl) return;
    //   if(keyDispatcher.textEditing === true) return;
    //   this.selectedEl.moveDown();
    // },

    // moveSelectedUp: function() {
    //   if(!this.selectedEl) return;
    //   if(keyDispatcher.textEditing === true) return;
    //   this.selectedEl.moveUp();
    // },

    // moveSelectedLeft: function() {
    //   if(!this.selectedEl) return;
    //   if(keyDispatcher.textEditing === true) return;
    //   this.selectedEl.moveLeft();
    // },

    // moveSelectedRight: function() {
    //   if(!this.selectedEl) return;
    //   if(keyDispatcher.textEditing === true) return;

    //   this.selectedEl.moveRight();
    // },

    deleteSelected: function(e) {
      if(!this.selectedEl) return;
      if(keyDispatcher.textEditing === true) return;
      e.preventDefault();
      this.selectedEl.remove();
    },

    doKeyBindings: function() {
      keyDispatcher.bind('down', this.moveSelectedDown);
      keyDispatcher.bind('up', this.moveSelectedUp);
      keyDispatcher.bind('left', this.moveSelectedLeft);
      keyDispatcher.bind('right', this.moveSelectedRight);
      keyDispatcher.bind('backspace', this.deleteSelected);
    },

    hoverClicked: function(e) {
      if(this.hoveredEl) {
        this.hoveredEl.trigger('selected');
      }
      mouseDispatcher.isMousedownActive = false;
    },

    clickedPage: function(e) {
      //mouseDispatcher.isMousedownActive);
      if(this.selectedEl && !this.isMouseOn(e) && !mouseDispatcher.isItemMousedownActive) {
        this.deselect();
      }
    },

    doubleClicked: function(e) {
      this.selectedEl.trigger('startEditing');
      this.selectedEl.bind('stopEditing', this.stoppedEditing);
      this.hideNode(this.selectDiv);
    },

    stoppedEditing: function() {
      if(!this.selectedEl) return;
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
      if(!node)  { return; }
      node.style.height = 0;
      node.style.width = 0;
      $(node).hide();
    }

  });

  return ListWidgetSelectorView;

});
