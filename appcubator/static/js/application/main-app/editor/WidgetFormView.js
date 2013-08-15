define([
  'editor/WidgetContainerView',
  'editor/WidgetView',
  'editor/list-editor/ListWidgetSelectorView',
  'dicts/constant-containers',
  'editor/editor-templates'
],
function( WidgetContainerView,
          WidgetView,
          ListWidgetSelectorView ) {

  var WidgetListView = WidgetContainerView.extend({
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

    rowMousedown: function() { mouseDispatcher.isMousedownActive = true; },
    rowMouseup:   function() { mouseDispatcher.isMousedownActive = false; },

    initialize: function(widgetModel) {
      WidgetContainerView.__super__.initialize.call(this, widgetModel);
      _.bindAll(this);

      var self = this;
      var action = this.model.get('data').get('container_info').get('action');


      var form = this.model.get('data').get('container_info').get('form');

      this.formModel = form;
      //this.formModel.bind('change', this.reRender);
      this.formModel.get('fields').bind('remove', this.reRender);
      this.formModel.get('fields').bind('add', this.reRender);
      this.formModel.get('fields').bind('change', this.reRender);
      this.formModel.get('fields').each(function(model){ model.bind('change', self.reRender); });

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


      if(this.model.get('layout').get('alignment')) {
        this.el.style.textAlign = this.model.get('layout').get('alignment');
      }

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

      if(!this.model.get('data').has('class_name')) {
        var className = uieState["forms"][0].class_name;
        this.model.get('data').set('class_name', className);
      }

      this.form.className = this.model.get('data').get('class_name');
      this.formModel.get('fields').each(function(field) {
        this.placeFormElement(field);
      }, this);

      return this;
    },

    placeFormElement: function(fieldModel) {
      var inp_class = uieState.textInputs[0].class_name;
      var fieldHtml = _.template(Templates.fieldNode, { field: fieldModel, inpClass: ""});
      $(this.form).append(fieldHtml);
    },

    showDetails: function() {
      if(this.model.get('data').get('container_info').has('form')) {
        new FormEditorView(this.formModel,
                           this.model.get('data').get('container_info').get('entity'));
      }
    }

  });

  return WidgetListView;
});
