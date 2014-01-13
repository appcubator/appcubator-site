define(function(require, exports, module) {

    'use strict';

    var Generator = function() {

    };

    Generator.prototype.generate = function(generatorPath, data) {

        if(!appState || !appState.generators) return;

        var generatorTree = appState.generators;
        generatorPath = generatorPath.split(".");

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

        if (!generator) return "";


        var code = '(' + generator.code + ')';
        var genObj = eval(code).apply(this, [data, generator.templates]);

        console.log("generated:");
        console.log(genObj);
        //.apply(this, [data, generator.templates]);

    };

    return Generator;

});
