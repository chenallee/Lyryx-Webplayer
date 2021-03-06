/*

HANDLE INITIALIZE PLAYER

*/
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
// turn on spotify player
var songQueued;
var songToPlay;
let player;

window.onSpotifyWebPlaybackSDKReady = () => {

  const token = getHashParams().access_token;

  player = new Spotify.Player({
    name: 'Web Player - Lyrics App',
    getOAuthToken: cb => {
      cb(token);
    }
  });

  // Error handling
  player.addListener('initialization_error', ({ message }) => {
    console.log("initialization");
    console.error(message);
  });
  player.addListener('authentication_error', ({ message }) => {
    console.log("authentication");
    // if need to authenticate, then have login modal pop up
    Swal.fire({
      icon: "warning",
      title: "You need to log in.",
      showCloseButton: true,
      confirmButtonColor: "#e700f3",
      confirmButtonText: "Log In",
      background: "black"
    }).then((result) => {
      if (result.value) {
        spotifyLogin();
      }
    });
    console.error(message);
  });
  player.addListener('account_error', ({ message }) => {
    console.log("account");
    console.error(message);

    Swal.fire("Your account doesn't have access");
  });
  player.addListener('playback_error', ({ message }) => {
    console.log("playback");
    console.error(message);
  });

  // Playback status updates
  player.addListener('player_state_changed', state => {
    // console.log(state);

    setTimeout(function () {
      player.getCurrentState().then(function (playerState) {
        var songToPlay = playerState.track_window.current_track.uri;

        // console.log(songQueued);
        // console.log(songToPlay);

        if (songQueued != songToPlay) {
          console.log("SONG HAS CHANGED");
          //we want to see if track changes then run these
          playerDisplay(playerState);
          updateTrackMap(playerState);
          returnLyrics();

        }

        songQueued = songToPlay;

        //console.log(playerState);
      });
    }, 1000);
  });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    playerId = device_id;
    setWebPlayer(device_id, access_token);
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  player.connect();
};

// SET SPOTIFY WEB PLAYER TO BROWSER
function setWebPlayer(playerId, access_token) {
  //player.disconnect();
  $.ajax({
    url: "https://api.spotify.com/v1/me/player",
    method: "PUT",
    data: JSON.stringify({ "device_ids": [playerId] }),
    headers: {
      'Authorization': "Bearer " + access_token
    }
  })
    .then(function (response) {
      //console.log(response);
      setTimeout(function(){
        $selectDiv.classList.remove("hide");
      }, 3550)

    })
    .catch(function (err) {
      console.log(err);
      if (err.responseJSON.error.reason == "PREMIUM_REQUIRED") {
        Swal.fire({
          icon: "error",
          title: "Not supported.",
          text: "Log in with a Spotify Premium account.",
          confirmButtonColor: "#2a1842",
          background: "black"
        });
      }
    });
}