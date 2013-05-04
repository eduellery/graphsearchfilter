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



//#4c66a4
$('#gsfhackquery').change(function() {
	// MAGIC
	// gabrielFunction(ourString, populateSuggestions(bla));
});