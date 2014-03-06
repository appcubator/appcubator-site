define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('util');
    var CustomWidgetEditorModal = require('template_editor/CustomWidgetEditorModal');

    var SectionEditorView = Backbone.View.extend({

        widgetsContainer: null,

        events: {
            'keyup .class_name'     : 'classNameChaged',
            'click .remove-section' : 'removeSection'
        },

        className: "section-editor-view",

        initialize: function(sectionModel) {
            _.bindAll(this);
            this.model = sectionModel;
        },

        render: function() {
            var template = [
                    '<div class="btn-group">',
                        '<div class="button dropdown-toggle" data-toggle="dropdown">',
                        '<img width="24" class="icon" src="/static/img/edit.png"><span class="caret"></span>',
                        '</div>',
                        '<ul class="dropdown-menu pull-right action-menu" role="menu">',
                            '<li><a><input type="text" class="class_name" value="<%= className %>" placeholder="Class Name"></a></li>',
                            '<li class="divider"></li>',
                            '<li class="remove-section"><a>Remove Section</a></li>',
                        '</ul>',
                    '</div>'].join('\n');

            var data = this.model.toJSON();
            data.className = data.className || "";

            this.el.innerHTML = _.template(template, data);

            this.$el.find('.dropdown-menu input').click(function(event){
                event.stopPropagation();
            });
            this.$el.find('.dropdown-toggle').dropdown();

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
