define([
  'backbone',
  'util'
],

function(Backbone) {

  Backbone.View.prototype.close = function(){
    if(this.subviews) {
      _(this.subviews).each(function(subview) {
        subview.close();
      });
    }
    this.remove();
    this.unbind();
  };

  Backbone.View.prototype._ensureElement = function() {
    if (!this.el) {
      // Edited by icanberk
      var attrs = {};
      //var attrs = _.extend({}, _.result(this, 'attributes'));
      if (this.id) attrs.id = _.result(this, 'id');
      if (this.className) attrs['class'] = _.result(this, 'className');
      var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
      this.setElement($el, false);
    } else {
      this.setElement(_.result(this, 'el'), false);
    }

    if(this.css) {
      util.loadCSS(this.css);
    }
  };

});