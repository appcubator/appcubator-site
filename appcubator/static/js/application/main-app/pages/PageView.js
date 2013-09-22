define([
        'app/pages/UrlView',
        'mixins/SimpleModalView',
        'app/templates/PageTemplates',
        'util',
        'backbone'
    ],
    function(UrlView, SimpleModalView) {

        var PageView = Backbone.View.extend({
            el: null,
            tagName: 'li',
            className: 'page-view span18 hoff2 offsetr1 pane hi22',
            expanded: false,
            events: {
                'click .delete': 'deletePage',
                'change #access_level': 'accessLevelChanged',
                'click .edit-url': 'renderUrl',
                'click .edit': 'goToEditor'
            },

            initialize: function(pageModel, ind, isMobile) {
                _.bindAll(this);

                this.model = pageModel;
                this.ind = ind;
                this.isMobile = isMobile;
                this.urlModel = pageModel.get('url');
                this.listenTo(this.model, 'remove', this.close, this);

            },

            render: function() {
                var page_context = {};
                page_context.page_name = this.model.get('name');
                page_context.ind = this.ind;
                page_context.context_text = this.model.getContextSentence();
                // if this is the homepage view,
                // mark 'edit url' link as disabled
                page_context.disable_edit = (this.model.get('name') === 'Homepage') ? true : false;

                var page = _.template(PageTemplates.tempPage, page_context);
                this.el.innerHTML += page;

                this.renderMenu();
                return this;
            },

            renderUrl: function() {
                // homepage url can't be edited
                if (this.model.get('name') === 'Homepage') {
                    return false;
                }
                var newView = new UrlView(this.urlModel);
            },

            renderMenu: function() {
                var page_context = {};
                page_context = this.model.attributes;
                page_context.page_name = this.model.get('name');
                page_context.ind = this.ind;
                page_context.user_roles = v1State.get('users').map(function(userModel) {
                    return userModel.get('name');
                });

                var page = _.template(PageTemplates.tempMenu, page_context);
                var span = document.createElement('span');
                span.innerHTML = page;

                this.el.appendChild(span);
            },

            accessLevelChanged: function(e) {
                this.model.set('access_level', e.target.value);
            },

            deletePage: function() {
                if (this.model.get('name') == "Homepage" || this.model.get('name') == "Registration Page") {
                    new SimpleModalView({
                        text: "The Hompage is an essential part of " + "your application, and can't be deleted."
                    });

                    return;
                }
                // this.model.collection.remove(this.model);
                // this.remove();
            },

            askToDelete :function() {
                var coll = this.model.collection;
                var model = this.model;

                var widgets = v1State.getWidgetsRelatedToPage(this.model);

                if(widgets.length) {
                    console.log(widgets);
                    var widgetsNL = _.map(widgets, function(widget) { console.log(widget); return widget.widget.get('type')+ ' on '+ widget.pageName; });
                    var widgetsNLString = widgetsNL.join('\n');
                    new DialogueView({ text: "The related widgets listed below will be deleted with this page. Do you want to proceed? <br><br> " + widgetsNLString}, function() {
                        
                        coll.remove(model.cid);

                        _.each(widgets, function(widget) {
                            widget.widget.collection.remove(widget.widget);
                        });

                    });
                }
                else {
                    coll.remove(model.cid);
                }

            },

            goToEditor: function(e) {
                e.preventDefault();
                if (this.isMobile) {
                    v1.navigate("app/" + appId + "/mobile-editor/" + this.ind + '/', {
                        trigger: true
                    });
                } else {
                    v1.navigate("app/" + appId + "/editor/" + this.ind + '/', {
                        trigger: true
                    });
                }
            }
        });

        return PageView;
    });