require('dotenv').config({ path: '../.env' })
// var express = require('express'); // Express web server framework
// var request = require('request'); // "Request" library
// var cors = require('cors');
// var querystring = require('querystring');
// var cookieParser = require('cookie-parser');

var SpotifyWebApi = require('spotify-web-api-node');
const scopes = ['user-read-private', 'user-read-email']
var client_id = process.env.SPOTIFY_ID; // Your client id
var client_secret = process.env.SPOTIFY_SECRET; // Your secret
var redirect_uri = process.env.SPOTIFY_REDIRECT; // Your redirect uri

const express = require('express');
const { request } = require('express');

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

        // GENERATE RANDOM SONG SEARCH BASED ON COUNTRY
        request_valid_song(code, 'country');
        
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

function request_valid_song(code, genre) {
    console.log(code);
    spotifyApi
        .authorizationCodeGrant(code)
        .then(function(data) {
            console.log('data');
            console.log('Retrieved access token', data.body['access_token']);

            // Set the access token
            spotifyApi.setAccessToken(data.body['access_token']);

            // Use the access token to retrieve information about the user connected to it
            genre.replace(' ', '%20');
            var query = `q=${getRandomSearch()}%20genre:%22${genre}`;
            var types = ['track'];
            var offset = randomOffset;
            return spotifyApi.search(query, types, {offset: offset});
        })
        .then(function(data) {
            // console.log('I got ' + data.body.tracks.total + ' results!');
            // console.log(data.body.tracks.items);
            // var artist = song_info['artists'][0]['name']
            // var song = song_info['name']
            // if (songs === undefined) {
            //     artist = "Rick Astley"
            //     song = "Never Gonna Give You Up"
            // }
            // }
            // Print some information about the results
            console.log('I got ' + data.body.tracks.total + ' results!');

            // Go through the first page of results
            var firstPage = data.body.tracks.items;
            console.log('The tracks in the first page are (popularity in parentheses):');
            firstPage.forEach(function(track, index) {
            console.log(index + ': ' + track.name + ' (' + track.popularity + ')');
            });
        }).catch(function(err) {
            console.log('Something went wrong:', err.message);
        });

}


// request_valid_song('country');

app.listen(8888, () =>
  console.log(
    'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
  )
);