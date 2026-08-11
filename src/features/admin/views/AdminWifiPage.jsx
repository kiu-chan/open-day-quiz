import {
  Eraser,
  LoaderCircle,
  QrCode,
  Save,
  TriangleAlert,
  Wifi,
} from 'lucide-react'
import Button from '@common/views/Button.jsx'
import WifiQr from '@common/views/WifiQr.jsx'
import { useWifiController } from '../controllers/useWifiController.js'
import AdminShell from './components/AdminShell.jsx'
import NetworkPicker from './components/NetworkPicker.jsx'
import Panel from './components/Panel.jsx'
import SaveBadge from './components/SaveBadge.jsx'

const FIELD_CLASS =
  'border-border focus:border-accent-border text-text-h w-full rounded-xl border-2 px-4 py-2.5 text-base outline-none'

/**
 * A5 — the network visitors have to join, on its own page.
 *
 * It is not part of the home page editor even though its code is drawn there:
 * that page is words somebody writes once and rewords for the wording's sake,
 * this is the address of a thing in the room, retyped whenever the round moves
 * to a different hall. They are also read by different screens — the big screen
 * draws this code and none of that text.
 *
 * The password is shown in the clear, on purpose. It is printed on the projector
 * two minutes later; hiding it behind dots here would only make it easier to
 * save a typo.
 */
function AdminWifiPage() {
  const wifi = useWifiController()

  if (wifi.loadError) {
    return (
      <AdminShell current="wifi" title="Cannot reach the server">
        <Panel dashed className="items-start">
          <p className="flex items-center gap-2 text-base">
            <TriangleAlert className="size-5 shrink-0" aria-label="Error" />
            {wifi.loadError}
          </p>
          <p className="text-sm opacity-70">
            The Wi-Fi settings live on the game server — check that it is
            running, then reload the page.
          </p>
        </Panel>
      </AdminShell>
    )
  }

  if (wifi.isLoading) {
    return (
      <AdminShell current="wifi" title="Wi-Fi">
        <Panel dashed className="items-center py-14 text-center">
          <LoaderCircle
            className="text-text-h size-10 animate-spin"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-base">Loading…</p>
        </Panel>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      current="wifi"
      title="Wi-Fi"
      subtitle="The network visitors have to be on before they can reach the game. Saving it puts a second QR code on the big screen."
      actions={
        <>
          <SaveBadge state={wifi.saveState} />
          <Button variant="quiet" onClick={wifi.clear} disabled={!wifi.settings.ssid}>
            <Eraser className="size-4" aria-hidden="true" />
            Show no Wi-Fi code
          </Button>
          <Button
            variant="primary"
            disabled={!wifi.hasUnsavedChanges}
            onClick={wifi.save}
          >
            <Save className="size-4" aria-hidden="true" />
            Save
          </Button>
        </>
      }
    >
      <p className="border-border flex flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed px-5 py-4 text-sm">
        <Wifi className="size-4 shrink-0" aria-hidden="true" />
        <span>
          This has to be the network the <strong>computer running the server</strong>{' '}
          is on — the game exists nowhere else. Leave the name empty and no Wi-Fi
          code is shown anywhere, which is right when the whole room is already
          connected. Screens that are already open need a reload to pick up a
          change.
        </span>
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="The network" Icon={Wifi}>
          <label className="flex flex-col gap-2 text-sm" htmlFor="wifi-ssid">
            Network name (SSID)
            <input
              id="wifi-ssid"
              value={wifi.settings.ssid}
              placeholder="Pick one below, or type it here"
              onChange={(event) => wifi.setField('ssid', event.target.value)}
              className={FIELD_CLASS}
            />
            <span className="text-xs opacity-70">
              Exactly as the router spells it, capitals included — a phone will
              not find “open day” when the network is “Open Day”.
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm" htmlFor="wifi-password">
            Password
            <input
              id="wifi-password"
              value={wifi.settings.password}
              placeholder="Leave empty for an open network"
              onChange={(event) => wifi.setField('password', event.target.value)}
              className={`${FIELD_CLASS} font-mono`}
              autoComplete="off"
              spellCheck={false}
            />
            <span className="text-xs opacity-70">
              Shown in the clear because it goes on the projector anyway. Picking
              a network from the list cannot fill this in — no computer hands a
              stored password back.
            </span>
          </label>
        </Panel>

        <Panel title="What the hall will see" Icon={QrCode}>
          {wifi.saved.ssid ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <WifiQr
                ssid={wifi.saved.ssid}
                password={wifi.saved.password}
                size={200}
                className="text-sm"
              />
              {wifi.hasUnsavedChanges && (
                <p className="flex items-start gap-2 text-xs opacity-70">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-label="Warning" />
                  This is the saved code. Press Save to put your changes in it.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm">
              No network saved, so the big screen and the home page show the join
              code alone — exactly as they did before this page existed.
            </p>
          )}
        </Panel>
      </div>

      <NetworkPicker
        networks={wifi.networks}
        current={wifi.current}
        source={wifi.source}
        isScanning={wifi.isScanning}
        scanError={wifi.scanError}
        selected={wifi.settings.ssid}
        onPick={(ssid) => wifi.setField('ssid', ssid)}
        onRescan={wifi.scan}
      />
    </AdminShell>
  )
}

export default AdminWifiPage
