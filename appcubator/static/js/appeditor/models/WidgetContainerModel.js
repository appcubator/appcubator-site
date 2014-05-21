define([
        'models/WidgetModel',
        'collections/LoginRouteCollection'
    ],
    function(WidgetModel,
        LoginRouteCollection) {

        var WidgetContainerModel = WidgetModel.extend({

            initialize: function(bone, isNew) {
                WidgetContainerModel.__super__.initialize.call(this, bone, isNew);
            },

            createLoginRoutes: function() {
                this.get('data').set('loginRoutes', new LoginRouteCollection());
                v1State.get('users').each(function(userModel) {
                    this.get('data').get('loginRoutes').push({
                        role: userModel.get('name'),
                        redirect: "internal://Homepage"
                    });
                }, this);
            },

            createSearchTarget: function() {
                v1State.get('pages').each(function(pageM) {
                    console.log(pageM.hasSearchList());
                    if (pageM.hasSearchList(this.get('data').get('searchQuery').get('searchOn')) && pageM.isContextFree()) {
                        this.get('data').get('searchQuery').set('searchPage', pageM.getDataLang());
                    }
                }, this);
            },

            serialize: function() {
                var json = _.clone(this.attributes);

                json.layout = this.get('layout').serialize();
                json.data = this.get('data').serialize();
                if (json.context) delete json.context;

                return json;
            }
        });

        return WidgetContainerModel;
    });