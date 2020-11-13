const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const YT_KEY = process.env.YOUTUBE_KEY;

module.exports = {
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
    play(message, song) {
        const queue = message.client.queue;
        const guild = message.guild;
        const serverQueue = queue.get(message.guild.id);
        // if there isn't a song leave channel
        if (!song['info']) {
          serverQueue.voiceChannel.leave();
          queue.delete(guild.id);
          return;
        }
        // get youtube stream of song
        const stream = ytdl(song['info'][0], {filter: 'audioonly', dlChunkSize: 0 });
        const dispatcher = serverQueue.connection
          .play(stream)
          .on("finish", () => {
            serverQueue.songs.shift();
            this.play(message, serverQueue.songs[0]);
          })
          .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(`Started playing: ${song['info'][1]}`);
        message.channel.send('What do you think of this song?').then(sentMessage =>{
            sentMessage.react('👍')
            .then(() => sentMessage.react('👎'))
            .catch(() => console.error('One of the emojis failed to react.'));
        });
        // const filter = (reaction, user) => {
        //     return ['👍', '👎'].includes(reaction.emoji.name);
        // };
        // const collector = message.createReactionCollector(filter, { time: 6000 });

        // collector.on('collect', (reaction, user) => {
        //     console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
        // });

        // collector.on('end', collected => {
        //     console.log(`Collected ${collected.size} items`);
        // });
        // message.awaitReactions(filter, { max: 100, time: 6000, errors: ['time'] })
        // .then(collected => {
        //     console.log(collected);
        //     console.log('hello')
        //     const reaction = collected.first();

        //     if (reaction.emoji.name === '👍') {
        //         message.reply('you reacted with a thumbs up.');
        //     } else {
        //         message.reply('you reacted with a thumbs down.');
        //     }
        // })
        // .catch(collected => {
        //     console.log(collected);
        //     message.reply('you reacted with neither a thumbs up, nor a thumbs down.');
        // }); 
    },
    unicodeToChar(text) {
        return text.replace(/\\u[\dA-F]{4}/gi, 
            (match) => {return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        });
     }
}