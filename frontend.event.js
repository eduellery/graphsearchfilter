$(function(){

	// Copy the Custom privacy option, and polish the clone (turn it into a Graph Search option)
	// var g_s_option = $('span>input[name=\"who\"] a')
	//   .clone()
	//   .removeAttr('id');
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

	  	console.log("node inserted: %s", e.target.nodeName);
	  	var a = $('input[name=\"who\"]').parent();
		console.log(a);
		a.append("<span> | </span>");

		$("<a>Invite friends with GraphPicker</a>")
			.click(showDialog)
			.appendTo(a);
	});


	// // Adds a listener to it, so it can load the graph search modal
	// g_s_option.click(function() {
	//   $('body').append('<div id="gsfhackmodal"></div>')
	//   $('#gsfhackmodal').load(chrome.extension.getURL('privacy_modal.html'), function() {
	//     $('#gsfhackmodal').append('<script type="text/javascript" src="' + chrome.extension.getURL("./privacy_modal.js") + '"></script>');
	//   });
	// });

	// // And finally insert our new option
	// $('li[data-label="Custom"]').after(g_s_option);

	// // Add the option to the select
	// $('select[name="audience[0][value]"] > option[value="111"]').after('<option value="666">Graph Search</option>');
});