import express from "express";
import { mdb } from "../../modules/Database";
import client from "../../../";
import functions from "../../util/functions";
import config from "../../config";
import apiFunctions from "../functions";

const app: express.Router = express.Router();

app.get("/", async (req, res) => res.status(200).json({
	success: true,
	// shards: client.stats.shards.map(s => ({ id: s.id, ping: s.latency, status: s.status })),
	shardCount: client.stats.shardCount
}));

export default app;