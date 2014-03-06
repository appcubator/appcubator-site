var Templates = {};

Templates.tempMeta = [
  '<ul class="meta" style="display:none;">',
    '<li><img class="delete" src="/static/img/delete-icon.png"></li>',
    '<li><img class="delete" src="/static/img/delete-icon.png"></li>',
  '</ul>'
].join('\n');


Templates.tempNode = [
  '<<%= element.tagName %> ',
  'class = "<%= element.class_name %>" ',
  '<% _(element.cons_attribs).each(function(val, key) { %>',
  '<%=key%>="<%=val%>"<% }); %> ',
  '<% _(element.content_attribs).each(function(val, key) { %>',
  '<%=key%>="<%=val%>"<% }); %>> ',
  '<% if(!element.isSingle) { %>',
  '<%= element.content %>',
  '</<%= element.tagName %>>',
  '<% }; %>'
].join('');

Templates.NavbarEditor = [
  '<div>',
    '<div class="clone">Click here to clone navigation bar from another page.</div>',
    '<div class="hoff1">',
      '<h4 class="offset1">Main Title</h4><input type="text" name="edit-brandName" class="span16" style="float:none;" id="edit-brandname" value="<%= brandName %>">',
    '</div>',
    '<hr>',
    '<h4 class="offset1">Links</h4>',
    '<div class="links-list hoff1">',
      '<ul id="link-editors"></ul>',
      '<div class="well well-small add-link">',
      'Add Link',
      '</div>',
    '</div>',
  '</div>'
].join('\n');

Templates.FooterEditor = [
  '<div>',
    '<div class="clone">Click here to clone footer from another page.</div>',
    '<div class="hoff1">',
      '<h4 class="offset1">Custom Footer Text</h4><input type="text" name="edit-customText" class="span16" style="float:none;" id="edit-customText" value="<%= customText %>">',
    '</div>',
    '<hr>',
    '<h4 class="offset1">Links</h4>',
    '<div class="links-list hoff1">',
      '<ul id="link-editors"></ul>',
      '<div class="well well-small add-link">',
      'Add Link',
      '</div>',
    '</div>',
  '</div>'
].join('\n');

Templates.LinkEditor = [
  '<div class="row">',
    '<div class="span12">',
      '<label>Link title</label>',
      '<input class="link-title" type="text" value="<%= title %>"">',
    '</div>',
    '<div class="span20">',
      '<div class="select-container">',
        '<label>Location</label>',
        '<select class="link-options"></select>',
      '</div>',
      '<div class="url-container" style="display: none">',
        '<label>Url</label>',
        '<input type="url" class="url" id="url" value="<%= url %>">',
      '</div>',
    '</div>',
    '<a class="remove" style="float:right" href="#">Delete Link</a>',
  '</div>'
].join('\n');


Templates.tempLi = [
  '<li id="entity-user-<%= attr %>" class="large single-data">',
  '<span class="name">Show <%= name %> <%= attr %></span></li>'
].join('\n');

Templates.tempLiSingleData = [
  '<li id="entity-<%= cid %>-<%= attr %>" class="large single-data">',
  '<span class="name">Show <%= name %> <%= attr %></span></li>'
].join('\n');

Templates.tempLiEntity = [
  '<li id="entity-<%= cid %>" class="show entity">',
  '<span class="name">List of <%= name %></span></li>'
].join('\n');

Templates.tempLiTable = [
  '<li id="entity-<%= cid %>" class="table-gal entity">',
  '<span class="name"><%= name %> Table</span></li>'
].join('\n');

Templates.tempHrefSelect = [
  '<select class="select-href" id="prop-<%= hash %>">',
  "<% _(listOfPages).each(function(page){ var b = ''; if(('internal://'+page) == val){ b = 'selected';}%>",
  '<option value="internal://<%= page %>" <%= b %>><%= page %></option>',
  '<%  }) %>',
  '<% if(external) { %><option value="<%= external %>" selected><%= external %></option><% }; %>',
  '<option value="external-link">External Link</option>',
  '</select>'
].join('\n');

Templates.tempSourceSelect = [
  '<select class="statics"  id="prop-<%= hash %>">',
  '<option class="upload-image">Placeholder</option>',
  "<% _(statics).each(function(asset){ var b = ''; if(asset == val){ b = 'selected';} %>",
  '<option value="<%= asset.url %>" <%= b %>><%= asset.name %></option>',
  '<%  }) %>',
  '<option class="upload-image" value="upload-image">+ Upload an image</option>',
  '</select>'
].join('\n');

