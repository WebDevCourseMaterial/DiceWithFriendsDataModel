/* Namespace */
var rh = rh || {};
rh.dwf = rh.dwf || {};
rh.dwf.games = rh.dwf.games || {};

rh.dwf.games.enableButtons = function() {
	$("#new-game-btn").click(function() {
		$('input[name=invited_player_email]').val("");
	    $('#new-game-modal').modal('show');
	});
};

/* main */
$(document).ready( function() {
	rh.dwf.games.enableButtons();
});