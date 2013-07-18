var ThemeTemplates = {};

ThemeTemplates.tempNode = [
  '<div class="element-node">',
  '<<%= info.tagName %> ',
  'class="<%= info.class_name %>" ',
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
  '<div class="sect"><label>Normal State</label><br  /><div id="style-<%= cid %>" class="style span40 hi10" placeholder="Styling here..."></div></div>',
  '<div class="sect"><label>Hover State</label><br  /><div id="hover-style-<%= cid %>" class="hover-style span40 hi10"></div></div>',
  '<div class="sect"><label>Active State</label><br  /><div id="active-style-<%= cid %>" class="active-style span40 hi10"></div></div>'
].join('\n');

ThemeTemplates.tempCreate = [
'<div class="span9 hoff1 create-text">',
  '<div class="pane border minhi">',
    '<span class="">+ Create an element</span>',
  '</div>',
'</div>'
].join('\n');