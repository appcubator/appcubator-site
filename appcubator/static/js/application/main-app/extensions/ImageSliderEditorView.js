define([
  'mixins/BackboneModal',
  'util.filepicker'
],
function() {

  var ImageSliderEditorView = Backbone.ModalView.extend({
    el     : document.getElementById('class-picker'),
    className : 'modal image-slider-editor',
    width  : 800,
    height: 600,
    padding: 0,
    title: 'Image Slider Editor',
    doneButton: true,

    events : {
      'click li.add-image' : 'clickedAddImage',
      'click li .remove'   : 'clickedRemove',
      'keyup li textarea'  : 'changedCaption'
    },

    initialize: function(widgetModel){
      _.bindAll(this);

      this.model = widgetModel;
      this.collection = this.model.get('data').get('container_info').get('slides');
      this.render();
    },

    render: function() {
      var self = this;
      this.el.innerHTML = _.template(Templates.sliderEditorTemp, {});
      this.collection.each(this.appendImage);
      // render 'add image' button
      var addImageTempl = [
        '<li class="add-image pane span10 offset1 hoff1" style="height: 246px; text-align: center;">',
          '<h3 class="hoff2">Add Image</h3>',
          '<img src="/static/img/add.png" class="span3 add-img">',
        '</li>'
      ].join('\n');
      this.$el.find('.slider-images').append(addImageTempl);

      return this;
    },

    renderNode: function(uie) {
      var temp = Templates.tempNode;
      var el = _.template(temp, { element: uie});
      return el;
    },

    clickedAddImage: function(e) {
      util.filepicker.openFilePick(this.imageAdded, this, appId);
    },

    imageAdded: function(files, self) {
      _(files).each(function(file){
        file.name = file.filename;
        statics.push(file);
        self.collection.push({
          image: file.url,
          text: 'Add a caption...'
        });
        self.appendImage(self.collection.last());
      });
    },

    clickedRemove: function(e) {
      var cid = e.currentTarget.id.replace("remove-", "");
      this.collection.remove(this.collection.get(cid));
      this.$('#image-editor-'+cid).remove();
    },

    appendImage: function(image) {
      var tmpl = _.template(Templates.sliderImageEditorTemp, {
        cid: image.cid,
        image: image.get('image'),
        text: image.get('text')
      });
      if(this.$('.add-image').length > 0) {
        this.$('.add-image').before(tmpl);
      }
      else {
        this.$('.slider-images').append(tmpl);
      }
    },

    changedCaption: function(e) {
      if(e.keyCode === 13) {
        return false;
      }
      var cid = e.currentTarget.id.replace('edit-', '');
      this.collection.get(cid).set('text', e.currentTarget.value);
    },

    clear: function() {
      this.el.innerHTML = '';
      this.model = null;
    }
  });

  return ImageSliderEditorView;
});
