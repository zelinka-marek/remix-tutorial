import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getContact, updateContact } from "~/api/contacts";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw json(
      { contact },
      {
        status: 404,
        statusText: `No contact found with id "${params.contactId}"`,
      }
    );
  }

  return json({ contact });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");

  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  await updateContact(params.contactId, updates);

  return redirect(`/contacts/${params.contactId}`);
}

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  function navigateBack() {
    navigate("..", { relative: "path", replace: true });
  }

  return (
    <Form id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={contact.first}
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea defaultValue={contact.notes} name="notes" rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <button type="button" onClick={navigateBack}>
          Cancel
        </button>
      </p>
    </Form>
  );
}
