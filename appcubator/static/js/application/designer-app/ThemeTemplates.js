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
'<form class="element-create-form">',
  '<label>Class Name: <input type="text" name="className" class="class_name" value="<%= info.class_name %>" placeholder="Class Name..."></label><div class="btn btn-danger delete-elem pull-right">Delete Element</div>',
  '<div class="hoff2"><label>Normal State <br><textarea name="style" class="style span12 hi10" placeholder="Styling here..."><%= info.style %></textarea></label>',
  '<label>Hover State <br><textarea name="style" class="hover-style span12 offset1 hi10" placeholder="Styling here..."><%= info.hoverStyle %></textarea></label>',
  '<label>Active State <br><textarea name="style" class="active-style span12 offset1 hi10" placeholder="Styling here..."><%= info.activeStyle %></textarea></label></div>',
  '<div class="btn done">Done</div>',
'</form>'
].join('\n');

ThemeTemplates.tempCreate = [
'<div class="span9 hoff1 create-text">',
  '<div class="pane border minhi">',
    '<span class="">+ Create an element</span>',
  '</div>',
'</div>'
].join('\n');