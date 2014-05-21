define([
        'TemplateGenerator',
        'mixins/BackboneModal'
    ],
    function(TemplateGenerator) {

        var page_templates = [];

        var PageTemplatePicker = Backbone.View.extend({
            className: 'page-template-picker',
            width: 700,
            height: 480,
            events: {
                'click .static-template': 'staticSelected',
                'click .info-template': 'infoSelected',
                'click .list-template': 'listSelected'
            },

            initialize: function(options) {
                _.bindAll(this);
                this.model = options.model;
                this.options = options;
                this.render();
            },

            staticSelected: function(e) {
                var tempId = String(e.currentTarget.id).replace('page-', '');
                this.model.get('uielements').add(page_templates[tempId].uielements);

                util.log_to_server("template selected", "static", appId);
                this.closeModal();
            },

            infoSelected: function(e) {
                var tableId = String(e.currentTarget.id).replace('table-info-', '');
                var tableModel = v1State.get('tables').get(tableId);

                if (!this.model.hasContext(tableModel)) {
                    this.model.addToContext(tableModel);
                }

                var appGen = new AppGenerator();
                this.model.get('uielements').add(appGen.generateInfoPage(tableModel), false);

                util.log_to_server("template selected", "info", appId);
                this.closeModal();
            },

            listSelected: function(e) {
                var tableId = String(e.currentTarget.id).replace('table-list-', '');
                var tableModel = v1State.get('tables').get(tableId);

                var appGen = new AppGenerator();
                this.model.get('uielements').add(appGen.generateListPage(tableModel), false);

                util.log_to_server("template selected", "list", appId);
                this.closeModal();
            },

            render: function() {
                var self = this;
                this.el.innerHTML = "<h2>Pick A Template</h2><p>Looks like this page is blank. Would you like to start with one of the templates?</p>";

                var list = document.createElement('ul');
                list.className = 'template-icons';
                _(page_templates).each(function(page, ind) {
                    list.innerHTML += '<li class="page-template static-template" id="page-' + ind + '"><img src="/static/img/page_templates/' + page.icon + '"><span>' + page.name + '</span></li>';
                });

                v1State.get('tables').each(function(tableM) {
                    list.innerHTML += '<li class="page-template info-template" id="table-info-' + tableM.cid + '"><img src="/static/img/page_templates/info-page-icon.png"><span>' + tableM.get('name') + ' Info Page</span></li>';
                    list.innerHTML += '<li class="page-template list-template" id="table-list-' + tableM.cid + '"><img src="/static/img/page_templates/list-page-icon.png"><span>' + tableM.get('name') + ' List Page</span></li>';
                });

                this.el.appendChild(list);
                return this;
            },

            closeModal: function() {
                if (this.options.callback) {
                    this.options.callback.call();
                }
            }
        });

        return PageTemplatePicker;
    });
