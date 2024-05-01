import { CloudflareApiBaseUrl } from "../../src/lib/cloudflare/api";

export const onRequest: PagesFunction = async (context) => {
  try {
    const req = context.request;
    const url = new URL(req.url);
    const pathname = url.pathname.replace("/api/", "");

    return await fetch(`${CloudflareApiBaseUrl}/${pathname}${url.search}`, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
  } catch (error: unknown) {
    console.error("Error during API proxy request", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      {
        status: 500,
      },
    );
  }
};
