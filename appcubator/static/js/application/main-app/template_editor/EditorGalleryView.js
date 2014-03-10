define(function(require, exports, module) {

    'use strict';

    var EditorGallerySectionView = require('editor/EditorGallerySectionView');
    var SearchGallerySectionView = require('editor/SearchGallerySectionView');
    var WidgetModel = require('models/WidgetModel');
    var Searcher = require('editor/Searcher');
    var AutoFillHelper = require('app/AutoFillHelper');

    /* uielement.displayProps is an an optional object with keys:
        name, (display name)
        iconType, (see validIconClasses below)
        halfWidth (true/false. default false if not exists)
    */
    /* uielement.displayProps.iconType may be one of these values, which happen to be class names for sprites . */
    var validIconClasses = ['button', 'image', 'header', 'text',
                            'link', 'line', 'box', 'imageslider',
                            'fbshare', 'embedvideo'];

    var defaultElements = [
      {
        text: "Button",
        className : "button",
        el : "<div class='btn'>Default Button</div>"
      },

      {
        text: "Image",
        className : "image",
        el : "<img class='span16' src='/static/img/placeholder.png'>"
      },

      {
        text: "Header",
        className : "header",
        el : "<h1>Default Header</h1>"
      },

      {
        text: "Text",
        className : "text",
        el : "<did>Default text!</div>"
      },

      {
        text: "Link",
        className : "link",
        el : "<a href='#'>Default Link</div>"
      },

      {
        text: "Line",
        className : "line",
        el : "<hr class='span20'>"
      },

      {
        text: "Box",
        className : "box",
        el : "<div style='background-color:#ccc;height:120px' class='span20'></div>"
      },

      {
        text: "Image Slider",
        className : "imageslider",
        el : "<img class='span24' src='/static/img/placeholder.png'>"
      },

      {
        text: "FB Share",
        className : "fbshare",
        el : "<img src='/static/img/fb-share-sample.png'>"
      },

      {
        text: "Embed Video",
        className : "embedvideo",
        el : "<img src='/static/img/youtube-static.png'>"
      }
    ];

    var EditorGalleryView = Backbone.View.extend({

        el: util.get('top-panel-bb'),
        allList: util.get('all-list'),

        curId: 'all-elements',
        dragActive: false,
        slideDownActive: false,


        positionHorizontalGrid: 80,
        positionVerticalGrid: 15,
        nmrSections: 0,

        sections: [],
        subviews: [],

        editorContext: "Page",

        events: {
            'change input.search'    : 'searchInputChage',
            'click .search-icon'     : 'searchToggle',
            'keyup input.search'     : 'searchInputChage',
            'click .search-cancel'   : 'searchCanceled'
        },

        initialize: function(sectionsCollection) {
            _.bindAll(this);

            this.sectionsCollection = sectionsCollection;

            this.searcher = new Searcher();

            this.sections = [];
            this.subviews = [];
        },

        render: function() {
            var self = this;
            this.setElement(util.get('top-panel-bb'));

            this.allList = util.get('all-list');
            this.allList.innerHTML = '';
            this.renderSearchPart();
            /* To see the old random render<Type>Elements, refer to 4b40213136b3006bf7eb83b3e93998d81c71346b or prior. */ 
            this.renderPluginElements();

            // hide all sections except first
            this.hideAllSections();
            this.bindDraggable();


            // TODO figure out what to do about this.
            // this.listenTo(v1State.get('models'), 'add remove', this.renderEntityFormsTablesLists);
            this.listenTo(v1State.get('plugins'), 'change', this.renderPluginElements);

            return this;
        },

        bindDraggable: function() {
            var self = this;

            $(this.allList).find('li:not(.ui-draggable)').draggable({
                cursor: "move",
                helper: "clone",
                start: function(e) {
                    self.dragActive = true;
                    v1.currentApp.view.sectionShadowView.displayColumnShadows();
                },
                stop: function(e) {
                    self.dragActive = false;
                    v1.currentApp.view.sectionShadowView.hideColumnShadows();
                    self.hideAllSections();
                },
                iframeFix: true
            });

        },

        renderSearchPart: function() {

            var self = this;
            var sectionView = new SearchGallerySectionView({
                parentView: self
            });

            sectionView.name = name;
            this.searchSection = sectionView;

            this.subviews.push(sectionView);
            this.sections.push(sectionView);
            this.allList.appendChild(sectionView.render().el);
        },

        searchToggle: function() {
            if (this._search_expanded)
                this.searchCanceled();
            else
                this.searchHovered();
        },

        searchHovered: function() {
            $(".search-panel").addClass("hover");
            $('.search').focus();
            this._search_expanded = true;
        },

        searchCanceled: function() {
            $(".search-panel").removeClass("hover");
            $('.search').val('');
            $('.search').focusout();
            this._search_expanded = false;
        },

        searchInputChage: function(e) {

            var val = e.currentTarget.value;

            if (val === "") {
                this.searchSection.clear();
                $(".search-panel").removeClass("hover");
                return;
            }
            else {
                $(".search-panel").addClass("hover");
            }

            this.searchSection.clear();
            var results = this.searcher.search(val);

            if(results.length > 0) {
                this.searchSection.expand();
            }
            else {
                this.searchSection.hide();
            }

            _.each(results, function(result) {
                this.searchSection.addWidgetItem(result.id, result.className, result.text, result.icon);
            }, this);

        },

        /* To see the old random render<Type>Elements, refer to 4b40213136b3006bf7eb83b3e93998d81c71346b or prior. */ 
        renderPluginElements: function() {
            var elements = [];
            var createdSections = [];

            _.each(v1State.get('plugins').pairs(), function(pair) {
                var pluginName = pair[0],
                    plugin = pair[1];
                if (plugin.has('uielements')) {
                    var displayName = plugin.get('metadata').displayName || pluginName;
                    var sect = this.addNewSection(displayName);
                    createdSections.push(sect);

                    _.each(plugin.get('uielements'), function(element) {
                        var className = null || 'plugin-icon';
                        if (element.displayProps && _.contains(validIconClasses, element.displayProps.iconType)) {
                            className = element.displayProps.iconType;
                        }
                        var displayName = element.name;
                        if (element.displayProps && element.displayProps.name) {
                            displayName = element.displayProps.name;
                        }
                        var fullWidth = true;
                        if (element.displayProps && element.displayProps.halfWidth) {
                            fullWidth = false;
                        }
                        sect.addWidgetItem('', 'uielement', displayName, className, element.generatorIdentifier, fullWidth);
                    }, this);
                }

            }, this);

            _.each(this.pluginSections, function(sect) {
                sect.close();
            });

            this.pluginSections = createdSections;

            this.bindDraggable();
        },

        addNewSection: function(name) {

            var self = this;
            var sectionView = new EditorGallerySectionView({
                parentView: self,
                index: this.nmrSections
            });

            this.nmrSections++;

            sectionView.addSearcher(this.searcher);

            sectionView.name = name;
            this.subviews.push(sectionView);
            this.sections.push(sectionView);
            this.allList.appendChild(sectionView.render().el);
            return sectionView;
        },

        removeSection: function(sectionView) {
            sectionView.close();
            this.sections.splice(this.sections.indexOf(sectionView), 1);
            this.subviews.splice(this.subviews.indexOf(sectionView), 1);
        },

        expandSection: function(index) {
            this.sections[index].expand();
        },

        hideSection: function(index) {
            this.sections[index].hide();
        },

        expandAllSections: function() {
            _(this.sections).each(function(section) {
                section.expand();
            });
        },

        hideAllSections: function() {
            _(this.sections).each(function(section) {
                section.hide();
            });
        },

        slideDown: function() {
            var self = this;
            var itemGallery = document.getElementById('item-gallery');
            var h = $(itemGallery).scrollTop();
            this.slideDownActive = true;
            $(itemGallery).scrollTop(h + 14);
            var tmr = setTimeout(function() {
                self.slideDownActive = false;
                clearTimeout(tmr);
            }, 200);
        },

        hide: function () {
            this.$el.hide();
        },

        show: function() {
            this.$el.fadeIn();
        }

    });


    return EditorGalleryView;
});