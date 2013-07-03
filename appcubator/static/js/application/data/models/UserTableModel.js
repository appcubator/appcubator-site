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

      this.set('fields', new FieldsCollection(bone.fields || []));
    },

    getFieldsColl: function() {
      var arr = _.union(this.get('fields').models, v1State.get('users').predefinedFields);
      return new Backbone.Collection(arr);
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
