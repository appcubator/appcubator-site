define([
  'mixins/SelectView'
],
function(SelectView) {

  var CreateRelationView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",
    id: 'new-relation',
    className  : 'span58 pane relation-pane',

    events : {
      'click .done-relation'        : 'createRelationship',
      'click .cancel-relation'       : 'reset'
    },

    initialize: function(){
      _.bindAll(this);
      this.listenTo(v1State.get('users'), 'add remove', this.renderRelationsOptions);
      this.listenTo(v1State.get('tables'), 'add remove', this.renderRelationsOptions);
    },

    render: function() {
      this.renderRelationsOptions();
      return this;
    },

    renderRelationsOptions: function() {
      this.el.innerHTML = '';
      var options = [];
      var entities = _.union(v1State.get('users').models, v1State.get('tables').models);
      var firstModel = null, secondModel = null;
      for(var i=0; i < entities.length; i++) {
        firstModel = entities[i]
        for(var j = i; j < entities.length; j++) {
          secondModel = entities[j];
          // for now, do not include relationships btwn same entity/user
          if(secondModel.get('name') !== firstModel.get('name')) {
            var obj = {};
            obj.name = "New " + firstModel.get('name') + "  \u2194  " + secondModel.get('name') + " relationship";
            obj.val = "relation-" + firstModel.cid+"-"+secondModel.cid;
            options.push(obj);
          }
        }
      }

      var selectRelationsView = new SelectView(options, null, true);
      this.listenTo( selectRelationsView, 'change', this.relationSelected);
      this.el.appendChild(selectRelationsView.el);
      selectRelationsView.expand();
    },

    relationSelected: function(answer) {
      var cids = answer.replace('relation-','').split('-');
      var cid1 = cids[0];
      var cid2 = cids[1];
      var table1 = (v1State.get('users').get(cid1)||v1State.get('tables').get(cid1));
      var table2 = (v1State.get('users').get(cid2)||v1State.get('tables').get(cid2));

      this.table1 = table1;
      this.table2 = table2;

      var div = document.createElement('div');
      div.className = 'edit-relation-div';

      div.innerHTML  = _.template(TableTemplates.NewRelationTemplate, {table1: table1, table2: table2, util: util, selected: 'many'});
      div.innerHTML += _.template(TableTemplates.NewRelationTemplate, {table1: table2, table2: table1, selected: 'one'});
      div.innerHTML += '<div class="btn btn-info done-relation">Done</div><div class="btn offset1 cancel-relation">Cancel</div>';

      this.el.innerHTML = '';
      this.el.appendChild(div);
    },

    createRelationship: function() {
      var fieldObj = {}, newRelation = null;
      var type1 = util.get('relation-type-'+this.table1.cid).value;
      var type2 = util.get('relation-type-'+this.table2.cid).value;
      var name1 = util.get('relation-name-'+this.table1.cid).value;
      var name2 = util.get('relation-name-'+this.table2.cid).value;

      // names must be valid
      if(!name1 || !name2) {
        return false;
      }

      if(type1 == "one" && type2 == "one") {
        fieldObj.name = name1;
        fieldObj.type = "o2o",
        fieldObj.related_name = name2;
        fieldObj.owner_entity = this.table1.get('name');
        fieldObj.entity_name = this.table2.get('name');

        newRelation = this.table1.get('fields').push(fieldObj);
        this.table2.trigger('newRelation', newRelation);
      }

      if(type1 == "one" && type2 == "many") {
        fieldObj.name = name1;
        fieldObj.type = "fk";
        fieldObj.related_name = name2;
        fieldObj.owner_entity = this.table1.get('name');
        fieldObj.entity_name = this.table2.get('name');

        newRelation = this.table1.get('fields').push(fieldObj);
        this.table2.trigger('newRelation', newRelation);
      }

      if(type1 == "many" && type2 == "one") {
        fieldObj.name = name2;
        fieldObj.type = "fk";
        fieldObj.related_name = name1;
        fieldObj.owner_entity = this.table2.get('name');
        fieldObj.entity_name = this.table1.get('name');

        newRelation = this.table2.get('fields').push(fieldObj);
        this.table1.trigger('newRelation', newRelation);
      }

      if(type1 == "many" && type2 == "many") {
        fieldObj.name = name2;
        fieldObj.type = "m2m";
        fieldObj.related_name = name1;
        fieldObj.owner_entity = this.table1.get('name');
        fieldObj.entity_name = this.table2.get('name');

        newRelation = this.table1.get('fields').push(fieldObj);
        this.table2.trigger('newRelation', newRelation);
      }

      this.reset();
    },

    reset: function(e) {
      var self = this;
      this.$el.fadeOut('fast', function() {
        self.renderRelationsOptions();
      });
    }

  });

  return CreateRelationView;
});
