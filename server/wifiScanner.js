/**
 * The list of Wi-Fi networks offered on the admin's Wi-Fi page.
 *
 * **A browser cannot do this.** There is no web API that lists the networks
 * around a device — for good reason, since SSIDs locate you. So the list is read
 * on the machine running the server, by asking the operating system, and that is
 * also the correct machine to ask: visitors have to end up on the network *this*
 * computer is on, not the one the admin's laptop can see from the other end of
 * the building.
 *
 * Every command is read-only and none of them can join, forget or change a
 * network. The list is a convenience, never a requirement — the page can always
 * be typed into, and it has to be, because a hidden network appears in no list
 * at all.
 *
 * **macOS deliberately asks the remembered networks, not the ones in range.**
 * Since Sonoma the system hands SSIDs out only to processes granted Location
 * Services, and node started from a terminal is not one: `ipconfig getsummary`
 * and `system_profiler SPAirPortDataType` both come back with every name
 * replaced by `<redacted>`, and `networksetup -getairportnetwork` claims the
 * machine is on no network at all. `-listpreferredwirelessnetworks` needs no
 * permission and returns real names, and the stand's network is nearly always
 * one this laptop has joined before. Linux and Windows scan for real.
 *
 * Public API: wifiScanner.list() → { networks, current, source }
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)

/** A command that hangs must not hang the admin page with it. */
const TIMEOUT_MS = 8_000

async function output(command, args) {
  try {
    const { stdout } = await run(command, args, { timeout: TIMEOUT_MS })
    return stdout
  } catch {
    // A missing command (no nmcli, no wifi card) is an ordinary outcome here,
    // not a failure worth a stack trace: the page falls back to typing.
    return ''
  }
}

/** macOS names its Wi-Fi card en0 on most machines, but not on all of them. */
async function macInterface() {
  const ports = await output('/usr/sbin/networksetup', ['-listallhardwareports'])
  const match = ports.match(/Hardware Port: Wi-Fi\s*\nDevice: (\w+)/)
  return match?.[1] ?? 'en0'
}

async function listMac() {
  const device = await macInterface()

  const remembered = await output('/usr/sbin/networksetup', [
    '-listpreferredwirelessnetworks',
    device,
  ])
  // The first line is a heading ("Preferred networks on en0:"), the rest are
  // indented names — and a name may contain anything, spaces included, so only
  // the indentation is stripped.
  const networks = remembered
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)

  const summary = await output('/usr/sbin/ipconfig', ['getsummary', device])
  const current = summary.match(/^\s*SSID\s*:\s*(.+)$/m)?.[1]?.trim()

  return {
    networks,
    // `<redacted>` is what the system returns without Location Services — it is
    // not a network name, and putting it in a QR code would be worse than
    // knowing nothing.
    current: current && !current.startsWith('<') ? current : null,
    source: 'remembered',
  }
}

async function listLinux() {
  const scan = await output('nmcli', ['-t', '-f', 'active,ssid', 'dev', 'wifi'])
  const networks = []
  let current = null

  for (const line of scan.split('\n')) {
    // `-t` is colon-separated and escapes colons inside the name with a
    // backslash, so the split is on the *first* colon only.
    const at = line.indexOf(':')
    if (at === -1) continue

    const ssid = line.slice(at + 1).replace(/\\:/g, ':').trim()
    if (!ssid || networks.includes(ssid)) continue

    networks.push(ssid)
    if (line.slice(0, at) === 'yes') current = ssid
  }

  return { networks, current, source: 'in-range' }
}

async function listWindows() {
  const scan = await output('netsh', ['wlan', 'show', 'networks'])
  const networks = [...scan.matchAll(/^SSID \d+\s*:\s*(.+)$/gm)]
    .map((match) => match[1].trim())
    .filter(Boolean)

  const state = await output('netsh', ['wlan', 'show', 'interfaces'])
  // `\bSSID` alone would match the BSSID line two rows below it.
  const current = state.match(/^\s*SSID\s*:\s*(.+)$/m)?.[1]?.trim() ?? null

  return { networks, current, source: 'in-range' }
}

export const wifiScanner = {
  /**
   * `source` says which question was answered — `in-range` for a real scan,
   * `remembered` for the networks this machine has joined before — because the
   * page has to be honest about it: a remembered network may be nowhere near.
   * An unknown platform, or a machine with no wireless card, returns an empty
   * list rather than an error, and the page's manual entry takes over.
   */
  async list() {
    if (process.platform === 'darwin') return await listMac()
    if (process.platform === 'linux') return await listLinux()
    if (process.platform === 'win32') return await listWindows()
    return { networks: [], current: null, source: 'none' }
  },
}
