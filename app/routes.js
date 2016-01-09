// Dependencies
var mongoose        = require('mongoose');
var User            = require('./model.js');
var IMPACT_FACTOR = {
"1" : 3,
"2" : 1.5,
"3" : -2,
"4" : -5,
"5" : -25
};
//var Feature            = require('./model1.js');


// Opens App Routes
module.exports = function(app) {

    // GET Routes
    // --------------------------------------------------------
    // Retrieve records for all users in the db
    app.get('/users', function(req, res){

        // Uses Mongoose schema to run the search (empty conditions)
        var query = User.find({});
        query.exec(function(err, users){
            if(err) {
                res.send(err);
            } else {
                // If no errors are found, it responds with a JSON of all users
                res.json(users);
            }
        });
    });
	
	app.get('/specific', function(req, res){
	User.aggregate(
		{ "$group" : { "_id" : {coordinates : "$featureCollections.geometry.coordinates", rating : "$featureCollections.properties.rating"},total: { $sum: 1 } }},
		{ "$group" : { "_id" : "$_id.coordinates", children:{$addToSet :{rating : "$_id.rating",total: "$total" }}}}
		, function (err, users) {
			if(err) {
				console.log(err);
                res.send(err);
            } else {
				var featureCollection = { type : "FeatureCollection"};
				var features = [];
				users.forEach(function(item, i){
					var feature = {type : 'Feature',
								geometry : {type : 'Point',
											coordinates : item._id[0]},
								properties :{}}
					var score = 0;
					var ratingWithHighestCount = "";
					var maxRatingCount = 0;
					var ratingCount = {};
					ratingCount["1"] = 0;
					ratingCount["2"] = 0;
					ratingCount["3"] = 0;
					ratingCount["4"] = 0;
					ratingCount["5"] = 0;
					item.children.forEach(function(child, j){
						score += IMPACT_FACTOR[child.rating[0]]* child.total;
						ratingCount[child.rating[0]] = child.total;
						if(maxRatingCount < child.total){
							maxRatingCount = child.total;
							ratingWithHighestCount = child.rating[0];
						}
					});
					console.log('ratings by count start ----------------------------------------------------------------');
					console.log(ratingCount);
					console.log('ratings by count end ----------------------------------------------------------------');
					if(ratingCount["5"] > (ratingCount["1"] + ratingCount["2"]) ){
						feature.properties.rating = "5";
					}else{
						if(score > 0){
							feature.properties.rating = ratingWithHighestCount;
							console.log('Rating With highest count : ' + ratingWithHighestCount);
						}else{
						var sadScore = 0;
							item.children.forEach(function(child, j){
							if(child.rating[0] === "3" ||child.rating[0] === "4"){
								sadScore += -(IMPACT_FACTOR[child.rating[0]])* child.total;
								}
							if(child.rating[0] === "5" ){
								sadScore += IMPACT_FACTOR[child.rating[0]]* child.total;
								}
							});
							console.log('Sad score : ' + sadScore)
							if(sadScore > 0){
								feature.properties.rating = ratingCount["3"] > ratingCount["4"] ? ratingCount["3"] :ratingCount["4"]; 
							}else{
								feature.properties.rating = "5";
							}
						}
					}
					features.push(feature);//
				});
			}
			featureCollection.features = features;// If no errors are found, it responds with a JSON of all users
			console.log(featureCollection);
                res.json(featureCollection);
            }); // [ { maxBalance: 98000 } ]
});
        // Uses Mongoose schema to run the search (empty conditions)
   

    // POST Routes
    // --------------------------------------------------------
    // Provides method for saving new users in the db
    app.post('/users', function(req, res){

        // Creates a new User based on the Mongoose schema and the post bo.dy
        var newuser = new User(req.body);


        // New User is saved in the db.
        newuser.save(function(err){
            if(err){
			console.log(err);
                res.send(err);
            }else
                // If no errors are found, it responds with a JSON of the new user
                console.log(newuser);
				res.json(req.body);
        });
    });

    // Retrieves JSON records for all users who meet a certain set of query conditions
    app.post('/query/', function(req, res){

        // Grab all of the query parameters from the body.
        var lat             = req.body.latitude;
        var long            = req.body.longitude;
        var distance        = req.body.distance;
        var male            = req.body.male;
        var female          = req.body.female;
        var other           = req.body.other;
        var minAge          = req.body.minAge;
        var maxAge          = req.body.maxAge;
        var favLang         = req.body.favlang;
        var reqVerified     = req.body.reqVerified;

        // Opens a generic Mongoose Query. Depending on the post body we will...
        var query = User.find({});

        // ...include filter by Max Distance (converting miles to meters)
        if(distance){

            // Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
            query = query.where('location').near({ center: {type: 'Point', coordinates: [long, lat]},

                // Converting meters to miles. Specifying spherical geometry (for globe)
                maxDistance: distance * 1609.34, spherical: true});

        }

        // ...include filter by Gender (all options)
        if(male || female || other){
            query.or([{ 'gender': male }, { 'gender': female }, {'gender': other}]);
        }

        // ...include filter by Min Age
        if(minAge){
            query = query.where('age').gte(minAge);
        }

        // ...include filter by Max Age
        if(maxAge){
            query = query.where('age').lte(maxAge);
        }

        // ...include filter by Favorite Language
        if(favLang){
            query = query.where('favlang').equals(favLang);
        }

        // ...include filter for HTML5 Verified Locations
        if(reqVerified){
            query = query.where('htmlverified').equals("Yep (Thanks for giving us real data!)");
        }

        // Execute Query and Return the Query Results
        query.exec(function(err, users){
            if(err)
                res.send(err);
            else
                // If no errors, respond with a JSON of all users that meet the criteria
                res.json(users);
        });
    });

    // DELETE Routes (Dev Only)
    // --------------------------------------------------------
    // Delete a User off the Map based on objID
    app.delete('/users/:objID', function(req, res){
        var objID = req.params.objID;
        var update = req.body;

        User.findByIdAndRemove(objID, update, function(err, user){
            if(err)
                res.send(err);
            else
                res.json(req.body);
        });
    });
};
