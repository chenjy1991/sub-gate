export interface NodeData {
  name: string
  address: string
  port: number
  protocol: string
  uuid: string | null
  alterId: number | null
  security: string | null
  network: string | null
  tls: number | null
  sni: string | null
  path: string | null
  host: string | null
  rawLink: string | null
  remark: string | null
  status: number | null
  sort: number | null
}

export interface ParseResult {
  success: NodeData[]
  failed: { line: number, raw: string, error: string }[]
}

function parseQuery(query: string | null): Record<string, string> {
  const params: Record<string, string> = {}
  if (!query) return params
  for (const pair of query.split('&')) {
    const eq = pair.indexOf('=')
    if (eq > 0) {
      params[pair.substring(0, eq)] = decodeURIComponent(pair.substring(eq + 1))
    }
  }
  return params
}

function decodeBase64(s: string): string {
  let padded = s
  const pad = padded.length % 4
  if (pad > 0) padded += '='.repeat(4 - pad)
  try {
    return Buffer.from(padded, 'base64').toString('utf-8')
  } catch {
    // URL-safe base64 fallback
    return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
  }
}

function decodeParam(s: string | undefined): string {
  if (!s) return ''
  return decodeURIComponent(s)
}

function makeNode(partial: Partial<NodeData>): NodeData {
  return {
    name: '',
    address: '',
    port: 0,
    protocol: '',
    uuid: null,
    alterId: 0,
    security: null,
    network: null,
    tls: 0,
    sni: null,
    path: null,
    host: null,
    rawLink: null,
    remark: null,
    status: 1,
    sort: 0,
    ...partial,
  }
}

function parseVmess(link: string): NodeData {
  const encoded = link.substring('vmess://'.length)
  const decoded = decodeBase64(encoded)
  const json = JSON.parse(decoded)

  const getStr = (key: string, def: string) => json[key] != null ? String(json[key]) : def
  const getInt = (key: string, def: number) => {
    const v = json[key]
    if (v == null) return def
    const n = Number(v)
    return isNaN(n) ? def : Math.floor(n)
  }

  return makeNode({
    protocol: 'vmess',
    name: getStr('ps', ''),
    address: getStr('add', ''),
    port: getInt('port', 0),
    uuid: getStr('id', ''),
    alterId: getInt('aid', 0),
    network: getStr('net', 'tcp'),
    security: getStr('scy', 'auto'),
    host: getStr('host', ''),
    path: getStr('path', ''),
    tls: getStr('tls', '').toLowerCase() === 'tls' ? 1 : 0,
    sni: getStr('sni', ''),
  })
}

function parseVless(link: string): NodeData {
  const url = new URL(link)
  const params = parseQuery(url.search.substring(1))

  const security = params.security ?? ''
  return makeNode({
    protocol: 'vless',
    uuid: url.username,
    address: url.hostname,
    port: Number(url.port),
    name: url.hash ? decodeURIComponent(url.hash.substring(1)) : '',
    network: params.type ?? 'tcp',
    security: params.encryption ?? 'none',
    tls: security.toLowerCase() === 'tls' || security.toLowerCase() === 'reality' ? 1 : 0,
    sni: params.sni ?? '',
    host: params.host ?? '',
    path: decodeParam(params.path),
  })
}

function parseTrojan(link: string): NodeData {
  const url = new URL(link)
  const params = parseQuery(url.search.substring(1))

  const security = params.security ?? 'tls'
  return makeNode({
    protocol: 'trojan',
    uuid: url.username,
    address: url.hostname,
    port: Number(url.port),
    name: url.hash ? decodeURIComponent(url.hash.substring(1)) : '',
    network: params.type ?? 'tcp',
    tls: security.toLowerCase() === 'tls' || security.toLowerCase() === 'reality' ? 1 : 0,
    sni: params.sni ?? '',
    host: params.host ?? '',
    path: decodeParam(params.path),
  })
}

function parseShadowsocks(link: string): NodeData {
  let rest = link.substring('ss://'.length)
  const node = makeNode({ protocol: 'ss' })

  // Extract fragment (name)
  const hashIdx = rest.lastIndexOf('#')
  if (hashIdx >= 0) {
    node.name = decodeURIComponent(rest.substring(hashIdx + 1))
    rest = rest.substring(0, hashIdx)
  }

  const atIdx = rest.indexOf('@')
  if (atIdx >= 0) {
    // SIP002: base64(method:password)@host:port
    const userInfo = rest.substring(0, atIdx)
    let hostPort = rest.substring(atIdx + 1)
    const slashIdx = hostPort.indexOf('/')
    if (slashIdx >= 0) hostPort = hostPort.substring(0, slashIdx)

    const decoded = decodeBase64(userInfo)
    const colonIdx = decoded.indexOf(':')
    if (colonIdx >= 0) {
      node.security = decoded.substring(0, colonIdx)
      node.uuid = decoded.substring(colonIdx + 1)
    }
    parseHostPort(node, hostPort)
  } else {
    // Legacy: base64(method:password@host:port)
    const decoded = decodeBase64(rest)
    const colonIdx = decoded.indexOf(':')
    const atIdx2 = decoded.indexOf('@')
    if (colonIdx >= 0 && atIdx2 > colonIdx) {
      node.security = decoded.substring(0, colonIdx)
      node.uuid = decoded.substring(colonIdx + 1, atIdx2)
      parseHostPort(node, decoded.substring(atIdx2 + 1))
    }
  }

  node.network = 'tcp'
  node.tls = 0
  return node
}

function parseHostPort(node: NodeData, hostPort: string) {
  const lastColon = hostPort.lastIndexOf(':')
  if (lastColon >= 0) {
    node.address = hostPort.substring(0, lastColon)
    node.port = parseInt(hostPort.substring(lastColon + 1), 10) || 0
  } else {
    node.address = hostPort
    node.port = 0
  }
}

function parseHysteria2(link: string): NodeData {
  const normalized = link.startsWith('hy2://') ? 'hysteria2://' + link.substring('hy2://'.length) : link
  const url = new URL(normalized)
  const params = parseQuery(url.search.substring(1))

  return makeNode({
    protocol: 'hysteria2',
    uuid: url.username,
    address: url.hostname,
    port: Number(url.port),
    name: url.hash ? decodeURIComponent(url.hash.substring(1)) : '',
    sni: params.sni ?? '',
    network: 'udp',
    tls: 1,
  })
}

function parseSingleLink(link: string): NodeData {
  if (link.startsWith('vmess://')) return parseVmess(link)
  if (link.startsWith('vless://')) return parseVless(link)
  if (link.startsWith('trojan://')) return parseTrojan(link)
  if (link.startsWith('ss://')) return parseShadowsocks(link)
  if (link.startsWith('hysteria2://') || link.startsWith('hy2://')) return parseHysteria2(link)
  throw new Error('不支持的协议: ' + link.substring(0, Math.min(link.length, 20)))
}

export function parseLinks(links: string): ParseResult {
  const success: NodeData[] = []
  const failed: ParseResult['failed'] = []
  const lines = links.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    try {
      const node = parseSingleLink(line)
      node.rawLink = line
      node.status = 1
      node.sort = 0
      success.push(node)
    } catch (e) {
      failed.push({
        line: i + 1,
        raw: line,
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }

  return { success, failed }
}
