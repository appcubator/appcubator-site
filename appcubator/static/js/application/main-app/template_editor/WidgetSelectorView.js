define(function(require, exports, module) {

    'use strict';


    require('mixins/BackboneUI');
    require('jquery-ui');
    require('util');

    var PADDING = 2;
    var ALIGNMENT = 1;

    var WidgetSelectorView = Backbone.UIView.extend({
        className: 'editor-page',
        tagName: 'div',
        selectedEl: null,
        isMobile: false,

        events: {
            // 'click #hover-div': 'hoverClicked',
            // 'click #select-div': 'doubleClicked',
            // 'mousedown #hover-div': 'mousedown',
            // 'mousedown #select-div': 'selectMousedown',
            // 'mouseup #hover-div': 'mouseup',
            // 'mouseup #select-div': 'mouseup'
        },

        initialize: function(widgetsCollection) {
            _.bindAll(this);
            var self = this;
            this.widgetsCollection = widgetsCollection;
            this.listenTo(this.widgetsCollection, 'add', this.bindWidget, true);
            this.widgetEditorView = v1.currentApp.view.widgetEditorView;
            this.widgetEditorView.isMobile = self.isMobile;

            this.widgetsCollection.each(function(widget) {
                self.bindWidget(widget, false);
            });
            this.doKeyBindings();
        },

        selectMousedown: function(e) {
            //if(!this.isMouseOn(e)) { return true; }
            this.mousedown();
        },

        mousedown: function(e) {
            //g_marqueeView.setZero();
            mouseDispatcher.isMousedownActive = true;
        },

        mouseup: function(e) {
            mouseDispatcher.isMousedownActive = false;
        },

        render: function() {
            var self = this;

            this.elContainer = this.el.getElementById('elements-container');

            var hoverDiv = document.createElement('div');
            hoverDiv.id = "hover-div";
            this.hoverDiv = hoverDiv;
            this.hideNode(hoverDiv);
            // this.elContainer.appendChild(hoverDiv);

            var selectDiv = document.createElement('div');
            selectDiv.id = "select-div";
            this.selectDiv = selectDiv;
            this.hideNode(selectDiv);
            // this.elContainer.appendChild(selectDiv);

            $(selectDiv).resizable({
                handles: "n, e, s, w, nw, ne, sw, se",
                containment: "parent",
                resize: self.resizing,
                stop: self.resized
            });

            $(hoverDiv).draggable({
                containment: "parent",
                drag: self.moving,
                stop: self.moved,
                snapMode: "outer",
                iframeFix: true
            });

            $(selectDiv).draggable({
                containment: "parent",
                drag: self.moving,
                stop: self.moved,
                snapMode: "outer",
                cancel: '#widget-editor',
                iframeFix: true
            });


            selectDiv.style.zIndex = "2005";
            hoverDiv.style.zIndex = "2004";
            //hoverDiv.style.position = "absolute";
            //selectDiv.style.position = "absolute";

            $(document).on('mousedown', this.clickedPage);

            return this;
        },

        bindWidget: function(widget, isNew) {
            var self = this;

            this.listenTo(widget, 'remove', function() {
                self.deselect();
            });

            this.listenTo(widget, 'hovered', function() {
                self.widgetHover(widget);
            });

            this.listenTo(widget, 'unhovered', function() {
                self.widgetUnhover(widget);
            });

            this.listenTo(widget, 'selected', function() {
                self.widgetUnhover(widget);
                self.newSelected(widget);
            });

            this.listenTo(widget, 'doubleClicked', this.doubleClicked);

            this.listenTo(widget, 'deselect', function() {
                self.deselect();
            });

            this.listenTo(widget, 'editModeOn', function(position) {
                self.unbindAll(position);
            });

            if (isNew) {
                widget.trigger('selected');
            }
        },

        unbindAll: function(position) {
            var widget = this.selectedEl;
            widget.on('editModeOff', function() {
                this.bindWidget(widget);
                this.setLayout(this.selectDiv, this.selectedEl);
                this.makeSelectDivVisible();
            }, this);

            this.stopListening(widget, 'hovered');
            this.stopListening(widget, 'unhovered');
            this.stopListening(widget, 'selected');
            this.makeSelectDivInvisible();
            this.selectDiv.style.left = (((widget.get('layout').get('width') + widget.get('layout').get('left')) * 80) + 4) + 'px';
            if (position == "left") {
                this.selectDiv.style.left = (((widget.get('layout').get('left')) * 80) - 16) + 'px';
            }
        },

        makeSelectDivInvisible: function() {
            this.selectDiv.style.height = 0;
            this.selectDiv.style.width = 0;
            $(this.selectDiv).hide();
        },

        makeSelectDivVisible: function(argument) {
            $(this.selectDiv).fadeIn();
        },

        hideHoverDiv: function() {
            this.hideLayout(this.hoverDiv);
        },

        setLayout: function(node, widgetModel) {
            if (!widgetModel) return;
            $(node).show();

            var $element = $(document).find("[data-cid='" + widgetModel.cid + "']");
            var element = $element[0];
            if(!element) return;

            // var offsetFrame = util.getWindowRelativeOffset(window.document, window);
            var offset = util.getWindowRelativeOffset(window.document, element);

            var leftDist = offset.left; // + offsetFrame.left;
            var topDist = offset.top + $(window).scrollTop();

            // node.style.width =  $element.outerWidth() + 'px';
            // node.style.height = $element.outerHeight() + 'px';
            // node.style.left = (leftDist) + 'px';
            // node.style.top = (topDist) + 'px';

            return node;
        },

        hideLayout: function(node) {
            $(node).hide();
            node.style.width = '0px';
            node.style.height = '0px';
            node.style.left = '0px';
            node.style.top = '0px';
            return node;
        },

        widgetHover: function(widgetModel) {
            if (g_marqueeView.isDrawing) return;
            if (this.selectedEl && widgetModel.cid === this.selectedEl.cid) return;
            // if (g_multiSelectorView.contains(widgetModel)) return;
            this.hoveredEl = widgetModel;
            //this.setLayout(this.hoverDiv, widgetModel);
        },

        widgetUnhover: function(widgetModel) {
            this.hideNode(this.hoverDiv);
        },

        bindLocation: function() {},

        newSelected: function(widgetModel) {
            var self = this;
            
            if (this.selectedEl && this.selectedEl.cid == widgetModel.cid) {
                this.setLayout(this.selectDiv, widgetModel);
                this.selectedEl.trigger('reselected');
                return;
            }

            this.deselect();
            this.selectedEl = widgetModel;
            this.hideNode(this.hoverDiv);
            // this.setLayout(this.selectDiv, widgetModel);
            this.widgetEditorView.setModel(widgetModel).display();
        },

        resizing: function(e, ui) {
            var cid = this.selectedEl.cid;
            var model = this.selectedEl;

            var elem = this.el.getElementById('widget-wrapper-' + cid);

            elem.style.width = (ui.size.width + PADDING) + 'px';
            elem.style.height = (ui.size.height + PADDING) + 'px';
            elem.style.left = (ui.position.left + ALIGNMENT) + 'px';
            elem.style.top = (ui.position.top + ALIGNMENT) + 'px';

        },

        resized: function(e, ui) {
            // g_guides.hideAll();

            var left = Math.round((ui.position.left / this.positionHorizontalGrid));
            var top = Math.round((ui.position.top / this.positionVerticalGrid));

            if (left < 0) left = 0;
            if (top < 0) top = 0;

            var deltaHeight = Math.round((ui.size.height + 2) / this.positionVerticalGrid);
            var deltaWidth = Math.round((ui.size.width + 2) / this.positionHorizontalGrid);
            var elem = this.el.getElementById('widget-wrapper-' + this.selectedEl.cid);
            elem.style.width = '';
            elem.style.height = '';

            if (deltaHeight <= 0) deltaHeight = 1;
            if (deltaWidth <= 0) deltaWidth = 1;

            this.selectedEl.get('layout').set('width', deltaWidth);
            this.selectedEl.get('layout').set('height', deltaHeight);
            this.selectedEl.get('layout').set('left', left);
            this.selectedEl.get('layout').set('top', top);
            this.setLayout(this.selectDiv, this.selectedEl);

            if (this.selectedEl.getRow()) this.selectedEl.getRow().resizeElements(deltaWidth);
        },

        moving: function(e, ui) {
            var model = null;

            if (e.target.id == "hover-div") {
                model = this.hoveredEl;
                // if (!g_multiSelectorView.isEmpty()) {
                //     return g_multiSelectorView.moving(e, ui, model, this.positionHorizontalGrid, this.positionVerticalGrid);
                // }
            } else {
                model = this.selectedEl;
                this.hideNode(this.hoverDiv);
            }

            if (!model) return;

            this.widgetEditorView.hide();

            var cid = model.cid;

            var elem = this.el.getElementById('widget-wrapper-' + model.cid);
            elem.style.top = ui.position.top + ALIGNMENT + 'px';
            elem.style.left = ui.position.left + ALIGNMENT + 'px';
        },

        moved: function(e, ui) {

            var self = this;
            //g_guides.hideAll();

            var model = this.selectedEl;
            if (e.target.id == "hover-div") {
                model = this.hoveredEl;
                if (!g_multiSelectorView.isEmpty()) {
                    return g_multiSelectorView.moved(e, ui, model, this.positionHorizontalGrid, this.positionVerticalGrid, function() {
                        self.hideNode(self.hoverDiv);
                    });
                }
            }

            this.hideHoverDiv();

            var top = Math.round((ui.position.top / this.positionVerticalGrid));
            var left = Math.round((ui.position.left / this.positionHorizontalGrid));

            if (left < 0) left = 0;
            if (top < 0) top = 0;

            if (model.get('layout').get('left') == left) {
                model.get('layout').trigger('change:left');
            } else {
                model.get('layout').set('left', left);
            }

            if (model.get('layout').get('top') == top) {
                model.get('layout').trigger('change:top');
            } else {
                model.get('layout').set('top', top);
            }

            this.newSelected(model);
        },

        deselect: function() {
            if (this.selectedEl) {
                this.selectedEl.trigger('deselected');
                this.stopListening(this.selectedEl.get('layout'), 'change');
            }

            this.selectedEl = null;
            this.hideNode(this.selectDiv);
            this.hideNode(this.hoverDiv);
        },

        moveSelectedDown: function(e) {
            if (!this.selectedEl) return;
            if (keyDispatcher.textEditing === true) return;
            if (this.selectedEl.getRow() && this.selectedEl.editMode === true) return;


            // if(this.selectedEl.getBottom() > v1State.getCurrentPage().getHeight()) {
            v1State.getCurrentPage().trigger('scroll', this.selectedEl);
            // }

            this.selectedEl.moveDown();
            e.preventDefault();
        },

        moveSelectedUp: function(e) {
            if (!this.selectedEl) return;
            if (keyDispatcher.textEditing === true) return;
            if (this.selectedEl.getRow() && this.selectedEl.editMode === true) return;

            this.selectedEl.moveUp();
            e.preventDefault();
        },

        moveSelectedLeft: function(e) {
            if (!this.selectedEl) return;
            if (keyDispatcher.textEditing === true) return;
            if (this.selectedEl.getRow() && this.selectedEl.editMode === true) return;

            this.selectedEl.moveLeft();
            e.preventDefault();
        },

        moveSelectedRight: function(e) {
            if (!this.selectedEl) return;
            if (keyDispatcher.textEditing === true) return;
            if (this.selectedEl.getRow() && this.selectedEl.editMode === true) return;

            this.selectedEl.moveRight();
            e.preventDefault();
        },

        deleteSelected: function(e) {
            if (!this.selectedEl) return;
            if (keyDispatcher.textEditing === true) return;
            if (this.selectedEl.getRow() && this.selectedEl.editMode === true) return;

            this.selectedEl.remove();
            e.preventDefault();
        },

        doKeyBindings: function() {
            keyDispatcher.bind('down', this.moveSelectedDown);
            keyDispatcher.bind('up', this.moveSelectedUp);
            keyDispatcher.bind('left', this.moveSelectedLeft);
            keyDispatcher.bind('right', this.moveSelectedRight);
            keyDispatcher.bind('backspace', this.deleteSelected);
        },

        hoverClicked: function(e) {
            if (this.hoveredEl) {
                this.hoveredEl.trigger('selected');
            }
            mouseDispatcher.isMousedownActive = false;
        },

        clickedPage: function(e) {
            if (this.selectedEl && !this.isMouseOn(e) && !mouseDispatcher.isMousedownActive) {
                this.deselect();
            }
        },

        doubleClicked: function(e) {
            //if (!this.isMouseOn(e) || this.selectedEl.editModeOn) return;

            if (this.selectedEl.getContent() && !this.selectedEl.isLoginForm()) {
                this.selectedEl.trigger('startEditing');
                this.listenTo(this.selectedEl, 'stopEditing cancelEditing', this.stoppedEditing);
                this.makeSelectDivInvisible();
            }

            if (this.selectedEl.isBox()) {
                util.guideText(e, "You should drop some text here.");
            }
        },

        stoppedEditing: function() {
            this.makeSelectDivVisible();
            this.setLayout(this.selectDiv, this.selectedEl);
        },

        isMouseOn: function(e) {
            if (!this.selectedEl) return false;

            var self = this;

            var mouseX = e.pageX;
            var mouseY = e.pageY;

            var div = $(document).find("[data-cid='" + this.selectedEl.cid + "']");
            if(!div.length) return;
            var divTop = div.offset().top;
            var divLeft = div.offset().left;
            var divRight = divLeft + div.width();
            var divBottom = divTop + div.height();
            if (mouseX >= divLeft && mouseX <= divRight && mouseY >= divTop && mouseY <= divBottom) {
                return true;
            }
            return false;
        },

        clear: function() {
            this.widgetEditorView.clear();
        },

        hideNode: function(node) {
            // node.style.height = 0;
            // node.style.width = 0;
            // $(node).hide();
        },

        close: function() {
            keyDispatcher.unbind('down', this.moveSelectedDown);
            keyDispatcher.unbind('up', this.moveSelectedUp);
            keyDispatcher.unbind('left', this.moveSelectedLeft);
            keyDispatcher.unbind('right', this.moveSelectedRight);
            keyDispatcher.unbind('backspace', this.deleteSelected);
            this.deselect();
            $(document).off('mousedown', this.clickedPage);

            Backbone.View.prototype.close.call(this);
        }

    });

    return WidgetSelectorView;

});
