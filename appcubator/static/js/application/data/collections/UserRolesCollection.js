define([
	'models/UserTableModel',
  'models/FieldModel',
  'collections/TableCollection'
], function(UserTableModel, FieldModel, TableCollection) {

  var UserRolesCollection = TableCollection.extend({
		model: UserTableModel,

    getUserTableWithName: function(tableNameStr) {
      var table = this.where({name : tableNameStr })[0];
      return table;
    },

    getCommonProps: function() {
      var fields = this.models[0].get('fields').models;
      this.each(function(model) {
        fields = _.union(fields, model.get('fields').models);
      });
      fields = _.uniq(fields, function(obj) { return obj.attributes.name; });
      fields = _.union(fields, [
                                 new FieldModel({ name: "Username"}),
                                 new FieldModel({ name: "First Name"}),
                                 new FieldModel({ name: "Last Name"}),
                                 new FieldModel({ name: "Email"})
                               ]);
      return fields;
    }

	});

	return UserRolesCollection;
});
