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
            this.generator = G.getGenerator(this.generatorPath);
            this.widgetModel.setGenerator(generatorPath);
        },

        render: function() {
            this.el.innerHTML = _.template([
                '<div id="name-editor" class="sub-settings">',
                    '<div style="line-height: 60px; display:inline-block;">Current Generator: <%= name %></div>',
                    '<div class="btn-group right">',
                        '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                        'Edit Code <span class="caret"></span>',
                        '</button>',
                        '<ul class="dropdown-menu abs action-menu" role="menu">',
                            '<li><a href="#" class="edit-current">Edit Current Generator</a></li>',
                            '<li class="fork-current"><a href="#">Fork Current Generator</a></li>',
                            '<li class="divider"></li>',
                        '</ul>',
                    '</div>',
                '</div>',
                '<div id="current-code-view-html" style="width:100%; height: 33%; position: relative"></div>',
                '<div id="current-code-view-css" style="width:100%; height: 33%; position: relative"></div>',
                '<div id="current-code-view-js" style="width:100%; height: 33%; position: relative"></div>'
            ].join('\n'), { name: this.generatorPath });


            this.$el.find('.dropdown-toggle').dropdown();

            this.renderCloneButtons();

            return this;
        },

        reRender :function() {
            this.el.innerHTML = '';
            this.render();
            this.setupAce();
        },

        _setupAce: function(type) {
            // input html, css, or js
            this.editor = ace.edit("current-code-view-" + type);
            this.editor.getSession().setMode("ace/mode/" + (type === 'js' ? 'javascript' : type));
            this.editor.setValue(String(this['generated' + type]), -1);
            this.editor.renderer.setShowGutter(false);
            this.makeEditorUneditable();
        },

        setupAce: function() {
            var expanded = this.widgetModel.expand();
            this.generatedhtml = expanded.html;
            this.generatedcss = expanded.css;
            this.generatedjs = expanded.js;
            this._setupAce('html');
            this._setupAce('css');
            this._setupAce('js');
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
            var plugins = v1State.get('plugins').getGeneratorsWithModule(currentModule);

            plugins = _.reject(plugins, function(generator) {

                var genPath = [util.packageModuleName(this.generatorPath).package, currentModule, generator.name].join('.');
                return genPath == this.generatorPath;
            }, this);

            _.each(plugins, function(generator) {
                var genPath = [generator.package, currentModule, generator.name].join('.');
                this.$el.find('.action-menu').append('<li class="clone-button" id="'+ genPath +'"><a href="#">Switch Generator to '+  generator.name +'X</a></li>');
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

                // isNameUnique is not correct
                if(!v1State.get('plugins').isNameUnique(newPackageModuleName)) { self.forkCurrentGen(); }

                var genObj = _.clone(this.generator);
                var newGenPath = v1State.get('plugins').fork(this.generatorPath, newName);

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
            this.generator = G.getGenerator(this.generatorName);

            this.reRender();
        },

    });

    return GeneratorEditorView;
});
