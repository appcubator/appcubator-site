define([
        'editor/WidgetEditorView',
        'editor/MultiSelectorView',
        'mixins/BackboneUI',
        'util'
    ],
    function(WidgetEditorView,
        MultiSelectorView) {

        var MarqueeView = Backbone.UIView.extend({
            className: 'marquee-view',
            tagName: 'div',
            isDrawing: false,

            origin: {
                x: 0,
                y: 0
            },
            clientOrigin: {
                x: 0,
                y: 0
            },
            events: {},
            subviews: [],

            initialize: function(widgetsCollection) {
                _.bindAll(this);

                this.widgetsCollection = widgetsCollection;

                this.multiSelectorView = new MultiSelectorView();
                g_multiSelectorView = this.multiSelectorView;
                this.subviews.push(this.multiSelectorView);
            },

            mousedown: function(e) {
                if (mouseDispatcher.isMousedownActive) {
                    return true;
                }

                this.$el.show();
                this.isDrawing = true;

                var coorX = e.pageX;
                var coorY = e.pageY;
                var dist = this.getPageTopLeft();
                coorX -= dist.left;
                coorY -= dist.top;
                coorY -= $(document.body).scrollTop();

                this.setTop(coorY);
                this.setLeft(coorX);
                this.setWidth(6);
                this.setHeight(6);

                this.origin.x = coorX;
                this.origin.y = coorY;

                this.clientOrigin.x = e.clientX;
                this.clientOrigin.y = e.clientY;
            },

            mouseup: function(e) {
                if (this.isDrawing == false) return;

                var Xcor = e.clientX;
                var Ycor = e.clientY;
                var arr = this.widgetsCollection.filter(function(widget) {
                    var elem = document.getElementById('widget-wrapper-' + widget.cid);
                    return util.isRectangleIntersectElement(this.clientOrigin.x, this.clientOrigin.y, Xcor, Ycor, elem);
                }, this);

                this.isDrawing = false;
                this.setZero();

                if (arr.length == 1) {
                    arr[0].trigger('selected');
                } else if (arr.length > 1) {
                    this.multiSelectorView.setContents(arr);
                }
            },

            mousemove: function(e) {
                if (keyDispatcher.textEditing !== true) e.returnValue = false;
                if (!this.isDrawing) return;

                var coorX = e.pageX;
                var coorY = e.pageY;
                var dist = this.getPageTopLeft();
                coorX -= dist.left;
                coorY -= dist.top;
                coorY -= $(document.body).scrollTop();

                if (coorX < 0 || coorY < 0) {
                    return;
                }

                var distWidth = this.origin.x - coorX;
                var distHeight = this.origin.y - coorY;
                var diffWidth = Math.abs(this.origin.x - coorX);
                var diffHeight = Math.abs(this.origin.y - coorY);

                this.iterateWidgets(this.clientOrigin.x, this.clientOrigin.y, e.clientX, e.clientY);

                this.setWidth(diffWidth);
                if (distWidth == diffWidth) {
                    this.setLeft(this.origin.x - diffWidth);
                } else {
                    this.setLeft(this.origin.x);
                }

                this.setHeight(diffHeight);
                if (distHeight == diffHeight) {
                    this.setTop(this.origin.y - diffHeight);
                } else {
                    this.setTop(this.origin.y);
                }

            },

            iterateWidgets: function(Xorigin, Yorigin, Xcor, Ycor) {

                this.currentPage = v1.currentApp.getCurrentPage();
                if (Xcor % 3 >= 1 & Ycor % 3 >= 1) return;

                this.widgetsCollection.each(function(widget) {
                    var elem = document.getElementById('widget-wrapper-' + widget.cid);
                    if (util.isRectangleIntersectElement(Xorigin, Yorigin, Xcor, Ycor, elem)) {
                        $(elem).addClass('red-border');
                    } else {
                        $(elem).removeClass('red-border');
                    }
                });

            },

            setZero: function() {

                this.isDrawing = false;

                this.$el.hide();
                this.setWidth(0);
                this.setHeight(0);

                this.widgetsCollection.each(function(widget) {
                    var elem = document.getElementById('widget-wrapper-' + widget.cid);
                    $(elem).removeClass('red-border');
                });
            },

            render: function() {
                document.body.addEventListener('mouseup', this.mouseup, true);
                document.body.addEventListener('mousedown', this.mousedown, true);
                document.body.addEventListener('mousemove', this.mousemove, true);
                this.el.className = 'marquee-view';
                this.el.id = 'marquee-view';
                this.container = document.body;
                this.setZero();
                this.multiSelectorView.render();
                return this;
            },

            getPageTopLeft: function() {
                var rect = this.container.getBoundingClientRect();
                var docEl = document.documentElement;
                return {
                    left: rect.left + (document.body.pageXOffset || docEl.scrollLeft || 0),
                    top: rect.top + (document.body.pageYOffset || docEl.scrollTop || 0)
                };
            },

            close: function() {
                window.removeEventListener('mouseup', this.mouseup);
                
                document.body.removeEventListener('mousedown', this.mousedown);
                document.body.removeEventListener('mousemove', this.mousemove);

                Backbone.View.prototype.close.call(this);
            }

        });

        return MarqueeView;

    });