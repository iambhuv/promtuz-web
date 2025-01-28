export type APIResponse<D> = { err: null; data: D; } | { data: null; err: any; }

export const handleRequest = async <D>(method: string, path: string, body?: object | FormData, headers: object = {}): Promise<APIResponse<D>> => {
  try {
    let formData = false;
    if (typeof body == "object" && body instanceof FormData) {
      formData = true;
    }

    console.log(path, formData);
    

    const res = await fetch(new URL(path, process.env.API_ENDPOINT), {
      method,
      body: body instanceof FormData ? body : JSON.stringify(body),
      credentials: 'include',
      headers: {
        // 'Content-Type': 'application/json',
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