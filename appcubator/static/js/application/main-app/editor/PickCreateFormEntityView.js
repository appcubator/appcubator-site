define([
  'mixins/BackbonePickOneView',
  'mixins/BackboneModal',
  'util'
],
function() {

  var PickCreateFormEntityView = Backbone.ModalView.extend({
    className : 'navbar-editor-modal',
    width: 600,
    padding: 20,
    title: "New Create Form",

    events: {

    },
    initialize: function(layout, id) {
      _.bindAll(this);
      this.render();
      this.elLayout = layout;
      this.elId = id;
    },

    render: function() {
      var list = v1State.get('tables').map(function(table) {
        return {
          name: table.get('name'),
          val: table.cid
        };
      });

      this.pickOneFromList = new Backbone.PickOneView(list, true, "Add a new table.");
      this.el.innerHTML += "What should this form create?";
      this.el.appendChild(this.pickOneFromList.render().el);
      this.pickOneFromList.el.style.marginTop = '14px';
      this.pickOneFromList.on('submit', this.picked);
      this.pickOneFromList.on('answer', this.newAnswer);
      return this;
    },

    newAnswer: function (name) {
      var entity = v1State.get('tables').push({ name: name});
      if(!entity) return false;
      var elem = v1State.getCurrentPage().get('uielements').createCreateForm(this.elLayout, entity);
      this.closeModal();
      return elem;
    },

    picked: function(tableCid) {
      var entity = v1State.get('tables').get(tableCid);
      var elem = v1State.getCurrentPage().get('uielements').createCreateForm(this.elLayout, entity);
      this.closeModal();
      return elem;
    }

  });

  return PickCreateFormEntityView;
});
