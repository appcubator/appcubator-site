define([
  'mixins/BackbonePickOneView',
  'mixins/BackboneModal',
  'util'
],
function() {

  var PickCreateFormEntityView = Backbone.ModalView.extend({
    className : 'navbar-editor-modal',
    width: 600,
    padding: 0,
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

      console.log(list);

      this.pickOneFromList = new Backbone.PickOneView(list, true);
      this.el.innerHTML += "What should this form create?";
      this.el.appendChild(this.pickOneFromList.render().el);

      this.pickOneFromList.on('answer', this.picked);
      return this;
    },

    picked: function(tableCid) {

    }

  });

  return PickCreateFormEntityView;
});
