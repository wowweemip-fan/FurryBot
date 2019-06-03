const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

module.exports = {
	triggers: [
		"pause"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Pause whatever is playing",
	usage: "",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let c;
		if(!message.member.voice.channel) return message.channel.createMessage("You must be in a voice channel to use this.");
		if(message.member.voice.channel.members.filter(m => m.id!==this.bot.user.id).size !== 1 && !config.developers.includes(message.author.id)) {
			if(!message.gConfig.djRole)  {
				if(!message.member.permissions.has("manageServer")) return message.channel.createMessage(":x: Missing permissions or DJ role.");
			} else {
				try {
					if(!message.member.roles.has(message.gConfig.djRole) && !message.member.permissions.has("manageServer")) return message.channel.createMessage(":x: Missing permissions or DJ role.");
				}catch(error){
					message.channel.createMessage("DJ role is configured incorrectly.");
					if(!message.member.permissions.has("manageServer")) {
						message.channel.createMessage(":x: Missing permissions.");
					}
				}
			}
		}
        
		c = this.voiceConnections.filter(g => g.channel.guild.id===message.channel.guild.id);
		if(c.size === 0) return message.channel.createMessage("Please play something before using this!");
		if(!c.first().speaking.has("SPEAKING")) return message.channel.createMessage("Nothing is playing.");
		if(c.first().dispatcher.paused) return message.channel.createMessage("Player is already paused.");
		c.first().dispatcher.pause();
		return message.channel.createMessage(":pause_button: **Paused**");
	})
};