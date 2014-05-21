define(function(require, exports, module) {

    'use strict';

    var UrlView = require('app/pages/UrlView');
    var SimpleModalView = require('mixins/SimpleModalView');
    var DialogueView = require('mixins/DialogueView');
    var HeaderEditorView = require('app/pages/HeaderEditorView');

    require('util');
    require('backbone');

    var tempPage = [
        '<div class="top-row">',
        '<div class="cross" id="close-page-info">×</div>',
        '<div class="title"><%= page_name %> Info</div>',
        '</div>',
        '<div class="page-menu">',
        '<a class="delete item" <% if(disable_edit) { %>style="color: #999"<% } %>><i class="icon-delete"></i>Delete Page</a>',
        '<div class="edit-url item" <% if(disable_edit) { %>style="color: #999"<% } %>><i class="icon-url"></i>Edit URL</div>',
        '<div class="edit-header item" <% if(disable_edit) { %>style="color: #999"<% } %>><i class=""></i>Edit Header</div>',
        '<span class="context-text edit-url"><%= context_text %></span>',
        '</div>'
    ].join('\n');

    var tempMenu = [
        '<span class="span24 hi6">',
        '<h4 class="hi2 span12 hoff1 offset2">Access Level</h4>',
        '<select class="span12 offset2" id="access_level">',
        '<option <% if(access_level == \'all\') { %> selected <% } %> value="all">Everyone</option>',
        '<option <% if(access_level == \'users\') { %> selected <% } %> value="users">All Users</option>',
        // '<% _.each(user_roles, function(role) { %>',
        //   '<option <% if(access_level == role) { %> selected <% } %> value="<%=role%>">Only <%= role %></option>',
        // '<% }); %>',
        '</select>',
        '</div>'
    ].join('\n');


    var PageView = Backbone.View.extend({
        el: null,
        tagName: 'li',
        className: 'page-view hoff2 offsetr1 pane hi22',
        expanded: false,
        events: {
            'click .delete': 'deletePage',
            'change #access_level': 'accessLevelChanged',
            'click .edit-url': 'renderUrl',
            'click .edit-header': 'clickedEditHeader'
        },

        initialize: function(routeModel, templateModel, ind, isMobile) {
            _.bindAll(this);

            if (routeModel !== null) {
                this.model = routeModel;
                this.ind = ind;
                this.isMobile = isMobile;
                this.urlModel = routeModel.get('url');
                this.listenTo(this.model, 'remove', this.close, this);

                this.templateModel = templateModel;
            }
        },

        render: function() {
            if (!this.model) {
                this.el.innerHTML += 'This template has no route. Please add one if you wish to use this template as a page.';
            } else {
                var page_context = {};
                page_context.page_name = this.model.get('name');
                page_context.ind = this.ind;
                page_context.context_text = this.model.getContextSentence();
                // if this is the homepage view,
                // mark 'edit url' link as disabled
                page_context.disable_edit = (this.model.get('name') === 'Homepage') ? true : false;

                var page = _.template(tempPage, page_context);
                this.el.innerHTML += page;

                this.renderMenu();
                return this;
            }
        },

        renderUrl: function() {
            if (!this.model) {
                // homepage url can't be edited
                if (this.model.get('name') === 'Homepage') {
                    return false;
                }
                var newView = new UrlView(this.urlModel, this.model);
            }
        },

        renderMenu: function() {
            var page_context = {};
            page_context = this.model.attributes;
            page_context.page_name = this.model.get('name');
            page_context.ind = this.ind;

            //var page = _.template(tempMenu, page_context);
            var span = document.createElement('span');
            //span.innerHTML = page;
            span.innerHTML = "There will be more info here";

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
            this.askToDelete();
        },

        askToDelete: function() {

            var translateTypetoNL = function(str) {
                if (str == "node") {
                    str = "Widget";
                }

                return str;
            };

            var coll = this.model.collection;
            var model = this.model;

            var widgets = v1State.getWidgetsRelatedToPage(this.model);
            var links = v1State.getNavLinkRelatedToPage(this.model);

            var widgetsNLString = "";
            if (widgets.length) {
                var widgetsNL = _.map(widgets, function(widget) {
                    return translateTypetoNL(widget.widget.get('type')) + ' on ' + widget.pageName;
                });
                widgetsNLString = widgetsNL.join('<br>');

            }

            var linksNLString = "";
            if (links.length) {
                var linksNL = _.map(links, function(link) {
                    return 'Link on ' + link.section + ' of ' + link.pageName;
                });
                linksNLString = linksNL.join('<br>');
            }

            if (!links.length && !widgets.length) {
                coll.remove(model);
            } else {

                new DialogueView({
                    text: "The related widgets listed below will be deleted with this page. Do you want to proceed? <br><br> " + widgetsNLString + linksNLString
                }, function() {

                    coll.remove(model.cid);

                    _.each(widgets, function(widget) {
                        widget.widget.collection.remove(widget.widget);
                    });

                    _.each(links, function(link) {
                        link.link.collection.remove(link.link);
                    });
                });
            }

        },

        clickedEditHeader: function() {
            new HeaderEditorView(this.templateModel);
        },

        expand: function() {
            this.el.className += ' expanded';
            this.el.style.width = "280px";
            this.expanded = true;
        },

        hide: function() {
            this.el.style.width = "";
            this.$el.removeClass('expanded');
            this.expanded = false;
        }
    });

    return PageView;
});
