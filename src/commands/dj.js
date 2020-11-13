module.exports = {
	name: 'dj',
	description: 'start using the bot',
	execute(message, args) {
        message.channel.send(`First, pick a genre using the command "!genre indie pop"`);
	},
};