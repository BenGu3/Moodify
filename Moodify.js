var app = angular.module('myApp', [])
app.controller('MoodifyController', function($scope, $http) { 


    $scope.searchresults = [];
    $scope.stations = [];
    $scope.tracks = [];


    $scope.fetch = function () {

        var stationname = $scope.query;
        stationname += " Station";

        var checkstation = false;

        for(var i = 0; i < $scope.stations.length; i++)
        {
            if ($scope.stations[i].name == stationname) {
                checkstation = true;a
            }
        }

        if(checkstation == false) {

            $scope.stations.push({
                name: stationname
            });


// Create New Playlist
            $http.post("https://api.spotify.com/v1/users/bengu3/playlists",
            {

                headers: {
                    "Accept": 'application/json',
                    "Authorization": 'Bearer BQAuaE-s2_EBCB6gycxj-DN4QqRELQhUs42XfoyACn1pJZNrK1jKnYZ0nlF9koxUqyurMcyqULVPW1QU_JHBwXRZs_z_WEZ_XAWYkHeZjIKHFFMSsgxvarKW1LENK2a5L1Kf1u4XhqG4kiadv67X1BzIJ5Hja0oLeyNzCJifbCDUHeI0UfyiyzJx8nUTfjPIT80_7wjc51Lp-U34xP1ocMzGU1IHyQQOBsuPgWznQDhC-A'
                    // "Content-Type": 'application/json'
                },

                data: {
                    "name": "NewPlaylist",
                    "public": false
                }

            })
            .then(function(result){
                console.log(result);
            });
        




// Get music
            $http.get("https://api.spotify.com/v1/search?q=" + $scope.query + "&type=album")
            .then(function(response)
            { 

                var albumurl = response.data.albums.items[0].href;
                //console.log(albumurl);


                $http.get(albumurl)
                .then(function(albumresponse)
                { 

                    for (var i = 0; i < albumresponse.data.tracks.items.length; i++) {


                        // ****ORIGINAL TEST CODE****
                        // Got track name, album image, and 30 seconds preview ad displayed those.
                        // ---------------------------------------------------------------
                        //
                        // var trackname = albumresponse.data.tracks.items[i].name;
                        // var previewurl = albumresponse.data.tracks.items[i].preview_url;
                        // var albumimg = albumresponse.data.images[1].url;
                        // console.log(trackname);
                        // console.log(albumimg);
                        // console.log(previewurl);
                        //
                        //
                        // $scope.searchresults.push({ 
                        //     track: trackname,
                        //     preview: previewurl,
                        //     art: albumimg
                        // });


                        var featuresurl = 'https://api.spotify.com/v1/audio-features/' + albumresponse.data.tracks.items[i].id;
                        //console.log(featuresurl);

                        $http.get(featuresurl, {
                            headers: {
                                "Authorization": 'Bearer BQA0YQRuCu5sQtvtuALAmrNJ4pVwXTaHP2rrjtowR5baQ_nKiktC2-KEFjXxp0Bi0_YvYoiF75Eh4jByS8ln_mm4z8WFji817TgO5oGfIUaLWnf2TOFthPtWy2Va99nFsambeQ1X3asgzQBUzM20TWA2WpSJ4eMGL68mNzZTBtsl5SHDFBpM6eGV7AIVV7SP1ojgUL1_YrnKELAnFITllKDIZ3baSrr-yYIOxMSCJr5vag'
                            }
                          })
                        .then(function(res){
                            //console.log(res)
                            var valence = res.data.valence;
                            var tracklink = res.data.uri;

                            // console.log(tracklink);
                            // console.log(valence);

                            if(valence > .65)
                            {
                                $scope.tracks.push({
                                    uri: tracklink,
                                    valence: valence
                                });

                                console.log("Added");
                            }


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



