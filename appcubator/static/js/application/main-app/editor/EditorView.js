define([
  'models/PageModel',
  'collections/TableCollection',
  'app/pages/UrlView',
  'mixins/SimpleModalView',
  'mixins/ErrorModalView',
  'mixins/DebugOverlay',
  'editor/WidgetsManagerView',
  'editor/WidgetEditorView',
  'editor/EditorGalleryView',
  'editor/PageStylePicker',
  'editor/NavbarView',
  'editor/FooterView',
  'editor/GuideView',
  'editor/MarqueeView',
  'editor/ToolBarView',
  'tutorial/TutorialView',
  'app/DeployView',
  'app/RedoController',
  'editor/editor-templates'
],
function( PageModel,
          TableCollection,
          UrlView,
          SimpleModalView,
          ErrorModalView,
          DebugOverlay,
          WidgetsManagerView,
          WidgetEditorView,
          EditorGalleryView,
          PageStylePicker,
          NavbarView,
          FooterView,
          GuideView,
          MarqueeView,
          ToolBarView,
          TutorialView,
          DeployView,
          RedoController) {

  var EditorView = Backbone.View.extend({
    className : 'editor-page',
    css: "bootstrap-editor",

    events    : {
      'click #editor-save'   : 'save',
      'click #deploy'        : 'deploy',
      'click .menu-button.help' : 'help',
      'click .menu-button.question' : 'question',
      'click .url-bar'       : 'clickedUrl'
    },

    initialize: function(options) {
      _.bindAll(this);

      if(options && options.pageId) pageId = options.pageId;

      util.loadCSS('jquery-ui');

      this.model             = v1State.get('pages').models[pageId];
      v1State.currentPage = this.model;
      v1State.isMobile = false;

      this.widgetsCollection    = this.model.get('uielements');

      this.marqueeView      = new MarqueeView();
      this.galleryEditor    = new EditorGalleryView(this.widgetsCollection);
      this.widgetsManager   = new WidgetsManagerView(this.widgetsCollection);
      this.guides           = new GuideView(this.widgetsCollection);
      this.toolBar          = new ToolBarView();

      redoController = new RedoController();

      keyDispatcher.bindComb('meta+z', redoController.redo);


      g_guides = this.guides;

      this.navbar  = new NavbarView(this.model.get('navbar'));
      this.footer  = new FooterView(this.model.get('footer'));
      this.urlModel      = this.model.get('url');

      this.title = "Editor";

      this.subviews = [ this.marqueeView,
                        this.galleryEditor,
                        this.widgetsManager,
                        this.guides,
                        this.toolBar,
                        this.navbar,
                        this.footer ];
    },

    render: function() {

      if(!this.el.innerHTML) this.el.innerHTML = util.getHTML('editor-page');


      this.toolBar.setElement(document.getElementById('tool-bar')).render();
      this.marqueeView.render();
      this.renderUrlBar();
      this.galleryEditor.render();
      this.widgetsManager.render();
      this.navbar.setElement('#navbar').render();
      this.footer.setElement('#footer').render();
      this.guides.setElement($('#elements-container')).render();

      $('#elements-container').append(this.marqueeView.el);

      this.setupPageWrapper();
      this.setupPageHeight();
      this.setupPageHeightBindings();

      window.addEventListener('resize', this.setupPageWrapper);

      $('#loading-gif').fadeOut().remove();
    },

    renderUrlBar: function() {
      this.$el.find('.url-bar').html(this.urlModel.getUrlString());
    },

    save : function(callback) {
      v1.save();
      return false;
    },

    help: function(e) {
      new TutorialView([6]);
    },

    question: function (e) {
      olark('api.box.show');
      olark('api.box.expand');
    },

    copy: function(e) {
      //if(this.widgetsManager.copy()) { }
    },

    paste: function(e) {
      if(this.widgetsManager.paste()){
        e.stopPropagation();
      }
    },

    deploy: function(options) {
      var url = '/app/'+appId+'/deploy/';
      var self = this;
      util.get('deploy-text').innerHTML = 'Deploying...';

      var success_callback = function() {
        util.get('deploy-text').innerHTML = 'Test Run';
      };

      var urlSuffix = '/' + self.urlModel.getAppendixString();
      if(urlSuffix != '/') urlSuffix += '/';
      v1.deploy(success_callback, { appendToUrl: urlSuffix });
    },

    clickedUrl: function() {
      var newView =  new UrlView(this.urlModel);
      newView.onClose = this.renderUrlBar;
    },

    setupPageWrapper: function() {
      var height = window.innerHeight - 90;
      util.get('page-wrapper').style.height = height+ 'px';
      this.$el.find('.page.full').css('height', height - 46);
    },

    setupPageHeightBindings: function () {
      this.listenTo(this.model.get('uielements'), 'add', function(uielem) {
        this.setupPageHeight();
        this.listenTo(uielem.get('layout'),'change', this.setupPageHeight);
      }, this);

      this.model.get('uielements').each(function(uielem) {
        this.listenTo(uielem.get('layout'), 'change', this.setupPageHeight);
      }, this);
    },

    setupPageHeight: function() {
      var height = (this.model.getHeight() + 4) * 15;
      if(height < 800) height = 800;
      this.$el.find('#elements-container').css('height', height);
    },

    remove: function() {
      window.removeEventListener('resize', this.setupPageWrapper);
      Backbone.View.prototype.remove.call(this);
    }

  });

  return EditorView;
});

