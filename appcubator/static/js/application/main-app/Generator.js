define(function(require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Generator = function() {

    };

    Generator.prototype.generate = function(generatorPath, data) {

        console.log(generatorPath);

        if(!appState || !appState.generators) return;

        var generatorTree = appState.generators;
        generatorPath = generatorPath.split(".");

        try {
            for (var ii = 0 ; ii < generatorPath.length - 1; ii++) {
                generatorTree = generatorTree[generatorPath[ii]];
                if(generatorTree === null) return "";
            }

            var generator = null;

            for (var iii = 0; iii < generatorTree.length; iii++) {
                if(generatorTree[iii].name == generatorPath[ii]) {
                    generator = generatorTree[iii];
                }
            }

            if (!generator) return { html: ""};

        }
        catch(e) {
            return { html: "Generator could not be found."};
        }


        var compiledTemplates = {};

         _.each(generator.templates, function(val, key) {
            compiledTemplates[key] = function(data) {
                return _.template(val, data);
            };
        });

        var code = '(' + generator.code + ')';
        var genObj = eval(code).apply(this, [data, compiledTemplates]);
        //.apply(this, [data, generator.templates]);

        return genObj;
    };

    return Generator;

});
