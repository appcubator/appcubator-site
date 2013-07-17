define([],
function() {

  var ToolBarView = Backbone.View.extend({
    subviews: [],

    events: {
      'mouseover .menu-button.pages' : 'expandPages',
      'mouseout .menu-button.pages'  : 'shrinkPages'
    },

    initialize: function(navbarModel) {
      _.bindAll(this);

      this.nmrFields = v1State.get('pages').length;
      this.listenTo(v1State.get('pages'), 'change', function() {
        this.nmrFields = v1State.get('pages').length;
      }, this);

    },


    render: function() {

      this.pageList = util.get('page-list');

      this.pageList.innerHTML += '<li>'+ v1State.get('pages').models[pageId].get('name') +'</li>';

      v1State.get('pages').each(function(page, ind) {
        if(pageId == ind) return;
        this.pageList.innerHTML += '<li class="go-to-page" id="page-'+ind+'"><a>' + page.get('name') +
                                          '</a></li>';
      }, this);

      var createBox = new Backbone.NameBox({tagName: 'li', className:'new-page', txt:'New Page'});
      createBox.on('submit', this.createPage);

      util.get('page-list').appendChild(createBox.el);

      return this;
    },


    expandPages: function () {
      console.log($('.pages'));
      console.log(this.nmrFields);
      $('#page-list').height((this.nmrFields + 1) * 42);
    },

    shrinkPages: function() {
      $('#page-list').height(40);
    }

  });

  return ToolBarView;
});
