const fs = require('fs')

module.exports = {
	name: 'help',
	description: 'List all available commands.',
	execute(message) {
        let str = '';
        const dir = `${__dirname.substring(0,__dirname.length -9)}/commands`;
		const commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
        
		for (const file of commandFiles) {
			const command = require(`${dir}/${file}`);
			str += `${command.name}: ${command.description} \n`;
		}
		message.channel.send(str);
	},
};