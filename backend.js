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
          entity.type = getEntityResult.type;
          entity.text = getEntityResult.text;
          subtext = getEntityResult.subtext;
          newQuery.push(entity);
      }
  }
  var response =  {'query': newQuery, 'subtext' : subtext};
  response[ID] = semanticForest;
  return response;
  
}

function getEntity(entities, uid){
    for(var i in entities)
        if(entities[i].uid == uid) {
          return entities[i];
        }
    return false;
}

function downloadAutoComplete(search_string,callback){
  //Replace by Thiago's function
  //jQuery
  //Complete the get with string passed*********
  //var data = $.get('http://www.las.ic.unicamp.br/~gabriel/pub/result.php', function parseSuggestionList(data){
  console.log(search_string);
  var userId = $(".headerTinymanPhoto").attr("id").match(/\d+/)[0];
  var json_query = {
                    value : JSON.stringify(search_string),
                    context : 'facebar',
                    grammar_version : '7ca1b059f1a46f3d3cb62914007c6e86432a41e1',
                    viewer : userId,
                    rsp : 'search',
                    sid : 0.11356468964368105,
                    qid : 5,
                    see_more : false,
                    max_results : 8,
                    num_entities : 0,
                    __user : userId,
                    __a : 1,
                    __dyn : '7n8ahxoNpGodo',
                    __req : 35 }


  var data = $.get("https://www.facebook.com/ajax/typeahead/search/facebar/query/",json_query, function parseSuggestionList(data){
    //Pegar cada campo do results substitiuir os items em entities e gera a lista
    console.log("cheguei no callback");
    var fbJson = JSON.parse(data.substring(9));
    var result = [];
    for (var i in fbJson['payload']['results']){
      var item = mountApiSuggestionItem(fbJson['payload']['results'][i],fbJson['payload']['entities']);
      result.push(item);
    }
    callback(result);
    
  }, "html");
}

//downloadAutoComplete('bla', function log (data){ console.log(data);});
//APENAS FUNCIONA COM MEU USER ID!!!
//
var a = ["My Friends who live in ", {text: "Curitiba, Brazil", type :"page", uid:106336072738718}, " and like"];
var a = ["Graph"];
//console.log(JSON.stringify(a));
//downloadAutoComplete(a, function log (data){ console.log(data);});
//chrome.cookies.get(object details, function callback);
