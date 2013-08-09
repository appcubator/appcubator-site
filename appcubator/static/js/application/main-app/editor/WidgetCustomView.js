define([
  'editor/WidgetView'
],
function( WidgetView ) {

  var WidgetCustomView = WidgetView.extend({
    el: null,
    className: 'custom-widget',
    tagName : 'div',
    entity: null,
    type: null,

    positionHorizontalGrid : 80,
    positionVerticalGrid   : 15,

    events: {
    },

    rowMousedown: function() { mouseDispatcher.isMousedownActive = true; },
    rowMouseup:   function() { mouseDispatcher.isMousedownActive = false; },

    initialize: function(widgetModel) {
      WidgetCustomView.__super__.initialize.call(this, widgetModel);
      _.bindAll(this);
    },

    reRender: function() {
      this.el.innerHTML  = '';
      this.render();
    },

    render: function() {
      this.form = document.createElement('form');
      this.el.appendChild(this.form);
      this.form.innerHTML = '';

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      this.setTop(this.positionVerticalGrid * this.model.get('layout').get('top'));
      this.setLeft(this.positionHorizontalGrid * this.model.get('layout').get('left'));
      this.setHeight(height * this.positionVerticalGrid);

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

      this.el.className += ' widget-wrapper span'+width;
      this.el.id = 'widget-wrapper-' + this.model.cid;

      this.placeHTML();
      this.placeCSS();
      this.placeJS();

      return this;
    },

    placeHTML: function() {
      if(this.model.get('data').get('html')) {
        this.el.innerHTML = this.model.get('data').get('html');
      }
    },

    placeJS: function() {

    },

    placeCSS: function() {

    }

  });

  return WidgetCustomView;
});
