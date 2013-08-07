define([
  'answer',
  'backbone',
  './TutorialDict',
  './TutorialTemplates',
  'util'
],
function() {

  var TutorialView = Backbone.View.extend({
    tagName: 'div',
    className: 'tutorial-view hide',
    css : "tutorial",
    expanded: false,

    events : {
      "click #tutorial-menu-list li" : "clickedMenuItem",
      'scroll #tutorial-menu-list' : 'menuScrolled',
      "submit .tutorial-q-form" : "submittedQuestion",
      "click .answer-slide"     : "showAnswer",
      'click .tutorial-content .prev' : 'prevBtnClicked',
      'click .tutorial-content .next' : 'nextBtnClicked',
      "submit #feedback-form"   : "submittedFeedback",
      "mouseover .bottom-arrow" : "slideDown",
      "click .btn-navbar"       : "toggleMenu"
    },

    initialize: function(options) {
      _.bindAll(this);
      this.titles = _.pluck(TutorialDirectory, 'title');
      var initial = options.initial || 0;
      this.addr = this.getIndex(initial);

      util.loadCSS(this.css);
      this.render();
      this.chooseSlide();
      /*this.reader = new answer();
      this.parseAnswers(TutorialDirectory);*/
    },

    render : function(img, text) {
      this.renderBg();
      this.renderLeftMenu();
      this.renderMainModal();
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
      //menuDiv.appendChild(this.createSearchField());

      var tutorials = _(TutorialDirectory).map(function(t) {
        return {
          title: t.title,
          cls: (t.isSubSection) ? 'submenu' : ''
        };
      });
      var menuHtml = _.template(TutorialTemplates.menuTemp, {tutorials: tutorials});
      menuDiv.innerHTML += menuHtml;
      this.el.appendChild(menuDiv);
    },

    createSearchField: function() {
      var searchLi = document.createElement('div');
      searchLi.innerHTML = _.template(TutorialTemplates.searchFieldTemp, {});
      searchLi.className = "search-bar";
      return searchLi;
    },

    /*
     * Given a section title, return the index in the tutorial directory
     * If title, is not a string, assume it is already an array index
     */
    getIndex: function(title) {
      if(_.isString(title)) {
        index = this.titles.indexOf(title);
        if(index > -1) {
          return index;
        }
        else {
          return 0;
        }
      }
      else {
        return title;
      }
    },

    getSection: function(title) {
      return TutorialDirectory[this.getIndex(title)];
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
      var addr = (e.target.id).replace('tutorial-','');
      this.chooseSlide(parseInt(addr, 10));
    },

    chooseSlide: function(addr) {
      if(addr) {
        this.addr = addr;
      }
      this.selectMenu();
      this.showSlide(addr);
    },

    selectMenu: function (addr) {
      if(addr) {
        this.addr = addr;
      }
      this.$el.find('.selected').removeClass('selected');
      $('#tutorial-'+this.addr).addClass('selected');
    },

    showSlide: function(addr) {
      if(addr) {
        this.addr = addr;
      }
      var obj = this.getSection(this.addr);
      data = {
        title: obj.title,
        content: util.getHTML(obj.view),
        showPrevBtn: !(addr === 0),
        showNextBtn: !(addr === TutorialDirectory.length - 1)
      };
      contentHTML = _.template(TutorialTemplates.slideTemp, data);
      $('.tutorial-content').html(contentHTML);
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
        v1.tutorialIsVisible = false;
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
      var self = this;
      this.$el.find('#tutorial-menu-list').animate({
        scrollTop: '200px'
      }, 200);
    },

    prevBtnClicked: function(e) {
      e.preventDefault();
      this.chooseSlide(this.addr - 1);
    },

    nextBtnClicked: function(e) {
      e.preventDefault();
      this.chooseSlide(this.addr + 1);
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
