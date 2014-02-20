define([
        'models/AppInfoModel',
        'collections/NodeModelCollection',
        'collections/EmailCollection',
        'collections/TemplateCollection',
        'models/PluginsModel',
        'models/EntityManager'
    ],
    function(AppInfoModel,
        NodeModelCollection,
        EmailCollection,
        TemplateCollection,
        PluginsModel,
        EntityManager) {

        var AppModel = Backbone.Model.extend({

            currentPage: null,
            isMobile: false,
            lazy: {},

            initialize: function(aState) {
                if (!aState) return;

                this.set('info', new AppInfoModel(aState.info));
                this.set('models', new NodeModelCollection(aState.models));
                this.set('emails', new EmailCollection(aState.emails));
                this.set('templates', new TemplateCollection(aState.templates));
                this.set('plugins', new PluginsModel(aState.plugins || {}));

            },

            getPages: function() {
                if (!this.isMobile) {
                    return this.get('pages');
                } else {
                    return this.get('mobilePages');
                }
            },

            getTableModelWithName: function(nameStr) {
                var tableM = this.get('tables').getTableWithName(nameStr);
                if (!tableM) tableM = this.get('users').getTableWithName(nameStr);
                return tableM;
            },

            getTableModelWithCid: function(cid) {
                var tableM = this.get('tables').get(cid);
                if (!tableM) tableM = this.get('users').get(cid);
                return tableM;
            },

            isSingleUser: function() {
                return this.get('users').length == 1;
            },

            lazySet: function(key, coll) {
                this.lazy[key] = coll;
                this.set(key, new Backbone.Collection([]));
            },

            get: function(key) {
                if (this.lazy[key]) {
                    this.set(key, this.lazy[key]);
                    delete this.lazy[key];
                }

                return AppModel.__super__.get.call(this, key);
            },

            getWidgetsRelatedToTable: function(tableM) {
                return new EntityManager({
                    pages: this.get('pages')
                }).getWidgetsRelatedToTable(tableM);
            },

            getWidgetsRelatedToPage: function(pageM) {
                return new EntityManager({
                    pages: this.get('pages')
                }).getWidgetsRelatedToPage(pageM);
            },

            getNavLinkRelatedToPage: function(pageM) {
                return new EntityManager({
                    pages: this.get('pages')
                }).getLinksRelatedToPage(pageM);
            },

            getWidgetsRelatedToField: function(fieldM) {
                return new EntityManager({
                    pages: this.get('pages')
                }).getWidgetsRelatedToField(fieldM);
            },

            serialize: function() {
                var json = _.clone(this.attributes);
                json.info = json.info.serialize();
                json.models = json.models.serialize();
                json.emails = json.emails.serialize();
                json.templates = json.templates.serialize();
                json.routes = json.routes.serialize();
                json.plugins = json.plugins.serialize();

                return json;
            }
        });

        return AppModel;
    });
