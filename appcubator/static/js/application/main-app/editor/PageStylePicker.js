define([
  'wizard/AppGenerator',
  'dicts/page-templates',
  'mixins/BackboneModal'
],
function(AppGenerator) {

  var PageStylePicker = Backbone.ModalView.extend({
    className : 'page-template-picker',
    width  : 700,
    height : 480,
    events : {
      'click .static-template' : 'staticSelected',
      'click .info-template'   : 'infoSelected',
      'click .list-template'   : 'listSelected'
    },

    initialize: function(pageModel){
      _.bindAll(this);
      this.model = pageModel;
      this.render();
    },

    staticSelected : function(e) {
      var tempId = String(e.currentTarget.id).replace('page-','');
      this.model.get('uielements').add(page_templates[tempId].uielements);
      this.closeModal();
    },

    infoSelected: function(e) {
      var tableId = String(e.currentTarget.id).replace('table-info-','');
      var tableModel = v1State.get('tables').get(tableId);

      var appGen = new AppGenerator();
      this.model.get('uielements').add(appGen.generateInfoPage(tableModel), false);
      this.closeModal();
    },

    listSelected: function(e) {
      var tableId = String(e.currentTarget.id).replace('table-list-','');
      var tableModel = v1State.get('tables').get(tableId);

      console.log(tableModel);
      var appGen = new AppGenerator();
      this.model.get('uielements').add(appGen.generateListPage(tableModel), false);
      this.closeModal();
    },

    render: function() {
      var self = this;
      this.el.innerHTML = "<h2>Choose a page template to start with?</h2>";

      var list = document.createElement('ul');
      list.className = 'template-icons';
      _(page_templates).each(function(page, ind) {
        list.innerHTML += '<li class="page-template static-template" id="page-'+ ind +'"><img src="/static/img/page_templates/'+page.icon+'"><span>'+ page.name +'</span></li>';
      });

      v1State.get('tables').each(function(tableM) {
        list.innerHTML += '<li class="page-template info-template" id="table-info-'+ tableM.cid +'"><img src="/static/img/page_templates/info-page-icon.png"><span>'+ tableM.get('name') +' Info Page</span></li>';
        list.innerHTML += '<li class="page-template list-template" id="table-list-'+ tableM.cid +'"><img src="/static/img/page_templates/list-page-icon.png"><span>'+ tableM.get('name') +' List Page</span></li>';
      });

      this.el.appendChild(list);
      console.log(this.el.innerHTML);
    }
  });

  return PageStylePicker;
});