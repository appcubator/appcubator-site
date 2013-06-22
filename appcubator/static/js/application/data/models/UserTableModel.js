define([
  'models/TableModel',
  'models/FieldModel',
  'collections/FieldsCollection',
  'backbone'
],
function(TableModel, FieldModel, FieldsCollection, Backbone) {

  var UserTableModel = TableModel.extend({

    initialize: function(bone) {

      if(typeof bone === "string") {
        bone = appState.users;
      }

      var fieldCollection = new FieldsCollection();
      if(bone) fieldCollection.add(bone.fields);

      this.set('fields', fieldCollection);
    },

    getNormalFields: function() {
      var normalFields = this.get('fields').filter(function(field) { return !field.isRelatedField(); });
      normalFields = _.union(normalFields, v1State.get('users').predefinedFields);
      return normalFields;
    },

    toJSON: function () {
      var json = {};
      json        = _.clone(this.attributes);
      json.fields = this.get('fields').toJSON();
      json.fields = _.uniq(json.fields, function(val) { return val.name; });
      json.fields = _.filter(json.fields, function(val){ return (val.name != "First Name")&&(val.name != "Last Name");});

      return json;
    }

  });

  return UserTableModel;
});
