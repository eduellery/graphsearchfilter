// Add listener to both ok and cancel button to fade the modal when it's clicked
$('#gsfhackok').click(function() {
  $('#gsfhackmodal').remove();
});
$('#gsfhackcancel').click(function() {
  $('#gsfhackmodal').remove();
});
$('#gsfhackhidden').append($('input[name="fb_dtsg"]').first().clone())