Templates.tableNode = [
  '<table class="table table-bordered">',
    '<tr><% _(fieldsToDisplay).each(function(field) { %> <td><%= field %></td> <% }); %></tr>',
    '<tr><% _(fieldsToDisplay).each(function(field) { %> <td><i><%= field %>Data</i></td> <% }); %></tr>',
    '<tr><% _(fieldsToDisplay).each(function(field) { %> <td><i><%= field %>Data</i></td> <% }); %></tr>',
    '<tr><% _(fieldsToDisplay).each(function(field) { %> <td><i><%= field %>Data</i></td> <% }); %></tr>',
    '<tr><% _(fieldsToDisplay).each(function(field) { %> <td><i><%= field %>Data</i></td> <% }); %></tr>',
  '</table>'
].join('\n');

Templates.createFormButton = [
  '<li id="entity-<%= entity.cid %>-<%= form.cid %>" class="create entity">',
  '<span class="name"><%= form.get(\'name\') %> Form</span></li>'
].join('\n');

Templates.formButton = [
  '<li id="entity-<%= entity.cid %>-<%= form.cid %>" class="<%= form.get(\'action\') %> entity">',
  '<span class="name"><%= form.get(\'name\') %> Form</span></li>'
].join('\n');

var FieldTypes = {
  "single-line-text" : '<input type="text" class="" placeholder="<%= field.get(\'placeholder\') %>">',
  "paragraph-text"   : '<textarea class="" placeholder="<%= field.get(\'placeholder\') %>"></textarea>',
  "dropdown"         : '<select class="drowdown"><% _(field.get(\'options\').split(\',\')).each(function(option, ind){ %><option><%= option %><% }); %></option>',
  "option-boxes"     : '<span class="option-boxes"><% _(field.get(\'options\').split(\',\')).each(function(option, ind){ %><div class="option"><input id="opt-<%= ind %>" class="field-type" type="radio" name="types" value="single-line-text"><label for="opt-<%= ind %>"><%= option %></label></div><% }); %></span>',
  "password-text"    : '<input type="password" class="password" placeholder="<%= field.get(\'placeholder\') %>">',
  "email-text"       : '<input type="text" class="email" placeholder="<%= field.get(\'placeholder\') %>">',
  "button"           : '<input type="submit" class="btn" value="<%= field.get(\'placeholder\') %>">',
  "image-uploader"   : '<div class="upload-image btn">Upload Image</div>',
  "file-uploader"    : '<div class="upload-file btn">Upload File</div>',
  "date-picker"      : '<div class="date-picker-wrapper"><input type="text" placeholder="<%= field.get(\'placeholder\') %>"><img class="date-picker-icon"></div>'
};


