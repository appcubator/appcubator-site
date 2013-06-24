define([
  "backbone"
],
function() {

  var QuestionView = Backbone.View.extend({
    tagName: 'li',
    className: 'question',
    answered: false,

    events: {
      'click .answer'             : 'answerFromMultipleChoice',
      'submit .answer-form'       : 'answerInputBox',
      'submit .multi-answer-form' : 'addAnswerInput',
      'click .btn-add-answer'     : 'addAnswerInput',
      'click .btn-done'           : 'answerFromMultipleBox'
    },

    initialize: function(qDict, answer) {
      _.bindAll(this, 'render');
      this.dict = qDict;
      this.prevAnswer = answer;
      this.render();
    },

    render : function() {
      this.$el.append('<span class="q-sent">' + _.template(this.dict.questionText, {value: this.prevAnswer })+'</span>');
      this.renderAnswers();
      return this;
    },

    renderAnswers: function() {
      var self = this;

      if(this.dict.inputBox) { this.renderInputBox(); }
      if(this.dict.answers) { this.renderMultipleChoice(); }
      if(this.dict.multiInp) { this.renderMultipleAnswer(); }
      if(this.dict.logo) { this.renderUpload(); }
    },

    renderInputBox: function() {
        var form = document.createElement('form');
        form.className ="answer-form";
        $(form).append('<input type="text" class="answer-input" placeholder="'+this.dict.inputBox+'">');
        this.el.appendChild(form);
    },

    renderMultipleChoice: function() {
      _(this.dict.answers).each(function(val, key) {
        var div = document.createElement('span');
        div.className ="answer";
        div.id = key;
        div.innerHTML = val;
        this.el.appendChild(div);
      }, this);

      if(this.$el.find('input[type=radio]').length) {
        this.$el.find('input[type=radio]').prettyCheckable();
      }
    },

    renderMultipleAnswer: function() {
      var form = document.createElement('form');
      form.className ="multi-answer-form";
      $(form).append('<input type="text" class="multi-answer-input" placeholder="Type your answer here..">');
      this.$el.append(form);
      this.$el.append('<div class="btn btn-add-answer">Add another answer</div>');
      this.$el.append('<div class="btn btn-done">Done</div>');
    },

    renderUpload: function() {

    },

    addAnswerInput: function(e) {
      this.$el.find('.multi-answer-form').append('<input type="text" class="multi-answer-input" placeholder="Type your answer here...">');
      e.preventDefault();
    },

    answerFromMultipleChoice: function(e) {
      this.answer = [(e.target.id||e.target.parentNode.id||e.target.parentNode.parentNode.parentNode.id)];
      if(!this.answered) {
        this.answerSend(this.answer);
      }
    },

    answerInputBox: function(e) {
      e.preventDefault();
      this.answer = [this.$el.find('.answer-input').val()];
      if(!this.answered) {
        this.answerSend(this.answer);
      }
    },

    answerFromMultipleBox: function(e) {
      this.answers = [];
      var self = this;
      this.$el.find('input[type="text"]').each(function(ind, el) {
        var val = $(el).val();
        if(val !== "") {
          self.answers.push(val);
        }
      });
      this.answerSend(this.answers);
    },

    answerSend: function(answerArr) {
      var nextKey = this.dict.next.call(this, answerArr);
      this.trigger('next', nextKey, answerArr);
      this.answered = true;
    }

  });

  return QuestionView;
});
