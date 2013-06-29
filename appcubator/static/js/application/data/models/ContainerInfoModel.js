define([
  'collections/WidgetCollection',
  'models/QueryModel',
  'models/TableModel',
  'models/UserTableModel',
  'models/FormModel',
  'models/RowModel',
  'collections/SlideCollection',
  'models/SlideModel',
  'dicts/constant-containers'
],
function(WidgetCollection,
         QueryModel,
         TableModel,
         UserTableModel,
         FormModel,
         RowModel,
         SlideCollection,
         SlideModel,
         SearchQueryModel) {

  var ContainerInfoModel = Backbone.Model.extend({
    initialize: function(bone) {
      _.bindAll(this);

      this.set('uielements', new WidgetCollection(bone.uielements||[]));

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
      if(bone.search) { this.set('search', new QueryModel(bone.query), this.get('entity')); }
      if(bone.form) {
        if(!bone.form.attributes) { this.set('form', new FormModel(bone.form)); }
        else { this.set('form', bone.form); }
      }
    },


    toJSON: function() {
      var json = _.clone(this.attributes);
      json.uielements = this.get('uielements').toJSON();
      if(json.slides) json.slides = json.slides.toJSON();
      if(json.form) json.form = json.form.toJSON();
      if(json.query) json.query = this.get('query').toJSON();
      if(json.search) json.search = json.search.toJSON();
      if(json.searchQuery) json.searchQuery = json.searchQuery.toJSON();
      if(this.has('row')) json.row = this.get('row').toJSON();
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
