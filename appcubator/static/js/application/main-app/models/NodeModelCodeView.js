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

        tagName: 'div',
        parentName: "",
        className: 'code-view',
        subviews: [],

        events: {

        },


        initialize: function(tableModel) {
            _.bindAll(this);
            this.model = tableModel;

            this.listenTo(this.model.get('functions'), 'add', this.renderStaticMethod);

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

            this.model.get('functions').each(function(methodModel){
                self._inject_ace_html(methodModel, 'static-methods-list');
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

        setupFakeGeneratorAce: function(methodModel) {
            this.$el.find("#func-editor-" + methodModel.cid).text(methodModel.getCode());
        },
        setupSingleAce: function(methodModel) {
            /* pass true as second argument to render this as a model_method from some plugin */
            /* this breaks when this.el is not rendered */
            var self = this;

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

        '_inject_ace_html': function(methodModel, id) {
            /* this will work even if the el is not yet rendered */
            this.$el.find('#'+id).append(_.template(funcTemplate, _.extend(methodModel.getGenerated(), {cid: methodModel.cid})));
        },
        renderStaticMethod: function(methodModel) {
            /* this breaks when this.el is not rendered */
            this._inject_ace_html(methodModel, 'static-methods-list');
            this.setupSingleAce(methodModel);
        },

        createStaticFunction: function(functionName) {
            this.model.get('functions').add(new TableCodeModel({ name: functionName }));
        },

        codeChanged: function(methodModel, newValue) {
            methodModel.set('code', newValue);
        }

    });

    return TableCodeView;
});
