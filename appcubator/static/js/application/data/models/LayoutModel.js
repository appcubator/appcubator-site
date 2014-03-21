define(['backbone'], function(Backbone) {
    
    var LayoutModel = Backbone.Model.extend({
        
        defaults: {
            'alignment': 'left'
        }

    });

    return LayoutModel;
});