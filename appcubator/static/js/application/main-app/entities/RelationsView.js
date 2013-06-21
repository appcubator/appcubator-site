define([
  'mixins/SelectView'
],
function(SelectView) {

  var RelationView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",
    className  : 'span58 relation-pane',

    events : {

    },

    initialize: function(){
      _.bindAll(this);

      this.userRelations = v1State.get('users').getAllRelations();
      this.tableRelations = v1State.get('tables').getAllRelations();
    },

    render: function() {

      var arrRelations = _.union(this.userRelations, this.tableRelations);
      _.each(arrRelations, function(relation) {
        var type = relation.get('type');
        this.el.innerHTML += _.template(TableTemplates.relationalNL[type], relation.toJSON());
      }, this);

      return this;
    },

    relationSelected: function(answer) {

    }

  });

  return RelationView;
});