define([
  'backbone',
  'jquery-ui'
],

function(Backbone) {

  Backbone.PickOneView = Backbone.View.extend({
    el: null,
    tagName: 'div',
    events: {
      'click .new-option'      : 'showNewOptionBox',
      'click .existing-option' : 'pickedAnswer',
      'submit #new-value-form' : 'createdAnswer'
    },

    initialize: function(list, doesAcceptNew, newLabel) {
      _.bindAll(this);

      this.list = list;
      this.doesAcceptNew = doesAcceptNew;
      this.newLabel = newLabel;

      return this;
    },

    render: function() {

      _(this.list).each(function (val, ind) {

        var input = document.createElement('input');
        input.id = "option-" + ind;
        input.className = "existing-option";
        input.setAttribute("type", "radio");
        input.setAttribute("name", this.cid);
        input.value = val.val;
        var label = document.createElement('label');
        label.innerHTML = val.name;
        label.setAttribute("for", "option-" + ind);

        var option = document.createElement('div');
        option.className = 'option';

        option.appendChild(input);
        option.appendChild(label);

        this.el.appendChild(option);
      }, this);


      if(this.doesAcceptNew) {
        var input = document.createElement('input');
        input.className = "new-option";
        input.id = "new-option";
        input.setAttribute("type", "radio");
        input.setAttribute("name", this.cid);
        var label = document.createElement('label');
        label.innerHTML = this.newLabel;
        label.setAttribute("for", "new-option");
        this.newLabelEl = label;
        this.el.appendChild(input);
        this.el.appendChild(label);
      }

      return this;
    },

    showNewOptionBox: function (argument) {
      this.newLabelEl.setAttribute("for", "");
      this.newLabelEl.innerHTML = '<form id="new-value-form"><input type="text" class="new-value-input" placeholder="Type the new value..."><input type="submit" class="done-btn" value="Add"></form>';
      $('.new-value-input').focus();
    },

    pickedAnswer: function (e) {
      var val = e.currentTarget.id.replace('option-','');
      this.trigger('submit', this.list[val].val);
    },

    createdAnswer: function (e) {
      e.preventDefault();
      var val= $('.new-value-input').val();
      this.trigger('answer', val);
    }

  });

  return Backbone;

});
