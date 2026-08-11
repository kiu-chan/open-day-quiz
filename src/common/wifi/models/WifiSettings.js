/**
 * The network visitors have to be on, and the QR string that puts them there.
 *
 * Two fields, no defaults worth the name: a network name cannot be guessed, and
 * **empty means "show no Wi-Fi code anywhere"** — the right setting for a stand
 * where the whole room is already on the network. That is why this is not part
 * of `HomeContent`, where an emptied field falls back to its original wording:
 * these are not words, they are the address of a thing outside the app, and the
 * two rules would fight.
 *
 * The password is stored and served in the clear, and printed on the projector
 * next to the code. That is not an oversight — it is a guest network handed out
 * to a hall of strangers, and a Wi-Fi QR code cannot work any other way.
 *
 * Both the browser and `server/wifiStore.js` normalise through
 * `wifiSettingsFromJSON`, so the file on disk and the props the views read hold
 * exactly the same shape.
 *
 * Public API: DEFAULT_WIFI, wifiSettingsFromJSON(raw), wifiQrValue(settings)
 */

export const DEFAULT_WIFI = {
  ssid: '',
  password: '',
}

/** Unknown keys are dropped and anything unusable becomes an empty string. */
export function wifiSettingsFromJSON(raw) {
  return {
    ssid: typeof raw?.ssid === 'string' ? raw.ssid.trim() : '',
    password: typeof raw?.password === 'string' ? raw.password.trim() : '',
  }
}

/**
 * The string a Wi-Fi QR code carries, or `null` when no network is configured —
 * which is what every surface tests to decide whether to draw the code at all.
 *
 * `WIFI:T:<auth>;S:<ssid>;P:<password>;;` is the de-facto format both iOS and
 * Android read straight from the camera. Two details are not decoration:
 * `;` `,` `:` `\` and `"` carry meaning inside it and have to be backslashed, or
 * a password containing one connects the phone to nothing; and the auth type
 * must be `nopass` on an open network, because a phone told `WPA` will sit there
 * asking for a password that does not exist.
 *
 * WEP is not offered. It has been broken for twenty years, no campus runs it,
 * and a third option on the form buys nothing.
 */
export function wifiQrValue({ ssid, password }) {
  if (!ssid) return null

  const escape = (text) => text.replace(/([\\;,:"])/g, '\\$1')

  return password
    ? `WIFI:T:WPA;S:${escape(ssid)};P:${escape(password)};;`
    : `WIFI:T:nopass;S:${escape(ssid)};;`
}
