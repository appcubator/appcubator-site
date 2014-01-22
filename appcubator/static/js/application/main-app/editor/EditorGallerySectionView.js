define(function(require, exports, module) {

    'use strict';

    var WidgetContainerModel = require('models/WidgetContainerModel');
    var WidgetModel = require('models/WidgetModel');

    require('dicts/default-uielements');
    require('dicts/constant-containers');
    require('jquery-ui');

    var EditorGallerySectionView = Backbone.View.extend({

        events: {
            'click .gallery-header .qmark': 'showSectionTutorial',
            'click .gallery-header': 'toggle',
            'mouseover': 'expand',
            'mouseenter': 'expand',
            'mouseleave': 'mouseleave'
        },

        className: 'gallery-section',
        isExpanded: true,
        timer: null,

        initialize: function(options) {
            _.bindAll(this);
            this.parentView = options.parentView;
            this.options = options;
            return this;
        },

        render: function() {
            if (this.el) {
                this.el.innerHTML = '';
            }
            var sectionName = this.name.replace(/ /g, '-');
            this.header = this.addHeaderItem(this.name);
            this.listWrapper = document.createElement('div');
            this.listWrapper.className = "elements-panel ";

            this.list = document.createElement('ul');
            if(this.options.index > -1) {
                this.listWrapper.className += 'top'+this.options.index;
            }

            this.listWrapper.appendChild(this.list);
            this.list.style = '';
            this.el.appendChild(this.listWrapper);

            $(this.list).sortable({
                connectWith: '.ycol',
                iframeFix: true
            });
            console.log("sroting")
            return this;
        },

        addFullWidthItem: function(id, className, text, icon) {
            var li = document.createElement('li');
            li.className = className + ' full-width';
            li.id = id;
            var tempLi = '<span class="icon <%= icon %>"></span><span class="name"><%= text %></span>';
            li.innerHTML = _.template(tempLi, {
                text: text,
                icon: icon
            });

            this.list.appendChild(li);

            if(this.searcher) {
                this.searcher.register(id, className, text, icon);
            }

            return li;
        },

        addHalfWidthItem: function(id, className, text, icon) {
            var li = document.createElement('li');
            li.className = className + ' half-width';
            li.id = id;
            var tempLi = '<span class="icon <%= icon %>"></span><span class="name"><%= text %></span>';
            li.innerHTML = _.template(tempLi, {
                text: text,
                icon: icon
            });
            this.list.appendChild(li);

            if(this.searcher) {
                this.searcher.register(id, className, text, icon);
            }

            return li;
        },

        addHeaderItem: function(text, target) {
            var li = document.createElement('div');
            li.className = 'gallery-header open';
            li.innerHTML = '<span>' + text + '</span>';
            // + '<span class="qmark">?</span>';
            var icon = document.createElement('img');
            icon.className = "icon";
            icon.src = "/static/img/right-arrow.png";
            // li.appendChild(icon);
            this.el.appendChild(li);
            return li;
        },

        toggle: function() {
            if (this.isExpanded) this.hide();
            else this.expand();
        },

        expand: function() {
            this.header.className += ' open';
            this.listWrapper.className += ' open';

            this.isExpanded = true;
        },

        hide: function() {
            $(this.header).removeClass('open');
            $(this.listWrapper).removeClass('open');
            this.isExpanded = false;
        },

        mouseleave: function(e) {
            if (this.timer) clearTimeout(this.timer);
            var self = this;
            this.timer = setTimeout(function() {
                if (!self.parentView.dragActive && !self.parentView.slideDownActive) self.hide();
                if (self.timer) clearTimeout(self.timer);
            }, 130);
        },

        showSectionTutorial: function(e) {
            e.stopPropagation();
            v1.showTutorial(this.name);
        },

        addSearcher: function(searcherObj) {
            this.searcher = searcherObj;
        }

    });


    return EditorGallerySectionView;
});