define([
  'tourist'
],
function() {
  var steps = [
    /*
     * Question btn
     */
    {
      target: $('.qm-btn'),
      content: '<h3>Questions?</h3><p>Please follow the directions written in these  small boxes. You can click the question marks to learn details.</p>',
      my: "right center",
      at: "left center",
      teardown: function() {
        v1State.attributes.walkthrough++;
      },
      nextButton: true,
      highlightTarget: true
    },
    /*
     * Tables Menu Nav
     */
    {
      target: $('.menu-app-entities'),
      content: '<h3>Tables</h3><p>Go to tables page.</p>',
      my: "top center",
      at: "bottom center",
      setup: function(tour, options) {
        v1.bind('entities-loaded', function() {
          tour.next();
        });
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * Add User Role btn
     */
    {
      content: '<h3>Adding Roles</h3><p>You already have a user role set up, but this is where you setup new roles for your application.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      setup: function() {
        return {  target: $('#add-role') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * Add Table btn
     */
    {
      content: '<h3>Adding A Table</h3><p>Since you\'d like to store tweets, you need create a Tweet table. Click "Add Table" button and name the table <strong>Tweet</strong>.</p>',
      my: "right center",
      at: "left center",
      bind: ['checkForm'],
      checkForm: function(tour, options, e) {
        if(e.keyCode !== 13) return;
        if(e.currentTarget.value !== "Tweet") {
          alert("You should name your table as 'Tweet' for the purpose of this demo.");
          e.stopPropagation();
        }
      },
      setup: function(tour, options) {
        util.scrollToElement($('#add-entity'));
        $('#add-entity').on('click', function() {
          setTimeout(function() {
            tour.view.setTarget($('#add-entity-form'));
            tour.view.show();
          }, 200);
        });

        $('#add-entity-form').on('keypress', this.checkForm);

        v1State.get('tables').on('add', function(tableModel) {
          if(tableModel.get('name') == "Tweet") {
            options.cid = tableModel.cid;
            tour.next();
          }
          else {
            this.remove(tableModel);
          }
        });
        return {  target: $('#add-entity') };
      },
      teardown: function(tour, options) {
        $('#add-entity-form').off('keypress', this.checkForm);
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * Tweet Table
     */
    {
      content: '<h3>Congrats!</h3><p>You have a table storing the tweets now. Time to define what information fields this table stores.</p>',
      my: "left top",
      at: "top center",
      setup: function(tour, options) {
        return { target: $('#table-' + options.cid + ' .header') };
      },
      nextButton: true,
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * Add Property btn
     */
    {
      content: '<h3>Create a Field</h3><p>Every tweet contains a message, a text of the actual tweet. Let\'s add our first property, calling it <strong>Content</strong>, and giving it a type of <strong>Text</strong></p>',
      bind: ['checkField'],
      checkField: function(tour, options, e) {
        if(e.keyCode !== 13) return;
        if(e.currentTarget.value !== "Content") {
          alert("You should name your field as 'Content' for the purpose of this demo.");
          e.stopPropagation();
        }
      },
      setup: function(tour, options) {
        $('.property-name-input').on('keypress', this.checkField);
        var cid =  v1State.get('tables').getTableWithName("Tweet").cid;
        v1State.get('tables').getTableWithName("Tweet").get('fields').on('add', function(fieldModel) {
          if(fieldModel.get('name') == "Content") {
            options.propertyCid = fieldModel.cid;
            tour.next();
          }
          else {
            this.remove(fieldModel);
          }
        });
        return { target: $('#table-' + cid).find('.add-property-column').first() };
      },
      teardown: function(tour, options) {
        v1State.attributes.walkthrough++;
        $('.property-name-input').on('keypress', this.checkField);
      }
    },
    /*
     * About Relations
     */
    {
      content: '<h3>Nice!</h3><p>So we\'ve described a tweet as an entity that consists of some "Content" text. But how do we associate <strong>Tweets</strong> with <strong>Users</strong>?</p>',
      my: "left top",
      at: "right center",
      setup: function(tour, options) {
        return { target: $('#column-' + options.propertyCid) };
      },
      nextButton: true,
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * Add Relation btn
     */
    {
      content: '<h3>Adding A Relation</h3><p>Click the button below to add a new relation</p>',
      my: "bottom center",
      at: "top center",
      setup: function(tour) {
        util.scrollToElement($('#add-relation'));
        $('#add-relation') .on('click', tour.next);
        return {  target: $('#add-relation') };
      },
      teardown: function(tour, options) {
        $('#add-relation').off('click', tour.next);
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * Create Relation Options
     */
    {
      content: '<h3>What kind of Relationship?</h3><p>We want to describe a relationship between <strong>Users</strong> and <strong>Tweets</strong>, so choose this option.</p>',
      my: "bottom left",
      at: "top left",
      setup: function(tour) {
        $('.select-view ul li:first-child').one('click', function() {
          tour.next();
        });
        return {  target: $('#relations') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * Create Relation Form
     */
    {
      content: '<h3>How are Users and Tweets related?</h3><p>Each User owns many tweets, and each individual tweet belongs to a User. We need to give property names for the list of tweets and the user owner. Let\'s call these new properties <strong>Tweets</strong> and <strong>Owner</strong></p>',
      my: "left center",
      at: "top center",
      bind: ['checkFields'],
      checkFields: function(tour, options, e) {
        var form = $('.edit-relation-div');
        var form1 = form.find('.new-relation:first-child');
        var form2 = form.find('.new-relation').eq(1);

        var user_select = form1.find('select').val();
        var related_name = form1.find('input').val();
        var tweet_select = form2.find('select').val();
        var name = form2.find('input').val();

        if(user_select !== 'many' || related_name !== 'Tweets' || tweet_select !== 'one' || name !== 'Owner') {
          alert('Make sure you enter "Tweets" in the first box, and "Owner" in the second box');
          e.stopPropagation();
        }
        else {
          tour.next();
        }
      },
      setup: function(tour, options) {
        util.scrollToElement($('#new-relation'));
        var self = this;
        setTimeout(function() {
          $('.done-relation').on('click', self.checkFields);
        }, 500);
        return {  target: $('#new-relation') };
      },
      teardown: function(tour, options) {
        $('.done-relation').off('click', this.checkFields);
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * User-Tweet relation
     */
    {
      content: '<h3>GREAT!</h3><p>Now that there is a one-to-many relation between your users and tweets, you\'re done with the harder part.</p>',
      my: "left center",
      at: "right center",
      nextButton: true,
      setup: function(tour, options) {
        util.scrollToElement($('#new-relation'));
        var self = this;
        setTimeout(function() {
          tour.view.setTarget($('.relation:first-child'));
          tour.view.show();
        }, 250);
        return { target: $('.relation-pane') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Time to Make it Look Good</h3><p>Click here and go to Themes page.</p>',
      my: "top center",
      at: "bottom center",
      target: $('.menu-app-themes'),
      setup: function(tour, options) {
        v1.bind('themes-loaded', function() {
          tour.next();
        });
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Theme</h3><p>We have a variaty of themes here. Pick the one you like the most and clik on it to load. Make sure you click the "Load Theme" button.',
      my: "left center",
      at: "right center",
      nextButton: true,
      setup: function() {
        return { target: $('#themes-title') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Pages</h3><p>Time to put things together. Click on the "Pages" tab to go to Pages Page.',
      my: "top center",
      at: "bottom center",
      target: $('.menu-app-pages'),
      setup: function(tour, options) {
        v1.bind('pages-loaded', function() {
          tour.next();
        });
      },
      teardown: function() {
        v1.unbind('pages-loaded')
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Homepage</h3><p>You have a homepage by default. Ideally you would put the login and signup forms here as well a good explanation of your app. But before that, let\'s create a page for our tweets to show up.</p>',
      my: "left center",
      at: "right center",
      nextButton: true,
      setup: function(tour, options) {
        return { target: $('.page-view').first() };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Crete a New Page</h3><p>Click on this large button.</p>',
      my: "top center",
      at: "bottom center",
      setup: function(tour, options) {
        $('.create-page').one('click', function() {
          tour.next();
        });

        return { target : $('.create-page').first() };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Name Your Page</h3><p>Name your page "Tweet Feed" and press enter.</p>',
      my: "top center",
      at: "bottom center",
      setup: function(tour, options) {
        v1State.get('pages').bind('add', function(pageModel) {
          if(pageModel.get('name') == "Tweet Feed") {
            tour.next();
          }
          else {
            alert('You should name your page "Tweet Feed". Just for the sake of the demo. Otherwise this is a free country.');
          }
        });
        return { target: $('.page-name') };
      },
      teardown: function() {
        v1State.get('pages').unbind('add');
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Alright</h3><p>We can go ahead and start editing our pages. Please click "Edit Page".</p>',
      my: "left center",
      at: "right center",
      setup: function(tour, options) {
        v1.bind('editor-loaded', function() {
          setTimeout(function() {
            tour.next();
          }, 120);
        });
        return { target: $('.edit.item').first() };
      },
      teardown: function() {
        v1.unbind('editor-loaded');
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Welcome to Editor</h3><p>This is the what you see is what you get interface editor. You can freely drag and drop elemetn from the elements on the gallery and position them however you like.</p>',
      my: "right top",
      at: "left bottom",
      nextButton: true,
      setup: function(tour, options) {
        return { target: $('.search-panel') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Saving Your Progress</h3><p>Before you start, please don\'t forget to save your progress by clicking this "Save" button.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      setup: function(tour, options) {
        $('#item-gallery').animate({
          scrollTop: $("#type-headerTexts").offset().top + 20
        }, 200);

        return { target: $('#editor-save') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Drag\'n\'Drop</h3><p>Just drag this header text to the page, aaand drop. Feel free to edit the text to something you want!</p>',
      my: "right center",
      at: "left center",
      setup: function(tour, options) {

        v1State.getCurrentPage().get('uielements').bind('add', function(uielem) {
          if(uielem.get('data').get('tagName') == "h1") {
            tour.next();
          }
        });

        return { target: $('#type-headerTexts') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Editing Elements</h3><p>You can change the text or click on "Pick Style" to edit this header.</p>',
      my: "left center",
      at: "right center",
      nextButton: true,
      setup: function(tour, options) {
        $('#item-gallery').animate({
          scrollTop: $("#entity-user-facebook").offset().top + 20
        }, 200);

        return { target: $('.pick-style') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Time to get some users!</h3><p>Just drag this header text to the page, aaand drop. Feel free to edit the text to something you want!</p>',
      my: "top center",
      at: "bottom center",
      setup: function(tour, options) {

        v1State.getCurrentPage().get('uielements').bind('add', function(uielem) {
          if(uielem.get('data').get('action') == "thirdpartylogin") {
            tour.next();
          }
        });

        return { target: $('#entity-user-facebook') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Let\'s move to the other page.</h3><p>Please hover over the page menu and click on "Tweet Feed" to go to the other page.</p>',
      my: "top center",
      at: "bottom center",
      setup: function(tour, options) {
        v1.bind('editor-loaded', function() {
          tour.next();
        });

        return {target:  $('.menu-button.pages')};
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
        v1.unbind('editor-loaded');
      }
    },
    {
      content: '<h3>Feed Page</h3><p>On this page, we would like to put a list of all the Tweet, something like a stream as well as a form to tweet new stuff. Let\'s start with the list first.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      setup: function(tour, options) {

        $('#item-gallery').animate({
          scrollTop: $(".entity-list").offset().top - 90
        }, 200);

        return { target: $('.menu-button.pages') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Let\'s make a list</h3><p>Drag and drop the Tweet List to the top middle of the page.</p>',
      my: "right center",
      at: "left center",
      setup: function(tour, options) {

        v1State.getCurrentPage().get('uielements').bind('add', function(uielem) {
          console.log(uielem);
          if(uielem.get('type') == "loop") {
            setTimeout(function() {
              tour.next();
            }, 300);
          }
        });

        return { target: $('.entity-list') };
      },
      teardown: function() {
        v1State.getCurrentPage().get('uielements').unbind('add');
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>We have the list of Tweets!</h3><p>Now we can start editing by clickin "Edit Row" button.</p>',
      my: "bottom center",
      at: "top center",
      setup: function(tour, options) {

        $('.edit-row-btn').one('click', function() {
            setTimeout(function() {
              tour.next();
            }, 300);
        });

        return { target: $('.edit-row-btn') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>The Green Row</h3><p>The green area is the first, editable row. You should start droping elements on this area.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      setup: function(tour, options) {

        return { target: $('.highlighted').first() };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Content of the Tweet</h3><p>Drag\'n\'Drop it on the green area.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      setup: function(tour, options) {

        return { target: $('.context-entity', '.row-elements-list') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    }
  ];

  var ind = v1State.get('walkthrough');
  ind--;
  var currentSteps = steps.slice(ind);
  var quickTour = new Tourist.Tour({
    steps: currentSteps,
    stepOptions: {
      "ill": "nasty"
    }
  });

  return quickTour;
});
