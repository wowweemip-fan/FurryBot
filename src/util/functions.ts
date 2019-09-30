import * as os from "os";
import phin from "phin";
import config from "../config";
import * as util from "util";
import * as fs from "fs-extra";
import { Command } from "./CommandHandler";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import ExtendedTextChannel from "../modules/extended/ExtendedTextChannel";
import ExtendedUser from "../modules/extended/ExtendedUser";
import * as Eris from "eris";
import FurryBot from "@FurryBot";
import { mdb } from "../modules/Database";
import ErrorHandler from "./ErrorHandler";
import client from "../../";
import UserConfig from "../modules/config/UserConfig";
import GuildConfig from "../modules/config/GuildConfig";
import youtubesearch from "youtube-search";
import ytdl from "ytdl-core";
import * as URL from "url";
import refreshPatreonToken from "./patreon/refreshPatreonToken";
import loopPatrons from "./patreon/loopPatrons";
import { Logger } from "@donovan_dmc/ws-clusters";

export { ErrorHandler };

const memberIsBooster = (async (m: Eris.Member): Promise<boolean> => {
	if (!(m instanceof Eris.Member)) throw new TypeError("invalid member provided");
	const guild = await client.eris.getRESTGuild(config.bot.mainGuild);
	if (!guild) throw new TypeError("failed to find main guild");
	if (!guild.members.has(m.user.id) || !guild.members.get(m.user.id).roles.includes(config.nitroBoosterRole)) return false;
	return true;
});

