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
            'click .fork-current' : 'forkCurrentGen',
            'click .clone-button' : 'cloneGenerator',
            'click .edit-code'    : 'editCode'
        },


        initialize: function(options) {
            _.bindAll(this);
            this.model = options.widgetModel;
            this.setupGenerator(options.generate || this.model.generate);
        },

        setupGenerator: function(generatorPath) {
            this.generatorPath = generatorPath;
            this.generator = G.getGenerator(this.generatorPath);
            this.model.setGenerator(generatorPath);
        },

        render: function() {
            this.el.innerHTML = _.template([
                '<div id="name-editor" class="sub-settings">',
                    '<div style="line-height: 60px; display:inline-block;">Current Generator: <%= name %></div>',
                    '<div class="btn-group right">',
                        '<button type="button" class="btn btn-default edit-code">',
                        'Edit Code',
                        '</button>',
                        '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                        'Change Generator <span class="caret"></span>',
                        '</button>',
                        '<ul class="dropdown-menu abs action-menu" role="menu">',
                            '<li class="fork-current"><a href="#">Fork Current Generator</a></li>',
                            '<li class="divider"></li>',
                        '</ul>',
                    '</div>',
                '</div>',
                '<div class="generated-code"><%= generatedCode %></div>'
            ].join('\n'), { name: this.generatorPath, generatedCode: this.getGeneratedCode() });


            if(!v1State.get('plugins').isGeneratorEditable(this.generatorPath)) {
                this.$el.find('.edit-code').addClass('disabled');
                this.$el.find('.edit-code').attr('title', 'Native generators cannot be edited. They need to be forked.');
            }
            this.$el.find('.dropdown-toggle').dropdown();
            this.renderCloneButtons();

            this.$el.tooltip();

            return this;
        },

        renderCloneButtons: function() {

            var currentModule = util.packageModuleName(this.generatorPath).module;
            // e.g. if module == uielements, it can only clone uielements
            var generators = v1State.get('plugins').getAllGeneratorsWithModule(currentModule);

            _.each(generators, function(generator) {
                var genPath = [generator.package, currentModule, generator.name].join('.');
                this.$el.find('.action-menu').append('<li class="clone-button" id="'+ genPath +'"><a href="#">Switch Generator to '+  generator.name +'</a></li>');
            }, this);
        },

        editCurrentGen: function() {
            alert('todo link to the plugin editor');
        },

        forkCurrentGen: function() {
            // alert('Not yet implemented');

            var self = this;
            var newName = window.prompt("What do you want to name the new generator?", util.packageModuleName(self.generatorPath).name + "_edited");

            if (newName!=null) {

                var newPackageModuleName = util.packageModuleName(self.generatorPath);
                newPackageModuleName.name = newName;

                // isNameUnique needs work, plz see function
                if(!v1State.get('plugins').isNameUnique(newPackageModuleName)) { self.forkCurrentGen(); }

                var genObj = _.clone(this.generator);
                var newGenPath = v1State.get('plugins').fork(this.generatorPath, newName);

                self.setupGenerator(newGenPath);
                self.render();
            }
            else {
                self.forkCurrentGen();
            }

        },

        getGeneratedCode: function() {
            var string  = "";
            try {
                    // This will force it to use defaults in the generator
                    // console.log('Trying to generate code')
                    var gPath = this.generatorPath;
                    var generated = this.model.expand();
                    console.log(generated);

                    if(typeof generated === 'object') {
                        var str = '<div>';

                        _.each(generated, function(val, key) {
                            str += '<h4>' + key + '</h4>';
                            str += '<pre>' + String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</pre>';
                        });
                        
                        string = str;
                    }
                    else if (typeof generated === 'string') {
                        string = '<pre>' + generated.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</pre>';
                    }

                }
                catch (e) {
                    string = 'Could not be generated: '+ e;
                }

            return string;
        },

        editCode: function() {
            if(v1State.get('plugins').isGeneratorEditable(this.generatorPath)) {
                var url = "/app/" + appId + "/dev/#" + this.generatorPath;
                window.open(url, "Generator Editor");
            }
        },

        cloneGenerator: function(e) {
            var genPath = String(e.currentTarget.id);
            console.log(genPath);
            this.model.setGenerator(genPath);

            // changes data related to this view and rerenders
            this.generatorPath = genPath;
            this.generator = G.getGenerator(genPath);

            this.render();
        },

    });

    return GeneratorEditorView;
});
