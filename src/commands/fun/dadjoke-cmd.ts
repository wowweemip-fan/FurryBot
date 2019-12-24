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
		"dadjoke",
		"dad"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 4e3,
	donatorCooldown: 2e3,
	description: "Get a dadjoke!",
	usage: "",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	const req = await phin({
		method: "GET",
		url: "https://icanhazdadjoke.com",
		headers: {
			"Accept": "application/json",
			"User-Agent": config.web.userAgent
		},
		parse: "json",
		timeout: 5e3
	});
	return msg.channel.createMessage(req.body.joke);
}));