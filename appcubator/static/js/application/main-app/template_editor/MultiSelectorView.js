define([
        'mixins/BackboneUI',
        'util'
    ],
    function() {

        var WidgetSelectorView = Backbone.UIView.extend({
            className: 'multi-selector',
            tagName: 'div',
            contents: [],

            events: {
                // 'click #hover-div'     : 'hoverClicked',
                // 'click #select-div'    : 'doubleClicked',
                // 'mousedown #hover-div' : 'mousedown',
                // 'mousedown #select-div': 'mousedown',
                // 'mouseup #hover-div'   : 'mouseup',
                // 'mouseup #select-div'  : 'mouseup'
            },

            initialize: function() {
                _.bindAll(this);
                var self = this;
                this.doKeyBindings();
            },

            setContents: function(arr) {
                this.unselectAll();
                this.contents = arr;
                this.selectAll();
            },

            // mousedown: function(e) { mouseDispatcher.isMousedownActive = true; },
            // mouseup  : function(e) { mouseDispatcher.isMousedownActive = false; },

            render: function() {
                $(window).on('mousedown', this.clickedPage);
                return this;
            },

            bindWidget: function(widget) {

            },

            unbindAll: function() {},


            moveSelectedDown: function(e) {
                if (!this.contents.length) return;
                if (keyDispatcher.textEditing === true) return;
                _(this.contents).each(function(widgetModel) {
                    widgetModel.moveDown();
                });

                e.preventDefault();
            },

            moveSelectedUp: function() {
                if (!this.contents.length) return;
                if (keyDispatcher.textEditing === true) return;
                _(this.contents).each(function(widgetModel) {
                    widgetModel.moveUp();
                });
            },

            moveSelectedLeft: function() {
                if (!this.contents.length) return;
                if (keyDispatcher.textEditing === true) return;
                _(this.contents).each(function(widgetModel) {
                    widgetModel.moveLeft();
                });
            },

            moveSelectedRight: function() {
                if (!this.contents.length) return;
                if (keyDispatcher.textEditing === true) return;
                _(this.contents).each(function(widgetModel) {
                    widgetModel.moveRight();
                });
            },

            moving: function(e, ui, model ,pHorizontalGrid, pVerticalGrid) {
                var cid = model.cid;
                g_guides.hideAll();

                var deltaTop = (model.get('layout').get('top') * pVerticalGrid) - ui.position.top;
                var deltaLeft = (model.get('layout').get('left') * pHorizontalGrid) - ui.position.left;

                _.each(this.contents, function(wModel) {
                    var elem = util.get('widget-wrapper-' + wModel.cid);
                    var topPosition = (wModel.get('layout').get('top') * pVerticalGrid)  - deltaTop;
                    var leftPosition = (wModel.get('layout').get('left') * pHorizontalGrid) - deltaLeft;
                    elem.style.top = topPosition + 'px';
                    elem.style.left = leftPosition + 'px';
                });

            },

            moved: function(e, ui, model ,pHorizontalGrid, pVerticalGrid, hideHoverDivFn) {

                var deltaTop = (model.get('layout').get('top') * pVerticalGrid) - ui.position.top;
                var deltaLeft = (model.get('layout').get('left') * pHorizontalGrid) - ui.position.left;

                var deltaTopUnit = Math.round(deltaTop / pVerticalGrid);
                var deltaLeftUnit =  Math.round(deltaLeft / pHorizontalGrid);

                _.each(this.contents, function(wModel) {

                    var top = wModel.get('layout').get('top') - deltaTopUnit;
                    var left = wModel.get('layout').get('left') - deltaLeftUnit;

                    if (left < 0) left = 0;
                    if (top < 0) top = 0;

                    if (wModel.get('layout').get('left') == left) {
                        wModel.get('layout').trigger('change:left');
                    } else {
                        wModel.get('layout').set('left', left);
                    }

                    if (wModel.get('layout').get('top') == top) {
                        wModel.get('layout').trigger('change:top');
                    } else {
                        wModel.get('layout').set('top', top);
                    }

                });

                hideHoverDivFn.call(this);
            },

            deleteSelected: function(e) {
                if (!this.contents.length) return;
                if (keyDispatcher.textEditing === true) return;
                e.preventDefault();
                _(this.contents).each(function(widgetModel) {
                    widgetModel.remove();
                });
            },

            doKeyBindings: function() {
                keyDispatcher.bind('down', this.moveSelectedDown);
                keyDispatcher.bind('up', this.moveSelectedUp);
                keyDispatcher.bind('left', this.moveSelectedLeft);
                keyDispatcher.bind('right', this.moveSelectedRight);
                keyDispatcher.bind('backspace', this.deleteSelected);
            },

            selectAll: function() {
                _(this.contents).each(function(widgetModel) {
                    $('#widget-wrapper-' + widgetModel.cid).addClass('red-border');
                });
            },

            unselectAll: function() {
                _(this.contents).each(function(widgetModel) {
                    widgetModel.trigger('deselect');
                    $('#widget-wrapper-' + widgetModel.cid).removeClass('red-border');
                });
            },

            isEmpty: function() {

                return this.contents.length === 0;
            },

            empty: function() {
                this.contents = [];
                this.unselectAll();
            },

            clickedPage: function(e) {
                if(mouseDispatcher.isMousedownActive === true) return;
                this.empty();
            },

            contains: function(widgetModel) {
                return _.contains(this.contents, widgetModel);
            },

            remove: function() {
                keyDispatcher.unbind('down', this.moveSelectedDown);
                keyDispatcher.unbind('up', this.moveSelectedUp);
                keyDispatcher.unbind('left', this.moveSelectedLeft);
                keyDispatcher.unbind('right', this.moveSelectedRight);
                keyDispatcher.unbind('backspace', this.deleteSelected);
                $(window).off('mousedown', this.clickedPage);
                Backbone.View.prototype.remove.call(this);
            }
        });

        return WidgetSelectorView;

    });