define(function(require, exports, module) {

    'use strict';

    var SoftErrorView = require('app/SoftErrorView');
    var DialogueView = require('mixins/DialogueView');
    require('app/templates/TableTemplates');
    require('prettyCheckable');


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
        },

        render: function() {
            var funcTemplate = [
                '<div class="code-chunk">',
                '<span class="title"><%= name %></span>',
                '<div class="code-editor" id="func-editor-<%= cid %>"></div>',
                '</div>'
            ].join('\n');

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
                    '<div id="instance-methods-list">'+insStr+'</div>',
                    '<div class="add-button">+ Create a New Instance Method</div>',
                '</div>',
                '<div class="static sect">',
                    '<span class="title">Static Methods</span>',
                    '<div id="static-methods-list">'+statStr+'</div>',
                    '<div class="add-button>+ Create a New Static Method</div>',
                '</div>'
            ].join('\n');

            return this;
        },


         setupAce: function() {
            this.model.get('instancemethods').each(function(methodModel) {
                var editor = ace.edit("func-editor-" + methodModel.cid);
                editor.getSession().setMode("ace/mode/javascript");
                editor.setValue(methodModel.get('code'), -1);
            });

            var staticStr ='';
            this.model.get('staticmethods').each(function(methodModel) {
                var editor = ace.edit("func-editor-" + methodModel.cid);
                editor.getSession().setMode("ace/mode/javascript");
                editor.setValue(methodModel.get('code'), -1);
            });

            // this.editor.getSession().setMode("ace/mode/css");
            // this.editor.setValue(this.model.get('basecss'), -1);
            // this.editor.on("change", this.keyup);
        },
    
    });

    return TableCodeView;
});