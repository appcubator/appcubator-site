define([
  'app/UrlView',
  'mixins/SimpleModalView',
  'app/templates/PageTemplates',
  'iui',
  'backbone'
],
function(UrlView, SimpleModalView) {

  var PageView = Backbone.View.extend({
    el: null,
    tagName : 'div',
    className: 'page-view span18 hoff2 offsetr1 pane hi22',
    expanded: false,
    events: {
      'click .delete' : 'deletePage',
      'change #access_level' : 'accessLevelChanged',
      'click .edit-url' : 'renderUrl',
      'click .edit'     : 'goToEditor'
    },

    initialize: function(pageModel, ind, isMobile) {
      _.bindAll(this, 'render',
                      'renderMenu',
                      'renderUrl',
                      'goToEditor',
                      'accessLevelChanged',
                      'deletePage');

      this.model = pageModel;
      this.ind = ind;
      this.isMobile = isMobile;

      this.urlModel = pageModel.get('url');
      this.render();

      this.renderMenu();
    },

    render: function() {
      var page_context = {};
      page_context.page_name = this.model.get('name');
      page_context.ind = this.ind;

      var page = _.template(PageTemplates.tempPage, page_context);
      this.el.innerHTML += page;
    },

    renderUrl: function() {
      var newView =  new UrlView(this.urlModel);
    },

    renderMenu: function() {
      var page_context = {};
      page_context = this.model.attributes;
      page_context.page_name = this.model.get('name');
      page_context.ind = this.ind;
      page_context.user_roles = v1State.get('users').map(function (userModel) {
        return userModel.get('role');
      });

      var page = _.template(PageTemplates.tempMenu, page_context);
      var span = document.createElement('span');
      span.innerHTML = page;

      this.el.appendChild(span);
    },

    accessLevelChanged: function (e) {
      this.model.set('access_level', e.target.value);
    },

    deletePage: function() {
      if(this.model.get('name') == "Homepage" || this.model.get('name') == "Registration Page") {
        new SimpleModalView({text: "Hompage and Registration page are essential parts of" +
                                   "your application and cannot be deleted."});

        return;
      }

      this.model.collection.remove(this.model);
      this.remove();
    },

    goToEditor: function(e) {
      e.preventDefault();
      if(this.isMobile) {
        v1.navigate("app/"+ appId +"/mobile-editor/" + this.ind + '/', {trigger: true});
      }
      else {
        v1.navigate("app/"+ appId +"/editor/" + this.ind + '/', {trigger: true});
      }
    }
  });

  return PageView;
});