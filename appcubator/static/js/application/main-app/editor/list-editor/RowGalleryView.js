define([
  'editor/EditorGalleryView',
  'collections/ElementCollection'
],
function(EditorGalleryView, ElementCollection) {

  var RowGalleryView = EditorGalleryView.extend({
    el       : null,
    tagName  : 'ul',
    className: 'elements-list row-elements-list',

    events : {
    },

    initialize: function(widgetModel){
      this.model = widgetModel;

      var rowModel = this.model.get('data').get('container_info').get('row');
      var entityModel = this.model.get('data').get('container_info').get('entity');

      this.entity = entityModel;
      this.row = rowModel;
      this.widgetsCollection = this.row.get('uielements');
      this.editorContext = "loop";

      _.bindAll(this);
      this.allList = this.el;

      RowGalleryView.__super__.initialize.call(this, rowModel.get('uielements'));

    },

    render: function() {
      // Basic UI Elements
      // Context Entity Elements and Update Forms
      var self = this;
      this.allList = this.el;

      this.addInfoItem('Drop elements to the green area to edit one row of the list.');
      this.renderContextEntity();
      this.renderUIElementList();

      this.$el.find('li:not(.ui-draggable)').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.draggableActive = true;
        },
        stop: self.dropped
      });
      this.$el.find('li').on('click', self.dropped);
      this.switchEditingModeOn();
      return this;
    },

    renderContextEntity : function() {
      // Form, Data elements belonging to the entity
      var self = this;

      var entityName = self.entity.get('name');
      var entityId = self.entity.cid;

      this.entity.get('fields').each(function(field) {
        if(field.isRelatedField()) return self.renderRelatedField(field);

        this.addHalfWidthItem('context-field-'+ entityId+'-' + field.cid,
                              'context-entity', entityName+' '+field.get('name'),
                              'plus-icon');
      }, this);
    },

    renderRelatedField: function(fieldModel) {

      var entityName = this.entity.get('name');
      var entityId = this.entity.cid;
      var tableModel = v1State.getTableModelWithName(fieldModel.get('entity_name'));

      _(tableModel.getNormalFields()).each(function(fieldM) {
        this.addHalfWidthItem( 'context-field-'+entityId+'-'+ tableModel.cid+'-'+fieldM.cid,
                               'context-nested-entity',
                                entityName+' '+tableModel.geT('name')+'.'+fieldM.get('name'),
                               'plus-icon');
      }, this);
    },

    switchEditingModeOn: function() {
      this.model.trigger('highlight');
      this.model.trigger('unhover');
      this.model.trigger('editModeOn');
    },

    dropped : function(e, ui) {
      var left = 0; var top = 1;
      if(e.type != 'click') {
        left = this.findLeft(e, ui);
        top  = this.findTop(e, ui);
      }

      var layout = { top: top, left: left, width:80, height: 80};

      var targetEl = e.target;
      if(e.target.tagName != "LI") {
        targetEl = e.target.parentNode;
      }

      var className = targetEl.className;
      var id = targetEl.id;

      var widget = this.createElement(layout, className, id);
      widget.setupLoopContext(this.entity);
    },

    findLeft: function(e, ui) {
      var offsetLeft = $('.highlighted').offset().left;
      var left = Math.round((e.pageX - offsetLeft)/1);
      if(left < 0) left = 0;
      //if(left + 4 > 12) left = 8;

      return left;
    },

    findTop: function(e, ui) {
      var offsetScrolledTop = $('.highlighted').offset().top;
      var top  = Math.round((e.pageY - offsetScrolledTop)/1);
      if(top < 0) top = 0;

      return top;
    }
  });

  return RowGalleryView;
});

