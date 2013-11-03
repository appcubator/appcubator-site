define(function(require, exports, module) {

    'use strict';

    var FooterEditorView = require('editor/FooterEditorView');
    require('backbone');

    function Searcher() {

        this.items = [];

        this.register = function(id, className, text, icon) {
            this.items.push({
                id: id,
                className: className,
                text: text,
                icon: icon
            });
        };

        this.search = function(str) {

            var results = [];
            _.each(function(item) {
                if (item.text.indexOf(str) > -1) {
                    results.push(item);
                }
            });

            return item;
        };


    }

    return Searcher;
});