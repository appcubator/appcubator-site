define([
  'editor/WidgetContentEditorView',
  'editor/WidgetLayoutEditorView',
  'editor/ImageSliderEditorView',
  'editor/WidgetClassPickerView',
  'editor/SearchEditorView',
  'editor/list-editor/RowGalleryView',
  'editor/form-editor/FormEditorView',
  'editor/form-editor/LoginFormEditorView',
  'editor/QueryEditorView',
  'mixins/BackboneUI',
  'util'
],
function(WidgetContentEditor,
         WidgetLayoutEditor,
         ImageSliderEditorView,
         WidgetClassPickerView,
         SearchEditorView,
         RowGalleryView,
         FormEditorView,
         LoginFormEditorView,
         QueryEditorView) {

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
      'click .form-editor-btn'    : 'openFormEditor',
      'click .pick-style'         : 'openStylePicker',
      'click .search-editor-btn'  : 'openSearchEditor',
      'click .edit-login-form-btn': 'openLoginEditor',
      'click .done-editing'       : 'closeEditingMode',
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

        if(action == "searchlist") {
          this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-row-btn', 'Edit Row'));
        }

        if(action == "searchbox") {
          this.el.appendChild(this.renderButtonWithDeleteButtonandText('search-editor-btn', 'Edit Search Options'));
        }

        console.log(action);
        if(this.model.hasForm() && action != "login" && action != "signup") {
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

      this.$el.removeClass('left');
      this.$el.removeClass('right');
      this.$el.removeClass('bottom');

      if(action == "show" || this.model.get('type') == "loop") {
        var location = this.getLocation();
        this.location = location;
        this.el.className += ' '+location;
      }
      else {
        this.location = 'bottom';
        this.$el.removeClass('right');
      }

      if(this.location == "right") {
        this.$el.append('<div class="left-arrow"></div>');
      }
      else if(this.location == "bottom") {
        this.$el.append('<div class="top-arrow"></div>');
      }
      else {
        this.$el.append('<div class="right-arrow"></div>');
      }

      return this;
    },

    renderButtonWithText: function(className, buttonText) {
      return this.renderButtonWithWidthCustomWidth(className, buttonText, 230);
    },

    renderButtonWithWidthCustomWidth: function(className, buttonText, width) {
      var li       = document.createElement('ul');
      li.className = 'pad section-'+className;
      li.innerHTML += '<span class="option-button tt '+className+'" style="width:'+width+'px; display: inline-block;">'+ buttonText +'</span>';
      return li;
    },

    renderButtonWithDeleteButtonandText: function(className, buttonText) {
      var li       = document.createElement('ul');
      li.className = 'pad section-'+className;
      li.innerHTML += '<span class="'+ className +'  option-button tt" style="width:190px; display: inline-block;">'+ buttonText +'</span><span id="delete-widget" class="option-button delete-button tt" style="width:34px;"></span>';
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

      new QueryEditorView(this.model, type);
    },

    openRowEditor: function() {
      this.hideSubviews();
      console.trace();
      this.el.appendChild(this.renderButtonWithWidthCustomWidth('done-editing', 'Done Editing', 190));
      var entity = this.model.get('data').get('container_info').get('entity');
      this.listGalleryView = document.createElement('div');
      this.listGalleryView.className = 'elements-list';

      var galleryView = new RowGalleryView(this.model, this.location);
      this.listGalleryView.appendChild(galleryView.render().el);
      this.el.appendChild(this.listGalleryView);
    },

    openSearchEditor: function() {
      console.log(this.model);
      new SearchEditorView(this.model.get('data').get('searchQuery'));
    },

    closeEditingMode: function() {
      this.$el.find('.section-done-editing').remove();
      this.listGalleryView.remove();
      this.showSubviews();
      this.model.trigger('editModeOff');
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
      this.$el.find('.section-style-editor').fadeIn();
      this.$el.find('.section-form-editor-btn').fadeIn();
      this.$el.find('.section-query-editor-btn').fadeIn();
      this.$el.find('.section-edit-query-btn').fadeIn();
      this.$el.find('.section-edit-row-btn').fadeIn();
      this.$el.find('.section-delete-button').fadeIn();
      this.$el.find('.section-pick-style').fadeIn();
    },

    hideSubviews: function() {
      if(this.widgetClassPickerView) this.widgetClassPickerView.$el.hide();
      if(this.contentEditor) this.contentEditor.$el.hide();
      if(this.layoutEditor) this.layoutEditor.$el.hide();
      if(this.infoEditor) this.infoEditor.$el.hide();
      this.$el.find('.section-style-editor').hide();
      this.$el.find('.section-form-editor-btn').hide();
      this.$el.find('.section-query-editor-btn').hide();
      this.$el.find('.section-edit-query-btn').hide();
      this.$el.find('.section-edit-row-btn').hide();
      this.$el.find('.section-delete-button').hide();
      this.$el.find('.section-pick-style').hide();
    },

    getLocation: function() {
      var layout = this.model.get('layout');
      var rightCoor = layout.get('left') + layout.get('width');
      if((12 - rightCoor) < 2) return "left";
      return "right";
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

