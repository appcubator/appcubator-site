define([
  'backbone',
  'jquery-ui'
],

function(Backbone) {

  Backbone.NameBox = Backbone.View.extend({
    el: null,
    tagName: 'div',
    txt: "",
    events: {
      'click'               : 'showForm',
      'submit form'         : 'createFormSubmitted'
    },

    initialize: function(inp) {
      _.bindAll(this, 'render', 'showForm', 'createFormSubmitted');
      if(inp.txt) {
        this.txt = inp.txt;
      }

      this.render();
      return this;
    },

    render: function() {
      if(this.txt) {
        this.el.innerHTML += this.txt;
      }
      if(!this.$el.find('form').length) {
        this.el.innerHTML +="<form style='display:none;'><input type='text' placeholder='Name...'></form>";
      }
      return this;
    },

    showForm: function (e) {
      this.$el.find('.box-button').hide();
      this.$el.find('form').fadeIn();
      this.$el.find('input[type="text"]').focus();
    },

    createFormSubmitted: function(e) {
      e.preventDefault();
      var name = this.$el.find('input').val();
      if(name.length > 0) {
        this.$el.find('input').val('');
        this.$el.find('form').hide();
        this.$el.find('.box-button').fadeIn();
        this.trigger('submit', name);
      }
    }

  });

  return Backbone;

});
