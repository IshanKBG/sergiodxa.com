import type { User } from "@prisma/client";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { badRequest, unauthorized } from "remix-utils";
import { auth } from "~/services/auth.server";
import writeAnArticle from "~/use-cases/write-an-article";

type LoaderData = {
  userId: User["id"];
};

export let loader: SDX.LoaderFunction = async ({ request }) => {
  let userId = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return json<LoaderData>({ userId });
};

export let action: SDX.ActionFunction = async ({ request, context }) => {
  let userId = await auth.isAuthenticated(request);
  if (!userId) return unauthorized({ message: "Unauthorized" });
  let formData = await request.formData();
  let result = await writeAnArticle(context, formData);
  if (result.status === "failure") return badRequest(result.error.message);
  return redirect("/articles");
};

export default function Write() {
  let { userId } = useLoaderData<LoaderData>();
  let error = useActionData<string>();
  return (
    <Form method="post">
      {error ? <p>{error}</p> : null}
      <input type="hidden" name="authorId" value={userId} />
      <input type="text" name="title" />
      <textarea name="body" />
      <button>Create</button>
    </Form>
  );
}
