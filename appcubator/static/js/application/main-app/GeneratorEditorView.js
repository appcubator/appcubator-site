define(function(require, exports, module) {

    'use strict';

    var Generator = require('app/Generator');
    require('backbone');

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

        },


        initialize: function(options) {
            _.bindAll(this);
            this.generatorName = options.generate;
            this.generator = new Generator().getGenerator(this.generatorName);
        },

        render: function() {

            this.el.innerHTML = [
                '<div class="instance sect">',
                    this.generator.code,
                '</div>'
            ].join('\n');

            return this;
        },


        setupAce: function() {
            this.model.get('instancemethods').each(function(methodModel) {
                this.setupSingleAce(methodModel);
            }, this);
            this.model.get('staticmethods').each(function(methodModel) {
                this.setupSingleAce(methodModel);
            }, this);

            // this.editor.getSession().setMode("ace/mode/css");
            // this.editor.setValue(this.model.get('basecss'), -1);
            // this.editor.on("change", this.keyup);
        },

        setupSingleAce: function(methodModel) {
            var self = this;

            var editor = ace.edit("func-editor-" + methodModel.cid);
            editor.getSession().setMode("ace/mode/javascript");
            editor.setValue(methodModel.get('code'), -1);

            editor.on("change", function() {
                self.codeChanged(methodModel, editor.getValue());
            });
        },

        renderStaticMethod: function(methodModel) {
            this.$el.find('#static-methods-list').append(_.template(funcTemplate, _.extend(methodModel.serialize(), {cid: methodModel.cid})));
            this.setupSingleAce(methodModel);
        },

        renderInstanceMethod: function(methodModel) {
            this.$el.find('#instance-methods-list').append(_.template(funcTemplate, _.extend(methodModel.serialize(), {cid: methodModel.cid})));
            this.setupSingleAce(methodModel);
        },

        createStaticFunction: function(functionName) {
            this.model.get('staticmethods').add(new TableCodeModel({ name: functionName }));
        },

        createInstanceFunction: function(functionName) {
            this.model.get('instancemethods').add(new TableCodeModel({ name: functionName }));
        },

        codeChanged: function(methodModel, newValue) {
            methodModel.set('code', newValue);
        }

    });

    return GeneratorEditorView;
});