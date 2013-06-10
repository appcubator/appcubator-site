define([
  'models/PageModel',
  'collections/TableCollection',
  'app/UrlView',
  'mixins/SimpleModalView',
  'mixins/ErrorModalView',
  'mixins/DebugOverlay',
  'm-editor/MobileWidgetsManagerView',
  'editor/WidgetEditorView',
  'editor/EditorGalleryView',
  'editor/PageStylePicker',
  'editor/NavbarView',
  'editor/NavbarEditorView',
  'editor/GuideView',
  'editor/MarqueeView',
  'tutorial/TutorialView',
  'mixins/BackboneNameBox',
  'editor/editor-templates',
  'jquery-ui'
],
function( PageModel,
          TableCollection,
          UrlView,
          SimpleModalView,
          ErrorModalView,
          DebugOverlay,
          MobileWidgetsManagerView,
          WidgetEditorView,
          EditorGalleryView,
          PageStylePicker,
          NavbarView,
          NavbarEditorView,
          GuideView,
          MarqueeView,
          TutorialView) {

  var MobileEditorView = Backbone.View.extend({
    className : 'editor-page',
    css: "bootstrap-mobile-editor",

    events    : {
      'click #save'          : 'save',
      'click #deploy'        : 'deploy',
      'click .menu-button.help' : 'help',
      'click .url-bar'       : 'clickedUrl',
      'click #navbar'        : 'openNavbarEditor',
      'click .home'          : 'clickedHome',
      'click .go-to-page'    : 'clickedGoToPage'
    },

    initialize: function(options) {
      _.bindAll(this, 'render',
                      'openNavbarEditor',
                      'copy',
                      'paste',
                      'help',
                      'renderUrlBar',
                      'getContextEntities',
                      'clickedUrl',
                      'createPage',
                      'save',
                      'deploy',
                      'renderDeployResponse',
                      'clickedGoToPage',
                      'setupPageHeight');

      if(options && options.pageId) pageId = options.pageId;

      iui.loadCSS(this.css);

      //iui.loadCSS('ratchet');
      iui.loadCSS('bootstrap-editor');
      iui.loadCSS('jquery-ui');

      this.model          = v1State.get('mobilePages').models[pageId];
      v1State.currentPage = this.model;

      /* Globals */
      g_contextCollection    = new TableCollection();
      this.getContextEntities();

      this.widgetsCollection    = this.model.get('uielements');

      this.galleryEditor    = new EditorGalleryView(this.widgetsCollection);
      this.widgetsManager   = new MobileWidgetsManagerView(this.widgetsCollection);

      this.navbar  = new NavbarView(this.model.get('navbar'));
      this.urlModel      = this.model.get('url');

      var page = appState.mobilePages[pageId];

      var self = this; // for binding deploy to ctrlshiftd
      /* Bindings */
      keyDispatcher.key('⌘+s, ctrl+s', this.save);
      keyDispatcher.key('⌘+c, ctrl+c', this.copy);
      keyDispatcher.key('⌘+v, ctrl+v', this.paste);
      keyDispatcher.key('⌘+shift+d, ctrl+shift+d', function(){ self.deploy({local:true}); });

      this.title = "Editor";
    },

    render: function() {

      if(!this.el.innerHTML) this.el.innerHTML = iui.getHTML('mobile-editor-page');

      iui.get('page-list').innerHTML += '<li>'+appState.mobilePages[pageId].name+'</li>';

      _(appState.pages).each(function(page, ind) {
        if(pageId == ind) return;
        iui.get('page-list').innerHTML += '<li class="go-to-page" id="page-'+ind+'"><a>' + page.name +
                                          '</a></li>';
      });

      var createBox = new Backbone.NameBox({tagName: 'li', className:'new-page', txt:'New Page'});
      createBox.on('submit', this.createPage);

      iui.get('page-list').appendChild(createBox.el);


      this.renderUrlBar();
      this.galleryEditor.render();
      this.widgetsManager.render();
      this.navbar.render();
      this.setupPageHeight();

      $('#loading-gif').fadeOut().remove();
    },

    openNavbarEditor: function(e) {
      new NavbarEditorView({model: this.model.get('navbar')});
    },

    renderUrlBar: function() {
      this.$el.find('.url-bar').html(this.urlModel.getUrlString());
    },

    save : function(callback) {
      var $el = $('.menu-button.save');
      $el.fadeOut().html("<span>Saving...</span>").fadeIn();
      var curAppState = v1State.toJSON();
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(curAppState),
        complete: function() {
          iui.dontAskBeforeLeave();
        },
        success: function() {
          $el.html("<span>Saved</span>").fadeIn();
          if(typeof(callback) !== 'undefined'&&typeof(callback) == 'function')
            { callback(); }
          setTimeout(function(){
            $el.html("<span>Save</span>").fadeIn();
          },3000);
        },
        error: function(data, t) {
          var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
          if(DEBUG) {
            var rData = JSON.parse(data.responseText);
            var max_length = 500;
            rData = _.map(rData, function(s) { if(s.length > max_length ) return s.substring(0, max_length); else return s; });
            content = { text: "<br />Error saving app state<br />" + rData.join('<br />\n') };
          }
          //new ErrorModalView(content);
          new DebugOverlay(content);
        }
      });


      return false;
    },

    help: function(e) {
      new TutorialView([6]);
    },

    copy: function(e) {
      if(this.widgetsManager.copy()) { }
    },

    paste: function(e) {
      if(this.widgetsManager.paste()){
        e.stopPropagation();
      }
    },

    deploy: function(options) {
      var url = '/app/'+appId+'/deploy/';
      if(options.local) url = url + 'local/';

      var self = this;
      iui.get('deploy').innerHTML = '<span>Deploying...</span>';

      $.ajax(url, {
        type: "POST",
        complete: function() {
          iui.get('deploy').innerHTML = '<span>Test Run</span>';
        },
        success: function(data) {
          self.renderDeployResponse(true, data, self);
        },
        error: function(jqXHR) {
          var data = JSON.parse(jqXHR.responseText);
          if(DEBUG)
            self.renderDeployResponse(false, data, self);
          else {
            var fakedata = { errors: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
            self.renderDeployResponse(false, fakedata, self);
          }
        },
        dataType: "JSON"
      });
    },

    renderDeployResponse: function(success, responseData, self) {
      if(success)
      {
        new SimpleModalView({ text: 'Your app is available at <a target="_blank" href="'+ responseData.site_url + self.urlModel.getAppendixString() +'">'+ responseData.site_url + self.urlModel.getAppendixString() +'</a><br /><br />You can also see your code on <a target="_blank" href="'+ responseData.github_url +'">Github</a>', img:'happy_engineer.png'});
      }
      else
      {
        //new ErrorModalView({ text: responseData.errors });
        new DebugOverlay({ text: responseData.errors });
      }
    },

    getContextEntities: function() {
      var self = this;
      var entityModels = [];
      var contextEntites = _.filter(self.model.get('url').get('urlparts'), function(str){ return (/\{\{([^\}]+)\}\}/g.exec(str)); });
      contextEntites = _.map(contextEntites, function(str){ return (/\{\{([^\}]+)\}\}/g.exec(str))[1];});

      _(contextEntites).each(function(entityName) {
        var entity =  v1State.get('entities').getEntityWithName(entityName);
        g_contextCollection.push(entity);
      });
    },

    clickedUrl: function() {
      var newView =  new UrlView(this.urlModel);
      newView.onClose = this.renderUrlBar;
    },

    createPage: function(name) {
      var pageUrlPart = name.replace(' ', '_');
      var pageUrl = { urlparts : [pageUrlPart] };
      var pageInd = appState.pages.length;
      var pageModel = new PageModel({ name: name, url: pageUrl});
      v1State.get('mobilePages').push(pageModel);

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
      e.preventDefault();
      v1.navigate("app/"+ appId +"/pages/", {trigger: true});
    },

    clickedGoToPage: function(e) {
      e.preventDefault();
      var goToPageId = (e.target.id||e.target.parentNode.id).replace('page-','');
      v1.navigate("app/"+ appId +"/mobile-editor/" + goToPageId +"/", {trigger: true});
    },

    setupPageHeight: function() {
      var height = (this.model.getHeight() + 4) * 15;
      this.$el.find('#elements-container').css('height', height);
    }

  });

  return MobileEditorView;
});

