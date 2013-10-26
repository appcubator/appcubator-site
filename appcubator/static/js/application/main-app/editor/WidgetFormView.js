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
    className: 'widget-wrapper',
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
      this.autoResizeVertical();
    },

    render: function() {
      this.arrangeLayout();

      if(this.form) $(this.form).remove();

      this.form = document.createElement('form');
      this.el.appendChild(this.form);
      this.form.innerHTML = '';

      if(!this.model.get('data').has('class_name')) {
        var className = uieState["forms"][0].class_name;
        this.model.get('data').set('class_name', className, {silent: true});
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
