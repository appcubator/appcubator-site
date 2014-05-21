define(function(require, exports, module) {

    'use strict';
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
            _.each(this.items, function(item) {
                if (item.text.toLowerCase().indexOf(str.toLowerCase()) > -1) {
                    results.push(item);
                }
            });

            return results;
        };


    }

    return Searcher;
});
