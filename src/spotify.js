require('dotenv').config({ path: '../.env' })

var SpotifyWebApi = require('spotify-web-api-node');
const scopes = ['user-read-private', 'user-read-email']
var client_id = process.env.SPOTIFY_ID; // Your client id
var client_secret = process.env.SPOTIFY_SECRET; // Your secret
var redirect_uri = process.env.SPOTIFY_REDIRECT; // Your redirect uri

const express = require('express');

const app = express();

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
  });

app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    spotifyApi
        .authorizationCodeGrant(code)
        .then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        console.log('access_token:', access_token);
        console.log('refresh_token:', refresh_token);

        console.log(
            `Sucessfully retreived access token. Expires in ${expires_in} s.`
        )

        res.send('Success! You can now close the window.');

        setInterval(async () => {
            const data = await spotifyApi.refreshAccessToken();
            const access_token = data.body['access_token'];

            console.log('The access token has been refreshed!');
            console.log('access_token:', access_token);
            spotifyApi.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
        })
        .catch(error => {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
        });
});
async function isValidGenre(genre) {
    const genres = await spotifyApi.getAvailableGenreSeeds().then(res => {
        return res.body.genres
    });
    return genres.some(g => g == genre);
}

async function getSongsByGenre(genre) {
    const valid = await isValidGenre(genre).then(valid => {return valid});
    if (valid) {
        var songs = await spotifyApi.getRecommendations({limit: 1, seed_genres: [genre]})
        .then(function(data) {
            var tracks = data.body.tracks;
            var recs = [];
            Object.keys(tracks).forEach((key) => {
                var trackName = tracks[key]['name'];
                var trackArtist = tracks[key]['artists'][0]['name']
                var trackId = tracks[key]['id'];
                recs.push({
                    genre: genre,
                    track: trackName,
                    search: `${trackName} by ${trackArtist}`,
                    id: trackId
                });
            });
            return recs;
        });
        return songs;
    } else {
        return [{genre: `Couldn't find genre`}];
    }
    
}

async function getSimilarSong(songId) {
    var songs = await spotifyApi.getRecommendations({limit: 1, seed_tracks: [songId]})
    .then(function(data) {
        var tracks = data.body.tracks;
        var recs = [];
        Object.keys(tracks).forEach((key) => {
            var trackName = tracks[key]['name'];
            var trackArtist = tracks[key]['artists'][0]['name']
            var trackId = tracks[key]['id'];
            recs.push({
                track: trackName,
                search: `${trackName} by ${trackArtist}`,
                id: trackId
            });
        });
        return recs;
    });
    return songs;
}

module.exports = {
    getSongsByGenre,
    getSimilarSong
}

app.listen(8888, () =>
  console.log(
    'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
  )
);