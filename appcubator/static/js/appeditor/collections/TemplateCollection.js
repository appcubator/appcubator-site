define([
        'models/TemplateModel',
        'mixins/BackboneConvenience'
    ],
    function(TemplateModel) {

        var TemplateCollection = Backbone.Collection.extend({
            model: TemplateModel,

            getTemplateWithName: function(name) {
                var page = null;

                this.each(function(templateModel) {
                    if (templateModel.get('name') == name) {
                        page = templateModel;
                    }
                });

                return page;
            }
        });

        return TemplateCollection;
    });