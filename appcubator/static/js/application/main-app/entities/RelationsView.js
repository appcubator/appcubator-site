define([
  'mixins/SelectView'
],
function(SelectView) {

  var RelationView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",
    className  : 'span58 hoff1 relation-pane',

    events : {
      'click .remove-relation': 'deleteRelation'
    },

    initialize: function(){
      _.bindAll(this);

      this.userRelations = v1State.get('users').getAllRelations();
      this.tableRelations = v1State.get('tables').getAllRelations();

      this.listenTo(v1State.get('users'), 'newRelation', this.addRelation);
      this.listenTo(v1State.get('tables'), 'newRelation', this.addRelation);
    },

    render: function() {
      var arrRelations = _.union(this.userRelations, this.tableRelations);
      _.each(arrRelations, this.addRelation, this);
      return this;
    },

    addRelation: function(relation) {
      var type = relation.get('type');
      data = relation.toJSON();
      data.cid = relation.cid;
      console.log(data);
      var newHTML = _.template(TableTemplates.relationalNL[type], data);
      this.$el.prepend(newHTML);
    },

    deleteRelation: function(e) {
      var self = this;
      var relationPane = e.target.parentElement;
      var cid = relationPane.id.replace('relation-','');
      if(v1State.get('users').get(cid)) {
        v1State.get('users').remove(v1State.get('users').get(cid));
      }
      else if(v1State.get('tables').get(cid)) {
        v1State.get('tables').remove(v1State.get('tables').get(cid));
      }

      $(relationPane).fadeOut('fast', function() {
        self.el.removeChild(this);
      })

    }
  });

  return RelationView;
});
