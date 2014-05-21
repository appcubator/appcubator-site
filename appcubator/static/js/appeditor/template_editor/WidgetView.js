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
            'mouseout' : 'unhovered',
            'mousedown': 'mousedown',
            'mouseup'  : 'mouseup'
        },

        initialize: function(widgetModel) {
            var self = this;
            _.bindAll(this);

            this.model = widgetModel;
            this.listenTo(this.model, "remove", this.close, this);

            this.listenTo(this.model, "rerender", this.reRender, this);
            this.listenTo(this.model, "change", this.reRender, this);

            if(this.model.has('layout')) {
                this.listenTo(this.model.get('layout'), "change", this.changedPadding, this);
            }

            this.listenTo(this.model, "startEditing", this.switchEditModeOn, this);

            this.listenTo(this.model, "deselected", function() {
                this.model.trigger('stopEditing');
                this.$el.removeClass('selected');
                this.selected = false;
            }, this);

            this.listenTo(this.model, "selected", function() {
                this.$el.addClass('selected');
            });

            this.listenTo(this.model, "stopEditing", this.switchEditModeOff);
            this.listenTo(this.model, "cancelEditing", this.cancelEditing);

            this.listenTo(this.model, "highlight", this.highlight);
            this.listenTo(this.model, "unhighlight", this.unhighlight);
            this.listenTo(this.model, "startEditingRow", this.switchRowEditorOn);
            this.listenTo(this.model, "stopEditingRow", this.switchRowEditorOff);

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

            var $e = $('[data-cid="'+ this.model.cid +'"]');
            if ($e.length) {
                this.setElement($e, true);
            }
            else {
                var expanded = this.model.expand();
                this.setElement($(expanded.html), true);
                this.placeCSS(expanded);
                this.placeJS(expanded);
            }

            // var spin = util.addLoadingSpin(this.el);
            // var expanded = this.model.safeExpand();

            // this.setElement(this.renderElement(expanded), true);
            this.$el.addClass("widget-wrapper");
            // this.$el.data('cid', this.model.cid);

            // this.$el.on('click', function(e) { e.preventDefault(); });
            // this.$el.find('a').on('click', function(e) { e.preventDefault(); });
            
            return this;
        },

        reRender: function() {
            var expanded = this.model.expand();
            var $el = $(expanded.html);

            this.$el.replaceWith($el);
            this.setElement($el, true);
            this.placeCSS(expanded);
            this.placeJS(expanded);
            this.$el.addClass(this.className);

            this.$el.find('a').on('click', function(e) { e.preventDefault(); });
            this.$el.find('form').on('submit', function(e) { e.preventDefault(); });

            return this;
        },

        renderElement: function(expanded) {
            var html = "";
            if (!expanded.html || expanded.html == "") {
                expanded.html = "Custom Widget";
            }
            return expanded.html;
        },

        placeCSS: function(expanded) {

            var styleTag = document.getElementById('custom-css-widget-' + this.model.cid);
            if (styleTag) $(styleTag).remove();

            var style = document.createElement('style');
            style.id = 'custom-css-widget-' + this.model.cid;
            style.type = 'text/css';

            var css = expanded.css;
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            document.getElementsByTagName('head')[0].appendChild(style);
        },

        placeJS: function(expanded) {

            if(!expanded.js || expanded.js === '') return;

            var self = this;

            this.model.trigger('selected');

            var jsTag = 'custom-js-widget-' + this.model.cid;
            if (jsTag) $(jsTag).remove();

            var appendJSTag = function() {

                var customJSTemp = [
                    'try {',
                    '<%= code %>',
                    '} catch(err) { console.log("Error executing custom js: "+ err); }',
                ].join('\n');

                try {
                    jsTag = document.createElement('script');
                    jsTag.id = 'custom-js-widget-' + self.model.cid;
                    jsTag.setAttribute("type", "text/javascript");

                    jsTag.text = _.template(customJSTemp, { code: expanded.js });

                    console.log(jsTag);
                    document.body.appendChild(jsTag);
                } catch (err) {
                    console.log('Error adding custom js:' + err);
                }
            };

            setTimeout(function() { $(document).ready(appendJSTag); }, 3000);
            // this.listenTo(v1, 'editor-loaded', appendJSTag, this);
        },

        select: function(e) {
            if (this.selected && !this.editMode) {
                this.model.trigger('doubleClicked');
                return;
            }

            if (!this.editMode) {
                this.model.trigger('selected');
                this.el.style.zIndex = 2003;
                this.selected = true;
            }
        },

        changedAlignment: function() {
            this.el.style.textAlign = this.model.get('layout').get('alignment');
        },

        staticsAdded: function(files) {
            _(files).each(function(file) {
                file.name = file.filename;
                statics.push(file);
            });
            this.model.set('src', _.last(files).url);
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

            if (this.model.get('content') && this.el.childNodes.length < 2) {
                this.editMode = true;

                //var el = $(this.el.firstChild);
                this.el.style.zIndex = 2003;
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

                this.$el.freshereditor({
                    toolbar_selector: ".widget-editor",
                    excludes: excludes
                });
                this.$el.freshereditor("edit", true);
                util.selectText(this.$el);

                keyDispatcher.textEditing = true;
            }

        },

        switchEditModeOff: function(e) {
            if (e) e.preventDefault();
            if (this.editMode === false) return;

            this.editMode = false;
            this.$el.removeClass('textediting');
            var val = this.$el.html();
            this.$el.freshereditor("edit", false);
            this.model.set('content', val);

            keyDispatcher.textEditing = false;
            util.unselectText();
        },

        cancelEditing: function() {
            if (this.editMode === false) return;

            this.editMode = false;
            this.$el.removeClass('textediting');
            var el = $(this.el.firstChild);
            this.model.trigger('change:content');
            el.attr('contenteditable', 'false');
            keyDispatcher.textEditing = false;
            util.unselectText();
        },

        switchRowEditorOn: function () {

            this.model.get('row').get('columns').each(function(columnModel) {

                var self = this;
                var $col = this.$el.find('[data-cid="'+columnModel.cid+'"]');
                $col.attr('data-rowcolumn', "true");
                $col.sortable({
                    connectWith: "[data-rowcolumn]",
                    update: function() {
                        self.updatedRowCol(columnModel, $col);
                    },
                    sort: function(e, ui) {
                        var amt = $(window).scrollTop();
                        ui.position.top += amt;
                    },
                    start: function(e, ui) {
                        self.highlightCols();
                    },
                    stop: function(e, ui) {
                        self.unhighlightCols();
                    }
                });

            }, this);

        },

        switchRowEditorOff: function () {

            this.reRender();
            this.model.get('row').get('columns').each(function(columnModel) {
                var $col = this.$el.find('[data-cid="'+columnModel.cid+'"]');
                $col.attr('data-rowcolumn', "true");
                if ($col.hasClass('ui-sortable')) {
                    $col.sortable("destroy");
                }
            }, this);

        },

        updatedRowCol: function (columnModel, $col) {
            var newArr = $col.sortable( "toArray", {attribute  : "data-cid"});
            var curArr = _(columnModel.get('uielements').models).pluck('cid');

            if(!_.isEqual(curArr, newArr)) {

                _.each(newArr, function(elCid, ind) {

                    var widgetModel = {};

                    if (columnModel.get('uielements').get(elCid)) {
                        widgetModel = columnModel.get('uielements').get(elCid);
                    }
                    else {
                        var coll = this.model.getWidgetsCollection();
                        widgetModel = coll.get(elCid);
                        widgetModel.collection.remove(widgetModel, { silent: true });
                        columnModel.get('uielements').add(widgetModel, { silent: true });
                    }

                }, this);

            }
        },

        highlightCols: function() {
            this.$el.find('.ycol').addClass("fancy-borders");
        },

        unhighlightCols: function() {
            this.$el.find('.ycol').removeClass("fancy-borders");
        },

        highlight: function () {

            var $el = this.$el;
            if (this.$el.find('.row').length) { $el = this.$el.find('.row').first(); }

            var position = $el.offset();

            var topDiv = document.createElement('div');
            topDiv.style.top = 0;
            topDiv.style.width = "100%";
            topDiv.style.height = position.top + "px";
            topDiv.className = "shadow-elem";

            var bottomDiv = document.createElement('div');
            bottomDiv.style.top = ($el.outerHeight() + position.top)  + "px";
            bottomDiv.style.width = "100%";
            bottomDiv.style.height = "100%";
            bottomDiv.className = "shadow-elem";

            var leftDiv = document.createElement('div');
            leftDiv.style.top = position.top + "px";
            leftDiv.style.left = 0;
            leftDiv.style.width = position.left + "px";
            leftDiv.style.height = $el.outerHeight()+ "px";
            leftDiv.className = "shadow-elem";

            var rightDiv = document.createElement('div');
            rightDiv.style.top = position.top + "px";
            rightDiv.style.left = (position.left + $el.outerWidth()) + "px";
            rightDiv.style.width = "100%";
            rightDiv.style.height = $el.outerHeight()+ "px";
            rightDiv.className = "shadow-elem";

            this.highlightDivs = [topDiv, bottomDiv, leftDiv, rightDiv];

            $el.append(topDiv);
            $el.append(bottomDiv);
            $el.append(leftDiv);
            $el.append(rightDiv);

            this.$el.removeClass('widget-wrapper');

        },

        unhighlight: function () {
            _.each(this.highlightDivs, function(el) {
                $(el).remove();
            });
            this.$el.addClass("widget-wrapper");
        },

        mousedown: function(e) {
            mouseDispatcher.isMousedownActive = true;
        },

        mouseup: function() {
            mouseDispatcher.isMousedownActive = false;
        },

        close: function() {
        	this.stopListening();
        	WidgetView.__super__.close.call(this);
        }

    });

    return WidgetView;
});
