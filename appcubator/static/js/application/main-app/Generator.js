define(function(require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Generator = function(generatorPath) {
        this.expander = initExpander();
        if(generatorPath) { return this.getGenerator(generatorPath); }
    };

    Generator.prototype.generate = function(generatorPath, data) {
        var aState = v1State.serialize();
        return this.expander.expand(aState.plugins, {generate: generatorPath, data: data});
    };

    Generator.prototype.getGenerator = function(generatorPath) {
        var aState = v1State.serialize();
        return this.expander.findGenData(aState.plugins, this.expander.parseGenID(generatorPath));
    };

    return Generator;

});
