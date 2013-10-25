define(function(require, exports, module) {

    'use strict';

    require('mixins/BackboneUI');
    require('util');

    var WidgetContentEditorView = require('editor/WidgetContentEditorView');
    var WidgetLayoutEditorView  = require('editor/WidgetLayoutEditorView');
    var ImageSliderEditorView   = require('editor/ImageSliderEditorView');
    var WidgetClassPickerView   = require('editor/WidgetClassPickerView');
    var SearchEditorView        = require('editor/SearchEditorView');
    var FacebookShareEditor     = require('editor/FacebookShareEditor');
    var VideoEmbedEditor        = require('editor/VideoEmbedEditor');
    var RowGalleryView          = require('editor/list-editor/RowGalleryView');
    var FormEditorView          = require('editor/form-editor/FormEditorView');
    var LoginFormEditorView     = require('editor/form-editor/LoginFormEditorView');
    var QueryEditorView         = require('editor/QueryEditorView');
    var CustomWidgetEditorModal = require('editor/CustomWidgetEditorModal');
    var GenericModelFieldEditor = require('mixins/GenericModelFieldEditor');

    var WidgetEditorViewProxy = {

        openFormEditor: function() {
            var entityModel = this.model.get('data').get('container_info').get('form').get('entity');
            if (_.isString(entityModel)) entityModel = v1State.getTableModelWithName(entityModel);
            new FormEditorView(this.model.get('data').get('container_info').get('form'), entityModel);
        },

        openLoginEditor: function() {
            var loginRoutes = this.model.getLoginRoutes();
            new LoginFormEditorView(loginRoutes);
        },

        openSlideEditor: function() {
            new ImageSliderEditorView(this.model);
        },

        openFBShareEditor: function() {
            new FacebookShareEditor(this.model);
        },

        openVideoEmbedEditor: function() {
            new VideoEmbedEditor(this.model);
        },

        openQueryEditor: function() {
            var type = 'table';
            if (this.model.get('data').get('container_info').has('row')) {
                type = 'list';
            }

            new QueryEditorView(this.model, type);
        },

        openRowEditor: function() {
            this.hideSubviews();
            this.el.appendChild(this.renderButtonWithWidthCustomWidth('done-editing', 'Done Editing', 190));
            this.el.style.width = '200px';
            var entity = this.model.get('data').get('container_info').get('entity');
            this.listGalleryView = document.createElement('div');
            this.listGalleryView.className = 'elements-list';

            var galleryView = new RowGalleryView(this.model, this.location);
            this.subviews.push(galleryView);

            this.listGalleryView.appendChild(galleryView.render().el);
            this.el.appendChild(this.listGalleryView);
        },

        openSearchEditor: function() {
            new SearchEditorView(this.model.get('data').get('searchQuery'));
        },

        openCustomWidgetEditor: function() {
            new CustomWidgetEditorModal(this.model);
        }
    };

    return WidgetEditorViewProxy;

});