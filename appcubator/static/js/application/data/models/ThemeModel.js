define([
  'collections/UIElementCollection',
],
function(UIElementCollection) {

  /*var PageDesignCollection = Backbone.Collection.extend({
    model : PageDesignModel
  });*/

  var ThemeModel = Backbone.Model.extend({

    initialize: function(themeState) {
      this.set('basecss', themeState.basecss||"font-size:14px;");
      //this.set('pages', new PageDesignCollection(themeState.pages));

      this.set('buttons', new UIElementCollection(themeState["buttons"], "button"));
      this.set('images', new UIElementCollection(themeState["images"], "image"));
      this.set('headerTexts', new UIElementCollection(themeState["headerTexts"], "header-text"));
      this.set('texts', new UIElementCollection(themeState["texts"], "text"));
      this.set('links', new UIElementCollection(themeState["links"], "link"));
      this.set('textInputs', new UIElementCollection(themeState["textInputs"], "text-input"));
      this.set('passwords', new UIElementCollection(themeState["passwords"], "password"));
      this.set('textAreas', new UIElementCollection(themeState["textAreas"], "text-area"));
      this.set('lines', new UIElementCollection(themeState["lines"], "line"));
      this.set('dropdowns', new UIElementCollection(themeState["dropdowns"], "dropdown"));
      this.set('boxes', new UIElementCollection(themeState["boxes"], "box"));
      this.set('forms', new UIElementCollection((themeState["forms"]||[]), "form"));
      this.set('lists', new Backbone.Collection((themeState["lists"]||[]), "list"));
      this.set('fonts', new Backbone.Collection(themeState["fonts"]||[]));
    },

    getUIElementCollections: function() {

        return [this.get('buttons'), this.get('images'), this.get('headerTexts'),
                this.get('texts'), this.get('links'), this.get('textInputs'),
                this.get('passwords'), this.get('textAreas'), this.get('lines'),
                this.get('dropdowns'), this.get('boxes'), this.get('forms'),
                this.get('lists')];
    },

    toJSON: function() {
      var json = _.clone(this.attributes);

      json["buttons"]     = this.get('buttons').toJSON();
      json["images"]      = this.get('images').toJSON();
      json["headerTexts"]= this.get('headerTexts').toJSON();
      json["texts"]       = this.get('texts').toJSON();
      json["links"]       = this.get('links').toJSON();
      json["textInputs"] = this.get('textInputs').toJSON();
      json["passwords"]   = this.get('passwords').toJSON();
      json["textAreas"]  = this.get('textAreas').toJSON();
      json["lines"]       = this.get('lines').toJSON();
      json["dropdowns"]   = this.get('dropdowns').toJSON();
      json["boxes"]      = this.get('boxes').toJSON();
      json["forms"]      = this.get('forms').toJSON();
      json["lists"]      = this.get('lists').toJSON();
      json["fonts"]      = this.get('fonts').toJSON();

      return json;
    }

  });

  return ThemeModel;
});
