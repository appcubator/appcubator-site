define([
        'models/WidgetModel'
    ],
    function(WidgetModel) {

        var GuideView = Backbone.View.extend({
            events: {

            },

            nmrLines: 0,
            horizontalLinesDict: {},
            verticalLinesDict: {},
            show: false,
            positionHorizontalGrid: 80,
            positionVerticalGrid: 15,

            initialize: function(widgetsCollection) {
                _.bindAll(this);

                var self = this;
                this.widgetsCollection = widgetsCollection;
                keyDispatcher.bind(';', this.toggleGuides);

                this.horizontalLinesDict = {};
                this.verticalLinesDict = {};

                this.listenTo(this.widgetsCollection, 'add', this.placeWidget);
                this.listenTo(this.widgetsCollection, 'remove', this.removeWidget);
            },

            render: function() {
                this.widgetsCollection.each(this.placeWidget);
                this.setupDummyLines();
            },

            placeWidget: function(widget) {
                this.placeWidgetLines(widget);
                this.listenTo(widget.get('layout'), 'change', function() {
                    this.changedPosition(widget);
                }, this);
            },

            placeWidgetLines: function(widget) {
                var layout = widget.get('layout');
                var cid = widget.cid;
                this.placeHorizontal(layout.get('top'), cid);
                this.placeHorizontal((layout.get('top') + layout.get('height')), cid);
                this.placeVertical(layout.get('left'), cid);
                this.placeVertical(layout.get('left') + layout.get('width'), cid);
            },

            setupDummyLines: function() {
                for(var ii = 0; ii <= 12; ii++) {
                    this.placeVertical(ii, "dum");
                }
            },

            removeWidget: function(widget) {

                var vKeysToOmit = [];
                _(this.verticalLinesDict).each(function(lineObj, key) {
                    lineObj.models = _.without(lineObj.models, widget.cid);
                    if (!lineObj.models.length) {
                        vKeysToOmit.push(key);
                        $(lineObj.line).remove();
                    }
                });

                this.verticalLinesDict = _.omit(this.verticalLinesDict, vKeysToOmit);

                var hKeysToOmit = [];
                _(this.horizontalLinesDict).each(function(lineObj, key) {
                    lineObj.models = _.without(lineObj.models, widget.cid);
                    if (!lineObj.models.length) {
                        $(lineObj.line).remove();
                        hKeysToOmit.push(key);
                    }
                });

                this.horizontalLinesDict = _.omit(this.horizontalLinesDict, hKeysToOmit);
            },

            changedPosition: function(widget) {

                var vKeysToOmit = [];
                _(this.verticalLinesDict).each(function(lineObj, key) {
                    lineObj.models = _.without(lineObj.models, widget.cid);
                    if (!lineObj.models.length) {
                        vKeysToOmit.push(key);
                        $(lineObj.line).remove();
                    }
                });

                this.verticalLinesDict = _.omit(this.verticalLinesDict, vKeysToOmit);

                var hKeysToOmit = [];
                _(this.horizontalLinesDict).each(function(lineObj, key) {
                    lineObj.models = _.without(lineObj.models, widget.cid);
                    if (!lineObj.models.length) {
                        $(lineObj.line).remove();
                        hKeysToOmit.push(key);
                    }
                });

                this.horizontalLinesDict = _.omit(this.horizontalLinesDict, hKeysToOmit);

                this.placeWidgetLines(widget);
            },

            placeHorizontal: function(nmr, cid) {
                var lineObj = (this.horizontalLinesDict[nmr] || {});

                if (!lineObj.line) {
                    line = document.createElement('div');
                    line.className = 'guide-line-horizontal';
                    line.style.top = (nmr * this.positionVerticalGrid) + 'px';
                    lineObj.line = line;
                    this.$el.append(line);
                }

                lineObj.models = lineObj.models || [];
                lineObj.models.push(cid);

                this.horizontalLinesDict[nmr] = lineObj;
            },

            placeVertical: function(nmr, cid) {
                var lineObj = (this.verticalLinesDict[nmr] || {});

                if (!lineObj.line) {
                    line = document.createElement('div');
                    line.className = 'guide-line-vertical';
                    line.style.left = (nmr * this.positionHorizontalGrid) + 'px';
                    lineObj.line = line;
                    this.$el.append(line);
                }

                lineObj.models = lineObj.models || [];
                lineObj.models.push(cid);

                this.verticalLinesDict[nmr] = lineObj;
            },

            showAll: function() {
                _(this.horizontalLinesDict).each(function(val, key) {
                    $(val.line).addClass('show');
                });

                _(this.verticalLinesDict).each(function(val, key) {
                    $(val.line).addClass('show');
                });
            },

            hideAll: function() {
                _(this.horizontalLinesDict).each(function(val, key) {
                    $(val.line).removeClass('show');
                });

                _(this.verticalLinesDict).each(function(val, key) {
                    $(val.line).removeClass('show');
                });
            },

            toggleGuides: function() {
                if(keyDispatcher.textEditing) return;

                if (this.show) {
                    this.hideAll();
                    this.show = false;
                } else {
                    this.showAll();
                    this.show = true;
                }
            },

            showVertical: function(coor, cid) {
                var coorRounded = Math.round(coor);
                var delta = coorRounded - coor;

                if (this.verticalLinesDict[coorRounded] && !(this.verticalLinesDict[coorRounded].models.length == 1 && this.verticalLinesDict[coorRounded].models[0] == cid)) {
                    $(this.verticalLinesDict[coorRounded].line).addClass('show');
                    if(delta > -0.15 && delta < 0.15 && this.verticalLinesDict[coorRounded].models.length != 1) return coorRounded;
                }
            },

            showHorizontal: function(coor, cid) {
                var coorRounded = Math.round(coor);
                var delta = coorRounded - coor;

                if (this.horizontalLinesDict[coorRounded] && !(this.horizontalLinesDict[coorRounded].models.length == 1 && this.horizontalLinesDict[coorRounded].models[0] == cid)) {
                    $(this.horizontalLinesDict[coorRounded].line).addClass('show');
                    if(delta > -0.5 && delta < 0.5) return coorRounded;
                }


                return null;
            },

            close: function() {
                keyDispatcher.unbind(';', this.toggleGuides);
                Backbone.View.prototype.close.call(this);
            }

        });

        return GuideView;
    });