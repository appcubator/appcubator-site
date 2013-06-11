define([
  'mixins/SelectView'
],
function(SelectView) {

  var CreateRelationView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",
    className  : 'span58 pane relation-pane',

    events : {
      'click .create-relations-btn' : 'renderRelationsOptions',
      'click .done-relation'        : 'saveRelationShip'
    },

    initialize: function(){
      _.bindAll(this);
    },

    render: function() {
      this.el.innerHTML= '<div class="hi5 create-relations-btn"><span class="icon"></span>Create a Relation</div>';
      return this;
    },

    renderRelationsOptions: function() {
      this.el.innerHTML = '';
      var options = [];
      var entities = _.union(v1State.get('users').models, v1State.get('tables').models);

      _(entities).each(function(firstModel) {
        _(entities).each(function(secondModel) {
          obj = {};
          obj.name = "Relation between "+firstModel.get('name')+" and "+secondModel.get('name');
          obj.val = "relation-" + firstModel.cid+"-"+secondModel.cid;
          options.push(obj);
        });
      });

      var selectRelationsView = new SelectView(options, null, true);
      selectRelationsView.bind('change', this.relationSelected);
      this.el.appendChild(selectRelationsView.el);
      selectRelationsView.expand();
    },

    relationSelected: function(answer) {
      var cids = answer.val.replace('relation-','');
      var cid1 = cids.split('-')[0];
      var cid2 = cids.split('-')[1];
      var table1 = (v1State.get('users').get(cid1)||v1State.get('tables').get(cid1));
      var table2 = (v1State.get('users').get(cid2)||v1State.get('tables').get(cid2));

      this.table1 = table1;
      this.table2 = table2;

      var div = document.createElement('div');
      div.className = 'edit-relation-div';

      div.innerHTML  = _.template(TableTemplates.NewRelationTemplate, {table1: table1, table2: table2});
      div.innerHTML += _.template(TableTemplates.NewRelationTemplate, {table1: table2, table2: table1});
      div.innerHTML += '<div class="btn done-relation">Done</div>';

      this.el.innerHTML = '';
      this.el.appendChild(div);
    },

    saveRelationShip: function() {

      var type1 = iui.get('relation-type-'+this.table1.cid).value;
      var type2 = iui.get('relation-type-'+this.table2.cid).value;
      var fieldObj = {};

      if(type1 == "one" && type2 == "one") {
        fieldObj.name = iui.get('relation-name-' + this.table1.cid).value;
        fieldObj.type = "o2o",
        fieldObj.related_name = iui.get('relation-name-'+this.table2.cid).value;
        fieldObj.entity_name = this.table2.get('name');

        this.table1.get('fields').push(fieldObj);
      }

      if(type1 == "one" && type2 == "many") {
        fieldObj.name = iui.get('relation-name-' + this.table1.cid).value;
        fieldObj.type = "fk";
        fieldObj.related_name = iui.get('relation-name-' + this.table2.cid).value;
        fieldObj.entity_name = this.table2.get('name');

        this.table1.get('fields').push(fieldObj);
      }

      if(type1 == "many" && type2 == "one") {
        fieldObj.name = iui.get('relation-name-' + this.table2.cid).value;
        fieldObj.type = "fk";
        fieldObj.related_name = iui.get('relation-name-' + this.table1.cid).value;
         fieldObj.entity_name = this.table1.get('name');

        this.table2.get('fields').push(fieldObj);
      }

      if(type1 == "many" && type2 == "many") {
        fieldObj.name = iui.get('relation-name-' + this.table2.cid).value;
        fieldObj.type = "m2m";
        fieldObj.related_name = iui.get('relation-name-' + this.table1.cid).value;
        fieldObj.entity_name = this.table2.get('name');

        this.table1.get('fields').push(fieldObj);
      }

      this.render();
    }

  });

  return CreateRelationView;
});