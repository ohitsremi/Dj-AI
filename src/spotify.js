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

        // TESTING GETTING SONGS
        // getSongsByGenre('pop');

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

async function getSongsByGenre(genre) {
    spotifyApi.getAvailableGenreSeeds();
    var songs = await spotifyApi.getRecommendations({limit: 5, seed_genres: [genre]})
    .then(function(data) {
        var tracks = data.body.tracks;
        var recs = [];
        Object.keys(tracks).forEach((key) => {
            var trackName = tracks[key]['name'];
            var isExplicit = tracks[key]['explicit']
            var trackURI = tracks[key]['uri'];
            console.log(trackName);
            recs.push(trackName);
        });
        console.log(genre);
        return recs;
    });
    return songs;
}

module.exports = {
    getSongsByGenre
}

app.listen(8888, () =>
  console.log(
    'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
  )
);