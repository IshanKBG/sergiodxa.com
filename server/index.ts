import type { AppLoadContext } from "@remix-run/cloudflare";

import {
	combineGetLoadContexts,
	createMetronomeGetLoadContext,
	registerMetronome,
} from "@metronome-sh/cloudflare-pages";
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

import { envSchema } from "~/env";
import { AirtableService } from "~/services/airtable";
import { CollectedNotesService } from "~/services/cn";
import { GitHubService } from "~/services/gh";
import { LoggingService } from "~/services/logging";

const buildWithMetronome = registerMetronome(build);

const metronomeGetLoadContext = createMetronomeGetLoadContext(
	buildWithMetronome,
	{ config: require("../metronome.config.js") }
);

const handleRequest = createPagesFunctionHandler({
	build: buildWithMetronome,
	mode: process.env.NODE_ENV,
	getLoadContext: combineGetLoadContexts((context): AppLoadContext => {
		// Environment variables
		let env: AppLoadContext["env"] = envSchema.parse(context.env);

		// Injected services objects to interact with third-party services
		let services: AppLoadContext["services"] = {
			airtable: new AirtableService(
				context.env.airtable,
				env.AIRTABLE_API_KEY,
				env.AIRTABLE_BASE,
				env.AIRTABLE_TABLE_ID
			),
			cn: new CollectedNotesService(
				context.env.cn,
				env.CN_EMAIL,
				env.CN_TOKEN,
				env.CN_SITE
			),
			gh: new GitHubService(context.env.gh, env.GITHUB_TOKEN),
			log: new LoggingService(context.env.LOGTAIL_SOURCE_TOKEN),
		};

		return { env, services };
	}, metronomeGetLoadContext),
});

export function onRequest(context: EventContext<any, any, any>) {
	return handleRequest(context);
}
