import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { deleteContact } from "~/api/contacts";

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");

  await deleteContact(params.contactId);

  return redirect("/");
}
