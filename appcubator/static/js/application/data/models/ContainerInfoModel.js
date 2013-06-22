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
         SlideModel) {

  var ContainerInfoModel = Backbone.Model.extend({
    initialize: function(bone, isNew) {
      _.bindAll(this);

      this.set('uielements', new WidgetCollection(bone.uielements));

      console.log(bone.entity);
      if(bone.entity) {
        if(!bone.entity.attributes) {
          if(bone.entity == "User") this.set('entity', v1State.get('users'));
          else this.set('entity', v1State.get('tables').getTableWithName(bone.entity));
        }
        else {
          this.set('entity', bone.entity);
        }
      }

      if(bone.slides) { this.set('slides', new SlideCollection()); }
      if(bone.row) { this.set('row', new RowModel(bone.row)); }
      if(bone.query) { this.set('query', new QueryModel(bone.query, this.get('entity'))); }

      if(bone.form) {
        if(!bone.form.attributes) { this.set('form', new FormModel(bone.form)); }
        else { this.set('form', bone.form); }
      }

      if(isNew) this.setUpNew(bone);
    },

    setUpNew: function(bone) {
      var action = bone.action;

      if(bone.action == "signup") {
        this.set('uielements',  new WidgetCollection());

        _(constantContainers[bone.action]).each(function(element){
          elementDefault = uieState[element.type][0];
          element = _.extend(elementDefault, element);
          this.get('uielements').push(element);
        }, this);
      }
      else if(bone.action == "login") {
        var routes = this.get('form').get('loginRoutes');
        v1State.get('users').each(function(table) {
          routes.push({
            role: table.get('name'),
            redirect: null
          });
        });
      }
      else if(action == "create") {
        this.get('form').fillWithProps(this.get('entity'));
      }
      else if(action == 'table') {
        this.set('query', new QueryModel({}, this.get('entity')));
      }
      else if(action == 'show') {
        var queryModel = new QueryModel({}, this.get('entity'));
        var rowModel   = new RowModel({});
        this.set('query', queryModel);
        this.set('row', rowModel);
      }
      else if(action == 'table-gal') {
        var queryM = new QueryModel({}, this.get('entity'));
        this.set('query', queryM);
      }
      else if(action == "imageslider") {
        this.set('slides', new SlideCollection());
        this.get('slides').push(new SlideModel({image : '/static/img/placeholder-slide1.png'}));
        this.get('slides').push(new SlideModel({image : '/static/img/placeholder-slide2.png'}));
      }
      else if(action == "twitterfeed") {
        this.set('username', "icanberk");
      }
      else if(action == "facebookshare") {
        //nothing to set as of now
      }
      else if(action == "thirdpartylogin") {

      }
      else {
       throw "Action can not be found.";
      }
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.uielements = this.get('uielements').toJSON();
      if(json.slides) json.slides = json.slides.toJSON();
      if(json.form) json.form = json.form.toJSON();
      if(json.query) json.query = this.get('query').toJSON();
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
