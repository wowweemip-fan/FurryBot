import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"stop"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Make me stop.",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	return msg.reply("stopping..").then(() => process.exit());
}));
