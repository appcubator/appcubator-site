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
      data.util = util;
      var newHTML = _.template(TableTemplates.relationalNL[type], data);
      this.$el.prepend(newHTML);
    },

    deleteRelation: function(e) {
      var self = this;
      var relationPane = e.target.parentElement;
      var cid = relationPane.id.replace('relation-','');
      var owner = relationPane.dataset.owner;
      var entity = relationPane.dataset.entity;
      console.log('owner: ' + owner);
      console.log('entity: ' + entity);
      // remove relation field from owner
      if(v1State.get('users').where({name: owner}).length > 0) {
        console.log(v1State.get('users').where({name: owner})[0]);
        v1State.get('users').where({name: owner})[0].get('fields').remove(cid);
      }
      else if(v1State.get('tables').where({name: owner}).length > 0) {
        v1State.get('tables').where({name: owner})[0].get('fields').remove(cid);
      }

      // refresh relation tags in related entity's view
      if(v1State.get('users').where({name: entity}).length > 0) {
        v1State.get('users').where({name: entity})[0].trigger('removeRelation');
      }
      else if(v1State.get('tables').where({name: entity}).length > 0) {
        v1State.get('tables').where({name: entity})[0].trigger('removeRelation');
      }

      // remove relation view
      $(relationPane).fadeOut('fast', function() {
        self.el.removeChild(this);
      });

    }
  });

  return RelationView;
});
