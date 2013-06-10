define([
  'collections/FormFieldCollection',
  'collections/ActionCollection'
],
function(FormFieldCollection, ActionCollection) {

  var FormModel = Backbone.Model.extend({
    initialize: function(bone) {

      this.set('name', bone.name);
      this.set('fields', new FormFieldCollection());
      this.set('action', bone.action||"create");
      this.set('actions', new ActionCollection(bone.actions || []));
      this.set('belongsTo', bone.belongsTo||null);
      this.set('entity', bone.entity);

      if(bone.fields) {
        this.get('fields').add(bone.fields);
      }
      else {
        var field = {
                        "name": "Submit",
                        "type" : "button",
                        "label" : " ",
                        "displayType": "button",
                        "placeholder": "Submit",
                        "options": []
                    };

        this.get('fields').push(field);
      }
    },

    fillWithProps: function(entity) {
      var self = this;
      _(entity.get('fields').models).each(function(fieldModel) {

        var type = fieldModel.get('type');
        var formFieldModel = { name: fieldModel.get('name'),
                               displayType: "single-line-text",
                               type: type };

        if(type == "fk"||type == "m2m"||type == "o2o") { return; }
        if(type == "email") { formFieldModel.displayType = "email-text"; }
        if(type == "image") { formFieldModel.displayType = "image-uploader"; }
        if(type == "date") { formFieldModel.displayType = "date-picker"; }

        var ind = self.get('fields').models.length - 1;
        self.get('fields').push(formFieldModel, {at: ind});
      });
    },

    getRelationalActions: function(pageModel) {
      var entity = this.get('entity');
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

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.name = json.name || "";
      json.fields = this.get('fields').toJSON();
      if(json.entity.attributes) {
        json.entity = json.entity.get('name');
      }
      return json;
    }

  });

  return FormModel;

});
