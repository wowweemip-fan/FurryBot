module.exports = (async (self,local) => {
	if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");
	
	var input = local.args.join(" ");
	var text = self.varParse(local.c,{author:local.author,input:input});
	if(local.gConfig.commandImages) {
		if(!local.channel.permissionsFor(local.guild.me).has("ATTACH_FILES")) return local.message.reply("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
		var img = await self.imageAPIRequest(true,self.command);
		if(!img.success) return local.message.reply(`Image API returned an error: ${img.error.description}`);
		var attachment = new self.Discord.MessageAttachment(img.response.image);
		local.channel.send(text,attachment);
	} else {
		local.channel.send(text);
	}
	
	if(!local.gConfig.deleteCmds) {
		local.message.delete().catch(noerr => {});
	}
});
