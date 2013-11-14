define(function(require, exports, module) {
    'use strict';

    require('mixins/BackboneModal');


    var UIElementEditingView = Backbone.View.extend({
        tagName: 'div',
        className: 'element-view hoff2',
        width: 660,
        padding: 0,

        events: {
            'click .delete-elem': 'deleteElement'
        },

        initialize: function(uieModel) {
            _.bindAll(this);

            this.model = uieModel;

            this.model.bind('change:style', this.renderStyleTags);
            this.model.bind('change:hoverStyle', this.renderStyleTags);
            this.model.bind('change:activeStyle', this.renderStyleTags);
        },

        render: function() {
            var tempPane = [
                '<div class="sect"><h4>Normal State</h4><div id="style-<%= cid %>" class="style style-editor" placeholder="Styling here..."></div></div>',
                '<div class="sect"><h4>Hover State</h4><div id="hover-style-<%= cid %>" class="hover-style style-editor"></div></div>',
                '<div class="sect"><h4>Active State</h4><div id="active-style-<%= cid %>" class="active-style style-editor"></div></div>'
            ].join('\n');

            var form = _.template(tempPane, {
                info: this.model.attributes,
                cid: this.model.cid
            });
            console.log(form);
            this.el.innerHTML = form;
            return this;
        },

        setUpAce: function() {
            this.styleEditor = ace.edit("style-" + this.model.cid);
            this.styleEditor.getSession().setMode("ace/mode/css");
            this.styleEditor.setValue(this.model.get('style'), -1);
            this.styleEditor.getSession().on('change', this.styleChanged);

            this.hoverStyleEditor = ace.edit("hover-style-" + this.model.cid);
            this.hoverStyleEditor.getSession().setMode("ace/mode/css");
            this.hoverStyleEditor.setValue(this.model.get('hoverStyle'), -1);
            this.hoverStyleEditor.getSession().on('change', this.hoverStyleChanged);

            this.activeStyleEditor = ace.edit("active-style-" + this.model.cid);
            this.activeStyleEditor.getSession().setMode("ace/mode/css");
            this.activeStyleEditor.setValue(this.model.get('activeStyle'), -1);
            this.activeStyleEditor.getSession().on('change', this.activeStyleChanged);

        },

        deleteElement: function() {
            var self = this;
            this.model.collection.remove(self.model.cid);
            this.closeModal();
        },

        styleChanged: function(e) {
            var value = this.styleEditor.getValue();
            this.model.set('style', value);
        },

        hoverStyleChanged: function(e) {
            var value = this.hoverStyleEditor.getValue();
            console.log(value);
            console.log("YOLO");
            console.log(this.model);
            this.model.set('hoverStyle', value);
        },

        activeStyleChanged: function(e) {
            var value = this.activeStyleEditor.getValue();
            this.model.set('activeStyle', value);
        }

    });

    return UIElementEditingView;
});