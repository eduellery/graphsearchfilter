// Add listener to both ok and cancel button to fade the modal when it's clicked
$('#gsfhackok').click(function() {
  $('#gsfhackmodal').remove();
});
$('#gsfhackcancel').click(function() {
  $('#gsfhackmodal').remove();
});
// Load parameters to save custom audience
$('#gsfhackhidden').append($('input[name="fb_dtsg"]').first().clone())
$('#gsfhackhidden').append('<input name="__user" type="hidden" value="' + $.parseJSON($('a.fbxWelcomeBoxBlock').first().attr('data-gt'))["bmid"] + '">');

// Query's bar listener
$('#gsfhackquery').keyup(function() {
	var new_query = $(this).val();
	if (new_query == "") {
		$('#gsfhack-autocomplete').css('display', 'none');
	} else {
		$('#gsfhack-autocomplete').html('');
		$('#gsfhack-autocomplete').css('display', 'block');
		$('#gsfhack-autocomplete').css('width', $('#gsfhackquery').width() + "px");
		var position = $('#gsfhackquery').position();
		$('#gsfhack-autocomplete').css('top', position.top + $('#gsfhackquery').height() + "px");
		$('#gsfhack-autocomplete').css('left',  position.left + parseInt($('#gsfhackquery').css('margin-left')) + "px");

		getSuggestions(new_query, function(list) {
      console.log(list);
			for (var i  = 0; i < list.length && i < 5; i++) {
				var suggestion = list[i];
				var text = "";
				for (var j  = 0; j < suggestion.query.length; j++) {
					if (typeof(suggestion.query[j]) == 'string') {
						text += suggestion.query[j] + " ";
					} else {
						text += "<b>" + suggestion.query[j].text + "</b> ";
					}
				};
				if (suggestion.category != '' && suggestion.category != undefined) {
					text += " <span class='gsfhack-category'> · " + suggestion.category + "</span> ";
				}	
				if (suggestion.subtext != '') {
					text += " <span class='gsfhack-subtext'> - " + suggestion.subtext + "</span> ";
				}	
				var div_sug = '<div id="sug' + i + '" class="gsfhack-sugbox" >' + text + '</div>';
				$('#gsfhack-autocomplete').append(div_sug);
			};
		});
	}
});
