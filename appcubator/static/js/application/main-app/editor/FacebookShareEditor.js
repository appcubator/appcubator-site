define([
  'mixins/BackboneModal',
],
function() {

  var FacebookShareEditor = Backbone.ModalView.extend({
    className : 'modal image-slider-editor',
    width  : 600,
    height: 400,
    padding: 0,
    title: 'Facebook Share Editor',
    doneButton: true,

    events : {
      'click li.add-image' : 'clickedAddImage',
      'click li .remove'   : 'clickedRemove',
      'keyup li textarea'  : 'changedCaption'
    },

    initialize: function(widgetModel){
      _.bindAll(this);

      this.model = widgetModel;
      this.render();
    },

    render: function() {
      var self = this;

      var temp = [
        '<div class="facebook-share-editor">',
          '<span>Please copy paste the link of your Facebook Page if you would like to connect it to the Facebook button.',
        '</div>'
      ].join('\n');
      this.el.innerHTML = _.template(temp, {});

      return this;
    }


  });

  return FacebookShareEditor;
});
