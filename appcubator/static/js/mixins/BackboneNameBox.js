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
      'submit form'         : 'createFormSubmitted',
      'keydown input[type="text"]' : 'keyDown'
    },

    initialize: function(inp) {
      _.bindAll(this, 'render', 'showForm', 'createFormSubmitted');
      if(inp.txt) {
        this.txt = inp.txt;
      }
      return this;
    },

    render: function() {
      if(this.txt) {
        this.el.innerHTML += '<div class="box-button text">' + this.txt + '</div>';
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
      var nameInput = this.$el.find('input[type=text]');
      var name = nameInput.val();
      if(name.length > 0) {
        nameInput.val('');
        this.$el.find('form').hide();
        this.$el.find('.box-button').fadeIn();
        this.trigger('submit', name);
      }
      else {
        this.reset();
      }
    },

    keyDown: function (e) {
      if(e.keyCode === 27) this.reset();
    },

    reset: function() {
      var nameInput = this.$el.find('input[type=text]');
      nameInput.val('');
      this.$el.find('form').hide();
      this.$el.find('.box-button').fadeIn();
    }

  });

  return Backbone;

});
