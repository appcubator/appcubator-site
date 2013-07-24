define([
  'backbone',
  'util'
],

function(Backbone) {
  console.log("CONVENIENT");

  Backbone.View.prototype.close = function(){

    this.undelegateEvents();
    this.$el.removeData().unbind();
    this.remove();
    this.unbind();

    if(this.subviews) {
      _(this.subviews).each(function(subview) {
        console.log("View:" + subview.cid);
        subview.close();
      });
      this.subviews = null;
    }
  };

  Backbone.View.prototype._ensureElement = function() {
    if (!this.el) {
      var attrs = {};
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

  Backbone.isModel = function(obj) {
    if(obj && obj.attributes) return true;
    return false;
  };

  Backbone.isCollection = function(obj) {
    if(obj && obj.models) return true;
    return false;
  };

  Backbone.View.prototype.deepListenTo = function(obj, event, handler) {
    if(Backbone.isModel(obj)) {
      this.listenTo(obj, event, handler);
      _.each(obj.attributes, function(val, key) {
        this.deepListenTo(val, event, handler);
      }, this);
    }
    else if(Backbone.isCollection(obj)) {
      this.listenTo(obj, event, handler);
      obj.each(this.deepListenTo, function(model) {
        this.deepListenTo(model, event, handler);
      }, this);
    }
  };

});