import config from "../../config";
import { mdb } from "../Database";

// I considered adding votes onto user objects, bot tracking them separately will work out
// better in the long run.

interface Warning {
	blame: string;
	gid: string;
	reason: string;
	timestamp: Date;
	wid: number;
}

class UserConfig {
	id: string;
	blacklist: {
		blacklisted: boolean;
		reason: string;
		blame: string;
	};
	marriage: {
		married: boolean;
		partner: string;
	};
	warnings: Warning[];
	bal: number;
	tips: boolean;
	dmActive: boolean;
	patreon: {
		amount: number;
		createdAt: number;
		declinedAt: number;
		donator?: boolean;
		patronId: string;
	};
	preferences: {
		mention: boolean;
	};
	// voteCount: number;
	// lastVote: number;
	constructor(id: string, data: DeepPartial<{ [K in keyof UserConfig]: UserConfig[K]; }>) {
		this.id = id;
		if (!data) data = config.defaults.userConfig;
		this._load.call(this, data);
	}

	_load(data: DeepPartial<{ [K in keyof UserConfig]: UserConfig[K]; }>) {
		this.blacklist = ![undefined, null].includes(data.blacklist) ? {
			blacklisted: !!data.blacklist.blacklisted,
			reason: data.blacklist.reason || null,
			blame: data.blacklist.blame || null
		} : config.defaults.userConfig.blacklist;
		this.marriage = ![undefined, null].includes(data.marriage) ? {
			married: !!data.marriage.married,
			partner: data.marriage.partner || null
		} : config.defaults.userConfig.marriage;
		this.warnings = ![undefined, null].includes(data.warnings) ? data.warnings : config.defaults.userConfig.warnings;
		this.bal = ![undefined, null].includes(data.bal) ? data.bal : config.defaults.userConfig.bal;
		this.tips = ![undefined, null].includes(data.tips) ? data.tips : config.defaults.userConfig.tips;
		this.dmActive = ![undefined, null].includes(data.dmActive) ? data.dmActive : config.defaults.userConfig.dmActive;
		this.patreon = ![undefined, null].includes(data.patreon) ? {
			amount: data.patreon.amount || 0,
			createdAt: data.patreon.createdAt || null,
			declinedAt: data.patreon.declinedAt || null,
			donator: !!data.patreon.donator,
			patronId: data.patreon.patronId || null
		} : config.defaults.userConfig.patreon;
		this.preferences = ![undefined, null].includes(data.preferences) ? {
			mention: !!data.preferences.mention
		} : config.defaults.userConfig.preferences;
		// this.voteCount = ![undefined, null].includes(data.voteCount) ? data.voteCount : config.voteCount;
		// this.lastVote = ![undefined, null].includes(data.lastVote) ? data.lastVote : config.lastVote;

		return null;
	}

	async reload() {
		const r = await mdb.collection("users").findOne({ id: this.id });
		this._load.call(this, r);

		return this;
	}

	async edit(data: DeepPartial<Omit<{ [K in keyof UserConfig]: UserConfig[K]; }, "warnings">>) {
		const u = {
			blacklist: this.blacklist,
			marriage: this.marriage,
			id: this.id,
			bal: this.bal,
			tips: this.tips,
			dmActive: this.dmActive,
			patreon: this.patreon,
			preferences: this.preferences
		};

		if (typeof data.blacklist !== "undefined") {
			if (typeof data.blacklist.blacklisted !== "undefined") u.blacklist.blacklisted = data.blacklist.blacklisted;
			if (typeof data.blacklist.reason !== "undefined") u.blacklist.reason = data.blacklist.reason;
			if (typeof data.blacklist.blame !== "undefined") u.blacklist.blame = data.blacklist.blame;
		}

		if (typeof data.marriage !== "undefined") {
			if (typeof data.marriage.married !== "undefined") u.marriage.married = data.marriage.married;
			if (typeof data.marriage.partner !== "undefined") u.marriage.partner = data.marriage.partner;
		}

		if (typeof data.bal !== "undefined") u.bal = data.bal;
		if (typeof data.tips !== "undefined") u.tips = data.tips;
		if (typeof data.dmActive !== "undefined") u.dmActive = data.dmActive;

		if (typeof data.patreon !== "undefined") {
			if (typeof data.patreon.amount) u.patreon.amount = data.patreon.amount;
			if (typeof data.patreon.createdAt) u.patreon.createdAt = data.patreon.createdAt;
			if (typeof data.patreon.declinedAt) u.patreon.declinedAt = data.patreon.declinedAt;
			if (typeof data.patreon.donator) u.patreon.donator = data.patreon.donator;
			if (typeof data.patreon.patronId) u.patreon.patronId = data.patreon.patronId;
		}

		if (typeof data.preferences !== "undefined") {
			if (typeof data.preferences.mention) u.preferences.mention = data.preferences.mention;
		}

		try {
			await mdb.collection("users").findOneAndUpdate({
				id: this.id
			}, {
				$set: u
			});
		} catch (e) {
			await mdb.collection("users").insertOne({ ...{}, ...{ id: this.id }, ...u });
		}

		// auto reload on edit
		return this.reload();
	}

	async delete() {
		await mdb.collection("users").findOneAndDelete({ id: this.id });
	}

	async reset() {
		await this.delete();
		await mdb.collection("users").insertOne({ ...{}, ...config, ...{ id: this.id } });
		await this._load(config.defaults.userConfig);
		return this;
	}
}

export default UserConfig;
