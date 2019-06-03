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
		"armor"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 5e3,
	description: "Nothing can penetrate my armor.",
	usage: "<text>",
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
		let text, req, j;
		text = message.unparsedArgs.join(" ");
		if(text.length === 0) text = "Provide some text";
		req = await this.memeRequest("/armor",[],text);
		if(req.statusCode !== 200) {
			try {
				j = {status:req.statusCode,message:JSON.stringify(req.body)};
			}catch(error){
				j = {status:req.statusCode,message:req.body};
			}
			message.channel.createMessage(`<@!${message.author.id}>, API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
			return this.logger.log(`text: ${text}`);
		}
		return message.channel.createMessage("",{
			file: req.body,
			name: "armor.png"
		}).catch(err => message.channel.createMessage(`<@!${message.author.id}>, Error sending: ${err}`));
	})
};