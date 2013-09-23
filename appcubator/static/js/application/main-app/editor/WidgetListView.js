define([
  'editor/WidgetContainerView',
  'editor/WidgetView',
  'editor/list-editor/ListWidgetSelectorView',
  'dicts/constant-containers',
  'editor/editor-templates'
],
function( WidgetContainerView,
          WidgetView,
          ListWidgetSelectorView ) {

  var WidgetListView = WidgetContainerView.extend({
    el: null,
    className: 'container-create list-widget',
    tagName : 'div',
    entity: null,
    type: null,
    highlighted: false,
    subviews: [],

    positionHorizontalGrid : 80,
    positionVerticalGrid   : 15,

    events: {
      'click'         : 'select',
      'click .delete' : 'remove',
      'mouseover'     : 'hovered',
      'mouseout'      : 'unhovered',
      'mousedown .row': 'rowMousedown',
      'mouseup .row'  : 'rowMouseup'
    },

    rowMousedown: function() { mouseDispatcher.isMousedownActive = true; },
    rowMouseup:   function() { mouseDispatcher.isMousedownActive = false; },

    initialize: function(widgetModel) {
      WidgetContainerView.__super__.initialize.call(this, widgetModel);
      _.bindAll(this);

      this.subviews = [];

      this.listenTo(this.model.get('data').get('container_info').get('row').get('uielements'), "add", this.placeWidget, true, true);
      this.listenTo(this.model.get('data').get('container_info').get('row').get('uielements'), "add", this.renderShadowElements);
      this.listenTo(this.model.get('data').get('container_info').get('row').get('uielements'), "remove", this.renderShadowElements);
      if(this.model.get('data').get('container_info').has('query')) {
        this.listenTo(this.model.get('data').get('container_info').get('query'), "change", this.renderShadowElements);
      }

      this.listenTo(this.model, 'deselected', function() {
        this.model.trigger('editModeOff');
      }, this);

      this.listenTo(this.model, 'editModeOff', this.switchEditingOff);
      this.listenTo(this.model.get('data').get('container_info').get('row').get('layout'), 'change:height', this.renderShadowElements);

      var action = this.model.get('data').get('container_info').get('action');

      this.entityModel = this.model.get('data').get('container_info').get('entity');
      this.listenTo(this.model, 'highlight', this.highlightFirstRow);
      this.widgetSelectorView = new ListWidgetSelectorView(this.model.get('data').get('container_info').get('row').get('uielements'), this.el);
      this.subviews.push(this.widgetSelectorView);
    },


    render: function() {
      var self = this;
      var form;

      this.el.innerHTML = '';

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      this.setTop(this.positionVerticalGrid * this.model.get('layout').get('top'));
      this.setLeft(this.positionHorizontalGrid * this.model.get('layout').get('left'));
      this.setHeight(height * this.positionVerticalGrid);

      this.el.className += ' widget-wrapper span'+width;
      this.el.id = 'widget-wrapper-' + this.model.cid;

      var row = this.model.get('data').get('container_info').get('row');

      var editorRow = document.createElement('div');
      editorRow.className = "row block hi" + row.get('layout').get('height');
      this.editorRow = editorRow;

      row.get('uielements').map(function(widgetModel) {
        this.placeWidget(widgetModel, false);
      }, this);
      this.widgetSelectorView.setElement(this.el).render();

      this.shadowElements = document.createElement('div');
      var listDiv = document.createElement('div');
      listDiv.className = this.model.get('data').get('class_name');
      this.listDiv = listDiv;
      this.listDiv.appendChild(editorRow);
      this.listDiv.appendChild(this.renderShadowElements());

      this.el.appendChild(this.listDiv);
      return this;
    },

    renderShadowElements: function() {
      var row = this.model.get('data').get('container_info').get('row');
      var uielements = _.map(row.get('uielements').models, function(obj) { return obj.attributes; });
      var nmrRows = 4;

      if(this.model.get('data').get('container_info').has('query') &&
         this.model.get('data').get('container_info').get('query').get('numberOfRows') > 0) {
        nmrRows = this.model.get('data').get('container_info').get('query').get('numberOfRows') - 1;
      }

      this.shadowElements.innerHTML = _.template(Templates.listNode, {layout: row.get('layout'),
                                                          uielements: uielements,
                                                          isListOrGrid: row.get('isListOrGrid'),
                                                          nmrRows: nmrRows});

      if(this.editMode) { $('.fdededfcbcbcd .shadow-x').addClass('trans'); }
      return this.shadowElements;
    },

    showDetails: function() {

    },

    highlightFirstRow: function() {
      var self = this;
      this.editMode = true;
      this.highlighted = true;
      this.$el.addClass('selected');
      $(this.editorRow).resizable({
        handles: "s",
        grid: [ 20, 15 ],
        stop  : self.resized
      });
      $(this.editorRow).addClass('highlighted');

      $('.fdededfcbcbcd .shadow-x').addClass('trans');
    },

    placeWidget: function(widgetModel, isNew) {
      widgetModel.setupLoopContext(this.entityModel);
      var widgetView = new WidgetView(widgetModel);
      this.subviews.push(widgetView);
      widgetView.setFreeMovement();

      this.editorRow.appendChild(widgetView.render().el);

      this.deepListenTo(widgetModel, 'change', this.renderShadowElements);

      if(isNew) { widgetView.autoResize(); }
    },

    resized: function(e, ui) {
      var deltaHeight = Math.round((ui.size.height + 6) / this.positionVerticalGrid);
      var elem = util.get('widget-wrapper-' + this.model.cid);
      elem.style.width = '';
      elem.style.height = '';
      if(deltaHeight < 2) deltaHeight = 2;
      this.model.get('data').get('container_info').get('row').get('layout').set('height', deltaHeight);
    },

    autoResize: function() {
      var left = this.model.get('layout').get('left');
      var width = 12 - left;
      if(width > 7) width = 7;

      this.model.get('layout').set('width', width);
      this.model.get('layout').set('height', 46);
    },

    changedType: function(a) {
      this.listDiv.className = this.model.get('data').get('class_name');
    },

    switchEditingOff: function() {
      this.editMode = false;
      this.$el.removeClass('selected');
      this.widgetSelectorView.deselect();
      if(this.highlighted && $(this.editorRow).hasClass('ui-resizable-handle')) $(this.editorRow).resizable("destroy");
      this.$el.find('.row').first().removeClass('highlighted');
      $('.shadow-x.trans').removeClass('trans');
      this.highlighted = false;
    }

  });

  return WidgetListView;
});
