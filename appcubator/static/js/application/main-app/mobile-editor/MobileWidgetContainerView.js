define([
  'editor/WidgetContainerView',
  'editor/TableQueryView',
  'editor/WidgetView',
  'editor/SubWidgetView',
  'app/FormEditorView',
  'dicts/constant-containers',
  'editor/editor-templates',
  'jquery.flexslider'
],
function( WidgetContainerView,
          TableQueryView,
          WidgetView,
          SubWidgetView,
          FormEditorView) {

  var MobileWidgetContainerView = WidgetContainerView.extend({
    el: null,
    className: 'container-create',
    tagName : 'div',
    entity: null,
    type: null,
    events: {
      'click .delete' : 'remove',
      'dblclick'      : 'showDetails',
      'mousedown'     : 'select',
      'mouseover'     : 'hovered',
      'mouseout'      : 'unhovered'
    },

    initialize: function(widgetModel) {
      MobileWidgetContainerView.__super__.initialize.call(this, widgetModel);
      var self = this;
    },

    render: function() {
      var self = this;
      var form;

      this.el.innerHTML = '';

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      this.setTop(GRID_HEIGHT * this.model.get('layout').get('top'));
      this.setLeft(0);
      this.setHeight(height * GRID_HEIGHT);

      this.el.className += ' m-widget-wrapper';
      this.el.id = 'widget-wrapper-' + this.model.cid;

      if(this.model.get('data').get('container_info').get('action') == "table") {
        var tableDiv = document.createElement('div');
        tableDiv.innerHTML = _.template(Templates.tableNode, this.model.get('data').get('container_info').get('query').attributes);
        this.el.appendChild(tableDiv);
      }

      if(this.model.get('data').get('container_info').get('action') == "imageslider" ) {
        var slideDiv = document.createElement('div');
        slideDiv.innerHTML = _.template(Templates.sliderTemp, {slides: this.model.get('data').get('container_info').get('slides').toJSON() });
        $(slideDiv).flexslider();
        this.el.appendChild(slideDiv);
      }

      if(this.model.get('data').get('container_info').get('action') == "twitterfeed" ) {
        var feedDiv = document.createElement('div');
        feedDiv.innerHTML = _.template(Templates.twitterfeedTemp, {username: this.model.get('data').get('container_info').get('username') });
        this.el.appendChild(feedDiv);
      }

      if(this.model.get('data').get('container_info').get('action') == "facebookshare" ) {
        var feedDiv = document.createElement('div');
        feedDiv.innerHTML = _.template(Templates.facebookshareTemp, {});
        this.el.appendChild(feedDiv);
      }

      if(this.model.get('data').get('container_info').has('form')) {
        self.form = document.createElement('form');
        self.el.appendChild(self.form);
      }

      return this;
    },

    changedWidth: function(a) { }
  });

  return MobileWidgetContainerView;
});
