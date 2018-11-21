module.exports = (async (self,local) => {
	if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");
	
	var input = local.args.join(" ");
	var text = self.varParse(local.c,{author:local.author,input:input});
	if(local.gConfig.imageCommands) {
		if(!local.channel.permissionsFor(local.guild.me).has("ATTACH_FILES")) return local.message.reply("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
		var attachment = new self.Discord.MessageAttachment("https://furrybot.furcdn.net/bap.gif");
		local.channel.send(text,attachment);
	} else {
		local.channel.send(text);
	}
	if(!local.gConfig.deleteCmds) {
		local.message.delete().catch(noerr => {});
	}
	return local.channel.stopTyping();
});