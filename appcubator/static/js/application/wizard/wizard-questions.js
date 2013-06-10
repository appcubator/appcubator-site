questions = {
  platform : {
    questionText: "What platform would you like to develop for?",
    answers : {
      web : '<div class="a-platform web"><input type="radio" name="platform" value="web" id="web" data-label="Web" style="display: none;"></div>',
      mobile : '<div class="a-platform mobile"><input type="radio" name="platform" value="mobile" id="mobile" data-label="Mobile" style="display: none;"></div>',
      webmobile : '<div class="a-platform web-mobile"><input type="radio" name="platform" value="web+mobile" id="web+mobile" data-label="Web + Mobile" style="display: none;"></div>'
    },
    next: function(answer){ return "category"; }
  },

  category: {
    questionText : "Does your app fall into any of the following categories?",
    answers : {
      'shared-economy' : '<div style="display:block" class="shared-economy"><input type="radio" id="shared-economy" name="category" value="shared-economy" data-label="Shared Economy (e.g. AirBnb)"></div>',
      'marketplace' : '<div style="display:block" class="marketplace"><input type="radio" id="marketplace" name="category" value="marketplace" data-label="Marketplace"></div>',
      'social-network' : '<div style="display:block" class="social-network"><input id="social-network" type="radio" name="category" value="social-network" data-label="Social Network"></div>',
      'e-commerce' : '<div style="display:block" class="e-commerce"><input id="e-commerce" type="radio" name="category" value="e-commerce" data-label="E-Commerce, Online Store"></div>'
    },
    next: function(answer) {
      if(answer == "shared-economy") {
        return "renting";
      }
      else {
        return null;
      }
    }
  },

  renting: {
    questionText : "What are you going to be renting? (e.g. House, car)",
    inputBox: "Type your item type here...",
    next: function(answer) {
      return "information";
    }
  },

  information: {
    questionText : "What information would you like to store about <%= answer %>?"
  }
};
