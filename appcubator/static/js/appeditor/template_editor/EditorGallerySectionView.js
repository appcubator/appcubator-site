define(function(require, exports, module) {

    'use strict';

    var WidgetContainerModel = require('models/WidgetContainerModel');
    var WidgetModel = require('models/WidgetModel');
    require('jquery-ui');

    var EditorGallerySectionView = Backbone.View.extend({

        events: {
            'click .gallery-header .qmark': 'showSectionTutorial',
            'click .gallery-header': 'toggle'
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
            if (this.options.index > -1) {
                this.listWrapper.className += 'top' + this.options.index;
            }

            this.listWrapper.appendChild(this.list);
            this.list.style = '';
            this.el.appendChild(this.listWrapper);

            return this;
        },

        addWidgetItem: function(id, className, text, icon, generatorIdentifier, fullWidth) {
            // if fullWidth is truthy, creates a full width item. Otherwise creates half width.
            var li = document.createElement('li');
            li.className = fullWidth ? className + ' full-width' : className + ' half-width';
            li.id = id;
            var tempLi = '<span class="icon <%= icon %>"></span><span class="name"><%= text %></span>';
            li.innerHTML = _.template(tempLi, {
                text: text,
                icon: icon
            });

            if(generatorIdentifier) {
                $(li).data('genpath', generatorIdentifier);
            }

            this.list.appendChild(li);

            if (this.searcher) {
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
            icon.src = STATIC_URL + "/img/right-arrow.png";
            // li.appendChild(icon);
            this.el.appendChild(li);
            return li;
        },

        toggle: function() {
            if (this.isExpanded) this.hide();
            else {
                this.parentView.hideAllSections();
                this.expand();
            }
        },

        expand: function() {
            this.header.className += ' open';
            this.listWrapper.className += ' open';

            this.isExpanded = true;
            $(window).on('mouseup', this.clickedOutsideHide);
        },

        hide: function() {
            $(this.header).removeClass('open');
            $(this.listWrapper).removeClass('open');
            this.isExpanded = false;
            $(window).off('mouseup', this.clickedOutsideHide);
        },

/* Dead code as of 2/10/14
        mouseleave: function(e) {
            if (this.timer) clearTimeout(this.timer);
            var self = this;
            this.timer = setTimeout(this.checkToHide, 130);
        },
        */
        clickedOutsideHide: function(e) {
            var container = this.$el;
            // if the target of the click isn't the container
            // ... nor a descendant of the container
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                this.hide();
            }
        },

        checkToHide: function() {
            if (this.timer) clearTimeout(this.timer);
            if (!this.parentView.dragActive && !this.parentView.slideDownActive) return this.hide();
            this.timer = setTimeout(this.checkToHide, 2000);
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
