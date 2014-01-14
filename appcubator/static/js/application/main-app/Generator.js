define(function(require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Generator = function() {

    };

    Generator.prototype.generate = function(generatorPath, data) {
        window.expander = expanderfactory.init(function(code, globals) {
            console.log(globals);
            return eval(code).apply(globals,[]);
        });
        console.log(expander.expand(appState.generators, {generate: generatorPath, data: data}));
        return expander.expand(appState.generators, {generate: generatorPath, data: data});
    };

    return Generator;

});
