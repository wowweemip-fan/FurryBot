import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";

// this cannot be async due to "unhandledRejection" (unhandled promise rejection)'s not
// being able to be handled asynchronously
export default new ClientEvent("error", (function (this: FurryBot, info, id?: number) {
	this.increment([
		"events.error"
	]);
	if (typeof info === "string") {
		if (Logger !== undefined) return Logger.errorSync(`Shard #${id} | Client`, info);
		else return console.error(info);
	} else {
		switch (info.type) {
			// case "SIGINT":
			// 	Logger.error("Client", `${info.type} recieved, signal: ${info.data.signal}. Killing process.`);
			// 	this.disconnect({ reconnect: false });
			// 	process.kill(process.pid);
			// 	break;
			case "uncaughtException":
				return Logger.errorSync("Uncaught Exception", info.data.error);
				break;

			case "unhandledRejection":
				try {
					Logger.errorSync("Unhandled Rejection | Reason", info.data.reason);
					Logger.errorSync("Unhandled Rejection | Promise", info.data.promise);
				} catch (e) {
					Logger.errorSync("Error Handler Error", e);
					Logger.errorSync("Error Handler Error", info);
				}
				break;

			default:
				return Logger.errorSync("Unknown Error", info);
		}
	}
}));
