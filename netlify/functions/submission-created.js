// Runs on every Netlify form submission.
// If the person ticked "Add me to the weekly email too", add them to Buttondown.
// Needs the BUTTONDOWN_API_KEY environment variable set in Netlify.

exports.handler = async (event) => {
  let data = {};
  try {
    data = JSON.parse(event.body).payload.data || {};
  } catch (err) {
    return { statusCode: 400, body: "Bad payload" };
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
