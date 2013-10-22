define(function(require, exports, module) {

    'use strict';

    var SelectView = require('mixins/SelectView');

    var WidgetClassPickerView = SelectView.extend({
        className: 'class-picker select-view',
        id: 'class-editor',
        tagName: 'div',
        css: 'widget-editor',

        events: {
            'click li': 'select',
            'click .updown-handle': 'selectCurrent',
            'mouseover li': 'hovered',
            'mouseover .updown-handle': 'hovered'
        },

        initialize: function(widgetModel) {
            _.bindAll(this);

            this.model = widgetModel;

            var type = this.model.get('data').get('nodeType');
            var currentClass = this.model.get('data').get('class_name');
            var currentVal = -1;

            if (widgetModel.hasForm()) {
                type = "forms";
            }

            if (widgetModel.isList()) {
                type = "lists";
            }

            this.list = _.map(uieState[type], function(obj, key) {
                if (obj.class_name == currentClass) {
                    currentVal = key;
                }
                return {
                    name: obj.class_name,
                    val: key
                };
            });

            this.uieVals = uieState[type];
            this.isNameVal = true;
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
            if (e.currentTarget.className == "updown-handle") {
                this.model.get('data').set('tagName', this.uieVals[this.currentVal.val].tagName);
                this.model.get('data').set('class_name', this.uieVals[this.currentVal.val].class_name);
                return;
            }
            var ind = String(e.currentTarget.id).replace('li-' + this.cid + '-', '');
            this.model.get('data').set('tagName', this.uieVals[this.list[ind].val].tagName);
            this.model.get('data').set('class_name', this.uieVals[this.list[ind].val].class_name);
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