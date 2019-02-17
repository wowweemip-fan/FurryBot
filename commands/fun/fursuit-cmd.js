module.exports = {
	triggers: [
		"fursuit"
	],
	userPermissions: [],
	botPermissions: [
		"ATTACH_FILES"
	],
	cooldown: 2e3,
	description: "Get a random fursuit image!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		message.channel.startTyping();
		let img, attachment, short, extra;
		img = await message.client.imageAPIRequest(false,"fursuit",true,true);
		if(img.success !== true) {
			return message.reply(`API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
		}
		attachment = new message.client.Discord.MessageAttachment(img.response.image);
		short = await message.client.shortenUrl(img.response.image);
		extra = short.new ? `**message.client is the first time message.client has been viewed! Image #${short.linkNumber}**\n\n` : "";
		message.channel.send(`${extra}Short URL: <${short.link}>\n\nRequested By: ${message.author.tag}`,attachment);
		return message.channel.stopTyping();
	})
};