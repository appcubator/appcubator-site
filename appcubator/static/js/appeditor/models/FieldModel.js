define(['backbone'], function() {

    var FieldModel = Backbone.Model.extend({
        defaults: {
            "name": "Property Name",
            "type": "String"
        },

        // return a string version of the relationship
        getNLType: function() {
            var type = this.get('type');

            if (type == "o2o" || type == "fk") {
                return "Has one " + this.get('entity_name');
            }
            if (type == "m2m") {
                return "List of " + this.get('entity_name');
            }

            var nlType = this.nlTable[type];

            return nlType;
        },

        isRelatedField: function() {
            var type = this.get('type');
            return (type == "o2o" || type == "fk" || type == "m2m");
        },

        // return the relationship type
        getNL: function() {
            var type = this.get('type');

            // if(type == "o2o"){
            //   return
            // } || type == "fk") {
            //   return this.get('entity_name');
            // }
            // if(type == "m2m") {
            //   return "List of " + this.get('entity_name');
            // }

            // var nlType = this.nlTable[type];

            // return nlType;
        },

        // since o2m relationships are stored in the other entity as an fk,
        // find entities which relate to this model with an fk
        getOneToManyRelationships: function() {
            var self = this;
            var otherEntities = Array.prototype.concat.apply(v1State.get('tables').models, v1State.get('users').models);
            otherEntities = _.without(otherEntities, this);
            return _.filter(otherEntities, function(entity) {
                return (entity.get('type') === 'fk' && entity.get('entity_name') == self.get('name'));
            });
        },

        validate: function() {
            var valid = true;
            var name = this.get('name');
            if (!util.isAlphaNumeric(name) || util.doesStartWithKeywords(name)) {
                return false;
            }
        },

        nlTable: {
            "text": 'Text',
            "number": 'Number',
            "email": 'Email',
            "image": 'Image',
            "date": 'Date',
            "file": 'File'
        }

    });

    return FieldModel;

});