define([
  'models/PageModel'
],
function(PageModel) {

  var PageCollection = Backbone.Collection.extend({
    model : PageModel,

    getContextFreePages: function() {
      var pagesList = [];
      this.each(function(page) {
        if(!_.some(page.get('url').get('urlparts'), function(part) { return (/\{\{([^\}]+)\}\}/g).test(part); })) {
          pagesList.push(page.get('name'));
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
