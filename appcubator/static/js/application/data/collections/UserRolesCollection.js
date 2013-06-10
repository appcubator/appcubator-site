define([
	'models/UserTableModel',
  'collections/TableCollection'
], function(UserTableModel, TableCollection) {

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

      return fields;
    }

	});

	return UserRolesCollection;
});
