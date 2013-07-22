define([
  'backbone',
  'jquery-ui'
],

function(Backbone) {

  Backbone.PickOneView = Backbone.View.extend({
    el: null,
    tagName: 'div',
    events: {
      'click .new-option' : 'showNewOptionBox',
      'click .existing-option' : 'pickedAnswer'
    },

    initialize: function(list, doesAcceptNew, newLabel) {
      _.bindAll(this);

      this.list = list;
      this.doesAcceptNew = doesAcceptNew;
      this.newLabel = newLabel;

      return this;
    },

    render: function() {
      console.log(this.list);

      _(this.list).each(function (val, ind) {

        var input = document.createElement('input');
        input.id = "option-" + ind;
        input.className = "existing-option";
        input.setAttribute("type", "radio");
        input.setAttribute("name", "this.cid");
        input.value = val.val;
        var label = document.createElement('label');
        label.innerHTML = val.name;
        label.setAttribute("for", "option-" + ind);

        this.el.appendChild(input);
        this.el.appendChild(label);
      }, this);


      if(this.doesAcceptNew) {
        var input = document.createElement('input');
        input.className = "new-option";
        input.id = "new-option";
        input.setAttribute("type", "radio");
        input.setAttribute("name", "this.cid");
        var label = document.createElement('label');
        label.innerHTML = this.newLabel;
        label.setAttribute("for", "new-option");
        this.newLabelEl = label;
        this.el.appendChild(input);
        this.el.appendChild(label);
      }


      //var form = document.createElement('form');


// <input type="radio" name="group2" value="Water"> Water<br>


      return this;
    },

    showNewOptionBox: function (argument) {
      this.newLabelEl.innerHTML = '<input type="text" placeholder="">';
    },

    pickedAnswer: function (e) {
      var val = e.currentTarget.id.replace('option-','');
      this.trigger('submit', val);
    }


  });

  return Backbone;

});
