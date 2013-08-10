define([
  'tourist'
  ],
  function() {

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

    return Tourist;
  });