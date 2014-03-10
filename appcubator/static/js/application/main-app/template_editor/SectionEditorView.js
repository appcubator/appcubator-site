define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('util');

    var WidgetSettingsView = require('editor/WidgetSettingsView');

    var SectionEditorView = Backbone.View.extend({

        widgetsContainer: null,

        events: {
            'keyup .class_name'     : 'classNameChaged',
            'click .remove-section' : 'removeSection',
            'click .settings'       : 'openSettingsView'
        },

        className: "section-editor-view",

        initialize: function(sectionModel) {
            _.bindAll(this);
            this.model = sectionModel;
            this.listenTo(this.model, 'hovered', this.hovered);
            this.listenTo(this.model, 'unhovered', this.unhovered);
            this.listenTo(this.model, 'remove', this.close);
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
                            '<li><span class="option-button delete-button tt remove-section"></span><div class="option-button settings"></div></li>',
                            // '<li class="remove-section"><a>Remove Section</a></li>',
                        '</ul>',
                    '</div>'].join('\n');

            var data = this.model.toJSON();
            data.className = data.className || "";

            this.el.innerHTML = _.template(template, data);

            this.$el.find('.dropdown-menu input').click(function(event){
                event.stopPropagation();
            });
            this.$el.find('.dropdown-toggle').dropdown();

            this.pageWrapper = document.getElementById('page-wrapper');
            var iframe = v1.currentApp.view.iframe;
            this.iframe = iframe;
            this.iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            this.setPosition();

            return this;
        },

        setPosition: function() {
            var $el = $(this.iframeDoc).find('[data-cid="' + this.model.cid + '"]');
            var el = $el[0];

            var positionRightTop = util.getRightTop(el, document.getElementById('page-wrapper'), self.iframe, self.iframeDoc);
            this.el.style.left = (positionRightTop.right - 90) + 'px';
            this.el.style.top = (positionRightTop.top + 60) + 'px';
        },

        classNameChaged: function(e) {
            var value = e.currentTarget.value;
            this.model.set('className', value);
        },

        openSettingsView: function() {
            new WidgetSettingsView(this.model).render();
        },

        removeSection: function() {
            this.model.collection.remove(this.model);
        },

        hovered: function() {
            this.setPosition();
            this.$el.show();
        },

        unhovered: function() {
            this.$el.hide();
        }

    });

    return SectionEditorView;
});