Templates.fieldNode = [
'<label><%= field.get(\'label\') %></label>',
  '<% if(field.get(\'displayType\') == "single-line-text") { %>',
    FieldTypes['single-line-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "paragraph-text") { %>',
    FieldTypes['paragraph-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "dropdown") { %>',
    FieldTypes['dropdown'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "option-boxes") { %>',
    FieldTypes['option-boxes'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "password-text") { %>',
    FieldTypes['password-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "email-text") { %>',
    FieldTypes['email-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "button") { %>',
    FieldTypes['button'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "image-uploader") { %>',
    FieldTypes['image-uploader'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "file-uploader") { %>',
    FieldTypes['file-uploader'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "date-picker") { %>',
    FieldTypes['date-picker'],
  '<% } %>'
].join('\n');

Templates.queryView = [
  // '<small>',
  // '<p id="query-description"><%= c.nLang %></p>',
  // '</small>',
  '<div class="sections-container">',
    '<% if(type == "table") { %>',
    '<div class="sect">',
    '<p>What fields would you like to display?</p>',
    '<% _.each(entity.get("fields").models, function(field) { %>',
      '<% var checked = \'\'; var u_id = field.cid; if(_.contains(query.get(\'fieldsToDisplay\'), field.get(\'name\'))) { checked = \'checked\'; } %>',
      '<label><input class="fields-to-display btn" id="field-<%= field.cid %>" type="checkbox" value="<%= field.get(\'name\') %>" <%= checked %>><%= field.get(\'name\') %></label>',
    '<% }) %>',
    '</div>',
    '<% } %>',
    '<div class="sect">',
    '<% queries.each(function(query) { %>',
    '<input type="checkbox" class="query-option" id="query-<%= query.cid %>"><label for="query-<%= query.cid %>"><%= query.get("nl_description") %></label><br  />',
    '<% }); %>',
    '</div>',
    '<div class="sect">',
    '<p>How do you want to sort the rows?</p>',
    '<select class="sort-by">',
    '<option id="by-date" value="Date">From older to newer</option>',
    '<option id="by-date" value="-Date">From newer to older</option>',
    // '<% _.each(entity.get("fields").models, function(field) { %>',
    //   '<% var selected = "";  if("by-" + field.get("name") == query.get("sortAccordingTo")) selected = "selected" %>',
    //   '<option value="by-<%=field.get("name")%>" <%= selected %>>Alphabetically according to <%= field.get("name") %></option>',
    // '<% }); %>',
    '</select>',
    '</div>',

    '<div class="sect">',
    '<p>How many rows would you like to show?</p>',
    '<label><input type="radio" class="nmr-rows" id="all-rows" name="nmrRows" value="All" <%= c.rAll %>> All</label>',
    '<label><input type="radio" class="nmr-rows" id="first-rows" name="nmrRows" value="First" <%= c.rFirst %>> <input type="text" id="first-nmr" value="<%= c.rFirstNmr %>"> rows</label>',
    '</div>',
  '</div>'
].join('\n');


Templates.listEditorView = [
  '<span class="view-type-list type-pick"></span><span class="view-tyle-grid type-pick"></span>',
].join('\n');


Templates.tempUIElement = [
  '<<%= element.get(\'tagName\') %>',
  'class = "<%= element.get(\'class_name\') %>"',
  '<% if(element.get(\'cons_attribs\')) { %>',
  '<% _(element.get(\'cons_attribs\').attributes).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>',
  '<% } %>',
  '<% _(element.get(\'content_attribs\').attributes).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>>',
  '<% if(!element.get(\'isSingle\')) { %>',
  '<%= element.get(\'content\') %>',
  '</<%= element.get(\'tagName\') %>>',
  '<% }; %>'
].join('\n');

Templates.sliderTemp = [
  '<div id="slider-<%= cid %>" class="carousel slide">',
    '<ol class="carousel-indicators">',
      '<% for(var i=0; i < slides.length; i++) { %>',
      '<li data-target="#slider-<%= cid %>" data-slide-to="<%= i %>" <% if(i==0) { %>class="active" <% } %>></li>',
      '<% } %>',
    '</ol>',
    '<!-- Carousel items -->',
    '<div class="carousel-inner">',
      '<% _(slides).each(function(slide, index) { %>',
        '<div class="<% if(index == 0) { %>active <% } %>item">',
          '<img src="<%= slide.image %>">',
          '<div class="carousel-caption"><p><%= slide.text %></p></div>',
        '</div>',
      '<% }); %>',
    '</div>',
    '<!-- Carousel nav -->',
    '<a class="carousel-control left" href="#slider-<%= cid %>" data-slide="prev">&lsaquo;</a>',
    '<a class="carousel-control right" href="#slider-<%= cid %>" data-slide="next">&rsaquo;</a>',
  '</div>',
].join('\n');

Templates.twitterfeedTemp = [
'<script src="http://widgets.twimg.com/j/2/widget.js"></script>',
'<script>',
'new TWTR.Widget({',
  'version: 2,',
  'type: \'profile\',',
  'rpp: 4,',
  'interval: 6000,',
  'width: \'auto\',',
  'height: 300,',
  'theme: {',
    'shell: {',
      'background: \'#aacceb\',',
      'color: \'#ffffff\'',
    '},',
    'tweets: {',
      'background: \'#000000\',',
      'color: \'#ffffff\',',
      'links: \'#1398f0\'',
    '}',
  '},',
  'features: {',
    'scrollbar: true,',
    'loop: false,',
    'live: true,',
    'hashtags: true,',
    'timestamp: true,',
    'avatars: true,',
    'behavior: \'all\'',
  '}',
'}).render().setUser(\'<%= username %>\').start();',
'</script>'].join('\n');

Templates.facebookshareTemp = ['<img src="/static/img/fb-share-sample.png" width="300" >'].join('\n');

Templates.sliderEditorTemp = [
  '<div class="row">',
  '<ul class="slider-images" style="height:490px; overflow-y: scroll;">',
  '</ul>',
  '</div>'
].join('\n');

Templates.sliderImageEditorTemp = [
  '<li id="image-editor-<%= cid %>" class="span11 offset1 hoff1">',
    '<div class="thumbnail">',
      //'<img src="<%= image %>>',
      '<img src="<%= image %>">',
      '<p><textarea type="text" class="text" id="edit-<%= cid %>"><%= text %></textarea></p>',
      '<span class="btn btn-danger btn-small remove" id="remove-<%= cid %>">Remove</span>',
    '</div>',
  '</li>'
].join('\n');

Templates.thirdPartyLogin = [
  '<div class="<%= provider %>-login-btn btn"><%= content %></div>'
].join('\n');


Templates.searchboxTemp = [
'<form class="search-box">',
'<input type="text" placeholder="Search for  <%= entityName %>…">',
'<input type="submit" class="btn" value="Search">',
'</form>'
].join('\n');
