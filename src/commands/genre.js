// import spotifyApi from '../spotify';
const spotify = require('../spotify')
module.exports = {
	name: 'genre',
	description: 'have user pick a genre to randomly generate song!',
	execute(message, args) {
        message.channel.send(`You picked ${args} as your genre`);
        // const voiceChannel = message.member.voice.channel;
        // if (!voiceChannel) {
        //     return message.channel.send(
        //     "You need to be in a voice channel to play music!"
        //     );
        // }
        // const permissions = voiceChannel.permissionsFor(message.client.user);
        // if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        //     return message.channel.send(
        //     "I need the permissions to join and speak in your voice channel!"
        //     );
        // }
        spotify.getSongsByGenre(args).then(songs => {
            message.channel.send(songs);
        });
    },
};