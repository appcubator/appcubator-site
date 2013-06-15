define([
  'models/UrlModel',
  'models/NavbarModel',
  'models/FooterModel',
  'models/ContainerWidgetModel',
  'models/WidgetModel',
  'collections/WidgetCollection'
],
function(UrlModel, NavbarModel, FooterModel, ContainerWidgetModel, WidgetModel, WidgetCollection) {

  var PageModel = Backbone.Model.extend({
    defaults : {
      "name"         : "default-page",
      "access_level" : "all",
      "uielements"   : []
    },

    initialize: function(bone) {
      bone = bone||{};

      this.set('url', new UrlModel(bone.url||{}));
      this.set('navbar', new NavbarModel(bone.navbar||{}));
      this.set('footer', new FooterModel(bone.footer||{}));
      this.set('uielements', new WidgetCollection());
      _(bone.uielements).each(function(uielement) {
        if(uielement.container_info) {
          this.get('uielements').push(new ContainerWidgetModel(uielement));
        }
        else {
          this.get('uielements').push(new WidgetModel(uielement));
        }
      }, this);
    },

    getHeight: function() {
      var height  = 0;

      this.get('uielements').each(function(uielement) {
        var layout = uielement.get('layout');
        var bottom = layout.get('top') + layout.get('height');
        if(bottom > height) { height = bottom; }
      });

      return height;
    },

    doesContainEntityName: function(entityName) {
      return _.contains(this.get('url').get('urlparts'), '{{' + entityName + '}}');
    },

    getContextEntities: function() {
      var entities = [];
      _(this.get('url').get('urlparts')).each(function(urlPart) {
        if (/{{([^\}]+)}}/g.exec(urlPart)) entities.push(/\{\{([^\}]+)\}\}/g.exec(urlPart)[1]);
      });
      return entities;
    },

    getFields: function() {
      var access = this.get('access_level');
      if(access == "all") { return v1State.get('users').getCommonProps(); }
      if(access == "all-users") { return v1State.get('users').getCommonProps(); }

      var model = v1State.get('users').getUserEntityWithName(access);
      return model.get('fields');
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.url = this.get('url').toJSON();
      json.navbar = this.get('navbar').toJSON();
      json.footer = this.get('footer').toJSON();
      json.uielements = this.get('uielements').toJSON();
      return json;
    }
  });

  return PageModel;
});
