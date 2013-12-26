define(function(require, exports, module) {

    'use strict';

    var SoftErrorView = require('app/SoftErrorView');
    var DialogueView = require('mixins/DialogueView');
    require('app/templates/TableTemplates');
    require('prettyCheckable');


    var TableDataView = Backbone.View.extend({
        el: null,
        tagName: 'div',
        collection: null,
        parentName: "",
        className: 'entity-pane',
        subviews: [],

        events: {
        },


        initialize: function(tableModel) {
            _.bindAll(this);
            this.model = tableModel;
        },

        render: function() {
            var insStr ='';
            this.model.get('instancemethods').each(function(methodModel) {
                insStr += '<div id="func-editor-'+methodModel.cid+'"></div>';
            });

            var staticStr ='';
            this.model.get('staticmethods').each(function(methodModel) {
                staticStr += '<div id="func-editor-'+methodModel.cid+'"></div>';
            });

            this.el.innerHTML = '<div id="instance-methods-list">'+insStr+'</div><div id="static-methods-list">'+staticStr+'</div>';

            return this;
        },


         setupAce: function() {
            this.model.get('instancemethods').each(function(methodModel) {
                var editor = ace.edit("func-editor-" + methodModel.cid);
                editor.setValue(methodModel.get('code'), -1);
            });

            var staticStr ='';
            this.model.get('staticmethods').each(function(methodModel) {
                var editor = ace.edit("func-editor-" + methodModel.cid);
                editor.setValue(methodModel.get('code'), -1);
            });

            // this.editor.getSession().setMode("ace/mode/css");
            // this.editor.setValue(this.model.get('basecss'), -1);
            // this.editor.on("change", this.keyup);
        },
    
    });

    return TableDataView;
});