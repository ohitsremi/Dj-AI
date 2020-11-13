const spotify = require('../spotify');
const yt = require('../youtube');

module.exports = {
	name: 'similar',
	description: 'add similar song to current song to queue!',
	async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        const queue = message.client.queue;
        const serverQueue = message.client.queue.get(message.guild.id);
       
        const song = await spotify.getSimilarSong(serverQueue.songs[0]['id']).then(songs => {
            return songs[0];
        });
        console.log(song);

        console.log(`spotify suggests: ${song.track}`);

        // youtube url and name for song
        song['info'] = await yt.searchYT(song.search).then(info => {
            return info;
        });
        song['info'][1] = yt.unicodeToChar(song['info'][1]);
        song['info'][1] = song['info'][1].replace('&#39;', '\'').replace('&quot;', '\"');
        console.log(`youtube got this result: ${song['info'][1]}`);
        // if queue is empty
        if (!serverQueue) {
            const queueContruct = {
              textChannel: message.channel,
              voiceChannel: voiceChannel,
              connection: null,
              songs: [],
              volume: 5,
              playing: true
            };
    
            queue.set(message.guild.id, queueContruct);
            // add song to queue
            queueContruct.songs.push(song);
            // try to play the song
            try {
              const connection = await voiceChannel.join();
              queueContruct.connection = connection;
              yt.play(message, queueContruct.songs[0]);
            } catch (err) {
              console.log(err);
              queue.delete(message.guild.id);
              return message.channel.send(err);
            }
          } else {
            // otherwise add the song to the queuq
            serverQueue.songs.push(song);
            return message.channel.send(
              `${song['info'][1]} has been added to the queue!`
            );
        }
    },
};