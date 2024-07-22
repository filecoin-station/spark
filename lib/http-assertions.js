import { AssertionError } from 'zinnia:assert'

/**
 * @param {Response} res
 * @param {string} [errorMsg]
 */
export async function assertOkResponse (res, errorMsg) {
  if (res.ok) return

  let body
  try {
    body = await res.text()
  } catch {}
  const err = new Error(`${errorMsg ?? 'Fetch failed'} (${res.status}): ${body?.trimEnd()}`)
  err.statusCode = res.status
  err.serverMessage = body
  throw err
}

/**
 * @param {Response} res
 * @param {string} [errorMsg]
 */
export async function assertRedirectResponse (res, errorMsg) {
  if ([301, 302, 303, 304, 307, 308].includes(res.status)) {
    const location = res.headers.get('location')
    if (!location) {
      const msg = 'The server response is missing the Location header. Headers found:\n' +
         Array.from(res.headers.keys()).join('\n')
      throw new AssertionError(msg)
    }
    return location
  }

  let body
  try {
    body = await res.text()
  } catch {}
  const err = new Error(`${errorMsg ?? 'Server did not respond with redirection'} (${res.status}): ${body?.trimEnd()}`)
  err.statusCode = res.status
  err.serverMessage = body
  throw err
}
