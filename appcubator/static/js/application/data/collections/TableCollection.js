define([
  'models/TableModel'
],
function(TableModel) {

  var TableCollection = Backbone.Collection.extend({
    model: TableModel,

    getTableWithName: function(tableNameStr) {
      var table = this.where({name : tableNameStr })[0];
      return table;
    },

    getRelationsWithEntityName: function(tableNameStr) {
      var arrFields = [];
      this.each(function(table) {
        table.get('fields').each(function(fieldModel) {
          if(fieldModel.has('entity_name') && fieldModel.get('entity_name') == tableNameStr) {
            var obj = fieldModel.toJSON();
            obj.cid = fieldModel.cid;
            obj.entity = table.get('name');
            obj.entity_cid = table.cid;
            arrFields.push(obj);
          }
        });
      });

      return arrFields;
    },

    getAllRelations: function() {
      return this.reduce(function(memo, model) { return _.union(memo, model.getRelationalFields()); }, []);
    }
  });

  return TableCollection;
});
