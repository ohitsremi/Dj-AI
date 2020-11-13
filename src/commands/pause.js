module.exports = {
	name: 'pause',
	description: 'pauses the current song',
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to pause music!');
        serverQueue.connection.dispatcher.pause();
	},
};