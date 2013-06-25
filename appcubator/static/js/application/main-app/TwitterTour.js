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
        $('.menu-app-entities').one('click', tour.next);
        $('.v1nav ul.nav li').not('.menu-app-entities').on('click', function() { return false; });
      },
      teardown: function(tour, options) {
        $('.v1nav ul.nav li').not('.menu-app-entities').off('click');
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
      nextButton: true
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
        v1State.get('tables').get(options.cid).get('fields').on('add', function(fieldModel) {
          if(fieldModel.get('name') == "Content") {
            options.propertyCid = fieldModel.cid;
            tour.next();
          }
          else {
            this.remove(fieldModel);
          }
        });
        return { target: $('#table-' + options.cid).find('.add-property-column') };
      },
      teardown: function(tour, options) {
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
      nextButton: true
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

          console.log("YARP");
          tour.next();
        }
      },
      setup: function(tour, options) {
        util.scrollToElement($('#new-relation'));
        var self = this;
        setTimeout(function() {
          console.log($('.done-relation'));
          $('.done-relation').on('click', self.checkFields);
        }, 500);
        return {  target: $('#new-relation') };
      },
      teardown: function(tour, options) {
        $('.done-relation').off('click', this.checkFields);
      }
    },
    /*
     * User-Tweet relation
     */
    {
      content: '<h3>OH GAWD</h3><p>Ain\'t nobody fucking wit my clique</p>',
      my: "left center",
      at: "right center",
      setup: function(tour, options) {
        util.scrollToElement($('#new-relation'));
        var self = this;
        setTimeout(function() {
          tour.view.setTarget($('.relation:first-child'));
          tour.view.show();
        }, 250);
        return { target: $('.relation-pane') };
      }
    }
  ];

  var quickTour = new Tourist.Tour({
    steps: steps,
    stepOptions: {
      "ill": "nasty"
    }
  });

  return quickTour;
});
