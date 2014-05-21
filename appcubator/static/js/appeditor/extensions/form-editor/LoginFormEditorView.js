define([
  'models/FormFieldModel',
  'editor/form-editor/ActionEditorView',
  'tutorial/TutorialView',
  'mixins/BackboneModal',
  'mixins/SelectView',
  'jquery-ui'
],
function(FormFieldModel, ActionEditorView, TutorialView) {

  var LoginFormEditorView = Backbone.ModalView.extend({

    className: 'login-route-editor modal',
    padding: 0,
    css: 'form-editor',
    doneButton: true,

    events: {
      'change .redirect-page' : 'redirectChanged'
    },

    initialize: function(loginRoutes) {
      _.bindAll(this);
      this.model = loginRoutes;

      if(loginRoutes.length != v1State.get('users').length) {
        loginRoutes.reorganize();
      }

      this.render();
    },

    render: function() {
      this.el.innerHTML = "<h3>Login Editor</h3>";
      var pages = _.map(v1State.get('pages').getContextFreePages(), function(page) { return {name: page, val: 'internal://'+page}; });
      var userPages = _.map(v1State.get('pages').getPagesWithEntityName('User'), function(page) { return {name: page, val: 'internal://' + page +'/?User=CurrentUser'}; });
      pages = _.union(pages, userPages);
      this.model.each(function(route) {
        this.el.innerHTML += _.template(FormEditorTemplates.routeTemplate, {route: route, pages: pages });
      }, this);

      return this;
    },

    redirectChanged: function (e) {
      var cid = e.target.id.replace('redirect-select-','');
      var route = this.model.get(cid);

      console.log(e.target.value);
      route.set('redirect', e.target.value);
    }


  });


  return LoginFormEditorView;

});
