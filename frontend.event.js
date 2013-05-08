$(function(){

	function showDialog(){
	  $('body').append('<div id="gsfhackmodal"></div>')
	  $('#gsfhackmodal').load(chrome.extension.getURL('event_modal.html'), function() {
	    $('#gsfhackmodal').append('<script type="text/javascript" src="' + chrome.extension.getURL("./event_modal.js") + '"></script>');
	  });
	}

	$(document).on('DOMNodeInserted', 'div', function(e) {
		var target = $(e.target);
		var inputs = $("input[name=\"who\"]", target);
		if(inputs.length == 0) return;

	  	var a = $('input[name=\"who\"]').parent();
		a.append("<span> | </span>");

		$("<a>Invite friends with GraphPicker</a>")
			.click(showDialog)
			.appendTo(a);
	});

});