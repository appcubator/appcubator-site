define([
  'models/PageModel',
  'collections/PageCollection',
  'app/pages/UrlView',
  'app/pages/PageView',
  'mixins/ErrorDialogueView',
  'mixins/BackboneNameBox'
],
function(PageModel, PageCollection, UrlView, PageView, ErrorDialogueView) {

  var PagesView = Backbone.View.extend({
    el: document.body,
    'css': 'pages',
    initialize: function() {
      _.bindAll(this);

      util.loadCSS(this.css);
      this.collection = v1State.get('pages');
      this.listenTo(this.collection, 'add', function(model) { this.appendPage(model, false); });

      //this.mobileCollection = v1State.get('mobilePages');
      //this.listenTo(this.mobileCollection, 'add', function(model) { this.appendPage(model, true); });

      this.title = "Pages";
    },

    render: function() {
      this.$el.html(_.template(util.getHTML('pages-page'), {}));
      this.listView = document.getElementById('list-pages');
      //this.mobileListView = document.getElementById('list-mobile-pages');

      if(this.collection.length === 0) {
        //$("#web-section").hide();
        //this.renderAddWeb();
      }
      else {
        this.collection.each(function(model) {
          this.appendPage(model, false);
        }, this);
      }

      /*if(this.mobileCollection.length === 0) {
        //$("#mobile-section").hide();
        //this.renderAddMobile();
      }
      else {
        this.mobileCollection.each(function(model) {
          this.appendPage(model, true);
        }, this);
      }*/

      var createBox = new Backbone.NameBox({el: document.getElementById('create-page-box')});
      createBox.on('submit', this.createPage);

      /*var createMobileBox = new Backbone.NameBox({el: document.getElementById('create-mobile-page-box')});
      createMobileBox.on('submit', this.createMobilePage);*/
    },

    renderAddMobile: function() {
      //this.$el.append('<div class="add-mobile-section pane span40 offset10 hi6"><span class="mw mobile-image"></span><span>Add Mobile Functionality</span></div>');
    },

    renderAddWeb: function() {
      //this.$el.append('<div class="add-web-section pane span40 offset10 hi6"><span class="mw web-image"></span><span>Add Web Functionality</span></div>');
    },

    createPage: function(name, b) {
      var pageUrlPart = name.replace(/ /g, '_');
      var pageUrl = { urlparts : [pageUrlPart] };

      if(!v1State.get('pages').isUnique(name)) {
        new ErrorDialogueView({text: 'Page name should be unique.'});
        return;
      }
      this.collection.add({ name: name, url: pageUrl});
      v1.save();
    },

    createMobilePage: function(name, b) {
      var pageUrlPart = name.replace(' ', '_');
      var pageUrl = { urlparts : [pageUrlPart] };

      if(!v1State.get('mobilePages').isUnique(name)) {
        new ErrorDialogueView({text: 'Page name should be unique.'});
        return;
      }
      this.mobileCollection.add({
        name: name,
        url: pageUrl,
        navbar: {
          brandName: v1State.get('name'),
          links: [
            {
              "url": "internal://Homepage",
              "title": "Homepage"
            },
            {
              "url": "internal://Registration Page",
              "title": "Registration Page"
            }
          ]
        }
      });

      v1.save();
    },

    appendPage: function(model, isMobile) {
      if(!isMobile) {
        var ind = _.indexOf(this.collection.models, model);
        var pageView = new PageView(model, ind, false);
        this.listView.appendChild(pageView.render().el);
      }
      else {
        var ind = _.indexOf(this.mobileCollection.models, model);
        var mobilePageView = new PageView(model, ind, true);
        this.mobileListView.appendChild(mobilePageView.render().el);
      }
    }

  });

  return PagesView;
});
