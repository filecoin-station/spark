/**
 * @param {string} addr Multiaddr, e.g. `/ip4/127.0.0.1/tcp/80/http`
 * @returns {string} Parsed URI, e.g. `http://127.0.0.1:80`
 */
export function multiaddrToHttpUrl (addr) {
  const [, hostType, hostValue, ipProtocol, port, scheme, ...rest] = addr.split('/')

  if (ipProtocol !== 'tcp') {
    throw Object.assign(
      new Error(`Cannot parse "${addr}": unsupported protocol "${ipProtocol}"`),
      { code: 'UNSUPPORTED_MULTIADDR_PROTO' }
    )
  }

  if (scheme !== 'http' && scheme !== 'https') {
    throw Object.assign(
      new Error(`Cannot parse "${addr}": unsupported scheme "${scheme}"`),
      { code: 'UNSUPPORTED_MULTIADDR_SCHEME' }
    )
  }

  if (rest.length) {
    throw Object.assign(
      new Error(`Cannot parse "${addr}": too many parts`),
      { code: 'MULTIADDR_HAS_TOO_MANY_PARTS' }
    )
  }

  return `${scheme}://${getUriHost(hostType, hostValue)}${getUriPort(scheme, port)}`
}

function getUriHost (hostType, hostValue) {
  switch (hostType) {
    case 'ip4':
    case 'dns':
    case 'dns4':
    case 'dns6':
      return hostValue
    case 'ip6':
      // See https://superuser.com/a/367788/135774:
      // According to RFC2732, literal IPv6 addresses should be put inside square brackets in URLs
      return `[${hostValue}]`
  }

  throw Object.assign(
    new Error(`Unsupported multiaddr host type "${hostType}"`),
    { code: 'UNSUPPORTED_MULTIADDR_HOST_TYPE' }
  )
}

function getUriPort (scheme, port) {
  if (scheme === 'http' && port === '80') return ''
  if (scheme === 'https' && port === '443') return ''
  return `:${port}`
}
