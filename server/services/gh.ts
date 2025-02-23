import { Octokit } from "@octokit/core";
import { z } from "zod";

export interface IGitHubService {
	getArticleContent(slug: string): Promise<string>;
}

export class GitHubService implements IGitHubService {
	private octokit: Octokit;

	constructor(private kv: KVNamespace, auth: string) {
		this.octokit = new Octokit({ auth });
	}

	async getArticleContent(slug: string) {
		let cached = await this.kv.get(slug, "text");
		if (cached !== null) return z.string().parse(cached);

		let { data } = await this.octokit.request(
			"GET /repos/{owner}/{repo}/contents/{path}",
			{
				owner: "sergiodxa",
				repo: "content",
				path: `articles/${slug}.md`,
				mediaType: { format: "raw" },
			}
		);

		let result = z.string().parse(data);

		this.kv.put(slug, result, { expirationTtl: 60 * 5 });

		return result;
	}
}
