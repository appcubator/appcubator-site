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
            'click .clone-button' : 'cloneGenerator'
        },


        initialize: function(options) {
            _.bindAll(this);
            this.widgetModel = options.widgetModel;
            this.setupGenerator(options.generate);
        },

        setupGenerator: function(generatorPath) {
            this.generatorPath = generatorPath;
            this.generator = new Generator().getGenerator(this.generatorPath);
            this.widgetModel.setGenerator(generatorPath);
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
                            '<li><a href="#" class="edit-current">Edit Current Generator</a></li>',
                            '<li><a href="#" class="fork-current">Fork Current Generator</a></li>',
                            '<li class="divider"></li>',
                        '</ul>',
                    '</div>',
                '</div>',
                '<div id="current-code-editor" style="width:100%; height: 100%;"></div>'
            ].join('\n'), { name: this.generatorPath });


            this.$el.find('.dropdown-toggle').dropdown();

            if(this.generator._pristine()) { 
                // disable that option.
                // this.$le.find('.edit-current').
            }

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
            this.makeEditorUneditable();
        },

        makeEditorEditable: function() {
            this.editor.setReadOnly(false);  // false to make it editable
        },

        makeEditorUneditable: function() {
            this.editor.setReadOnly(true);  // false to make it editable
            this.editor.setHighlightActiveLine(false);
            this.editor.setHighlightGutterLine(false);
            this.editor.renderer.$cursorLayer.element.style.opacity=0;
        },

        renderCloneButtons: function() {
            
            var currentModule = util.packageModuleName(this.generatorPath).module;
            // e.g. if module == uielements, it can only clone uielements
            var generators = v1State.get('generators').getGeneratorsWithModule(currentModule);
            
            generators = _.reject(generators, function(generator) {

                var genPath = [util.packageModuleName(this.generatorPath).package, currentModule, generator.name].join('.');
                return genPath == this.generatorPath;
            }, this);

            _.each(generators, function(generator) {
                var genPath = [generator.package, currentModule, generator.name].join('.');
                this.$el.find('.action-menu').append('<li class="clone-button" id="'+ genPath +'"><a href="#">Switch Generator to '+  generator.name +'X</a></li>');
            }, this);
        },

        editCurrentGen: function() {
            // if is not pristine, shoudl give a warning. waiting for that functionality.
            if(this.generator._pristine()) { return; }
            else {
                this.makeEditorEditable();
            }
        },

        forkCurrentGen: function() {
            
            var self = this;

            var newName = window.prompt("What do you want to name the new generator?", util.packageModuleName(self.generatorPath) + "_edited");
            
            if (newName!=null) {
                
                var newPackageModuleName = util.packageModuleName(self.generatorPath);
                newPackageModuleName.name = newName;
                
                if(!v1State.get('generators').isNameUnique(newPackageModuleName)) { self.forkCurrentGen(); } 
                
                var genObj = _.clone(this.generator);
                var newGenPath = v1State.get('generators').fork(this.generator, this.generatorName, newName);
                self.setupGenerator(newGenPath);
                self.reRender();
                self.makeEditorEditable();
            }
            else {
                self.forkCurrentGen();
            }
        },

        cloneGenerator: function(e) {
            var genPath = String(e.currentTarget.id);
            this.widgetModel.setGenerator(genPath);
            
            // changes data related to this view and rerenders
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