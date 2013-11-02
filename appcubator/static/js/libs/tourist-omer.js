define([
  'tourist'
  ],
  function() {

    var findPos = function (obj) {
      var curleft = curtop = 2;

      // stylesheet style not getting...
      if(obj.style.position == "fixed") return [2,2];
      if (obj.offsetParent) {
        do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
      }

      return [curleft,curtop];
    };

    //var timer = {};

    var waitUntilAppears = function(selector, iframe, callbackFn, cont_args, count) {
      //clearTimeout(timer);
      var cnt = (count || 0);

      if(iframe) {
        el = document.querySelector(iframe).contentWindow.document.querySelector(selector);
      }
      else {
        el = document.querySelector(selector);
      }
      
      if(el && !el.tagName) { el = el[0]; }

      var repeat = function() {
        cnt++;
        //timer = 
        window.setTimeout(function() {
          waitUntilAppears.call(this, selector, iframe, callbackFn, cont_args, cnt);
        }, 500);
      };

      var fail = function() {
        alert('There has been a problem with the flow of the Walkthrough. Please refresh your page. Don\'t worry, you\'ll start from where you left off!');
      };

      if(cnt > 60) return fail();
      if(!el) return repeat();

      var pos = findPos(el);
      if($(el).height() === 0 || $(el).width() === 0 || pos[0] <= 1) return repeat();
      callbackFn.apply(undefined, cont_args);
    };

    var waitUntilOnDom = function(selector, iframe, callbackFn, cont_args, count) {
      //clearTimeout(timer);
      var cnt = (count || 0);

      if(iframe) {
        el = document.querySelector(iframe).contentWindow.document.querySelector(selector);
      }
      else {
        el = document.querySelector(selector);
      }
      
      if(el && !el.tagName) { el = el[0]; }

      var repeat = function() {
        cnt++;
        //timer = 
        window.setTimeout(function() {
          waitUntilOnDom.call(this, selector, iframe, callbackFn, cont_args, cnt);
        }, 500);
      };

      var fail = function() {
        alert('There has been a problem with the flow of the Walkthrough. Please refresh your page. Don\'t worry, you\'ll start from where you left off!');
      };

      if(cnt > 60) return fail();
      if(!el) return repeat();

      //if($(selector).length === 0) return repeat();
      callbackFn.apply(undefined, cont_args);
    };

    /* ----------- */
    
    Tourist.Tour.prototype.onChangeCurrentStep = function(model, step) {
      if(this.options.onEachStep) this.options.onEachStep.call(this, step);
      return this.view.render(step);
    };

    Tourist.Tour.prototype._showStep = function(step, index) {
      if (!step) {
        return;
      }
      step = _.clone(step);
      step.index = index;
      step.total = this.options.steps.length;
      if (!step.final) {
        step.final = this.options.steps.length === index + 1 && !this.options.successStep;
      }
      /* Needs to be after the wait */
      //step = _.extend(step, this._setupStep(step));
      return this.model.set({
        current_step: step
      });
    };

    Tourist.Tip.Base.prototype.template = _.template('<div>\n  <div class="tour-container">\n    <%= close_button %>\n  <h3><%= title %></h3>  <p class="content"><%= content %></p>\n<em><p><%= tip %></em></p>    <p class="tour-counter <%= counter_class %>"><%= counter%></p>\n  </div>\n  <div class="tour-buttons">\n    <%= buttons %>\n  </div>\n</div>');

    Tourist.Tip.Base.prototype._buildContentElement = function(step) {
      var buttons, content;

      buttons = this._buildButtons(step);

      content = $($.parseHTML(this.template({
        content: step.content,
        title: step.title,
        tip: step.tip||"",
        buttons: buttons,
        close_button: this._buildCloseButton(step),
        counter: step.final ? '' : "step " + (step.index + 1) + " of " + step.total,
        counter_class: step.final ? 'final' : ''
      })));

      if (!buttons) {
        content.find('.tour-buttons').addClass('no-buttons');
      }

      this._renderActionLabels(content);
      return content;
    };


    Tourist.Tour.prototype.next = function() {
      var currentStep, index;

      currentStep = this._teardownCurrentStep();
      index = 0;
      if (currentStep) {
        index = currentStep.index + 1;
      }

      if (index < this.options.steps.length) {

        var step = this.options.steps[index];
        var self = this;
        setTimeout(function() {
          waitUntilAppears(self.options.steps[index].target.selector, self.options.steps[index].iframe, function() {
            self._setupStep(self.options.steps[index]);
          });
        }, step.prepareTime||1);

        return this._showStep(this.options.steps[index], index);
      } else if (index === this.options.steps.length) {
        return this._showSuccessFinalStep();
      } else {
        return this._stop();
      }
    };

    // Tourist.Tour.prototype._setupStep = function(step) {
    //   var fn, _i, _len, _ref4;

    //   if (!(step && step.setup)) {
    //     return {};
    //   }
    //   if (step.bind) {
    //     _ref4 = step.bind;
    //     for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
    //       fn = _ref4[_i];
    //       step[fn] = _.bind(step[fn], step, this, this.options.stepOptions);
    //     }
    //   }
    //   var defOpts = { };
    //   if(step.target) {
    //     defOpts.target = step.target;
    //   }
    //   return step.setup.call(step, this, this.options.stepOptions) || defOpts;
    // };


    Tourist.Tip.Base.prototype.render = function(step) {
      this.hide();
      if (step) {


        var self = this;

        var goToNext = function() {
          waitUntilAppears(step.target.selector, step.iframe, function() {

            if(step.iframe) {
              step.target = $(step.iframe).contents().find(step.target.selector);
            }
            else {
              step.target = $(step.target.selector);
            }

            self._setTarget(step.target || false, step);
            self._setZIndex('');
            self._renderContent(step, self._buildContentElement(step));
            if (step.target) {
              self.show();
            }
            if (step.zIndex) {
              self._setZIndex(step.zIndex, step);
            }
          });
        };

        waitUntilOnDom(step.target.selector, step.iframe, function() {
          if(step.prepare) { step.prepare.call(this); }
          if(step.prepareTime) { setTimeout(function() { goToNext(); }, step.prepareTime); }
          else { goToNext(); }
        });

      }
      return this;
    };


    Tourist.Tip.Bootstrap.prototype._renderContent = function(step, contentElement) {
      var at, my;

      my = String(step.loc.split(',')[0]).trim() || 'left center';
      at = String(step.loc.split(',')[1]).trim() || 'right center';
      this.tip.setContainer(step.container || $('body'));
      this.tip.setContent(contentElement);
      return this.tip.setPosition(step.target || false, my, at, step.iframe);
    };

    return Tourist;
  });