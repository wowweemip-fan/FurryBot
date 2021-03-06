import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";

export default new Command({
	triggers: [
		"conga"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "Start a conga with someone, or join in!",
	usage: "[@user]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length < 1) {
		if (msg.channel.conga !== undefined && msg.channel.conga.active) {
			if (msg.channel.conga.inConga.includes(msg.author.id) && !config.developers.includes(msg.author.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, you are already in this conga!`);
			clearTimeout(msg.channel.conga.timeout);
			msg.channel.conga.inConga.push(msg.author.id);
			msg.channel.conga.timeout = setTimeout((ch) => delete ch.conga, 3e5, msg.channel);
			return msg.channel.createMessage(`<@!${msg.author.id}> joined a conga with <@!${msg.channel.conga.member.id}>!\n<@!${msg.channel.conga.member.id}> now has ${msg.channel.conga.inConga.length} furs congaing with them!\nJoin in using \`${msg.gConfig.settings.prefix}conga\`.\n${msg.channel.conga.inConga.length > 30 ? "This conga line is too long for emojis!" : `<a:${config.emojis.conga}>`.repeat(msg.channel.conga.inConga.length)}`);
		}
		else throw new Error("ERR_INVALID_USAGE");
	} else {
		const member = await msg.getMemberFromArgs();
		if (!member) return msg.errorEmbed("INVALID_USER");
		await msg.channel.createMessage(`<@!${msg.author.id}> started a conga with <@!${member.id}>!\nJoin in using \`${msg.gConfig.settings.prefix}conga\`.\n<a:${config.emojis.conga}><a:${config.emojis.conga}>`);
		msg.channel.conga = {
			active: true,
			member,
			inConga: [],
			timeout: setTimeout((ch) => delete ch.conga, 3e5, msg.channel)
		};
		return msg.channel.conga.inConga.push(msg.author.id, member.id);
	}
}));
