import ClientEvent from "../util/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { ChannelNames, ChannelNamesCamelCase, Colors } from "../util/Constants";
import { Utility } from "../util/Functions";

export default new ClientEvent("channelDelete", (async function (this: FurryBot, channel: Eris.AnyChannel) {
	this.increment([
		"events.channelDelete",
		`events.channelDelete.${ChannelNamesCamelCase[channel.type]}`
	]);

	if (channel instanceof Eris.GuildChannel) {
		const g = await db.getGuild(channel.guild.id);
		if (!g) return;
		const e = g.logEvents.channelDelete;
		if (!e.enabled || !e.channel) return;
		const ch = channel.guild.channels.get(e.channel) as Eris.GuildTextableChannel;
		if (!ch || !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(this.user.id).has(p))) return g.edit({
			logEvents: {
				channelDelete: {
					enabled: false,
					channel: null
				}
			}
		});

		const embed: Eris.EmbedOptions = {
			title: "Channel Deleted",
			author: {
				name: channel.guild.name,
				icon_url: channel.guild.iconURL
			},
			description: [
				`${ChannelNames[channel.type]} Channel Deleted`,
				`Name: ${channel.name} (${channel.id})`
			].join("\n"),
			timestamp: new Date().toISOString(),
			color: Colors.red
		};

		const log = await Utility.fetchAuditLogEntries(channel.guild, Eris.Constants.AuditLogActions.CHANNEL_DELETE, channel.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

		return ch.createMessage({ embed }).catch(err => null);
	}
}));
