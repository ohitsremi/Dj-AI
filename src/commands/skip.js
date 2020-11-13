const yt = require('../youtube');
module.exports = {
	name: 'skip',
	description: 'Skip a song!',
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to skip the song!');
        if (!serverQueue) return message.channel.send('There are no songs left in the queue.');
        // 
        serverQueue.songs.shift();
        yt.play(message, serverQueue.songs[0]);
    },
};