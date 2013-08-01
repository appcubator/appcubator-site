var InvitationsTemplates = {};

InvitationsTemplates.mainTemp = [
'<h2>Invite a Friend to Appcubator!</h2>',
'<form action="" class="new-invitation row">',
	'<div class="span20 offset8">',
		'<input type="text" class="name input-block-level" placeholder="First Name">',
		'<input type="text" class="email input-block-level" placeholder="Email">',
		'<input type="submit" class="btn btn-info pull-right btn-block" value="Send">',
	'</div>',
'</form>',
'<h2 class="hoff2">Invitations Sent</h2>',
'<table class="invitations table table-striped table-hover table-bordered">',
	'<thead>',
		'<tr>',
			'<th>Invitee</th>',
			'<th>When</th>',
			'<th>Status</th>',
		'</tr>',
	'</thead>',
	'<tbody></tbody>',
'</table>'
].join('\n');

InvitationsTemplates.invitationListItemTemp = [
'<tr>',
	'<td><%= invitee %></td>',
	'<td><%= date %></td>',
	'<td><%= accepted %></td>',
'</tr>',
].join('\n');
