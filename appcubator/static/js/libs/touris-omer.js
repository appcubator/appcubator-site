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

      console.log(el);
      console.log($(el).height());
      console.log($(el).width());
      console.log(pos);
      if($(selector).length === 0 || $(el).height() === 0 || $(el).width() === 0 || pos[0] <= 1 || pos[1] <= 1) return repeat();
      callbackFn.apply(undefined, cont_args);
    };

    /* ----------- */
    
    Tourist.Tour.prototype.onChangeCurrentStep = function(model, step) {
      if(this.options.onEachStep) this.options.onEachStep.call(this, step);
      return this.view.render(step);
    };

    Tourist.Tip.Base.prototype.template = _.template('<div>\n  <div class="tour-container">\n    <%= close_button %>\n  <h3><%= title %></h3>  <p class="content"><%= content %></p>\n    <p class="tour-counter <%= counter_class %>"><%= counter%></p>\n  </div>\n  <div class="tour-buttons">\n    <%= buttons %>\n  </div>\n</div>');

    Tourist.Tip.Base.prototype._buildContentElement = function(step) {
      var buttons, content;

      buttons = this._buildButtons(step);

      content = $($.parseHTML(this.template({
        content: step.content,
        title: step.title,
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

    Tourist.Tip.Base.prototype.render = function(step) {
      this.hide();
      if (step) {

        console.log(step.target);

        var self = this;

        console.log(step.target.selector);

        waitUntilAppears(step.target.selector, function() {

          step.target = $(step.target.selector);
          console.log(step.target);

          console.log("YAOOO");

          self._setTarget(step.target || false, step);
          self._setZIndex('');
          console.log('yalloo');
          self._renderContent(step, self._buildContentElement(step));
          if (step.target) {
            self.show();
          }
          if (step.zIndex) {
            self._setZIndex(step.zIndex, step);
          }
        });

      }
      return this;
    };


    Tourist.Tip.Bootstrap.prototype._renderContent = function(step, contentElement) {
      var at, my;
      console.log(step.loc.split(','));

      my = String(step.loc.split(',')[0]).trim() || 'left center';
      at = String(step.loc.split(',')[1]).trim() || 'right center';
      this.tip.setContainer(step.container || $('body'));
      this.tip.setContent(contentElement);
      return this.tip.setPosition(step.target || false, my, at);
    };

    return Tourist;
  });