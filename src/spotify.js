require('dotenv').config({ path: '../.env' })
var SpotifyWebApi = require('spotify-web-api-node');
const SPOTIFY_ID = process.env.SPOTIFY_ID;
const SPOTIFY_SECRET = process.env.SPOTIFY_SECRET;
const SPOTIFY_REDIRECT = process.env.SPOTIFY_REDIRECT;
const scopes = ['user-read-private', 'user-read-email']

const express = require('express');

const app = express();

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: SPOTIFY_ID,
    clientSecret: SPOTIFY_SECRET,
    redirectUri: SPOTIFY_REDIRECT
  });

app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', (req, res) => {
    console.log('hello')
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
        );
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

function getRandomSearch() {
    // A list of all characters that can be chosen.
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    
    // Gets a random character from the characters string.
    const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));
    let randomSearch = '';
  
    // Places the wildcard character at the beginning, or both beginning and end, randomly.
    switch (Math.round(Math.random())) {
      case 0:
        randomSearch = randomCharacter + '%';
        break;
      case 1:
        randomSearch = '%' + randomCharacter + '%';
        break;
    }
  
    return randomSearch;
  }

const randomOffset = Math.floor(Math.random() * 10000);

function request_valid_song(genre=None) {
    // # Cap the max number of requests until getting RICK ASTLEYED
    // for (var i = 0; i <= 50; i++){
        genre.replace(' ', '%20');
        var query = `q=${getRandomSearch()}%20genre:%22${genre}`;
        var types = ['track'];
        var offset = randomOffset;
        
        spotifyApi.search(query, types, {offset: offset}, (data) => {
            console.log(data);
            // console.log('I got ' + data.body.tracks.total + ' results!');
            // console.log(data.body.tracks.items);
            // var artist = song_info['artists'][0]['name']
            // var song = song_info['name']
            });
            // if (songs === undefined) {
            //     artist = "Rick Astley"
            //     song = "Never Gonna Give You Up"
            // }
        // }
}

// request_valid_song("country");


app.listen(8888, () =>
  console.log(
    'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
  )
);