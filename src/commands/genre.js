const spotify = require('../spotify')
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');

const YT_KEY = process.env.YOUTUBE_KEY;

module.exports = {
	name: 'genre',
	description: 'have user pick a genre to randomly generate song!',
	async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.channel.send(
            "You need to be in a voice channel to play music!"
            );
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
            );
        }
        const connection = await voiceChannel.join();

        message.channel.send(`You picked ${args} as your genre`);
        spotify.getSongsByGenre(args).then(songs => {
            songs.forEach(song => {
                this.searchYT(song).then(info => {
                    const stream = ytdl(info[0], {filter: 'audioonly', dlChunkSize: 0 });
                    const dispatcher = connection.play(stream);
                    // dispatcher.on('speaking', speaking => {
                    //     if (!speaking) voiceChannel.leave();
                    // });
                    message.channel.send(`Playing ${info[1].replace('&#39;', '\'')} on the voice channel`)
                });
            });
        });
    },
    async searchYT(term) {
        term = term.replace(' ','%20');
        var url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${term}&type=video&key=${YT_KEY}`
        var info = await fetch(url)
        .then(res => res.json())
        .then((results) => {
            var firstResult = results.items[0]
            var id = firstResult.id.videoId
            var channel = firstResult.snippet.channelTitle
            var songName = firstResult.snippet.title
            var vidURL = `https://www.youtube.com/watch?v=${id}&ab_channel=${channel}`
            console.log(vidURL);
            return [vidURL, songName];
        })
        return info;
    },
};