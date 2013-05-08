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
            if ( fbJson['payload']['results'][i].type ==  "browse_type_user" || fbJson['payload']['results'][i].type == '{user}')
            {
              var item = mountApiSuggestionItem(fbJson['payload']['results'][i],fbJson['payload']['entities']);
              result.push(item);
            }
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


// Constants
var searchBaseUrl = "https://www.facebook.com/search/"
var userId = undefined;
var resultsPageBaseUrl = "https://www.facebook.com/ajax/pagelet/generic.php/BrowseScrollingSetPagelet";

$(function(){
    userId = $(".headerTinymanPhoto").attr("id").match(/\d+/)[0];
});

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

function getUsersFromHtml(html){
    var cHtml = $.parseHTML(html);
    var userDivs = $("img.img[src$=\".jpg\"]", cHtml).parent().parent().parent();

    var users = [];
    userDivs.each(function(k, v){
        try{
            var user = {
                uid: JSON.parse($(v).attr("data-bt")).id,
                name: $.trim($("a[href$=\"browse_search\"]", v).text()),
                photoUrl: $("img.img", v).attr("src")
            };

            users.push(user);
        } catch(e) { }
    });

    return users;
}

function getFirstPageUsers(searchPage){
    var d = $.Deferred();

    var commentedSnippets = searchPage.match(/<!--(.*?)-->/g);
    var users = [];

    for(var i in commentedSnippets)
        users = users.concat(getUsersFromHtml(commentedSnippets[i].replace("<!--", "").replace("-->", "")));

    // Does not work for nested objects. Fortunately, we're not dealing with any today.
    var candidateObjects = searchPage.match(/\{.*?\}/g);

    var queryObject = {};
    var cursor = null;

    for(var i in candidateObjects){
        try{
            var parsed = JSON.parse(candidateObjects[i]);
            if(parsed.cursor !== undefined)
                cursor = parsed.cursor;
            if(parsed.view == "list" || parsed.view == "grid")
                queryObject = parsed;
        } catch(e) { }
    }

    if(users.length == 0){
        d.reject([]);
        return d.promise();
    }

    queryObject.cursor = cursor;
    queryObject.ads_at_end = true;
    queryObject.view = "grid";

    var result = {
        users: users,
        queryObject: queryObject
    }

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
        var nextCursor = undefined;

        var data = parseJsonResponse(resultPage);
        var newUsers = getUsersFromHtml(data.payload);

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
        findUserObjects(data.jsmods.require);

        result.users = result.users.concat(newUsers);

        if(nextCursor == undefined || newUsers.length == 0){
            d.resolve(result.users);
        } else {
            result.queryObject.cursor = nextCursor;
            getNextPage(processPage);
        }
    }


    if(!result.queryObject.cursor)
        d.resolve(result.users);
    else
        getNextPage(processPage);

    return d.promise();
}

function getUsers(semantic, callback){

    getFirstPage(semantic, callback)
        .then(getFirstPageUsers, callback)
        .then(getRemainingUsers, callback)
        .then(callback, callback);

    // getFirstPage(semantic)
    //     .then(getFirstPageUsers)
    //     .then(getRemainingUsers)
    //     .then(callback);

}

// var testQuery = ["My friends who live in ",{"uid":"105429806157119","type":"page","text":"Brazil"}," and are younger than me"];
// getSuggestions(testQuery, function(suggestions){
//     var s = suggestions[0].semantic;
//     getUsers(s, function(d){ console.log(["ACABOU", d]); });
// });
