require('dotenv').config();

const { Client } = require('discord.js');
const client = new Client();
const PREFIX = "$";

client.on('ready', () => {
    console.log('The bot has logged in.')
});

client.on('message', message => {
    if(message.author.bot) return;
    if(message.content === '!dj'){
        message.channel.send('Song').then(sentMessage =>{
            sentMessage.react('👍')
            sentMessage.react('👎');
        });
    }
});

//Commands
client.on('message', message =>{
    if(message.author.bot) return;
    if(message.content.startsWith(PREFIX)){
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/);
        console.log(CMD_NAME);
        console.log(args);
    }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);

