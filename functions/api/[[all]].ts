const CloudflareApiBaseUrl = "https://api.cloudflare.com/client/v4";

// noinspection JSUnusedGlobalSymbols
export const onRequest: PagesFunction = async (context) => {
  try {
    const req = context.request;
    const url = new URL(req.url);
    const path = url.pathname.replace("/api/", "");

    return await fetch(`${CloudflareApiBaseUrl}/${path}`, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
  } catch (error) {
    console.error("Error during API proxy request", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.toString(),
      }),
      {
        status: 500,
      },
    );
  }
};