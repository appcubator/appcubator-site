define([
  'collections/WhereCollection',
  'app/Generator',
  'backbone',
], function(WhereCollection, Generator) {

  var TableCodeModel = Backbone.Model.extend({
  	/* Note that this may have name/code or it may be a generator */

    initialize: function(bone, entityModel) {
      if ('generate' in this){
      	// XXX note the backbone generate hack
      	this.data = bone; // IDK how to make backbone work with generators.
      } else {
        this.set('code', bone.code||"");
        this.set('name', bone.name||"default");
      }
      _.bindAll(this);

    },

    isGenerator: function(){
    	return this.generate !== undefined;
    },

    getGenerated: function(){
    	// TODO stop making objects of Generator every time
    	if (this.isGenerator()) {
	    	return new Generator().generate(this.generate, this.data);
    	} else {
    		return this.serialize();
    	}
    },

    getCode: function(){
    	if (this.isGenerator()) {
	    	return new Generator().generate(this.generate, this.data).code;
    	} else {
    		return this.get('code');
    	}
    },

  });

  return TableCodeModel;
});