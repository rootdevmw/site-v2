import { z } from "zod";
import { api } from "@/lib/api/client";
import {
  streamRecordId,
  streamPlatformUrl,
  type StreamEditorPayload,
  type StreamPlatformValues,
} from "@/lib/utils/stream-editor";
const platform = z.object({
  id: streamRecordId,
  name: z.string(),
  url: z.string(),
});
export async function getStreamEditorPlatforms(signal?: AbortSignal) {
  const response = await api.get("/streams/platforms", {
    signal,
    timeout: 15000,
    silent: true,
  });
  const result = z
    .object({ success: z.boolean().optional(), data: z.array(platform) })
    .parse(response.data);
  if (
    result.success === false ||
    new Set(result.data.map((item) => item.id)).size !== result.data.length
  )
    throw new Error("Platforms could not be confirmed.");
  return result.data;
}
export async function saveStreamEditor(data: StreamEditorPayload, id?: string) {
  if (id !== undefined) streamRecordId.parse(id);
  const config = { timeout: 30000, silent: true };
  const response =
    id === undefined
      ? await api.post("/streams", data, config)
      : await api.patch("/streams/" + encodeURIComponent(id), data, config);
  const result = z
    .object({
      success: z.boolean().optional(),
      data: z.object({ id: streamRecordId }),
    })
    .parse(response.data);
  if (result.success === false || (id !== undefined && result.data.id !== id))
    throw new Error("Stream save could not be confirmed.");
  return result;
}
export async function saveStreamPlatform(
  data: StreamPlatformValues,
  id?: string,
) {
  if (id !== undefined) streamRecordId.parse(id);
  const url = streamPlatformUrl(data.url);
  if (!url) throw new Error("Enter a valid platform address.");
  const body = { name: data.name.trim(), url },
    config = { timeout: 30000, silent: true };
  const response =
    id === undefined
      ? await api.post("/streams/platforms", body, config)
      : await api.patch(
          "/streams/platforms/" + encodeURIComponent(id),
          body,
          config,
        );
  const result = z
    .object({ success: z.boolean().optional(), data: platform })
    .parse(response.data);
  if (result.success === false || (id !== undefined && result.data.id !== id))
    throw new Error("Platform save could not be confirmed.");
  return result;
}
