// actions/getClientInfo.js
// Small helper to extract client identifying data from the incoming request
// and optional form. Returns `{ ip, token, rawIpHeader }`.

export function getClientInfo(request, form) {
  // Prefer X-Forwarded-For or other common headers set by proxies.
  const headers = request.headers;
  const ipHeader = headers.get('x-forwarded-for') || headers.get('x-real-ip') || headers.get('cf-connecting-ip') || headers.get('true-client-ip') || '';
  const ip = ipHeader ? ipHeader.split(',')[0].trim() : headers.get('x-forwarded-for') || 'unknown';

  // Token from Authorization Bearer or form token field.
  const auth = headers.get('authorization') || '';
  let token = '';
  if (auth && auth.toLowerCase().startsWith('bearer ')) token = auth.slice(7).trim();
  if (form) {
    const formToken = form.get('token');
    if (formToken) token = String(formToken);
  }

  return { ip, token, rawIpHeader: ipHeader };
}
