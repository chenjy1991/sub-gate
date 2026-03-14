import type { NodeData } from './parser'
import { generateLink } from './generator'

function hasText(s: string | null | undefined): s is string {
  return s != null && s.trim().length > 0
}

export function generateBase64(nodes: NodeData[]): string {
  const lines = nodes
    .map(n => generateLink(n))
    .filter(l => l.length > 0)
    .join('\n')
  return Buffer.from(lines, 'utf-8').toString('base64')
}

export function generateClash(nodes: NodeData[], _name: string): string {
  const lines: string[] = []
  const w = (s: string) => lines.push(s)

  // General
  w('port: 7890')
  w('socks-port: 7891')
  w('allow-lan: false')
  w('mode: rule')
  w('log-level: info')
  w('unified-delay: true')
  w('external-controller: 127.0.0.1:9090')
  w('')

  // DNS
  w('dns:')
  w('  enable: true')
  w('  listen: 0.0.0.0:53')
  w('  enhanced-mode: fake-ip')
  w('  fake-ip-range: 198.18.0.1/16')
  w('  fake-ip-filter:')
  w("    - '*.lan'")
  w("    - '*.local'")
  w("    - 'localhost.ptlogin2.qq.com'")
  w('  nameserver:')
  w('    - https://doh.pub/dns-query')
  w('    - https://dns.alidns.com/dns-query')
  w('  fallback:')
  w('    - https://dns.cloudflare.com/dns-query')
  w('    - https://dns.google/dns-query')
  w('  fallback-filter:')
  w('    geoip: true')
  w('    geoip-code: CN')
  w('')

  // Proxies
  w('proxies:')
  const proxyNames: string[] = []
  for (const node of nodes) {
    const nodeName = node.name || 'node'
    proxyNames.push(nodeName)
    const protocol = node.protocol
    if (!protocol) continue

    switch (protocol) {
      case 'vmess': {
        w(`  - name: "${nodeName}"`)
        w('    type: vmess')
        w(`    server: ${node.address}`)
        w(`    port: ${node.port}`)
        w(`    uuid: ${node.uuid ?? ''}`)
        w(`    alterId: ${node.alterId ?? 0}`)
        w(`    cipher: ${node.security ?? 'auto'}`)
        if (node.tls === 1) w('    tls: true')
        if (hasText(node.sni)) w(`    servername: ${node.sni}`)
        if (hasText(node.network) && node.network !== 'tcp') {
          w(`    network: ${node.network}`)
          if (node.network === 'ws') {
            w('    ws-opts:')
            if (hasText(node.path)) w(`      path: ${node.path}`)
            if (hasText(node.host)) w(`      headers:\n        Host: ${node.host}`)
          }
        }
        break
      }
      case 'vless': {
        w(`  - name: "${nodeName}"`)
        w('    type: vless')
        w(`    server: ${node.address}`)
        w(`    port: ${node.port}`)
        w(`    uuid: ${node.uuid ?? ''}`)
        if (node.tls === 1) w('    tls: true')
        if (hasText(node.sni)) w(`    servername: ${node.sni}`)
        if (hasText(node.network) && node.network !== 'tcp') {
          w(`    network: ${node.network}`)
          if (node.network === 'ws') {
            w('    ws-opts:')
            if (hasText(node.path)) w(`      path: ${node.path}`)
            if (hasText(node.host)) w(`      headers:\n        Host: ${node.host}`)
          }
        }
        break
      }
      case 'trojan': {
        w(`  - name: "${nodeName}"`)
        w('    type: trojan')
        w(`    server: ${node.address}`)
        w(`    port: ${node.port}`)
        w(`    password: ${node.uuid ?? ''}`)
        if (hasText(node.sni)) w(`    sni: ${node.sni}`)
        if (hasText(node.network) && node.network !== 'tcp') {
          w(`    network: ${node.network}`)
        }
        break
      }
      case 'ss': {
        w(`  - name: "${nodeName}"`)
        w('    type: ss')
        w(`    server: ${node.address}`)
        w(`    port: ${node.port}`)
        w(`    cipher: ${node.security ?? 'aes-256-gcm'}`)
        w(`    password: ${node.uuid ?? ''}`)
        break
      }
      case 'hysteria2': {
        w(`  - name: "${nodeName}"`)
        w('    type: hysteria2')
        w(`    server: ${node.address}`)
        w(`    port: ${node.port}`)
        w(`    password: ${node.uuid ?? ''}`)
        if (hasText(node.sni)) w(`    sni: ${node.sni}`)
        break
      }
    }
  }

  // Proxy Groups
  w('')
  w('proxy-groups:')
  w('  - name: 节点选择')
  w('    type: select')
  w('    proxies:')
  w('      - 自动选优')
  for (const n of proxyNames) w(`      - "${n}"`)
  w('      - DIRECT')

  w('  - name: 自动选优')
  w('    type: url-test')
  w('    url: http://www.gstatic.com/generate_204')
  w('    interval: 300')
  w('    tolerance: 50')
  w('    proxies:')
  for (const n of proxyNames) w(`      - "${n}"`)

  w('  - name: 国内直连')
  w('    type: select')
  w('    proxies:')
  w('      - DIRECT')
  w('      - 节点选择')

  w('  - name: 广告拦截')
  w('    type: select')
  w('    proxies:')
  w('      - REJECT')
  w('      - DIRECT')

  w('  - name: 兜底策略')
  w('    type: select')
  w('    proxies:')
  w('      - 节点选择')
  w('      - 国内直连')
  w('      - DIRECT')

  // Rule Providers
  const cdnBase = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release'
  w('')
  w('rule-providers:')
  w('  reject:')
  w('    type: http')
  w('    behavior: domain')
  w(`    url: "${cdnBase}/reject.txt"`)
  w('    path: ./ruleset/reject.yaml')
  w('    interval: 86400')
  w('  direct:')
  w('    type: http')
  w('    behavior: domain')
  w(`    url: "${cdnBase}/direct.txt"`)
  w('    path: ./ruleset/direct.yaml')
  w('    interval: 86400')
  w('  cncidr:')
  w('    type: http')
  w('    behavior: ipcidr')
  w(`    url: "${cdnBase}/cncidr.txt"`)
  w('    path: ./ruleset/cncidr.yaml')
  w('    interval: 86400')
  w('  proxy:')
  w('    type: http')
  w('    behavior: domain')
  w(`    url: "${cdnBase}/proxy.txt"`)
  w('    path: ./ruleset/proxy.yaml')
  w('    interval: 86400')
  w('  telegramcidr:')
  w('    type: http')
  w('    behavior: ipcidr')
  w(`    url: "${cdnBase}/telegramcidr.txt"`)
  w('    path: ./ruleset/telegramcidr.yaml')
  w('    interval: 86400')

  // Rules
  w('')
  w('rules:')
  w('  - RULE-SET,reject,广告拦截')
  w('  - RULE-SET,direct,国内直连')
  w('  - RULE-SET,cncidr,国内直连')
  w('  - RULE-SET,proxy,节点选择')
  w('  - RULE-SET,telegramcidr,节点选择')
  w('  - GEOIP,CN,国内直连')
  w('  - MATCH,兜底策略')

  return lines.join('\n') + '\n'
}

