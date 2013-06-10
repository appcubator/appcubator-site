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
    }

  });

  return ThemeModel;
});
