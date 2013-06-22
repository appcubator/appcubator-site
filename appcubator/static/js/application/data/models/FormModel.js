define([
  'collections/FormFieldCollection',
  'collections/ActionCollection',
  'collections/LoginRouteCollection',
  'models/ActionModel'
],
function(
  FormFieldCollection,
  ActionCollection,
  LoginRouteCollection,
  ActionModel) {

  var FormModel = Backbone.Model.extend({
    initialize: function(bone) {

      this.set('name', bone.name);
      this.set('fields', new FormFieldCollection());
      this.set('action', bone.action||"create");
      this.set('actions', new ActionCollection(bone.actions || []));

      if(bone.loginRoutes) { this.set('loginRoutes', new LoginRouteCollection(bone.loginRoutes));}
      if(!bone.goto || !_.isString(bone.goto)) { bone.goto = "internal://Homepage"; }
      if(bone.goto) {
        var name = bone.goto.replace('internal://','');
        var parts = name.split('/?');
        console.log(parts);
        this.set('goto', new ActionModel( { type: "goto", page_name: parts[0], context: parts[1] }));
      }

      this.set('entity', bone.entity);

      if(bone.fields) { this.get('fields').add(bone.fields); }

      else {
        var field = {
                        "type" : "button",
                        "displayType": "button",
                        "placeholder": "Submit",
                        "label": ""
                    };

        this.get('fields').push(field);
      }
    },

    fillWithProps: function(entity) {
      entity.get('fields').each(function(fieldModel) {
        var type = fieldModel.get('type');
        var formFieldModel = { field_name: fieldModel.get('name'),
                               displayType: "single-line-text",
                               type: type,
                               label: fieldModel.get('name'),
                               placeholder: fieldModel.get('name') };

        if(type == "fk"||type == "m2m"||type == "o2o") { return; }
        if(type == "email") { formFieldModel.displayType = "email-text"; }
        if(type == "image") { formFieldModel.displayType = "image-uploader"; }
        if(type == "date") { formFieldModel.displayType = "date-picker"; }

        var ind = this.get('fields').models.length - 1;
        this.get('fields').push(formFieldModel, {at: ind});
      }, this);
    },

    getRelationalActions: function(pageModel) {

      if(this.get('action') == "login" || this.get('action') == "signup") return [];
      var entity = v1State.get('tables').getTableWithName(this.get('entity'));
      var possibleActions = [];
      var userFields = pageModel.getFields();

      _(userFields).each(function(field) {
        if(field.get('entity_name') == entity.get('name')) {
          var action = { "set_fk": "this." + field.get('related_name'),
                         "to_obj": "CurrentUser"};
          possibleActions.push(action);
        }
      });

      entity.get('fields').each(function(field) {
        if(field.get('entity_name') == "User") {
          var nlDescr = "Add to CurrentUser." + field.get('related_name');
          var action = { "type": "relation",
                         "set_fk": "this." + field.get('name'),
                         "to_obj": "CurrentUser",
                         "nl_description": nlDescr};
          possibleActions.push(action);
        }
      });

      return possibleActions;
    },

    addRedirect: function(pageModel) {
      this.set('redirect', new ActionModel({
        type : "redirect",
        page_name : pageModel.get('name')
      }));
    },

    getPossibleGotos: function() {
      var entityName = this.get('entity');
      var listOfPages = new ActionCollection();

      _(v1State.get('pages').getContextFreePageModels()).each(function(pageModel) {
        listOfPages.push({
          type: "goto",
          page_name: pageModel.get('name')
        });
      });

      _(v1State.get('pages').getPageModelsWithEntityName(entityName)).each(function(pageModel) {
        listOfPages.push({
          type: "goto",
          page_name: pageModel.get('name'),
          context: entityName+"=Form."+entityName
        });
      });

      return listOfPages;
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.name = json.name || "";
      json.fields = this.get('fields').toJSON();
      json.goto = json.goto.toJSON();
      return json;
    }

  });

  return FormModel;

});
