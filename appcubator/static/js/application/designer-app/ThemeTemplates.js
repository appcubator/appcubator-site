var ThemeTemplates = {};

ThemeTemplates.tempNode = [
  '<div class="element-node">',
  '<<%= info.tagName %> ',
  'id="<%= info.class_name %>" ',
  '<% _(info.cons_attribs).each(function(val, key){ %>',
  '<%= key %> = <%= val %>',
  '<% }); %><% _(info.content_attribs).each(function(val, key){ %>',
  '<%= key %> = <%= val %>',
  '<% }); %>>',
  '<% if(!info.isSingle) { %>',
  '<%= info.content %></<%=info.tagName%>>',
  '<% } %>',
  '</div>'
].join('\n');

ThemeTemplates.tempPane = [
  '<div class="sect span43"><p class="lead">Normal State</p><div id="style-<%= cid %>" class="style span42 hi11" placeholder="Styling here..."></div></div>',
  '<div class="sect span20"><p class="lead">Hover State</p><div id="hover-style-<%= cid %>" class="hover-style span20 hi11"></div></div>',
  '<div class="sect span20 offset1"><p class="lead">Active State</p><div id="active-style-<%= cid %>" class="active-style span20 hi11"></div></div>'
].join('\n');

ThemeTemplates.tempCreate = [
'<div class="span44 hoff1 create-text pane hi7">',
  '<img src="/static/img/add.png" class="span3 add-img">',
  '<h3 class="hoff1 offset1">Create an element</span>',
'</div>',
'<div class="hi8 span44"></div>'
].join('\n');

ThemeTemplates.tempFont = [
  '<li class="row hi4">',
    '<button class="span6 btn btn-small btn-danger remove" data-cid="<%= cid %>">Remove</button>',
    '<span class="span18 offset2 font" style="font-family:<%= font %>"><%= font %></span>',
  '</li>'
].join('\n');
