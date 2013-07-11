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
  'tutorial/TutorialView',
  'app/DeployView',
  'mixins/BackboneNameBox',
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
          TutorialView,
          DeployView) {

  var EditorView = Backbone.View.extend({
    className : 'editor-page',
    css: "bootstrap-editor",

    events    : {
      'click #editor-save'   : 'save',
      'click #deploy'        : 'deploy',
      'click .menu-button.help' : 'help',
      'click .menu-button.question' : 'question',
      'click .url-bar'       : 'clickedUrl',
      'click .home'          : 'clickedHome',
      'click .go-to-page'    : 'clickedGoToPage'
    },

    initialize: function(options) {
      _.bindAll(this);

      if(options && options.pageId) pageId = options.pageId;

      util.loadCSS(this.css);
      util.loadCSS('jquery-ui');

      this.model             = v1State.get('pages').models[pageId];
      v1State.currentPage = this.model;
      v1State.isMobile = false;

      this.widgetsCollection    = this.model.get('uielements');

      this.marqueeView      = new MarqueeView();
      this.galleryEditor    = new EditorGalleryView(this.widgetsCollection);
      this.widgetsManager   = new WidgetsManagerView(this.widgetsCollection);
      this.guides           = new GuideView(this.widgetsCollection);
      g_guides = this.guides;

      this.navbar  = new NavbarView(this.model.get('navbar'));
      this.footer  = new FooterView(this.model.get('footer'));
      this.urlModel      = this.model.get('url');

      var page = v1State.get('pages').at(pageId);

      var self = this; // for binding deploy to ctrlshiftd
      /* Bindings */
      keyDispatcher.key('⌘+c, ctrl+c', this.copy);
      keyDispatcher.key('⌘+v, ctrl+v', this.paste);

      this.title = "Editor";
    },

    render: function() {

      if(!this.el.innerHTML) this.el.innerHTML = util.getHTML('editor-page');

      util.get('page-list').innerHTML += '<li>'+ v1State.get('pages').models[pageId].get('name') +'</li>';

      v1State.get('pages').each(function(page, ind) {
        if(pageId == ind) return;
        util.get('page-list').innerHTML += '<li class="go-to-page" id="page-'+ind+'"><a>' + page.get('name') +
                                          '</a></li>';
      });

      var createBox = new Backbone.NameBox({tagName: 'li', className:'new-page', txt:'New Page'});
      createBox.on('submit', this.createPage);

      util.get('page-list').appendChild(createBox.el);


      this.marqueeView.render();

      this.renderUrlBar();
      this.galleryEditor.render();
      this.widgetsManager.render();
      this.navbar.render();
      $('#footer-container').append(this.footer.render().el);
      this.guides.setElement($('#elements-container')).render();

      $('#elements-container').append(this.marqueeView.el);

      this.setupPageWrapper();
      this.setupPageHeight();
      window.onresize = this.setupPageWrapper;

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

    createPage: function(name) {
      var pageUrlPart = name.replace(/ /g, '_');
      var pageUrl = { urlparts : [pageUrlPart] };
      var pageInd = v1State.get('pages').length;
      var pageModel = new PageModel({ name: name, url: pageUrl});
      v1State.get('pages').push(pageModel);

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(v1State.toJSON()),
        complete: function() {
          $('<li class="go-to-page" id="page-'+pageInd+'"><a>'+name+'</a></li>').insertBefore($('#page-list').find(".new-page"));
        },
        dataType: "JSON"
      });
    },

    clickedHome: function(e) {
      v1.navigate("app/"+ appId +"/pages/", {trigger: true});
    },

    clickedGoToPage: function(e) {
      var goToPageId = (e.target.id||e.target.parentNode.id).replace('page-','');
      v1.navigate("app/"+ appId +"/editor/" + goToPageId +"/", {trigger: true});
    },

    setupPageWrapper: function() {
      var height = window.innerHeight - 90;
      util.get('page-wrapper').style.height = height+ 'px';
      this.$el.find('.page.full').css('height', height - 46);
    },

    setupPageHeight: function() {
      var height = (this.model.getHeight() + 4) * 15;
      if(height < 800) height = 800;
      this.$el.find('#elements-container').css('height', height);
    },

    remove: function() {
      this.widgetsManager.remove();
      this.marqueeView.remove();
      Backbone.View.prototype.remove.call(this);
    }

  });

  return EditorView;
});

