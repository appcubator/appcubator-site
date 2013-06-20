define([
	'models/UserTableModel',
  'models/FieldModel',
  'collections/TableCollection'
], function(UserTableModel, FieldModel, TableCollection) {

  var UserRolesCollection = TableCollection.extend({
		model: UserTableModel,
    predefinedFields: [],

    initialize: function() {
      this.predefinedFields.push(new FieldModel({ name: "username"}));
      this.predefinedFields.push(new FieldModel({ name: "First Name"}));
      this.predefinedFields.push(new FieldModel({ name: "Last Name"}));
      this.predefinedFields.push(new FieldModel({ name: "Email"}));

    },

    getUserTableWithName: function(tableNameStr) {
      var table = this.where({name : tableNameStr })[0];
      return table;
    },

    getCommonProps: function() {
      var fields = [];
      if(this.length > 0) {
        fields = this.at(0).get('fields').models;
      }
      this.each(function(model) {
        fields = _.union(fields, model.get('fields').models);
      });


      fields = _.uniq(fields, function(obj) { return obj.attributes.name; });
      fields = _.union(fields, this.predefinedFields);
      return fields;
    }

	});

	return UserRolesCollection;
});
