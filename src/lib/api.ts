export type APIResponse<D> = { err: null; data: D; } | { data: null; err: any; }

export const handleRequest = async <D>(method: string, path: string, body?: object, headers: object = {}): Promise<APIResponse<D>> => {
  try {
    const res = await fetch(new URL(path, process.env.API_ENDPOINT), {
      method,
      body: body && JSON.stringify(body),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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