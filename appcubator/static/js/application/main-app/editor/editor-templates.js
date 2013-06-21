var Templates = {};

Templates.tempMeta = [
  '<ul class="meta" style="display:none;">',
    '<li><img class="delete" src="/static/img/delete-icon.png"></li>',
    '<li><img class="delete" src="/static/img/delete-icon.png"></li>',
  '</ul>'
].join('\n');


Templates.tempNode = [
  '<<%= element.tagName %>',
  'class = "<%= element.class_name %>"',
  '<% _(element.cons_attribs).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>',
  '<% _(element.content_attribs).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>>',
  '<% if(!element.isSingle) { %>',
  '<%= element.content %>',
  '</<%= element.tagName %>>',
  '<% }; %>'
].join('\n');

Templates.NavbarEditor = [
  '<h3>Navbar Editor</h3>',
  '<div>',
    '<legend for="edit-brandName">Main Title</legend>',
    '<input type="text" name="edit-brandName" id="edit-brandname" value="<%= brandName %>"></div>',
    '<legend for="links">Links</legend>',
    '<ul id="link-editors"></ul>',
    '<button class="btn btn-primary btn-small add-link">Add Link</div>',
  '</div>'
].join('\n');

Templates.FooterEditor = [
  '<h3>Footer Editor</h3>',
  '<div>',
    '<legend for="customText">Custom Footer Text</legend>',
    '<input type="text" id="edit-customText" value="<%= customText %>">',
    '<legend for="links">Links</legend>',
    '<ul id="link-editors"></ul>',
    '<button class="btn btn-primary btn-small add-link">Add Link</button>',
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
  "dropdown"         : '<select class="drowdown"><% _(field.get(\'options\')).each(function(option, ind){ %><option><%= option %><% }); %></option>',
  "option-boxes"     : '<span class="option-boxes"><% _(field.get(\'options\')).each(function(option, ind){ %><label for="opt-<%= ind %>"></label><input id="opt-<%= ind %>" class="field-type" type="radio" name="types" value="single-line-text"><%= option %><% }); %></span>',
  "password-text"    : '<input type="password" class="" placeholder="<%= field.get(\'placeholder\') %>">',
  "email-text"       : '<div class="input-prepend"><span class="add-on">@</span><input type="text" class="" placeholder="<%= field.get(\'placeholder\') %>"></div>',
  "button"           : '<input type="submit" class="btn" value="<%= field.get(\'placeholder\') %>">',
  "image-uploader"   : '<input type="file" placeholder="<%= field.get(\'placeholder\') %>">',
  "date-picker"      : '<input type="text" placeholder="<%= field.get(\'placeholder\') %>">'
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
  '<% if(field.get(\'displayType\') == "date-picker") { %>',
    FieldTypes['date-picker'],
  '<% } %>'
].join('\n');

Templates.queryView = [
  '<h1 class="title"><%= entity.get(\'name\') %> <% if(type == "list") { print(\'List\'); } else { print(\'Table\'); } %></h1>',
  '<small>',
  '<p id="query-description"><%= c.nLang %></p>',
  '</small>',
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
    '<% var checked = (query.get(\'belongsToUser\') === false)? "checked" : \'\' %>',
    '<p>Do you want to show the rows that just belong to the logged in user?</p>',
    '<label><input type="radio" class="belongs-to-user" name="belongsTo" value="true" checked> Yes</label>',
    '<label><input type="radio" class="belongs-to-user" name="belongsTo" value="false"<%= checked %>> No</label>',
    '</div>',
    '<div class="sect">',
    '<p>How do you want to sort the rows?</p>',
    '<select class="sort-by">',
    '<option id="by-date">According to the date created</option>',
    '<% _.each(entity.get("fields").models, function(field) { %>',
      '<% var selected = "";  if("by-" + field.get("name") == query.get("sortAccordingTo")) selected = "selected" %>',
      '<option value="by-<%=field.get("name")%>" <%= selected %>>Alphabetically according to <%= field.get("name") %></option>',
    '<% }); %>',
    '</select>',
    '</div>',

    '<div class="sect">',
    '<p>How many rows would you like to show?</p>',
    '<label><input type="radio" class="nmr-rows" id="all-rows" name="nmrRows" value="All" <%= c.rAll %>> All</label>',
    '<label><input type="radio" class="nmr-rows" id="first-rows" name="nmrRows" value="First" <%= c.rFirst %>> <input type="text" id="first-nmr" value="<%= c.rFirstNmr %>"> rows</label>',
    '</div>',
  '</div>',
  '<div class="bottom-sect"><div class="q-mark"></div><div class="btn done-btn">Done</div></div>'
].join('\n');

