export async function GET(req: Request) {
  return proxyRequest(req);
}

export async function POST(req: Request) {
  return proxyRequest(req);
}

export async function PUT(req: Request) {
  return proxyRequest(req);
}

export async function DELETE(req: Request) {
  return proxyRequest(req);
}

async function proxyRequest(req: Request) {
  const query = new URL(req.url).searchParams.get("u");

  if (!query) return new Response(null, { status: 404 })

  const url = `${process.env.API_ENDPOINT}${query}`;

  const response = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== "GET" ? req.body : undefined,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
