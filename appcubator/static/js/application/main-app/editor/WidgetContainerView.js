define([
  'editor/TableQueryView',
  'editor/WidgetView',
  'editor/SubWidgetView',
  'editor/form-editor/FormEditorView',
  'dicts/constant-containers',
  'editor/editor-templates',
  'jquery.flexslider'
],
function( TableQueryView,
          WidgetView,
          SubWidgetView,
          FormEditorView) {

  var WidgetContainerView = WidgetView.extend({
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
      WidgetContainerView.__super__.initialize.call(this, widgetModel);
      var self = this;
      _.bindAll(this);

      if(this.model.get('data').get('container_info').get('action') == "imageslider" ) {
        this.listenTo(this.model.get('data').get('container_info').get('slides'), 'add remove change', this.render);
      }

      this.model.get('data').get('container_info').get('uielements').bind("add", this.placeWidget);

      var action = this.model.get('data').get('container_info').get('action');

      if(this.model.get('data').get('container_info').has('query')) {
        this.model.get('data').get('container_info').get('query').bind('change', this.reRender);
      }


      if(this.model.get('data').get('container_info').has('form')) {
        var form = this.model.get('data').get('container_info').get('form');
        if(form.get('fields').models.length < 2 &&
           form.get('action') != "facebook"     &&
           form.get('action') != "twitter"      &&
           form.get('action') != "linkedin") {
          new FormEditorView(form, this.model.get('data').get('container_info').get('entity'));
        }

        this.formModel = form;
        this.formModel.bind('change', this.reRender);
        this.formModel.get('fields').bind('remove', this.reRender);
        this.formModel.get('fields').bind('add', this.reRender);
        this.formModel.get('fields').each(function(model){ model.bind('change', self.reRender); });
      }
    },

    render: function() {
      var self = this;
      var form;

      this.el.innerHTML = '';

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      this.setTop(GRID_HEIGHT * this.model.get('layout').get('top'));
      this.setLeft(GRID_WIDTH * this.model.get('layout').get('left'));
      this.setHeight(height * GRID_HEIGHT);

      this.el.className += ' widget-wrapper span'+width;
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

    placeFormElement: function(fieldModel) {
      var inp_class = uieState.textInputs[0].class_name;
      var fieldHtml = _.template(Templates.fieldNode, { field: fieldModel, inpClass: ""});
      $(this.form).append(fieldHtml);
    },

    renderElements : function() {

      var self  =this;
      this.model.get('data').get('container_info').get('uielements').each(function(widgetModel) {
        self.placeWidget(widgetModel);
      });

      if(this.model.get('data').get('container_info').has('form')) {
        this.form.innerHTML = '';
        this.formModel.get('fields').each(function(field) {
          self.placeFormElement(field);
        });
      }
    },

    showDetails: function() {
      if(this.model.get('data').get('container_info').get('action') === "table-gal") {
        new TableQueryView(this.model, 'table');
      }
      if(this.model.get('data').get('container_info').has('form')) {
        new FormEditorView(this.formModel,
                           this.model.get('data').get('container_info').get('entity'));
      }
    },

    switchEditModeOn: function() {
      // start editing code
    }
  });

  return WidgetContainerView;
});
