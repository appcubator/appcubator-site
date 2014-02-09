define(['backbone'], function(Backbone) {
    
    var GeneratorsModel = Backbone.Model.extend({

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

            generators = _.union(generators, v1State.get('plugins').getGeneratorsWithModule(generatorModule));

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

    	fork: function (generator, generatorPath, newName) {

    		var genObj = _.clone(generator);
    		var newPath = util.packageModuleName(generatorPath);
    		newPath.name = newName;
    		genObj.name = newName;

    		this.get(newPath.package)[newPath.module].push(genObj);

    		return [newPath.package, newPath.module, newPath.name].join('.');
    	}

    });

    return GeneratorsModel;
});