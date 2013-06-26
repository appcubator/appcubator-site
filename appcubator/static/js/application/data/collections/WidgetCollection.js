define([
  "backbone"
],

function() {


    var WidgetCollection = Backbone.Collection.extend({

      createThirdPartyLogin: function(layout, form) {
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

        var ContainerWidgetModel = require('models/ContainerWidgetModel');
        var widgetModel = new ContainerWidgetModel(widget);
        widgetModel.createLoginRoutes();

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

        var ContainerWidgetModel = require('models/ContainerWidgetModel');
        var widgetModel = new ContainerWidgetModel(widget);
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

        var ContainerWidgetModel = require('models/ContainerWidgetModel');
        var widgetSignupModel = new ContainerWidgetModel(widget);

        return this.push(widgetSignupModel);
      }
    });

    return WidgetCollection;
  });
