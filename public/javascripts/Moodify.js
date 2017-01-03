angular
.module('MoodifyApp', ['spotify'])
.config(function (SpotifyProvider) {
    SpotifyProvider.setClientId('1c3c2d057fad487fa8dbf62efbe4b4a6');
    SpotifyProvider.setRedirectUri('http://localhost:3000/Moodify.html');
    SpotifyProvider.setScope('playlist-modify-public playlist-modify-private playlist-read-private user-read-private user-read-birthdate user-read-email');

})
.controller('MainController', ['$scope', 'Spotify', '$sce', '$window', function ($scope, Spotify, $sce, $window) {

// -------------------------------- GLOBAL VARIABLES --------------------------------

    $scope.stations = [];
    var user_id;
    $scope.load_check = false;


// -------------------------------- LOADING SCREEN (PleaseWait) --------------------------------


    var start_up = function () {
        $window.loading_screen = $window.pleaseWait({
            logo: "",
            backgroundColor: '#dd944a',
            loadingHtml: "<div class=\"sk-cube-grid\"><div class=\"sk-cube sk-cube1\"></div><div class=\"sk-cube sk-cube2\"></div><div class=\"sk-cube sk-cube3\"></div><div class=\"sk-cube sk-cube4\"></div><div class=\"sk-cube sk-cube5\"></div><div class=\"sk-cube sk-cube6\"></div><div class=\"sk-cube sk-cube7\"></div><div class=\"sk-cube sk-cube8\"></div><div class=\"sk-cube sk-cube9\"></div></div>"
        });
    }


// -------------------------------- LOGIN AND LOAD STATIONS --------------------------------
	

    $scope.login = function () {
        start_up();
        Spotify.login().then(function (data) {
            Spotify.getCurrentUser().then(function (user_data) {
                console.log(user_data);
                user_id = user_data.id;
                if (user_data.images.length == 0) {
                    $scope.user_img = "images/empty-avatar.png";
                }
                else {
                    $scope.user_img = user_data.image[0].href;
                }
                $scope.user_info = user_id;
                Spotify.getUserPlaylists(user_id, { offset: 0,limit: 50 }).then(function (user_playlist_data) {
                    var total_tracks = user_playlist_data.total;
                    for (var i = 0; i < user_playlist_data.items.length; i++) {
                        var playlist_name = user_playlist_data.items[i].name;
                        var playlist_id = user_playlist_data.items[i].id;
                        var playlist_name_length = playlist_name.length;
                        if (playlist_name.slice(playlist_name_length-9, playlist_name_length) == "(Moodify)") {
                            $scope.stations.push({
                                name: playlist_name,
                                id: playlist_id
                            });
                        }
                    }
                    var total_gets = (total_tracks/50)+1;
                    for (var i = 1; i <= total_gets; i++) {
                        Spotify.getUserPlaylists(user_id, { offset: (i*50), limit: 50}).then(function (user_playlist2_data) {
                            for (var j = 0; j < user_playlist2_data.items.length; j++) {
                                var playlist_name = user_playlist_data.items[j].name;
                                var playlist_id = user_playlist2_data.items[j].id;
                                var playlist_name_length = playlist_name.length;
                                if (playlist_name.slice(playlist_name_length-9, playlist_name_length) == "(Moodify)") {
                                    $scope.stations.push({
                                        name: playlist_name,
                                        id: playlist_id
                                    });
                                }
                            }
                        });
                    }
                });
            });
        $window.loading_screen.finish();
        $scope.load_check = true;
        }, 
        function () {
            console.log('didn\'t log in');
        })
    };


// -------------------------------- FETCH STATION --------------------------------

    $scope.fetch_station = function (index) {
        var playlist_id = $scope.stations[index].id
        Spotify.getPlaylist(user_id, playlist_id)
        .then(function (playlist_data) {
            var playlist_id = playlist_data.id;
            var playlist_uri = "https://embed.spotify.com/?uri=" + playlist_data.uri + "&theme=white"
            var spotify_player = "<iframe src=\"" + playlist_uri + "\" width=\"300\" height=\"380\" frameborder=\"0\" allowtransparency=\"true\"></iframe>";
            $scope.spotify_player = $sce.trustAsHtml(spotify_player);
        });
    }


// -------------------------------- CREATE NEW STATION --------------------------------


    var checkDuplicateName = function (list, x) {
        for (var i = 0; i < list.length; i++) {
            var list_name = list[i].name.toUpperCase();
            var name = x.toUpperCase();
            if (list_name == name) {
                return true;
            }
        }
        return false;
    }

    $scope.fetch_new_station = function () {
        var artist = $scope.query;
        var station_name = artist + " Station (Moodify)";
        var check_station = false;
        if ($scope.query == undefined) {
            return alert('Please enter the name of an artist');
        }
        for(var i = 0; i < $scope.stations.length; i++)
        {
            if ($scope.stations[i].name == station_name) {
                check_station = true;
            }
        }
        if(check_station == false) {
            var id_list = [];
            var tracks = [];    
            var playlist_add_list = "";
            Spotify.createPlaylist(user_id, { name: station_name })
            .then(function(playlist_data) {
                var playlist_id = playlist_data.id;
                var playlist_uri = "https://embed.spotify.com/?uri=" + playlist_data.uri + "&theme=white"
                var spotify_player = "<iframe src=\"" + playlist_uri + "\" width=\"300\" height=\"380\" frameborder=\"0\" allowtransparency=\"true\"></iframe>";
                $scope.spotify_player = $sce.trustAsHtml(spotify_player);
                $scope.stations.push({
                    name: station_name,
                    id: playlist_id
                });
                Spotify.search(artist, 'artist')
                .then(function(search_data) {
                    Spotify.getArtistAlbums(search_data.artists.items[0].id)
                    .then(function(artist_data) {
                        var list_of_albums = "";
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
                            var id_number_check = 0;
                            for (var i = 0; i < album_data.albums.length; i++) {
                                //BAD HARDCODE
                                if (album_data.albums[i].artists[0].name.toUpperCase != artist.toUpperCase) {
                                    break;
                                }
                                for (var j = 0; j < album_data.albums[i].tracks.items.length; j++) {

                                    var id = album_data.albums[i].tracks.items[j].id;
                                    var name = album_data.albums[i].tracks.items[j].name;

                                    if (checkDuplicateName(id_list, name) == false) {
                                        list_of_ids += album_data.albums[i].tracks.items[j].id;
                                        id_list.push({
                                            id: id,
                                            name: name
                                        });
                                        if (j < album_data.albums[i].tracks.items.length-1) {
                                            list_of_ids += ",";
                                            id_number_check++;
                                        }
                                        if (id_number_check == 100) {
                                            break;
                                        }
                                    }
                                }
                                if (id_number_check == 100) {
                                    break;
                                }
                            }
                            Spotify.getTracksAudioFeatures(list_of_ids)
                            .then(function (audio_data) {
                                for (var i = 0; i < audio_data.audio_features.length; i++) {
                                    if (audio_data.audio_features[i] == null) {
                                        i++;
                                        //BAD HARDCODE
                                        if (audio_data.audio_features[i] == null) {
                                            i++
                                        }
                                    }
                                    if (i == audio_data.audio_features.length) {
                                        break;
                                    }
                                    var valence = audio_data.audio_features[i].valence;
                                    var id = audio_data.audio_features[i].id

                                    if (valence > .5) {
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
                                    return alert("You should find a happier band");
                                }
                                Spotify.addPlaylistTracks(user_id, playlist_id, playlist_add_list)
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
