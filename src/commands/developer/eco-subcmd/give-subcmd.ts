import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../config";
import { Logger } from "clustersv2";
import { db, mdb } from "../../../modules/Database";
import Eris from "eris";

export default new SubCommand({
	triggers: [
		"give",
		"add",
		"+"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Add to someones economy balance.",
	usage: "<id> <amount>",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");

	const u = await msg.getUserFromArgs();

	if (!u) return msg.reply("I couldn't find that user.");

	const d = await db.getUser(u.id);

	const oldBal = d.bal;

	const amount = parseInt(msg.args[1], 10);

	if (isNaN(amount) || amount < 1) return msg.reply("second parameter must be a positive integer.");

	const newBal = d.bal + amount; // "new" cannot be used because it is a reserved keyword

	await d.edit({ bal: newBal }).then(d => d.reload());

	return msg.reply(`gave ${amount} to **${u.username}#${u.discriminator}** (${u.id})\nOld Balance: ${oldBal}\nNew Balance: ${newBal}`);
}));
