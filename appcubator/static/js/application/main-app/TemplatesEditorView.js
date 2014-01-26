define(function(require, exports, module) {

    'use strict';

    var Generator = require('app/Generator');
    require('backbone');
    require('bootstrap');

    var TemplatesEditorView = Backbone.View.extend({
        el: null,
        tagName: 'div',
        collection: null,
        parentName: "",
        className: 'code-view',
        subviews: [],

        events: {
            'click .edit-current' : 'editCurrentGen'
        },


        initialize: function(options) {
            _.bindAll(this);
            this.widgetModel = options.widgetModel;
            this.generatorName = options.generate;
            this.generator = new Generator().getGenerator(this.generatorName);
        },

        render: function() {
            var strHTML = _.template([
                '<div id="name-editor" style="height:60px; display: block; border-bottom:1px solid #ccc;">',
                    '<div style="line-height: 60px; display:inline-block;">Current Generator: <%= name %></div>',
                    '<div class="btn-group right">',
                        '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                        'Edit Code <span class="caret"></span>',
                        '</button>',
                        '<ul class="dropdown-menu abs" role="menu">',
                            '<li><a href="#" class="edit-current">Edit Current Code</a></li>',
                            '<li class="divider"></li>',
                            '<li><a href="#">Switch to X</a></li>',
                            '<li><a href="#">Switch to Y</a></li>',
                        '</ul>',
                    '</div>',
                '</div>'
            ].join('\n'), { name: this.generatorName });
            
            strHTML += '<div>';
            _.each(this.generator.templates, function(val, key) {
                strHTML += '<div>' + key + '</div><div id="template-'+key+'" style="height: 300px; width: 100%;"></div></div>';
            });
            strHTML += '</div>';
            this.el.innerHTML = strHTML;
            
            this.$el.find('.dropdown-toggle').dropdown();
            
            return this;
        },

        reRender :function() {
            this.el.innerHTML = '';
            this.render();
            this.setupAce();
        },

        setupAce: function() {
            
            var packageModuleName = expanderfactory(function(code, globals) { }).parseGenID(this.generatorName);

            _.each(this.generator.templates, function(val, key) {

                var self = this;
                var editor = ace.edit("template-" + key);
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

            var gensWrapper = v1.currentApp.model.get('generators');
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

        keyup: function(editor, key) {
            console.log(editor.getValue());
            this.generator.templates[key] = editor.getValue();
            // var newCode = this.editor.getValue(String(this.generator.code), -1);
            // this.generator.code = newCode;
        }

    });

    return TemplatesEditorView;
});