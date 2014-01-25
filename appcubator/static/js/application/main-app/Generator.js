define(function(require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Generator = function() {
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

    };

    Generator.prototype.generate = function(generatorPath, data) {

        return this.expander.expand(appState.generators, {generate: generatorPath, data: data});
    };

    Generator.prototype.getGenerator = function(generatorPath) {

        return this.expander.findGenData(v1.currentApp.model.serialize().generators, this.expander.parseGenID(generatorPath));

    };

    return Generator;

});
