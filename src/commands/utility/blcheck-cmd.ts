import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { mdb } from "../../modules/Database";
import { Blacklist } from "../../util/@types/Misc";
import { Time } from "../../util/Functions";
export default new Command({
	triggers: [
		"blcheck"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Check if a user is blacklisted.",
	usage: "<id>",
	features: ["supportOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const u = await msg.getUserFromArgs();
	if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
	const { id } = u;
	const ubl: Blacklist.UserEntry[] = await mdb.collection("blacklist").find({ userId: id }).toArray();

	if (ubl.length > 0) {
		const expired = ubl.filter(b => b.expire < Date.now() && ![0, null].includes(b.expire));
		const current = ubl.filter(b => [0, null].includes(b.expire) || b.expire > Date.now());
		if (current.length > 0) return msg.channel.createMessage(`The user **${u.username}#${u.discriminator}** is blacklisted. Here's those entries:\n**Expired**:\n${expired.map((b, i) => `${i + 1}.) Date: ${Time.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : Time.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}\n\n**Current**:\n${current.map((b, i) => `${i + 1}.) Date: ${Time.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : Time.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}`);
		else return msg.channel.createMessage(`The user **${u.username}#${u.discriminator}** is not currently blacklisted, but they have some previous blacklists. Here's those entries:\n**Expired**:\n${expired.map((b, i) => `${i + 1}.) Date: ${Time.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : Time.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}\n\n**Current**:\n${current.map((b, i) => `${i + 1}.) Date: ${Time.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : Time.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}`);
	}
	else return msg.reply(`**${u.username}#${u.discriminator}** is not blacklisted.`);
}));
