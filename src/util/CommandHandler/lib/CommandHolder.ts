import Command from "./Command";
import FurryBot from "@FurryBot";
import Category from "./Category";
import CooldownHandler from "./CooldownHandler";
import Logger from "../../LoggerV8";
export default class CommandHolder {
	client: FurryBot;
	categories: Category[];
	cool: CooldownHandler;
	constructor(client: FurryBot) {
		this.client = client;
		this.categories = [];
		this.cool = new CooldownHandler();
	}

	get commands() {
		return [...this.categories.map(c => c.commands).reduce((a, b) => a.concat(b), [])];
	}

	get commandTriggers(): string[] {
		return this.commands.map(c => c.triggers).reduce((a, b) => a.concat(b), []);
	}

	setClient(client: FurryBot) {
		this.client = client;
		return this;
	}

	addCategory(catOrName: Category): Category;
	addCategory(catOrName: string, file: string, displayName?: string, devOnly?: boolean, description?: string): Category;
	addCategory(catOrName: Category | string, file?: string, displayName?: string, devOnly?: boolean, description?: string) {
		const n = this.categories.map(c => c.name);
		const dn = this.categories.map(c => c.displayName);
		if (typeof catOrName === "string") {
			if (!displayName) displayName = catOrName;
			if (n.includes(catOrName)) throw new TypeError("Duplicate category name.");
			if (dn.includes(displayName)) throw new TypeError("Duplicate category display name.");
			const cat = new Category({
				name: catOrName,
				displayName,
				devOnly,
				description,
				file
			});
			Logger.debug("Command Handler", `Added the category "${cat.name}"`);
			this.categories.push(cat);
			return cat;
		} else {
			if (this.categories.includes(catOrName)) throw new TypeError("Category already added.");
			if (n.includes(catOrName.name)) throw new TypeError("Duplicate category name.");
			if (dn.includes(catOrName.displayName)) throw new TypeError("Duplicate category display name.");
			for (const t of catOrName.commandTriggers) {
				if (this.commandTriggers.includes(t)) {
					const cat = this.categories.find(c => c.commandTriggers.includes(t));
					throw new TypeError(`Duplicate command trigger "${t}" (cat: ${cat.name})`);
				}
			}
			Logger.debug("Command Handler", `Added the category "${catOrName.name}"`);
			this.categories.push(catOrName);
			// catOrName.commands.map(c => this.addCommand(c));
			return catOrName;
		}
	}

	removeCategory(catOrName: string | Category) {
		if (typeof catOrName === "string") {
			const cat = this.categories.find(c => c.name === catOrName);
			if (!cat) return false;
			this.categories.splice(this.categories.indexOf(cat), 1);
			Logger.debug("Command Handler", `Removed the category "${cat.name}"`);
			return true;
		} else {
			if (!this.categories.includes(catOrName)) return false;
			this.categories.splice(this.categories.indexOf(catOrName), 1);
			Logger.debug("Command Handler", `Removed the category "${catOrName.name}"`);
			return true;
		}
	}

	addCommand(cmd: Command) {
		if (this.commands.includes(cmd)) throw new TypeError(`Command already present. (main: ${cmd.triggers[0]})`);
		// I could do this easier and shorter with a .some(), but I spread it out to
		// get the specific trigger for the error.
		// ex: if (cmd.triggers.some(t => this.commandTriggers.includes(t))) throw new TypeError("Duplicate command trigger.");
		for (const t of cmd.triggers) {
			if (this.commandTriggers.includes(t)) {
				const cd = this.commands.find(c => c.triggers.includes(t));
				throw new TypeError(`Duplicate command trigger "${t}" (main cmd triggers: (dup)${cd.triggers[0]}/(provd)${cmd.triggers[0]})`);
			}
		}
		if (!this.categories.map(c => c.name).includes(cmd.category)) throw new TypeError(`Invalid category "${cmd.category}".`);
		const cat = this.categories.find(c => c.name === cmd.category);
		cat.addCommand(cmd);
		return cat;
	}

	removeCommand(cmd: string | Command) {
		if (cmd instanceof Command) cmd = cmd.triggers[0];
		else {
			const cat = this.categories.find(c => c.commandTriggers.includes(cmd as string));
			if (!cat) throw new TypeError("Invalid command provided.");
			return cat.removeCommand(cmd);
		}
	}

	getCategory(name: string) {
		const cat = this.categories.find(c => c.name === name);
		if (!cat) return null;
		return cat;
	}

	getCommand(trigger: string) {
		const cmd = this.commands.find(c => c.triggers.includes(trigger));
		if (!cmd) return null;
		const cat = this.categories.find(c => c.name === cmd.category);
		return {
			cmd,
			cat
		};
	}
}
