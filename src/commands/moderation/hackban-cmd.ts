import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"hackban",
		"hb"
	],
	userPermissions: [
		"banMembers"
	],
	botPermissions: [
		"banMembers"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Ban someone that isn't in your server.",
	usage: "<@user/id> [reason]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// get user from message
	let user: Eris.User;
	user = await msg.getUserFromArgs();

	if (!user) user = await this.getRESTUser(msg.args[0]).catch(err => null);
	if (!user) return msg.errorEmbed("INVALID_USER");

	if ((await msg.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) {
		const embed: Eris.EmbedOptions = {
			title: "User already banned",
			description: `It looks like ${user.username}#${user.discriminator} is already banned here..`,
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			color: Math.floor(Math.random() * 0xFFFFFF)
		};

		return msg.channel.createMessage({ embed });
	}

	if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.reply("Pretty sure you don't want to do this to yourself.");
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	msg.channel.guild.banMember(user.id, 7, `Hackban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was banned, ${reason}***`).catch(noerr => null);
		if (!!msg.gConfig.settings.modlog) {
			if (!msg.channel.guild.channels.has(msg.gConfig.settings.modlog)) await msg.reply(`failed to create mod log entry, as I could not find the mod log channel.`);
			else {
				const ch = msg.channel.guild.channels.get(msg.gConfig.settings.modlog) as Eris.GuildTextableChannel;
				if (!ch.permissionsOf(this.user.id).has("sendMessages")) await msg.reply(`failed to create mod log entry, as I cannot send messages in the mod log channel.`);
				else if (!ch.permissionsOf(this.user.id).has("embedLinks")) await msg.reply(`failed to create mod log entry, as I cannot send embeds in the mod log channel.`);
				else {
					await ch.createMessage({
						embed: {
							title: "Member Hackbanned",
							description: [
								`Target: ${user.username}#${user.discriminator} <@!${user.id}>`,
								`Reason: ${reason}`
							].join("\n"),
							timestamp: new Date().toISOString(),
							color: Colors.red,
							author: {
								name: msg.channel.guild.name,
								icon_url: msg.channel.guild.iconURL
							},
							footer: {
								text: `Action carried out by ${msg.author.tag}`
							}
						}
					});
				}
			}
		}
	}).catch(async (err) => {
		msg.channel.createMessage(`I couldn't hackban **${user.username}#${user.discriminator}**, ${err}`);
		/*if (m !== undefined) {
			await m.delete();
		}*/
	});

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
