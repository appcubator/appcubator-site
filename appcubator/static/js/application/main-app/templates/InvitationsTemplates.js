var InvitationsTemplates = {};

InvitationsTemplates.mainTemp = [
'<h2>Invite a Friend to Appcubator!</h2>',
'<form action="" class="new-invitation row">',
	'<div class="span17">',
		'<input type="text" class="firstname input-block-level" placeholder="First Name">',
		'<input type="text" class="lastname input-block-level" placeholder="Last Name">',
		'<input type="text" class="email input-block-level" placeholder="Email">',
	'</div>',
	'<div class="span17 offset1">',
		'<input type="text" class="subject input-block-level" placeholder="Subject">',
		'<textarea class="message hi5 input-block-level" placeholder="Message:"></textarea>',
		'<input type="submit" class="btn btn-info pull-right" value="Send">',
	'</div>',
'</form>',
'<h2>Invitations Sent</h2>',
'<table class="invitations table table-striped table-hover table-bordered">',
	'<thead>',
		'<tr class="row">',
			'<th class="span10">Invitee</th>',
			'<th class="span10">When</th>',
			'<th class="span10">Status</th>',
		'</tr>',
	'</thead>',
	'<tbody></tbody>',
'</table>'
].join('\n');

InvitationsTemplates.invitationListItemTemp = [
'<tr class="row">',
	'<td class="span10 offset2"><%= invitee %></td>',
	'<td class="span10 offset2"><%= date %></td>',
	'<td class="span10 offset2"><% if (!status) { %>Not <% } %>Accepted</td>',
'</tr>',
].join('\n');
