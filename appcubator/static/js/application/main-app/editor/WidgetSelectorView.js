define([
        'mixins/BackboneUI',
        'util'
    ],
    function() {

        var PADDING = 2;
        var ALIGNMENT = 1;

        var WidgetSelectorView = Backbone.UIView.extend({
            className: 'editor-page',
            tagName: 'div',
            selectedEl: null,
            isMobile: false,

            positionHorizontalGrid: 80,
            positionVerticalGrid: 15,

            events: {
                'click #hover-div': 'hoverClicked',
                'click #select-div': 'doubleClicked',
                'mousedown #hover-div': 'mousedown',
                'mousedown #select-div': 'mousedown',
                'mouseup #hover-div': 'mouseup',
                'mouseup #select-div': 'mouseup'
            },

            initialize: function(widgetsCollection) {
                _.bindAll(this);

                var self = this;

                this.widgetsCollection = widgetsCollection;
                this.listenTo(this.widgetsCollection, 'add', this.bindWidget, true);
                var WidgetEditorView = require('editor/WidgetEditorView');
                this.widgetEditorView = new WidgetEditorView();
                this.widgetEditorView.isMobile = self.isMobile;

                this.widgetsCollection.each(function(widget) {
                    self.bindWidget(widget, false);
                });
                this.doKeyBindings();
            },

            mousedown: function(e) {
                mouseDispatcher.isMousedownActive = true;
            },
            mouseup: function(e) {
                mouseDispatcher.isMousedownActive = false;
            },

            render: function() {
                var self = this;

                var hoverDiv = document.createElement('div');
                hoverDiv.id = "hover-div";
                this.hoverDiv = hoverDiv;
                this.hideNode(hoverDiv);
                this.el.appendChild(hoverDiv);

                var selectDiv = document.createElement('div');
                selectDiv.id = "select-div";
                this.selectDiv = selectDiv;
                this.hideNode(selectDiv);
                this.el.appendChild(selectDiv);

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
                    snapMode: "outer"
                });

                $(selectDiv).draggable({
                    containment: "parent",
                    drag: self.moving,
                    stop: self.moved,
                    snapMode: "outer"
                });


                selectDiv.style.zIndex = "2005";
                hoverDiv.style.zIndex = "2004";
                hoverDiv.style.position = "absolute";
                selectDiv.style.position = "absolute";

                $('.page.full').on('mousedown', this.clickedPage);

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
                    if (self.selectedEl && widget && self.selectedEl.cid == widget.cid) return;
                    self.widgetUnhover(widget);
                    self.newSelected(widget);
                });

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
                this.selectDiv.style.borderWidth = 0;
                $(this.selectDiv).find('.ui-resizable-handle').hide();
            },

            makeSelectDivVisible: function(argument) {
                this.selectDiv.style.borderWidth = '';
                $(this.selectDiv).find('.ui-resizable-handle').fadeIn();
            },

            setLayout: function(node, widgetModel) {
                if (!widgetModel) return;
                $(node).show();

                node.style.width = ((widgetModel.get('layout').get('width') * 80) + PADDING) + 'px';
                node.style.height = ((widgetModel.get('layout').get('height') * 15) + PADDING) + 'px';
                node.style.left = ((widgetModel.get('layout').get('left') * 80) - ALIGNMENT) + 'px';
                node.style.top = ((widgetModel.get('layout').get('top') * 15) - ALIGNMENT) + 'px';
                return node;
            },

            widgetHover: function(widgetModel) {
                if (this.selectedEl && widgetModel.cid === this.selectedEl.cid) return;
                this.hoveredEl = widgetModel;
                this.setLayout(this.hoverDiv, widgetModel);
            },

            widgetUnhover: function(widgetModel) {
                this.hideNode(this.hoverDiv);
            },

            bindLocation: function() {},

            newSelected: function(widgetModel) {
                var self = this;
                if (this.selectedEl && this.selectedEl.cid == widgetModel.cid) {
                    this.setLayout(this.selectDiv, widgetModel);
                    return;
                }

                if (this.selectedEl) {
                    this.stopListening(widgetModel.get('layout'), 'change', self.setLayout);
                }

                this.deselect();
                this.selectedEl = widgetModel;
                this.listenTo(widgetModel.get('layout'), 'change', function() {
                    self.setLayout(self.selectDiv, widgetModel);
                });
                this.hideNode(this.hoverDiv);
                this.setLayout(this.selectDiv, widgetModel);
                this.selectDiv.appendChild(this.widgetEditorView.setModel(widgetModel).render().el);
            },

            resizing: function(e, ui) {
                var cid = this.selectedEl.cid;
                var model = this.selectedEl;

                var elem = util.get('widget-wrapper-' + cid);


                g_guides.hideAll();

                var valLeft = g_guides.showVertical(ui.position.left / this.positionHorizontalGrid, cid);
                var valRight = g_guides.showVertical((ui.position.left + ui.size.width) / this.positionHorizontalGrid, cid);

                if (valLeft) {
                    var deltaLeft = ui.position.left - (valLeft * this.positionHorizontalGrid);
                    ui.size.width = ui.size.width + deltaLeft - ALIGNMENT;
                    ui.element.width(ui.size.width + PADDING);
                    ui.position.left = (valLeft * this.positionHorizontalGrid) - ALIGNMENT;
                    ui.element.css('left', ui.position.left);
                }
                if (valRight) {
                    var deltaRight = valRight * this.positionHorizontalGrid - (ui.position.left + ui.size.width);
                    ui.size.width = ui.size.width + deltaRight  - ALIGNMENT;
                    ui.element.width(ui.size.width);
                }


                var valTop = g_guides.showHorizontal(ui.position.top / this.positionVerticalGrid, cid);
                var valBottom = g_guides.showHorizontal(ui.position.top / this.positionVerticalGrid + model.get('layout').get('height'), cid);

                if (valTop) {
                    var deltaTop = (valTop * this.positionVerticalGrid) - ui.position.top;
                }
                if (valBottom) {
                    var deltaBottom = ui.position.top = (valTop * this.positionVerticalGrid);
                }


                elem.style.width = ui.size.width + PADDING + 'px';
                elem.style.height = (ui.size.height + PADDING) + 'px';
                elem.style.left = ui.position.left + ALIGNMENT + 'px';
                elem.style.top = ui.position.top + ALIGNMENT + 'px';

            },

            resized: function(e, ui) {
                g_guides.hideAll();

                var left = Math.round((ui.position.left / this.positionHorizontalGrid));
                var top = Math.round((ui.position.top / this.positionVerticalGrid));

                if (left < 0) left = 0;
                if (top < 0) top = 0;

                var deltaHeight = Math.round((ui.size.height + 2) / this.positionVerticalGrid);
                var deltaWidth = Math.round((ui.size.width + 2) / this.positionHorizontalGrid);
                var elem = util.get('widget-wrapper-' + this.selectedEl.cid);
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
                if (e.target.id == "hover-div") {
                    model = this.hoveredEl;
                    if (!g_multiSelectorView.isEmpty()) {
                        return g_multiSelectorView.moving(e, ui, model, this.positionHorizontalGrid, this.positionVerticalGrid);
                    }
                } else {
                    model = this.selectedEl;
                    this.hideNode(this.hoverDiv);
                }

                if (!model) return;

                this.widgetEditorView.clear();

                var cid = model.cid;
                g_guides.hideAll();


                var valLeft = g_guides.showVertical(ui.position.left / this.positionHorizontalGrid, cid);
                var valRight = g_guides.showVertical(ui.position.left / this.positionHorizontalGrid + model.get('layout').get('width'), cid);

                if (valLeft) {
                    ui.position.left = valLeft * this.positionHorizontalGrid;
                }
                if (valRight) {
                    ui.position.left = (valRight - model.get('layout').get('width')) * this.positionHorizontalGrid - ALIGNMENT;
                }


                var valTop = g_guides.showHorizontal(ui.position.top / this.positionVerticalGrid, cid);
                var valBottom = g_guides.showHorizontal(ui.position.top / this.positionVerticalGrid + model.get('layout').get('height'), cid);

                if (valTop) {
                    ui.position.top = valTop * this.positionVerticalGrid;
                }
                if (valBottom) {
                    ui.position.top = (valBottom - model.get('layout').get('height')) * this.positionVerticalGrid - 2;
                }

                var elem = util.get('widget-wrapper-' + model.cid);
                elem.style.top = ui.position.top + ALIGNMENT + 'px';
                elem.style.left = ui.position.left + ALIGNMENT + 'px';
            },

            moved: function(e, ui) {
                var self = this;
                g_guides.hideAll();

                model = this.selectedEl;
                if (e.target.id == "hover-div") {
                    model = this.hoveredEl;
                    if (!g_multiSelectorView.isEmpty()) {
                        return g_multiSelectorView.moved(e, ui, model, this.positionHorizontalGrid, this.positionVerticalGrid, function() {
                            self.hideNode(self.hoverDiv);
                        });
                    }
                }

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

                this.selectDiv.appendChild(this.widgetEditorView.setModel(model).render().el);
                this.newSelected(model);
            },

            deselect: function() {
                if (this.selectedEl) {
                    this.selectedEl.trigger('deselected');
                    this.stopListening(this.selectedEl.get('layout'), 'change');
                }
                this.widgetEditorView.clear();
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
                if (!this.isMouseOn(e) || this.selectedEl.editModeOn) return;
                this.selectedEl.trigger('doubleClicked');

                if (this.selectedEl.getContent() && !this.selectedEl.isLoginForm()) {
                    this.selectedEl.trigger('startEditing');
                    this.listenTo(this.selectedEl, 'stopEditing cancelEditing', this.stoppedEditing);
                    this.selectDiv.style.height = 0;
                    this.selectDiv.style.width = 0;
                    var top = ((this.selectedEl.get('layout').get('top') * 15) - 2) + ((this.selectedEl.get('layout').get('height') * 15) + 4);
                    this.selectDiv.style.top = top + 'px';
                }
            },

            stoppedEditing: function() {
                this.setLayout(this.selectDiv, this.selectedEl);
            },

            isMouseOn: function(e) {
                var self = this;

                mouseX = e.pageX;
                mouseY = e.pageY;
                var div = $('#widget-wrapper-' + this.selectedEl.cid);
                divTop = div.offset().top;
                divLeft = div.offset().left;
                divRight = divLeft + div.width();
                divBottom = divTop + div.height();
                if (mouseX >= divLeft && mouseX <= divRight && mouseY >= divTop && mouseY <= divBottom) {
                    return true;
                }
                return false;
            },

            clear: function() {
                this.widgetEditorView.clear();
            },

            hideNode: function(node) {
                node.style.height = 0;
                node.style.width = 0;
                $(node).hide();
            },

            close: function() {
                keyDispatcher.unbind('down', this.moveSelectedDown);
                keyDispatcher.unbind('up', this.moveSelectedUp);
                keyDispatcher.unbind('left', this.moveSelectedLeft);
                keyDispatcher.unbind('right', this.moveSelectedRight);
                keyDispatcher.unbind('backspace', this.deleteSelected);
                this.deselect();
                $('.page.full').off('mousedown', this.clickedPage);

                //$(this.selectDiv).show().resizable("destroy");
                //$(this.hoverDiv).show().draggable("destroy");
                //$(this.selectDiv).show().draggable("destroy");

                Backbone.View.prototype.close.call(this);
            }

        });

        return WidgetSelectorView;

    });