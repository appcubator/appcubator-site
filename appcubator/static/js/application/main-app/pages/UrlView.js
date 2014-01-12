define([
        'mixins/DialogueView',
        'mixins/BackboneModal',
        'app/templates/UrlTemplates'
    ],
    function(DialogueView) {

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
                'click .new-context': 'askToAddContext',
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

            addNewContextPart: function(e) {

                if (v1State.get('tables').length > 0) {
                    var firstTableName = "{{" + v1State.get('tables').at(0).get('name') + "}}";
                    this.model.get('urlparts').push({
                        value: firstTableName
                    });
                } else if (v1State.get('users').length > 0) {
                    var firstUserName = "{{" + v1State.get('users').at(0).get('name') + "}}";
                    this.model.get('urlparts').push({
                        value: firstUserName
                    });
                } else {
                    alert("Create a Table or User before adding a context value");
                }
                this.$('.context-part').last().focus();

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