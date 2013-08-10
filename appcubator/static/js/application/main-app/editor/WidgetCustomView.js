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

      this.listenTo(this.model, 'custom_edited', this.rePlaceAll);
    },

    reRender: function() {
      this.el.innerHTML  = '';
      this.render();
    },

    render: function() {
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

    rePlaceAll: function() {
      this.placeHTML();
      this.placeCSS();
      this.placeJS();
    },

    placeHTML: function() {
      if(this.model.get('data').get('htmlC')) {
        this.el.innerHTML = this.model.get('data').get('htmlC');
      }
    },

    placeJS: function() {

      var jsTag = 'custom-js-widget-' + this.model.cid;
      if(jsTag) $(jsTag).remove();

      var appendJSTag = function() {
        console.log(this);

        var customJSTemp = [
          'function($) {  "use strict"; ',
          // 'try {',
          '<%= code %>',
          // '} catch(err) { console.log("Error executing custom js."); }',
          '}(window.jQuery);'
        ].join('\n');

        try {
          jsTag = document.createElement('script');
          jsTag.id = 'custom-js-widget-' + this.model.cid;
          jsTag.setAttribute("type","text/javascript");
          // console.log(_.template(customJSTemp, { code: this.model.get('data').get('jsC') }));
          jsTag.text = this.model.get('data').get('jsC');

          document.body.appendChild(jsTag);
        }
        catch(err) {
          console.log('Error adding custom js:' + err);
        }
      };

      this.listenTo(v1, 'editor-loaded', appendJSTag, this);
    },

    placeCSS: function() {
      var styleTag = document.getElementById('custom-css-widget-' + this.model.cid);
      if(styleTag) $(styleTag).remove();

      var style = document.createElement('style');
      style.id = 'custom-css-widget-' + this.model.cid;
      style.type = 'text/css';
      var css = this.model.get('data').get('cssC');
      css = String(css).replace('body', '.fdededfcbcbcd');
      if (style.styleSheet){
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      document.getElementsByTagName('head')[0].appendChild(style);
    }

  });

  return WidgetCustomView;
});
