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
  '<div class="row hoff2">',
    '<div class="span13">',
      '<p><label>Normal State</label></p>',
      //'<p><textarea name="style" class="style span12 hi10" placeholder="Styling here..."><%= info.style %></textarea></p>',
      '<p>'<div class="style span12 hi10"></div></p>',
    '</div>',
    '<div class="span13">',
      '<p><label>Hover State</label></p>',
      '<p><textarea name="style" class="hover-style span12 hi10" placeholder="Styling here..."><%= info.hoverStyle %></textarea></p>',
    '</div>',
    '<div class="span13">',
      '<p><label>Active State</label></p>',
      '<p><textarea name="style" class="active-style span12 hi10" placeholder="Styling here..."><%= info.activeStyle %></textarea></p>',
    '</div>',
  '</div>',
  '<div class="btn done">Done</div>',
'</form>'
].join('\n');

ThemeTemplates.tempCreate = [
'<div class="span54 hoff1 create-text">',
  '<div class="pane border minhi">',
    '<span class="">+ Create an element</span>',
  '</div>',
'</div>'
].join('\n');
