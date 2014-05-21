/*
 * models.js
 * remote method library
 *
 * by Appcubator, all rights reserved
 *
 */


window.models = (function($, modelDefs){

    var remoteFnFactory = function(method, url) {
        var remoteFn = function() {
            // read more at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/arguments
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop(); // this would be the last argument

            $.ajax({
                url: url,
                method: method,
                data: JSON.stringify(args),
                contentType: 'application/json',
                success: function(res) {callback(res.error, res.data);}
            });
        };
        return remoteFn;
    };

    var models = {};

    /* initialize model object with an attribute for each model, for each model method. */
    for (var modelName in modelDefs) {
        var modelDef = modelDefs[modelName];
        models[modelName] = {};
        for (var staticmethodName in modelDef.functions) {
            var url = modelDef.functions[staticmethodName];
            /* url should be either '' or 'GET /someurl' format. */
            var remoteFn;
            if (url === '') {
                remoteFn = remoteFnFactory('POST', '/api/' + modelName + '/' + staticmethodName);
            } else {
                var toks = url.split(' '); // assert toks.length == 2
                remoteFn = remoteFnFactory(toks[0], toks.substr(1).join(' '));
            }
            models[modelName][staticmethodName] = remoteFn;
        }
    }

    return models;


})(jQuery, modelDefs);