export default {
	os,
	memory: {
		process: {
			getTotal: ((): number => process.memoryUsage().heapTotal),
			getUsed: ((): number => process.memoryUsage().heapUsed),
			getRSS: ((): number => process.memoryUsage().rss),
			getExternal: ((): number => process.memoryUsage().external),
			getAll: ((): {
				total: number,
				used: number,
				rss: number,
				external: number
			} => ({
				total: process.memoryUsage().heapTotal,
				used: process.memoryUsage().heapUsed,
				rss: process.memoryUsage().rss,
				external: process.memoryUsage().external
			}))
		},
		system: {
			getTotal: ((): number => os.totalmem()),
			getUsed: ((): number => os.totalmem() - os.freemem()),
			getFree: ((): number => os.freemem()),
			getAll: ((): {
				total: number,
				used: number,
				free: number
			} => ({
				total: os.totalmem(),
				used: os.totalmem() - os.freemem(),
				free: os.freemem()
			}))
		}
	},
	checkSemVer: ((ver): boolean => require("semver").valid(ver) === ver),
	getCurrentTimestamp: ((): string => new Date().toISOString()),
	secondsToHours: ((sec: number) => {
		let hours: string | number = Math.floor(sec / 3600);
		let minutes: string | number = Math.floor((sec - (hours * 3600)) / 60);
		let seconds: string | number = Math.floor(sec - (hours * 3600) - (minutes * 60));

		if (hours < 10) hours = `0${hours}`;
		if (minutes < 10) minutes = `0${minutes}`;
		if (seconds < 10) seconds = `0${seconds}`;
		return `${hours}:${minutes}:${seconds}`;
	}),
	ucwords: ((str: string): string => str.toString().toLowerCase().replace(/^(.)|\s+(.)/g, (r) => r.toUpperCase())),
	toReadableDate: ((date: Date): string => {
		if (!(date instanceof Date)) throw new Error("must provide javascript Date object.");
		const a = date.toISOString().replace("Z", "").split("T");
		return `${a[0]} ${a[1].split(".")[0]} UTC`;
	}),
	makeSafe: ((msg: string): string => msg.replace(/\@everyone/, "@\u200Beveryone").replace(/\@here/, "@\u200Bhere")), // eslint-disable-line no-useless-escape
	ms: (async (data: number | {
		ms?: number;
		s?: number;
		m?: number;
		h?: number;
		d?: number;
		w?: number;
		mn?: number;
		y?: number;
	}, words?: boolean) => {
		const t = await new Promise((a, b) => {
			const t = {
				ms: 0,
				s: 0,
				m: 0,
				h: 0,
				d: 0,
				w: 0,
				mn: 0,
				y: 0
			};

			if (typeof data === "number") t.ms = data;
			else if (typeof data !== "object") throw new Error("invalid input");
			else {
				if (data.ms) t.ms = data.ms;
				if (data.s) t.s = data.s;
				if (data.m) t.m = data.m;
				if (data.h) t.h = data.h;
				if (data.d) t.d = data.d;
				if (data.w) t.w = data.w;
				if (data.m) t.mn = data.mn;
				if (data.y) t.y = data.y;
			}

			const shorten = (() => {
				if (t.ms >= 1000) {
					t.ms -= 1000;
					t.s += 1;
				}

				if (t.s >= 60) {
					t.s -= 60;
					t.m += 1;
				}

				if (t.m >= 60) {
					t.m -= 60;
					t.h += 1;
				}

				if (t.h >= 24) {
					t.h -= 24;
					t.d += 1;
				}

				if (t.d >= 30) {
					t.d -= 30;
					t.mn += 1;
				}

				if ((t.mn * 30) + t.d >= 365) {
					t.d = ((t.mn * 30) + t.d) - 365;
					t.mn -= 12;
					t.y += 1;
				}
			});

			const c = () => (t.ms >= 1000) || (t.s >= 60) || (t.m >= 60) || (t.h >= 24) || (t.d >= 30) || (t.w >= 4) || (t.mn >= 12);
			const d = () => t.d >= 7;
			while (c()) {
				shorten();
				if (!c()) {
					if (!d()) return a(t);

					while (d()) {
						t.d -= 7;
						t.w += 1;
						if (!d()) return a(t);
					}
				}
			}
		});

		if (!words) return t;
		else {
			const full = {
				ms: "millisecond",
				s: "second",
				m: "minute",
				h: "hour",
				d: "day",
				w: "week",
				mn: "month",
				y: "year"
			};

			const j = {};

			Object.keys(t).forEach((k) => {
				if (t[k] !== 0) j[k] = t[k];
			});

			if (Object.keys(j).length < 1) return {};

			const useFull = Object.keys(j).length < 4;

			return Object.keys(j).reverse().map((k, i, a) => `${i === a.length - 1 && a.length !== 1 ? "and " : ""}${j[k]}${useFull ? ` ${full[k]}${j[k] > 1 ? "s" : ""}` : k}`).join(", ").trim();
		}
	}),
	parseTime: ((time, full = false, ms = false) => {
		if (ms) time = time / 1000;
		const methods = [
			{ name: full ? " day" : "d", count: 86400 },
			{ name: full ? " hour" : "h", count: 3600 },
			{ name: full ? " minute" : "m", count: 60 },
			{ name: full ? " second" : "s", count: 1 }
		];

		const timeStr = [`${Math.floor(time / methods[0].count).toString()}${methods[0].name}${Math.floor(time / methods[0].count) > 1 && full ? "s" : ""}`];
		for (let i = 0; i < 3; i++) {
			timeStr.push(`${Math.floor(time % methods[i].count / methods[i + 1].count).toString()}${methods[i + 1].name}${Math.floor(time % methods[i].count / methods[i + 1].count) > 1 && full ? "s" : ""}`);
		}
		let j = timeStr.filter(g => !g.startsWith("0")).join(", ");
		if (j.length === 0) j = "no time";
		return j;
	}),
	randomColor: ((): number => Math.floor(Math.random() * 0xFFFFFF)),
	removeDuplicates: ((array: any[]): any[] => [...new Set(array).values()]),
	processSub: (async (cmd: Command[], msg: ExtendedMessage, ctx: FurryBot) => {
		/*const c = cmd[cmd.length - 1];
		if (msg.args.length > 0 && c.hasSubCommands && c.subCommands.map(s => s.triggers).reduce((a, b) => a.concat(b)).includes(msg.args[0].toLowerCase())) {
			const { command: sub } = msg._client.getCommand([...cmd.map(c => c.triggers[0]), msg.args.shift().toLowerCase()]);
			msg.unparsedArgs.shift();
			const cc = sub[sub.length - 1];
			// Logger.log("General", sub);
			// Logger.log("General", sub[sub.length - 1]);
			if (msg.cmd.command instanceof Array) msg.cmd.command.push(cc);
			else msg.cmd.command = [msg.cmd.command, cc];
			// Logger.log("General", cc.triggers[0]);
			// Logger.log("General", util.inspect(cc.subCommands.find(c => c.triggers.includes(cc.triggers[0])), { depth: null, colors: true }));
			// Logger.log("General", c.subCommands.find(s => s.triggers.includes(cc.triggers[0])));
			return c.subCommands.find(s => s.triggers.includes(cc.triggers[0])).run.call(ctx, msg);
		} else return "NOSUB";*/
	}),
	subCmds: ((dir: string, file: string): Command[] => {
		const d = file.split(/(\\|\/)+/g).reverse()[0].split(".")[0].split("-")[0];
		if (fs.existsSync(`${dir}/${d}`)) {
			if (__filename.endsWith(".ts")) {
				if (fs.existsSync(`${dir}/${d}/index.ts`)) return require(`${dir}/${d}/index.ts`).default;
				else {
					Logger.warn("General", `Subcommand directory found, but no index present. Attempting to auto create index..\nCommand Directory: ${dir}\nCommand File: ${file}\nSubcommand Directory: ${dir}${process.platform === "win32" ? "\\" : "/"}${d}`);
					if (fs.existsSync(`${config.rootDir}/src/default/subcmdindex.ts`)) fs.copyFileSync(`${config.rootDir}/src/default/subcmdindex.ts`, `${dir}/${d}/index.ts`);
					if (fs.existsSync(`${dir}/${d}/index.ts`)) {
						Logger.debug("General", "Auto copying worked, continuing as normal..");
						return require(`${dir}/${d}/index.ts`).default;
					} else {
						Logger.error("General", `Auto copying failed, please check that default/subcmdindex.ts exists, and is readable/writable, and that I can write in ${dir}${process.platform === "win32" ? "\\" : "/"}${d}`);
					}
					return [];
				}
			} else {
				if (fs.existsSync(`${dir}/${d}/index.js`)) return require(`${dir}/${d}/index.js`).default;
				else {
					Logger.warn("General", `Subcommand directory found, but no index present. Attempting to auto create index..\nCommand Directory: ${dir}\nCommand File: ${file}\nSubcommand Directory: ${dir}${process.platform === "win32" ? "\\" : "/"}${d}`);
					if (fs.existsSync(`${config.rootDir}/src/default/subcmdindex.js`)) fs.copyFileSync(`${config.rootDir}/src/default/subcmdindex.js`, `${dir}/${d}/index.js`);
					if (fs.existsSync(`${dir}/${d}/index.js`)) {
						Logger.debug("General", "Auto copying worked, continuing as normal..");
						return require(`${dir}/${d}/index.js`).default;
					} else {
						Logger.error("General", `Auto copying failed, please check that default/subcmdindex.js exists, and is readable/writable, and that I can write in ${dir}${process.platform === "win32" ? "\\" : "/"}${d}`);
					}
					return [];
				}
			}
		}
		return null;
	}),
	hasSubCmds: ((dir: string, file: string): boolean => fs.existsSync(`${dir}/${file.split(/(\\|\/)+/g).reverse()[0].split(".")[0].split("-")[0]}`)),
	sendCommandEmbed: ((msg: ExtendedMessage, cmd: Command) => {
		if (!msg || !(msg instanceof ExtendedMessage)) throw new TypeError("invalid message");
		if (!cmd) throw new TypeError("missing command");

		let embed;
		if (cmd.subCommands.length > 0) {
			embed = {
				title: `Subcommand List: ${msg.client.f.ucwords(cmd.triggers[0])}`,
				description: `\`command\` (\`alias\`) - description\n\n${cmd.subCommands.map(s => s.triggers.length > 1 ? `\`${s.triggers[0]}\` (\`${s.triggers[1]}\`) - ${s.description}` : `\`${s.triggers[0]}\` - ${s.description}`).join("\n")}`
			};
		} else {
			embed = {
				title: `Command Help: ${msg.client.f.ucwords(cmd.triggers[0])}`,
				description: `Usage: ${cmd.usage}\nDescription: ${cmd.description}`
			};
		}
		return msg.channel.createMessage({
			embed
		});
	}),
	_getDate: ((): string => {
		const date = new Date();
		return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
	}),
	getImageFromURL: (async (url: string): Promise<Buffer> => phin({ url }).then(res => res.body)),
	imageAPIRequest: (async (animal = true, category: string = null, json = true, safe = false): Promise<{
		success: boolean;
		response?: {
			image: string;
			filetype: string;
			name: string;
		};
		error?: "invalid category" | {
			code: number;
			description: string;
		}
	}> => {
		return new Promise(async (resolve, reject) => {
			let s;
			if ([undefined, null].includes(json)) json = true;

			try {
				s = await phin({
					method: "GET",
					url: `https://api.furry.bot/${animal ? "animals" : `furry/${safe ? "sfw" : "nsfw"}`}/${category ? category.toLowerCase() : safe ? "hug" : "bulge"}${json ? "" : "/image"}`.replace(/\s/g, ""),
					parse: "json"
				});
				resolve(s.body);
			} catch (error) {
				reject({
					error,
					response: s.body
				});
			}
		});
	}),
	random: ((len = 10, keyset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string => {
		// if (len > 500 && !this[config.overrides.random]) throw new Error("Cannot generate string of specified length, please set global override to override this.");
		let rand = "";
		for (let i = 0; i < len; i++)
			rand += keyset.charAt(Math.floor(Math.random() * keyset.length));

		return rand;
	}),
	formatStr: ((str: string | ExtendedUser | Eris.User | Eris.Member | ExtendedTextChannel | Eris.GuildChannel, ...args: any[]): string => {
		let res;
		if (str instanceof ExtendedUser || str instanceof Eris.User || str instanceof Eris.Member) res = `<@!${str.id}>`;
		else if (str instanceof ExtendedTextChannel || str instanceof Eris.GuildChannel) res = str.name;
		else res = str.toString();
		args = args.map(a => a.toString());
		const a = res.match(/({\d})/g);
		const e = ((s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
		const e2 = ((s) => s.replace(/\{/g, "").replace(/\}/g, ""));
		a.map((b) => args[e2(b)] !== undefined ? res = res.replace(new RegExp(e(b), "g"), args[e2(b)]) : null);
		return res;
	}),
	downloadImage: (async (url: string, filename: string): Promise<fs.WriteStream> =>
		phin({ url }).then(res => res.pipe(fs.createWriteStream(filename)))
	),
	shortenURL: (async (url) => {
		const req = await phin({
			url: `https://r.furry.services/get?url=${encodeURIComponent(url)}`,
			headers: {
				"User-Agent": config.web.userAgent
			},
			parse: "json"
		});

		if (req.statusCode === 200) return {
			new: false,
			...req.body
		};
		else if (req.statusCode === 404) {
			const cr = await phin({
				method: "POST",
				url: `https://r.furry.services/create?url=${encodeURIComponent(url)}`,
				headers: {
					"User-Agent": config.web.userAgent
				},
				parse: "json"
			});

			if (cr.statusCode !== 200) return null;
			else return {
				new: true,
				...cr.body
			};
		}
		else throw new Error(`furry.services api returned non 200/404 response: ${req.statusCode}, body: ${req.body}`);
	}),
	memeRequest: (async (path: string, avatars: string[] | string = [], text = ""): Promise<phin.JsonResponse> => {
		avatars = typeof avatars === "string" ? [avatars] : avatars;
		return phin({
			method: "POST",
			url: `https://dankmemer.services/api${path}`,
			headers: {
				"Authorization": config.apis.dankMemer.token,
				"User-Agent": config.userAgent,
				"Content-Type": "application/json"
			},
			data: {
				avatars,
				text
			},
			parse: "none"
		});
	}),
	compareMembers: ((member1: Eris.Member, member2: Eris.Member): {
		member1: {
			higher: boolean;
			lower: boolean;
			same: boolean;
		};
		member2: {
			higher: boolean;
			lower: boolean;
			same: boolean;
		};
	} => {
		const a = member1.roles.map(r => member1.guild.roles.get(r));
		let b: Eris.Role;
		if (a.length > 0) b = a.filter(r => r.position === Math.max.apply(Math, a.map(p => p.position)))[0];

		const c = member2.roles.map(r => member2.guild.roles.get(r));
		let d: Eris.Role;
		if (c.length > 0) d = c.filter(r => r.position === Math.max.apply(Math, c.map(p => p.position)))[0];

		if (!b && d) return {
			member1: {
				higher: false,
				lower: true,
				same: false
			},
			member2: {
				higher: true,
				lower: false,
				same: false
			}
		};

		if (b && !d) return {
			member1: {
				higher: true,
				lower: false,
				same: false
			},
			member2: {
				higher: false,
				lower: true,
				same: false
			}
		};

		if (!b && !d) return {
			member1: {
				higher: false,
				lower: false,
				same: true
			},
			member2: {
				higher: false,
				lower: false,
				same: true
			}
		};
		return {
			member1: {
				higher: b.position > d.position,
				lower: b.position < d.position,
				same: b.position === d.position
			},
			member2: {
				higher: d.position > b.position,
				lower: d.position < b.position,
				same: d.position === b.position
			}
		};
	}),
	compareMemberWithRole: ((member: Eris.Member, role: Eris.Role): {
		higher: boolean;
		lower: boolean;
		same: boolean;
	} => {
		const a = member.roles.map(r => member.guild.roles.get(r));
		const b = a.filter(r => r.position === Math.max.apply(Math, a.map(p => p.position)))[0];

		return {
			higher: b.position < role.position,
			lower: b.position > role.position,
			same: b.position === role.position
		};
	}),
	everyOtherUpper: ((str: string): string => {
		let res = "";
		for (let i = 0; i < str.length; i++) {
			res += i % 2 === 0 ? str.charAt(i).toUpperCase() : str.charAt(i);
		}
		return res;
	}),
	incrementDailyCounter: (async (positive = true, guildCount: number) => {
		const d = new Date(),
			date = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;

		const a = await mdb.collection("dailyjoins").findOne({ date });
		let count;
		if (!a) {
			count = 0;
			await mdb.collection("dailyjoins").insertOne({ date, count, guildCount });
		}
		else count = a.count;

		count = parseInt(count, 10);

		if (isNaN(count)) count = 0;

		if (positive) count++; else count--;

		return mdb.collection("dailyjoins").findOneAndUpdate({ date }, { $set: { count, guildCount } });
	}),
	memberIsBooster,
	calculateMultiplier: (async (m: Eris.Member): Promise<{ amount: number, multi: { [s: string]: boolean } }> => {
		// return null;
		if (!(m instanceof Eris.Member)) throw new TypeError("invalid member provided");
		const member = m;
		const guild = m.guild;

		const a = [];
		let amount = 0;
		const multi = {
			supportServer: false,
			voteWeekend: false,
			vote: false,
			booster: false,
			tips: false
		};

		if (guild.id === config.bot.mainGuild) {
			multi.supportServer = true;
			a.push(config.eco.multipliers.supportServer);
		}

		const v = await mdb.collection("votes").find({ userId: member.user.id }).toArray().then(res => res.filter(r => (r.timestamp + config.eco.voteTimeout) > Date.now()));
		if (v.length !== 0) {
			if (v[0].isWeekend) { // vote weekend multiplier
				a.push(config.eco.multipliers.voteWeekend);
				a.push(config.eco.multipliers.vote);
				multi.vote = true;
				multi.voteWeekend = true;
			}
			else { // vote weekday multiplier
				a.push(config.eco.multipliers.vote);
				multi.vote = true;
			}
		}


		const b = await memberIsBooster(member);
		if (b) (a.push(config.eco.multipliers.booster), multi.booster = true);

		const t = await mdb.collection("users").findOne({ id: m.user.id }).then(res => res.tips).catch(err => false);
		if (t) {
			a.push(config.eco.multipliers.tips);
			multi.tips = true;
		}
		amount = parseFloat(a.filter(n => !isNaN(n)).reduce((a, b) => a + b).toFixed(3));

		do {
			if (amount.toString().endsWith("0")) amount = parseFloat(amount.toString().slice(0, amount.toString().length - 1));
		}
		while (amount.toString().endsWith("0"));


		return { multi, amount };
	}),
	fetchDBUser: (async (id: string, createIfNotFound = false): Promise<UserConfig> => {
		let m = await mdb.collection("users").findOne({ id });
		if (!m) {
			if (createIfNotFound === true) {
				await mdb.collection("users").insertOne({ id, ...config.defaults.userConfig });
				m = await mdb.collection("users").findOne({ id });
			} else return null;
		}
		return new UserConfig(id, m);
	}),
	fetchDBGuild: (async (id: string, createIfNotFound = false): Promise<GuildConfig> => {
		let m = await mdb.collection("guilds").findOne({ id });
		if (!m) {
			if (createIfNotFound === true) {
				await mdb.collection("guilds").insertOne({ id, ...config.defaults.userConfig });
				m = await mdb.collection("guilds").findOne({ id });
			} else return null;
		}
		return new GuildConfig(id, m);
	}),
	ytsearch: (async (q = "") => util.promisify(youtubesearch)(q, config.ytSearchOptions).then(res => res.filter(y => y.kind === "youtube#video").slice(0, 10))),
	ytinfo: (async (url: string): Promise<ytdl.videoInfo> => {
		const i: any = util.promisify(ytdl.getInfo)(url);
		return i;
	}),
	validateURL: ((url: string) => { // check that url is a well formed url, and that the server responds to HEAD requests properly
		return URL.parse(url).hostname ? phin({
			method: "HEAD",
			url
		}).then(d => d.statusCode === 200) : false;
	}),
	combineReports: ((...reports: {
		userTag: string;
		userId: string;
		generatedTimestamp: number;
		type: "cmd" | "response";
		beta: boolean;
		entries: {
			time: number;
			cmd: string;
		}[] | {
			time: number;
			response: string;
		}[];
	}[]): {
		userTag: string;
		userId: string;
		generatedTimestamp: number;
		type: "cmd" | "response";
		beta: boolean;
		entries: {
			time: number;
			cmd: string;
		}[] | {
			time: number;
			response: string;
		}[];
	} => {
		if (Array.from(new Set(reports.map(r => r.userId))).length > 1) throw new TypeError("Cannot combine reports of different users.");
		if (Array.from(new Set(reports.map(r => r.type))).length > 1) throw new TypeError("Cannot combine reports of different types.");
		if (Array.from(new Set(reports.map(r => r.beta))).length > 1) throw new TypeError("Cannot combine beta, and non-beta reports.");

		const entries: any = Array.from(new Set(reports.map(r => r.entries as any).reduce((a, b) => a.concat(b)).map(r => JSON.stringify(r)))).map(r => JSON.parse(r as string));
		return {
			userTag: reports[0].userTag,
			userId: reports[0].userId,
			generatedTimestamp: Date.now(),
			type: reports[0].type,
			beta: reports[0].beta,
			entries
		};
	}),
	refreshPatreonToken,
	loopPatrons,
	fetchLangMessage: ((lang: string, cmd: Command) => {
		if (!lang || !Object.keys(config.lang).includes(lang.toLowerCase())) throw new TypeError("invalid language provided");
		if (!cmd) throw new TypeError("invalid command provided");

		const l = config.lang[lang.toLowerCase()][cmd.triggers[0].toLowerCase()];
		if (!l) return "";
		return l[Math.floor(Math.random() * l.length)];
	})
};