export function generateSurge(nodes: NodeData[], _name: string): string {
  const lines: string[] = []
  const w = (s: string) => lines.push(s)

  w('[General]')
  w('loglevel = notify')
  w('skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, localhost, *.local')
  w('dns-server = 119.29.29.29, 223.5.5.5, system')
  w('')

  w('[Proxy]')
  w('DIRECT = direct')
  w('REJECT = reject')

  const proxyNames: string[] = []
  for (const node of nodes) {
    const nodeName = node.name || 'node'
    proxyNames.push(nodeName)
    const protocol = node.protocol
    if (!protocol) continue

    switch (protocol) {
      case 'vmess': {
        let line = `${nodeName} = vmess, ${node.address}, ${node.port}, username=${node.uuid ?? ''}`
        if (node.tls === 1) line += ', tls=true'
        if (hasText(node.sni)) line += `, sni=${node.sni}`
        if (node.network === 'ws') line += `, ws=true, ws-path=${hasText(node.path) ? node.path : '/'}`
        w(line)
        break
      }
      case 'trojan': {
        let line = `${nodeName} = trojan, ${node.address}, ${node.port}, password=${node.uuid ?? ''}`
        if (hasText(node.sni)) line += `, sni=${node.sni}`
        w(line)
        break
      }
      case 'ss': {
        w(`${nodeName} = ss, ${node.address}, ${node.port}, encrypt-method=${node.security ?? 'aes-256-gcm'}, password=${node.uuid ?? ''}`)
        break
      }
      case 'hysteria2': {
        let line = `${nodeName} = hysteria2, ${node.address}, ${node.port}, password=${node.uuid ?? ''}`
        if (hasText(node.sni)) line += `, sni=${node.sni}`
        w(line)
        break
      }
    }
  }

  const allProxies = proxyNames.join(', ')
  w('')
  w('[Proxy Group]')
  w(`节点选择 = select, 自动选优, ${allProxies}, DIRECT`)
  w(`自动选优 = url-test, ${allProxies}, url=http://www.gstatic.com/generate_204, interval=300, tolerance=50`)
  w('国内直连 = select, DIRECT, 节点选择')
  w('广告拦截 = select, REJECT, DIRECT')
  w('兜底策略 = select, 节点选择, 国内直连, DIRECT')

  const ruleBase = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge'
  w('')
  w('[Rule]')
  w(`RULE-SET,${ruleBase}/Advertising/Advertising.list,广告拦截`)
  w(`RULE-SET,${ruleBase}/ChinaMax/ChinaMax.list,国内直连`)
  w(`RULE-SET,${ruleBase}/Proxy/Proxy.list,节点选择`)
  w(`RULE-SET,${ruleBase}/Telegram/Telegram.list,节点选择`)
  w('GEOIP,CN,国内直连')
  w('FINAL,兜底策略')

  return lines.join('\n') + '\n'
}

