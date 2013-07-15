define([
  'backbone'
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

});