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

// 
var getTheUsersFromTheQuery = function(semantic) {

	var loader = '<div id="gsfhackloader"><div class="fbProfileBrowserNullstate fbProfileBrowserListContainer fsxl fcg">' +
				 	'<img class="throbber img" src="https://fbstatic-a.akamaihd.net/rsrc.php/v2/y9/r/jKEcVPZFk-2.gif" alt="" width="32" height="32"/>' +
				 		'<br>Loading...' +
				 '</div></div>'
				 console.log('Suricate Sebosooooooo');
	$('.fbProfileBrowserResult').first().append(loader);

	getUsers(semantic, function(list) {
		$('#gsfhackloader').remove();
		if (list.length > 0) {
			for (var i =  0; i < list.length; i++) {
				user = list[i];
				user_li = '<li class="multiColumnCheckable checkableListItem" role="option">' + 
					'<input type="checkbox" class="checkbox" name="checkableitems[]" value="' + user.uid + '"/>' +
					'<a class="anchor" href="#" tabindex="-1"><div class="clearfix">' +
						'<img src="' + user.photoUrl + '" class="photo _8o img lfloat"/>' + 
						'<div class="content _42ef">' +
							'<div class="_6a _6b spacer"></div>' +
								'<div class="_6a _6b">' +
									'<div class="fcb fwb text">' + user.name + '</div>' +
								'</div>' +
							'</div>' +
				 		'</div>' +
					'</a>' +
				'</li>';
				$('#filtered_graph_people').append(user_li);
			};
		} else {
			$('#gsfhackloader').remove();
			var loader = '<div id="gsfhackloader"><div class="fbProfileBrowserNullstate fbProfileBrowserListContainer fsxl fcg">No friends found... ):</div></div>'
			$('.fbProfileBrowserResult').append(loader);
		}
	});
} 

// Query's bar listener
$('#gsfhackquery').keyup(function() {
	var new_query = $(this).val();
	if (new_query == "") {
		$('#gsfhack-autocomplete').css('display', 'none');
	} else {
		getSuggestions(new_query, function(list) {
			$('#gsfhack-autocomplete').html('');
			$('#gsfhack-autocomplete').css('display', 'block');
			$('#gsfhack-autocomplete').css('width', $('#gsfhackquery').width() + "px");
			var position = $('#gsfhackquery').position();
			$('#gsfhack-autocomplete').css('top', position.top + $('#gsfhackquery').height() + "px");
			$('#gsfhack-autocomplete').css('left',  position.left + parseInt($('#gsfhackquery').css('margin-left')) + "px");
			for (var i  = 0; i < list.length; i++) {
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
				var secret_query = '<input id="secv' + i + '" type="hidden" value="' + suggestion.semantic + '" />';
				$('#gsfhack-autocomplete').append(div_sug);
				$('#sug' + i).append(secret_query);
				$('#sug' + i).click(function() {
					$(this).unbind('click');
					var semanticsres = $(this).find('input').first().val();
					$('#gsfhack-autocomplete').html('');
					$('#gsfhack-autocomplete').css('display', 'none');
					getTheUsersFromTheQuery(semanticsres);
				});
			};
		});
	}
});

