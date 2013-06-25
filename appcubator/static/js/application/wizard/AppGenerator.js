define([
  "backbone"
],
function () {

  var AppGenerator = Backbone.View.extend({
    answersDict : {},

    initialize: function(answers) {
      _.bindAll(this);

      answers = {
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
      };

      this.answers = answers;
      this.generateUsers();
      this.generateTables();
    },

    generateUsers: function() {
      if(this.answers.multiple_users[0][0] == "yes") {

      }
      else {

      }
    },

    generateTables: function() {

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