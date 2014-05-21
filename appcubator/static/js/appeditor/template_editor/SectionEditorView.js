define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('util');

    var WidgetSettingsView = require('editor/WidgetSettingsView');

    var SectionEditorView = Backbone.View.extend({

        events: {
            'keyup .class_name'     : 'classNameChaged',
            'click .remove-section' : 'removeSection',
            'click .settings'       : 'openSettingsView',
            'click .section-up'     : 'moveSectionUp',
            'click .section-down'   : 'moveSectionDown',
            'click .dropdown-toggle': 'toggleDropdown',
            'mouseover'             : 'menuHovered',
            'mouseout'              : 'menuUnhovered'
        },

        className: "section-editor-view",
        isActive: true,

        initialize: function(sectionModel) {
            _.bindAll(this);
            this.model = sectionModel;
            this.listenTo(this.model, 'hovered', this.hovered);
            this.listenTo(this.model, 'unhovered', this.unhovered);
            this.listenTo(this.model, 'remove', this.close);
        },

        render: function() {
            var template = [
                    '<div class="btn-group">',
                        '<div class="section-editor-button">',
                            '<div class="dropdown-toggle"><img width="24" class="icon" src="' + STATIC_URL + 'img/edit.png"></div>',
                            '<div class="section-up move">▲</div>',
                            '<div class="section-down move">▼</div>',
                        '</div>',
                        '<ul class="section-editor-menu animated">',
                            '<div class="top-arrow arw"></div>',
     
                            '<li><a><input type="text" class="class_name" value="<%= className %>" placeholder="Class Name"></a></li>',
                            '<li><span class="option-button delete-button tt remove-section"></span><div class="option-button settings"></div></li>',
                            // '<li class="remove-section"><a>Remove Section</a></li>',
                        '</ul>',
                    '</div>'].join('');

            var data = this.model.toJSON();
            data.className = data.className || "";

            this.el.innerHTML = _.template(template, data);
            this.$menu = this.$el.find('.section-editor-menu');
            // this.$el.find('.dropdown-menu input').click(function(event){
            //     event.stopPropagation();
            // });

            this.pageWrapper = document.getElementById('page-wrapper');
            var iframe = v1.currentApp.view.iframe;
            this.iframe = iframe;
            this.iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            this.$sectionEl = $(this.iframeDoc).find('[data-cid="' + this.model.cid + '"]');

            this.setPosition();

            this.renderShadow();
            this.positionShadow();

            return this;
        },

        renderShadow: function() {

            this.shadowEl = util.addShadow(this.$sectionEl[0], document.getElementById('page-wrapper'), this.iframe, this.iframeDoc);
            this.shadowEl.className = "section-shadow";
            this.pageWrapper.appendChild(this.shadowEl);
            this.$shadowView = $(this.shadowEl);

        },

        positionShadow: function() {
            this.$sectionEl = $(this.iframeDoc).find('[data-cid="' + this.model.cid + '"]');
            var positionRightTop = util.getRightTop(this.$sectionEl[0], document.getElementById('page-wrapper'), this.iframe, this.iframeDoc);
            this.shadowEl.style.top = (positionRightTop.top) + "px";
            this.shadowEl.style.height = this.$sectionEl.outerHeight() + 'px';
        },

        toggleDropdown: function() {
            if (this.expanded) {
                this.$menu.hide();
                this.expanded = false;
            }
            else {
                this.$menu.addClass('fadeInUp');
                this.$menu.show();
                this.$el.find('.class_name').focus();
                this.expanded = true;
            }
        },

        setPosition: function() {
            var $el = $(this.iframeDoc).find('[data-cid="' + this.model.cid + '"]');
            var el = $el[0];

            var positionRightTop = util.getRightTop(el, document.getElementById('page-wrapper'), this.iframe, this.iframeDoc);
            this.el.style.left = (positionRightTop.right - 120) + 'px';
            this.el.style.top = (positionRightTop.top + 15) + 'px';
        },

        classNameChaged: function(e) {
            var value = e.currentTarget.value;
            this.model.set('className', value);
        },

        openSettingsView: function() {
            new WidgetSettingsView(this.model).render();
            this.isActive = true;
        },

        moveSectionUp: function() {
            var fromInd = _.indexOf(this.model.collection.models, this.model);
            var toInd = fromInd - 1;
            if(fromInd == 0) return;
            this.model.collection.arrangeSections(fromInd, toInd);
            this.setPosition();
            this.positionShadow();
        },

        moveSectionDown: function () {
            var fromInd = _.indexOf(this.model.collection.models, this.model);
            var toInd = fromInd + 1;
            if(this.model.collection.models.length == toInd) return;
            this.model.collection.arrangeSections(fromInd, toInd);
            this.setPosition();
            this.positionShadow();
        },

        removeSection: function() {
            this.model.collection.remove(this.model);
        },

        menuHovered: function() {
            this.positionShadow();
            this.$shadowView.show();
            this.isActive = true;
        },

        menuUnhovered: function() {
            this.isActive = false;
            var self = this;
            var timer = setTimeout(function() {
            	console.log(self.isActive);
            	if (!self.isActive) {
            		self.$shadowView.hide();
            	}

            	clearTimeout(timer);
            }, 600);
        },

        hovered: function() {
            this.setPosition();
            this.$el.show();
        },

        unhovered: function() {
            this.$el.hide();
            this.$menu.hide();
            this.expanded = false;
        },

        close: function() {
            this.$shadowView.remove();
            SectionEditorView.__super__.close.call(this);
        }

    });

    return SectionEditorView;
});
