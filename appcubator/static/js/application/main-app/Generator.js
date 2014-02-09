define(function(require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Generator = function(generatorPath) {
        var Vm = function() {

            this.runCode = function(code, globals) {
                var templates = globals.templates;
                var data = globals.data;
                var expand = globals.expand;
                return eval(code);
            };

        };

        var VM = new Vm();
        this.expander = expanderfactory(function(code, globals) {
            return VM.runCode(code, globals);
        });

        if(generatorPath) { return this.getGenerator(generatorPath); }
    };

    Generator.prototype.generate = function(generatorPath, data) {
        var aState = v1State.serialize();
        return this.expander.expand(aState.plugins, aState.generators, {generate: generatorPath, data: data});
    };

    Generator.prototype.getGenerator = function(generatorPath) {
        var aState = v1State.serialize();
        return this.expander.findGenData(aState.plugins, aState.generators, this.expander.parseGenID(generatorPath));
    };

    return Generator;

});
