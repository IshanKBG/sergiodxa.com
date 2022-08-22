import type {
	LinksFunction,
	LoaderArgs,
	MetaFunction,
} from "@remix-run/cloudflare";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";
import type { ReactNode } from "react";

import { json } from "@remix-run/cloudflare";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
	useLoaderData,
} from "@remix-run/react";
import { NavLink } from "@remix-run/react/dist/components";
import nProgressUrl from "nprogress/nprogress.css";
import { useChangeLanguage } from "remix-i18next";
import { useShouldHydrate } from "remix-utils";

import { useDirection, useLocale, useT } from "~/helpers/use-i18n.hook";
import { useNProgress } from "~/helpers/use-nprogress.hook";
import { i18n } from "~/services/i18n.server";
import globalStylesUrl from "~/styles/global.css";
import tailwindUrl from "~/styles/tailwind.css";

export let links: LinksFunction = () => {
	return [
		{ rel: "stylesheet", href: globalStylesUrl },
		{ rel: "stylesheet", href: tailwindUrl },
		{ rel: "stylesheet", href: nProgressUrl },
	];
};

export async function loader({ request }: LoaderArgs) {
	let locale = await i18n.getLocale(request);
	return json({ locale });
}

export let meta: MetaFunction = ({ data }) => {
	let { locale } = (data as UseDataFunctionReturn<typeof loader>) ?? {};
	return {
		robots: "noindex",
		"apple-mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "black-transparent",
		"apple-mobile-web-app-title": "Sergio Xalambrí",
		"mobile-web-app-capable": "yes",
		"og:locale": locale,
		"og:site_name": "Sergio Xalambrí",
		"og:type": "website",
		"theme-color": "#000",
		"twitter:card": "summary_large_image",
		"twitter:creator": "@sergiodxa",
		"twitter:site": "@sergiodxa",
		"X-UA-Compatible": "IE=edge,chrome=1",
		author: "Sergio Xalambrí",
		HandheldFriendly: "True",
		language: locale,
		MobileOptimized: "320",
		pagename: "Sergio Xalambrí",
		title: "Sergio Xalambrí",
		viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
	};
};

export let handle: SDX.Handle = { i18n: "translation" };

export default function App() {
	let { locale } = useLoaderData();
	let t = useT();

	useChangeLanguage(locale);

	useNProgress();

	return (
		<Document locale={locale}>
			<header className="mb-4">
				<h1 className="text-4xl font-black leading-none">
					{t("Sergio Xalambrí")}
				</h1>
			</header>

			<nav className="mb-10 flex items-center justify-between border-b border-black pb-1">
				<ul className="flex space-x-4 text-lg">
					<li>
						<NavLink to="/">Home</NavLink>
					</li>
					<li>
						<NavLink to="/articles">Articles</NavLink>
					</li>
					<li>
						<NavLink to="/bookmarks">Bookmarks</NavLink>
					</li>
				</ul>

				<aside className="flex w-full justify-end">
					<iframe
						src="https://github.com/sponsors/sergiodxa/button"
						title="Sponsor sergiodxa"
						height="35"
						width="116"
						className="border-0"
					/>
				</aside>
			</nav>

			<Outlet />
		</Document>
	);
}

export function ErrorBoundary({ error }: { error: Error }) {
	if (process.env.NODE_ENV === "development") console.error(error);
	return (
		<Document locale={useLocale()} title="Error!">
			Unexpected error
		</Document>
	);
}

export function CatchBoundary() {
	let caught = useCatch();
	return (
		<Document locale={useLocale()} title={caught.statusText}>
			{caught.statusText}
		</Document>
	);
}

function Document({
	children,
	title,
	locale,
}: {
	children: ReactNode;
	title?: string;
	locale: string;
}) {
	let shouldHydrate = useShouldHydrate();
	let dir = useDirection();
	return (
		<html lang={locale} dir={dir} className="h-full">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{title ? <title>{title}</title> : null}
				<Meta />
				<Links />
			</head>
			<body className="mx-auto max-w-screen-xl p-10 font-sans">
				{children}
				<ScrollRestoration />
				{shouldHydrate && <Scripts />}
				<LiveReload />
			</body>
		</html>
	);
}
