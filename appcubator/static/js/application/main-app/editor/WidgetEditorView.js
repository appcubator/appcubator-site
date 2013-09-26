define([
        'editor/WidgetContentEditorView',
        'editor/WidgetLayoutEditorView',
        'editor/ImageSliderEditorView',
        'editor/WidgetClassPickerView',
        'editor/SearchEditorView',
        'editor/FacebookShareEditor',
        'editor/VideoEmbedEditor',
        'editor/list-editor/RowGalleryView',
        'editor/form-editor/FormEditorView',
        'editor/form-editor/LoginFormEditorView',
        'editor/QueryEditorView',
        'editor/CustomWidgetEditorModal',
        'mixins/BackboneUI',
        'util'
    ],
    function(WidgetContentEditor,
        WidgetLayoutEditor,
        ImageSliderEditorView,
        WidgetClassPickerView,
        SearchEditorView,
        FacebookShareEditor,
        VideoEmbedEditor,
        RowGalleryView,
        FormEditorView,
        LoginFormEditorView,
        QueryEditorView,
        CustomWidgetEditorModal) {

        var WidgetEditorView = Backbone.UIView.extend({
            className: 'widget-editor fadeIn',
            id: 'widget-editor',
            tagName: 'div',
            css: 'widget-editor',
            type: 'widget',
            subviews: [],

            events: {
                'click .edit-slides-button': 'openSlideEditor',
                'click .query-editor-btn': 'openQueryEditor',
                'click .edit-row-btn': 'openRowEditor',
                'click .form-editor-btn': 'openFormEditor',
                'click .pick-style': 'openStylePicker',
                'click .search-editor-btn': 'openSearchEditor',
                'click .edit-login-form-btn': 'openLoginEditor',
                'click .link-to-page-button': 'openFBShareEditor',
                'click .video-link-button': 'openVideoEmbedEditor',
                'click .done-editing': 'closeEditingMode',
                'click .delete-button': 'clickedDelete',
                'click .done-text-editing': 'clickedDoneTextEditing',
                'click .edit-custom-widget-btn': 'openCustomWidgetEditor',
                'click': 'clicked'
            },

            initialize: function() {
                _.bindAll(this);
                this.subviews = [];
                util.loadCSS(this.css);
                this.model = null;
            },

            setModel: function(widgetModel) {
                if (this.model) {
                    this.stopListening(this.model, 'startEditing', this.startedEditing);
                    this.stopListening(this.model, 'stopEditing cancelEditing', this.stoppedEditing);
                    this.stopListening(this.model, 'doubleClicked', this.doubleClicked);
                }

                this.model = widgetModel;

                this.listenTo(this.model, 'startEditing', this.startedEditing);
                this.listenTo(this.model, 'stopEditing cancelEditing', this.stoppedEditing);
                this.listenTo(this.model, 'doubleClicked', this.doubleClicked);

                return this;
            },

            render: function() {
                this.$el.fadeIn();

                var action = "";

                if (this.model.get('data').has('container_info')) {
                    action = this.model.get('data').get('container_info').get('action');

                    if (action == "login" || action == "thirdpartylogin") {
                        this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                        this.layoutEditor = new WidgetLayoutEditor(this.model);
                        this.subviews.push(this.layoutEditor);
                        this.subviews.push(this.widgetClassPickerView);

                        this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);

                        this.el.appendChild(this.widgetClassPickerView.el);
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('pick-style', 'Pick Style'));
                        this.el.appendChild(this.renderButtonWithText('edit-login-form-btn', 'Edit Login'));
                        this.el.appendChild(this.layoutEditor.el);
                    }

                    if (action == "authentication" || action == "signup") {
                        this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                        this.layoutEditor = new WidgetLayoutEditor(this.model);
                        this.subviews.push(this.layoutEditor);
                        this.subviews.push(this.widgetClassPickerView);

                        this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);

                        this.el.appendChild(this.widgetClassPickerView.el);
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('pick-style', 'Pick Style'));
                        this.el.appendChild(this.renderButtonWithText('form-editor-btn', 'Edit Form'));
                        this.el.appendChild(this.layoutEditor.el);
                    }

                    if (action == "imageslider") {
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-slides-button', 'Edit Slides'));
                    }

                    if (action == "facebookshare") {
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('link-to-page-button', 'Link to A Facebook Page'));
                    }

                    if (action == "videoembed") {
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('video-link-button', 'Change Video Content'));
                    }

                    if (action == "table") {
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('query-editor-btn', 'Edit Query'));
                    }

                    if (action == "show" || action == "loop") {
                        this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                        this.subviews.push(this.widgetClassPickerView);

                        this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);

                        this.el.appendChild(this.widgetClassPickerView.el);
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-row-btn', 'Edit Row'));
                        this.el.appendChild(this.renderButtonWithText('query-editor-btn', 'Edit Query'));
                        this.el.appendChild(this.renderButtonWithText('pick-style', 'Pick Style'));
                    }

                    if (action == "searchlist") {
                        this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                        this.subviews.push(this.widgetClassPickerView);
                        this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);
                        this.el.appendChild(this.widgetClassPickerView.el);
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-row-btn', 'Edit Row'));
                        this.el.appendChild(this.renderButtonWithText('pick-style', 'Pick Style'));
                    }

                    if (action == "searchbox") {
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('search-editor-btn', 'Edit Search Options'));
                    }

                    if (this.model.hasForm() && action != "login" && action != "signup") {
                        this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                        this.layoutEditor = new WidgetLayoutEditor(this.model);

                        this.subviews.push(this.widgetClassPickerView);
                        this.subviews.push(this.layoutEditor);

                        this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);

                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('form-editor-btn', 'Edit Form'));
                        this.el.appendChild(this.layoutEditor.el);
                        this.el.appendChild(this.widgetClassPickerView.el);
                        this.el.appendChild(this.renderButtonWithText('pick-style', 'Pick Style'));
                    }
                } else {

                    if (this.model.isCustomWidget()) {
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-custom-widget-btn', 'Edit Custom Widget'));
                    } else {
                        this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                        this.layoutEditor = new WidgetLayoutEditor(this.model);
                        this.contentEditor = new WidgetContentEditor(this.model);

                        this.subviews.push(this.widgetClassPickerView);
                        this.subviews.push(this.layoutEditor);
                        this.subviews.push(this.contentEditor);

                        this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);

                        this.el.appendChild(this.widgetClassPickerView.el);
                        this.el.appendChild(this.renderButtonWithDeleteButtonandText('pick-style', 'Pick Style'));
                        this.el.appendChild(this.layoutEditor.el);
                        this.el.appendChild(this.contentEditor.el);
                    }
                }

                this.$el.removeClass('left');
                this.$el.removeClass('right');
                this.$el.removeClass('bottom');

                var location = this.getLocation();
                this.location = location;

                this.el.className += ' ' + location;

                // if(action == "show" || this.model.get('type') == "loop") {
                //   this.el.className += ' '+location;
                // }
                // else {
                //   this.$el.removeClass('right');
                // }

                if (this.location == "right") {
                    this.$el.append('<div class="left-arrow"></div>');
                } else if (this.location == "bottom") {
                    this.$el.append('<div class="top-arrow"></div>');
                } else {
                    this.$el.append('<div class="right-arrow"></div>');
                }

                this.model.trigger('display-widget-editor');

                return this;
            },

            renderButtonWithText: function(className, buttonText) {
                return this.renderButtonWithWidthCustomWidth(className, buttonText, 230);
            },

            renderButtonWithWidthCustomWidth: function(className, buttonText, width) {
                var li = document.createElement('ul');
                li.className = 'pad section-' + className;
                li.innerHTML += '<span class="option-button tt ' + className + '" style="width:' + width + 'px; display: inline-block;">' + buttonText + '</span>';
                return li;
            },

            renderButtonWithDeleteButtonandText: function(className, buttonText) {
                var li = document.createElement('ul');
                li.className = 'pad section-' + className;
                li.innerHTML += '<span class="' + className + '  option-button tt" style="width:190px; display: inline-block;">' + buttonText + '</span><span id="delete-widget" class="option-button delete-button tt" style="width:34px;"></span>';
                return li;
            },

            openStylePicker: function(e) {
                this.hideSubviews();
                this.widgetClassPickerView.show();
                this.widgetClassPickerView.expand();
            },

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
            },

            closeEditingMode: function() {
                this.$el.find('.section-done-editing').remove();
                this.el.style.width = '';
                $(this.listGalleryView).remove();
                this.showSubviews();
                this.model.trigger('editModeOff');
            },

            clickedDoneTextEditing: function() {
                this.model.trigger('stopEditing');
            },

            classChanged: function() {
                this.showSubviews();
                this.widgetClassPickerView.$el.hide();
            },

            startedEditing: function() {
                this.hideSubviews();
                this.el.appendChild(this.renderButtonWithText('done-text-editing', 'Done Editing'));
            },

            stoppedEditing: function() {
                $('.section-done-text-editing').remove();
                this.showSubviews();
            },

            clear: function() {
                if (this.contentEditor) this.contentEditor.clear();
                if (this.layoutEditor) this.layoutEditor.clear();
                if (this.infoEditor) this.infoEditor.clear();
                _(this.subviews).each(function(subview) {
                    subview.close();
                });
                this.el.innerHTML = '';
                this.el.style.width = '';
                this.$el.hide();
            },

            showSubviews: function() {
                //if(this.widgetClassPickerView) this.widgetClassPickerView.$el.fadeIn();
                if (this.contentEditor) this.contentEditor.$el.fadeIn();
                if (this.layoutEditor) this.layoutEditor.$el.fadeIn();
                if (this.infoEditor) this.infoEditor.$el.fadeIn();
                this.$el.find('.section-style-editor').fadeIn();
                this.$el.find('.section-form-editor-btn').fadeIn();
                this.$el.find('.section-query-editor-btn').fadeIn();
                this.$el.find('.section-edit-query-btn').fadeIn();
                this.$el.find('.section-edit-row-btn').fadeIn();
                this.$el.find('.section-delete-button').fadeIn();
                this.$el.find('.section-pick-style').fadeIn();
                this.$el.find('.section-edit-login-form-btn').fadeIn();
            },

            hideSubviews: function() {
                if (this.widgetClassPickerView) this.widgetClassPickerView.$el.hide();
                if (this.contentEditor) this.contentEditor.$el.hide();
                if (this.layoutEditor) this.layoutEditor.$el.hide();
                if (this.infoEditor) this.infoEditor.$el.hide();
                this.$el.find('.section-edit-login-form-btn').hide();
                this.$el.find('.section-style-editor').hide();
                this.$el.find('.section-form-editor-btn').hide();
                this.$el.find('.section-query-editor-btn').hide();
                this.$el.find('.section-edit-query-btn').hide();
                this.$el.find('.section-edit-row-btn').hide();
                this.$el.find('.section-delete-button').hide();
                this.$el.find('.section-pick-style').hide();
            },

            getLocation: function() {
                if(this.defaultLocation) return this.defaultLocation;

                var layout = this.model.get('layout');
                var rightCoor = layout.get('left') + layout.get('width');

                var pageHeight = v1State.getCurrentPage().getHeight();
                var widgetBottom = layout.get('top') + layout.get('height');

                if (widgetBottom + 8 > pageHeight) {
                    if ((12 - rightCoor) < 2) return "left";
                    return "right";
                }

                if (layout.get('height') < 22) {
                    return "bottom";
                }

                if ((12 - rightCoor) < 2) return "left";
                return "right";
            },

            doubleClicked: function() {
                if (this.model.getForm() && !this.model.isLoginForm()) {
                    this.openFormEditor();
                }
                if (this.model.getLoginRoutes()) {
                    this.openLoginEditor();
                }
                if (this.model.get('type') == "imageslider") {
                    this.openSlideEditor();
                }
            },

            clickedDelete: function() {
                if (this.model) {
                    this.model.remove();
                }
            },

            clicked: function(e) {
                e.stopPropagation();
            }

        });

        return WidgetEditorView;

    });