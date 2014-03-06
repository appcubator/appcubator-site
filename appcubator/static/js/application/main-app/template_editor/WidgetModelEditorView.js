define(function(require, exports, module) {

    'use strict';

    require('backbone');
    var ModelEditorView = require('app/ModelEditorView');

    var WidgetModelEditorView = Backbone.View.extend({

        className: 'widget-model-editor-table',
        subviews: [],

        events: {
            'click .switch-json'  : 'renderJSONAttributes',
            'click .switch-table' : 'renderAttributes',
            'click .update-json'  : 'updateJSON'
        },


        initialize: function(model) {
            _.bindAll(this);
            this.model = model;
            // this.listenTo(this.model, 'change', this.changed);
        },


        render: function (argument) {
            this.renderJSONAttributes();

            return this;
        },

        renderAttributes: function() {
            
            this.$el.find('.current-content').html('');

            var template = [
                '<div id="name-editor" class="sub-settings">',
                    '<div class="btn-group right">',
                        '<button type="button" class="btn btn-default switch-json">',
                        'JSON View',
                        '</button>',
                    '</div>',
                '</div>'].join('\n');

            this.$el.html(template);

            var modelEditorView = new ModelEditorView(this.model);
            this.el.appendChild(modelEditorView.render().el);
        },

        renderJSONAttributes: function() {
            this.$el.find('.current-content').html('');

            var template = [
                '<div id="name-editor" class="sub-settings">',
                    '<div class="btn-group">',
                        '<span class="btn update-json">Update</span>',
                    '</div>',
                    '<div class="btn-group right">',
                        '<button type="button" class="btn btn-default switch-table">',
                        'Table View',
                        '</button>',
                    '</div>',
                '</div>',
                '<div id="json-editor-model" style="height:450px; width: 100%; margin-top:0px;"></div>'
                ].join('\n');

            this.$el.html(template);
            setTimeout(this.setupAce, 300);
        },

        setupAce: function() {
            var json = this.model.toJSON();
            var json_str = JSON.stringify(json, {}, 4);

            this.editor = ace.edit("json-editor-model");
            this.editor.getSession().setMode("ace/mode/json");
            this.editor.setValue(String(json_str), -1);
        },

        updateJSON: function(e) {
            var newJSON = this.editor.getValue();
            var obj = jQuery.parseJSON(newJSON);
            this.model.updateJSON(obj);
            e.currentTarget.innerHTML = 'Updated';
            var timer = setTimeout(function() {
                 e.currentTarget.innerHTML = 'Update';
                 clearTimeout(timer);
            }, 2000);
        }

    });

    return WidgetModelEditorView;

});
