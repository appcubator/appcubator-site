define(['backbone', 'jquery.freshereditor', 'mixins/BackboneUI', 'editor/editor-templates'], function() {

    'use strict';

    var WidgetView = Backbone.UIView.extend({

        el: null,
        className: 'widget-wrapper',
        tagName: 'div',
        widgetsContainer: null,
        selected: false,
        editable: false,
        editMode: false,
        shadowElem: null,
        positionHorizontalGrid: 80,
        positionVerticalGrid: 15,

        events: {
            'click': 'select',
            'click .delete': 'remove',
            'mouseover': 'hovered',
            'mouseout': 'unhovered',
            'mousedown': 'mousedown',
            'mouseup': 'mouseup'
        },

        initialize: function(widgetModel) {
            var self = this;
            _.bindAll(this);

            this.model = widgetModel;
            this.listenTo(this.model, "remove", this.close, this);

            this.listenTo(this.model.get('data'), "change:type", this.changedType, this);
            this.listenTo(this.model.get('data'), "change:tagName", this.changedType, this);
            this.listenTo(this.model.get('data'), "change:class_name", this.changedTagName, this);

            this.listenTo(this.model.get('layout'), "change:width", this.changedSize, this);
            this.listenTo(this.model.get('layout'), "change:height", this.changedSize, this);
            this.listenTo(this.model.get('layout'), "change:top", this.changedTop, this);
            this.listenTo(this.model.get('layout'), "change:left", this.changedLeft, this);
            this.listenTo(this.model.get('layout'), "change:isFull", this.toggleFull, this);
            this.listenTo(this.model.get('layout'), "change:alignment", this.changedAlignment, this);
            this.listenTo(this.model.get('layout'), "change", this.changedPadding, this);

            this.listenTo(this.model.get('data'), "change:content", this.changedText, this);

            this.listenTo(this.model.get('data').get('content_attribs'), "change:src", this.changedSource, this);
            this.listenTo(this.model.get('data').get('content_attribs'), "change:value", this.changedValue, this);
            this.listenTo(this.model.get('data').get('content_attribs'), "change:style", this.changedStyle, this);

            this.listenTo(this.model, "startEditing", this.switchEditModeOn, this);
            this.listenTo(this.model, "deselected", function() {
                this.model.trigger('stopEditing');
            }, this);
            this.listenTo(this.model, "stopEditing", this.switchEditModeOff);
            this.listenTo(this.model, "cancelEditing", this.cancelEditing);

            keyDispatcher.bind('meta+return', function() {
                self.model.trigger('stopEditing');
            });
            keyDispatcher.bind('esc', function() {
                self.model.trigger('cancelEditing');
            });

        },

        setFreeMovement: function() {
            this.positionVerticalGrid = 1;
            this.positionHorizontalGrid = 1;
        },

        render: function() {
            this.arrangeLayout();
            this.el.innerHTML = this.renderElement();
            this.innerEl = this.el.firstChild;
            this.$innerEl = $(this.innerEl);

            return this;
        },

        arrangeLayout: function() {
            var width = this.model.get('layout').get('width');
            var height = this.model.get('layout').get('height');

            this.el.id = 'widget-wrapper-' + this.model.cid;

            this.setTop((this.positionVerticalGrid) * (this.model.get('layout').get('top')));
            this.setLeft((this.positionHorizontalGrid) * (this.model.get('layout').get('left')));
            this.setHeight(height * (this.positionVerticalGrid));

            if (this.positionHorizontalGrid == 80) this.el.className += " span" + width;
            else this.setWidth(width * this.positionHorizontalGrid);

            this.el.style.textAlign = this.model.get('layout').get('alignment');

            if (this.model.get('layout').has('l_padding')) {
                this.el.style.paddingLeft = this.model.get('layout').get('l_padding') + 'px';
            }

            if (this.model.get('layout').has('r_padding')) {
                this.el.style.paddingRight = this.model.get('layout').get('r_padding') + 'px';
            }

            if (this.model.get('layout').has('t_padding')) {
                this.el.style.paddingTop = this.model.get('layout').get('t_padding') + 'px';
            }

            if (this.model.get('layout').has('b_padding')) {
                this.el.style.paddingBottom = this.model.get('layout').get('b_padding') + 'px';
            }

            if (this.model.isFullWidth()) this.switchOnFullWidth();
            if (this.model.isBgElement()) this.el.style.zIndex = 999;
        },

        reRender: function() {
            this.el.innerHTML = this.renderElement();
            this.innerEl = this.el.firstChild;
            this.$innerEl = $(this.innerEl);

            return this;
        },

        renderElement: function() {
            var el = "";
            console.log(this.model);

            if(this.model.has('html')) {
                var temp = this.model.get('html');
                var cont = {};
                
                if(this.model.has('style')) {
                    _.extend(cont, this.model.get('style').serialize());
                }

                el = _.template(temp, cont);
            }

            return el;
        },

        select: function(e) {
            if (!this.editMode) {
                this.model.trigger('selected');
                this.el.style.zIndex = 2003;
                if (this.model.isBgElement()) this.el.style.zIndex = 1000;
            }
        },

        changedWidth: function(a) {
            this.el.style.width = '';
            this.el.className = 'selected widget-wrapper ';
            var width = this.model.get('layout').get('width');
            if (this.positionHorizontalGrid == 80) this.el.className += " span" + width;
            else this.setWidth(width * this.positionHorizontalGrid);
        },

        changedAlignment: function() {
            this.el.style.textAlign = this.model.get('layout').get('alignment');
        },

        changedPadding: function() {
            this.el.style.paddingTop = this.model.get('layout').get('t_padding') + 'px';
            this.el.style.paddingBottom = this.model.get('layout').get('b_padding') + 'px';
            this.el.style.paddingLeft = this.model.get('layout').get('l_padding') + 'px';
            this.el.style.paddingRight = this.model.get('layout').get('r_padding') + 'px';
        },

        toggleFull: function(argument) {
            if (this.model.get('layout').get('isFull') === true) {
                this.switchOnFullWidth();
            } else {
                this.switchOffFullWidth();
            }
        },

        switchOnFullWidth: function() {
            $('#full-container').append(this.el);
            this.disableResizeAndDraggable();
            this.el.className = 'selected widget-wrapper spanFull';
            this.setLeft(0);
            this.fullWidth = true;
        },

        switchOffFullWidth: function() {
            this.fullWidth = false;
            $('#elements-container').append(this.el);
            this.render();
        },

        changedSize: function() {
            this.changedHeight();
            this.changedWidth();
        },

        changedHeight: function(a) {
            this.setHeight(this.model.get('layout').get('height') * (this.positionVerticalGrid));
        },

        changedTop: function(a) {
            this.setTop((this.positionVerticalGrid) * (this.model.get('layout').get('top')));
        },

        changedLeft: function(a) {
            this.setLeft((this.positionHorizontalGrid) * (this.model.get('layout').get('left')));
        },

        changedText: function(a) {
            var content = this.model.get('data').get('content').replace(/\n\r?/g, '<br />');
            this.el.firstChild.innerHTML = content;
        },

        changedValue: function(a) {
            this.el.firstChild.value = this.model.get('data').get('content_attribs').get('value');
        },

        changedType: function(a) {
            this.el.firstChild.className = this.model.get('data').get('class_name');
        },

        changedTagName: function(a) {
            this.reRender();
        },

        changedSource: function(a) {
            this.el.firstChild.src = this.model.get('data').get('content_attribs').get('src');
        },

        changedStyle: function() {
            this.el.firstChild.setAttribute('style', this.model.get('data').get('content_attribs').get('style'));
            this.el.firstChild.style.lineHeight = '1em';
        },

        staticsAdded: function(files) {
            _(files).each(function(file) {
                file.name = file.filename;
                statics.push(file);
            });
            this.model.get('data').get('content_attribs').set('src', _.last(files).url);
            //this.show(this.model);
        },

        hovered: function() {
            if (this.editMode || mouseDispatcher.isMousedownActive) return;
            if (this.model.isBgElement()) return;
            this.hovered = true;
            this.model.trigger('hovered');
        },

        unhovered: function(e) {
            if (this.isMouseOn(e)) return;
            this.model.trigger('unhovered');
        },

        isMouseOn: function(e) {
            var self = this;

            var mouseX = e.pageX;
            var mouseY = e.pageY;
            var div = $('#widget-wrapper-' + this.model.cid);
            if (!div.offset()) return false;

            var divTop = div.offset().top;
            var divLeft = div.offset().left;
            var divRight = divLeft + div.width();
            var divBottom = divTop + div.height();

            if (mouseX >= divLeft && mouseX <= divRight && mouseY >= divTop && mouseY <= divBottom) {
                $('#hover-div').bind('mouseout', function(e) {
                    self.unhovered(e);
                    $(e.target).unbind('mouseout');
                });
                return true;
            }

            return false;
        },

        switchEditModeOn: function() {
            if (this.model.get('data').get('content')) {
                this.editMode = true;

                //var el = $(this.el.firstChild);
                this.el.firstChild.style.zIndex = 2003;
                this.$el.addClass('textediting');
                //el.attr('contenteditable', 'true');
                //el.focus();

                var excludes = [
                    'removeFormat',
                    'insertheading1',
                    'insertheading2',
                    'insertheading3',
                    'insertheading4',
                    'fontname',
                    'code',
                    'superscript',
                    'subscript',
                    'forecolor',
                    'backcolor',
                    'strikethrough',
                    'insertimage',
                    'insertparagraph',
                    'blockquote',
                    'justifyfull'
                ];

                if(this.model.isBuyButton()) {
                    excludes = _.union(excludes, [
                        'FontSize',
                        'justifyleft',
                        'justifyright',
                        'justifycenter',
                        'createlink',
                        'bold',
                        'italic',
                        'underline',
                        'insertunorderedlist',
                        'insertorderedlist'
                    ]);
                }
                
                this.$innerEl.freshereditor({
                    toolbar_selector: ".widget-editor",
                    excludes: excludes
                });
                this.$innerEl.freshereditor("edit", true);
                util.selectText(this.$innerEl);

                keyDispatcher.textEditing = true;
            }

        },

        switchEditModeOff: function(e) {
            if (e) e.preventDefault();
            if (this.editMode === false) return;

            this.editMode = false;
            this.$el.removeClass('textediting');
            var val = this.$innerEl.html();
            this.$innerEl.freshereditor("edit", false);
            this.model.get('data').set('content', val);


            keyDispatcher.textEditing = false;
            util.unselectText();
        },

        cancelEditing: function() {
            if (this.editMode === false) return;

            this.editMode = false;
            this.$el.removeClass('textediting');
            var el = $(this.el.firstChild);
            this.model.get('data').trigger('change:content');
            el.attr('contenteditable', 'false');
            keyDispatcher.textEditing = false;
            util.unselectText();
        },

        autoResize: function(hGrid, vGrid) {
            var horizontalGrid = (hGrid || this.positionHorizontalGrid);
            var verticalGrid = (vGrid || this.positionVerticalGrid);

            var node = this.el.firstChild;

            var height = $(node).outerHeight(true);
            var width = $(node).outerWidth(true);

            if (this.model.isImage()) {
                width = Math.max(240, width);
                height = Math.max(150, height);
            }

            var nHeight = Math.ceil(height / verticalGrid);
            var nWidth = Math.ceil((width + 30) / horizontalGrid);

            if (horizontalGrid == 1 && verticalGrid == 1) {
                nHeight = (nHeight < 30) ? 30 : nHeight;
                nWidth = (nWidth < 120) ? 120 : nWidth;

                if (this.model.isBuyButton()) {
                    nWidth = 260;
                    nHeight = 40;
                }

            } else {
                if (nWidth + this.model.get('layout').get('left') > 12) {
                    nWidth = 12 - this.model.get('layout').get('left');
                }
            }

            if (!nHeight) nHeight = 2;
            if (!nWidth) nWidth = 2;

            this.model.get('layout').set('width', nWidth);
            this.model.get('layout').set('height', nHeight);
        },

        autoResizeVertical: function(hGrid, vGrid) {
            var verticalGrid = (vGrid || this.positionVerticalGrid);

            var node = this.el.firstChild;

            var height = $(node).outerHeight(true);

            var nHeight = Math.ceil(height / verticalGrid);

            if (verticalGrid == 1) {
                nHeight = (nHeight < 30) ? 30 : nHeight;
            }
            if (!nHeight) nHeight = 2;

            this.model.get('layout').set('height', nHeight);
        },

        mousedown: function(e) {
            mouseDispatcher.isMousedownActive = true;
        },
        mouseup: function() {
            mouseDispatcher.isMousedownActive = false;
        }

    });

    return WidgetView;
});
