define(function(require, exports, module) {

    'use strict';

    var Generator = require('app/Generator');
    require('backbone');
    require('bootstrap');

    var funcTemplate = [
        '<div class="code-chunk">',
            '<span class="title"><%= name %></span>',
            '<div class="code-editor" id="template-editor-<%= name %>"></div>',
        '</div>'
    ].join('\n');

    var TemplatesEditorView = Backbone.View.extend({
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
            this.generator = G.getGenerator(this.generatorName);
        },

        render: function() {
            var strHTML = _.template([
                '<div id="name-editor" class="sub-settings">',
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
                '</div>'
            ].join('\n'), { name: this.generatorName });
            
            strHTML += '<div class="instance sect">';
            _.each(this.generator.templates, function(val, key) {
                strHTML += _.template(funcTemplate, { name: key });
            });

            strHTML += [
                    '<div id="add-template-box">',
                        '<form style="display:none;">',
                            '<input type="text" class="property-name-input" placeholder="Template Name...">',
                            '<input type="submit" class="done-btn" value="Done">',
                        '</form>',
                        '<div class="add-button box-button">+ Create a New Template</div>',
                    '</div>'
                ].join('\n');

            strHTML += '</div>';

            this.el.innerHTML = strHTML;

            this.$el.find('.dropdown-toggle').dropdown();
            this.addPropertyBox = new Backbone.NameBox({}).setElement(this.$el.find('#add-template-box')).render();
            this.addPropertyBox.on('submit', this.createTemplate);
            
            this.renderCloneButtons();
            return this;
        },

        reRender :function() {
            this.el.innerHTML = '';
            this.render();
            this.setupAce();
        },

        renderCloneButtons: function() {
            
            var packageModuleName = expanderfactory(function(code, globals) { }).parseGenID(this.generatorName);
            var plugins = [];

            if (packageModuleName.package != "local" &&
                appState.plugins[packageModuleName.package] &&
                appState.plugins[packageModuleName.package][packageModuleName.module]) {
                plugins = _.map(appState.plugins[packageModuleName.package][packageModuleName.module], function(obj) { obj.package = packageModuleName.package; return obj; });
            }

            if (appState.plugins["local"] &&
                appState.plugins["local"][packageModuleName.module]) {
                var localGens = _.map(appState.plugins["local"][packageModuleName.module], function(obj) { obj.package = "local"; return obj; });
                plugins = _.union(plugins, localGens);
            }

            plugins = _.reject(plugins, function(generator) {
                var genName = [packageModuleName.package, packageModuleName.module, generator.name].join('.');
                return genName == this.generatorName;
            }, this);

            _.each(plugins, function(generator) {
                var genName = [generator.package, packageModuleName.module, generator.name].join('.');
                this.$el.find('.action-menu').append('<li class="clone-button" id="'+ genName +'"><a href="#">Clone '+  generator.name +'X</a></li>');
            }, this);
        },

        setupAce: function() {
            
            var packageModuleName = expanderfactory(function(code, globals) { }).parseGenID(this.generatorName);

            _.each(this.generator.templates, function(val, key) {

                var self = this;
                var editor = ace.edit("template-editor-" + key);
                editor.getSession().setMode("ace/mode/html");
                editor.setValue(String(val), -1);
                editor.on("change", function() {
                    self.keyup(editor, key);
                });

                if(packageModuleName.package != "local") {
                    
                    editor.setReadOnly(true);  // false to make it editable
                    editor.setHighlightActiveLine(false);
                    editor.setHighlightGutterLine(false);
                    editor.renderer.$cursorLayer.element.style.opacity=0;

                }
                else {
                    editor.setReadOnly(false);  // false to make it editable
                }

            }, this);

        },

        editCurrentGen: function() {
            var genObj = _.clone(this.generator);

            var gensWrapper = v1.currentApp.model.get('plugins');
            var packageModuleName = expanderfactory(function(code, globals) { }).parseGenID(this.generatorName);
            packageModuleName.package = 'local';
            gensWrapper.local = gensWrapper.local || {};
            gensWrapper.local[packageModuleName.module] = gensWrapper.local[packageModuleName.module] || [];


            var i = 2;
            var newName = packageModuleName.name + '_v' + i;
            while(!this.isUnique(packageModuleName, newName)) { i++; newName =  packageModuleName.name + '_v' + i;  }

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
            var gensWrapper = v1.currentApp.model.get('plugins');
            var isUnique = true;
            var gens = gensWrapper.local[packageModuleName.module];
            _.each(gens, function(gen) {
                if(gen.name == name) isUnique = false;
            }, this);

            return isUnique;
        },

        createTemplate: function(name) {
            this.generator.templates[name] = "";
            this.reRender();
        },

        cloneGenerator: function(e) {
            var genPath = String(e.currentTarget.id);
            this.widgetModel.generate = genPath;
            this.generatorName = genPath;
            this.generator = G.getGenerator(this.generatorName);

            this.reRender();
        },

        keyup: function(editor, key) {
            this.generator.templates[key] = editor.getValue();
        }

    });

    return TemplatesEditorView;
});
