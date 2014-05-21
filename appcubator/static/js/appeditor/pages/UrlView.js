define(function(require, exports, module) {

    'use strict';

    var DialogueView = require('mixins/DialogueView');
    require('mixins/BackboneModal');

    var UrlTemplate = {};

    UrlTemplate.mainTemplate = [
    '<h3 class="hi3 hoff1 edit-url">Edit URL</h3>',
    '<div class="row well well-small">',
    '<p class="span24 offset2 hoff1"><strong>Full URL: </strong><span class="full-url"></span></p>',
    '</div>',
    '<form class="form-horizontal">',
    '<ul class="row hoff1 url-parts"></ul>',
    '<div class="row hoff2 hi3 offset2">',
    '<div class="btn btn-info btn-small offset1 new-suffix">+ Add Custom Text</div>',
    '</div>',
    '</form>'
    ].join('\n');

    UrlTemplate.contextTemp = [
    '<label class="control-label">Context Data:</label>',
    '<select class="context-part span16 offset1" id="form-<%= cid %>">',
    '<% _.each(entities, function(name, i) { %>',
    '<option value="<%= name %>" <% if(name == value) { %> selected <% } %> > <%= name %> ID</option>',
    '<% }); %>',
    '</select>',
    '<span id="remove-<%= cid %>" class="remove offset1">×</span>',
    ].join('\n');

    UrlTemplate.suffixTemp = [
    '<label class="control-label">Custom Text:</label>',
    '<input type="text" id="form-<%= cid %>" class="span16 offset1 suffix-part" placeholder="customtext" value="<%= value %>">',
    '<span id="remove-<%= cid %>" class="remove offset1">×</span>',
    ].join('\n');


    var UrlView = Backbone.ModalView.extend({
        padding: 0,
        width: 600,
        id: 'url-editor',
        //height: 150,
        events: {
            'change .context-part': 'contextPartChanged',
            'keyup .suffix-part': 'suffixPartChanged',
            'keyup .page-name': 'pageNameChanged',
            'click .remove': 'clickedRemove',
            'click .new-suffix': 'addNewSuffixPart',
            'submit form': 'cancelFormSubmit'
        },

        initialize: function(urlModel, pageModel) {
            _.bindAll(this);

            this.model = urlModel;
            this.pageModel = pageModel;
            this.listenTo(this.model.get('urlparts'), 'add remove', this.renderFullUrl);
            this.listenTo(this.model.get('urlparts'), 'change:value', this.renderFullUrl);
            this.listenTo(this.model.get('urlparts'), 'add', this.appendUrlPartForm);
            this.listenTo(this.model.get('urlparts'), 'remove', this.removeUrlPart);
            this.listenTo(this.model.get('urlparts'), 'reset', this.renderUrlParts);
            this.render();
        },

        render: function() {
            var temp = UrlTemplate.mainTemplate;
            this.el.innerHTML = _.template(temp, this.model.serialize());
            this.renderUrlParts();
            this.renderFullUrl();

            this.$('.url-parts').sortable({
                stop: this.changedOrder,
                axis: 'y'
            });

            return this;
        },

        renderFullUrl: function() {
            this.$('.full-url').text(this.model.getUrlString());
        },

        renderUrlParts: function() {
            this.$('.url-parts').empty();
            this.model.get('urlparts').each(this.appendUrlPartForm);
        },

        appendUrlPartForm: function(urlpart, index) {
            var value = urlpart.get('value');

            // render table urlpart
            if (value.indexOf('{{') === 0) {
                var variable = value.replace('{{', '').replace('}}', '');
                var newContext = document.createElement('li');
                newContext.className = 'row hoff1';
                newContext.id = "urlpart-" + urlpart.cid;
                newContext.innerHTML = _.template(UrlTemplate.contextTemp, {
                    cid: urlpart.cid,
                    value: variable,
                    entities: _.union(v1State.get('tables').pluck('name'), v1State.get('users').pluck('name'))
                });
                this.$('.url-parts').append(newContext);
            }

            // render suffix urlpart
            else {
                var newSuffix = document.createElement('li');
                newSuffix.className = 'row hoff1';
                newSuffix.id = "urlpart-" + urlpart.cid;
                newSuffix.innerHTML = _.template(UrlTemplate.suffixTemp, {
                    cid: urlpart.cid,
                    value: value
                });
                this.$('.url-parts').append(newSuffix);
            }
        },

        clickedRemove: function(e) {
            var cid = e.currentTarget.id.replace('remove-', '');
            this.model.get('urlparts').remove(cid);
        },

        removeUrlPart: function(urlpart, index) {
            this.$('#urlpart-' + urlpart.cid).remove();
        },

        contextPartChanged: function(e) {
            var cid = e.target.id.replace('form-', '');
            this.model.get('urlparts').get(cid).set('value', "{{" + e.target.value + "}}");
            return false;
        },

        suffixPartChanged: function(e) {
            var cid = e.target.id.replace('form-', '');
            this.model.get('urlparts').get(cid).set('value', e.target.value);
            return false;
        },

        pageNameChanged: function(e) {
            this.model.set('name', e.currentTarget.value);
            this.renderFullUrl();
        },

        askToAddContext: function() {
            var self = this;
            var translateTypetoNL = function(str) {
                if (str == "node") {
                    str = "Widget";
                }
                return str;
            };

            var model = this.model;

            var widgets = v1State.getWidgetsRelatedToPage(this.pageModel);
            var links = v1State.getNavLinkRelatedToPage(this.pageModel);

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
                self.addNewContextPart();
            } else {

                new DialogueView({
                    text: "The elements listed below will be deleted if you add a context to this URL because they will no longer be valid. Do you want to proceed? <br><br> " + widgetsNLString + linksNLString
                }, function() {

                    _.each(widgets, function(widget) {
                        widget.widget.collection.remove(widget.widget);
                    });

                    _.each(links, function(link) {
                        link.link.collection.remove(link.link);
                    });

                    self.addNewContextPart();
                });
            }
        },

        addNewSuffixPart: function(e) {
            this.model.get('urlparts').push({
                value: 'customtext'
            });
            this.$('.suffix-part').last().focus();
        },

        changedOrder: function(e, ui) {
            var self = this;
            var sortedIDs = $('.url-parts').sortable("toArray");
            console.log(this.model.get('urlparts').serialize());

            var newUrlParts = _(sortedIDs).map(function(id) {
                return self.model.get('urlparts').get(id.replace('urlpart-', ''));
            });

            this.model.get('urlparts').reset(newUrlParts);
            console.log(this.model.get('urlparts').serialize());
        },
        cancelFormSubmit: function() {
            return false;
        }
    });

    return UrlView;
});
