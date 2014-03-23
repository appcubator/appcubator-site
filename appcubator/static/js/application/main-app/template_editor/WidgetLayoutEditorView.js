define([
        'editor/WidgetClassPickerView'
    ],
    function(WidgetClassPickerView) {

        var ToolTipHints = {
            "a-left": "Align left",
            "a-center": "Align center",
            "a-right": "Align right",
            "padding-tb": "Top-Bottom Padding",
            "padding-lr": "Left-Right Padding",
            "pick-style": "Click to add a style"
        };


        var WidgetLayoutEditorView = Backbone.View.extend({
            el: document.getElementById('layout-editor'),
            className: 'w-section layout-editor',
            events: {
                'click .a-pick': 'changeAlignment',
                'click .padding': 'changePadding',
                'click #delete-widget': 'deleteWidget',
                'mouseover .tt': 'showToolTip',
                'mouseout .tt': 'hideToolTip'
            },

            initialize: function(widgetModel) {
                _.bindAll(this);

                this.model = widgetModel;
                this.render();
            },


            changeAlignment: function(e) {
                $('.selected', '.alignment-picker').removeClass('selected');
                var direction = (e.target.className).replace(' a-pick', '');
                direction = direction.replace(' tt', '');
                direction = direction.replace('a-', '');

                this.model.get('layout').set('alignment', direction);
                e.target.className += ' selected';
            },

            changePadding: function(e) {
                var padding = (e.target.id).replace('padding-', '');
                $(e.target).toggleClass('selected');


                if (padding == "tb") {
                    if ($(e.target).hasClass('selected')) {
                        this.model.get('layout').set('t_padding', 15);
                        this.model.get('layout').set('b_padding', 15);
                    } else {
                        this.model.get('layout').set('t_padding', 0);
                        this.model.get('layout').set('b_padding', 0);
                    }
                } else {
                    if ($(e.target).hasClass('selected')) {
                        this.model.get('layout').set('r_padding', 15);
                        this.model.get('layout').set('l_padding', 15);
                    } else {
                        this.model.get('layout').set('r_padding', 0);
                        this.model.get('layout').set('l_padding', 0);
                    }
                }
            },

            render: function() {
                var self = this;
                this.el.appendChild(this.renderPaddingInfo());
                this.el.appendChild(this.renderLayoutInfo());
            },

            renderLayoutInfo: function() {
                var aLeft = this.model.has('layout') && this.model.get('layout').get('alignment') == "left" ? " selected" : "";
                var aCenter = this.model.has('layout') && this.model.get('layout').get('alignment') == "center" ? " selected" : "";
                var aRight = this.model.has('layout') && this.model.get('layout').get('alignment') == "right" ? " selected" : "";

                var div = document.createElement('div');
                div.className = "alignment-picker";
                div.innerHTML += '<div class="a-left a-pick tt' + aLeft + '" id="a-left"></div><div class="a-center a-pick tt' + aCenter + '" id="a-center"></div><div class="a-right a-pick tt' + aRight + '" id="a-right"></div>';
                return div;
            },

            renderPaddingInfo: function() {
                var paddingLR = this.model.has('layout') && this.model.get('layout').get('r_padding') > 0 ? "selected" : "";
                var paddingTB = this.model.has('layout') && this.model.get('layout').get('b_padding') > 0 ? "selected" : "";

                var div = document.createElement('div');
                div.className = "padding-picker right";
                div.innerHTML += '<div class="padding tb tt ' + paddingTB + '" id="padding-tb"></div><div class="padding lr tt ' + paddingLR + '" id="padding-lr"></div>';
                return div;
            },

            showToolTip: function(e) {
                if (this.toolTip) {
                    $(this.toolTip).remove();
                }

                var div = document.createElement('div');
                div.className = "tool-tip-box fadeIn";
                var text = ToolTipHints[e.target.id];
                if (text) {
                    div.innerHTML = text;
                    this.toolTip = div;
                    this.el.appendChild(div);
                }

            },

            hideToolTip: function(e) {
                if (this.toolTip) {
                    $(this.toolTip).remove();
                }
            },

            deleteWidget: function() {
                this.model.remove();
            },

            clear: function() {
                this.el.innerHTML = '';
                this.model = null;
                this.remove();
            }
        });

        return WidgetLayoutEditorView;
    });