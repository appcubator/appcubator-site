define([
  'models/UrlModel',
  'models/NavbarModel',
  'models/FooterModel',
  'collections/WidgetCollection'
],
function(UrlModel, NavbarModel, FooterModel, WidgetCollection) {

  var PageModel = Backbone.Model.extend({
    defaults : {
      "name"         : "default-page",
      "access_level" : "all",
      "uielements"   : []
    },

    initialize: function(bone) {
      bone = bone||{};
      var self = this;
      if(bone.url && bone.url.urlparts.length == 0) {
        // homepage shouldn't have a customizable url
        if(this.get('name') === 'Homepage') {
          bone.url.urlparts = [];
        }
        else {
          bone.url.urlparts = [this.get('name') || "Page Name"];
        }
      }
      this.set('url', new UrlModel(bone.url||{}));
      this.set('navbar', new NavbarModel(bone.navbar||{}));
      this.set('footer', new FooterModel(bone.footer||{}));
      this.set('uielements', new WidgetCollection());
      _(bone.uielements).each(function(uielement) {
        if(uielement.container_info) {
          this.get('uielements').addWidgetContainerModel(uielement);
        }
        else {
          this.get('uielements').addWidgetModel(uielement);
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
      this.get('url').get('urlparts').each(function(urlPart) {
        var part = urlPart.get('value');
        if (/{{([^\}]+)}}/g.exec(part)) entities.push(/\{\{([^\}]+)\}\}/g.exec(part)[1]);
      });
      return entities;
    },

    getContextSentence: function () {
      var entities = [];
      _(this.get('url').get('urlparts')).each(function(urlPart) {
        if (/{{([^\}]+)}}/g.exec(urlPart)) entities.push(/\{\{([^\}]+)\}\}/g.exec(urlPart)[1]);
      });

      if(entities.length === 0) {
        return "";
      }
      else if(entities.length === 1) {
        return "Page has a " + entities[0];
      }
      else {
        var str = "Page has ";
        _(entities).each(function(val, ind) {
          if(ind == entities.length - 1) {
            str += "and a " + val;
          }
          else {
            str += "a "+val + " ";
          }
        });

        return str;
      }
    },

    getFields: function() {
      var access = this.get('access_level');
      if(access == "all") { return v1State.get('users').getCommonProps(); }
      if(access == "users") { return v1State.get('users').getCommonProps(); }

      var model = v1State.get('users').getUserTableWithName(access);
      return model.get('fields');
    },

    updatePageName: function(urlModel, newPageName) {
      this.set('page_name', newPageName);
    },

    getLinkLang: function(contextArgs) {
      var str = "internal://" + this.get('name');
      return str;
    },

    getPageContextDatalang: function() {
      var entities = this.getContextEntities();
      return "Page." + entities[0];
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
