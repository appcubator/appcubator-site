define([
  'editor/WidgetView',
  'backbone',
  'mixins/BackboneUI'
],
function(WidgetView) {

  $.fn.selectText = function(){
    var doc = document;
    var element = this[0];
    var range;
    if (doc.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else if (window.getSelection) {
      var selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  var MobileWidgetView = WidgetView.extend({
    el: null,
    className: 'm-widget-wrapper',
    tagName : 'li',
    widgetsContainer :null,
    selected : false,
    editable : false,
    editMode : false,
    shadowElem : null,

    events: {
      'click'         : 'select',
      'click .delete' : 'remove',
      'mouseover'     : 'hovered',
      'mouseout'      : 'unhovered',
      'mousedown'     : 'mousedown'
    },

    initialize: function(widgetModel){
      var self = this;
      _.bindAll(this);

      this.model = widgetModel;

      widgetModel.get('layout').set('left', 0);

      this.render();

      this.model.get('data').bind("change:type", this.changedType, this);
      this.model.get('data').bind("change:class_name", this.changedType, this);
      this.model.bind("remove", this.remove, this);

      this.model.get('layout').bind("change:height", this.changedHeight, this);
      this.model.get('layout').bind("change:alignment", this.changedAlignment, this);
      this.model.get('layout').bind("change", this.changedPadding, this);

      this.model.bind("change:content", this.changedText, this);
      this.model.get('data').get('content_attribs').bind("change:src", this.changedSource, this);
      this.model.get('data').get('content_attribs').bind("change:value", this.changedValue, this);
      this.model.get('data').get('content_attribs').bind("change:style", this.changedStyle, this);

      this.model.bind("startEditing", this.switchEditModeOn, this);
      this.model.bind("deselected",   this.switchEditModeOff, this);

      keyDispatcher.key('shift+enter', this.switchEditModeOff);
    },

    render: function() {

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      // if(this.model.get('type') == 'box') {this.el.style.zIndex = 0;}
      this.setLeft(0);
      this.setHeight(height * GRID_HEIGHT);
      this.el.style.textAlign = this.model.get('layout').get('alignment');

      if(this.model.get('layout').has('l_padding')) {
        this.el.style.paddingLeft = this.model.get('layout').get('l_padding');
      }

      if(this.model.get('layout').has('r_padding')) {
        this.el.style.paddingRight = this.model.get('layout').get('r_padding');
      }

      if(this.model.get('layout').has('t_padding')) {
        this.el.style.paddingTop = this.model.get('layout').get('t_padding');
      }

      if(this.model.get('layout').has('b_padding')) {
        this.el.style.paddingBottom = this.model.get('layout').get('b_padding');
      }

      this.el.innerHTML = this.renderElement();
      this.el.id = 'widget-wrapper-' + this.model.cid;

      if(this.model.isFullWidth()) this.switchOnFullWidth();

      return this;
    },

    renderElement: function() {
      var temp = Templates.tempNode;
      var node_context = _.clone(this.model.get('data').attributes);
      if(node_context.content) {
        node_context.content = node_context.content.replace(/\n\r?/g, '<br />');
      }
      if(this.model.get('data').get('content_attribs')) {
        node_context.content_attribs = this.model.get('data').get('content_attribs').attributes;
      }
      var el = _.template(temp, { element: node_context});
      return el;
    },

    isMouseOn: function(e) {
      var self = this;

      mouseX = e.pageX;
      mouseY = e.pageY;
      var div = $('#widget-wrapper-' + this.model.cid);

      if(!div.offset()) return false;

      divTop = div.offset().top,
      divLeft = div.offset().left,
      divRight = divLeft + div.width(),
      divBottom = divTop + div.height();
      if(mouseX >= divLeft && mouseX <= divRight && mouseY >= divTop && mouseY <= divBottom) {
        $('#hover-div').bind('mouseout', function(e) {
          self.unhovered(e);
          $(e.target).unbind('mouseout');
        });
        return true;
      }

      return false;
    }

  });

  return MobileWidgetView;
});
