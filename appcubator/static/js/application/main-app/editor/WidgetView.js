define([
  'backbone',
  'mixins/BackboneUI'
],function() {

  var WidgetView = Backbone.UIView.extend({
    el: null,
    className: 'widget-wrapper',
    tagName : 'div',
    widgetsContainer :null,
    selected : false,
    editable : false,
    editMode : false,
    shadowElem : null,
    positionHorizontalGrid : 80,
    positionVerticalGrid : 15,

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

      this.listenTo(this.model.get('data'), "change:type", this.changedType, this);
      this.listenTo(this.model.get('data'), "change:class_name", this.changedType, this);
      this.listenTo(this.model, "remove", this.close, this);

      this.listenTo( this.model.get('layout'), "change:width",this.changedSize, this);
      this.listenTo( this.model.get('layout'), "change:height", this.changedSize, this);
      this.listenTo( this.model.get('layout'), "change:top", this.changedTop, this);
      this.listenTo( this.model.get('layout'), "change:left", this.changedLeft, this);
      this.listenTo( this.model.get('layout'), "change:isFull", this.toggleFull, this);
      this.listenTo( this.model.get('layout'), "change:alignment", this.changedAlignment, this);
      this.listenTo( this.model.get('layout'), "change", this.changedPadding, this);

      this.listenTo(this.model.get('data'), "change:content", this.changedText, this);

      this.listenTo(this.model.get('data').get('content_attribs'), "change:src", this.changedSource, this);
      this.listenTo(this.model.get('data').get('content_attribs'), "change:value", this.changedValue, this);
      this.listenTo(this.model.get('data').get('content_attribs'), "change:style", this.changedStyle, this);

      this.listenTo(this.model, "startEditing", this.switchEditModeOn, this);
      this.listenTo(this.model, "deselected",   function() {
        this.model.trigger('stopEditing');
      }, this);
      this.listenTo(this.model, "stopEditing", this.switchEditModeOff);

      keyDispatcher.bind('meta+return', function() {
        self.model.trigger('stopEditing');
      });

    },

    setFreeMovement: function () {
      this.positionVerticalGrid = 1;
      this.positionHorizontalGrid = 1;
    },

    render: function() {
      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      // if(this.model.get('type') == 'box') {this.el.style.zIndex = 0;}
      this.setTop((this.positionVerticalGrid) * (this.model.get('layout').get('top')));
      this.setLeft((this.positionHorizontalGrid) * (this.model.get('layout').get('left')));
      this.setHeight(height * (this.positionVerticalGrid));

      if(this.positionHorizontalGrid == 80) this.el.className += " span" + width;
      else this.setWidth(width * this.positionHorizontalGrid);

      this.el.style.textAlign = this.model.get('layout').get('alignment');

      if(this.model.get('layout').has('l_padding')) {
        this.el.style.paddingLeft = this.model.get('layout').get('l_padding') + 'px';
      }

      if(this.model.get('layout').has('r_padding')) {
        this.el.style.paddingRight = this.model.get('layout').get('r_padding') + 'px';
      }

      if(this.model.get('layout').has('t_padding')) {
        this.el.style.paddingTop = this.model.get('layout').get('t_padding') + 'px';
      }

      if(this.model.get('layout').has('b_padding')) {
        this.el.style.paddingBottom = this.model.get('layout').get('b_padding') + 'px';
      }

      this.el.innerHTML = this.renderElement();
      this.el.id = 'widget-wrapper-' + this.model.cid;

      if(this.model.isFullWidth()) this.switchOnFullWidth();
      if(this.model.isBox()) this.el.style.zIndex = 999;

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
        if(this.model.isBox()) this.el.style.zIndex = 1000;
      }
    },

    changedWidth: function(a) {
      this.el.style.width = '';
      this.el.className = 'selected widget-wrapper ';
      var width = this.model.get('layout').get('width');
      if(this.positionHorizontalGrid == 80) this.el.className += " span" + width;
      else this.setWidth(width * this.positionHorizontalGrid);
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
    
    changedSize: function() {
      this.changedHeight();
      this.changedWidth();
    },

    changedHeight: function(a) {
      console.log(this.model.get('layout').get('height'));
      console.log(this.model.get('layout').get('height') * (this.positionVerticalGrid));
      this.setHeight(this.model.get('layout').get('height') * (this.positionVerticalGrid));
    },

    changedTop: function(a) {
      this.setTop((this.positionVerticalGrid) * (this.model.get('layout').get('top')));
    },

    changedLeft: function(a) {
      this.setLeft((this.positionHorizontalGrid) * (this.model.get('layout').get('left')));
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
      if(this.model.isBox()) return;
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

      if(this.model.get('data').get('content')) {
        this.editMode = true;
        var el = $(this.el.firstChild);
        this.el.firstChild.style.zIndex = 2003;
        this.$el.addClass('textediting');
        el.attr('contenteditable', 'true');
        el.focus();
        util.selectText(el);
        keyDispatcher.textEditing = true;
      }

    },

    switchEditModeOff: function(e) {
      if(e) e.preventDefault();
      if(this.editMode === false) return;

      this.editMode = false;
      this.$el.removeClass('textediting');
      var el = $(this.el.firstChild);
      val = el[0].innerText;
      this.model.get('data').set('content', val);
      el.attr('contenteditable', 'false');
      keyDispatcher.textEditing = false;
      util.unselectText();
    },

    autoResize: function(hGrid, vGrid) {
      var horizontalGrid = (hGrid || this.positionHorizontalGrid);
      var verticalGrid = (vGrid || this.positionVerticalGrid);

      var node = this.el.firstChild;

      var height = $(node).outerHeight(true);
      var width = $(node).outerWidth(true);

      var nHeight = Math.ceil(height / verticalGrid);
      var nWidth  = Math.ceil(width / horizontalGrid);

      if(horizontalGrid == 1 && verticalGrid == 1) {
        nHeight = (nHeight < 30) ? 30 : nHeight;
        nWidth = (nWidth < 120) ? 120 : nWidth;
      }

      if(!nHeight) nHeight = 2;
      if(!nWidth)  nWidth = 2;

      this.model.get('layout').set('width', nWidth);
      this.model.get('layout').set('height', nHeight);
    },

    mousedown: function(e) {
      //e.stopPropagation();
    },

    close: function () {
      WidgetView.__super__.remove.call(this);
    }

  });

  return WidgetView;
});
