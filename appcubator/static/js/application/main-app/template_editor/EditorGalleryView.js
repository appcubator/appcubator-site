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
                            'fbshare', 'embedvideo', 'custom-widget'];

    var EditorGalleryView = Backbone.View.extend({

        el: util.get('top-panel-bb'),
        allList: util.get('all-list'),

        curId: 'all-elements',
        dragActive: false,
        slideDownActive: false,

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

            var plugins = v1State.get('plugins').getAllPluginsSerialized();
            var pluginPairs = _.pairs(_.omit(plugins, ['root', 'crud']));

            // order should be root, crud, then rest.
            if(plugins["crud"]) {
                pluginPairs.unshift(["crud", plugins["crud"]]);
            }

            if(plugins["root"]) {
                pluginPairs.unshift(["root", plugins["root"]]);
            }

            _.each(pluginPairs, function(pair) {
                var pluginName = pair[0],
                    plugin = pair[1];
                if (plugin.uielements) {
                    var displayName =  plugin.metadata.displayName || pluginName;

                    var sect = this.addNewSection(displayName);
                    createdSections.push(sect);

                    _.each(plugin.uielements, function(element) {
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

                        var genIDStr = pluginName + ".uielements." + element.name;
                        sect.addWidgetItem('', 'uielement', displayName, className, genIDStr, fullWidth);
                    }, this);
                }

            }, this);

            _.each(this.pluginSections, function(sect) {
                sect.close();
            });

            this.pluginSections = createdSections;

            if (this.plusSign)
                this.allList.removeChild(this.plusSign);
            this.addPlusSign();
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

        addPlusSign: function() {
            var text = "You can add more functionality by installing new Plugins from the menu on the top right.";
            var div = document.createElement('div');
            div.className = "gallery-section plus-sign";
            div.innerHTML = '<div class="gallery-header" title="'+text+'"><span>+</span></div>';
            this.plusSign = div;
            this.allList.appendChild(div);

            $(div).tooltip({
                position: {
                    my: "left+10 center",
                    at: "right center",
                    // using: function(position, feedback) {
                    //     $(this).css(position);
                    //     $("<div>")
                    //         .addClass("arrow")
                    //         .addClass(feedback.vertical)
                    //         .addClass(feedback.horizontal)
                    //         .appendTo(this);
                    // }
                }
            });
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
