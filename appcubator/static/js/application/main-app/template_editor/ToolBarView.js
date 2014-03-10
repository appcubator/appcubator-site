define(function(require, exports, module) {

    'use strict';

    var RouteModel = require('models/RouteModel'),
        TemplateModel = require('models/TemplateModel');

    require('mixins/BackboneNameBox');

    var tempTemplateItem = [
                '<li class="go-to-page" id="tb-template-<%= templateModel.cid %>">',
                '<span class="page icon"></span>',
                '<a><%= templateModel.get("name") %></a>',
                '</li>'
    ].join('\n');

    var ToolBarView = Backbone.View.extend({
        subviews: [],

        events: {
            'click .go-to-page'    : 'clickedGoToPage',
            'click a.back'         : 'navigateBack',
        },

        initialize: function(options) {
            _.bindAll(this);
            
            this.collection = v1State.get('templates');

            this.pageId = options.pageId;
            this.nmrFields = v1State.get('templates').length + 1;
            
            if (this.nmrFields > 6) this.nmrFields = 6;
            
            this.listenTo(v1State.get('templates'), 'add remove', function() {
                this.nmrFields = v1State.get('templates').length + 1;
                if (this.nmrFields > 6) this.nmrFields = 6;
            }, this);

            this.listenTo(v1State.get('templates'), 'add', this.newTemplateCreated);
        },

        setPage: function(pageId) {
            this.pageId = pageId;
            this.render();
        },

        setTemplate: function(templateModel) {
            this.templateModel = templateModel;
            this.render();
        },

        render: function() {
            if(this.templateModel) {
                util.get('current-page').innerHTML = this.templateModel.get('name');
            }
            else {
                util.get('current-page').innerHTML = "Pages";
            }
            
            this.pageList = util.get('page-list');
            this.pageList.innerHTML = '';

            this.collection.each(function(template, ind) {
                if (this.templateModel == template) return;
                this.renderPageItem(template);
            }, this);

            this.createBox = new Backbone.NameBox({
                txt: 'New Template'
            }).render();
            this.createBox.on('submit', this.createPage);

            util.get('create-page').appendChild(this.createBox.el);

            this.menuPages = document.getElementById('menu-pages');
            return this;
        },

        renderPageItem: function(templateModel) {
            this.pageList.innerHTML += _.template(tempTemplateItem, { templateModel: templateModel });
        },

        clickedGoToPage: function(e) {
            var templateCid = (e.currentTarget.id).replace('tb-template-', '');
            var goToPageId = 0;
            this.collection.each(function (templateM, ind) {
                if (templateM.cid == templateCid) {
                    goToPageId =  ind;
                }
            });

            v1.navigate("app/" + appId + "/template/" + goToPageId + "/", {
                trigger: true
            });
        },

        createPage: function(name) {
            var routeModel = new RouteModel({
                name: name
            });
            routeModel.setupUrl(name);
            routeModel.setGenerator("routes.staticpage");
            v1State.get('routes').push(routeModel);

            var templateModel = new TemplateModel({ name : name });
            templateModel.setGenerator("templates.page");
            this.collection.add(templateModel);

            v1.currentApp.save();
        },

        newTemplateCreated: function(templateM) {
            var str = _.template(tempTemplateItem, { templateModel: templateM });
            this.$el.find('#page-list').append(str);
            util.scrollToBottom(this.$el.find('#page-list'));
        },

        navigateBack: function() {
            window.history.back();
        },

        save: function() {
            v1.save();
            return false;
        }

    });

    return ToolBarView;
});