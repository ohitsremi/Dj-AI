module.exports = {
	name: 'stop',
	description: 'clears all songs in the queue and leaves the voice channel',
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to clear the queue and stop playing!');
		serverQueue.songs = [];
        serverQueue.voiceChannel.leave();
	},
};