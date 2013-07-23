define([
  'tourist'
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
        v1State.attributes.walkthrough++;
      },
      nextButton: true,
      highlightTarget: true
    },
    /*
     * Done with Tables. Going to pages.
     */
     {
      content: '<h3>Let\'s get started!</h3><p><em>Click on <strong>Pages</strong> to start editing your pages.</em></p>',
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
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Pages</h3><p>Here you can edit and delete your site\'s pages.</p>',
      my: "left top",
      at: "right top",
      url: '/pages/',
      nextButton: true,
      setup: function(tour, options) {
        return { target: $('.page-view').first() };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>A New Page</h3><p>Let\'s create a new page and call it Tweet Feed</p><p><em>Click <strong>this big button</strong></em></p>',
      my: "left top",
      at: "right top",
      url: '/pages/',
      setup: function(tour, options) {
        feedPageAdded = function(page) {
          if(page.get('name') == "Tweet Feed") {
            tour.next();
          }
          else {
            v1State.get('pages').remove(page);
          }
        };
        v1State.get('pages').bind('add', feedPageAdded);
        return { target: $('#create-page-box') };
      },
      teardown: function() {
        v1State.get('pages').unbind('add', feedPageAdded);
        v1State.attributes.walkthrough++;
      }
    },
      {
      content: '<h3>Editing a Page</h3><p>Here you can edit your home page. <p><em>Click <strong>Edit Page</strong></em></p>',
      my: "left top",
      at: "right top",
      url: '/pages/',
      setup: function(tour, options) {
        waitUntilAppears('.search-panel', function(tour, options) { tour.next(); }, [tour, options]);
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
    return { target: $('.search-panel').first() };
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
      scrollTop: $("#type-headerTexts").offset().top - 110
    }, 200);
    v1.save();
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
    v1State.attributes.walkthrough++;
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
    v1State.attributes.walkthrough++;
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
        tour.loginButton = uielem;
        tour.next();
      }
    };
    v1State.getCurrentPage().get('uielements').bind('add', facebookDropped);

    return { target: $('#entity-user-facebook') };
  },
  teardown: function() {
    v1State.getCurrentPage().get('uielements').unbind('add', facebookDropped);
    v1State.attributes.walkthrough++;
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
    v1State.attributes.walkthrough++;
  }
},
{
  content: '<h3>Customizing functionality</h3><p>Here, you can select where the user goes after login. Please change it to the "Tweet Feed" page.</em></p>',
  my: "right center",
  at: "left center",
  url: '/editor/0/',
  setup: function(tour, options) {
    tour.loginButton.get('data').get('loginRoutes').models[0].bind('change', tour.next);
    return { target: $('.login-route-editor') };
  },
  teardown: function(tour, options) {
    tour.loginButton.get('data').get('loginRoutes').models[0].unbind('change', tour.next);
    $('.modal-bg').remove();
    $('.login-route-editor.modal').remove();
    v1State.attributes.walkthrough++;
  }
},
{
  content: '<h3>On to the next page!</h3><p>Hover over "Homepage" to see your pages and easily navigate to "Tweet Feed" by clicking on it.</em></p>',
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
        v1State.attributes.walkthrough++;
        v1.unbind('editor-loaded');
      }
    },
    {
      content: '<h3>Tweet Feed Page</h3><p>On this page, we will a “Create Form" and put a Twitter feed. Let\'s start with the form first.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      url: '/editor/1/',
      setup: function(tour, options) {

        // $('#item-gallery').animate({
        //   scrollTop: $(".entity-list").offset().top - 90
        // }, 200);

        return { target: $('.menu-button.pages') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Create Form</h3><p><em>Drag this form on to the left side of the page.</em></p>',
      my: "right center",
      at: "left center",
      url: '/editor/1/',
      setup: function(tour, options) {

        checkForNewOption = function() {
          waitUntilAppears('#new-option', tour.next);
        };

        v1State.getCurrentPage().bind('creat-form-dropped', checkForNewOption);

        return { target: $('#type-create-form') };
      },
      teardown: function() {
        v1State.getCurrentPage().unbind('creat-form-dropped', checkForNewOption);
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>What to create?</h3><p><em>Drag this form on to the left side of the page.</em></p>',
      my: "right center",
      at: "left center",
      url: '/editor/1/',
      setup: function(tour, options) {
        tweetTableCreated = function(table) {
          if(table.get('name') == "Tweet") {
            tour.tweetTable = table;
            waitUntilAppears('.form-editor-btn', tour.next);
          }
          else {
            alert('Name of the table should be "Tweet"');
            table.remove();
          }
        };
        v1State.get('tables').bind('add', tweetTableCreated);
        return { target: $('#new-option') };
      },
      teardown: function() {
        v1State.get('tables').bind('add', tweetTableCreated);
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Editing the Form</h3><p>We have this blank form now and we need to add some fields to it. Click on <em>Edit Login</em> button.</p>',
      my: "top center",
      at: "bottom center",
      url: '/editor/1/',
      setup: function(tour, options) {
        $('.form-editor-btn').first().one('click', function() {
          // setTimeout(tour.next, 400);
          waitUntilAppears('.form-editor-title', tour.next);
        });
        return { target: $('.form-editor-btn') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Form Editor</h3><p>Form editor let\'s you edit your forms and add new fields to it.</p>',
      my: "left top",
      at: "right top",
      url: '/editor/1/',
      nextButton: true,
      setup: function(tour, options) {
        return { target: $('.form-editor-title') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Add a New Field</h3><p>Create a new form field by clicking on <em>Add a New Field</em> button.</p>',
      my: "bottom center",
      at: "top center",
      url: '/editor/1/',
      setup: function(tour, options) {
        $('.btn.add-field-button').one('click', function() {
          waitUntilAppears('#option-0', tour.next);
        });
        return { target: $('.btn.add-field-button') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>Creating a Form Field</h3><p>Since we don\'t have and fields defined before, we should create a new one. Click on <em>Create A New Field</em></p>',
      my: "top left",
      at: "bottom left",
      url: '/editor/1/',
      setup: function(tour, options) {
        $('#option-0').one('change', function() {
          waitUntilAppears('.new-field-form', tour.next);
        });
        return { target: $('#option-0') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>We want to Save Some Text</h3><p>We want to save the text content of a tweet here, so we can just name the field as "Content" and click <em>Done</em></p>',
      my: "left top",
      at: "right top",
      url: '/editor/1/',
      setup: function(tour, options) {
        $('.new-field-form').one('submit', tour.next);
        return { target: $('.new-field-form') };
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    {
      content: '<h3>We have an awesome form now</h3><p>We\'re basically done with our form, but you can customize it further, change the label to "Tweet" etc. When you\'re done click on <em>Done</em> to coninue.</p>',
      my: "bottom right",
      at: "top right",
      url: '/editor/1/',
      setup: function(tour, options) {
        $('.btn.done-btn').one('click', tour.next);
        return { target: $('.btn.done-btn')};
      },
      teardown: function() {
        v1State.attributes.walkthrough++;
      }
    },
    //new-option
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
        v1State.attributes.walkthrough++;
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
        v1State.attributes.walkthrough++;
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
        v1State.attributes.walkthrough++;
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
        v1State.attributes.walkthrough++;
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
        v1State.attributes.walkthrough++;
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
        v1State.attributes.walkthrough++;
        //last step done, delete walkthrough attribute
        delete v1State.attributes.walkthrough;
      }
    }
    ];

    var ind = v1State.get('walkthrough');
    ind--;
    var currentSteps = steps.slice(ind);
    var quickTour = new Tourist.Tour({
      steps: currentSteps
    });

    quickTour.currentStep = currentSteps[0];

    return quickTour;
  });
