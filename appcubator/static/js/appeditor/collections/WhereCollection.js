define(["models/WhereModel", "backbone"],
function(WhereModel) {

  var WhereCollection = Backbone.Collection.extend({
    model: WhereModel,
    removeClauseWithName: function (keyStr) {
      this.each(function(clause) {
        if(clause.get('field_name') == keyStr) {
          this.remove(clause);
        }
      });
    }
  });

  return WhereCollection;
});
