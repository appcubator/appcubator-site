define([
  'dicts/page-templates',
  'mixins/BackboneModal'
],
function() {

  var PageStylePicker = Backbone.ModalView.extend({
    className : 'page-template-picker',
    width  : 700,
    events : {
      'click .page-template' : 'selected'
    },

    initialize: function(pageModel){
      _.bindAll(this);
      this.model = pageModel;
      this.render();
    },

    selected : function(e) {
      var tempId = String(e.currentTarget.id).replace('page-','');
      this.model.get('uielements').add(page_templates[tempId].uielements);
      this.closeModal();
    },

    render: function() {
      var self = this;
      this.el.innerHTML = "<h2>Choose a page template to start with?</h2>";

      var list = document.createElement('ul');
      list.className = 'template-icons';
      _(page_templates).each(function(page, ind) {
        list.innerHTML += '<li class="page-template" id="page-'+ ind +'"><img src="/static/img/page_templates/'+page.icon+'"><span>'+ page.name +'</span></li>';
      });
      this.el.appendChild(list);
      console.log(this.el.innerHTML);
    }
  });

  return PageStylePicker;
});