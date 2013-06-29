define([
  "models/WidgetModel",
  "backbone"
],

function(WidgetModel) {


    var WidgetCollection = Backbone.Collection.extend({

      createThirdPartyLogin: function(layout, form, roleStr) {
        var widget = {};

        widget.type = "thirdpartylogin";
        widget.layout = layout;

        widget.data = {};
        widget.data.nodeType = "form";
        widget.data.class_name = uieState["forms"][0].class_name;
        widget.data.action = form.action;
        widget.data.provider = form.provider;
        widget.data.content = form.content;
        widget.data.container_info = {};
        widget.data.container_info.action = "thirdpartylogin";
        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetModel = new WidgetContainerModel(widget);

        widgetModel.createLoginRoutes();

        if(!v1State.isSingleUser()) {
            widget.data.content = "Sign In w/" + form.provider;
            widget.data.userRole = roleStr;
        }
        return this.push(widgetModel);
      },

      createThirdPartySignup: function(layout, provider, roleStr) {
        var widget = {};

        widget.type = "thirdpartylogin";
        widget.layout = layout;

        widget.data = {};
        widget.data.nodeType = "form";
        widget.data.class_name = uieState["forms"][0].class_name;
        widget.data.action = "thirdpartysignup";
        widget.data.provider = provider;
        widget.data.content = "Sign Up w/ "+ provider;
        widget.data.action = "thirdpartylogin";
        widget.data.signupRole = roleStr;
        widget.data.goto = "internal://Homepage";

        widget.data.container_info = {};

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetModel = new WidgetContainerModel(widget);

        return this.push(widgetModel);
      },

      createLoginForm: function(layout, form) {
        var widget = {};

        widget.type = 'form';
        widget.layout = layout;

        widget.data = {};
        widget.data.nodeType = "form";
        widget.data.class_name = uieState["forms"][0].class_name;

        widget.data.container_info = {};
        widget.data.container_info.entity = form.entity;
        widget.data.container_info.action = form.action;
        widget.data.container_info.form = form;
        widget.data.container_info.form.entity = 'User';

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetModel = new WidgetContainerModel(widget);
        widgetModel.getForm().createLoginRoutes();

        return this.push(widgetModel);
      },

      createSignupForm: function(layout, form, roleStr) {
        var widget = {};

        widget.type = 'form';
        widget.layout = layout;

        widget.data = {};
        widget.data.nodeType = "form";

        widget.data.container_info= {};
        widget.data.container_info.entity = v1State.get('users').getUserTableWithName(roleStr);
        widget.data.container_info.action = form.action;
        widget.data.container_info.form = form;
        widget.data.container_info.form.signupRole = roleStr;

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetSignupModel = new WidgetContainerModel(widget);
        return this.push(widgetSignupModel);
      },

      createNodeWithFieldTypeAndContent: function(layout, type, content) {
        var widget = {};
        widget.type = "node";
        widget.layout = layout;

        widget.data = {};
        widget.data         = _.extend(widget.data, uieState[type][0]);
        if(content) widget.data.content =  content;

        var WidgetModel = require('models/WidgetModel');
        var widgetModel = new WidgetModel(widget, true);
        return this.push(widgetModel);
      },

      createCreateForm: function(layout, entity) {
        var widget = {};
        widget.type = "form";
        widget.layout = layout;

        widget.data = {};
        widget.data.container_info = {};
        widget.data.container_info.entity = entity;
        widget.data.container_info.action = "create";
        widget.data.container_info.form = {};
        widget.data.container_info.form.entity = entity.get('name');
        widget.data.container_info.form.goto = "internal://Homepage";

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetContainerModel = new WidgetContainerModel(widget, true);
        return this.push(widgetContainerModel);
      },

      createTable: function(layout, entity) {
        var widget = {};
        widget.type = "loop";
        widget.layout = layout;

        widget.data = {};
        widget.data.container_info = {};
        widget.data.container_info.entity = entity;
        widget.data.container_info.action = "table";

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetContainerModel = new WidgetContainerModel(widget, true);
        return this.push(widgetContainerModel);
      },

      createList: function(layout, entity) {
        var widget = {};
        widget.type = "loop";
        widget.layout = layout;

        widget.data = {};
        widget.data.container_info = {};
        widget.data.container_info.entity = entity;
        widget.data.container_info.action = "show";

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetContainerModel = new WidgetContainerModel(widget, true);
        return this.push(widgetContainerModel);
      },

      createSearchbox: function(layout, entity) {
        var widget = {};
        widget.type = "search";
        widget.layout = layout;

        widget.data = {};
        widget.data.container_info = {};
        widget.data.container_info.entity = entity;
        widget.data.container_info.action = "searchbox";

        widget.data.searchQuery = {};
        widget.data.searchQuery.searchOn = _.clone(entity.get('name'));
        widget.data.searchQuery.searchPage = "Homepage";
        widget.data.searchQuery.searchFields = entity.get('fields').pluck('name');

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetContainerModel = new WidgetContainerModel(widget, true);
        return this.push(widgetContainerModel);
      },

      createSearchList: function(layout, entity) {
        var widget = {};
        widget.type = "loop";
        widget.layout = layout;

        widget.data = {};
        widget.data.container_info = {};
        widget.data.container_info.entity = entity;
        widget.data.container_info.action = "searchlist";

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetContainerModel = new WidgetContainerModel(widget, true);
        return this.push(widgetContainerModel);
      },

      createImageSlider: function(layout) {
        var widgetSignupModel = {};
        widget.type = "gallery";

        widget.data = {};
        widget.data.nodeType = "imageslider";
        widget.data.container_info = {};
        widget.data.container_info.action = "imageslider";

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetContainerModel = new WidgetContainerModel(widget, true);

        return this.push(widgetContainerModel);
      },

      createTwitterFeed: function(layout) {
        var widgetSignupModel = {};
        widget.type = "gallery";

        widget.data = {};
        widget.data.nodeType = "twitterfeed";
        widget.data.container_info = {};
        widget.data.container_info.action = "twitterfeed";

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetContainerModel = new WidgetContainerModel(widget, true);

        return this.push(widgetContainerModel);
      },

      createFacebookShare: function(layout) {
        var widgetSignupModel = {};
        widget.type = "gallery";

        widget.data = {};
        widget.data.nodeType = "facebookshare";
        widget.data.container_info = {};
        widget.data.container_info.action = "facebookshare";

        var WidgetContainerModel = require('models/WidgetContainerModel');
        var widgetContainerModel = new WidgetContainerModel(widget, true);

        return this.push(widgetContainerModel);
      }
    });

    return WidgetCollection;
  });
