define([
  'models/FormFieldModel',
  'editor/form-editor/ActionEditorView',
  'tutorial/TutorialView',
  'app/templates/FormEditorTemplates',
  'mixins/BackboneModal',
  'mixins/SelectView',
  'jquery-ui'
],
function(FormFieldModel, ActionEditorView, TutorialView) {

  var LoginFormEditorView = Backbone.ModalView.extend({

    className: 'login-route-editor modal',
    padding: 0,
    css: 'form-editor',

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
      util.loadCSS('form-editor');
    },

    render: function() {
      this.el.innerHTML = "<h3>Login Editor</h3>";

      this.model.each(function(route) {
        this.el.innerHTML += _.template(FormEditorTemplates.routeTemplate, {route: route, pages: v1State.getPages().toJSON() });
      }, this);

      return this;
    },

    redirectChanged: function (e) {
      var cid = e.target.id.replace('redirect-select-','');
      var route = this.model.get(cid);
      console.log(route);
      route.set('redirect', e.target.value);
    }


  });


  return LoginFormEditorView;

});
