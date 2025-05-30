export type APIResponse<D> = { err: null; data: D; } | { data: null; err: any; }

export const handleRequest = async <D>(method: string, path: string, body?: BodyInit, headers: object = {}): Promise<APIResponse<D>> => {
  try {
    let formData = false;
    if (typeof body == "object" && (body instanceof FormData || body instanceof ArrayBuffer || body instanceof Blob)) {
      formData = true;
    }

    const res = await fetch(new URL(path, process.env.NEXT_PUBLIC_API_ENDPOINT), {
      method,
      body: formData ? body : JSON.stringify(body),
      credentials: 'include',
      headers: {
        'Accept-Encoding': 'deflate',
        ...headers
      }
    });
    const data: D = await res.json();

    if (res.status !== 200) return { err: data, data: null }


    return { err: null, data }
  } catch (err: any) {
    return { err, data: null }
  }
}