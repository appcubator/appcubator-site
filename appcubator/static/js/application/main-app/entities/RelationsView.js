define([
  'app/entities/RelationView',
  'mixins/SelectView'
],
function(RelationView, SelectView) {

  var RelationsView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",
    className  : 'span58 hoff1 relation-pane',

    initialize: function(){
      _.bindAll(this);

      this.userRelations = v1State.get('users').getAllRelations();
      this.tableRelations = v1State.get('tables').getAllRelations();

      this.listenTo(v1State.get('users'), 'newRelation', this.addRelation);
      this.listenTo(v1State.get('tables'), 'newRelation', this.addRelation);
    },

    render: function() {
      var arrRelations = _.union(this.userRelations, this.tableRelations);
      _.each(arrRelations, function(relationModel) {
        this.el.appendChild(new RelationView(relationModel).render().el);
      }, this);
      return this;
    },

    addRelation: function(relationModel) {
      this.el.appendChild(new RelationView(relationModel).render().el);
    },

    showRemoveIcon: function(e) {
      $(e.currentTarget).find('.remove-relation').show();
    },

    hideRemoveIcon: function(e) {
      $(e.currentTarget).find('.remove-relation').hide();
    }
  });

  return RelationsView;
});
