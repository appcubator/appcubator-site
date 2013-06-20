define([
  'require',
  'collections/FieldsCollection',
  'backbone'
], function(require) {

  var FieldsCollection = require('collections/FieldsCollection');
  var Backbone         = require('backbone');

  var TableModel = Backbone.Model.extend({
      defaults: {
        fields: new FieldsCollection()
      },

      initialize: function(bone) {

        if(typeof bone === "string") {
          if(bone === "User") {
            alert('TableModel init isnt supposed to receive user');
            return;
          }
          bone = _.findWhere(appState.entities, {name : bone});
        }

        if(bone.name) {
          this.set('name', bone.name||"New Table");
        }

        else {
          alert('Table should have a name. Something is wrong.');
        }

        this.set('fields', new FieldsCollection());
        if(bone.fields) {
          this.get('fields').add(bone.fields);
        }
      },
      toJSON: function () {
        var json = {};
        json = _.clone(this.attributes);
        json.fields = this.get('fields').toJSON();
        return json;
      },

      getRelations: function() {
        var relations = [];
        this.get('fields').each(function(fieldModel) {
          var type = fieldModel.get('type');
          if(type == "o2o" || type == "fk" || type == "m2m") {
            fieldModel.set('owner_entity', this.get('name'));
            relations.push(fieldModel);
          }
        }, this);
        return relations;
      }
  });

  return TableModel;
});
