(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* See bottom of file for module usage.
 * This code is browserified and shared between frontend and backend.
 */

var _ = require("underscore"),
    builtinGenerators = require("../generators/generators");

exports.factory = function(_safe_eval_) {

    var expander = {};

    function findGenDataSub(generators, genID) {
        // generators is some object of generators to search through
        // genID is an obj w (package, module, name, version) keys
        // Search order: generators, then builtinGenerators

        var packageObj = generators[genID.package];
        if (packageObj === undefined) {
            throw { name: 'GenNotFound', message: "Package " + genID.package + " not found", level: 'package' };
        }

        var module = packageObj[genID.module];
        if (module === undefined)
            throw { name: 'GenNotFound', message: "Module " + genID.module + " not found in package " + genID.package, level: 'module' };

        // linear search through the generators in the module.
        var generator;
        for (var i = 0; i < module.length; i ++){
            var generator2 = module[i];
            if ((generator2.name == genID.name) && (generator2.version == genID.version)) {
                generator = generator2;
                break;
            }
        }

        if (generator === undefined)
            throw { name: 'GenNotFound', message: "Generator '"+genID.name+"' with version '"+genID.version+"' not found in module '"+genID.module+"'", level: 'generator'  };

        return generator;
    }

    function findGenData(generators, genID) {
        // generators is app.plugins
        var generator;

        try {
            generator = findGenDataSub(generators, genID);
        } catch (e) {
            if (e.name === 'GenNotFound') {
                generator = findGenDataSub(builtinGenerators, genID);
            } else {
                throw e;
            }
        }

        return generator;
    }

    expander.findGenData = findGenData;
    expander.builtinGenerators = builtinGenerators;

    function constructGen(generatorData) {
        // input the generator's data from the json
        // output a function which can directly be used for generator execution.
        var fn = function(generators, data) {
            var templates = generatorData.templates;
            var compiledTemplates = {};

            _.each(templates, function(templateStr, index) {
                compiledTemplates[index] = _.template(templateStr);
            });

            if(generatorData.defaults) {
                data = _.defaults(data, generatorData.defaults);
            }

            // TODO compile each EJS template so that it can have a render method.
            var expandFn = function(data) { return expand(generators, data); };
            var globals = {
                data: data,
                templates: compiledTemplates,
                expand: expandFn,
                _: _,
                console: console // debug
            };
            var code = '(' + generatorData.code + ')(data, templates);';

            genObj = _safe_eval_(code, globals);

            return genObj;
        };
        return fn;
    }

    expander.constructGen = constructGen;

    function parseGenID(generatorName) {
        var tokens = generatorName.split('.');
        var module, package, name, version;
        // TODO care about version nums. for now everything is 0.1.

        version = "0.1";

        if (tokens.length == 2) {
            package = 'root';
            module = tokens[0];
            name = tokens[1];
        } else if (tokens.length == 3) {
            package = tokens[0];
            module = tokens[1];
            name = tokens[2];
        } else {
            throw { name: 'GenPathSyntax', message: "Invalid generator reference syntax. Must provide '[package.]module.name' .  Original: " + generatorName };
        }


        return { package: package, module: module, name: name, version: version };
    }

    expander.parseGenID = parseGenID;

    function expandOnce(generators, genData) {
        try {
            var genID = parseGenID(genData.generate);
            var generatedObj = constructGen(findGenData(generators, genID))(generators, genData.data);
            return generatedObj;
        }
        catch(e) {
            console.log('Error in call to expandOnce for '+JSON.stringify(genID, null, 3)+':');
            console.log(e);
            throw e;
        }
    }

    expander.expandOnce = expandOnce;

    function expand(generators, genData) {
        // TODO check for cycles
        while (typeof(genData) == typeof({}) && 'generate' in genData) {
            genData = expander.expandOnce(generators, genData);
        }
        return genData;
    }

    expander.expand = expand;

    expander.expandAll = function(app) {
        app.plugins = app.plugins || {}; // TEMP BECAUSE THIS DOES NOT YET EXIST.

        _.each(app.routes, function(route, i) {
            app.routes[i] = expand(app.plugins, route);
        });

        _.each(app.models, function(model, index) {
            app.models[index] = expand(app.plugins, model);
        });

        _.each(app.templates, function (template, index) {
            app.templates[index] = expand(app.plugins, template);
        });

        app.templates.push({name: "header", code: app.header||""});
        app.templates.push({name: "scripts", code: app.scripts||""});

        app.config = expand(app.plugins, app.config);
        app.css = expand(app.plugins, app.css);

        return app;
    };


    return expander;

};

try {
    var x = window;
    // No error -> we're in the frontend
    window.expanderfactory = exports.factory;
    window.initExpander = function() {
        /* hacky way to run code in the frontend that should not be used to run untrusted code */
        var runCode = function(code, globals) {
            var templates = globals.templates;
            var data = globals.data;
            var expand = globals.expand;
            return eval(code);
        };
        var expander = exports.factory(runCode);
        return expander;
    };
} catch (e) {
    // e is a ReferenceError, which implies we're in the backend
    exports.init = function() {
        // avoid browserifying vm
        var r = require;
        return exports.factory(r('vm').runInNewContext);
    };
}

},{"../generators/generators":5,"underscore":13}],2:[function(require,module,exports){
exports.uielements = require('./uielements.js').generators;
exports.model_methods = require('./model_methods.js').generators;
exports.metadata = {
    name: 'crud',
    displayName: 'Forms and Views',
    description: 'Basic database stuff'
};

},{"./model_methods.js":3,"./uielements.js":4}],3:[function(require,module,exports){
var generators = [];

generators.push({
    name: 'create',
    version: '0.1',
    defaults: {
      enableAPI: true
    },
    code: function(data, templates){
        var method = { name: 'create'+data.modelName,
                       code: templates.code() };
        if (data.enableAPI) method.enableAPI = true;
        return method;
    },
    templates: {'code':"function (data, callback) {\n"+
                       "    // Calls the mongoose create method of this model. Add validation logic here.\n"+
                       "    return this.create(data, callback);\n" +
                       "}"}
});

generators.push({
    name: 'find',
    version: '0.1',
    defaults: {
      enableAPI: true
    },
    code: function(data, templates){
        var method = { name: 'find'+data.modelName,
                       code: templates.code() };
        if (data.enableAPI) method.enableAPI = true;
        return method;
    },
    templates: {'code':"function (conditions, callback) {\n"+
                       "    // Calls the mongoose find method of this model. Add validation logic here.\n"+
                       "    return this.find(conditions, callback);\n" +
                       "}"}
});

generators.push({
    name: 'update',
    version: '0.1',
    defaults: {
      enableAPI: true
    },
    code: function(data, templates){
        var method = { name: 'update'+data.modelName,
                       code: templates.code() };
        if (data.enableAPI) method.enableAPI = true;
        return method;
    },
    templates: {'code':"function (conditions, update, callback) {\n"+
                       "    // Calls the mongoose find method of this model. Add validation logic here.\n"+
                       "    return this.findOneAndUpdate(conditions, update, callback);\n" +
                       "}"}
});

exports.generators = generators;

},{}],4:[function(require,module,exports){
var generators = [];

generators.push({
    name: 'create',
    version: '0.1',
    defaults: {
        className: "",
        style: "",
        fields: [],
        redirect: "/",
        id: Math.floor(Math.random() * 11),
        modelName: "DefaultTable"
    },
    code: function(data, templates) {
        /* Example (subject to change)
        {
            generate: "crud.uielements.create",
            data: { fields: [{ generate: 'uielements.form-field',
                               data: {displayType:'single-line-text',
                                      field_name:'name',
                                      placeholder: 'Name'}
                             },{generate: 'uielements.form-field',
                                data:{ displayType:'single-line-text',
                                       field_name: 'url',
                                       placeholder: 'URL'}}],
                    id: 'testform',
                    redirect: '/?success=true' }
          */
        data.formFields = _.map(data.fields, expand).join('\n');
        var uie = {
            html: templates.html(data),
            js: templates.js(data),
            css: ''
        };
        return uie;
    },
    templates: {

        "html": "<form id=\"<%= id %>\" class=\"<%= className %>\" style=\"<%= style %>\">\n" +
            "<%= formFields %>" +
            "<input type=\"submit\" value=\"Submit\"><br>\n" +
            "</form>",

            "js": "$.fn.serializeObject = function()\n" +
                "{ var o = {}; \n" +
                   "var a = this.serializeArray(); \n" +
                   "$.each(a, function() { \n" +
                      " if (o[this.name]) { \n" +
                           "if (!o[this.name].push) { \n" +
                               "o[this.name] = [o[this.name]]; \n" +
                           "} \n" +
                           "o[this.name].push(this.value || ''); \n" +
                       "} else { \n" +
                           "o[this.name] = this.value || ''; \n" +
                       "} \n" +
                   "}) \n;" +
                   "return o; \n" +
                "}; \n" +
            " $('#<%= id %>').submit(function(e){\n" +
            "    e.preventDefault(); \n" +
            "    var formdata = {};\n" +
            "    formdata = $( this ).serializeObject(); console.log(formdata);" +
            "    models.<%= modelName %>.create<%= modelName %>(formdata, function(err, data){\n" +
            "        console.log(data);\n" +
            "        if (err) {\n" +
            "            // Do whatever you want with user errors\n" +
            "            alert(err);\n" +
            "        }\n" +
            "        else {\n" +
            "            // You can redirect on success\n" +
            "            location.href = '<%= redirect %>';\n" +
            "        }\n" +
            "    });\n" +
            "    return false;\n" +
            "});\n",
    }
});

generators.push(
    {
        "templates": {
            "4-8": "<div class=\"row\">\n    <div class=\"container\">\n        <div class=\"text-center ycol\"><%= colheader %></div>\n        <div class=\"col-md-4 ycol\"><%= col0 %></div>\n        <div class=\"col-md-8 ycol\"><%= col1 %></div>\n    </div>\n</div>",
            "html": "<div id=\"<%= modelName %>-list-<%= id %>\">\n</div>",
            "row_html": "<div class=\"row\">\n    <div class=\"container\">\n        <%= row_content_str %>\n    </div>\n</div>",
            "js": "models.<%= modelName %>.find<%= modelName %>({ }, function(err, data){\n    \n    var $list = $('#<%= modelName %>-list-<%= id %>');\n    var template = '<%= rowTemplate %>';\n    \n    \n    _.each(data, function(d) {\n        $list.append(_.template(template, {obj:d}));\n  <%= afterRenderJS %> \n  });\n    \n    if(!data || data.length == 0) {\n        $list.append('No results listed');\n    }\n});"
        },
        "code": function(data, templates) {
            if(!data.id || data.id == -1) {
                data.id = Math.floor(Math.random()*11);
            }

            var rowEls = _.map(data.row.columns, function(column) {
                return expand(column);
            });

            function renderRowStr () {
                var rowStr = rowEls.map(function(rowEl){ return rowEl.html; }).join('\n');
                return rowStr;
            }

            function renderRowJs () {
                var rowStr = rowEls.map(function(rowEl){ return rowEl.js; }).join('\n');
                return rowStr;
            }

            data.row_content_str = renderRowStr().split('\n').join('');
            data.row_content_str = data.row_content_str.replace(/<%/g, "<' + '%");
            data.rowTemplate = templates.row_html(data).split('\n').join('');
            data.afterRenderJS = renderRowJs();

            return {
                'html': templates.html(data),
                'js': templates.js(data),
                'css': ''    
            }
        },
        "name": "list",
        "version": "0.1",
        "defaults": {
            "className": "",
            "style": "",
            "modelName": "DefaultTable",
            "id": -1,
            "row": {
                "rowHeight": "auto",
                "columns": [{
                    "data": {
                        "uielements": [{
                            "data": {
                                "className": "btn",
                                "style": "",
                                "layout": {
                                    "alignment": "left",
                                    "row": 1
                                },
                                "content": "Left Col >",
                                "href": "http://TOOLOBAPAGE.html",
                                "type": "button"
                            },
                            "generate": "uielements.design-button"
                        }],
                        "layout": "4",
                        "elements": "<a href=\"http://TOOLOBAPAGE.html\" class=\"btn btn\" style=\"\">Left Col ></a>"
                    },
                    "generate": "templates.layoutColumn"
                }, {
                    "data": {
                        "uielements": [{
                            "data": {
                                "className": "btn",
                                "style": "",
                                "layout": {
                                    "alignment": "left",
                                    "row": 1
                                },
                                "content": "Right Col >",
                                "href": "http://TOOLOBAPAGE.html",
                                "type": "button"
                            },
                            "generate": "uielements.design-button"
                        }],
                        "layout": "8",
                        "elements": "<a href=\"http://TOOLOBAPAGE.html\" class=\"btn btn\" style=\"\">Right Col ></a>"
                    },
                    "generate": "templates.layoutColumn"
                }]
            }
        }
    }
);


exports.generators = generators;
},{}],5:[function(require,module,exports){
exports.root = require('./root/generators');
exports.crud = require('./crud/generators');
exports.userauth = require('./userauth/generators');

// turn code from function to string
var stringalize = function(plugin) {
    for (var m in plugin) {
        if (m === 'metadata') continue;
        for (var i = 0; i < plugin[m].length; i++) {
            plugin[m][i].code = plugin[m][i].code.toString();
        }
    }
};

stringalize(exports.root);
stringalize(exports.crud);
stringalize(exports.userauth);

},{"./crud/generators":2,"./root/generators":7,"./userauth/generators":12}],6:[function(require,module,exports){
var generators = [];

generators.push({
    name: 'config',
    version: '0.1',
    code: function(data, templates) {
        return templates.main({customConfig: _.map(data.customCodeChunks, expand).join("\n")});
    },
    templates: {
        'main': "#!/usr/bin/env node\n\
var express = require('express')\n\
  , http = require('http')\n\
  , path = require('path');\n\
\n\
\n\
var app = express();\n\
\n\
//CORS middleware\n\
var allowCrossDomain = function(req, res, next) {\n\
    res.header('Access-Control-Allow-Origin', '*');\n\
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');\n\
    res.header('Access-Control-Allow-Headers', 'accept, x-requested-with, content-type');\n\
\n\
    next();\n\
}\n\
\n\
\n\
app.configure(function(){\n\
  app.set('port', (process.argv.length >= 3) ? parseInt(process.argv[2]) : (process.env.PORT || 3000));\n\
  app.set('views', __dirname + '/views');\n\
  app.set('view engine', 'ejs');\n\
  app.use(express.logger('dev'));\n\
  // TODO decide on an official path for the favicon\n\
  // app.use(express.favicon());\n\
  app.use(express.bodyParser());\n\
  app.use(express.cookieParser('some secret'));\n\
  app.use(express.cookieSession());\n\
  app.use(allowCrossDomain);\n\
  // app.use(express.csrf());\n\
  app.use('/static', express.static(path.join(__dirname, 'static')));\n\
});\n\
\n\
app.configure('development', function(){\n\
  app.use(express.errorHandler());\n\
});\n\
\n\
var mongoose = require('mongoose');\n\
mongoose.connect(process.env.MONGO_ADDR);\n\
<%= customConfig %>\n\
\n\
var routes = require('./routes');\n\
routes.bindTo(app);\n\
\n\
app.listen(app.get('port'));\n"
    }
});


exports.generators = generators;

},{}],7:[function(require,module,exports){
exports.routes = require('./routes.js').generators;
exports.templates = require('./templates.js').generators;
exports.uielements = require('./uielements.js').generators;
exports.models = require('./models.js').generators;
exports.app = require('./app.js').generators;
exports.metadata = {
    name: 'root',
    description: 'stuff thats just chilling',
    displayName: 'Simple Elements'
};

},{"./app.js":6,"./models.js":8,"./routes.js":9,"./templates.js":10,"./uielements.js":11}],8:[function(require,module,exports){
var generators = [];

generators.push({
    name: 'model',
    version: '0.1',
    code: function(data, templates) {
        // generate the initial mongoose Schema from fields.
        data.schemaCode = templates.schema({fields: data.fields});

        for (index in data.functions) {
            var sm = data.functions[index];
            data.functions[index] = expand(sm);
        }

        // generate the main model code.
        data.code = templates.main(data);

        // we return the original data along with data.code because the data is used to autogenerate an API
        return data;
    },
    templates: {
        schema: "new Schema({\n\
<% for (var i = 0; i < fields.length; i ++) { %>\n\
    <%= fields[i].name %>: <%= fields[i].type %>,\
<% } %>\n\
})",
        main: "var mongoose = require('mongoose');\n\
\n\
var Schema = mongoose.Schema;\n\
\n\
\n\
var <%= name %>Schema = <%= schemaCode %>;\n\
\n\
<% for(var index in functions) { %>\n\
<% var sm = functions[index]; %>\n\
    <% if (sm.instancemethod) { %>\
<%= name %>Schema.methods.<%= sm.name %> = <%= sm.code %>;\n\
    <% } else if (sm.schemaMod) { %>\
(<%= sm.code %>)(<%= name %>Schema);\n\
    <% } else { %>\
<%= name %>Schema.statics.<%= sm.name %> = <%= sm.code %>;\n\
    <% } %>\
<% } %>\n\
\n\
exports.<%= name %> = mongoose.model('<%= name %>', <%= name %>Schema);\n"
    }
});

exports.generators = generators;

},{}],9:[function(require,module,exports){
var generators = [];

generators.push({
    name: 'staticpage',
    version: '0.1',
    code: function(data, templates){
        /* Data should be an object with keys:
        *   name : string, url : array */
        var route = {
            "method": "GET",
            "pattern": '/' + data.url.join('/'),
            "code": templates.code({ name: data.name })
        };
        return route;
    },
    templates: {'code':"function (req, res) {"+"\n"+
                       "    res.render('<%= name %>');"+"\n"+
                       "}"}
});

generators.push({
    name: 'apiroute',
    version: '0.1',
    code: function(data, templates){
        // TODO allow custom url and method.
        var url = '/api/' + data.modelName + '/' + data.methodName;
        var route = {
            "method": "POST",
            "pattern": url,
            "code": templates.code(data)
        };
        return route;
    },
    templates: {'code': "function (req, res) {"+"\n"+
                "    var <%= modelName %> = require('./models/<%= modelName %>').<%= modelName %>;"+"\n"+
                "    var whenDone = function(e, d) { res.send({error:e, data:d}); };"+"\n"+
                "    var args = req.body;"+"\n"+
                "    args.push(whenDone);"+"\n"+
                "    args.push(req);"+"\n"+
                "    args.push(res);"+"\n"+
                "    <%= modelName %>.<%= methodName %>.apply(<%= modelName %>, args);"+"\n"+
                "}"}
});

exports.generators = generators;

},{}],10:[function(require,module,exports){
var generators = [];

generators.push({
    name: 'page',
    version: '0.1',
    code: function(data, templates) {
        // The below could be concatUIE template
        // name, head, body
        var expandedUIElements = expand(data.uielements);
        data.uielements_html = expandedUIElements.html;
        data.uielements_js = expandedUIElements.js;
        data.uielements_css = expandedUIElements.css;

        data.navbar = expand(data.navbar);
        data.footer = expand(data.footer);
        data._inclString = '<% include modeldefs %>'; // this include statement needs to be inserted into the generated code but it was causing problems inside the template and idk how to escape it in EJS.
        data._header_include = '<% include header %>';
        data._scripts_include = '<% include scripts %>';

        return {
            name: data.name,
            code: templates.code(data)
        };
    },
    defaults: {
        'title': ''
    },
    templates: {
        'code': [
            '<html>',
            '<head>',
            '<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">',
            '<meta charset=\"utf-8\">',
            '<!-- autogenerated css-->',
            '<link rel=\"stylesheet\" type=\"text/css\" href=\"/static/style.css\"></script>',
            '<script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js\"></script>',
            '<!-- begin autogenerated api client library -->',
            '<script type=\"text/javascript\"><%= _inclString %></script>',
            '<script src=\"/static/models.js\"></script>',
            '<!-- end autogenerated api client library -->',
            '<title><%= title %></title>',
            '<%= _header_include %>',
            '<%= head %>\n',
            '<style>',
            '<%= uielements_css %>',
            '</style>',
            '</head>',
            '<body>',
            '<!-- BEGIN NAVBAR-->',
            '<%= navbar %>',
            '<!-- END NAVBAR-->',
            '<!-- BEGIN UIELEMENTS -->',
            '<%= uielements_html %>\n',
            '<!-- END UIELEMENTS -->\n',
            '<!-- BEGIN FOOTER-->\n',
            '<%= footer %>',
            '<!-- END FOOTER-->',
            '<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js"></script>\n',
            '<%= _scripts_include %>',
            '<script>',
            '<%= uielements_js %>',
            '</script>',
            ' </body>\n',
            '</html>'
        ].join('\n')
    }
});

generators.push({
    name: 'header',
    version: '0.1',
    code: function(data, templates) {
        // The below could be concatUIE template
        // name, head, body
        return {
            name: "header",
            code: data
        };
    },
    templates: {}
});

generators.push({
    name: 'scripts',
    version: '0.1',
    code: function(data, templates) {
        // The below could be concatUIE template
        // name, head, body
        return {
            name: "scripts",
            code: data
        };
    },
    templates: {}
});


generators.push({
    name: 'concatUIE',
    version: '0.1',
    code: function(data, templates) {
        // CSS at the top, then HTML elements, then the corresponding Javascript at the bottom.
        // TODO add some marks/tags to make it easier to find code for debugging.
        var templateLines = [];
        var i, uie;
        for (i = 0; i < data.length; i++) {
            uie = data[i];
            data[i] = expand(uie);
        }
        for (i = 0; i < data.length; i++) {
            uie = data[i];
            if (uie.css) templateLines.push("<style>" + uie.css + "</style>");
        }
        for (i = 0; i < data.length; i++) {
            uie = data[i];
            templateLines.push(uie.html);
        }
        for (i = 0; i < data.length; i++) {
            uie = data[i];
            if (uie.js) templateLines.push('<script type="text/javascript">' + uie.js + '</script>');
        }

        return templateLines.join("\n");
    },
    templates: {
        'code': ""
    }
});

generators.push({
    name: 'navbar',
    version: '0.1',
    defaults: {
        brandName : "Default Name",
        links: [
            {
                url: "",
                title: "Page 1"
            },
            {
                url: "",
                title: "Page 2"
            }
        ]
    },
    code: function(data, templates) {

        _.each(data.links, function(link) {
            link.url = link.url || "#";
        });

        var html = templates.html(data);

        return {
            html: html,
            js: "",
            css: ""
        }

    },
    templates: {
        'html': '<div class="navbar navbar-fixed-top navbar-default" id="navbar" role="navigation">' +
            '<div class="container">' +
            '<div class="navbar-header">' +
            '<a href="/" class="navbar-brand"><%= brandName %></a>' +
            '<button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-collapse">' +
            '<span class="icon-bar"></span>' +
            '<span class="icon-bar"></span>' +
            '<span class="icon-bar"></span>' +
            '</button>' +
            '</div>' +
            '<div class="navbar-collapse collapse" id="navbar-collapse">' +
            '<ul class="nav navbar-nav" id="links">' +
            '<% for (var ii = 0; ii < links.length; ii++) { var item = links[ii]; %>' +
            '<li><a href="<%= item.url %>" class="menu-item"><%= item.title %></a></li>' +
            '<% } %>' +
            '</ul>' +
            '</div>' +
            '</div>' +
            '</div>'
    }
});

generators.push({
    name: 'footer',
    version: '0.1',
    defaults: {
        customText : "Default Footer - Copyright",
        links: [
            {
                url: "",
                title: "Page 1"
            },
            {
                url: "",
                title: "Page 2"
            }
        ]
    },
    code: function(data, templates) {

        var html = templates.html(data);

        return {
            html: html,
            js: "",
            css: ""
        }
    },
    templates: {
        'html': '<footer class="footer">' +
            '<div class="container">' +
            '<p id="customText" class="footer-text muted"><%= customText %></p>' +
            '<ul class="footer-links" id="links">' +
            '<% for (var ii = 0; ii < links.length; ii++) { var item = links[ii]; %>' +
            '<li><a href="#" class="menu-item"><%= item.title %></a></li>' +
            '<% } %>' +
            '</ul>' +
            '</div>' +
            '<div class="clearfix"></div>' +
            '</footer>'
    }
});

generators.push({
    name: 'layoutColumn',
    version: '0.1',
    code: function(data, templates) {

        var cssLines = [];
        var jsLines = [];
        var htmlLines = [];

        _.each(data.uielements, function(el) {

            var uie = expand(el);
            cssLines.push(uie.css);
            jsLines.push(uie.js);
            htmlLines.push(uie.html);

        });

        data.elements = htmlLines.join('\n');
        var htmlStr = templates.html(data);

        return {
            html: htmlStr,
            js: jsLines.join('\n'),
            css: cssLines.join('\n')
        }
    },

    templates: {
        "html": [
            '<div class="col-md-<%= layout %> ycol">',
            '<%= elements %>',
            '</div>'
        ].join('\n')
    },

    defaults: {
        layout: "12",
        uielements: []
    }
});

generators.push({
    name: 'layoutSection',
    version: '0.1',
    defaults: {
        className: "",
        columns: [],
    },
    code: function(data, templates) {

        var cssLines = [];
        var jsLines = [];
        var htmlLines = [];

        _.each(data.columns, function(column) {

            var expanded_column = expand(column);
            cssLines.push(expanded_column.css);
            jsLines.push(expanded_column.js);
            htmlLines.push(expanded_column.html);

        });


        data.columns = htmlLines.join('\n');
        var htmlStr = templates.html(data);

        return {
            html: htmlStr,
            js: jsLines.join('\n'),
            css: cssLines.join('\n')
        }
    },

    templates: {
        "html": [
            '<div class="row <%= className %>">',
            '<div class="container">',
            '<%= columns %>',
            '</div>',
            '</div>'
        ].join('\n')
    }

});


generators.push({
    name: 'layoutSections',
    version: '0.1',

    code: function(data, templates) {

        var cssLines = [];
        var jsLines = [];
        var htmlLines = [];

        _.each(data, function(sectionData) {
            console.log(sectionData);

            var expanded_section = expand(sectionData);
            cssLines.push(expanded_section.css);
            jsLines.push(expanded_section.js);
            htmlLines.push(expanded_section.html);
        });

        return {
            html: htmlLines.join('\n'),
            js: jsLines.join('\n'),
            css: cssLines.join('\n')
        }

    },

    templates: { }
});


exports.generators = generators;

},{}],11:[function(require,module,exports){
var generators = [];

generators.push({
    name: 'design-header',
    version: '0.1',
    defaults: {
      className: '',
      style: '',
      content: 'Hello Header'
    },
    code: function(data, templates) {
        return { html: templates.html(data),
                 css: '',
                 js: '',
                 layout: data.layout };
    },
    templates: {
        html: '<h1 class="<%= className %>" style="<%= style %>"><%= content %></h1>'
    },
    displayProps: {
        name: 'Header',
        iconType: 'header',
        halfWidth: true
    }
});

generators.push({
    name: 'design-text',
    version: '0.1',
    defaults: {
      className: '',
      style: '',
      content: 'Hello. This is a text sample. Lorem ipsum is too boring.'
    },
    code: function(data, templates) {
        /* expects: content, className, style */
        return { html: templates.html(data),
                 css: '',
                 js: '',
                 layout: data.layout };
    },
    templates: {
        html: '<div class="<%= className %>" style="<%= style %>"><%= content %></div>'
    },
    displayProps: {
        name: 'Text',
        iconType: 'text',
        halfWidth: true
    }
});

generators.push({
    name: 'design-image',
    version: '0.1',
    defaults: {
      className: '',
      style: '',
      href: '#',
      src: 'https://i.istockimg.com/file_thumbview_approve/18120560/2/stock-photo-18120560-students-at-computer-class.jpg'
    },
    code: function(data, templates) {
        return { html: templates.html(data),
                 css: '',
                 js: '',
                 layout: data.layout };
    },
    templates: {
        html: '<a href="<%= href %>"><img class="<%= className %>" style="<%= style %>" src="<%= src %>"></a>'
    },
    displayProps: {
        name: 'Image',
        iconType: 'image',
        halfWidth: true
    }
});

generators.push({
    name: 'design-link',
    version: '0.1',
    defaults: {
      className: '',
      style: '',
      href: '#',
      content: 'Click To Go'
    },
    code: function(data, templates) {
        /* expects: content, url, className, style */
        return { html: templates.html(data),
                 css: '',
                 js: '',
                 layout: data.layout };
    },
    templates: {
        html: '<a href="<%= href %>" class="<%= className %>" style="<%= style %>"><%= content %></a>'
    },
    displayProps: {
        name: 'Link',
        iconType: 'link',
        halfWidth: true
    }
});

generators.push({
    name: 'design-button',
    version: '0.1',
    defaults: {
      className: '',
      style: '',
      href: '#',
      content: 'Button to Go'
    },
    code: function(data, templates) {
        /* expects: content, url, className, style */
        return { html: templates.html(data),
                 css: '',
                 js: '',
                 layout: data.layout };
    },
    templates: {
        html: '<a href="<%= href %>" class="btn <%= className %>" style="<%= style %>"><%= content %></a>'
    },
    displayProps: {
        name: 'Button',
        iconType: 'button',
        halfWidth: true
    }
});

generators.push({
    name: 'design-line',
    version: '0.1',
    defaults: {
      className: '',
      style: ''
    },
    code: function(data, templates) {
        /* expects: className, style */
        data.className = data.className || '';
        data.style = data.style || '';
        return { html: templates.html(data),
                 css: '',
                 js: '',
                 layout: data.layout };
    },
    templates: {
        html: '<hr class="<%= className %>" style="<%= style %>">'
    },
    displayProps: {
        name: 'Line',
        iconType: 'line',
        halfWidth: true
    }
});

generators.push({
    name: 'design-box',
    version: '0.1',
    defaults: {
      className: '',
      style: ''
    },
    code: function(data, templates) {
        /* expects: content, url, className, style */
        data.className = data.className || '';
        data.style = data.style || '';
        data.style += " width: 100%; height: 100%;";
        return { html: templates.html(data),
                 css: '',
                 js: '',
                 layout: data.layout };
    },
    templates: {
        html: '<div class="<%= className %>" style="<%= style %>"></div>'
    },
    displayProps: {
        name: 'Box',
        iconType: 'box',
        halfWidth: true
    }
});

generators.push({
    name: 'design-imageslider',
    version: '0.1',
    defaults: {
      cid: Math.floor(Math.random()*11),
      slides: [ {
        image: 'https://i.istockimg.com/file_thumbview_approve/18120560/2/stock-photo-18120560-students-at-computer-class.jpg',
        text : "Slide 1 Text"
      } ]
    },
    code: function(data, templates) {
        /* expects: content, url, className, style */
        return { html: templates.html(data),
                 css: '',
                 js: '',
                 layout: data.layout };
    },
    templates: {
        html:   ['<div id="slider-<%= cid %>" class="carousel slide">',
        '<ol class="carousel-indicators">',
          '<% for(var i=0; i < slides.length; i++) { %>',
          '<li data-target="#slider-<%= cid %>" data-slide-to="<%= i %>" <% if(i==0) { %>class="active" <% } %>></li>',
          '<% } %>',
        '</ol>',
        '<!-- Carousel items -->',
        '<div class="carousel-inner">',
          '<% _(slides).each(function(slide, index) { %>',
            '<div class="<% if(index == 0) { %>active <% } %>item">',
              '<img src="<%= slide.image %>">',
              '<div class="carousel-caption"><p><%= slide.text %></p></div>',
            '</div>',
          '<% }); %>',
        '</div>',
        '<!-- Carousel nav -->',
        '<a class="carousel-control left" href="#slider-<%= cid %>" data-slide="prev">&lsaquo;</a>',
        '<a class="carousel-control right" href="#slider-<%= cid %>" data-slide="next">&rsaquo;</a>',
      '</div>'].join('\n')
    },
    displayProps: {
        name: 'Image Slider',
        iconType: 'imageslider',
        halfWidth: true
    }
});

generators.push({
    name: 'design-fbshare',
    version: '0.1',
    code: function(data, templates) {
        /* expects: content, url, className, style */
        var obj = {};
        
        if (data.pageLink) {
            obj = { html: templates.htmlForPage(data),
                    css: '',
                    js: '',
                    layout: data.layout };

        }
        else {
            obj = { html: templates.htmlForCurrentPage(data),
                    css: '',
                    js: '',
                    layout: data.layout };
        }

        return obj;
    },
    templates: {
        htmlForCurrentPage: [
                        '<div class="fb-like" data-href="" ',
                        'data-width="<%= layout.width * 80 %>" data-send="true" ',
                        'data-show-faces="false" onload="this.dataset.href=window.location.href;"></div>'
                     ].join(''),
        htmlForPage: [
                        '<div class="fb-like-box" data-href="<%= pageLink %>" ',
                        'data-width="<%= layout.width * 80 %>" data-height="<%= layout.height * 15>" ',
                        'data-show-faces="false" data-header="false" data-stream="false" data-show-border="false"></div>'
                     ].join('')
    },
    displayProps: {
        name: 'FB Share',
        iconType: 'fbshare',
        halfWidth: true
    }
});

generators.push({
    name: 'design-embedvideo',
    version: '0.1',
    defaults: {
      youtubeURL: "http://www.youtube.com/watch?v=hZTx0vXUo34"
    },
    code: function(data, templates) {

        var url = data.youtubeURL;
        url = url.replace('http://www.youtube.com/watch?v=', '');
        url = '//www.youtube.com/embed/' + url;
        data.url = url;

        return { html: templates.html(data),
                 css: '',
                 js: '',
                 layout: data.layout };
    },
    templates: {
        html: '<iframe class="video-embed" src="<%= url %>" width="<%= layout.width %>" height="<%= layout.height %>" frameborder="0"></iframe>'
    },
    displayProps: {
        name: 'Embed Video',
        iconType: 'embedvideo',
        halfWidth: true
    }
});

generators.push({
    name: 'design-custom',
    version: '0.1',
    code: function(data, templates) {
        /* expects: content, url, className, style */
        return { html: data.htmlC,
                 css: data.cssC,
                 js: data.jsC,
                 layout: data.layout };
    },
    templates: { },
    displayProps: {
        name: 'Custom Widget',
        iconType: 'custom-widget',
        halfWidth: true
    }
});

generators.push({
    name: 'form-field',
    version: '0.1',
    defaults: {
      field_name: "",
      displayType: "single-line-text"
    },
    code: function(data, templates) {
        /*  */

        var template = templates[data.displayType];
        data.style = data.style || 'display:block';

        return template(data);
    },
    templates: {
        "single-line-text": '<input type="text" name="<%= field_name %>" placeholder="<%= placeholder %>">',
        "text": '<input type="text" name="<%= field_name %>" placeholder="<%= placeholder %>">',
        "paragraph-text": '<textarea name="<%= field_name %>" placeholder="<%= placeholder %>"></textarea>',
        "dropdown": '<select name="<%= field_name %>" class="dropdown"><% _.each(options.split(\',\'), function(option, ind){ %><option><%= option %></option><% }); %></select>',
        "option-boxes": '<span class="option-boxes"><% _(field.get(\'options\').split(\',\')).each(function(option, ind){ %><input id="opt-<%= ind %>" class="field-type" type="radio" name="types" value=""> <label class="opt" for="opt-<%= ind %>"><%= option %></label><br  /><% }); %></span>',
        "password-text": '<input name="<%= field_name %>" type="password" placeholder="<%= placeholder %>">',
        "email-text": '<div class="email"><input type="text" placeholder="<%= placeholder %>"></div>',
        "button": '<div class="btn"><%= placeholder %></div>',
        "image-uploader": '<div class="upload-image btn">Upload Image</div><input type="hidden" name="<%= field_name %>',
        "file-uploader": '<div class="upload-file btn">Upload File</div>',
        "date-picker": '<input name="<%= field_name %>" type="text" placeholder="<%= placeholder %>"><img style="margin-left:5px;" src="/static/img/calendar-icon.png">'
    },
    displayProps: {
        name: 'Form Field',
        halfWidth: true
    }
});

exports.generators = generators;

},{}],12:[function(require,module,exports){
/* plz edit via plugin editor and reserialize as follows. */

exports.uielements = [{"templates":{"html":"<form id=\"<%= id %>\" class=\"<%= className %>\" style=\"<%= style %>\">\n<%= formFields %>\n<br>\n<input type=\"submit\" value=\"Submit\"><br>\n</form>","js":"$('#<%= id %>').submit(function(e){\n    e.preventDefault();\n    var email = $('#<%= id %> input[name=\"email\"]').val();\n    var password1 = $('#<%= id %> input[name=\"password1\"]').val();\n    var password2 = $('#<%= id %> input[name=\"password2\"]').val();\n\n    $('#<%= id %>').attr('disabled','true');\n\n    models.User.signup(email, password1, password2, function(err, data){\n\n        $('#<%= id %>').attr('disabled','false');\n\n        if (err) {\n            alert(err);\n        } else {\n            location.href = '<%= redirect_to %>';\n        }\n\n    });\n\n    return false;\n});"},"_pristine":false,"code":"function (data, templates) {\n    // expect data.redirect_to\n    var fields = [];\n    fields.push({\n        generate: 'uielements.form-field',\n        data: { displayType: 'single-line-text',\n                field_name: 'email',\n                placeholder: 'Email'}\n    });\n    fields.push({\n        generate: 'uielements.form-field',\n        data: { displayType: 'password-text',\n                field_name: 'password1',\n                placeholder: 'Password'}\n    });\n    fields.push({\n        generate: 'uielements.form-field',\n        data: { displayType: 'password-text',\n                field_name: 'password2',\n                placeholder: 'Confirm password'}\n    });\n    data.formFields = _.map(fields, expand).join('<br>');\n    return { html: templates.html(data), js: templates.js(data), css: ''};\n}","name":"signup","package":"authentication","generatorIdentifier":"authentication.uielements.signup","version":"0.1","defaults":{"className":"","style":"","id":"","redirect_to":""}},{"templates":{"html":"<form id=\"<%= id %>\" class=\"<%= className %>\" style=\"<%= style %>\">\n<%= formFields %>\n<br>\n<input type=\"submit\" value=\"Submit\"><br>\n</form>","js":"$('#<%= id %>').submit(function(e){\n    e.preventDefault();\n    var email = $('#<%= id %> input[name=\"email\"]').val();\n    var password = $('#<%= id %> input[name=\"password\"]').val();\n\n    $('#<%= id %>').attr('disabled','true');\n\n    models.User.login(email, password, function(err, data){\n\n        $('#<%= id %>').attr('disabled','false');\n\n        if (err) {\n            alert(err);\n        } else {\n            location.href = '<%= redirect_to %>';\n        }\n\n    });\n\n    return false;\n});"},"code":"function (data, templates) {\n    // expect data.redirect_to\n    var fields = [];\n    fields.push({\n        generate: 'uielements.form-field',\n        data: { displayType: 'single-line-text',\n                field_name: 'email',\n                placeholder: 'Email'}\n    });\n    fields.push({\n        generate: 'uielements.form-field',\n        data: { displayType: 'password-text',\n                field_name: 'password',\n                placeholder: 'Password'}\n    });\n    data.formFields = _.map(fields, expand).join('<br>');\n    return { html: templates.html(data), js: templates.js(data), css: ''};\n}","version":"0.1","defaults":{"className":"","style":"","id":"","redirect_to":""},"name":"login"}];
exports.model_methods = [{"templates":{"code":"function(plainText) {\n  /**\n   * Authenticate by checking the hashed password and provided password\n   *\n   * @param {String} plainText\n   * @return {Boolean}\n   * @api private\n   */\n    return this.encryptPassword(plainText) === this.hashed_password;\n  }"},"generatorIdentifier":"authentication.model_methods.authenticate","code":"function(data, templates) {\n    return {\n        name: 'authenticate',\n        instancemethod:true,\n        code: templates.code(data)\n    };\n}","version":"0.1","name":"authenticate"},{"templates":{"code":"function() {\n  /**\n   * Create password salt\n   *\n   * @return {String}\n   * @api private\n   */\n\n    /* Then to regenerate password, use:\n        user.salt = user.makeSalt()\n        user.hashed_password = user.encryptPassword(password)\n    */\n    return Math.round((new Date().valueOf() * Math.random())) + '';\n  }"},"generatorIdentifier":"authentication.model_methods.makeSalt","code":"function(data, templates) {\n    return {\n        name: 'makeSalt',\n        instancemethod:true,\n        code: templates.code(data)\n    };\n}","version":"0.1","name":"makeSalt"},{"templates":{"code":"function (password) {\n  /**\n   * Encrypt password\n   *\n   * @param {String} password\n   * @return {String}\n   * @api private\n   */\n    var crypto = require('crypto');\n    if (!password) return '';\n    return crypto.createHmac('sha1', this.salt).update(password).digest('hex')\n  }"},"generatorIdentifier":"authentication.model_methods.encryptPassword","code":"function(data, templates) {\n    return {\n        name: 'encryptPassword',\n        instancemethod:true,\n        code: templates.code(data)\n    };\n}","version":"0.1","name":"encryptPassword"},{"templates":{"code":"function (token, cb) {\n  /**\n   * Reset auth token\n   *\n   * @param {String} token\n   * @param {Function} cb\n   * @api private\n   */\n    var self = this;\n    var crypto = require('crypto');\n    crypto.randomBytes(48, function(ex, buf) {\n      self[token] = buf.toString('hex');\n      if (cb) cb();\n    });\n  }"},"generatorIdentifier":"authentication.model_methods.resetToken","code":"function(data, templates) {\n    return {\n        name: 'resetToken',\n        instancemethod:true,\n        code: templates.code(data)\n    };\n}","version":"0.1","name":"resetToken"},{"templates":{"code":"function (schema) {\n  schema.path('name').validate(function (name) {\n    return name.trim().length > 0;\n  }, 'Please provide a valid name');\n}"},"generatorIdentifier":"authentication.model_methods.validateName","code":"function(data, templates) {\n    return {\n        name: 'validateName',\n        schemaMod:true,\n        code: templates.code(data)\n    };\n}","version":"0.1","name":"validateName"},{"templates":{"code":"function (schema) {\n  schema.path('email').validate(function (email) {\n    return email.trim().length > 0;\n  }, 'Please provide a valid email');\n}"},"generatorIdentifier":"authentication.model_methods.validateEmail","code":"function(data, templates) {\n    return {\n        name: 'validateEmail',\n        schemaMod:true,\n        code: templates.code(data)\n    };\n}","version":"0.1","name":"validateEmail"},{"templates":{"code":"function (schema) {\n  schema.path('hashed_password').validate(function (hashed_password) {\n    return hashed_password.length > 0;\n  }, 'Please provide a password');\n}"},"generatorIdentifier":"authentication.model_methods.validatePassword","code":"function(data, templates) {\n    return {\n        name: 'validatePassword',\n        schemaMod:true,\n        code: templates.code(data)\n    };\n}","version":"0.1","name":"validatePassword"},{"templates":{"code":"function(email, username, password, password2, callback) {\n        if (password !== password2) {\n            callback('Passwords don\\'t match. Please try again.');\n        }\n        var user = new this({email: email, username: username});\n        user.salt = user.makeSalt();\n        user.hashed_password = user.encryptPassword(password);\n        user.save(function(err, data) {\n            if (err) {\n                callback(err);\n            } else {\n                callback(null, {url:'?success=true'});\n            }\n        });\n    }"},"generatorIdentifier":"authentication.model_methods.signup","code":"function(data, templates) {\n    return {\n        name: 'signup',\n        enableAPI:true,\n        code: templates.code(data)\n    };\n}","version":"0.1","name":"signup"},{"templates":{"code":"function(username, password, callback, _req, _res) {\n        /* Fake it to look like a form submission */\n  _req.body.username = username;\n  _req.body.password = password;\n  var passport = require('passport');\n  passport.authenticate('local', function(err, user, info) {\n    if (err) {\n      return callback(err);\n    }\n    if (!user) {\n      return callback(null, { redirect: '/login' });\n    }\n    _req.logIn(user, function(err) {\n      if (err) {\n        return callback(err);\n      }\n      return callback(null, { redirect: '/users/' + user.username });\n    });\n  })(_req, _res);\n}"},"generatorIdentifier":"authentication.model_methods.login","code":"function(data, templates) {\n    return {\n        name: 'login',\n        enableAPI:true,\n        code: templates.code(data)\n    };\n}","version":"0.1","name":"login"}];
exports.metadata = {
    name: 'userauth',
    displayName: 'User Auth',
    description: 'generates some code to support user authentication.'
    };

},{}],13:[function(require,module,exports){
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array, using the modern version of the 
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from an array.
  // If **n** is not specified, returns a single random element from the array.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (arguments.length < 2 || guard) {
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}]},{},[1])