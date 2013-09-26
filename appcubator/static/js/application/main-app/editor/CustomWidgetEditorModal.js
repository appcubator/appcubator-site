define([
        'mixins/BackboneModal',
        'ace'
    ],
    function() {

        var CustomWidgetEditorModal = Backbone.ModalView.extend({
            className: 'custom-widget-editor',
            width: 540,
            height: 540,
            padding: 0,
            title: "Custom Widget Editor",
            doneButton: true,

            events: {
                'click .sub-title' : 'toggle',
            },

            initialize: function(widgetModel) {
                _.bindAll(this);
                this.model = widgetModel;
                this.render();
            },

            render: function() {
                var self = this;
                var htmlStr = this.model.get('data').get('htmlC') || '';
                var cssStr = this.model.get('data').get('cssC') || '';
                var jsStr = this.model.get('data').get('jsC') || '';

                var content = [
                    '<div class="sect"><div class="sub-title">» HTML</div><div id="edit-html-inp" style="background-color:#eee; height: 300px; width:540px; position:relative;"></div></div>',
                    '<div class="sect"><div class="sub-title">» JS</div><div id="edit-js-inp" style="position:relative; background-color:#eee; height: 300px; width:540px;"></div></div>',
                    '<div class="sect"><div class="sub-title">» CSS</div><div id="edit-css-inp" style="position:relative; background-color:#eee; height: 300px; width:540px;"></div></div>',
                    '<a style="width:100%; display:block; text-align: center; padding: 8px; color: #666;" href="/resources/tutorial/custom-widget/" rel="external" target="_blank">Guide on using the Custom Widget</a>'
                ].join('\n');

                this.el.innerHTML = content;

                this.CSSeditor = ace.edit("edit-css-inp");
                this.CSSeditor.getSession().setMode("ace/mode/css");
                this.CSSeditor.setValue(cssStr, -1);

                this.HTMLeditor = ace.edit("edit-html-inp");
                this.HTMLeditor.getSession().setMode("ace/mode/html");
                this.HTMLeditor.setValue(htmlStr, -1);

                this.JSeditor = ace.edit("edit-js-inp");
                this.JSeditor.getSession().setMode("ace/mode/javascript");
                this.JSeditor.setValue(jsStr, -1);

                return this;
            },

            toggle: function(e) {
                if($(e.currentTarget.parentNode).hasClass('expanded')) return this.shrink(e);
                this.$el.find('.expanded').removeClass('expanded');
                $(e.currentTarget.parentNode).addClass('expanded');
            },

            shrink: function(e) {
                $(e.currentTarget.parentNode).removeClass('expanded');
            },

            onClose: function() {
                this.model.get('data').set('cssC', this.CSSeditor.getValue());
                this.model.get('data').set('jsC', this.JSeditor.getValue());
                this.model.get('data').set('htmlC', this.HTMLeditor.getValue());
                this.model.trigger('custom_edited');
            }

        });

        return CustomWidgetEditorModal;
    });