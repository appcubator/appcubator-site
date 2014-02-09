define(['backbone'], function(Backbone) {
    
    var GeneratorsModel = Backbone.Model.extend({

    	forkPlugin: function() {

    	},

    	getGeneratorsWithModule: function (generatorModule) {

    		var generators = [];
    		
    		_.each(this.attributes, function(packageContent, packageName) {
    			_.each(packageContent[generatorModule], function(generator) {
    				generators.push({
    					package: packageName,
    					module: generatorModule,
    					name: generator.name
    				});
    			});
    		});

    		return generators;
    	},

        isNameUnique: function(packageModuleName) {
            var gensWrapper = v1.currentApp.model.get('generators');
            var isUnique = true;
            var gens = gensWrapper.local[packageModuleName.module];
            _.each(gens, function(gen) {
                if(gen.name == packageModuleName.name) isUnique = false;
            }, this);

            return isUnique;
        },

    	fork: function (generator, generatorName, newName) {

    		var genObj = _.clone(generator);
    		var newPath = util.packageModuleName(generator);
    		newPath.name = newName;
    		genObj.name = newName;

    		this.get(newPath.package)[newPath.module].push(genObj);

    		return newPath.join('.');
    	}

    });

    return GeneratorsModel;
});