define([
  'mixins/BackboneModal'
],
function() {

  var ImageSliderEditorView = Backbone.ModalView.extend({
    el     : document.getElementById('class-picker'),
    className : 'modal image-slider-editor',
    width  : 500,
    height: 700,
    padding: 0,
    events : {
    },

    initialize: function(widgetModel){
      _.bindAll(this);

      this.model = widgetModel;
      this.render();
    },

    render: function() {
      var self = this;

      self.el.innerHTML = "<h2>Image Slider Editor</h2>";
      this.model.get('data').get('container_info').get('slides').each(function(slideModel) {
        var temp  = ['<span><input type="text" id="text-<%= cid %>" value="<%= text %>"><br  />',
                      '<img src="<%= image %>"></br>',
                      '<input type="submit" id="image-<%= cid %>" class="btn image-btn" value="Edit "></span>'].join('\n');
        var html = _.template(temp, { cid: slideModel.cid, image: slideModel.get('image'), text: slideModel.get('text') });
        self.el.innerHTML += html;
      });

      return this;
    },

    renderNode: function(uie) {
      var temp = Templates.tempNode;
      var el = _.template(temp, { element: uie});
      return el;
    },

    clear: function() {
      this.el.innerHTML = '';
      this.model = null;
    }
  });

  return ImageSliderEditorView;
});