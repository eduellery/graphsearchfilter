// Add listener to both ok and cancel button to fade the modal when it's clicked
$('#gsfhackok').click(function() {
  var checked_people = $('#filtered_graph_people input:checked').closest("li");

  var ids = [];
  checked_people.each(function(k,v){
    ids.push($(v).attr('id'));
  });
  console.log(ids);

  $("input[name=\"who\"]").val(ids.join(','));
  $('#gsfhackmodal').remove();

});
//   $("input[name^=\"audience\"]").remove();
//   //$("select[name^=\"audience\"]").remove();

//   function createInput(name, value){
// 		var el = $("<input />")
// 		  	.attr("type", "hidden")
// 		  	.attr("autocomplete", "off")
// 		  	.attr("name", name)
// 		  	.attr("value", value);
// 		console.log(el);
// 		return el;
//   }

//   if($(".customPrivacyInputs").length == 0)
//   	$("<span />").attr("class", "customPrivacyInputs").appendTo(body);

//   createInput("audience[0][value]", "111").appendTo(".customPrivacyInputs");
//   createInput("audience[0][custom_value]", "111").appendTo(".customPrivacyInputs");
//   createInput("audience[0][friends]", "30").appendTo(".customPrivacyInputs");
//   for(var i in users)
//   	createInput("audience[0][ids_anon][" + i + "]", users[i].id).appendTo(".customPrivacyInputs");

//   $("option[value=\"111\"]").remove();
//   $("option[value=\"666\"]").val("111");

//   $('#gsfhackmodal').remove();
// });
$('#gsfhackcancel').click(function() {
  $('#gsfhackmodal').remove();
});
// // Load parameters to save custom audience
// $('#gsfhackhidden').append($('input[name="fb_dtsg"]').first().clone())
// $('#gsfhackhidden').append('<input name="__user" type="hidden" value="' + $.parseJSON($('a.fbxWelcomeBoxBlock').first().attr('data-gt'))["bmid"] + '">');

// // 
var getTheUsersFromTheQuery = function(semantic) {

	$('#gsfhackloader').remove();
	var loader = '<div id="gsfhackloader"><div class="fbProfileBrowserNullstate fbProfileBrowserListContainer fsxl fcg">' +
				 	'<img class="throbber img" src="https://fbstatic-a.akamaihd.net/rsrc.php/v2/y9/r/jKEcVPZFk-2.gif" alt="" width="32" height="32"/>' +
				 		'<br>Loading...' +
				 '</div></div>'
	$('.fbProfileBrowserResult').first().append(loader);
	$('#filtered_graph_people').html('');

	getUsers(semantic, function(list) {
		$('#gsfhackloader').remove();
		if (list.length > 0) {
			$('.boxcheckeverybody').remove();

			var check_all_button = '<div class="boxcheckeverybody"><input id="checkeverybody" type="checkbox"/>Select/Deselect All</div>'
			$('.gsfhack-results-box').first().before(check_all_button);
			$('#checkeverybody').click(function() {
				$('#checkeverybody').prop("checked", !$('#checkeverybody').is(':checked'));
			});
			$('.boxcheckeverybody').click(function(e) {
				e.stopPropagation();
				$('#checkeverybody').prop("checked", !$('#checkeverybody').is(':checked'));
				$('#checkeverybody').change();
				return true;
			});
			$('#checkeverybody').change(function() {
				$('input[name="checkableitems[]"]').prop("checked", $(this).is(':checked'));
			});

			for (var i =  0; i < list.length; i++) {
				user = list[i];
				user_li = '<li id="' + user.uid + '" class="multiColumnCheckable checkableListItem" role="option">' + 
					'<input id="check' + user.uid + '" type="checkbox" class="checkbox" name="checkableitems[]" value="' + user.uid + '"/>' +
					'<input id="name' + user.uid + '" type="hidden" value="' + user.name + '" />' +
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
				$('#' + user.uid).click(function() {
					$('#check' + $(this).attr('id')).prop("checked", !$('#check' + $(this).attr('id')).is(':checked'));
					$('#gsfhackmyselectedfriends').html('');
					$('input[name="checkableitems[]"]:checked').each(function(index) {
					  var uid = $(this).attr('id').substring(5);	
					  var nome = $('#name' + uid).val();
					  $('#gsfhackmyselectedfriends').append('<input name="text_visibleto[' + index + ']" type="hidden" value="' + nome + '" />');
					  $('#gsfhackmyselectedfriends').append('<input name="visibleto[' + index + ']" type="hidden" value="' + uid + '" />');
					});
				});
			};
		} else {
			$('#gsfhackloader').remove();
			var loader = '<div id="gsfhackloader"><div class="fbProfileBrowserNullstate fbProfileBrowserListContainer fsxl fcg">No friends found... ):</div></div>'
			$('.fbProfileBrowserResult').first().append(loader);
		}
	});
} 

// Query's bar listener
$('#gsfhackquery').on("keyup webkitspeechchange",function() {
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
				var selectedQuery = "";
				for (var j  = 0; j < suggestion.query.length; j++) {
					if (typeof(suggestion.query[j]) == 'string') {
						text += suggestion.query[j] + " ";
						selectedQuery += suggestion.query[j] + " ";
					} else {
						text += "<b>" + suggestion.query[j].text + "</b> ";
						selectedQuery += suggestion.query[j].text;
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
				var secret_text = '<input id="sectext' + i + '" type="hidden" value="' + selectedQuery + '" />';
				$('#gsfhack-autocomplete').append(div_sug);
				$('#sug' + i).append(secret_query);
				$('#sug' + i).append(secret_text);
				$('#sug' + i).click(function() {
					$(this).unbind('click');
					var semanticsres = $(this).find('input').first().val();
					var textres = $(this).children(':last-child').val();
					console.log('Resolvido ' + textres);
					$('#gsfhack-autocomplete').html('');
					$('#gsfhack-autocomplete').css('display', 'none');
					getTheUsersFromTheQuery(semanticsres);
					$('#gsfhackquery').val(textres);
				});
			};
		});
	}
});
