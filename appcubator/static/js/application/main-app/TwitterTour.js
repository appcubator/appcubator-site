define([
  'tourist',
  'util'
  ],
  function() {

    var findPos = function (obj) {
      var curleft = curtop = 0;

      if(obj.style.position == "fixed") return [1,1];
      if (obj.offsetParent) {
        do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
      }

      return [curleft,curtop];
    };

    var incrementStep = function() {
      v1State.set('walkthrough', v1State.get('walkthrough') + 1);
    }

    var timer = {};

    var waitUntilAppears = function(selector, callbackFn, cont_args, count) {
      clearTimeout(timer);
      var cnt = (count || 0);

      el = document.querySelector(selector);
      if(el && !el.tagName) { el = el[0]; }

      var repeat = function() {
        cnt++;
        timer = window.setTimeout(function() {
          waitUntilAppears.call(this, selector, callbackFn, cont_args, cnt);
        }, 500);
      };

      var fail = function() {
        alert('There has been a problem with the flow of the Walkthrough. Please refresh your page. Don\'t worry, you\'ll start from where you left off!');
      };

      if(cnt > 60) return fail();
      if(!el) return repeat();

      var pos = findPos(el);

      if($(el).height() === 0 || $(el).width() === 0 || pos[0] === 0 || pos[1] === 0) return repeat();
      callbackFn.apply(undefined, cont_args);
    };

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
        incrementStep();
      },
      nextButton: true,
      highlightTarget: true
    },
    /*
     * Tables Menu Nav
     */
     {
      target: $('.menu-app-entities'),
      content: '<h3>Tables</h3><p>Click this button to go to the “Tables” page.</p><p><em>Go to the “Tables” page.</em></p>',
      my: "top center",
      at: "bottom center",
      url: '/',
      setup: function(tour, options) {
        v1.bind('entities-loaded', function() {
          tour.next();
        });
      },
      teardown: function() {
        incrementStep();
      }
    },
    /*
     * Tables page explanation
     */
     {
      target: $('.menu-app-entities'),
      content: '<h3>Tables</h3><p>This page is where you define the different types of users and the data they’ll create.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/tables/',
      /*setup: function() {
        return {  target: $('#add-role') };
      },*/
      teardown: function() {
        incrementStep();
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
        incrementStep();
      }
    },
    /*
     * Add Table btn
     */
     {
      content: '<h3>Adding A Table</h3><p>In Twitter, users can create and see Tweets.<br>These tweets are stored in a "Table", which we need to set up.</p><p><em>Click "Add Table" name the table: <strong>Tweet</strong>.</em></p>',
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
        incrementStep();
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
        incrementStep();
      }
    },
    /*
     * Add Property btn
     */
     {
      content: '<h3>Create a Field</h3><p>Tweets are simple, they consist of one Text field.</p><p><em>Add a field and name it <strong>Content</strong>.</em></p>',
      url: '/tables/',
      setup: function(tour, options) {

        var cid =  v1State.get('tables').getTableWithName("Tweet").cid;
        checkForContent = function(fieldModel) {
          if(fieldModel.get('name') == "Content") {
            propertyCid = fieldModel.cid;
            tour.next();
          }
          else {
            alert('Name of the field shoud be "Content"');
            this.remove(fieldModel);
          }
        };

        v1State.get('tables').getTableWithName("Tweet").get('fields').bind('add', checkForContent);
        return { target: $('#table-' + cid).find('.add-property-column').first() };
      },
      teardown: function(tour, options) {
        v1State.get('tables').getTableWithName("Tweet").get('fields').unbind('add', checkForContent);
        incrementStep();
      }
    },
    /*
     * About Relations
     */
     {
      content: '<h3>Nice!</h3><p>Next, we\'ll associate <strong>Tweets</strong> with <strong>Users</strong>.</p>',
      my: "left top",
      at: "right top",
      url: '/tables/',
      setup: function(tour, options) {
        var cid =  v1State.get('tables').getTableWithName("Tweet").cid;
        var $tableEl = $('#table-' + cid).first();
        return { target: $tableEl.find('.column').last() };
      },
      nextButton: true,
      teardown: function() {
        incrementStep();
      }
    },
    /*
     * Add Relation btn
     */
     {
      content: '<h3>Make a Relation</h3><p>Relations allow you to associate users and tweets.</p><p><em>Click <strong>Add Relation</strong>.</em></p>',
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
        //incrementStep();
      }
    },
    /*
     * Create Relation Options
     */
     {
      content: '<h3>Relations</h3><p><em>Click below to make a <strong>User-Tweet</strong> relation.</em></p>',
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
        incrementStep();
        incrementStep();
      }
    },
    /*
     * Create Relation Form
     */
     {
      content: '<h3>Relations</h3><p>In Twitter, a tweet has an <strong>owner</strong> and by consequence, users are owners of <strong>tweets</strong>.</p><p><em>Call the user\'s list of tweets <strong>Tweets</strong>, and the tweet\'s user <strong>Owner</strong>. Then press Done.</em></p>',
      my: "left center",
      at: "top center",
      url: '/tables/',
      // checkFields: function(tour, options, e) {
      //   var form = $('.edit-relation-div');
      //   var form1 = form.find('.new-relation:first-child');
      //   var form2 = form.find('.new-relation').eq(1);

      //   var user_select = form1.find('select').val();
      //   var related_name = form1.find('input').val();
      //   var tweet_select = form2.find('select').val();
      //   var name = form2.find('input').val();

      //   if(user_select !== 'many' || related_name !== 'Tweets' || tweet_select !== 'one' || name !== 'Owner') {
      //     alert('Make sure you enter "Tweets" in the first box, and "Owner" in the second box');
      //     e.stopPropagation();
      //   }
      //   else {
      //     tour.next();
      //   }
      // },
      setup: function(tour, options) {
        util.scrollToElement($('#new-relation'));
        var self = this;

          // $('.done-relation').on('click', self.checkFields);

          checkForRelation = function(fieldM) {
            if( fieldM.get('entity_name') != "User" ||
              fieldM.get('name') != "Owner" ||
              fieldM.get('related_name') != "Tweets") {

              this.remove(fieldM);
            alert('Make sure you enter "Tweets" in the first box, and "Owner" in the second box');
          }
          else {
            tour.next();
          }

        };

        v1State.get('tables').models[0].get('fields').bind('add', checkForRelation);

        return {  target: $('#new-relation') };
      },
      teardown: function(tour, options) {
        v1State.get('tables').models[0].get('fields').unbind('add', checkForRelation);
        incrementStep();
        v1.save();
      }
    },
    {
      content: '<h3>Save button</h3><p>Let\'s save this work before moving on. We also periodically autosave.</p><p><em>Click the save button.</em></p>',
      my: "right center",
      at: "left center",
      url: '/tables/',
      setup: function(tour, options) {

        $('.save-btn').one('click', function() {
          tour.next();
        });
        return { target: $('.save-btn') };
      },
      teardown: function() {
        incrementStep();
      }
    },
    /*
     * Done with Tables. Going to pages.
     */
     {
      content: '<h3>GREAT!</h3><p>You\'re done with the hard part. Now we\'ll make the UI.</p><p><em>Click on <strong>Pages</strong>.</em></p>',
      my: "top center",
      at: "bottom center",
      target: $('.menu-app-pages'),
      url: '/tables/',
      setup: function(tour, options) {
        v1.bind('pages-loaded', function() {
          tour.next();
        });
      },
      teardown: function() {
        v1.unbind('pages-loaded');
        incrementStep();
      }
      // my: "left center",
      // at: "right center",
      // nextButton: true,
      // url: '/tables/',
      // setup: function(tour, options) {
      //   util.scrollToElement($('#new-relation'));
      //   var self = this;
      //   setTimeout(function() {
      //     tour.view.setTarget($('.relation:first-child'));
      //     tour.view.show();
      //   }, 250);
      //   return { target: $('.relation-pane') };
      // },
      // teardown: function() {
      //   incrementStep();
      // }
    },
    {
      content: '<h3>Pages</h3><p>Here you can edit and delete your site\'s pages.</p><p><em>Click <strong>Edit Page</strong></em></p>',
      my: "left top",
      at: "right top",
      url: '/pages/',
      setup: function(tour, options) {
        //v1.bind('editor-loaded', function() {
          waitUntilAppears('.search-panel', function(tour, options) { tour.next(); }, [tour, options]);
        //}, this);
return { target: $('.page-view').first() };
},
teardown: function() {
  v1.unbind('editor-loaded');
  incrementStep();
}
},
{
  content: '<h3>Welcome to Editor</h3><p>What you see is what you get. You can drag elements onto the page and play around with them.</p>',
  my: "right top",
  at: "left bottom",
  nextButton: true,
  url: '/editor/0/',
  setup: function(tour, options) {
    return { target: $('.search-panel').first() };
  },
  teardown: function() {
    incrementStep();
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
      scrollTop: $("#type-headerTexts").offset().top - 110
    }, 200);
    v1.save();
    return { target: $('#editor-save') };
  },
  teardown: function() {
    incrementStep();
  }
},
{
  content: '<h3>Drag\'n\'Drop</h3><p><em>Drag this header element to the page.</em></p>',
  my: "right center",
  at: "left center",
  url: '/editor/0/',
  setup: function(tour, options) {

    headerDragged = function(uielem) {
      if(uielem.get('data').get('tagName') == "h1") {
        tour.next();
      }
    };
    v1State.getCurrentPage().get('uielements').bind('add', headerDragged);

    return { target: $('#type-headerTexts') };
  },
  teardown: function() {
    v1State.getCurrentPage().get('uielements').unbind('add', headerDragged);
    incrementStep();
  }
},
{
  content: '<h3>Editing Elements</h3><p>Click the text to edit it.<br>Then, click "Pick Style" to choose your style.</p>',
  my: "left center",
  at: "right center",
  nextButton: true,
  url: '/editor/0/',
  setup: function(tour, options) {
    $('#item-gallery').animate({
      scrollTop: $("#entity-user-facebook").offset().top - 110
    }, 200);

    return { target: $('.pick-style') };
  },
  teardown: function() {
    incrementStep();
  }
},
{
  content: '<h3>Time to get some users!</h3><p><em>Drag this facebook login button onto the page.</em></p>',
  my: "right center",
  at: "left center",
  url: '/editor/0/',
  setup: function(tour, options) {
    facebookDropped = function(uielem) {
      if(uielem.get('data').get('action') == "thirdpartylogin") {
        tour.next();
      }
    };
    v1State.getCurrentPage().get('uielements').bind('add', facebookDropped);

    return { target: $('#entity-user-facebook') };
  },
  teardown: function() {
    v1State.getCurrentPage().get('uielements').unbind('add', facebookDropped);
    incrementStep();
  }
},
{
  content: '<h3>Customizing functionality</h3><p>Some elements, like this Facebook button, can be customized.</p><p><em>Select it and click <strong>Edit Login</strong></em></p>',
  my: "left center",
  at: "right center",
  url: '/editor/0/',
  setup: function(tour, options) {
    var elem = $(".facebook-login-btn")[0];
    $('.edit-login-form-btn').first().on('click', function() {
          // setTimeout(tour.next, 400);
          waitUntilAppears('.login-route-editor', tour.next);
        });
    return { target: $(elem) };
  },
  teardown: function() {
    incrementStep();
  }
},
{
  content: '<h3>Customizing functionality</h3><p>Here, you can select where the user goes after login. Right now you only have Homepage right now. Next, we\'ll make a new page.</p><p><em>Click outside this window to return to the editor.</em></p>',
  my: "right center",
  at: "left center",
  url: '/editor/0/',
  nextButton: true,
  setup: function(tour, options) {
    return { target: $('.login-route-editor') };
  },
  teardown: function() {
    $('.modal-bg').remove();
    $('.login-route-editor.modal').remove();
    incrementStep();
  }
},
{
  content: '<h3>Making a new Page</h3><p>Hover over "Homepage" to see your pages and to make a new one.</p><p><em>Make a new page called "Tweet Feed" and click on it to go there.</em></p>',
      // TODO make the gradients more noticable
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
        incrementStep();
        v1.unbind('editor-loaded');
      }
    },
    {
      content: '<h3>Tweet Feed Page</h3><p>On this page, we will put a Twitter feed and a “Create Tweet” form. Let\'s start with the Tweet feed first.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/editor/1/',
      setup: function(tour, options) {

        $('#item-gallery').animate({
          scrollTop: $(".entity-list").offset().top - 90
        }, 200);

        return { target: $('.menu-button.pages') };
      },
      teardown: function() {
        incrementStep();
      }
    },
    {
      content: '<h3>Twitter Feed</h3><p><em>Drag a Tweet List onto the page.</em></p>',
      my: "right center",
      at: "left center",
      url: '/editor/1/',
      setup: function(tour, options) {
        draggedTweetList = function(uielem) {
          if(uielem.get('type') == "loop") {
            tour.pageLoop = uielem;
            waitUntilAppears('.edit-row-btn', tour.next);
          }
        };
        v1State.getCurrentPage().get('uielements').bind('add', draggedTweetList);
        return { target: $('.entity-list') };
      },
      teardown: function() {
        v1State.getCurrentPage().get('uielements').unbind('add', draggedTweetList);
        incrementStep();
      }
    },
    {
      content: '<h3>About this "list"</h3><p>"Edit Row" allows you to edit each row\'s appearance and content.<br>"Edit Query" allows you to filter and sort the Tweets.</p><p><em>Click on "Edit Row"</em></p>',
      my: "bottom center",
      at: "top center",
      url: '/editor/1/',
      setup: function(tour, options) {

        $('.edit-row-btn').one('click', function() {
          setTimeout(function() {
            tour.next();
          }, 300);
        });

        return { target: $('.edit-row-btn') };
      },
      teardown: function() {
        incrementStep();
      }
    },
    {
      content: '<h3>The Green Row</h3><p>The green area of the list represents a single row. Drag\'N\'Drop works here too.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/editor/1/',
      setup: function(tour, options) {

        return { target: $('.highlighted').first() };
      },
      teardown: function() {
        incrementStep();
      }
    },
    {
      content: '<h3>Dragging Tweet Stuff</h3><p><em>Drag "Tweet.Owner.username" into the green row.</em></p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/editor/1/',
      setup: function(tour, options) {

        $('#item-gallery').scrollTop(0);
        $('#item-gallery').animate({
          scrollTop: $(".entity-create-form").offset().top - 90
        }, 200);

        tweetStuffDragged = function() {
          tour.next();
        };

        tour.pageLoop.get('data').get('container_info').get('row').get('uielements').bind('add', tweetStuffDragged);
        return { target: $('.context-nested-entity', '.row-elements-list') };
      },
      teardown: function(tour, options) {
        tour.pageLoop.get('data').get('container_info').get('row').get('uielements').unbind('add', tweetStuffDragged);
        incrementStep();
      }
    },
    {
      // TODO see how this looks and make shorter if necessary
      content: '<h3>Cool!</h3><p>You successfully made a Twitter feed. You can make things look a little nicer if you want: resize things in the row, pick styles for the elements.</p><p><em>When done, Click "Done Editing" to switch off editing mode.</em></p>',
      my: "top center",
      at: "bottom center",
      url: '/editor/1/',
      setup: function(tour, options) {
        tour.pageLoop.bind('deselected', function() {
          tour.next();
        });
        $('.done-editing').one('click', function() {
          tour.next();
        });
        return { target: $('.done-editing') };
      },
      teardown: function(tour, options) {
        tour.pageLoop.unbind('deselected');
        incrementStep();
      }
    },
    {
      content: '<h3>Time to Create Some Tweets</h3><p>We have a Twitter feed now, but how will users Tweet? Please drag a Create Form onto the page.</p>',
      my: "top center",
      at: "bottom center",
      url: '/editor/1/',
      setup: function(tour, options) {
        createFormDragged = function(uielem) {
          if(uielem.hasForm()) {
            tour.next();
          }
        };
        v1State.getCurrentPage().get('uielements').bind('add', createFormDragged);
        return { target: $('.entity-create-form') };
      },
      teardown: function() {
        v1State.getCurrentPage().get('uielements').unbind('add', createFormDragged);
        incrementStep();
      }
    },
    // TODO associate the Tweet with the user in the modal
    {
      content: '<h3>Almost there!</h3><p>Press "Test Run" and you will see your site up and running!</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/editor/1/',
      setup: function(tour, options) {
        return { target: $('.save-run-group') };
      },
      teardown: function() {
        incrementStep();
        //last step done, delete walkthrough attribute
        delete v1State.attributes.walkthrough;
        util.log_to_server('finished in-depth twitter walkthrough', {}, appId);
      }
    }
    ];

    var ind = v1State.get('walkthrough');
    ind--;
    var currentSteps = steps.slice(ind);
    var quickTour = new Tourist.Tour({
      steps: currentSteps
    });

    v1State.on('change:walkthrough', function(model) {
      util.log_to_server('in-depth twitter walkthrough step', { step: model.attributes.walkthrough}, appId);
    });

    quickTour.currentStep = currentSteps[0];

    return quickTour;
  });
