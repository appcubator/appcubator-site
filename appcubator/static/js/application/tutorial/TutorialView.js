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
    expanded: false,

    addr : [0],

    events : {
      "click #tutorial-menu-list li" : "clickedMenuItem",
      "submit .tutorial-q-form" : "submittedQuestion",
      "click .answer-slide"     : "showAnswer",
      'click .tutorial-content .prev' : 'prevBtnClicked',
      'click .tutorial-content .next' : 'nextBtnClicked',
      "submit #feedback-form"   : "submittedFeedback",
      "mouseover .bottom-arrow" : "slideDown",
      "click .btn-navbar"       : "toggleMenu"
    },

    initialize: function(directory) {
      _.bindAll(this);
      this.addr = (directory) ? directory : [0];

      util.loadCSS(this.css);
      this.render();
      this.chooseSlide(this.addr, true);
      this.reader = new answer();
      this.parseAnswers(TutorialDirectory);
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

      //menuDiv.appendChild(searchLi);
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

        // append subheadings if they exist
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

      // if a slide is already displayed
      if(!isNew) {
          var obj = TutorialDirectory[addr[0]];
          if(addr.length == 2) {
            obj = obj.contents[addr[1]];
          }
          self.showSlide(obj, addr);
      }
      //if there is no current slide yet
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
      var header = '<header><h1>'+ obj.title + '</h1><a class="btn btn-navbar collapsed" data-toggle="collapse" data-target=".nav-collapse">'+
          '<span class="icon-bar"></span>'+
          '<span class="icon-bar"></span>'+
          '<span class="icon-bar"></span>'+
        '</a></header>';

      var content = '<div class="text-cont">' + util.getHTML(obj.view) +'</div>';
      var footer = '<footer>';
      if(addr[0] !== 0) footer += '<a class="prev btn pull-left" href="#">&laquo; Prev</a>';
      if(addr[0] !== TutorialDirectory.length - 1) footer += '<a class="next btn pull-right" href="#">Next &raquo;</a>';
      footer += '</footer>';
      $('.tutorial-content').html(header + content + footer);
      util.log_to_server('viewed tutorial page', {page: obj.title}, appId);
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
        if(TutorialDirectory[ind1 - 1]) {
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
        this.chooseSlide(this.addr, false);
      }
      else {
        this.chooseSlide(this.addr, false);
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
    slideDown: function() {
      this.$el.find('#tutorial-menu-list').animate({
        scrollTop: '32'
      }, 200);
    },

    prevBtnClicked: function(e) {
      e.preventDefault();
      this.selectPrevious();
    },

    nextBtnClicked: function(e) {
      e.preventDefault();
      this.selectNext();
    },

    toggleMenu: function() {
      if(!this.expanded) {
        this.expanded = true;
        $('.tutorial-menu').addClass('open');
        $('.tutorial-content').addClass('open');
      }
      else {
        this.expanded = false;
        $('.tutorial-menu').removeClass('open');
        $('.tutorial-content').removeClass('open');
      }
    }

  });

  return TutorialView;
});
