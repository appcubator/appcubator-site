define(function(require, exports, module) {
    'use strict';
    require('backbone');

    var BaseCSSEditorView = Backbone.View.extend({

        className: 'elements basecss',
        events: {
        },

        initialize: function(themeModel) {
            _.bindAll(this);
            this.model = themeModel;
        },

        render: function() {
            var temp = [
                '<div class="base-css span40" id="base-css">'
            ].join('\n');
            this.el.innerHTML = temp;
            return this;
        },

        setupAce: function() {
            this.editor = ace.edit("base-css");
            this.editor.getSession().setMode("ace/mode/css");
            this.editor.setValue(this.model.get('basecss'), -1);
            this.editor.on("change", this.baseChanged);
        },

        baseChanged: function(e) {
          var currentCSS = this.editor.getValue();
          this.model.set('basecss', currentCSS);
        }

    });

    return BaseCSSEditorView;
});