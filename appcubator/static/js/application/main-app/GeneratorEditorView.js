define(function(require, exports, module) {

    'use strict';

    var Generator = require('app/Generator');
    require('backbone');
    require('bootstrap');

    var GeneratorEditorView = Backbone.View.extend({
        el: null,
        tagName: 'div',
        collection: null,
        parentName: "",
        className: 'code-view',
        subviews: [],

        events: {
            'click .edit-current' : 'editCurrentGen',
            'click .clone-button' : 'cloneGenerator'
        },


        initialize: function(options) {
            _.bindAll(this);
            this.widgetModel = options.widgetModel;
            this.generatorName = options.generate;
            this.generator = new Generator().getGenerator(this.generatorName);
        },

        render: function() {
            this.el.innerHTML = _.template([
                '<div id="name-editor" style="height:60px; display: block; border-bottom:1px solid #ccc;">',
                    '<div style="line-height: 60px; display:inline-block;">Current Generator: <%= name %></div>',
                    '<div class="btn-group right">',
                        '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                        'Edit Code <span class="caret"></span>',
                        '</button>',
                        '<ul class="dropdown-menu abs action-menu" role="menu">',
                            '<li><a href="#" class="edit-current">Edit Current Code</a></li>',
                            '<li class="divider"></li>',
                        '</ul>',
                    '</div>',
                '</div>',
                '<div id="current-code-editor" style="width:100%; height: 100%;"></div>'
            ].join('\n'), { name: this.generatorName });


            this.$el.find('.dropdown-toggle').dropdown();
            this.renderCloneButtons();

            return this;
        },

        reRender :function() {
            this.el.innerHTML = '';
            this.render();
            this.setupAce();
        },

        setupAce: function() {
            
            this.editor = ace.edit("current-code-editor");
            this.editor.getSession().setMode("ace/mode/css");
            this.editor.setValue(String(this.generator.code), -1);
            this.editor.on("change", this.keyup);

            var packageModuleName = expanderfactory(function(code, globals) { }).parseGenID(this.generatorName);

            if(packageModuleName.package != "local") {
                this.editor.setReadOnly(true);  // false to make it editable
                this.editor.setHighlightActiveLine(false);
                this.editor.setHighlightGutterLine(false);
                this.editor.renderer.$cursorLayer.element.style.opacity=0;

            }
            else {
                this.editor.setReadOnly(false);  // false to make it editable
            }
        },

        renderCloneButtons: function() {
            
            var packageModuleName = expanderfactory(function(code, globals) { }).parseGenID(this.generatorName);
            var generators = [];

            if (packageModuleName.package != "local" &&
                appState.generators[packageModuleName.package] &&
                appState.generators[packageModuleName.package][packageModuleName.module]) {
                generators = _.map(appState.generators[packageModuleName.package][packageModuleName.module], function(obj) { obj.package = packageModuleName.package; return obj; });
            }

            if (appState.generators["local"][packageModuleName.module]) {
                var localGens = _.map(appState.generators["local"][packageModuleName.module], function(obj) { obj.package = "local"; return obj; });
                generators = _.union(generators, localGens);
            }

            generators = _.reject(generators, function(generator) {
                var genName = [packageModuleName.package, packageModuleName.module, generator.name].join('.');
                return genName == this.generatorName;
            }, this);

            _.each(generators, function(generator) {
                var genName = [generator.package, packageModuleName.module, generator.name].join('.');
                this.$el.find('.action-menu').append('<li class="clone-button" id="'+ genName +'"><a href="#">Clone '+  generator.name +'X</a></li>');
            }, this);
        },

        editCurrentGen: function() {
            var genObj = _.clone(this.generator);

            var gensWrapper = v1.currentApp.model.get('generators');
            var packageModuleName = expanderfactory(function(code, globals) { }).parseGenID(this.generatorName);
            packageModuleName.package = 'local';
            gensWrapper.local = gensWrapper.local || {};
            gensWrapper.local[packageModuleName.module] = gensWrapper.local[packageModuleName.module] || [];


            var i = 2;
            var newName = packageModuleName.name + '_v' + i;
            while(!this.isUnique(packageModuleName, newName)) { i++; newName =  packageModuleName.name + '_v' + i;  }

            alert(newName);

            packageModuleName.name = newName;

            this.generatorName = [  packageModuleName.package,
                                    packageModuleName.module,
                                    packageModuleName.name].join('.');
            
            this.widgetModel.generate = this.generatorName;
            genObj.name = packageModuleName.name;
            this.generator = genObj;

            gensWrapper.local[packageModuleName.module].push(this.generator);
            this.reRender();
        },

        isUnique: function(packageModuleName, name) {
            var gensWrapper = v1.currentApp.model.get('generators');
            var isUnique = true;
            var gens = gensWrapper.local[packageModuleName.module];
            _.each(gens, function(gen) {
                if(gen.name == name) isUnique = false;
            }, this);

            return isUnique;
        },

        cloneGenerator: function(e) {
            var genPath = String(e.currentTarget.id);
            this.widgetModel.generate = genPath;
            this.generatorName = genPath;
            this.generator = new Generator().getGenerator(this.generatorName);

            this.reRender();
        },

        keyup: function() {
            var newCode = this.editor.getValue(String(this.generator.code), -1);
            this.generator.code = newCode;
        }

    });

    return GeneratorEditorView;
});