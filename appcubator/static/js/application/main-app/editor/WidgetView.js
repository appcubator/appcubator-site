define([
  'backbone',
  'mixins/BackboneUI'
],function() {

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

  var WidgetView = Backbone.UIView.extend({
    el: null,
    className: 'widget-wrapper',
    tagName : 'div',
    widgetsContainer :null,
    selected : false,
    editable : false,
    editMode : false,
    shadowElem : null,
    positionHorizontalGrid : null,
    positionVerticalGrid : null,

    events: {
      'click'         : 'select',
      'click .delete' : 'remove',
      'mouseover'     : 'hovered',
      'mouseout'      : 'unhovered',
      'mousedown'     : 'mousedown'
    },

    initialize: function(widgetModel, isFreeMove){
      var self = this;
      _.bindAll(this, 'render',
                      'renderElement',
                      'select',
                      'changedWidth',
                      'changedHeight',
                      'changedValue',
                      'changedTop',
                      'changedLeft',
                      'changedText',
                      'changedType',
                      'changedStyle',
                      'changedSource',
                      'toggleFull',
                      'staticsAdded',
                      'isMouseOn',
                      'mousedown',
                      'switchEditModeOn',
                      'switchEditModeOff');

      this.model = widgetModel;

      if(isFreeMove) { this.positionVerticalGrid = 1; this.positionHorizontalGrid = 1; }
      this.model.get('data').bind("change:type", this.changedType, this);
      this.model.get('data').bind("change:class_name", this.changedType, this);
      this.model.bind("remove", this.remove, this);

      this.model.get('layout').bind("change:width", this.changedWidth, this);
      this.model.get('layout').bind("change:height", this.changedHeight, this);
      this.model.get('layout').bind("change:top", this.changedTop, this);
      this.model.get('layout').bind("change:left", this.changedLeft, this);
      this.model.get('layout').bind("change:isFull", this.toggleFull, this);
      this.model.get('layout').bind("change:alignment", this.changedAlignment, this);
      this.model.get('layout').bind("change", this.changedPadding, this);

      this.model.get('data').bind("change:content", this.changedText, this);
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
      this.setTop((this.positionHorizontalGrid||GRID_HEIGHT) * (this.model.get('layout').get('top')));
      this.setLeft((this.positionHorizontalGrid||GRID_WIDTH) * (this.model.get('layout').get('left')));
      this.setHeight(height * GRID_HEIGHT);
      this.el.className += " span" + width;
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

    select: function(e) {
      if(!this.editMode) {
        this.model.trigger('selected');
        this.el.style.zIndex = 2003;
      }
    },

    changedWidth: function(a) {
      this.el.style.width = '';
      this.el.className = 'selected widget-wrapper ';
      this.el.className += 'span' + this.model.get('layout').get('width');
      //this.setLeft(GRID_WIDTH * (this.model.get('layout').get('left')));
    },

    changedAlignment: function() {
      this.el.style.textAlign = this.model.get('layout').get('alignment');
    },

    changedPadding: function() {
      this.el.style.paddingTop    = this.model.get('layout').get('t_padding') + 'px';
      this.el.style.paddingBottom = this.model.get('layout').get('b_padding') + 'px';
      this.el.style.paddingLeft   = this.model.get('layout').get('l_padding') + 'px';
      this.el.style.paddingRight  = this.model.get('layout').get('r_padding') + 'px';
    },

    toggleFull: function (argument) {
      if(this.model.get('layout').get('isFull') === true) {
        this.switchOnFullWidth();
      }
      else {
        this.switchOffFullWidth();
      }
    },

    switchOnFullWidth: function() {
      $('#full-container').append(this.el);
      this.disableResizeAndDraggable();
      this.el.className = 'selected widget-wrapper spanFull';
      this.setLeft(0);
      this.fullWidth = true;
    },

    switchOffFullWidth: function() {
      this.fullWidth = false;
      $('#elements-container').append(this.el);
      this.render();
    },

    changedHeight: function(a) {
      this.setHeight(this.model.get('layout').get('height') * GRID_HEIGHT);
    },

    changedTop: function(a) {
      console.log((this.positionVerticalGrid||GRID_HEIGHT));
      this.setTop((this.positionVerticalGrid||GRID_HEIGHT) * (this.model.get('layout').get('top')));
    },

    changedLeft: function(a) {
      this.setLeft((this.positionHorizontalGrid||GRID_WIDTH) * (this.model.get('layout').get('left')));
    },

    changedText: function(a) {
      var content = this.model.get('data').get('content').replace(/\n\r?/g, '<br />');
      this.el.firstChild.innerHTML = content;
    },

    changedValue: function(a) {
      this.el.firstChild.value = this.model.get('data').get('content_attribs').get('value');
    },

    changedType: function(a) {
      this.el.firstChild.className = this.model.get('data').get('class_name');
    },

    changedSource: function(a) {
      this.el.firstChild.src = this.model.get('data').get('content_attribs').get('src');
    },

    changedStyle: function() {
      this.el.firstChild.setAttribute('style', this.model.get('data').get('content_attribs').get('style'));
      this.el.firstChild.style.lineHeight = '1em';
    },

    staticsAdded: function(files) {
      _(files).each(function(file){
        file.name = file.filename;
        statics.push(file);
      });
      this.model.get('data').get('content_attribs').set('src', _.last(files).url);
      //this.show(this.model);
    },

    hovered: function() {
      if(this.editMode) return;
      this.hovered = true;
      this.model.trigger('hovered');
    },

    unhovered: function(e) {
      if(this.isMouseOn(e)) return;
      this.model.trigger('unhovered');
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
    },

    switchEditModeOn: function() {
      this.editMode = true;
      var el = $(this.el.firstChild);
      this.el.firstChild.style.zIndex = 2003;
      this.$el.addClass('textediting');
      el.attr('contenteditable', 'true');
      el.focus();
      el.selectText();
      keyDispatcher.textEditing = true;
    },

    switchEditModeOff: function(e) {
      if(e) e.preventDefault();
      if(this.editMode === false) return;

      this.model.trigger('stopEditing');
      this.editMode = false;
      this.$el.removeClass('textediting');
      var el = $(this.el.firstChild);
      val = el.html();
      this.model.get('data').set('content', val);
      el.attr('contenteditable', 'false');
      keyDispatcher.textEditing = false;
    },

    mousedown: function(e) {
      //e.stopPropagation();
    }

  });

  return WidgetView;
});
