define([
  'backbone'
],

function(Backbone) {

  SelectView = Backbone.View.extend({
    tagName: 'div',
    className : 'select-view',
    expanded: false,

    events: {
      'click'                : 'expand',
      'click li'             : 'select',
      'click .updown-handle' : 'toggle'
    },

    initialize: function(list, currentVal, isNameVal, options) {
      _.bindAll(this);

      this.list = list;
      this.currentVal = currentVal;
      this.isNameVal = isNameVal || false;
      this.options = (options||{});
      this.render();
      return this;
    },

    render: function() {
      var self = this;
      var list = document.createElement('ul');

      if(this.currentVal) {
        var currentLi = document.createElement('li');
        currentLi.innerHTML = this.currentVal;
        if(self.isNameVal) { currentLi.innerHTML = this.currentVal.name; }
        currentLi.className = 'selected';
        list.appendChild(currentLi);
      }

      _(this.list).each(function(val, ind) {
        if(val == self.currentVal || _.isEqual(val, self.currentVal)) return;
        var li = document.createElement('li');
        li.id = 'li-' + self.cid + '-' + ind;
        val = val;
        if(self.isNameVal) { val = val.name; }
        li.innerHTML = val;
        list.appendChild(li);
      });

      var handle = document.createElement('div');
      handle.className = "updown-handle";
      this.handle = handle;

      this.el.appendChild(handle);
      this.el.appendChild(list);

      return this;
    },

    expand: function(e) {
      var length = this.list.length;

      if(this.currentVal && !_.contains(this.list, this.currentVal)) {
        length += 1;
      }

      if(this.options.maxHeight && length > this.options.maxHeight) length = this.options.maxHeight;

      this.el.style.height = length * 40 + 'px';
      this.expanded = true;
      if(e) e.stopPropagation();
    },

    shrink : function(e) {
      this.el.style.height = 40 + 'px';
      this.expanded = false;
      e.stopPropagation();
    },

    select: function(e) {
      this.shrink(e);
      if(e.target.className == "selected") return;
      var ind = String(e.target.id).replace('li-' + this.cid + '-', '');
      this.trigger('change', this.list[ind].val);
    },

    selectCurrent: function() {
      this.trigger('change', this.currentVal);
    },

    toggle: function(e) {
      if(this.expanded) this.shrink(e);
      else this.expand(e);
    }

  });

  return SelectView;

});
