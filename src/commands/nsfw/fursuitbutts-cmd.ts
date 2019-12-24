import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"fursuitbutts",
		"fursuitbutt"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "See some fursuit booties!",
	usage: "",
	features: ["nsfw"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	const img = await phin({
		method: "GET",
		url: "https://api.fursuitbutts.com/butts",
		parse: "json",
		timeout: 5e3
	});

	if (img.statusCode !== 200) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, img);
		return msg.channel.createMessage(`<@!${msg.author.id}>, Unknown api error.`);
	}
	const short = await this.f.shortenURL(img.body.response.image);
	const extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
	return msg.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nRequested By: ${msg.author.username}#${msg.author.discriminator}`, {
		file: await this.f.getImageFromURL(img.body.response.image),
		name: img.body.response.name
	});
}));