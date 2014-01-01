define(function(require, exports, module) {

    'use strict';

    var SoftErrorView = require('app/SoftErrorView');
    var DialogueView = require('mixins/DialogueView');
    var TableCodeModel = require('models/TableCodeModel');

    require('app/templates/TableTemplates');
    require('prettyCheckable');


    var funcTemplate = [
        '<div class="code-chunk">',
            '<span class="title"><%= name %></span>',
            '<div class="code-editor" id="func-editor-<%= cid %>"></div>',
        '</div>'
    ].join('\n');

    var TableCodeView = Backbone.View.extend({
        el: null,
        tagName: 'div',
        collection: null,
        parentName: "",
        className: 'code-view',
        subviews: [],

        events: {

        },


        initialize: function(tableModel) {
            _.bindAll(this);
            this.model = tableModel;

            this.listenTo(this.model.get('staticmethods'), 'add', this.renderStaticMethod);
            this.listenTo(this.model.get('instancemethods'), 'add', this.renderInstanceMethod);

        },

        render: function() {

            var insStr ='';
            this.model.get('instancemethods').each(function(methodModel) {
                insStr += _.template(funcTemplate, _.extend(methodModel.toJSON(), {cid: methodModel.cid}));
            });

            var statStr ='';
            this.model.get('staticmethods').each(function(methodModel) {
                statStr += _.template(funcTemplate, _.extend(methodModel.toJSON(), {cid: methodModel.cid}));
            });

            this.el.innerHTML = [
                '<div class="instance sect">',
                    '<span class="title">Instance Methods</span>',
                    '<div id="static-methods-list">'+insStr+'</div>',
                    '<div id="add-static-box">',
                        '<form style="display:none;">',
                            '<input type="text" class="property-name-input" placeholder="Property Name...">',
                            '<input type="submit" class="done-btn" value="Done">',
                        '</form>',
                        '<div class="add-button box-button">+ Create a New Instance Method</div>',
                    '</div>',
                '</div>',
                '<div class="static sect">',
                    '<span class="title">Static Methods</span>',
                    '<div id="instance-methods-list">'+statStr+'</div>',
                    '<div id="add-instance-box">',
                        '<form style="display:none;">',
                            '<input type="text" class="property-name-input" placeholder="Property Name...">',
                            '<input type="submit" class="done-btn" value="Done">',
                        '</form>',
                        '<div class="add-button box-button">+ Create a New Static Method</div>',
                    '</div>',
                '</div>'
            ].join('\n');

            this.addPropertyBox = new Backbone.NameBox({}).setElement(this.$el.find('#add-static-box')).render();
            this.addPropertyBox.on('submit', this.createStaticFunction);
            this.addPropertyBox = new Backbone.NameBox({}).setElement(this.$el.find('#add-instance-box')).render();
            this.addPropertyBox.on('submit', this.createInstanceFunction);
            //             this.addPropertyBox = new Backbone.NameBox({}).setElement(this.$el.find('.add-property-column').get(0)).render();
            // this.subviews.push(this.addPropertyBox);
            // this.addPropertyBox.on('submit', this.createNewProperty);

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
            this.$el.find('#static-methods-list').append(_.template(funcTemplate, _.extend(methodModel.toJSON(), {cid: methodModel.cid})));
            this.setupSingleAce(methodModel);
        },

        renderInstanceMethod: function(methodModel) {
            this.$el.find('#instance-methods-list').append(_.template(funcTemplate, _.extend(methodModel.toJSON(), {cid: methodModel.cid})));
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

    return TableCodeView;
});