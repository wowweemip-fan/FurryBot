import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import config from "../config";
import { Colors } from "../util/Constants";

export default new ClientEvent("shardResume", (async function (this: FurryBot, id: number) {
	Logger.log("Shard Ready", `Shard #${id} resumed.`);
	return this.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
		embeds: [
			{
				title: "Shard Resumed",
				description: `Shard #${id} resumed.`,
				timestamp: new Date().toISOString(),
				color: Colors.gold
			}
		],
		username: `Furry Bot${config.beta ? " - Beta" : ""} Status`,
		avatarURL: "https://i.furry.bot/furry.png"
	}).catch(err => null);
}));
