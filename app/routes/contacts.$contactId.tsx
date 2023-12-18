import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getContact, updateContact, type ContactRecord } from "~/api/contacts";

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
  const favorite = formData.get("favorite") === "true";

  await updateContact(params.contactId, { favorite });

  return json({ ok: true, favorite });
}

function Favorite({ contact }: { contact: Pick<ContactRecord, "favorite"> }) {
  const fetcher = useFetcher();
  const favorite = contact.favorite;

  return (
    <fetcher.Form method="post">
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}

export default function Contact() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>
      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>
        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}
        {contact.notes ? <p>{contact.notes}</p> : null}
        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const shouldDelete = confirm(
                "Please confirm you want to delete this record."
              );
              if (!shouldDelete) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}
