import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "clustersv2";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"gay",
		"homo"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "Gay up an image.",
	usage: "[image]",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	let imgurl, j;
	if (msg.args.length >= 1) {
		// get member from message
		const user = await msg.getUserFromArgs();
		imgurl = user instanceof Eris.User ? user.staticAvatarURL : msg.unparsedArgs.join("%20");
	} else if (msg.attachments[0]) imgurl = msg.attachments[0].url;
	else imgurl = msg.author.staticAvatarURL;

	if (!imgurl) return msg.reply("please either attach an image or provide a url");
	const test = await this.f.validateURL(imgurl);
	if (!test) return msg.reply("either what you provided wasn't a valid url, or the server responded with a non-200 OK response.");
	const req = await this.f.memeRequest("/gay", [imgurl]);
	if (req.statusCode !== 200) {
		try {
			j = { status: req.statusCode, message: JSON.stringify(req.body) };
		} catch (error) {
			j = { status: req.statusCode, message: req.body };
		}
		msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
		return Logger.log(`imgurl: ${imgurl}`, msg.guild.shard.id);
	}
	return msg.channel.createMessage("", {
		file: req.body,
		name: "gay.png"
	}).catch(err => msg.reply(`Error sending: ${err}`));
}));
