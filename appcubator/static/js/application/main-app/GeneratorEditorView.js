define(function(require, exports, module) {

    'use strict';

    var Generator = require('app/Generator');
    require('backbone');
    require('bootstrap');

    var funcTemplate = [
        '<div class="code-chunk">',
            '<span class="title"><%= name %></span>',
            '<div class="code-editor" id="func-editor-<%= cid %>"></div>',
        '</div>'
    ].join('\n');

    var GeneratorEditorView = Backbone.View.extend({
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
            this.el.innerHTML = _.template([
                '<div id="name-editor" style="height:60px; display: block;">',
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
                '</div>',
                '<div id="current-code-editor" style="width:100%; height: 100%;"></div>'
            ].join('\n'), { name: this.generatorName });

            console.log(this.generatorName);

            this.$el.find('.dropdown-toggle').dropdown();
            
            return this;
        },

        reRender :function() {
            console.log("rerenderig");
            this.el.innerHTML = '';
            this.render();
            this.setupAce();
        },

        setupAce: function() {
            
            this.editor = ace.edit("current-code-editor");
            this.editor.getSession().setMode("ace/mode/css");
            this.editor.setValue(String(this.generator.code), -1);
            this.editor.on("change", this.keyup);
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

        isUnique: function(packageModuleName, name) {
            var gensWrapper = v1.currentApp.model.get('generators');
            var isUnique = true;
            var gens = gensWrapper.local[packageModuleName.module];
            _.each(gens, function(gen) {
                if(gen.name == name) isUnique = false;
            }, this);

            return isUnique;
        },

        keyup: function() {
            var newCode = this.editor.getValue(String(this.generator.code), -1);
            this.generator.code = newCode;
        }

    });

    return GeneratorEditorView;
});