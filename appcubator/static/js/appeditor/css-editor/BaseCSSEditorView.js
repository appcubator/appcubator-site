define(function(require, exports, module) {
    'use strict';
    require('backbone');

    var BaseCSSEditorView = Backbone.View.extend({

        className: 'elements basecss',
        events: {
        },

        doneTypingInterval: 3000,

        initialize: function(themeModel) {
            _.bindAll(this);
            this.model = themeModel;
            this.typingTimer = null;
        },

        render: function() {
            var temp = [
                '<div class="base-css" id="base-css" style="height:100%; width:100%;">'
            ].join('\n');
            this.el.innerHTML = temp;
            return this;
        },

        setupAce: function() {
            this.editor = ace.edit("base-css");
            this.editor.getSession().setMode("ace/mode/css");
            this.editor.setValue(this.model.get('basecss'), -1);
            this.editor.on("change", this.keyup);
        },

        keyup: function(e) {
            if(this.typingTimer) clearTimeout(this.typingTimer);
            this.typingTimer = setTimeout(this.baseChanged, this.doneTypingInterval);
        },

        baseChanged: function(e) {
          var currentCSS = this.editor.getValue();
          this.model.set('basecss', currentCSS);
        }

    });

    return BaseCSSEditorView;
});