Templates.listQueryView = [
  '<h1 class="title"><%= entity.get(\'name\') %> List Editor</h1>',
  '<hr>',
  '<div class="sect">',
  '<p id="query-description"><%= c.nLang %></p>',
  '</div>',
  '<hr>',
    '<div class="sect">',
    '<% var checked = (query.get(\'belongsToUser\') === false)? "checked" : \'\' %>',
    '<p>Do you want to show the rows that just belong to the logged in user?</p>',
    '<label><input type="radio" class="belongs-to-user" name="belongsTo" value="true" checked> Yes</label>',
    '<label><input type="radio" class="belongs-to-user" name="belongsTo" value="false"<%= checked %>> No</label>',
    '</div>',
    '<hr>',
    '<div class="sect">',
    '<p>How do you want to sort the rows?</p>',
    '<select class="sort-by">',
    '<option id="by-date">According to the date created</option>',
    '<% _.each(entity.get("fields").models, function(field) { %>',
      '<% var selected = "";  if("by-" + field.get("name") == query.get("sortAccordingTo")) selected = "selected" %>',
      '<option value="by-<%=field.get("name")%>" <%= selected %>>Alphabetically according to <%= field.get("name") %></option>',
    '<% }); %>',
    '</select>',
    '</div>',
    '<hr>',
    '<div class="sect">',
    '<p>How many rows would you like to show?</p>',
    '<label><input type="radio" class="nmr-rows" id="all-rows" name="nmrRows" value="All" <%= c.rAll %>> All</label>',
    '<label><input type="radio" class="nmr-rows" id="first-rows" name="nmrRows" value="First" <%= c.rFirst %>> First <input type="text" id="first-nmr" value="<%= c.rFirstNmr %>"> rows</label>',
    '<label><input type="radio" class="nmr-rows" id="last-rows" name="nmrRows" value="Last" <%= c.rLast %>> Last <input type="text" id="last-nmr" value="<%= c.rLastNmr %>"> rows</label>',
    '</div>',
    '<hr>'
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


Templates.tempUIElementSized = [
  '<div style="position:absolute; left: <%= element.layout.get(\'left\') %>px; top:<%= element.layout.get(\'top\') %>px; width:<%= element.layout.get(\'width\')%>px; height:<%=element.layout.get(\'height\')%>px;">',
  '<<%= element.data.get(\'tagName\') %>',
  'class = "<%= element.data.get(\'class_name\') %>"',
  '<% if(element.data.get(\'cons_attribs\')) { %>',
  '<% _(element.data.get(\'cons_attribs\').attributes).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>',
  '<% } %>',
  '<% _(element.data.get(\'content_attribs\').attributes).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %> style="">',
  '<% if(!element.data.get(\'isSingle\')) { %>',
  '<%= element.data.get(\'content\') %>',
  '</<%= element.data.get(\'tagName\') %>>',
  '<% }; %>',
  '</div>'
].join('\n');

Templates.rowNode = [
  '<div <% if(isListOrGrid == "list") { %> class="row hi<%= layout.get(\'height\')%> block" <% } else { %> class="row span<%= layout.get(\'width\') %> hi<%= layout.get(\'height\') %>" <% } %> style="position:relative;">',
    '<% _(uielements).each(function(element){ %>',
      Templates.tempUIElementSized,
    '<% }); %>',
  '</div>'
].join('\n');

Templates.listNode = [
  '<div>',
    Templates.rowNode,
    Templates.rowNode,
    Templates.rowNode,
    Templates.rowNode,
  '</div>'
].join('\n');


Templates.sliderTemp = [
  '<ul class="flex slides">',
    '<% _(slides).each(function(slide) { %>',
    '<li>',
      '<img src="<%= slide.image %>" />',
      '<p class="flex-caption"><%= slide.text %><p/>',
    '</li>',
    '<% }); %>',
  '</ul>'
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
  '<h2>Image Slider Editor</h2>',
  '<div class="row">',
  '<ul class="slider-images hoff1"></ul>',
  '</div>'
].join('\n');

Templates.sliderImageEditorTemp = [
  '<li id="image-editor-<%= cid %>" class="span10 offset1">',
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
