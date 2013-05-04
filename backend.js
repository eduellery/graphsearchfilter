function getSuggestionList(search_string) {
  //Pegar cada campo do results substitiuir os items em entities e gera a lista
  var fbJson = JSON.parse(downloadAutoComplete(search_string));
  var result = [];
  console.log(fbJson);
  for (var i in fbJson['payload']['results']){
    var item = mountApiSuggestionItem(fbJson['payload']['results'][i],fbJson['payload']['entities']);
    result.push(item);
  }
  return result;
}

function mountApiSuggestionItem(result,entities){
  //Get a item from result and a list of entities and do the magic!
  var ID = result['semantic'];
  var semanticForest = result['semanticForest'];
  var query = [];
  var display = result['parse']['display'];
  var newQuery = [];
  var subtext = '';
  for(var i in display){
      if(typeof(display[i]) == "string"){
          newQuery.push(display[i]);
      } else if(typeof(display[i]) == "object") {
          var entity = display[i];
          var getEntityResult = getEntity(entities, entity.uid)
          entity.text = getEntityResult.text;
          subtext = getEntityResult.subtext;
          newQuery.push(entity);
      }
  }
  var response =  {'query': newQuery, 'subtext' : subtext};
  resposta[ID] = semanticForest;
  return response;
  
}

function getEntity(entities, uid){
    for(var i in entities)
        if(entities[i].uid == uid) {
          console.log(entities[i]);
          return entities[i];
        }
    return false;
}

function downloadAutoComplete(search_string){
  //Replace by Thiago's function
  //jQuery
  var data = $.getJSON('http://www.las.ic.unicamp.br/~gabriel/pub/result.json', function(data) {
    console.log("Download with succes!");});
  return data;
}

