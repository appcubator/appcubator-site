define(function(require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Generator = function(pluginsGetter) {
        /* Pass either an object of the plugins to use, or pass a function which when called returns the plugins. */
        this.expander = initExpander();
        var expander = this.expander;

        if (typeof(pluginsGetter) === 'function') {
            this._getPlugins = pluginsGetter;
        } else {
            this._getPlugins = function() { return pluginsGetter; };
        }

        var self = this;

        this.expander.expandOnce = function (generators, genData) {

            var obj = {};
            try {
                var genID = this.parseGenID(genData.generate);
                var generatedObj = expander.constructGen(expander.findGenData(generators, genID))(generators, genData.data);
                obj = generatedObj;
            }
            catch(e) {
                console.log('Error in call to expandOnce for '+JSON.stringify(genID, null, 3)+':');
                console.log(e);
                throw e;
            }

            if(obj.html && genData.data && genData.data.cid) {

                var div = document.createElement('div');
                div.innerHTML = obj.html;
                var elements = div.childNodes;
                var element = div;

                if(elements.length == 1) {
                    element = elements[0];
                }

                element.dataset.cid = genData.data.cid;
                element.setAttribute('data-cid', genData.data.cid);
                obj.html = div.innerHTML;
            }

            return obj;
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
