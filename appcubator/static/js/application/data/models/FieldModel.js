define(['backbone'], function() {

  var FieldModel = Backbone.Model.extend({
    defaults :{
      "required" : false,
      "type"     : "text"
    },

    getNLType: function() {
      var type = this.get('type');

      if(type == "o2o" || type == "fk") {
        return this.get('entity_name');
      }
      if(type == "m2m") {
        return "List of " + this.get('entity_name');
      }

      var nlType = this.nlTable[type];

      return nlType;
    },

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

    nlTable: {
      "text"   : 'Text',
      "number" : 'Number',
      "email"  : 'Email',
      "image"  : 'Image',
      "date"   : 'Date',
      "file"   : 'File'
    }
  });

  return FieldModel;

});