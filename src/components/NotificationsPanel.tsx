import { useState } from 'react'
import ShieldCheckFillIcon from 'remixicon-react/ShieldCheckFillIcon'
import {
  defaultNotificationSettings,
  notificationScamWarning,
  notificationSettingLabel,
  type NotificationSetting,
  type NotificationSettingId,
} from '../data/notifications'

function NotificationToggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={`relative h-8 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${
        enabled ? 'bg-text-primary' : 'bg-border-secondary'
      }`}
    >
      <span
        className={`absolute top-1 size-6 rounded-full bg-bg-primary transition-transform ${
          enabled ? 'left-5' : 'left-1'
        }`}
        aria-hidden
      />
    </button>
  )
}

function NotificationRow({
  setting,
  onToggle,
}: {
  setting: NotificationSetting
  onToggle: () => void
}) {
  const label = notificationSettingLabel(setting.title, setting.enabled)

  return (
    <div className="flex items-center gap-4 border-b border-border-primary py-4">
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
          {label}
        </p>
        <p className="mt-2 text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
          {setting.description}
        </p>
      </div>
      <NotificationToggle enabled={setting.enabled} onChange={onToggle} label={label} />
    </div>
  )
}

export function NotificationsPanel() {
  const [settings, setSettings] = useState<NotificationSetting[]>(() =>
    defaultNotificationSettings.map((setting) => ({ ...setting })),
  )

  const toggleSetting = (settingId: NotificationSettingId) => {
    setSettings((current) =>
      current.map((setting) =>
        setting.id === settingId ? { ...setting, enabled: !setting.enabled } : setting,
      ),
    )
  }

  return (
    <div className="flex flex-col">
      <div className="px-0 py-4 lg:px-2 lg:py-4">
        <div className="flex items-center gap-4 rounded-2xl bg-green-light p-3">
          <ShieldCheckFillIcon className="size-6 shrink-0 text-primary-green" aria-hidden />
          <p className="text-base font-medium leading-5 tracking-[-0.32px] text-primary-green">
            {notificationScamWarning}
          </p>
        </div>
      </div>

      <div className="px-0 py-4 lg:px-2 lg:py-4">
        {settings.map((setting) => (
          <NotificationRow
            key={setting.id}
            setting={setting}
            onToggle={() => toggleSetting(setting.id)}
          />
        ))}
      </div>
    </div>
  )
}
