var app = angular.module('myApp', [])
app.controller('MoodifyController', function($scope, $http, $sce) { 


    $scope.searchresults = [];
    $scope.stations = [];
    var tracks = [];
    var token = 'BQAUAeEXtw6M73kwkjy9nkSBvWbecy1K_2SUPCrWN7gGi9RRzeHlXeSutXcmlev5q4XPhXLDm1vKZ3UtEnY0HwAXW35znwny_D6uwOQKIuSDxxbkR4sF_nZTk-sOPgD-ncyN_2rgCyw0TEo5Gb4cy5lSnF6MSSMjRizntbXwQLQCFwbiU6MYIV_mcRPSn474M5CamYipG4ej94499H1swSDOxuf2_aqT9n8vjAyrmhnuJA'   
    var playlist_id;



    $scope.fetch = function () {

        var artist = $scope.query;
        var stationname = artist + " Station";

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


// Create New Playlist
        
            $http({
                url: 'https://api.spotify.com/v1/users/bengu3/playlists',
                method: "POST",
                headers: {
                    "Accept": 'application/json',
                    "Authorization": 'Bearer ' + token,
                    "Content-Type": 'application/json'  
                },
                data: { "name" : "NewPlaylist", "public" : false }
            })
            .then(function(response) {
                console.log(response.data.uri);

                playlist_id = response.data.id;
                console.log(response.data.id);

                var playlist_uri = "https://embed.spotify.com/?uri=" + response.data.uri + "&theme=white"
                var spotify_player = "<iframe src=\"" + playlist_uri + "\" width=\"300\" height=\"380\" frameborder=\"0\" allowtransparency=\"true\"></iframe>";
                $scope.spotify_player = $sce.trustAsHtml(spotify_player);


// Get music
                $http.get("https://api.spotify.com/v1/search?q=" + artist + "&type=album")
                .then(function(response)
                { 

                    var albumurl = response.data.albums.items[0].href;
                    console.log(albumurl);


                    $http.get(albumurl)
                    .then(function(albumresponse)
                    { 

                        for (var i = 0; i < albumresponse.data.tracks.items.length; i++) {

                            var featuresurl = 'https://api.spotify.com/v1/audio-features/' + albumresponse.data.tracks.items[i].id;

                            $http.get(featuresurl, {
                                headers: {
                                    "Authorization": 'Bearer ' + token
                                }
                              })
                            .then(function(res){

                                var valence = res.data.valence;
                                var tracklink = res.data.uri;

                                if(valence > .65)
                                {
                                    tracks.push({
                                        uri: tracklink,
                                        valence: valence
                                    });

                                    console.log("Added");
                                }


                              })

                             .then(function() {

                                var playlist_add_url = 'https://api.spotify.com/v1/users/bengu3/playlists/' + playlist_id + '/tracks?uris=';

                                angular.forEach(tracks, function(value, key, obj) {

                                    playlist_add_url += encodeURIComponent(value.uri);

                                    if (key < obj.length-1) {
                                        playlist_add_url += ",";
                                    }
                                });

                                $http({
                                    url: playlist_add_url,
                                    method: "POST",
                                    headers: {
                                        "Accept": 'application/json',
                                        "Authorization": 'Bearer ' + token,
                                    }
                                })
                                .then(function(response) {
                                    // console.log(response);
                                }, 
                                function(response) { 
                                        console.log("FAILED TO ADD TO PLAYLIST");
                                });
                            });
                        }
                    });
                })
            }, 
            function(response) { 
                    console.log("FAILED TO CREATE PLAYLIST");
            });
        }

        $scope.query = "";

    }
});




