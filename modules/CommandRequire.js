const config = require("../config"),
	Trello = require("trello"),
	os = require("os"),
	util = require("util"),
	request = util.promisify(require("request")),
	phin = require("phin").defaults({
		method: "GET",
		headers: {
			"User-Agent": config.web.userAgent
		}
	}),
	uuid = require("uuid/v4"),
	fs = require("fs"),
	path = require("path"),
	colors = require("console-colors-2"),
	Canvas = require("canvas-constructor").Canvas,
	fsn = require("fs-nextra"),
	chalk = require("chalk"),
	chunk = require("chunk"),
	ytdl = require("ytdl-core"),
	_ = require("lodash"),
	perf = require("perf_hooks"),
	performance = perf.performance,
	PerformanceObserver = perf.PerformanceObserver,
	child_process = require("child_process"),
	shell = child_process.exec,
	stringSimilarity = require("string-similarity"),
	truncate = require("truncate"),
	wordGen = require("random-words"),
	deasync = require("deasync"),
	functions = require("../util/functions"),
	Eris = require("eris"),
	ErisSharder = require("eris-sharder"),
	MessageEmbed = require("../modules/MessageEmbed"),
	Database = require("../modules/Database"),
	ExtendedMessage = require("../modules/ExtendedMessage"),
	Snowflake = require("../modules/Snowflake"),
	MessageCollector = require("../util/MessageCollector"),
	Permissions = require("../util/Permissions"),
	LoggerV5 = require("../util/LoggerV5"),
	Comic = require("./Comic"),
	ComicImage = require("./ComicImage"),
	Temp = require("../util/Temp");

module.exports = {
	config,
	Trello,
	os,
	util,
	request,
	phin,
	uuid,
	fs,
	path,
	colors,
	Canvas,
	fsn,
	chalk,
	chunk,
	ytdl,
	_,
	perf,
	performance,
	PerformanceObserver,
	child_process,
	shell,
	stringSimilarity,
	truncate,
	wordGen,
	deasync,
	functions,
	Eris,
	ErisSharder,
	MessageEmbed,
	Database,
	ExtendedMessage,
	Snowflake,
	MessageCollector,
	Permissions,
	LoggerV5,
	Comic,
	ComicImage,
	Temp
};