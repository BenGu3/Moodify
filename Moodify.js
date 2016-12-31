angular
.module('MoodifyApp', ['spotify', 'LocalStorageModule'])
.config(function (SpotifyProvider) {
    SpotifyProvider.setClientId('1c3c2d057fad487fa8dbf62efbe4b4a6');
    SpotifyProvider.setRedirectUri('http://ec2-52-10-64-92.us-west-2.compute.amazonaws.com/Moodify/callback.html');
    SpotifyProvider.setScope('playlist-read-private');
})
.controller('MainController', ['$scope', 'Spotify', '$sce', 'localStorageService', function ($scope, Spotify, $sce, LocalStorageService) {

    $scope.login = function () {
      Spotify.login().then(function (data) {
        console.log(data);
        alert("You are now logged in");
      }, function () {
        console.log('didn\'t log in');
      })
    };

    $scope.grab_token = function(localStorageService) {
    	var token = localStorageService.get('spotify_token');
    	$scope.token_place = token;
    };


    $scope.stations = [];

    $scope.fetch_new_station = function () {

        var artist = $scope.query;
        var station_name = artist + " Station (Moodify)";
        var check_station = false;

        if (artist == "") {
            return;
        }

        for(var i = 0; i < $scope.stations.length; i++)
        {
            if ($scope.stations[i].name == station_name) {
                check_station = true;
            }
        }

        if(check_station == false) {

            $scope.stations.push({
                name: station_name
            });

            var id_list = [];

            var tracks = [];    
            var playlist_add_list = "";

            Spotify.createPlaylist('bengu3', { name: station_name })
            .then(function(playlist_data) {

                var playlist_id = playlist_data.id;
                var playlist_uri = "https://embed.spotify.com/?uri=" + playlist_data.uri + "&theme=white"
                var spotify_player = "<iframe src=\"" + playlist_uri + "\" width=\"300\" height=\"380\" frameborder=\"0\" allowtransparency=\"true\"></iframe>";
                $scope.spotify_player = $sce.trustAsHtml(spotify_player);

                Spotify.search(artist, 'artist')
                .then(function(search_data) {

                    Spotify.getArtistAlbums(search_data.artists.items[0].id)
                    .then(function(artist_data) {

                        var list_of_albums = "";

                        // Number of Albums Size Checks
                        var number_of_albums = artist_data.items.length;
                        var static_size = 8;

                        if (number_of_albums < static_size) {
                            var size_used = number_of_albums;
                        }
                        else {
                            var size_used = static_size;
                        }

                        for (var i = 0; i < size_used; i++) {
                            list_of_albums += artist_data.items[i].id;
                            if (i < size_used-1) {
                                list_of_albums += ",";
                            }
                        }

                        Spotify.getAlbums(list_of_albums)
                        .then(function(album_data) {

                            var list_of_ids = "";
                            var id_number_check;

                            for (var i = 0; i < album_data.albums.length; i++) {
                                for (var j = 0; j < album_data.albums[i].tracks.items.length; j++) {
                                    
                                    list_of_ids += album_data.albums[i].tracks.items[j].id;
                                    
                                    id_list.push({
                                        id: album_data.albums[i].tracks.items[j].id,
                                        name: album_data.albums[i].tracks.items[j].name
                                    });

                                    if (j < album_data.albums[i].tracks.items.length-1) {
                                        list_of_ids += ",";
                                    }

                                    id_number_check++;
                                    if (id_number_check == 99) {
                                        break;
                                    }
                                }
                            }

                            Spotify.getTracksAudioFeatures(list_of_ids)
                            .then(function (audio_data) {

                                for (var i = 0; i < audio_data.audio_features.length; i++) {
                                    if (audio_data.audio_features[i] == null) {
                                        i++;
                                    }
                                    if (i == audio_data.audio_features.length) {
                                        break;
                                    }
                                    var valence = audio_data.audio_features[i].valence;
                                    var id = audio_data.audio_features[i].id

                                    if (valence > .65) {
                                        tracks.push({
                                            id: id,
                                            valence: valence
                                        });
                                    }
                                }

                                angular.forEach(tracks, function(value, key, obj) {
                                    playlist_add_list += value.id;

                                    if (key < obj.length-1) {
                                        playlist_add_list += ",";
                                    }
                                });

                                if (tracks.length == 0) {
                                    alert("You should find a happier band");
                                }

                                Spotify.addPlaylistTracks('bengu3', playlist_id, playlist_add_list)
                                .then(function (data) {
                                    console.log('tracks added to playlist');
                                });
                            });
                        });
                    });
                });
            });
        }

        $scope.query = "";
    }
}]);