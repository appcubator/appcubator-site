define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('mixins/BackboneCardView');

    var GeneratorEditorView = require('app/GeneratorEditorView');

    var tableTemplate = [
            '<div class="header">',
                '<div>',
                '<h2>Widget Settings Editor</h2>',
                '<div class="q-mark-circle"></div>',
                '</div>',
                '<ul class="tabs">',
                    '<li class="description-li right-icon">',
                    '<span>Attributes</span>',
                    '</li><li class="code-li right-icon">',
                    '<span>Code</span>',
                    '</li>',
                '</ul>',
            '</div>',
            '<div class="current-content"></div>',
    ].join('\n');

    var TableView = Backbone.CardView.extend({
        el: null,
        tagName: 'div',
        collection: null,
        parentName: "",
        className: 'widget-settings-pane',
        subviews: [],

        events: {
            'change .attribs'     : 'changedAttribs',
            'click .q-mark-circle': 'showTableTutorial',
            'click .right-icon'   : 'tabClicked',
            'keyup .attr-input'   : 'attributeChanged'
        },


        initialize: function(widgetModel) {
            _.bindAll(this);
            this.model = widgetModel;
        },

        render: function() {
            this.el.innerHTML = _.template(tableTemplate, this.model.serialize());
            this.el.id = 'table-' + this.model.cid;
            this.currentContentPane = this.$el.find('.current-content');
            this.renderAttributes();

            return this;
        },

        renderAttributes: function() {
            
            var strHTML = '<ul>';
            _.each(this.model.attributes, function(val, key) {
                if(key == 'layout') return;
                if(Backbone.isModel(val) || Backbone.isCollection(val)) return;

                strHTML += '<li>' + key + '<input type="text" class="attr-input" id="attr-'+key+'" value="' + val +'"></li>';
            });
            strHTML += '</ul>';
            this.currentContentPane.html(strHTML);
        },

        renderData: function() {
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append(new TableDataView(this.model).render().el);
            this.$el.find('.data-li').addClass('active');
        },

        renderCode: function() {
            console.log(this.model);
            console.log(this.model.generate);

            var tableCodeView = new GeneratorEditorView({ generate: this.model.generate });
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append(tableCodeView.render().el);
            tableCodeView.setupAce();
            this.$el.find('.code-li').addClass('active');
        },

        attributeChanged: function(e) {
            var attributeKey = String(e.currentTarget.id).replace('attr-','');
            console.log( e.currentTarget.value);
            console.log(attributeKey);
            this.model.set(attributeKey, e.currentTarget.value);
        },

        tabClicked: function(e) {
            this.$el.find('.active').removeClass('active');

            if($(e.currentTarget).hasClass('description-li')) {
                this.renderDescription();
            }
            else if($(e.currentTarget).hasClass('data-li')) {
                this.renderData();
            }
            else if($(e.currentTarget).hasClass('code-li')) {
                this.renderCode();
            }
        },

        addedEntity: function(item) {
            var optString = '<option value="{{' + item.get('name') + '}}">List of ' + item.get('name') + 's</option>';
            $('.attribs', this.el).append(optString);
        },

        clickedDelete: function(e) {
            this.askToDelete(v1State.get('tables'));
        },

        askToDelete: function(tableColl) {
            var widgets = v1State.getWidgetsRelatedToTable(this.model);
            var model = this.model;
            if (widgets.length) {

                var widgetsNL = _.map(widgets, function(widget) {
                    return widget.widget.get('type') + ' on ' + widget.pageName;
                });
                var widgetsNLString = widgetsNL.join('\n');
                new DialogueView({
                    text: "The related widgets listed below will be deleted with this table. Do you want to proceed? <br><br> " + widgetsNLString
                }, function() {
                    tableColl.remove(model.cid);
                    v1State.get('pages').removePagesWithContext(model);
                    _.each(widgets, function(widget) {
                        widget.widget.collection.remove(widget.widget);
                    });
                });

            } else {
                tableColl.remove(model.cid);
                v1State.get('pages').removePagesWithContext(model);
            }
        },

        clickedUploadExcel: function(e) {
            new AdminPanelView();
        },

        showData: function(e) {
            $.ajax({
                type: "POST",
                url: '/app/' + appId + '/entities/fetch_data/',
                data: {
                    model_name: this.model.get('name')
                },
                success: function(data) {
                    new ShowDataView(data);
                },
                dataType: "JSON"
            });
        },

        typeClicked: function(e) {
            var cid = e.target.id.replace('type-row-', '');
            $('#type-' + cid).click();
            e.preventDefault();
        },

        showTableTutorial: function(e) {
            v1.showTutorial("Tables");
        }

    });

    return TableView;
});