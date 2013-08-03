define([
  'designer-app/UIElementListView',
  'fontselect',
  'util',
  'designer-app/ThemeTemplates'
],function(UIElementListView) {

  var UIElementAttributesModel = Backbone.Model.extend({ });

  var UIElementStyleModel = Backbone.Model.extend({ });

  var ThemeEditView = Backbone.View.extend({
    el: document.body,
    events: {
      'click #save'        : 'save',
      'click .expandible'  : 'expandSection',
      'keyup #base-css'    : 'baseChanged',
      'keyup #fonts-editor'       : 'fontsChanged',
      'click #create-page' : 'pageCreateClicked',
      'submit .create-page-form' : 'pageCreateSubmitted',
      'click #upload-static' : 'uploadStatic'
    },

    initialize: function(themeModel) {
      _.bindAll(this);

      var self = this;
      this.model = themeModel;
      window.themeModel = this.model;
      this.render();

      if(!themeModel.has('lists')) {
        themeModel.set('lists', new Backbone.Collection());
      }

      var buttonView     = new UIElementListView(this.model.get('buttons'), 'button');
      util.get('button-cont').appendChild(buttonView.el);
      var imageView      = new UIElementListView(this.model.get('images'), 'image');
      util.get('image-cont').appendChild(imageView.el);
      var headerTextView = new UIElementListView(this.model.get('headerTexts'), 'header-text');
      util.get('header-text-cont').appendChild(headerTextView.el);
      var textView       = new UIElementListView(this.model.get('texts'), 'text');
      util.get('text-cont').appendChild(textView.el);
      var linkView       = new UIElementListView(this.model.get('links'), 'link');
      util.get('link-cont').appendChild(linkView.el);
      var textInputView  = new UIElementListView(this.model.get('textInputs'), 'text-input');
      util.get('text-input-cont').appendChild(textInputView.el);
      var passwordView   = new UIElementListView(this.model.get('passwords'), 'password');
      util.get('password-cont').appendChild(passwordView.el);
      var textAreaView   = new UIElementListView(this.model.get('textAreas'), 'text-area');
      util.get('text-area-cont').appendChild(textAreaView.el);
      var lineView       = new UIElementListView(this.model.get('lines'), 'line');
      util.get('line-cont').appendChild(lineView.el);
      var dropdownView   = new UIElementListView(this.model.get('dropdowns'), 'dropdown');
      util.get('dropdown-cont').appendChild(dropdownView.el);
      var boxView        = new UIElementListView(this.model.get('boxes'), 'box');
      util.get('box-cont').appendChild(boxView.el);
      var formView        = new UIElementListView(this.model.get('forms'), 'form');
      util.get('form-cont').appendChild(formView.el);
      var listView        = new UIElementListView(this.model.get('lists'), 'list');
      util.get('list-cont').appendChild(listView.el);
      //this.model.get('pages').bind('add', this.renderPage);
    },

    render: function() {
      var self = this;

      this.editor = ace.edit("base-css");
      this.editor.getSession().setMode("ace/mode/css");
      this.editor.setValue(this.model.get('basecss'));

      //$('#fonts-editor').val(this.model.get('fonts'));
      /*this.model.get('pages').each(function(page, ind) {
        self.renderPage(page, ind);
      });*/

      this.initFonts();

      _(statics).each(function(file) {
        util.get('statics-cont').innerHTML += '<img width="100" src="'+ file.url +'">' + file.name;
      });
    },

    initFonts: function() {
      var self = this;
      var fontStyles = document.createElement('style');
      fontStyles.type="text/css";

      // add font to page style, and to font list
      this.model.get('fonts').each(function(font) {
        fontStyles.innerHTML += '@import url("http://fonts.googleapis.com/css?family='+font.get('name')+':400,700,900,400italic");\n';
        $('#fonts-cont .fonts').append(_.template(ThemeTemplates.tempFont, { font: font.get('name').replace(/\+/g, ' '), cid: font.cid }));
      });
      document.body.appendChild(fontStyles);

      // setup font event handlers
      $('.font-selector').fontselect().change(function() {
        var value = $(this).val();
        if(self.model.get('fonts').where({name: value}).length > 0) {
          return false;
        }
        var newFont = self.model.get('fonts').add({name: value});
        console.log(self.model.get('fonts').toJSON());
        var font = value.replace(/\+/g, ' ');
        $('#fonts-cont .fonts').append(_.template(ThemeTemplates.tempFont, { font: font, cid: newFont.cid }));
      });

      $('#fonts-cont .fonts ').on('click', 'li .remove', function(e) {
        var cid = e.currentTarget.dataset.cid;
        self.model.get('fonts').remove(cid);
        console.log(self.model.get('fonts').toJSON());
        $(e.currentTarget).parent().remove();
      });
    },

    baseChanged: function(e) {

      // height: 3901px;
      // line-height: 18px;
      // margin-bottom: 0px;
      // margin-left: 0px;
      // margin-right: 0px;
      // margin-top: 0px;
      // overflow-x: hidden;
      // padding-bottom: 0px;
      // padding-left: 0px;
      // padding-right: 0px;
      // padding-top: 0px;
      // position: relative;
      // width: 1125px;

      var currentCSS = this.editor.getValue();
/*
      var bodyRegExp = /body \{([^\}]+)\}/g;
      var marginRegExp = /margin:([^;]+);/g;
      var heightRegExp = /height:([^;]+);/g;
      var positionRegExp = /position:([^;]+);/g;
      var widthRegExp = /width:([^;]+);/g;
      var overflowXRegExp = /overflow-x:([^;]+);/g;

      if(bodyRegExp.exec(currentCSS) && bodyRegExp.exec(currentCSS).length > 0) {
        var initBodyTag = bodyRegExp.exec(currentCSS)[0];
      }
      else {
        var initBodyTag = "";
      }

      var newBodyTag;
      newBodyTag = initBodyTag.replace(heightRegExp, '');
      newBodyTag = newBodyTag.replace(marginRegExp, '');
      newBodyTag = newBodyTag.replace(positionRegExp, '');
      newBodyTag = newBodyTag.replace(widthRegExp, '');
      newBodyTag = newBodyTag.replace(overflowXRegExp, '');


      currentCSS = currentCSS.replace(initBodyTag, newBodyTag);
*/
      this.model.set('basecss', currentCSS);
    },

    fontsChanged: function(e) {
      this.model.set('fonts', e.target.value);
    },

    renderPage: function(page, ind) {
      /*var pages = util.get('pages-list');
      var cInd = ind;
      if(ind === null) {
        cInd = (this.model.get('pages').models.length);
      }
      if(typeof cInd != "number") {
        cInd = cInd.models.length -1;
      }

      pages.innerHTML += '<li><a href="/theme/'+ themeId +'/editor/' + cInd +'">' + page.get('name') + '</a></li>';*/
    },

    expandSection: function(e) {
      $('.expanded').removeClass('expanded');
      $('#' + e.target.id + "-cont").addClass('expanded');
    },

    pageCreateClicked: function(e) {
      $(e.target).hide();
      $('.create-page-form').fadeIn();
      $('.create-page-name').focus();
    },

    pageCreateSubmitted: function(e) {
      e.preventDefault();
      var name =  $('.create-page-name').val();/*
      var newPage = new PageDesignModel({name: name});
      $('.create-page-name').val('');
      this.model.get('pages').add(newPage);*/
      $('.create-page-form').hide();
      $('#create-page').fadeIn();
    },

    uploadStatic: function() {
      var self = this;
      util.openThemeFilePick(self.staticsAdded, self, themeId);
    },

    staticsAdded: function(files, self) {
      // _(files).each(function(file){
      //   file.name = file.filename;
      //   statics.push(file);
      // });
      // self.model.get('content_attribs').set('src', _.last(files).url);
    },

    save: function(e) {
      e.preventDefault();
      var json = this.model.toJSON();
      var url;
      if(themeId) { url = '/theme/'+themeId+'/edit/'; }
      else if(appId) { url = '/app/' + appId + '/uiestate/'; }
      var save_btn = $('.save-btn img');
      console.log(save_btn[0]);
      save_btn.attr('src', '/static/img/ajax-loader-white.gif');

      $.ajax({
        type: "POST",
        url: url,
        data: {uie_state: JSON.stringify(json)},
        statusCode: {
          200: function(data) {
            $('.save-btn img').attr('src', '/static/img/checkmark.png').hide().fadeIn();
            var timer = setTimeout(function(){
                $('.save-btn img').attr('src', '/static/img/save.png').hide().fadeIn();
                clearTimeout(timer);
            }, 1000);
          },
          500: function() {
            alert('Server Error');
          }
        },
        dataType: "JSON"
      });
    }
  });

  return ThemeEditView;
});
