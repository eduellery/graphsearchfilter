

function mountApiSuggestionItem(result,entities){
    //Get a item from result and a list of entities and do the magic!
    var ID = result['semantic'];
    var semanticForest = result['semanticForest'];
    var query = [];
    var display = result['parse']['display'];
    var newQuery = [];
    var subtext = '';
    var category = '';
    for(var i in display){
            if(typeof(display[i]) == "string"){
                    newQuery.push(display[i]);
            } else if(typeof(display[i]) == "object") {
                    var entity = display[i];
                    var getEntityResult = getEntity(entities, entity.uid)
                    entity.type = getEntityResult.type;
                    entity.text = getEntityResult.text;
                    category = getEntityResult.category_rendered;
                    subtext = getEntityResult.subtext;
                    newQuery.push(entity);
            }
    }
    var response =  {'query': newQuery, 'subtext' : subtext, 'category' : category};
    response.semantic = ID;
    return response;
    
}

function getEntity(entities, uid){
        for(var i in entities)
                if(entities[i].uid == uid) {
                    return entities[i];
                }
        return false;
}

function getSuggestions(search_string,callback){
    //Replace by Thiago's function
    //jQuery
    //Complete the get with string passed*********
    //var data = $.get('http://www.las.ic.unicamp.br/~gabriel/pub/result.php', function parseSuggestionList(data){
    if (typeof(search_string) == 'string'){
        search_string = [search_string];
    }
    console.log(search_string);
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


    var data = $.get("https://www.facebook.com/ajax/typeahead/search/facebar/query/",json_query, function(data){
        var fbJson = JSON.parse(data.substring(9));
        var result = [];
        fbJson.payload.results.sort(function(a, b){ return a.cost - b.cost; });
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
// var a = ["My Friends who live in ", {text: "Curitiba, Brazil", type :"page", uid:106336072738718}, " and like"];
//var a = ["Graph"];
//console.log(JSON.stringify(a));
// getSuggestions(a, function log (newQuery){
//   console.log("Results from autcomplete above");
//   console.log(newQuery);});

function l(data){ console.log(data); }

// Constants
var searchBaseUrl = "https://www.facebook.com/search/"
var userId = $(".headerTinymanPhoto").attr("id").match(/\d+/)[0];
var resultsPageBaseUrl = "https://www.facebook.com/ajax/pagelet/generic.php/BrowseScrollingSetPagelet";

// Builds a search URL from a semantic query.
function makeUrlFromSemantic(semantic){
    // We should probably build a tree and traverse it in postorder. But screw that, this works too.
    return semantic.match(/[a-zA-Z0-9\-]+/g).reverse().join("/")
}

function getFirstPage(semantic){
    var url = makeUrlFromSemantic(semantic);

    return $.get(searchBaseUrl + url, null, "html");
}

// Strips trailing for(;;) from response.
function parseJsonResponse(response){
    return JSON.parse(response.substring(9));
}

function makeAPIUser(fbUser){
    return {
        uid: fbUser.uid,
        name: fbUser.text,
        photoUrl: "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-prn1/s160x160/20783_10151848827816729_587339413_a.png"
    }
}

function getFirstPageUsers(searchPage){
    l("Search page OK");

    var d = $.Deferred();

    // Does not work for nested objects. Fortunately, we're not dealing with any today.
    var candidateObjects = searchPage.match(/\{.*?\}/g);
    var users = [];

    var queryObject = null;
    var cursor = null;

    for(var i in candidateObjects){
        try{
            var parsed = JSON.parse(candidateObjects[i]);
            if(parsed.type == "ent:user")
                users.push(parsed);
            if(parsed.cursor !== undefined)
                cursor = parsed.cursor;
            if(parsed.view == "list" || parsed.view == "grid")
                queryObject = parsed;
        } catch(e) { }
    }

    if(!queryObject){
        l("No results!");
        d.reject([]);
    }

    queryObject.cursor = cursor;
    queryObject.ads_at_end = true;
    queryObject.view = "list";

    var result = {
        users: users,
        queryObject: queryObject
    }

    l(result);

    d.resolve(result);
    return d.promise();
}

function getRemainingUsers(result){
    var d = $.Deferred();

    function getNextPage(callback){
        $.get(resultsPageBaseUrl, {
            data: JSON.stringify(result.queryObject),
            __user: userId,
            __a: 1,
            __dyn: "7n8ahxoNpGodo",
            __req: "r"
        }, callback, "html");
    }

    function processPage(resultPage){
        l("Get page OK... " + result.users.length + " users so far");

        var nextCursor = undefined;

        function findUserObjects(arr){
            var elements = [];

            if(!arr.length || typeof(arr) == "string"){
                if(arr.type && arr.type == "ent:user"){
                    return [arr];
                } else if(arr.cursor) {
                    nextCursor = arr.cursor;
                    return [];
                }
                
                return [];
            }

            for(var i in arr){
                if(!arr[i]) continue;
                elements = elements.concat(findUserObjects(arr[i]));
            } 

            return elements;  
        }

        var data = parseJsonResponse(resultPage);
        var newUsers = findUserObjects(data.jsmods.require);

        result.users = result.users.concat(newUsers);

        if(nextCursor == undefined || newUsers.length == 0){
            d.resolve(result.users);
        } else {
            l(["Users entrando", newUsers]);
            result.queryObject.cursor = nextCursor;
            getNextPage(processPage);
        }
    }

    getNextPage(processPage);

    return d.promise();
}

function getUsers(semantic, callback){

    getFirstPage(semantic, callback)
        .then(getFirstPageUsers, callback)
        .then(getRemainingUsers, callback)
        .then(callback, callback);
}

// var testQuery = ["My friends who live in ",{"uid":"105429806157119","type":"page","text":"Brazil"}," and are younger than me"];
// getSuggestions(testQuery, function(suggestions){
//     var s = suggestions[0].semantic;
//     getUsers(s, function(d){ console.log(["ACABOU", d]); });
// });