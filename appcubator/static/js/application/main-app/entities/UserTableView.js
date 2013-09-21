define([
        'models/FieldModel',
        'app/entities/TableView',
        'app/entities/UploadExcelView',
        'app/entities/ShowDataView',
        'app/SoftErrorView',
        'app/templates/TableTemplates',
        'prettyCheckable'
    ],
    function(FieldModel, TableView, UploadExcelView, ShowDataView, SoftErrorView) {

        var UserTableView = TableView.extend({
            el: null,
            subviews: [],

            initialize: function(userTableModel) {
                _.bindAll(this);
                this.model = userTableModel;
                this.fieldsCollection = userTableModel.getFieldsColl();

                this.listenTo(this.model, 'remove', this.remove);
                this.listenTo(this.model.get('fields'), 'add', this.appendField);
                this.listenTo(this.model.get('fields'), 'remove', this.removeField);
                this.listenTo(this.model, 'newRelation removeRelation', this.renderRelations);

                this.tables = v1State.get('tables').pluck('name');
                this.otherUserRoles = _(v1State.get('users').pluck('name')).without(this.model.get('name'));
                this.bindDupeWarning();
            },


            render: function() {
                this.el.innerHTML = _.template(TableTemplates.UserTable, this.model.toJSON());
                this.el.id = 'user-table-' + this.model.cid;

                this.renderProperties();
                this.renderRelations();
                this.disablePredefinedVals();

                util.loadCSS('prettyCheckable');
                this.$el.find('input[type=checkbox]').prettyCheckable();
                this.adjustTableWidth();

                this.addPropertyBox = new Backbone.NameBox({}).setElement(this.$el.find('.add-property-column').get(0)).render();
                this.subviews.push(this.addPropertyBox);
                this.addPropertyBox.on('submit', this.createNewProperty);
                this.adjustTableWidth();

                return this;
            },

            disablePredefinedVals: function() {
                _(v1State.get('users').predefinedFields).each(function(field) {
                    var column = this.$el.find('#column-' + field.cid);
                    column.find('select').attr('disabled', 'disabled');
                    column.find('.prop-cross').remove();
                }, this);
            },

            clickedDelete: function(e) {
                this.askToDelete(v1State.get('users'));
            },

            appendField: function(fieldModel) {
                // don't append field if it's a relational field
                if (fieldModel.isRelatedField()) {
                    return false;
                }
                var page_context = {};
                page_context = _.clone(fieldModel.attributes);
                page_context.cid = fieldModel.cid;
                page_context.nlType = fieldModel.getNLType();
                page_context.entityName = this.model.get('name');
                page_context.entities = this.tables.concat(this.otherUserRoles);
                var template = _.template(TableTemplates.Property, page_context);

                this.$el.find('.property-list').append(template);
                this.adjustTableWidth();
            },

            adjustTableWidth: function() {
                var width = (this.model.get('fields').length + 7) * 94;
                this.width = width;
                this.$el.find('.tbl').css('width', width);
                if (width > 870 && !this.hasArrow) {
                    this.hasArrow = true;
                    var div = document.createElement('div');
                    div.className = 'right-arrow';
                    this.$el.find('.description').append(div);
                }
            },

            showTableTutorial: function(e) {
                v1.showTutorial("User Tables");
            }

        });

        return UserTableView;
    });