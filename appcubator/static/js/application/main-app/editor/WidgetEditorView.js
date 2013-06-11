define([
  'editor/WidgetContentEditorView',
  'editor/WidgetLayoutEditorView',
  'editor/ImageSliderEditorView',
  'editor/WidgetClassPickerView',
  'editor/RowGalleryView',
  'app/FormEditorView',
  'mixins/BackboneUI',
  'iui'
],
function(WidgetContentEditor,
         WidgetLayoutEditor,
         ImageSliderEditorView,
         WidgetClassPickerView,
         RowGalleryView,
         FormEditorView) {

  var WidgetEditorView = Backbone.UIView.extend({
    className : 'widget-editor fadeIn',
    id: 'widget-editor',
    tagName : 'div',
    css : 'widget-editor',
    location: "bottom",

    events : {
      'click .edit-slides-button' : 'openSlideEditor',
      'click .edit-query-button'  : 'openQueryEditor',
      'click #edit-row-btn'       : 'openRowEditor',
      'click #edit-form-btn'      : 'openFormEditor',
      'click #pick-style'         : 'openStylePicker',
      'click .delete-button'      : 'clickedDelete',
      'click'                     : 'clicked'
    },

    initialize: function(){
      _.bindAll(this);

      iui.loadCSS(this.css);
      var self = this;
      this.model = null;
    },

    setModel: function(widgetModel) {
      this.model = widgetModel;
      return this;
    },

    render: function() {
      this.$el.fadeIn();

      var action = "";

      if(this.model.get('data').has('container_info')) {
        action = this.model.get('data').get('container_info').get('action');

        if(action == "authentication") {
          this.layoutEditor = new WidgetLayoutEditor(this.model);
          this.el.appendChild(this.layoutEditor.el);
        }

        if(action == "imageslider") {
          this.el.appendChild(slidesElem);
        }

        if(action == "table") {
          this.el.appendChild(this.renderQueryButton());
        }

        if(action == "show" || action == "loop") {
          this.el.appendChild(this.renderRowButton());
          this.el.appendChild(this.renderQueryButton());
        }

        if(action == "create") {
          this.el.appendChild(this.renderEditForm());
        }
      }
      else {
        this.widgetClassPickerView = new WidgetClassPickerView(this.model);
        this.layoutEditor = new WidgetLayoutEditor(this.model);
        this.contentEditor = new WidgetContentEditor(this.model);
        this.widgetClassPickerView.bind('change', this.classChanged);

        this.el.appendChild(this.widgetClassPickerView.el);
        this.el.appendChild(this.renderStyleEditing());
        this.el.appendChild(this.layoutEditor.el);
        this.el.appendChild(this.contentEditor.el);
      }

      if(action == "show" || action == "loop") {
        this.location = 'right';
        this.el.className += ' right';
      }
      else {
        this.location = 'bottom';
        this.$el.removeClass('right');
      }

      if(this.location == "right") {
        this.$el.append('<div class="left-arrow"></div>');
      }
      else {
        this.$el.append('<div class="top-arrow"></div>');
      }

      return this;
    },

    renderStyleEditing: function(e) {
      var li       = document.createElement('div');
      li.className = 'style-editor';
      li.innerHTML += '<span id="pick-style" class="option-button tt" style="width:194px; display: inline-block;"><strong>Pick Style</strong></span><span id="delete-widget" class="option-button delete-button tt" style="width:34px; margin-left:1px; display: inline-block;"></span>';
      return li;
    },

    renderEditForm: function(e) {
      var li       = document.createElement('ul');
      li.className = 'form-editor-btn';
      li.innerHTML += '<span id="edit-form-btn" class="option-button tt" style="width:194px; display: inline-block;"><strong>Edit Form</strong></span><span id="delete-widget" class="option-button delete-button tt" style="width:34px; margin-left:1px; display: inline-block;"></span>';
      return li;
    },

    renderQueryButton: function() {
      var li       = document.createElement('ul');
      li.className = 'query-editor-btn';
      li.innerHTML += '<span id="edit-query-btn" class="option-button tt" style="width:230px; display: inline-block;"><strong>Edit Query</strong></span>';
      return li;
    },

    renderRowButton: function() {
      var li       = document.createElement('ul');
      li.className = 'row-editor-btn';
      li.innerHTML += '<span id="edit-row-btn" class="option-button tt" style="width:194px; display: inline-block;"><strong>Edit Row</strong></span><span id="delete-widget" class="option-button delete-button tt" style="width:34px; margin-left:1px; display: inline-block;"></span>';
      return li;
    },

    renderImageSliderButton: function() {
      var li       = document.createElement('li');
      li.className = 'option-button edit-slides-button';
      li.innerHTML = 'Edit Slides';
      return li;
    },

    openStylePicker: function(e) {
      this.hideSubviews();
      this.widgetClassPickerView.show();
      this.widgetClassPickerView.expand();
    },

    openFormEditor: function() {
      new FormEditorView(this.model.get('data').get('container_info').get('form'), this.model.get('data').get('container_info').get('entity'));
    },

    openSlideEditor: function() {
      new ImageSliderEditorView(this.model);
    },

    openQueryEditor: function() {
      var type = 'table';
      if(this.model.get('data').get('container_info').has('row')) {
        type = 'list';
      }

      new TableQueryView(this.model, type);
    },

    openRowEditor: function() {
      //widgetModel, queryModel, rowModel
      this.hideSubviews();

      //var row = this.model.get('data').get('container_info').get('row');
      var entity = this.model.get('data').get('container_info').get('entity');
      this.listGalleryView = document.createElement('div');
      this.listGalleryView.className = 'elements-list';

      var galleryView = new RowGalleryView(this.model);
      this.listGalleryView.appendChild(galleryView.render().el);
      this.el.appendChild(this.listGalleryView);
    },

    classChanged: function() {
      this.showSubviews();
      this.widgetClassPickerView.$el.hide();
    },

    clear: function() {
      if(this.contentEditor) this.contentEditor.clear();
      if(this.layoutEditor) this.layoutEditor.clear();
      if(this.infoEditor) this.infoEditor.clear();
      this.el.innerHTML = '';
      this.$el.hide();
    },

    showSubviews: function() {
      if(this.widgetClassPickerView) this.widgetClassPickerView.$el.fadeIn();
      if(this.contentEditor) this.contentEditor.$el.fadeIn();
      if(this.layoutEditor) this.layoutEditor.$el.fadeIn();
      if(this.infoEditor) this.infoEditor.$el.fadeIn();
      this.$el.find('.style-editor').fadeIn();
    },

    hideSubviews: function() {
      if(this.widgetClassPickerView) this.widgetClassPickerView.$el.hide();
      if(this.contentEditor) this.contentEditor.$el.hide();
      if(this.layoutEditor) this.layoutEditor.$el.hide();
      if(this.infoEditor) this.infoEditor.$el.hide();
      this.$el.find('.style-editor').hide();
      this.$el.find('.form-editor-btn').hide();
      this.$el.find('.query-editor-btn').hide();
      this.$el.find('.edit-query-btn').hide();
      this.$el.find('.row-editor-btn').hide();

    },

    clickedDelete: function() {
      if(this.model) this.model.remove();
    },

    clicked: function(e) {
      e.stopPropagation();
    }

  });

  return WidgetEditorView;

});

