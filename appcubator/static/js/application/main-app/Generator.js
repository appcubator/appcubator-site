define(function(require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Generator = function(pluginsGetter) {
        /* Pass either an object of the plugins to use, or pass a function which when called returns the plugins. */
        this.expander = initExpander();

        if (typeof(pluginsGetter) === 'function') {
            this._getPlugins = pluginsGetter;
        } else {
            this._getPlugins = function() { return pluginsGetter; };
        }
    };

    Generator.prototype.generate = function(generatorPath, data) {
        var plugins = this._getPlugins();
        return this.expander.expand(plugins, {generate: generatorPath, data: data});
    };

    Generator.prototype.getGenerator = function(generatorPath) {
        var plugins = this._getPlugins();
        return this.expander.findGenData(plugins, this.expander.parseGenID(generatorPath));
    };

    return Generator;

});
