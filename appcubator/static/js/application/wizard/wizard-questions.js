questions = {
  // platform : {
  //   questionText: "What platform would you like to develop for?",
  //   answers : {
  //     web : '<div class="a-platform web"><input type="radio" name="platform" value="web" id="web" data-label="Web" style="display: none;"></div>',
  //     mobile : '<div class="a-platform mobile"><input type="radio" name="platform" value="mobile" id="mobile" data-label="Mobile" style="display: none;"></div>',
  //     webmobile : '<div class="a-platform web-mobile"><input type="radio" name="platform" value="web+mobile" id="web+mobile" data-label="Web + Mobile" style="display: none;"></div>'
  //   },
  //   next: function(answer){ return "category"; }
  // },

  category: {
    questionText : "Does your app fall into any of the following categories?",
    answers : {
      'shared-economy' : '<div style="display:block" class="shared-economy"><input type="radio" id="shared-economy" name="category" value="shared-economy" data-label="Shared Economy (e.g. AirBnb)"></div>',
      'marketplace' : '<div style="display:block" class="marketplace"><input type="radio" id="marketplace" name="category" value="marketplace" data-label="Marketplace"></div>',
      'social_network' : '<div style="display:block" class="social-network"><input id="social-network" type="radio" name="category" value="social-network" data-label="Social Network"></div>',
      'e-commerce' : '<div style="display:block" class="e-commerce"><input id="e-commerce" type="radio" name="category" value="e-commerce" data-label="E-Commerce, Online Store"></div>'
    },
    next: function(answers) {
      if(answers[0] == "social_network") {
        return "multiple_users";
      }
      else {
        return "logo";
      }
    }
  },

  multiple_users: {
    questionText: "Do you have multiple type of users?",
    answers: {
      'yes': '<div style="display:block" class="yes"><input type="radio" id="yes" name="multiple_users" value="yes" data-label="Yes, I have multiple type of users"></div>',
      'no' : '<div style="display:block" class="no"><input type="radio" id="no" name="multiple_users" value="no" data-label="No, I have a single type of user"></div>'
    },
    next: function(answer) {
      if(answer == "yes") {
        return "types_of_users";
      }
      else {
        return "user_info";
      }
    }
  },

  types_of_users: {
    questionText: "What are the types of users?",
    multiInp: [],
    next: function(answer) {
      return "X_user_info";
    }
  },

  user_info: {
    questionText: "What information would you like to store about your users?",
    multiInp: [],
    next: function() {
      return "other_info";
    }
  },

  X_user_info: {
    questionText: "What information would you like to store about <%= value %>?",
    multiInp: [],
    next: function() {
      return "other_info";
    }
  },

  other_info: {
    questionText: "What other data would you like to store? (e.g Tweet, Status, Job Offering, Coupon Offer, Feedback...)",
    multiInp: [],
    next: function(answer) {
      return "X_info";
    }
  },

  X_info: {
    questionText: "What information would you like to store about <%= value %>?",
    multiInp: [],
    next: function() {
      return "logo";
    }
  },

  logo: {
    questionText: "Do you have a logo?",
    upload: {},
    next: function() {
      return null;
    }
  }

};
