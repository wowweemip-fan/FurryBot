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
		"whosagoodboy",
		"whosagoodboi",
		"goodboy",
		"goodboi"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	donatorCooldown: .5e3,
	description: "Who's a good boy?!",
	usage: "[@user]",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length === 0) return msg.reply("Yip! Yip! I am!");
	else return msg.reply(`Yip! Yip! ${msg.args.join(" ")} is!`);
}));
