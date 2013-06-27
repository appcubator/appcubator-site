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
      _.bindAll(this);

      this.set('type', bone.type||'');
      this.set('layout', new LayoutModel(this.get('layout')));
      this.set('data', new DataModel(bone.data||{}, isNew));

      this.set('context', new Backbone.Collection(bone.context|| []));
    },

    remove :function() {
      if(this.get('deletable') === false) return;
      if(this.collection) {
        this.collection.remove(this);
      }
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

    setupPageContext: function(pageModel) {
      var entityList = pageModel.getContextEntities();
      var contextList = this.get('context');

      _(entityList).each(function(entity) {
        contextList.push({
          entity: entity,
          context: 'page.' + entity
        });
      });

      return this;
    },

    setupLoopContext: function(entityModel) {
      this.get('context').push({
        entity: entityModel.get('name'),
        context: 'loop.' + entityModel.get('name')
      });
      return this;
    },

    getListOfPages: function() {
      var pagesCollection = v1State.get('pages');
      var listOfLinks = [];

      _(pagesCollection.getContextFreePages()).each(function(page) {
        listOfLinks.push({
          name: page,
          val: "internal://" + page
        });
      });

      this.get('context').each(function(context) {

        var listOfPages = v1State.get('pages').getPagesWithEntityName(context.get('entity'));
        _(listOfPages).each(function(pageName) {
          listOfLinks.push({
            name: pageName,
            val: "internal://" + pageName + '/?' + context.get('entity') + '=' + context.get('context')
          });
        });
      });

      listOfLinks.push({
        name: 'External Link',
        val: "External Link"
      });

      return listOfLinks;
    },

    getAction:function() {
      if(this.get('data').has('container_info')) return this.get('data').get('container_info').get('action');
      else return this.get('data').get('action');

      return;
    },

    toJSON : function() {
      var json = _.clone(this.attributes);
      json = _.omit(json, 'selected', 'deletable', 'context');

      json.data = this.get('data').toJSON();
      json.layout  = this.get('layout').toJSON();

      return json;
    }
  });

  return WidgetModel;
});
