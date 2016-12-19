var app = angular.module('myApp', [])
app.controller('MoodifyController', function($scope, $http) { 


    $scope.searchresults = [];
    $scope.stations = [];


    $scope.fetch = function () {

        var stationname = $scope.query;
        stationname += " Station";

        var checkstation = false;

        for(var i = 0; i < $scope.stations.length; i++)
        {
            if ($scope.stations[i].name == stationname) {
                checkstation = true;
            }
        }

        if(checkstation == false) {

            $scope.stations.push({
                name: stationname
            });
        

            $http.get("https://api.spotify.com/v1/search?q=" + $scope.query + "&type=album")
            .then(function(response)
            { 

                var albumurl = response.data.albums.items[0].href;
                console.log(albumurl);


                $http.get(albumurl)
                .then(function(albumresponse)
                { 

                    for (var i = 0; i < albumresponse.data.tracks.items.length; i++) {

                        var trackname = albumresponse.data.tracks.items[i].name;
                        var previewurl = albumresponse.data.tracks.items[i].preview_url;
                        var albumimg = albumresponse.data.images[1].url;
                        console.log(trackname);
                        console.log(albumimg);
                        console.log(previewurl);


                        $scope.searchresults.push({ 
                            track: trackname,
                            preview: previewurl,
                            art: albumimg
                        });


                        var featuresurl = 'https://api.spotify.com/v1/audio-features/' + albumresponse.data.tracks.items[i].id;
                        console.log(featuresurl);

                        $http.get(featuresurl, {
                            headers: {
                                "Authorization": 'Bearer BQAYas0yik9rmTXooT5I2QulzLF2BUIgw3v5lyr3kuSq6-X09kEDw-DLLrt5QX0mJs-PAaO0fzNDGDiqOgdPXDVfLEFP-JJohMA3Iv73hLyn5PywftlMcUcKLKOiO-keSKdmItYzfAjBtK0NM8u-nYBMlGtTlnNujcjcWKf_1gRkyvh2HG0dKCUQ4YGCrBN5iA'
                            }
                          })
                        .then(function(res){
                            console.log(res)
                            var valence = res.data.valence;

                            console.log(valence);                            
                          });
                    }
                });
            });
        }

        $scope.query = "";

    }
});


// NOTES



// Auth Token for Spotify API
// http://stackoverflow.com/questions/32343391/angular-http-get-request-with-authorization-token-header    



