define([
  "models/AppModel",
  "models/AppInfoModel",
  "models/PageModel",
  "models/WidgetModel",
  "models/WidgetContainerModel",
  "collections/WidgetCollection",
  "collections/MobilePageCollection",
  "collections/PageCollection",
  "collections/UserRolesCollection",
  "collections/TableCollection",
  "collections/EmailCollection",
  "wizard/homepage_temp",
  "backbone"
],
function(AppModel,
         AppInfoModel,
         PageModel,
         WidgetModel,
         WidgetContainerModel,
         WidgetCollection,
         MobilePageCollection,
         PageCollection,
         UserRolesCollection,
         TableCollection,
         EmailCollection) {

  var AppGenerator = Backbone.View.extend({
    answersDict : {},

    initialize: function(answers) {
      _.bindAll(this);

      // this.answersDict = answers;

      // v1State = new AppModel();
      // v1State.set('users', this.generateUsers());
      // v1State.set('tables', this.generateTables());
      // v1State.set('pages', this.generatePages());
      // v1State.set('mobilePages', new MobilePageCollection());
      // v1State.set('info', new AppInfoModel({}));
      // v1State.set('emails', new EmailCollection({}));
      // v1State.set('name', appName);

      // this.state  = v1State;
    },

    generateUsers: function() {
      var usersCollection = new UserRolesCollection();
      if(this.answersDict.multiple_users[0][0] == "yes") {
        _(this.answersDict.types_of_users[0]).each(function(user_role, ind) {
          var user = usersCollection.createUserWithName(user_role);
          user.addFieldsWithNames(this.answersDict.X_user_info[ind]);
        }, this);
      }
      else {
        var user = usersCollection.createUserWithName("User");
        user.addFieldsWithNames(this.answersDict.user_info[0]);
      }

      return usersCollection;
    },

    generateTables: function() {
      var tablesColl = new TableCollection();
      _(this.answersDict.other_info[0]).each(function(table_name, ind) {
        var table = tablesColl.createTableWithName(table_name);
        table.addFieldsWithNames(this.answersDict.X_info[ind]);
      }, this);

      return tablesColl;
    },

    generatePages: function() {
      var pageColl = new PageCollection();
      pageColl.push(this.generateHomepage());
      pageColl.push(this.generateRegistrationPage());

      return pageColl;
    },

    generateHomepage: function() {
      var homepage = _.clone(HomepageTemp);
      homepage.uielements[0].data.content = appName;
      if(this.answersDict.intro_text) homepage.uielements[1].data.content = this.answersDict.intro_text[0][0];

      if(this.answersDict.logo[0]) {
        homepage.uielements[2].data.content_attribs.src = this.answersDict.logo[0];
      }
      return homepage;
    },

    generateRegistrationPage: function() {

    },

    generateProfilePage: function() {

    },

    generateInfoPage: function(tableM) {
      var arr = [];

      var nmrElements = 0;
      var nmrImageElements = 0;
      var hasImageElements = 0;
      var widgetCollection = new WidgetCollection();
      if(tableM.get('fields').getImageFields()) hasImageElements = 1;
      tableM.getFieldsColl().each(function(fieldModel) {

        var type = fieldModel.get('type');
        if(type == "fk"||type == "m2m"||type == "o2o") { return; }

        var displayType = util.getDisplayType(type);
        var formFieldModel = { field_name: fieldModel.get('name'),
                               displayType: "single-line-text",
                               type: type,
                               label: fieldModel.get('name'),
                               placeholder: fieldModel.get('name') };

        var layout = {left : hasImageElements*3 + 2, top: nmrElements*3 + 12, height: 3, width: 5};
        var content_ops = {};
        content_ops.content =  '{{page.'+ tableM.get('name') +'.'+fieldModel.get('name')+'}}';

        if(displayType == "links") {
          content_ops.content = 'Download '+fieldModel.get('name');
          content_ops.href = '{{page.'+ tableM.get('name') +'.'+fieldModel.get('name')+'}}';
        }

        if(displayType == "images") {
          layout = {left : 2, top: nmrImageElements*9 + 12, height: 9, width: 2};
          content_ops.src_content = '{{page.'+ tableM.get('name') +'.'+fieldModel.get('name')+'}}';
          nmrImageElements++;
        }
        else {
          nmrElements++;
        }

        var newElement = widgetCollection.createNodeWithFieldTypeAndContent(layout, displayType, content_ops);
        arr.push(newElement);
      });

      var headerModel = widgetCollection.createNodeWithFieldTypeAndContent({ left:3, height:3, width: 6, top: 3, alignment: "center"},
                                                                             "headerTexts",
                                                                             {content: tableM.get('name') + " Info" });

      arr.push(headerModel);

      return arr;
    },

    generateListPage: function(tableM) {
      var widgetCollection = new WidgetCollection();
      var headerModel = widgetCollection.createNodeWithFieldTypeAndContent({ left:3, height:3, width: 6, top: 3, alignment: "center"},
                                                                             "headerTexts",
                                                                             {content: "List of " + tableM.get('name') });
      var listModel   = widgetCollection.createList({ left:3, height:3, width: 6, top: 11}, tableM);

      var arr = [];
      arr.push(listModel);
      arr.push(headerModel);

      return arr;
    },

    getJSON: function() {
      return this.state.toJSON();
    }

  });

  return AppGenerator;

});


/* EXAMPLE */
/*
{
    "category": [
        [
            "social_network"
        ]
    ],
    "multiple_users": [
        [
            "yes"
        ]
    ],
    "types_of_users": [
        [
            "Student",
            "Company"
        ]
    ],
    "X_user_info": [
        [
            "Name",
            "Address"
        ],
        [
            "Name",
            "School"
        ]
    ],
    "other_info": [
        [
            "Offer"
        ]
    ],
    "X_info": [
        [
            "Position",
            "Date"
        ]
    ],
    "logo": [
        []
    ]
}
*/