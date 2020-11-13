module.exports = {
	name: 'resume',
	description: 'resumes playing the current song',
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to resume music!');
        serverQueue.connection.dispatcher.resume();
	},
};