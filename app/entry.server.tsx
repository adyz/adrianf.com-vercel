import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import {renderToStaticNodeStream } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {

  let stream = renderToStaticNodeStream(<RemixServer context={remixContext} url={request.url} />);

  // and transform it to a Buffer to send in the Response
  let body: Buffer = await new Promise((resolve, reject) => {
    let buffers: Uint8Array[] = [];
    stream.on("data", (data) => {
      buffers.push(data);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
    stream.on("error", reject);
  });

  responseHeaders.set("Content-Type", "text/html");
  responseHeaders.set("cache-control", "public, max-age=30, s-maxage=86400")

  return new Response(body, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
