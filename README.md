# Moodify

Application idea. 
Uses Spotify API to retrieve valence of tracks and then returns a randomized playlist of a specific mood.

(Possible play around with other audio features)

# NEW IDEA

Goal:

  A web "happy" radio app.
  Spotify authentication.
  List of your stations by artist.
  Station gets random song from artist or related artists.
    Plays only "happy" songs from each artist based on VALENCE.




Current State:

  No auth.
  No style.
  Gets each track in a single album by input artist.
  Gets track uri and valence.
  Almost creates a playlist to add songs to.
  
  Problems:
    Don't know how to push a var on array with valence included.
      Get valence from different HTTP request inside another HTTP request.
        May not need to have an array with names and all that. I can just use the URI and valence as it's set up now.
    To create a new playlist and add to it, it requires an authtoken directly from the user. 
