define([
  "models/AppModel",
  "models/AppInfoModel",
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
         MobilePageCollection,
         PageCollection,
         UserRolesCollection,
         TableCollection,
         EmailCollection) {

  var AppGenerator = Backbone.View.extend({
    answersDict : {},

    initialize: function(answers) {
      _.bindAll(this);

      this.answersDict = answers;

      this.state = new AppModel();
      this.state.set('users', this.generateUsers());
      this.state.set('tables', this.generateTables());
      this.state.set('pages', this.generatePages());
      this.state.set('mobilePages', new MobilePageCollection());
      this.state.set('info', new AppInfoModel({}));
      this.state.set('emails', new EmailCollection({}));
      this.state.set('name', appName);
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