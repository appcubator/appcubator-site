define(function(require, exports, module) {

    'use strict';

    var EditorGallerySectionView = require('editor/EditorGallerySectionView');

    var SearchGallerySectionView = EditorGallerySectionView.extend({

        className: 'search elements-panel',

        render: function() {
            if (this.el) {
                this.el.innerHTML = '';
            }
            this.list = document.createElement('ul');
            this.el.appendChild(this.list);
            this.list.style = '';

            return this;
        },

        expand: function() {
            if(this.isExpanded) return;
            this.$el.addClass("open");
            this.isExpanded = true;
        },

        hide: function() {
            if(!this.isExpanded) return;
            this.isExpanded = false;
            this.$el.removeClass("open");
        },

        clear: function() {
            this.list.innerHTML = '';
        }

    });


    return SearchGallerySectionView;
});