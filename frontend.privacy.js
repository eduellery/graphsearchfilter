var GRAPH_SEARCH_LABEL = 'Graph Search';

// Copy the Custom privacy option, and polish the clone (turn it into a Graph Search option)
var g_s_option = $('li[data-label="Custom"]')
  .clone()
  .removeAttr('id')
  .attr('data-label', GRAPH_SEARCH_LABEL)
  .removeClass('checked');
// Remove checked 
var inner_gso = g_s_option.children(':first').removeAttr('aria-checked');
// Add our icon to the option
inner_gso.children(':nth-child(1)').attr('class', 'mrs itemIcon img gsfhack');	
// Change the option text to Graph Search
var inner_sc_gso = inner_gso.children(':nth-child(2)');
var ispan_sc_gso = inner_sc_gso.children('span').clone();
inner_sc_gso.text(GRAPH_SEARCH_LABEL);
inner_sc_gso.append(ispan_sc_gso);

// Adds a listener to it, so it can load the graph search modal
g_s_option.click(function() {
  $('body').append('<div id="gsfhackmodal"></div>')
  $('#gsfhackmodal').load(chrome.extension.getURL('privacy_modal.html'), function() {
    $('#gsfhackmodal').append('<script type="text/javascript" src="' + chrome.extension.getURL("./privacy_modal.js") + '"></script>');
  });
});

// And finally insert our new option
$('li[data-label="Custom"]').after(g_s_option)

// Add the option to the select
$('select[name="audience[0][value]"] > option[value="111"]').after('<option value="666">Graph Search</option>')
