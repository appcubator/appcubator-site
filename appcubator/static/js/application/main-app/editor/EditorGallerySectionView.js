define([
  'collections/ElementCollection',
  'models/WidgetContainerModel',
  'models/WidgetModel',
  'dicts/default-uielements',
  'dicts/constant-containers',
  'list'
],
function(
  ElementCollection,
  WidgetContainerModel,
  WidgetModel) {

  var EditorGallerySectionView = Backbone.View.extend({

    events : {
      'click .gallery-header .qmark' : 'showSectionTutorial',
      'click .gallery-header' : 'toggle',
      'mouseover'   : 'expand',
      'mouseenter'  : 'expand',
      'mouseleave'  : 'mouseleave'
    },

    isExpanded: true,
    timer: null,

    initialize: function(options) {
      _.bindAll(this);
      this.parentView = options.parentView;
      return this;
    },

    render: function() {
      if(this.el) {
        this.el.innerHTML = '';
      }
      var sectionName = this.name.replace(/ /g,'-');
      this.header = this.addHeaderItem(this.name);
      this.list = document.createElement('ul');
      this.el.appendChild(this.list);
      this.list.style = '';

      return this;
    },

    addFullWidthItem: function(id, className, text, icon) {
      var li = document.createElement('li');
      li.className = className+' full-width';
      li.id = id;
      var tempLi = '<span class="icon <%= icon %>"></span><span class="name"><%= text %></span>';
      li.innerHTML= _.template(tempLi, { text: text, icon: icon});

      this.list.appendChild(li);
      return li;
    },

    addHalfWidthItem: function(id, className, text, icon, container) {
      var li = document.createElement('li');
      li.className = className+' half-width';
      li.id = id;
      var tempLi = '<span class="icon <%= icon %>"></span><span class="name"><%= text %></span>';
      li.innerHTML= _.template(tempLi, { text: text, icon: icon});
      this.list.appendChild(li);

      return li;
    },

    addHeaderItem: function(text, target) {
      var li = document.createElement('li');
      li.className = 'gallery-header ui-draggable open';
      li.innerHTML = text + '<span class="qmark">?</span>';
      var icon = document.createElement('img');
      icon.className="icon";
      icon.src="/static/img/right-arrow.png";
      li.appendChild(icon);
      this.el.appendChild(li);
      return li;
    },

    toggle: function() {
      if(this.isExpanded) this.hide();
      else this.expand();
    },

    expand: function() {
      this.header.className +=' open';
      
      try {
        $(this.list).clearQueue();
      }
      catch(err) {}

      $(this.list).slideDown(200);
      this.isExpanded = true;
    },

    hide: function() {
      $(this.header).removeClass('open');
      
      try {
        $(this.list).clearQueue();
      }
      catch(err) {}

      $(this.list).slideUp(200);
      this.isExpanded = false;
    },

    mouseleave: function(e) {
      if(this.timer) clearTimeout(this.timer);
      var self = this;
      this.timer = setTimeout(function() {
        if(!self.parentView.dragActive && !self.parentView.slideDownActive) self.hide();
        if(self.timer) clearTimeout(self.timer);
      }, 130);
    },

    showSectionTutorial: function(e) {
      e.stopPropagation();
      v1.showTutorial(this.name);
    }

  });


  return EditorGallerySectionView;
});
