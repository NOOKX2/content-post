const https = require("https");

const key = process.env.BUFFER_API_KEY || "";
const query = `mutation CreatePost {
  createPost(input: {
    channelId: "6a473d135ab6d2f1069bdc4a"
    text: "test from n8n container"
    schedulingType: automatic
    mode: shareNow
    assets: [{ image: { url: "https://pub-0dbc5da7004145578f115f5733abcc52.r2.dev/uploads/d29845b9-130d-455d-94c2-bbacc7b55464.webp" } }]
  }) {
    ... on PostActionSuccess { post { id } }
    ... on MutationError { message }
  }
}`;

const body = JSON.stringify({ query });

const req = https.request(
  {
    hostname: "api.buffer.com",
    port: 443,
    path: "/",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "Content-Length": Buffer.byteLength(body),
    },
  },
  (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      console.log("HTTP", res.statusCode);
      console.log(data.slice(0, 800));
    });
  }
);

req.on("error", (error) => console.error(error.message));
req.write(body);
req.end();
