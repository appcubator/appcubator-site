define(function(require, exports, module) {

    'use strict';

    var SelectView = require('mixins/SelectView');
    require('util');
    require('util.filepicker');

    var WidgetContentEditorView = Backbone.View.extend({
        el: document.getElementById('content-editor'),
        className: 'content-editor w-section',
        tagName: 'ul',
        events: {
            'keyup .content-editor': 'changedContent',
            'click #toggle-bold': 'toggleBold',
            'click .change-src-btn': 'clickedChangeSrc',
            'click .change-link-btn': 'clickedChangeHref',
            'change .font-picker': 'changeFont',
            'change .statics': 'changeSrc',
            'change .select-href': 'changeHref',
            'submit #external-link-form': 'addExternalLink'
        },

        initialize: function(widgetModel, parentView) {
            _.bindAll(this);

            this.model = widgetModel;
            this.parentView = parentView;
            this.render();
        },

        render: function() {
            if (this.model.has('src')) {
                this.el.appendChild(this.renderSrcInfo());
            }
            if (this.model.has('href') || this.model.generate == "uielements.design-button") {
                this.el.appendChild(this.renderHrefInfo());
            }
        },

        renderHrefInfo: function() {


            // return this.hrefLi;

            var href = (this.model.get('href') || null);
            var li = document.createElement('li');
            li.className = "w-section change-link-btn";
            if (href) {
                li.innerHTML = "Change Link Target";
            } else {
                li.innerHTML = "Add Link";
            }
            return li;
        },

        renderSrcInfo: function() {
            // var li = document.createElement('li');
            // li.appendChild(new comp().div('Image Source').classN('header-div').el);


            // li.appendChild(selecView.el);
            // 

            var li = document.createElement('li');
            li.className = "w-section change-src-btn";
            li.innerHTML = "Change Image Source";
            return li;
        },

        inputChanged: function(e) {
            e.stopPropagation();
            var hash = e.target.id.replace('prop-', '');
            var info = hash.split('-');

            if (info.length == 2) {
                this.mode.get(info[0]).set(info[1], e.target.value);
            } else if (info.length == 1) {
                this.model.set(info[0], e.target.value);
            }
        },

        changedContent: function(e) {
            this.model.set("content", e.target.value);
        },

        changeFont: function(e) {
            if (!this.model.get('content_attribs').has('style')) {
                this.model.get('content_attribs').set('style', 'font-size:12px;');
            }
            var curStyle = this.model.get('content_attribs').get('style');

            if (/font-size:([^]+);/g.exec(curStyle)) {
                curStyle = curStyle.replace(/(font-size:)(.*?)(;)/gi, e.target.value);
            } else {
                curStyle = curStyle + ' ' + e.target.value;
            }

            this.model.get('content_attribs').set('style', curStyle);
            mouseDispatcher.isMousedownActive = false;
        },

        toggleBold: function(e) {
            var curStyle = (this.model.get('content_attribs').get('style') || '');
            if (curStyle.indexOf('font-weight:bold;') < 0) {
                $('#toggle-bold').addClass('selected');
                curStyle += 'font-weight:bold;';
                this.model.get('content_attribs').set('style', curStyle);
            } else {
                $('#toggle-bold').removeClass('selected');
                curStyle = curStyle.replace('font-weight:bold;', '');
                this.model.get('content_attribs').set('style', curStyle);
            }
        },

        staticsAdded: function(files, self) {
            _(files).each(function(file) {
                file.name = file.filename;
                statics.push(file);
            });
            self.model.set('src', _.last(files).url);
            // self.model.get('data').set('content', _.last(files).url);
        },

        clickedChangeSrc: function() {
            var self = this;

            var statics_list = _.map(statics, function(obj) {
                var newObj = {};
                newObj.val = obj.url;
                newObj.name = obj.name;
                return newObj;
            });

            statics_list = _.union({
                val: "new-image",
                name: "Upload New Image"
            }, statics_list);

            var curValName = this.model.get('src');
            if (this.model.has('src_content')) {
                curValName = this.model.get('content_attribs').get('src_content');
            }
            var curVal = {
                name: curValName,
                val: this.model.get('src')
            };

            var selectView = new SelectView(statics_list, curVal, true, {
                maxHeight: 5
            });

            this.parentView.setTempContent(selectView.el);

            selectView.bind('change', this.changeSrc);
            selectView.bind('change', function() {
                self.parentView.removeTempContent();
            });

            selectView.expand();
        },

        changeSrc: function(inp) {
            var self = this;
            if (inp == 'new-image') {
                top.util.filepicker.openFilePick(self.staticsAdded, self, appId);
            } else {
                this.model.set('src', inp);
                //this.model.set('content', inp);
            }
        },

        clickedChangeHref: function() {
            var self = this;
            var listOfPages = v1.currentApp.model.get('routes').map(function(routeModel) {
                return { name: routeModel.get('name'), val: routeModel.getUrlString() };
            });

            var href = (this.model.get('href') || null);

            if (href === null) {
                href = {
                    name: "Currently no Target",
                    val: null
                };
            } else {
                href = {
                    name: href,
                    val: href
                };
            }

            var selectView = new SelectView(listOfPages, href, true, {
                maxHeight: 5
            });

            this.parentView.setTempContent(selectView.el);

            selectView.bind('change', this.changeHref);
            selectView.bind('change', function() {
                self.parentView.removeTempContent();
            });

            selectView.expand();
        },

        changeHref: function(inp) {
            var self = this;
            var target = inp;
            if (target == "External Link") {
                self.hrefLi.innerHTML = '<form id="external-link-form"><input id="external-link-input" type="text" placeholder="http://"></form>';
                $('#external-link-input').focus();
                return;
            }
            // else if (this.model.get('context')) {
            //     target = 'internal://' + target;
            //     target += ('/' + this.model.get('data').get('context'));
            // }
            this.model.set('href', target);
            this.renderHrefInfo();
        },

        addExternalLink: function(e) {
            e.preventDefault();
            var page_link = util.get('external-link-input').value;
            this.model.set('href', page_link);
            $('#external-link-form').remove();
            this.hrefOptions.unshift(page_link);
            this.renderHrefInfo();
        },

        clear: function() {
            this.el.innerHTML = '';
            this.model = null;
            this.remove();
        }
    });

    return WidgetContentEditorView;
});