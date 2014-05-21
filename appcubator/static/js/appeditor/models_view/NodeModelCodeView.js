define(function(require, exports, module) {

    'use strict';

    var SoftErrorView = require('app/SoftErrorView');
    var DialogueView = require('mixins/DialogueView');
    var NodeModelMethodModel = require('models/NodeModelMethodModel');
    var WidgetSettingsView = require('editor/WidgetSettingsView');

    require('prettyCheckable');

    var funcTemplate = [
        '<div class="code-chunk" id="func-chunk-<%= cid %>">',
            '<span class="title">',
                '<%= name %>',
                '<div class="option-button settings blue pull-right" id="func-settings-<%= cid %>"></div>',
                '<span class="func-type-container"></span>',
            '</span>',
            '<div class="code-editor" id="func-editor-<%= cid %>"></div>',
        '</div>'
    ].join('\n');

    var FuncChooserView = Backbone.View.extend({
        tagName: 'span',
        className: 'func-type-container',
        events: {
            'click .func-type-change': 'changeTypeHandler',
        },
        initialize: function(el, methodModel) {
            this.setElement(el);
            this.methodModel = methodModel;
            _.bindAll(this);
        },
        render: function() {
            var funcTypeTemplate = '<span class="func-type"><%= funcType %></span>';
            if (!this.methodModel.isGenerator())
                funcTypeTemplate += '<button class="func-type-change" type="button">Change type</button>';
            this.$el.html(_.template(funcTypeTemplate, {funcType: this.methodModel.getType()}));
            return this;
        },
        changeTypeHandler: function() {
            var newType = this.methodModel.toggleType();
            this.$el.find('.func-type').text(newType);
        },
    });

    var TableCodeView = Backbone.View.extend({

        tagName: 'div',
        parentName: "",
        className: 'code-view',
        subviews: [],

        events: {
            'click .settings': 'clickedSettings'
        },


        initialize: function(tableModel) {
            _.bindAll(this);
            this.model = tableModel;

            this.listenTo(this.model.get('functions'), 'add', this.renderStaticMethod);
            this.listenTo(this.model.get('functions'), 'remove', this.removeMethod);
        },

        render: function() {

            this.el.innerHTML = [
                '<div class="static sect">',
                    '<span class="title">Functions</span>',
                    '<div id="static-methods-list"></div>',
                    '<div id="add-static-box">',
                        '<form style="display:none;">',
                            '<input type="text" class="property-name-input" placeholder="Property Name...">',
                            '<input type="submit" class="done-btn" value="Done">',
                        '</form>',
                        '<div class="add-button box-button">+ Create a New Function</div>',
                    '</div>',
                '</div>'
            ].join('\n');

            var self = this;

            var list = this.$el.find('#static-methods-list')[0];
            this.list = list;

            this.model.get('functions').each(function(methodModel, i){
                var methodObj = methodModel.getGenerated();
                list.innerHTML += _.template(funcTemplate, { name: methodObj.name, cid: methodModel.cid });
            });
            _.each($(list).find('.func-type-container'), function(el, i) {
                var methodModel = self.model.get('functions').at(i);
                var fcv = new FuncChooserView(el, methodModel);
                fcv.render();
            });

            this.addPropertyBox = new Backbone.NameBox({}).setElement(this.$el.find('#add-static-box')).render();
            this.addPropertyBox.on('submit', this.createStaticFunction);

            return this;
        },

        setupAce: function() {
            this.model.get('functions').each(function(methodModel) {
                this.setupSingleAce(methodModel);
            }, this);

            // this.editor.getSession().setMode("ace/mode/css");
            // this.editor.setValue(this.model.get('basecss'), -1);
            // this.editor.on("change", this.keyup);
        },

        setupSingleAce: function(methodModel) {
            /* pass true as second argument to render this as a model_method from some plugin */
            /* this breaks when this.el is not rendered */
            var self = this;

            console.log($("#func-editor-" + methodModel.cid));
            var editor = ace.edit("func-editor-" + methodModel.cid);
            editor.getSession().setMode("ace/mode/javascript");
            editor.setValue(methodModel.getCode(), -1);

            if (methodModel.isGenerator()) {
                console.log('setting read only');
                editor.setReadOnly(true);
            } else {
                editor.on("change", function() {
                    self.codeChanged(methodModel, editor.getValue());
                });
            }
        },

        renderStaticMethod: function(methodModel) {
            var methodObj = methodModel.getGenerated();
            this.list.innerHTML += _.template(funcTemplate, { name: methodObj.name, cid: methodModel.cid });
            var el = $(this.list).find('.func-type-container').last();
            var fcv = new FuncChooserView(el, methodModel);
            fcv.render();
            try {
                this.setupSingleAce(methodModel);
            } catch (e) {
                console.log('didnt set up ace because of the cardview');
            }
        },

        clickedSettings: function(e) {
            var cid = e.currentTarget.id.replace('func-settings-','');
            var methodModel = this.model.get('functions').get(cid);
            new WidgetSettingsView(methodModel).render();
        },

        removeMethod: function(methodModel) {
            this.$el.find('#func-chunk-', methodModel.cid).remove();
        },

        createStaticFunction: function(functionName) {
            this.model.get('functions').add(new NodeModelMethodModel({ name: functionName, code: '' }));
        },

        codeChanged: function(methodModel, newValue) {
            methodModel.set('code', newValue);
        }

    });

    return TableCodeView;
});
