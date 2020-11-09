require('dotenv').config();
const fs = require('fs');
const { Discord, Client, Collection } = require('discord.js');

const client = new Client();
client.commands = new Collection();

const PREFIX = "!";
const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log('The bot has logged in.')
});

client.on('message', message => {
    const { author, content } = message;
    if(author.bot || !content.startsWith(PREFIX)) {
        return;
    }
    else {
        const username = `${author.username}#${author.discriminator}`;
        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        if (!client.commands.has(command)) {
            return;
        }
        try {
            client.commands.get(command).execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('there was an error trying to execute that command!');
        }
    }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);

