define(function(require, exports, module) {
    'use strict';

    require('mixins/BackboneModal');

    var UIElementEditingView = Backbone.View.extend({
        
        tagName: 'div',
        className: 'element-view',

        events: {
            'click .delete-elem': 'deleteElement'
        },

        initialize: function(options) {
            _.bindAll(this);

            this.model = options.model;
            console.log(this.model);
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

        setupAce: function() {
            console.log(this.el);
            console.log($("#style-" + this.model.cid));
            var self = this;

            console.trace();
            setTimeout(function() {

                var cid = self.model.cid;
                console.log(cid);
                console.log(self.model.get('style'));
                console.log(self.model);

                self.styleEditor = ace.edit("style-" + cid);
                self.styleEditor.getSession().setMode("ace/mode/css");
                self.styleEditor.setValue(self.model.get('style'), -1);
                self.styleEditor.getSession().on('change', self.styleChanged);

                self.hoverStyleEditor = ace.edit("hover-style-" + cid);
                self.hoverStyleEditor.getSession().setMode("ace/mode/css");
                self.hoverStyleEditor.setValue(self.model.get('hoverStyle'), -1);
                self.hoverStyleEditor.getSession().on('change', self.hoverStyleChanged);

                self.activeStyleEditor = ace.edit("active-style-" + cid);
                self.activeStyleEditor.getSession().setMode("ace/mode/css");
                self.activeStyleEditor.setValue(self.model.get('activeStyle'), -1);
                self.activeStyleEditor.getSession().on('change', self.activeStyleChanged);

            });

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