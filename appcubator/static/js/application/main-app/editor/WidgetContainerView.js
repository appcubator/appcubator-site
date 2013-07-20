define([
  'editor/QueryEditorView',
  'editor/WidgetView',
  'editor/SubWidgetView',
  'dicts/constant-containers',
  'editor/editor-templates'
],
function( QueryEditorView,
          WidgetView,
          SubWidgetView) {

  var WidgetContainerView = WidgetView.extend({
    el: null,
    className: 'container-create',
    tagName : 'div',
    entity: null,
    type: null,

    positionHorizontalGrid : 80,
    positionVerticalGrid   : 15,

    events: {
      'click .delete' : 'remove',
      'dblclick'      : 'showDetails',
      'mousedown'     : 'select',
      'mouseover'     : 'hovered',
      'mouseout'      : 'unhovered'
    },

    initialize: function(widgetModel) {
      WidgetContainerView.__super__.initialize.call(this, widgetModel);
      var self = this;
      _.bindAll(this);

      if(this.model.getAction() == "imageslider" ) {
        this.listenTo(this.model.get('data').get('container_info').get('slides'), 'add remove change', this.render);
      }

      if(this.model.get('data').get('container_info').has('uielements')) {
        this.model.get('data').get('container_info').get('uielements').bind("add", this.placeWidget);
      }

      var action = this.model.get('data').get('container_info').get('action');

      if(this.model.get('data').get('container_info').has('query')) {
        this.model.get('data').get('container_info').get('query').bind('change', this.reRender);
      }
    },

    render: function() {
      var self = this;

      this.el.innerHTML = '';

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      this.setTop(this.positionVerticalGrid * this.model.get('layout').get('top'));
      this.setLeft(this.positionHorizontalGrid * this.model.get('layout').get('left'));
      this.setHeight(height * this.positionVerticalGrid);

      this.el.className += ' widget-wrapper span'+width;
      this.el.id = 'widget-wrapper-' + this.model.cid;

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

      if(this.model.get('data').get('container_info').get('action') == "searchbox") {
        this.el.innerHTML = _.template(Templates.searchboxTemp, {entityName: this.model.get('data').get('searchQuery').get('searchOn') });
      }

      if(this.model.get('data').get('container_info').get('action') == "table") {
        var tableDiv = document.createElement('div');
        tableDiv.innerHTML = _.template(Templates.tableNode, this.model.get('data').get('container_info').get('query').attributes);
        this.el.appendChild(tableDiv);
      }

      if(this.model.get('data').get('container_info').get('action') == "imageslider" ) {
        var slideDiv = document.createElement('div');
        var data = {
          cid: this.model.cid,
          slides: this.model.get('data').get('container_info').get('slides').toJSON()
        };
        slideDiv.innerHTML = _.template(Templates.sliderTemp, data);
        $(slideDiv).carousel();
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

      if(this.model.get('data').get('action') == "thirdpartylogin" ) {
        var thirdPartyBtn = document.createElement('div');
        thirdPartyBtn.innerHTML = _.template(Templates.thirdPartyLogin, this.model.get('data').toJSON());
        this.el.appendChild(thirdPartyBtn);
      }

      this.renderElements();

      return this;
    },

    reRender: function() {
      this.render();
      this.renderElements();
    },

    placeWidget: function(model, a) {
      var widgetView = new SubWidgetView(model);
      this.el.appendChild(widgetView.el);
      model.get('layout').bind('change', this.reRender);
    },

    renderElements : function() {
      var self = this;
      if(this.model.get('data').get('container_info').has('uielements')) {
        this.model.get('data').get('container_info').get('uielements').each(function(widgetModel) {
          self.placeWidget(widgetModel);
        });
      }
    },

    showDetails: function() {
      if(this.model.get('data').get('container_info').get('action') === "table-gal") {
        new QueryEditorView(this.model, 'table');
      }
    },

    switchEditModeOn: function() {
      // start editing code
    }
  });

  return WidgetContainerView;
});
