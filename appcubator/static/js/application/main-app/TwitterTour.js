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
      content: '<h3>Questions?</h3><p>If you have questions during the walkthrough, click the question marks for more info.</p>',
      my: "right center",
      at: "left center",
      url: '/',
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
      content: '<h3>Tables</h3><p>Click this button to go to the “Tables” page.<br><em>Go to the “Tables” page.</em></p>',
      my: "top center",
      at: "bottom center",
      url: '/',
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
     * Tables page explanation
     */
    {
      target: $('.menu-app-entities'),
      content: '<h3>Tables</h3><p>This page is where you define the different types of users that use your application and the data they’ll create.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/tables/',
      /*setup: function() {
        return {  target: $('#add-role') };
      },*/
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * Add User Role btn
     */
    {
      content: '<h3>User Roles</h3><p>In Twitter, there is only one type of user, but in some applications, there may be differences, ie. Doctors vs Patients.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/tables/',
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
      content: '<h3>Adding A Table</h3><p>In Twitter, users can create and see Tweets.<br>These are stored in a "Table" of tweets.<br><em>Click "Add Table" name the table: <strong>Tweet</strong>.</em></p>',
      my: "left center",
      at: "right center",
      url: '/tables/',

      setup: function(tour, options) {
        util.scrollToElement($('#add-entity'));

        v1State.get('tables').on('add', function(tableModel) {
          if(tableModel.get('name') == "Tweet") {
            tour.TweetCid = tableModel.cid;
            tour.next();
          }
          else {
            alert("You should name your table as 'Tweet' for the purpose of this demo.");
            this.remove(tableModel);
          }
        });
        return {  target: $('#add-entity') };
      },
      teardown: function(tour, options) {
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * Tweet Table
     */
    {
      content: '<h3>Congrats!</h3><p>You created a Tweet table. Next, we\'ll define the fields of the table.</p>',
      my: "left top",
      at: "top center",
      url: '/tables/',
      setup: function(tour, options) {

        var tweetCid = v1State.get('tables').getTableWithName('Tweet').cid;
        util.scrollToElement($('#table-' + tweetCid + ' .header'));
        return { target: $('#table-' + tweetCid + ' .header').first() };
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
      content: '<h3>Create a Field</h3><p>Tweets are simple, they consist of one Text field.<br><em>Add a field and name it <strong>Content</strong>.</p>',
      url: '/tables/',
      setup: function(tour, options) {

        var cid =  v1State.get('tables').getTableWithName("Tweet").cid;
        v1State.get('tables').getTableWithName("Tweet").get('fields').on('add', function(fieldModel) {
          if(fieldModel.get('name') == "Content") {
            propertyCid = fieldModel.cid;
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
      }
    },
    /*
     * About Relations
     */
    {
      content: '<h3>Nice!</h3><p>Next, we\'ll associate <strong>Tweets</strong> with <strong>Users</strong>.</p>',
      my: "left top",
      at: "right center",
      url: '/tables/',
      setup: function(tour, options) {
        var cid =  v1State.get('tables').getTableWithName("Tweet").cid;
        var $tableEl = $('#table-' + cid).first();
        return { target: $tableEl.find('.column').first() };
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
      content: '<h3>Make a Relation</h3><p>Relations allow you to associate users and tweets.<br><em>Click Add Relation.</em></p>',
      my: "bottom center",
      at: "top center",
      url: '/tables/',
      setup: function(tour) {
        util.scrollToElement($('#add-relation'));
        $('#add-relation').on('click', tour.next);
        return {  target: $('#add-relation') };
      },
      teardown: function(tour, options) {
        $('#add-relation').off('click', tour.next);
        //v1State.attributes.walkthrough++;
      }
    },
    /*
     * Create Relation Options
     */
    {
      content: '<h3>Relations</h3><p><em>Click below to make a User - Tweet relation.</em></p>',
      my: "bottom left",
      at: "top left",
      url: '/tables/',
      setup: function(tour) {
        $('.select-view ul li:first-child').one('click', function() {
          tour.next();
        });
        return {  target: $('#relations') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
        v1State.attributes.walkthrough++;
      }
    },
    /*
     * Create Relation Form
     */
    {
      content: '<h3>Relations</h3><p>In Twitter, a tweet has an <strong>owner</strong> and by consequence, users are owners of <strong>tweets</strong>.<br><em>Call the user\'s list of tweets <strong>Tweets</strong>, and the tweet\'s user <strong>Owner</strong>.</em></p>',
      my: "left center",
      at: "top center",
      bind: ['checkFields'],
      url: '/tables/',
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
      content: '<h3>GREAT!</h3><p>You\'re done with the hard part. Now we\'ll make the UI.</p>',
      my: "left center",
      at: "right center",
      nextButton: true,
      url: '/tables/',
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
    // {
    //   content: '<h3>Time to Make it Look Good</h3><p>Click here and go to Themes page.</p>',
    //   my: "top center",
    //   at: "bottom center",
    //   target: $('.menu-app-themes'),
    //   url: '/tables/',
    //   setup: function(tour, options) {
    //     v1.bind('themes-loaded', function() {
    //       tour.next();
    //     });
    //   },
    //   teardown: function() {
    //     v1State.attributes.walkthrough++;
    //   }
    // },
    // {
    //   content: '<h3>Theme</h3><p>We have a variety of themes here. Pick the one you like the most and click the "Load Theme" button.',
    //   my: "left center",
    //   at: "right center",
    //   nextButton: true,
    //   url: '/gallery/',
    //   setup: function() {
    //     return { target: $('#themes-title') };
    //   },
    //   teardown: function() {
    //     v1State.attributes.walkthrough++;
    //   }
    // },
    {
      content: '<h3>Pages</h3><p><em>Click on "Pages".</em></p>',
      my: "top center",
      at: "bottom center",
      target: $('.menu-app-pages'),
      url: '/gallery/',
      setup: function(tour, options) {
        v1.bind('pages-loaded', function() {
          tour.next();
        });
      },
      teardown: function() {
        v1.unbind('pages-loaded');
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Pages</h3><p>Here you can edit and delete your site\'s pages.<em>Click "Edit Page"</em></p>',
      my: "left center",
      at: "right center",
      nextButton: true,
      url: '/pages/',
      setup: function(tour, options) {
        v1.bind('editor-loaded', function() {
          setTimeout(function() {
            tour.next();
          }, 220);
        });
        return { target: $('.page-view').first() };
      },
      teardown: function() {
        v1.unbind('editor-loaded');
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Welcome to Editor</h3><p>What you see is what you get. You can drag elements onto the page and play around with them.</p>',
      my: "right top",
      at: "left bottom",
      nextButton: true,
      url: '/editor/0/',
      setup: function(tour, options) {
        return { target: $('.search-panel') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Saving Your Progress</h3><p>Save early, save often. We periodically autosave for you.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/editor/0/',
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
      content: '<h3>Drag\'n\'Drop</h3><p><em>Drag this header element to the page.</em></p>',
      my: "right center",
      at: "left center",
      url: '/editor/0/',
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
      content: '<h3>Editing Elements</h3><p>Click the text to edit in, and click "Pick Style" to quickly spice it up.</p>',
      my: "left center",
      at: "right center",
      nextButton: true,
      url: '/editor/0/',
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
      content: '<h3>Time to get some users!</h3><p><em>Drag this facebook login button onto the page.</em></p>',
      my: "top center",
      at: "bottom center",
      url: '/editor/0/',
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
      content: '<h3>Customizing functionality</h3><p>Some elements, like this Facebook button, can be customized.<br><em>Select it and click <strong>Edit Login</strong></em></p>',
      my: "left center",
      at: "right center",
      url: '/editor/0/',
      setup: function(tour, options) {
        var elem = $(".facebook-login-btn")[0];
        return { target: $(elem) };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Let\'s move to the other page.</h3><p>Please hover over the page menu and click on "Tweet Feed" to go to the other page.</p>',
      my: "left top",
      at: "right center",
      url: '/editor/0/',
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
      content: '<h3>Feed Page</h3><p>On this page, we will put a list of the User’s Tweets, something like a stream. We will also add a “Create Tweet” form to tweet new stuff. Let\'s start with the list first.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/editor/2/',
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
      url: '/editor/2/',
      setup: function(tour, options) {

        v1State.getCurrentPage().get('uielements').bind('add', function(uielem) {
          if(uielem.get('type') == "loop") {
            setTimeout(function() {
              tour.pageLoop = uielem;
              tour.next();
            }, 300);
          }
        });

        return { target: $('.entity-list') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>We have the list of Tweets!</h3><p>Now we can start editing by clicking the "Edit Row" button.</p>',
      my: "bottom center",
      at: "top center",
      url: '/editor/2/',
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
      content: '<h3>The Green Row</h3><p>The green area is the first, editable row. You should start dragging and dropping design elements.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/editor/2/',
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
      url: '/editor/2/',
      setup: function(tour, options) {

        $('#item-gallery').scrollTop(0);
        $('#item-gallery').animate({
          scrollTop: $(".entity-create-form").offset().top - 90
        }, 200);


        tour.pageLoop.get('data').get('container_info').get('row').get('uielements').bind('add', function() {
          tour.next();
        });
        return { target: $('.context-entity', '.row-elements-list') };
      },
      teardown: function(tour, options) {
        tour.pageLoop.get('data').get('container_info').get('row').get('uielements').unbind('add');
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>We\'re Done with this List</h3><p>Just click "Done Editing" to switch off editing mode.</p>',
      my: "top center",
      at: "bottom center",
      url: '/editor/2/',
      setup: function(tour, options) {
        $('.done-editing').one('click', function() {
          tour.next();
        });
        return { target: $('.done-editing') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Time to Create Some Tweets</h3><p>We have a list of tweets now, but we also need a way to create them. Please drag\'n\'drop a create form onto the page.</p>',
      my: "top center",
      at: "bottom center",
      url: '/editor/2/',
      setup: function(tour, options) {
        v1State.getCurrentPage().get('uielements').bind('add', function(uielem) {
          if(uielem.hasForm()) {
            tour.next();
          }
        });
        return { target: $('.entity-create-form') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Almost there!</h3><p>Press "Test Run" and you will see your site up and running!</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/editor/2/',
      setup: function(tour, options) {
        return { target: $('#deploy') };
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
    tipOptions:{ showEffect: 'slidein' }
  });

  quickTour.currentStep = currentSteps[0];

  return quickTour;
});
