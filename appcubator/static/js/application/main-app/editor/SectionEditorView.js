define(function(require, exports, module) {

    'use strict';
    var WidgetView = require('editor/WidgetView');
    var WidgetContainerView = require('editor/WidgetContainerView');
    var WidgetModel = require('models/WidgetModel');
    var WidgetListView = require('editor/WidgetListView');
    var WidgetFormView = require('editor/WidgetFormView');
    var WidgetCustomView = require('editor/WidgetCustomView');
    var CustomWidgetEditorModal = require('editor/CustomWidgetEditorModal');
    require('backbone');
    require('util');


    var SectionEditorView = Backbone.View.extend({

        widgetsContainer: null,

        events: {
            'keyup .class_name'     : 'classNameChaged',
            'click .remove-section' : 'removeSection'
        },

        className: "section-editor-view",

        subviews: [],

        initialize: function(sectionModel) {
            _.bindAll(this);
            this.model = sectionModel;
        },

        render: function() {
            var template = [
                    '<input type="text" class="class_name" value="<%= className %>">',
                    '<div class="remove-section"></div>'].join('\n');

            this.el.innerHTML = _.template(template, this.model.toJSON());
            return this;
        },

        classNameChaged: function(e) {
            var value = e.currentTarget.value;
            this.model.set('className', value);
        },

        removeSection: function() {
            this.model.collection.remove(this.model);
        }

    });

    return SectionEditorView;
});