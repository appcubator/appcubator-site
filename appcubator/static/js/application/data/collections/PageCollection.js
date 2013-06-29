define([
  'models/PageModel'
],
function(PageModel) {

  var PageCollection = Backbone.Collection.extend({
    model : PageModel,

    getContextFreePages: function() {
      var pagesList = _(this.getContextFreePageModels()).map(function(pageM) { return pageM.get('name'); });
      return pagesList;
    },

    getContextFreePageModels: function() {
      var pagesList = [];
      this.each(function(page) {
        if(!page.get('url').get('urlparts').some(function(part) { return (/\{\{([^\}]+)\}\}/g).test(part.get('value')); })) {
          pagesList.push(page);
        }
      });

      return pagesList;
    },

    getPagesWithEntityName: function(entityName) {
      var pagesList = [];
      this.each(function(page) {
        if(page.doesContainEntityName(entityName)){
          pagesList.push(page.get('name'));
        }
      });

      return pagesList;
    },

    getPageModelsWithEntityName: function(entityName) {
      var pagesList = [];
      this.each(function(page) {
        if(page.doesContainEntityName(entityName)){
          pagesList.push(page);
        }
      });

      return pagesList;
    },

    isUnique: function(pageName) {
      isUnique = true;
      this.each(function(page) {
        if(page.get('name') === pageName) isUnique = false;
      });
      return isUnique;
    }
  });

  return PageCollection;
});
