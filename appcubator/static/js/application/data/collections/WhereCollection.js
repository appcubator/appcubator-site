define(["backbone"],
function() {

  var WhereCollection = Backbone.Collection.extend({

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
