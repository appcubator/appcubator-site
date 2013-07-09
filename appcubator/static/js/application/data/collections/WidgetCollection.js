define([
  "models/WidgetModel",
  "models/WidgetContainerModel",
  "backbone"
],

function(WidgetModel,
         WidgetContainerModel) {

    var WidgetCollection = Backbone.Collection.extend({

      createThirdPartyLogin: function(layout, provider) {
        var widget = {};

        widget.type = "thirdpartylogin";
        widget.layout = layout;

        widget.data = {};
        widget.data.nodeType = "form";
        widget.data.class_name = uieState["forms"][0].class_name;
        widget.data.action = "thirdpartylogin";
        widget.data.provider = provider;
        widget.data.content = "Login w/ "+ util.capitaliseFirstLetter(provider);
        widget.data.container_info = {};
        widget.data.container_info.action = "thirdpartylogin";

        var widgetModel = new WidgetContainerModel(widget);

        widgetModel.createLoginRoutes();

        if(v1State.isSingleUser()) {
            widget.data.content = "Sign In w/ " + provider;
            widget.data.userRole = v1State.get('users').first().get('name');
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
        widget.data.container_info.action = "login";
        widget.data.container_info.form = constantContainers["Local Login"];
        widget.data.container_info.form.entity = 'User';

        var widgetModel = new WidgetContainerModel(widget);
        widgetModel.getForm().createLoginRoutes();

        return this.push(widgetModel);
      },

      createSignupForm: function(layout, roleStr) {
        var widget = {};

        widget.type = 'form';
        widget.layout = layout;

        widget.data = {};
        widget.data.nodeType = "form";

        widget.data.container_info= {};
        widget.data.container_info.entity = v1State.get('users').getUserTableWithName(roleStr);
        widget.data.container_info.action = "signup";
        widget.data.container_info.form = constantContainers['Sign Up'];
        widget.data.container_info.form.signupRole = roleStr;
        widget.data.container_info.form.isConstant = true;

        var widgetSignupModel = new WidgetContainerModel(widget);
        return this.push(widgetSignupModel);
      },

      createNodeWithFieldTypeAndContent: function(layout, type, content_ops) {
        var widget = {};
        widget.type = "node";
        widget.layout = layout;

        widget.data = {};
        widget.data.nodeType = type;
        widget.data = _.extend(widget.data, uieState[type][0]);

        if(content_ops.content) widget.data.content =  content_ops.content;
        if(content_ops.href) widget.data.href = content_ops.href;
        if(content_ops.src_content) widget.data.content_attribs.src_content = content_ops.src_content;

        var widgetModel = new WidgetModel(widget);
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
        var currentPage =  v1State.getCurrentPage();

        if(currentPage.getContextEntities().length)  widget.data.container_info.form.goto = "internal://Homepage";
        else widget.data.container_info.form.goto = currentPage.getLinkLang();

        var widgetContainerModel = new WidgetContainerModel(widget);
        widgetContainerModel.getForm().fillWithProps(entity);
        return this.push(widgetContainerModel);
      },

      createEditForm: function(layout, entity) {
        var widget = {};
        widget.type = "form";
        widget.layout = layout;

        widget.data = {};
        widget.data.container_info = {};
        widget.data.container_info.entity = entity;
        widget.data.container_info.form = {};
        widget.data.container_info.form.action = "edit";
        widget.data.container_info.form.entity = entity.get('name');
        widget.data.container_info.form.goto = "internal://Homepage";

        var widgetContainerModel = new WidgetContainerModel(widget);
        widgetContainerModel.getForm().fillWithEditProps(entity);
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
        widget.data.container_info.query = {};

        var widgetContainerModel = new WidgetContainerModel(widget);
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
        widget.data.container_info.row = {};
        widget.data.container_info.query = {};

        var widgetContainerModel = new WidgetContainerModel(widget);
        widgetContainerModel.getRow().fillWithProps(entity);

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
        widget.data.searchQuery.searchPage = "internal://Homepage";
        widget.data.searchQuery.searchFields = entity.get('fields').pluck('name');

        var widgetContainerModel = new WidgetContainerModel(widget);
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
        widget.data.container_info.row = {};
        widget.data.container_info.search = {};
       // widget.data.container_info.query = {};

        var widgetContainerModel = new WidgetContainerModel(widget);
        widgetContainerModel.getRow().fillWithProps(entity);
        return this.push(widgetContainerModel);
      },

      createImageSlider: function(layout) {
        var widget = {};
        widget.type = "gallery";

        widget.data = {};
        widget.data.nodeType = "imageslider";
        widget.data.container_info = {};
        widget.data.container_info.uielements = [];
        widget.data.container_info.action = "imageslider";

        widget.data.container_info.slides = [
          {image : '/static/img/placeholder-slide1.png'},
          {image : '/static/img/placeholder-slide2.png'}
        ];

        var widgetContainerModel = new WidgetContainerModel(widget);

        return this.push(widgetContainerModel);
      },

      createTwitterFeed: function(layout) {
        var widget = {};
        widget.type = "gallery";

        widget.data = {};
        widget.data.nodeType = "twitterfeed";
        widget.data.container_info = {};
        widget.data.container_info.action = "twitterfeed";

        var widgetContainerModel = new WidgetContainerModel(widget);

        return this.push(widgetContainerModel);
      },

      createFacebookShare: function(layout) {
        var widget = {};
        widget.type = "gallery";

        widget.data = {};
        widget.data.nodeType = "facebookshare";
        widget.data.container_info = {};
        widget.data.container_info.action = "facebookshare";

        var widgetContainerModel = new WidgetContainerModel(widget);

        return this.push(widgetContainerModel);
      },

      addWidgetContainerModel: function(uielementDict) {
        return this.push(new WidgetContainerModel(uielementDict));
      },

      addWidgetModel: function(uielementDict) {
        return this.push(new WidgetModel(uielementDict));
      }

    });

    return WidgetCollection;
  });
