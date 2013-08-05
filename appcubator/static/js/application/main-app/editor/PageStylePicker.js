define([
  'dicts/page-templates',
  'mixins/BackboneModal'
],
function() {

  var PageStylePicker = Backbone.ModalView.extend({
    className : 'page-template-picker',
    width  : 800,
    events : {
      'click .page-template' : 'selected'
    },

    initialize: function(pageModel){
      _.bindAll(this);
      this.model = pageModel;
      this.render();
    },

    selected : function(e) {
      var tempId = String(e.target.id).replace('page-','');
      this.model.get('uielements').add(page_templates[tempId].uielements);
      this.closeModal();
    },

    render: function() {
      var self = this;
      this.el.innerHTML = "<h2>Choose a page template to start with?</h2>";
      this.el.innerHTML += "<ul>";

      _(page_templates).each(function(page, ind) {
        self.el.innerHTML += '<li class="page-template" id="page-'+ ind +'">'+ page.name +'</li>';
      });
      this.el.innerHTML += "</ul>";
    }
  });

  return PageStylePicker;
});