define([
  'mixins/SelectView'
],
function(SelectView) {

  var RelationsView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",
    className  : 'span28 offsetr1 hoff1 relation-pane',

    events : {
      'click .remove-relation': 'deleteRelation',
      'mouseover .relation'   : 'showRemoveIcon',
      'mouseout .relation'    : 'hideRemoveIcon'
    },

    initialize: function(relationModel){
      _.bindAll(this);

      this.model = relationModel;
      this.listenTo(this.model, 'remove', this.remove);
    },

    render: function() {
      var type = this.model.get('type');
      data = this.model.toJSON();
      data.cid = this.model.cid;
      data.util = util;

      var newHTML = _.template(TableTemplates.relationalNL[type], data);
      this.$el.prepend(newHTML);

      return this;
    },

    deleteRelation: function(e) {
      this.model.collection.remove(this.model);
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
