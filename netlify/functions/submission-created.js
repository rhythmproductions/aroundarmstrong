// Runs on every Netlify form submission.
// Checks consent was given, then if the person ticked "Add me to the weekly email too", add them to Buttondown.
// Needs the BUTTONDOWN_API_KEY environment variable set in Netlify.

exports.handler = async (event) => {
  let data = {};
  try {
    data = JSON.parse(event.body).payload.data || {};
  } catch (err) {
    return { statusCode: 400, body: "Bad payload" };
  }

  // The form won't send without the consent box ticked. If something arrives without it
  // (someone posting around the page), log it and do nothing else with it.
  if (data.consent !== "yes" || !data.consent_text) {
    console.log("NO CONSENT on submission", (event.body && JSON.parse(event.body).payload.id) || "", "type:", data.type || "");
    return { statusCode: 200, body: "No consent, skipped" };
  }

  if (data.newsletter !== "yes" || !data.email) {
    return { statusCode: 200, body: "No newsletter opt-in" };
  }

  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) {
    console.log("BUTTONDOWN_API_KEY is not set. Skipping subscribe for", data.email);
    return { statusCode: 200, body: "No API key" };
  }

  const res = await fetch("https://api.buttondown.com/v1/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Token ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: data.email,
      tags: ["website", "submission-form"],
    }),
  });

  if (res.ok) {
    console.log("Subscribed", data.email);
    return { statusCode: 200, body: "Subscribed" };
  }

  const text = await res.text();
  // 400 with "already subscribed" is fine, anything else gets logged for Mike to see in the function log.
  console.log("Buttondown responded", res.status, text);
  return { statusCode: 200, body: "Buttondown responded " + res.status };
};
