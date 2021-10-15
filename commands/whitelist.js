// importing needed features.
const { SlashCommandBuilder, channelMention } = require('@discordjs/builders');
const { MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');
const { createConnection } = require('mysql');
const mcapi = require("minecraft-lookup");

// command starts here
module.exports = {
// create slash command with basic info
	data: new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription('add or remove someone from a whitelist')
		.addStringOption(option =>
			option
				.setName('type')
				.setRequired(true)
				.setDescription('Add or remove from a whitelist.')
				.addChoice('add', 'add')
				.addChoice('remove', 'remove'),
		)
		.addStringOption(option =>
			option
				.setName('server')
				.setRequired(true)
				.setDescription('Choose server')
				.addChoice('OceanBlock', 'OceanBlock'),
		)
		.addStringOption(option =>
			option
				.setName('username')
				.setRequired(true)
				.setDescription('Enter Player\'s Name.'),
		),


	async execute(interaction) {
		const server = interaction.options.getString('server')
		const ign = interaction.options.getString('username');
		const addorremove = interaction.options.getString('type');
		const db = {
			"host": "localhost",
			"user": "user",
			"password": "",
			"database": "db_name"
		}

		const con = createConnection(db);

		const badpermsembed = new MessageEmbed()
		.setColor('#3b05ff')
		.setTitle('You don\'t have permission.')
		.setDescription('You do not have permission to run this command.')
		.setFooter('Powered by Blur', 'https://i.imgur.com/0kGUvfg.png'); 


		con.connect(err => {
			// Console log if there is an error
			if (err) return console.log(err);

			// No error found?
			console.log('MySQL has been connected!');
		});
		const member = interaction.member

		if (member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			mcapi.user(`${ign}`).then(data => {

				var uuid = data.id
				var type = 1 
	
				if (addorremove === 'add') {
					var type = 1
					var msg = 'added to the'
					var msg2 = 'Player Added'
				} 
				else if (addorremove === 'remove') {
					var type = 0
					var msg = 'removed from the'
					var msg2 = 'Player Removed'
				} else {
					console.log('something bad happened xd')
				}


				const embed = new MessageEmbed()
				.setColor('#3b05ff')
				.setTitle(`${msg2}`)
				.setDescription(`**${ign}** has been sucessfully been ${msg} **${server}** server whitelist.`)
				.setFooter('Powered by Blur', 'https://i.imgur.com/0kGUvfg.png'); 
	
				if (server === 'OceanBlock') {
					if (type === 1) {
						con.query(`INSERT INTO whitelist (uuid, name, whitelisted) VALUES ('${uuid}', '${ign}', '${type}')`), (err, row) => {
							// Return if there is an error
							if (err) return console.log(err);
						}
						interaction.reply({ ephemeral: false, embeds: [embed] })
					} else if (type === 0) {
						con.query(`DELETE FROM whitelist WHERE name = "${ign}"`), (err, row) => {
							// Return if there is an error
							if (err) return console.log(err);
							
						}
						interaction.reply({ ephemeral: false, embeds: [embed] })
					}
				}
				con.end(err => {
					// Console log if there is an error
					if (err) return console.log(err);
		
					// No error found?
					console.log('MySQL has been disconnected!');
				});
			}); 
		} else {
			interaction.reply({ ephemeral: true, embeds: [badpermsembed] })
		}

	},
}
