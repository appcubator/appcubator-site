define(
[
  'models/DataModel',
  'models/LayoutModel',
  'dicts/constant-containers'
],
function(DataModel, LayoutModel) {

  var WidgetModel = Backbone.Model.extend({
    selected: false,

    initialize: function(bone, isNew) {
      var self = this;
      _.bindAll(this, 'isFullWidth');

      this.set('type', bone.type||'');
      this.set('layout', new LayoutModel(this.get('layout')));
      this.set('data', new DataModel(bone.data||{}, isNew));

      this.set('context', bone.context|| null);
    },

    remove :function() {
      if(this.get('deletable') === false) return;
      if(this.collection) {
        this.collection.remove(this);
      }
    },

    toJSON : function() {
      var json = _.clone(this.attributes);
      json = _.omit(json, 'selected', 'deletable');

      json.data = this.get('data').toJSON();
      json.layout  = this.get('layout').toJSON();

      return json;
    },

    isFullWidth: function() {
      return this.get('layout').get('isFull') === true;
    },

    moveLeft: function() {
      if(this.isFullWidth()) return;

      if(this.get('layout').get('left') < 1 || this.collection.editMode) return;
      this.get('layout').set('left', this.get('layout').get('left') - 1);
    },

    moveRight: function() {
      if(this.isFullWidth() || this.collection.editMode) return;

      if(this.get('layout').get('left') + this.get('layout').get('width') > 11) return;
      this.get('layout').set('left', this.get('layout').get('left') + 1);
    },

    moveUp: function() {
      if(this.get('layout').get('top') < 1 || this.collection.editMode) return;
      this.get('layout').set('top', this.get('layout').get('top') - 1);
    },

    moveDown: function() {
      if(this.collection.editMode) return;
      this.get('layout').set('top', this.get('layout').get('top') + 1);
    },

    getListOfPages: function() {
      var pagesCollection = v1State.get('pages');

      if(this.get('context') === null || this.get('context') === "") {
        return pagesCollection.getContextFreePages();
      }

      var listOfLinks = pagesCollection.getPagesWithEntityName(this.get('context'));
      return listOfLinks;
    }

  });

  return WidgetModel;
});
