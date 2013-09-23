define([
  'models/WidgetModel'
],
function(WidgetModel) {

  var GuideView = Backbone.View.extend({
    events : {

    },

    nmrLines: 0,
    horizontalLinesDict: {},
    verticalLinesDict: {},
    show: false,
    positionHorizontalGrid : 80,
    positionVerticalGrid   : 15,

    initialize: function(widgetsCollection) {
      _.bindAll(this);

      var self = this;

      this.widgetsCollection = widgetsCollection;

      keyDispatcher.bind(';', this.toggleGuides);
    },

    render: function() {
      var self = this;
      self.widgetsCollection.each(function(widget) {
        var layout = widget.get('layout');
        var cid = widget.cid;
        self.placeHorizontal(layout.get('top'), cid);
        self.placeHorizontal((layout.get('top') + layout.get('height')), cid);
        self.placeVertical(layout.get('left'), cid);
        self.placeVertical(layout.get('left') + layout.get('width'), cid);
      });
    },

    placeHorizontal: function(nmr, cid) {
      var lineObj = (this.horizontalLinesDict[nmr]||{});

      if(!lineObj.line) {
        line = document.createElement('div');
        line.className = 'guide-line-horizontal';
        line.style.top = (nmr * this.positionVerticalGrid) + 'px';
        lineObj.line = line;
        this.$el.append(line);
      }

      lineObj.models = lineObj.models||[];
      lineObj.models.push(cid);

      this.horizontalLinesDict[nmr] = lineObj;
    },

    placeVertical: function(nmr, cid) {
      var lineObj = (this.verticalLinesDict[nmr]||{});

      if(!lineObj.line) {
        line = document.createElement('div');
        line.className = 'guide-line-vertical';
        line.style.left = (nmr * this.positionHorizontalGrid) + 'px';
        lineObj.line = line;
        this.$el.append(line);
      }

      lineObj.models = lineObj.models||[];
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

    hideAll : function() {
      _(this.horizontalLinesDict).each(function(val, key) {
        $(val.line).removeClass('show');
      });

      _(this.verticalLinesDict).each(function(val, key) {
        $(val.line).removeClass('show');
      });
    },

    toggleGuides: function() {
      if(this.show) {
        this.hideAll();
        this.show = false;
      }
      else{
        this.showAll();
        this.show = true;
      }
    },

    showVertical: function(coor, cid) {
      coor = Math.round(Math.round(coor *10/10));

      if(this.verticalLinesDict[coor] &&
        !(this.verticalLinesDict[coor].models.length == 1 && this.verticalLinesDict[coor].models[0] == cid)) {
          
        $(this.verticalLinesDict[coor].line).addClass('show');
      }
    },

    showHorizontal: function(coor, cid) {
      coor = Math.round(coor*10)/10;

      if(this.horizontalLinesDict[coor] &&
        !(this.horizontalLinesDict[coor].models.length == 1 && this.horizontalLinesDict[coor].models[0] == cid)) {

        $(this.horizontalLinesDict[coor].line).addClass('show');
      }
    }

  });

  return GuideView;
});