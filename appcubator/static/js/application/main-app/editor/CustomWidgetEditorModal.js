define(function(require, exports, module) {

    require('ace');
    require('mixins/BackboneCardView');


    var CustomWidgetEditorModal = Backbone.CardView.extend({
        className: 'custom-widget-editor',
        padding: 0,
        title: "Custom Widget Editor",
        // doneButton: true,

        events: {
            'click .sub-title': 'toggle',
        },

        initialize: function(widgetModel) {
            _.bindAll(this);
            this.model = widgetModel;
            this.render();
        },

        render: function() {
            var self = this;
            var htmlStr = this.model.get('htmlC') || '';
            var cssStr = this.model.get('cssC') || '';
            var jsStr = this.model.get('jsC') || '';

            var content = [
                '<div class="sect"><div class="sub-title" id="e-html">» HTML</div><div id="edit-html-inp" style="background-color:#eee; height: 400px; width:100%; position:relative;"></div></div>',
                '<div class="sect"><div class="sub-title" id="e-js">» JS</div><div id="edit-js-inp" style="position:relative; background-color:#eee; height: 400px; width:100%;"></div></div>',
                '<div class="sect"><div class="sub-title" id="e-css">» CSS</div><div id="edit-css-inp" style="position:relative; background-color:#eee; height: 400px; width:100%;"></div></div>',
                '<a style="position: relative; width:100%; display:block; text-align: center; padding: 8px; color: #666; margin-top:20px;" href="/resources/tutorials/custom-widget/" rel="external" target="_blank">Guide on using the Custom Widget</a>'
            ].join('\n');

            this.el.innerHTML = content;
            this.el.style.overflow = "hidden";

            this.editors = {};

            this.editors["e-css"] = ace.edit("edit-css-inp");
            this.editors["e-css"].getSession().setMode("ace/mode/css");
            this.editors["e-css"].setValue(cssStr, -1);

            this.editors["e-html"] = ace.edit("edit-html-inp");
            this.editors["e-html"].getSession().setMode("ace/mode/html");
            this.editors["e-html"].setValue(htmlStr, -1);

            this.editors["e-js"] = ace.edit("edit-js-inp");
            this.editors["e-js"].getSession().setMode("ace/mode/javascript");
            this.editors["e-js"].setValue(jsStr, -1);

            return this;
        },

        toggle: function(e) {
            if ($(e.currentTarget.parentNode).hasClass('expanded')) return this.shrink(e);
            this.$el.find('.expanded').removeClass('expanded');
            $(e.currentTarget.parentNode).addClass('expanded');
            this.editors[e.currentTarget.id].focus();
        },

        shrink: function(e) {
            $(e.currentTarget.parentNode).removeClass('expanded');
        },

        onClose: function() {
            this.model.set('cssC', this.editors["e-css"].getValue());
            this.model.set('jsC', this.editors["e-js"].getValue());
            this.model.set('htmlC', this.editors["e-html"].getValue());
            this.model.trigger('custom_edited');
        }

    });

    return CustomWidgetEditorModal;
});