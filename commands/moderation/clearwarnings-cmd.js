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
		"clearwarnings",
		"warnclear"
	],
	userPermissions: [
		"kickMembers" // 2
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Clear warnings for a user",
	usage: "<@member/id>",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let user, w, embed;
		// get member from message
		user = await message.getMemberFromArgs();
    
		if(!user) return message.errorEmbed("INVALID_USER");
		w = await mdb.collection("users").findOneAndUpdate({id: user.id},{$pull: {warnings: {gid: message.channel.guild.id}}});
    
		if(!w.ok) {
			embed = {
				title: "Failure",
				description: `Either you provided an invalid user, or there was an internal error. Make sure the user **${user.username}#${user.discriminator}** has at least __*one*__ warning before using this.`,
				color: 15601937
			};
			Object.assign(embed,message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		} else {
			embed = {
				title: "Success",
				description: `Cleared warnings for user **${user.username}#${user.discriminator}**.`,
				color: 41728
			};
			Object.assign(embed,message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		}
	})
};