export function generateQuantumultX(nodes: NodeData[]): string {
  const lines: string[] = []
  const w = (s: string) => lines.push(s)

  w('[server_local]')
  const tagNames: string[] = []
  for (const node of nodes) {
    const nodeName = node.name || 'node'
    tagNames.push(nodeName)
    const protocol = node.protocol
    if (!protocol) continue

    switch (protocol) {
      case 'vmess': {
        let line = `vmess=${node.address}:${node.port}, method=${node.security ?? 'auto'}, password=${node.uuid ?? ''}`
        if (node.tls === 1) line += ', obfs=over-tls'
        if (hasText(node.sni)) line += `, obfs-host=${node.sni}`
        line += `, tag=${nodeName}`
        w(line)
        break
      }
      case 'trojan': {
        let line = `trojan=${node.address}:${node.port}, password=${node.uuid ?? ''}, over-tls=true`
        if (hasText(node.sni)) line += `, tls-host=${node.sni}`
        line += `, tag=${nodeName}`
        w(line)
        break
      }
      case 'ss': {
        w(`shadowsocks=${node.address}:${node.port}, method=${node.security ?? 'aes-256-gcm'}, password=${node.uuid ?? ''}, tag=${nodeName}`)
        break
      }
    }
  }

  const allTags = tagNames.join(', ')
  w('')
  w('[policy]')
  w(`static=节点选择, 自动选优, ${allTags}, direct, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png`)
  w(`url-latency-benchmark=自动选优, ${allTags}, check-interval=300, tolerance=50, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png`)
  w('static=国内直连, direct, 节点选择, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China_Map.png')
  w('static=广告拦截, reject, direct, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Advertising.png')
  w('static=兜底策略, 节点选择, 国内直连, direct, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png')

  const ruleBase = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX'
  w('')
  w('[filter_remote]')
  w(`${ruleBase}/Advertising/Advertising.list, tag=广告拦截, force-policy=广告拦截, update-interval=86400, opt-parser=false, enabled=true`)
  w(`${ruleBase}/ChinaMax/ChinaMax.list, tag=国内直连, force-policy=国内直连, update-interval=86400, opt-parser=false, enabled=true`)
  w(`${ruleBase}/Proxy/Proxy.list, tag=节点选择, force-policy=节点选择, update-interval=86400, opt-parser=false, enabled=true`)
  w(`${ruleBase}/Telegram/Telegram.list, tag=Telegram, force-policy=节点选择, update-interval=86400, opt-parser=false, enabled=true`)

  w('')
  w('[filter_local]')
  w('geoip, cn, 国内直连')
  w('final, 兜底策略')

  return lines.join('\n') + '\n'
}
