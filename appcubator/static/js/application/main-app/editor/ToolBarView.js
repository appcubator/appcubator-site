define([
  'models/PageModel',
  'mixins/BackboneNameBox'
],
function(PageModel) {

  var ToolBarView = Backbone.View.extend({
    subviews: [],

    events: {
      'mouseover .menu-button.pages' : 'expandPages',
      'mouseout .menu-button.pages'  : 'shrinkPages',
      'click .home'          : 'clickedHome',
      'click .go-to-page'    : 'clickedGoToPage'
    },

    initialize: function(navbarModel) {
      _.bindAll(this);

      this.nmrFields = v1State.get('pages').length;
      this.listenTo(v1State.get('pages'), 'add remove', function() {
        this.nmrFields = v1State.get('pages').length;
      }, this);

    },


    render: function() {

      this.pageList = util.get('page-list');

      this.pageList.innerHTML += '<li>'+ v1State.get('pages').models[pageId].get('name') +'</li>';

      v1State.get('pages').each(function(page, ind) {
        if(pageId == ind) return;
        this.renderPageItem(ind, page.get('name'));
      }, this);

      this.createBox = new Backbone.NameBox({tagName: 'li', className:'new-page', txt:'New Page'}).render();
      this.createBox.on('submit', this.createPage);

      util.get('page-list').appendChild(this.createBox.el);

      return this;
    },

    renderPageItem: function(ind, name) {
      this.pageList.innerHTML += '<li class="go-to-page" id="page-'+ind+'"><a>'+name+'</a></li>';
    },

    clickedHome: function(e) {
      v1.navigate("app/"+ appId +"/pages/", {trigger: true});
    },

    clickedGoToPage: function(e) {
      var goToPageId = (e.target.id||e.target.parentNode.id).replace('page-','');
      v1.navigate("app/"+ appId +"/editor/" + goToPageId +"/", {trigger: true});
    },

    createPage: function(name) {
      var pageUrlPart = name.replace(/ /g, '_');
      var pageUrl = { urlparts : [pageUrlPart] };
      var pageInd = v1State.get('pages').length;
      var pageModel = new PageModel({ name: name, url: pageUrl});
      v1State.get('pages').push(pageModel);

      var self = this;
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(v1State.toJSON()),
        complete: function() {
          $('<li class="go-to-page" id="page-'+pageInd+'"><a>'+name+'</a></li>').insertBefore($('#page-list').find(".new-page"));
          self.expandPages();
        },
        dataType: "JSON"
      });
    },

    expandPages: function () {
      $('#page-list').height((this.nmrFields + 1) * 42);
    },

    shrinkPages: function(e) {
      if(util.isMouseOn(e.pageX, e.pageY, this.pageList)) return;

      console.log("REMOOOOVE");
      $('#page-list').height(40);
      this.createBox.reset();
    }

  });

  return ToolBarView;
});
