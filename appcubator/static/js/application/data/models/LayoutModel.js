define(['backbone'], function(Backbone) {
    
    var LayoutModel = Backbone.Model.extend({
        
        defaults: {
            'row': 0,
            'col': 0,
            'alignment': 'left'
        }

    });

    return LayoutModel;
});