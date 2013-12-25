var TableTemplates = {};

TableTemplates.Table = [
  '<div class="entity">',
    '<div class="header">',
      '<div>',
        '<h2><%= name %></h2>',
        '<div class="q-mark-circle"></div>',
      '</div>',
      '<ul class="tabs">',
        '<li class="excel right-icon">',
          '<span class="icon"></span>',
          '<span>Access Data</span>',
        '</li>',
        '<li class="trash right-icon">',
          '<span class="icon"></span>',
          '<span>Code</span>',
        '</li>',
      '</ul>',
    '</div><div class="description"><div class="title">Description</div>',
      '<span class="tbl-wrapper span58">',
        '<span class="tbl">',
          '<ul class="property-list">',
            '<div class="column span6">',
              '<div class="hi3 hdr">Property</div>',
              '<div class="hi3 desc">Type</div>',
            '</div>',
            '<div class="column span7">',
              '<div class="hi3 hdr">Date Created</div>',
              '<div class="hi3">',
                '<select class="attribs" id="Name" disabled>',
                  '<option value="text" selected="">Date</option>',
                '</select>',
              '</div>',
            '</div>',
          '</ul>',
          '<div class="column span8 add-property-column">',
            '<form class="add-property-form" style="display:none">',
              '<div class="hi2 hdr">',
                '<input type="text" class="property-name-input span7" placeholder="Property Name...">',
              '</div>',
              '<input type="submit" class="done-btn" value="Done">',
            '</form>',
            '<span class="add-property-button box-button"><span class="plus-icon"></span>Add Property</span>',
          '</div>',
        '</span>',
      '</span>',
    '</div>',
  '</div>',
  '<div class="hi3 span58">',
    '<div class="related-fields"></div>',
  '</div>',
].join('\n');


TableTemplates.Property = [
'<div class="column" id="column-<%- cid %>">',
  '<div class="hi3 hdr"><%- name %></div>',
  '<div class="hi3 type-field" id="type-row-<%- cid %>">',
    '<select class="attribs" id="type-<%- cid %>">',
      '<option value="text" <% if(type =="text") %> selected <% %>>Text</option>',
      '<option value="number" <% if(type =="number") %> selected <% %>>Number</option>',
      '<option value="email" <% if(type =="email") %> selected <% %>>Email</option>',
      '<option value="image" <% if(type =="image") %> selected <% %>>Image</option>',
      '<option value="date" <% if(type =="date") %> selected <% %>>Date</option>',
      '<option value="file" <% if(type =="file") %> selected <% %>>File</option>',
      '<option value="money" <% if(type =="money") %> selected <% %>>USD($)</option>',
    '</select>',
  '</div>',
  '<div class="hi4 prop-cross" id="delete-<%- cid %>">',
    '<div class="remove hoff1">Remove</div>',
  '</div>',
'</div>'
].join('\n');

TableTemplates.UserTable = [
'<div class="row">',
  '<div class="span58 entity" id="user-entity">',
    '<div class="header">',
      '<div class="offset2 hi4 span20">',
        '<h2><%= name %></h2>',
        '<div class="q-mark-circle"></div>',
      '</div>',
      '<span class="right">',
        /*'<span class="hi4 show-data right-icon">',
          '<span class="icon"></span>',
          '<span>Description</span>',
        '</span><span class="hi4 show-data right-icon">',
          '<span class="icon"></span>',
          '<span>See User Data</span>',*/
         '<span class="hi4 excel right-icon">',
          '<span class="icon"></span>',
          '<span>Access Data</span>',
        '</span><span class="hi4 trash right-icon">',
          '<span class="icon"></span>',
        '</span>',
      '</span>',
    '</div><div class="description"><div class="title">Description</div>',
      '<span class="tbl-wrapper span58">',
        '<span class="tbl">',
          '<ul class="property-list">',
            '<div class="column span6">',
              '<div class="hi3 hdr">Property</div>',
              '<div class="hi3 desc">Type</div>',
            '</div>',
          '</ul>',
          '<div class="column span8 add-property-column">',
            '<form class="add-property-form" style="display:none">',
              '<div class="hi2 hdr">',
                '<input type="text" class="property-name-input span7" placeholder="Property Name...">',
              '</div>',
              '<input type="submit" class="done-btn" value="Done">',
            '</form>',
            '<span class="add-property-button box-button"><span class="plus-icon"></span>Add Property</span>',
          '</div>',
        '</span>',
      '</span>',
    '</div>',
    '</div>',
    '<div class="hi3 span58">',
        '<div class="related-fields"></div>',
    '</div>',
  '</div>'
].join('\n');

TableTemplates.Navbar = [
'<div class="span58 entity-nav">',
  '<ul class="form-list offset1 hoff1">',
  '</ul>',
'</div>'
].join('\n');

TableTemplates.NewRelationTemplate = [
'<div class="new-relation">',
  'A <%= table1.get(\'name\') %> has ',
  '<select id="relation-type-<%= table1.cid %>">',
    '<option value="many" <%= (selected=="many") ? "selected" : "" %>>a list of <%= util.pluralize(table2.get(\'name\')) %></option>',
    '<option value="one" <%= (selected=="one") ? "selected" : "" %>>a <%= table2.get(\'name\') %></option>',
  '</select>',
  'called <input id="relation-name-<%= table1.cid %>" type="text">',
'</div>'
].join('\n');

TableTemplates.relationalNL = {};

TableTemplates.relationalNL["o2o"] = [
'<div class="pane span28 hboff2 relation" data-owner="<%= entity_name %>" data-entity="<%= entity_name %>" id="relation-<%= cid %>">',
  '<span class="remove-relation">×</span>',
  '<div class="icon-o2o"></div>',
  '<span class="span16 hoff1 offset1">',
  '<div class="row">A <%= entity_name %> has a <%= owner_entity %> <div>called <strong><%= related_name %></strong></div></div>',
  '<div class="row hoff2">A <%= owner_entity %> has a <%= entity_name %> <div>called <strong><%= name %></strong></div></div>',
  '</span>',
'</div>'
].join('\n');

TableTemplates.relationalNL["fk"] = [
'<div class="pane span28 hboff2 relation" data-owner="<%= entity_name %>" data-entity="<%= entity_name %>"  id="relation-<%= cid %>">',
  '<span class="remove-relation">×</span>',
  '<div class="icon-fk"></div>',
  '<span class="offsetr1 hoff1 offset1">',
  '<div class="row">A <%= entity_name %> has a list of <%= util.pluralize(owner_entity) %> <div>called <strong><%= related_name %></strong></div></div>',
  '<div class="row hoff2"><%= util.pluralize(owner_entity) %> belong to a <%= entity_name %> <div>called <strong><%= name %></strong></div></div>',
  '</span>',
'</div>'
].join('\n');


TableTemplates.relationalNL["m2m"] = [
'<div class="pane span28 offsetr1 hboff2 relation" data-owner="<%= entity_name %>" data-entity="<%= entity_name %>"  id="relation-<%= cid %>">',
  '<span class="remove-relation">×</span>',
  '<div class="icon-m2m"></div>',
  '<span class="span16 hoff1 offset1">',
    '<div class="row">A <%= entity_name %> has many <%= util.pluralize(owner_entity) %> <div>called <strong><%= name %></strong></div></div>',
    '<div class="row hoff2">A <%= owner_entity %> has many <%= util.pluralize(entity_name) %> <div>called <strong><%= related_name %></strong></div></div>',
  '</span>',
'</div>'
].join('\n');
