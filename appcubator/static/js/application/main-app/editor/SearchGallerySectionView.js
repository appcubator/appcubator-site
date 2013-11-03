define(function(require, exports, module) {

    'use strict';

    var EditorGallerySectionView = require('editor/EditorGallerySectionView');

    var SearchGallerySectionView = EditorGallerySectionView.extend({

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
            try {
                $(this.list).clearQueue();
            } catch (err) {}

            $(this.list).slideDown(200);
            this.isExpanded = true;
        },

    });


    return SearchGallerySectionView;
});