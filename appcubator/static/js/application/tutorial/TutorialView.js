define([
  'answer',
  'backbone',
  './TutorialDict',
  'util'
],
function() {

  var TutorialView = Backbone.View.extend({
    tagName: 'div',
    className: 'tutorial-view',
    css : "tutorial",

    addr : [0],

    events : {
      "click #tutorial-menu-list li" : "clickedMenuItem",
      "submit .tutorial-q-form" : "submittedQuestion",
      "click .answer-slide"     : "showAnswer",
      'click .tutorial-content .prev' : 'prevSlide',
      'click .tutorial-content .next' : 'nextSlide',
      "submit #feedback-form"   : "submittedFeedback"
    },

    initialize: function(directory) {
      _.bindAll(this);

      this.addr = (directory) ? directory : [0];

      util.loadCSS(this.css);
      this.render();
      this.chooseSlide(this.addr, true);
      this.reader = new answer();
      this.parseAnswers(TutorialDirectory);

      $(window).bind('keydown', this.keyhandler);
    },

    render : function(img, text) {
      this.renderBg();
      this.renderLeftMenu();
      this.renderMainModal();
      this.el.style.display = "none";
      document.body.appendChild(this.el);
      this.$el.fadeIn('fast');
      return this;
    },

    renderBg: function() {
      var self = this;
      var bgDiv = document.createElement('div');
      bgDiv.className = 'modal-bg';
      this.bgDiv = bgDiv;
      $(bgDiv).on('click', function(e) {
        self.closeModal();
      });
      this.el.appendChild(bgDiv);
    },

    renderMainModal: function() {
      var mainDiv = document.createElement('div');
      mainDiv.className = 'tutorial-content';
      this.mainDiv = mainDiv;
      this.el.appendChild(mainDiv);
    },

    renderLeftMenu: function() {
      var menuDiv = document.createElement('div');
      menuDiv.className = 'tutorial-menu';
      menuDiv.innerHTML = '<div class="bottom-arrow"></div>';
      var menuUl  = document.createElement('ul');
      menuUl.id = "tutorial-menu-list";
      $(menuUl).scroll(this.menuScrolled);

      var searchLi = document.createElement('div');
      searchLi.innerHTML = '<form class="tutorial-q-form"><input type="text" class="q-input" placeholder="Type your question..."><input class="btn" type="submit" value="?"></form>';
      searchLi.className = "search-bar";

      this.appendMenuItem(menuUl, TutorialDirectory);

      menuDiv.appendChild(searchLi);
      menuDiv.appendChild(menuUl);
      this.el.appendChild(menuDiv);
    },

    appendMenuItem: function (node, arr, pInd) {
      var self =  this;
      var prefix = "";
      if(pInd) prefix = pInd + "-";

      _.each(arr, function(item, ind) {
        var itemNode = document.createElement('li');
        itemNode.innerText = item.title;
        itemNode.id = prefix + ind;
        node.appendChild(itemNode);
        if(item.contents) {
          var menuUl = document.createElement('ul');
          self.appendMenuItem(menuUl, item.contents, ind);
          node.appendChild(menuUl);
        }
      });
    },

    parseAnswers: function(dict) {
      var self = this;
      _(dict).each(function(item, ind) {
        if(item.view) {
          self.reader.read(util.getHTML(item.view), [ind] ,item.title);
        }

        // if(item.contents) {
        //   self.parseAnswers(item.contents);
        // }
      });
    },

    clickedMenuItem: function(e) {
      var addr = (e.target.id).split('-');
      addr = _(addr).map(function(ind) {
        return parseInt(ind, 10);
      });
      this.chooseSlide(addr, false);
    },

    chooseSlide: function(addr, isNew) {
      var self = this;

      this.addr = addr;
      this.selectMenu();

      if(!isNew) {
        $(this.mainDiv).animate({
          top: "-100%",
          opacity: "0"
        }, 240, function() {

          $(this).css({top: '100%'});
          var obj = TutorialDirectory[addr[0]];
          if(addr.length == 2) {
            obj = obj.contents[addr[1]];
          }
          self.showSlide(obj, addr);
        });

        $(this.mainDiv).delay(240).scrollTop(0).animate({
          top: "3%",
          opacity: "1"
        });
      }
      else {
        var obj = TutorialDirectory[addr[0]];
        if(addr.length == 2) {
          obj = obj.contents[addr[1]];
        }
        this.showSlide(obj, addr);
      }
    },

    selectMenu: function (addr) {
      var addrStr = this.addr.join('-');
      this.$el.find('.selected').removeClass('selected');
      $('#'+addrStr).addClass('selected');
    },

    showSlide: function(obj, addr) {
      var header = '<header><h1>'+ obj.title + '</h1></header>';
      var content = '<div class="text-cont">' + util.getHTML(obj.view) +'</div>';
      var footer = '<footer><a class="prev btn pull-left" href="#">&laquo; Prev</a><a class="next btn pull-right" href="#">Next &raquo;</a></footer>';
      $('.tutorial-content').html(header + content + footer);
      //util.log_to_server('viewed tutorial page', {page: obj.title}, appId);
    },

    showQuestionSlide: function(question, results) {
      console.log(results);

      var title = '<div class="main-img q-mark" style="background-image:url(/static/img/tutorial/large-q-mark.png)">'+ question +'</div>';
      var resultItems = '';

      _(results).each(function(result) {
        console.log(result);
        resultItems += '<li class="answer-slide" id="slide-'+result.dir.join('-') + '"><h3>'+ result.title +'</h3>' + result.article + '</li>';
      });

      if(!results.length) {
        resultItems += '<li class="no-result">No answers could be found :( But we\'ll get back to you soon!</li>';
      }

      $('.tutorial-content').html('');
      $('.tutorial-content').html(title + '<ul class="text-cont">'+resultItems+'</ul>');
    },

    selectNext: function () {
      var self = this;
      var ind1 = this.addr[0];
      if(this.addr.length == 2) {
        var ind2 = this.addr[1];
      }
      if(self.addr.length == 1) {
        if(TutorialDirectory[ind1].contents) {
          self.addr = [ind1, 0];
        }
        else if(TutorialDirectory[ind1 + 1]) {
          self.addr = [ind1+1];
        }
      }
      else {
        if(TutorialDirectory[ind1].contents[ind2 + 1]) {
          self.addr = [ind1, ind2+1];
        }
        else if(TutorialDirectory[ind1 + 1]) {
          self.addr = [ind1 + 1];
        }
      }
      if(this.addr.length == 2) {
        this.chooseSlide(this.addr, false);
      }
      else {
        this.chooseSlide(this.addr, false);
      }
    },

    selectPrevious: function () {
      var self = this;
      var ind1 = this.addr[0];
      if(this.addr.length == 2) {
        var ind2 = this.addr[1];
      }
      if(self.addr.length == 1) {
        if(TutorialDirectory[ind1].contents) {
          self.addr = [ind1, 0];
        }
        else if(TutorialDirectory[ind1 - 1]) {
          self.addr = [ind1-1];
        }
      }
      else {
        if(TutorialDirectory[ind1].contents[ind2 - 1]) {
          self.addr = [ind1, ind2-1];
        }
        else if(TutorialDirectory[ind1 - 1]) {
          self.addr = [ind1 - 1];
        }
      }
      if(this.addr.length == 2) {
        this.showSlide(TutorialDirectory[this.addr[0]].contents[this.addr[1]]);
      }
      else {
        this.showSlide(TutorialDirectory[this.addr[0]]);
      }
    },

    keyhandler: function (e) {
      var self = this;
      switch(e.keyCode) {
        case 39:
        case 40:
         self.selectNext();
         self.chooseSlide(self.addr, false);
         e.preventDefault();
         break;
        case 37:
        case 38:
         self.selectPrevious();
         self.chooseSlide(self.addr, false);
         e.preventDefault();
         break;
        case 27:
         self.closeModal();
         break;
      }
    },

    submittedQuestion: function(e) {
      e.preventDefault();

      var question = this.$el.find('.q-input').val();
      var results = this.reader.match(question);
      this.showQuestionSlide(question, results);

      util.log_to_server('asked question', {directory: null, title: question}, appId);
    },

    showAnswer: function(e) {
      console.log(e.target.id);
      var id = (e.target.id||e.target.parentNode.id).replace('slide-', '');
      this.chooseSlide([id], false);
    },

    submittedFeedback: function(e) {
      e.preventDefault();
      var response = {};
      response.like = $('#like-appcubator').val();
      response.dislike = $('#dislike-appcubator').val();
      response.features = $('#features-appcubator').val();

      util.log_to_server('posted feedback', response, appId);

      $('#feedback-check').prop('checked', true);
      this.closeModal();
      alert('Thanks for your feedback!');
    },

    onClose: function() {
      $(this.el).empty();
      $(window).unbind('keydown', this.keyhandler);
    },

    closeModal: function() {
      var self = this;
      this.$el.fadeOut('fast', function() {
        self.remove();
        self.stopListening();
        window.history.pushState(null, null, window.location.href.replace("tutorial/",""));
      });
    },

    menuScrolled: function(e) {
      var el = $(e.target);
      var a = el.scrollTop();
      var b = $(el).innerHeight();
      var c = e.target.scrollHeight;

      if(a+b == c) {
        $('.bottom-arrow').fadeOut();
      }
      else {
        $('.bottom-arrow').fadeIn();
      }
    },

    prevSlide: function(e) {
      e.preventDefault();
      this.selectPrevious();
    },

    nextSlide: function(e) {
      e.preventDefault();
      this.selectNext();
    }

  });

  return TutorialView;
});
