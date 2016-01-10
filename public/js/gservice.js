// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($rootScope, $http){

        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};
        googleMapService.clickLat  = 0;
        googleMapService.clickLong = 0;
	
        // Variables we'll use to help us pan to the right spot
        var lastMarker;
        var currentSelectedMarker;

        // User Selected Location
        var selectedLat = 39.50;
        var selectedLong = -98.35;
        // Create a new map and place in the index.html page

        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Takes three parameters (lat, long, and filtering results)
        googleMapService.refresh = function(latitude, longitude, filteredResults){

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;

            // If filtered results are provided in the refresh() call...
            if (filteredResults){
                // Then, initialize the map -- noting that a filter was used (to mark icons yellow)
                initialize(latitude, longitude, filteredResults,true);

            }

            // If no filter is provided in the refresh() call...
            else {

                // Perform an AJAX call to get all of the records in the db.
                $http.get('/userRatings').success(function(response){
                    // Then initialize the map -- noting that no filter was used.
                    initialize(latitude, longitude,response, false);
                }).error(function(){});
            }
        };

        // Private Inner Functions
        // --------------------------------------------------------------

        // Convert a JSON of users into map points
        var loadGeoJsontoMap = function(map,response,latitude, longitude){
			map.data.addGeoJson(response);
			map.data.setStyle(function(feature) {
			var rating = feature.getProperty('rating');
			  if(rating=== "1"){
				return {
			icon: 'https://df44a25e6aacb3ed7dde05be7a450c2c91773ba0.googledrive.com/host/0B4VqM7PW3xn8LVBXWGhwSXZQeW8/tinyGoodStar.png',
				};}
			  else if(rating === "2"){
				return {
			icon: 'https://df44a25e6aacb3ed7dde05be7a450c2c91773ba0.googledrive.com/host/0B4VqM7PW3xn8LVBXWGhwSXZQeW8/tinyOkStar.png',
				};
			  }else if(rating === "3"){
				return {
			icon: 'https://df44a25e6aacb3ed7dde05be7a450c2c91773ba0.googledrive.com/host/0B4VqM7PW3xn8LVBXWGhwSXZQeW8/tinyNotSoGoodStar.png',
				};
			  }else if(rating ==="4"){
				return {
			icon: 'https://df44a25e6aacb3ed7dde05be7a450c2c91773ba0.googledrive.com/host/0B4VqM7PW3xn8LVBXWGhwSXZQeW8/Startinysad.png',
				};
			  }else if(rating === "5"){
				return {
			icon: 'https://df44a25e6aacb3ed7dde05be7a450c2c91773ba0.googledrive.com/host/0B4VqM7PW3xn8LVBXWGhwSXZQeW8/Startinydead.png',
				};
			  }else {
			  return {icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'};
			  }
			});
        };
		
        // Initializes the map
        var initialize = function(latitude, longitude,data, filter) {    

            // If a filter was used set the icons yellow, otherwise blue
            if(filter){
                icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
            }
            else{
                icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
            }
			if(!map){
			var map = new google.maps.Map(document.getElementById('map'), {
				 zoom: 15
			});	
			}
			
			loadGeoJsontoMap(map,data,latitude,longitude);
            // Function for moving to a selected location
            map.panTo(new google.maps.LatLng(latitude, longitude));

            // Clicking on the Map moves the bouncing red marker
            google.maps.event.addListener(map, 'click', function(e){
                var marker = new google.maps.Marker({
                    position: e.latLng,
                    animation: google.maps.Animation.BOUNCE,
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                });

                // When a new spot is selected, delete the old red bouncing marker
                if(lastMarker){
                    lastMarker.setMap(null);
                }

                // Create a new red bouncing marker and move to it
                lastMarker = marker;
                map.panTo(marker.position);

                // Update Broadcasted Variable (lets the panels know to change their lat, long values)
                googleMapService.clickLat = marker.getPosition().lat();
                googleMapService.clickLong = marker.getPosition().lng();
                $rootScope.$broadcast("clicked");
            });
        };

        // Refresh the page upon window load. Use the initial latitude and longitude
        google.maps.event.addDomListener(window, 'load',
            googleMapService.refresh(selectedLat, selectedLong));

        return googleMapService;
    });
	
	

