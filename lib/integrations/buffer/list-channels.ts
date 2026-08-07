import { bufferGraphql } from "@/lib/integrations/buffer/client";

export type BufferChannelInfo = {
  id: string;
  name: string;
  service: string;
  isDisconnected: boolean;
};

export async function listBufferChannels(): Promise<BufferChannelInfo[]> {
  const organizationId = process.env.BUFFER_ORG_ID;
  if (!organizationId) {
    throw new Error("BUFFER_ORG_ID is not configured");
  }

  const data = await bufferGraphql<{
    channels: BufferChannelInfo[];
  }>(
    `query ListChannels($input: ChannelsInput!) {
      channels(input: $input) {
        id
        name
        service
        isDisconnected
      }
    }`,
    { input: { organizationId } }
  );

  return data.channels ?? [];
}
