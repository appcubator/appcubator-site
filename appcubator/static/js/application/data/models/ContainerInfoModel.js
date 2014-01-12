define([
  'models/QueryModel',
  'models/TableModel',
  'models/UserTableModel',
  'models/FormModel',
  'models/RowModel',
  'collections/SlideCollection',
  'models/SlideModel',
  'dicts/constant-containers'
],
function(QueryModel,
         TableModel,
         UserTableModel,
         FormModel,
         RowModel,
         SlideCollection,
         SlideModel,
         SearchQueryModel) {

  var ContainerInfoModel = Backbone.Model.extend({
    initialize: function(bone) {
      if(bone.uielements) {
        var WidgetCollection = require('collections/WidgetCollection');
        this.set('uielements', new WidgetCollection(bone.uielements||[]));
      }

      if(bone.entity) {
        if(!bone.entity.attributes) {
          var entityM = v1State.getTableModelWithName(bone.entity);
          this.set('entity', entityM);
        }
        else {
          this.set('entity', bone.entity);
        }
      }

      if(bone.slides) { this.set('slides', new SlideCollection(bone.slides)); }
      if(bone.row) { this.set('row', new RowModel(bone.row)); }
      if(bone.query) { this.set('query', new QueryModel(bone.query, this.get('entity'))); }
      if(bone.search) { this.set('search', new QueryModel(bone.search, this.get('entity'))); }
      if(bone.form) {
        if(!bone.form.attributes) { this.set('form', new FormModel(bone.form)); }
        else { this.set('form', bone.form); }
      }
    },


    serialize: function() {
      var json = _.clone(this.attributes);
      if(json.uielements) json.uielements = this.get('uielements').serialize();
      if(json.slides) json.slides = json.slides.serialize();
      if(json.form) json.form = json.form.serialize();
      if(json.query) json.query = this.get('query').serialize();
      if(json.search) json.search = json.search.serialize();
      if(json.searchQuery) json.searchQuery = json.searchQuery.serialize();
      if(this.has('row')) json.row = this.get('row').serialize();
      if(this.has('entity')) {
        if(typeof json.entity !== "string") {
          json.entity = json.entity.get('name');
        }
      }

      return json;
    }
  });

  return ContainerInfoModel;
});
