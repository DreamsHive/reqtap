export interface NavItem {
  label: string
  icon: string
  to: string
}

// Primary + secondary navigation, mirrors the Figma sidebar.
export const primaryNav: NavItem[] = [
  { label: 'Overview', icon: 'i-lucide-layout-grid', to: '/app' },
  { label: 'Requests', icon: 'i-lucide-inbox', to: '/app/inspector' },
  { label: 'Endpoints', icon: 'i-lucide-webhook', to: '/app/endpoints' },
  { label: 'Replays', icon: 'i-lucide-repeat', to: '/app/replays' },
]

export const secondaryNav: NavItem[] = [
  { label: 'API keys', icon: 'i-lucide-key-round', to: '/app/settings/api-keys' },
  { label: 'Team', icon: 'i-lucide-users', to: '/app/settings/team' },
  { label: 'Notifications', icon: 'i-lucide-bell', to: '/app/settings/notifications' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/app/settings' },
]
