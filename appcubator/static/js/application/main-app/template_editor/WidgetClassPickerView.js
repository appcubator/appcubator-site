define(function(require, exports, module) {

    'use strict';

    var SelectView = require('mixins/SelectView');

    var WidgetClassPickerView = SelectView.extend({
        className: 'class-picker select-view',
        id: 'class-editor',
        tagName: 'div',
        css: 'widget-editor',

        events: {
            'click li'                : 'select',
            'click .updown-handle'    : 'selectCurrent',
            'mouseover li'            : 'hovered',
            'mouseover .updown-handle': 'hovered'
        },

        initialize: function(widgetModel) {
            _.bindAll(this);

            this.model = widgetModel;
            var type = this.model.get('type');
            var currentClass = this.model.get('className');
            var currentVal = -1;

            var els = top.v1UIEState.getUIEVals(type).toJSON();

            this.list = _.map(els, function(obj, key) {
                if (obj.class_name == currentClass) {
                    currentVal = key;
                }
                return {
                    name: obj.class_name,
                    val: key
                };
            });

            this.uieVals = els;
            this.isNameVal = true;

            if (currentClass == "") {
                currentClass = '<i>No Class Selected</i>';
            };
            this.currentVal = {
                name: currentClass,
                val: currentVal
            };

            this.render();
        },

        render: function() {
            WidgetClassPickerView.__super__.render.call(this);
            this.expand();
            this.hide();
        },

        hovered: function(e) {
            if (e.currentTarget.className == "updown-handle" && this.uieVals[this.currentVal.val]) {
                this.model.set('tagName',   this.uieVals[this.currentVal.val].tagName);
                this.model.set('className', this.uieVals[this.currentVal.val].class_name);
                return;
            }

            if(!this.list[ind]) return;

            var ind = String(e.currentTarget.id).replace('li-' + this.cid + '-', '');
            this.model.set('tagName', this.uieVals[this.list[ind].val].tagName);
            this.model.set('className', this.uieVals[this.list[ind].val].class_name);
        },

        show: function() {
            this.$el.fadeIn();
        },

        hide: function() {
            this.$el.hide();
        }
    });

    return WidgetClassPickerView;
});
