function l(data){ console.log(data); }

var testQuery = "my friends who live in braz";

var searchBaseUrl = "https://www.facebook.com/search/"
var autocompleteBaseUrl = "https://www.facebook.com/ajax/typeahead/search/facebar/query/";
var resultsPageBaseUrl = "https://www.facebook.com/ajax/pagelet/generic.php/BrowseScrollingSetPagelet";

// Probably not the best way, but it works.
var userId = $(".headerTinymanPhoto").attr("id").match(/\d+/)[0];

l("Starting test for user " + userId);

// Strips trailing for(;;) from response.
function parseJsonResponse(response){
	return JSON.parse(response.substring(9));
}

// Gets an entity by UID.
function getEntity(entities, uid){
	for(var i in entities)
		if(entities[i].uid == uid) return entities[i];
	return false;
}

// Builds a search URL from a semantic query.
function makeUrlFromSemantic(semantic){
	// We should probably build a tree and traverse it in postorder. But screw that, this works too.
	return semantic.match(/[a-zA-Z0-9]+/g).reverse().join("/")
}

// Builds an object with the magical incantations.
function buildAutocompleteQuery(query){
	var baseQuery = {
		value: null,
		context: "facebar",
		grammar_version: "7ca1b059f1a46f3d3cb62914007c6e86432a41e1",
		viewer: userId,
		rsp: "search",
		sid: 0.14813221991062164,
		qid: 33,
		see_more: false,
		max_results: 8, // Customizable!
		num_entities: 0,
		__user: userId,
		__a: 1,
		__dyn: "7n8ahxoNpEeE",
		__req: "1l"
	};

	baseQuery.value = JSON.stringify(query);
	return baseQuery;
}

// Get autocomplete suggestions for the test query.
$.get(autocompleteBaseUrl, buildAutocompleteQuery([testQuery]), null, "html").then(function(data){
	l("First autocomplete OK");

	var results = parseJsonResponse(data);

	var p = results.payload;
	var test = p.results[0];
	var display = test.parse.display;

	var newQuery = [];
	for(var i in display){
		if(typeof(display[i]) == "string"){
			newQuery.push(display[i]);
		} else if(typeof(display[i]) == "object") {
			var entity = display[i];
			entity.text = getEntity(p.entities, entity.uid).text;
			newQuery.push(entity);
		}
	}

	return $.get(autocompleteBaseUrl, buildAutocompleteQuery(newQuery), null, "html");

// Get the semantic query for the first autocomplete suggestion.
}).then(function(data){
	l("Second autocomplete OK");

	var results = parseJsonResponse(data);
	l(results);

	var actualQuery = results.payload.results[0].semantic;
	var url = makeUrlFromSemantic(actualQuery);

	return $.get(searchBaseUrl + url, null, "html");

// Get the first page of results for that query.
}).then(function(searchPage){
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

// Get the remaining pages until all users are found.
}).then(function(result){
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

		l(newUsers);

		if(nextCursor == undefined || newUsers.length == 0){
			d.resolve(result.users);
		} else {
			result.users = result.users.concat(newUsers);
			result.queryObject.cursor = nextCursor;
			getNextPage(processPage);
		}
	}

	getNextPage(processPage);

	return d.promise();

// Present the results.
}).then(function(userList){
	l("All done! Here's the user list (" + userList.length + " users).");
	l(userList);
}); 