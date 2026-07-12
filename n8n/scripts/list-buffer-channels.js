#!/usr/bin/env node
/**
 * List Buffer channels for mapping ช่องที่ลง → BUFFER_CHANNEL_MAP
 *
 * Usage: node --env-file=.env n8n/scripts/list-buffer-channels.js
 */

const apiKey = process.env.BUFFER_API_KEY;
const orgId = process.env.BUFFER_ORG_ID;

if (!apiKey || !orgId) {
  console.error("Set BUFFER_API_KEY and BUFFER_ORG_ID in .env");
  process.exit(1);
}

const query = `query ListChannels($input: ChannelsInput!) {
  channels(input: $input) {
    id
    name
    service
    isDisconnected
  }
}`;

fetch("https://api.buffer.com", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    query,
    variables: { input: { organizationId: orgId } },
  }),
})
  .then((res) => res.json())
  .then((json) => {
    if (json.errors?.length) {
      console.error(json.errors);
      process.exit(1);
    }

    const channels = json.data?.channels ?? [];
    console.log("\nBuffer channels:\n");
    for (const ch of channels) {
      console.log(
        `- ${ch.name} (${ch.service}) → ${ch.id}${ch.isDisconnected ? " [disconnected]" : ""}`
      );
    }

    console.log("\nEdit channel + platform list in lib/content/channels.ts");
    console.log("Optional override: BUFFER_CHANNEL_MAP in .env\n");
    console.log("// ช่องเดียว แพลตฟอร์มเดียว (string):");
    console.log(
      JSON.stringify(
        { nook__th: channels.find((c) => c.name === "nook__th")?.id },
        null,
        2
      )
    );
    console.log("\n// ช่องเดียว หลายแพลตฟอร์ม (object):");
    console.log(
      JSON.stringify(
        {
          nook_brand: {
            instagram: channels.find((c) => c.name === "nook__th")?.id,
            tiktok: channels.find((c) => c.name === "nook_down")?.id,
          },
        },
        null,
        2
      )
    );
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
