define([
  'models/TableModel',
  'models/FieldModel',
  'collections/FormCollection',
  'collections/FieldsCollection',
  'backbone'
],
function(TableModel, FieldModel, FormCollection, FieldsCollection, Backbone) {

  var UserTableModel = TableModel.extend({

    initialize: function(bone) {

      if(typeof bone === "string") {
        bone = appState.users;
      }

      var fieldCollection = new FieldsCollection();
      if(bone) fieldCollection.add(bone.fields);

      fieldCollection.push({
                        name: "First Name",
                        required: true,
                        type: "text"
                    });

      fieldCollection.push({
                        name: "Last Name",
                        required: true,
                        type: "text"
                    });

      this.set('fields', fieldCollection);
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
