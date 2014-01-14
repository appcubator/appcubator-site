define(function(require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Generator = function() {

    };

    Generator.prototype.generate = function(generatorPath, data) {

        var Vm = function() {

            this.runCode = function(code, globals) {
                console.log(code);
                console.log(this);
                var templates = globals.templates;
                return eval(code);
                //.apply(globals,[]);
            };

        };

        var VM = new Vm();
        window.expander = expanderfactory.init(function(code, globals) {
            return VM.runCode(code, globals);
        });

        console.log(expander.expand(appState.generators, {generate: generatorPath, data: data}));
        return expander.expand(appState.generators, {generate: generatorPath, data: data});
    };

    return Generator;

});
