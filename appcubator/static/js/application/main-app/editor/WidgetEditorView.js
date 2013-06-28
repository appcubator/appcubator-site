define([
  'editor/WidgetContentEditorView',
  'editor/WidgetLayoutEditorView',
  'editor/ImageSliderEditorView',
  'editor/WidgetClassPickerView',
  'editor/list-editor/RowGalleryView',
  'editor/form-editor/FormEditorView',
  'editor/form-editor/LoginFormEditorView',
  'editor/TableQueryView',
  'mixins/BackboneUI',
  'util'
],
function(WidgetContentEditor,
         WidgetLayoutEditor,
         ImageSliderEditorView,
         WidgetClassPickerView,
         RowGalleryView,
         FormEditorView,
         LoginFormEditorView,
         TableQueryView) {

  var WidgetEditorView = Backbone.UIView.extend({
    className : 'widget-editor fadeIn',
    id: 'widget-editor',
    tagName : 'div',
    css : 'widget-editor',
    location: "bottom",

    events : {
      'click .edit-slides-button' : 'openSlideEditor',
      'click .query-editor-btn'   : 'openQueryEditor',
      'click .edit-row-btn'       : 'openRowEditor',
      'click .form-editor-btn'      : 'openFormEditor',
      'click .pick-style'         : 'openStylePicker',
      'click .edit-login-form-btn': 'openLoginEditor',
      'click .delete-button'      : 'clickedDelete',
      'click'                     : 'clicked'
    },

    initialize: function(){
      _.bindAll(this);

      util.loadCSS(this.css);
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

        if(action == "login" || action == "thirdpartylogin") {
          this.widgetClassPickerView = new WidgetClassPickerView(this.model);
          this.layoutEditor = new WidgetLayoutEditor(this.model);
          this.widgetClassPickerView.bind('change', this.classChanged);

          this.el.appendChild(this.widgetClassPickerView.el);
          this.el.appendChild(this.renderButtonWithDeleteButtonandText('pick-style', 'Pick Style'));
          this.el.appendChild(this.renderButtonWithText('edit-login-form-btn', 'Edit Login'));
          this.el.appendChild(this.layoutEditor.el);
        }

        if(action == "authentication" || action == "signup") {
          this.widgetClassPickerView = new WidgetClassPickerView(this.model);
          this.layoutEditor = new WidgetLayoutEditor(this.model);
          this.widgetClassPickerView.bind('change', this.classChanged);

          this.el.appendChild(this.widgetClassPickerView.el);
          this.el.appendChild(this.renderButtonWithDeleteButtonandText('pick-style', 'Pick Style'));
          this.el.appendChild(this.renderButtonWithText('form-editor-btn', 'Edit Form'));
          this.el.appendChild(this.layoutEditor.el);
        }

        if(action == "imageslider") {
          this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-slides-button', 'Edit Slides'));
        }

        if(action == "table") {
          this.el.appendChild(this.renderButtonWithDeleteButtonandText('query-editor-btn', 'Edit Query'));
        }

        if(action == "show" || action == "loop") {
          this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-row-btn', 'Edit Row'));
          this.el.appendChild(this.renderButtonWithText('query-editor-btn', 'Edit Query'));
        }

        if(action == "create") {
          this.el.appendChild(this.renderButtonWithDeleteButtonandText('form-editor-btn', 'Edit Form'));
        }
      }
      else {
        this.widgetClassPickerView = new WidgetClassPickerView(this.model);
        this.layoutEditor = new WidgetLayoutEditor(this.model);
        this.contentEditor = new WidgetContentEditor(this.model);
        this.widgetClassPickerView.bind('change', this.classChanged);

        this.el.appendChild(this.widgetClassPickerView.el);
        this.el.appendChild(this.renderButtonWithDeleteButtonandText('pick-style', 'Pick Style'));
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

    renderButtonWithText: function(className, buttonText) {
      var li       = document.createElement('ul');
      li.className = className;
      li.innerHTML += '<span class="option-button tt" style="width:230px; display: inline-block;"><strong>'+ buttonText +'</strong></span>';
      return li;

    },

    renderButtonWithDeleteButtonandText: function(className, buttonText) {
      var li       = document.createElement('ul');
      //li.className = className;
      li.innerHTML += '<span class="'+ className +'  option-button tt" style="width:194px; display: inline-block;"><strong>'+ buttonText +'</strong></span><span id="delete-widget" class="option-button delete-button tt" style="width:34px; margin-left:1px; display: inline-block;"></span>';
      return li;
    },

    openStylePicker: function(e) {
      this.hideSubviews();
      this.widgetClassPickerView.show();
      this.widgetClassPickerView.expand();
    },

    openFormEditor: function() {
      var entityModel = this.model.get('data').get('container_info').get('form').get('entity');
      if(_.isString(entityModel)) entityModel = v1State.getTableModelWithName(entityModel);
      new FormEditorView(this.model.get('data').get('container_info').get('form'), entityModel);
    },

    openLoginEditor: function() {
      var loginRoutes = this.model.getLoginRoutes();
      new LoginFormEditorView(loginRoutes);
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
      this.hideSubviews();

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

