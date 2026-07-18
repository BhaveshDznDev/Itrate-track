import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { useOrg } from '../../hooks/useOrg'
import { Avatar } from '../ui'
import {
  Inbox, Search, Layers, GitBranch, Rocket, Archive,
  ChevronDown, LogOut, Settings, Menu, X, Plus
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Pipeline', path: '/', icon: Layers },
  { label: 'Intake', path: '/intake', icon: Inbox },
  { label: 'Discovery', path: '/discovery', icon: Search },
  { label: 'Shaping', path: '/shaping', icon: GitBranch },
  { label: 'Delivery', path: '/delivery', icon: Rocket },
  { label: 'Live', path: '/live', icon: Rocket },
  { label: 'Retirement', path: '/retirement', icon: Archive },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const { org } = useOrg()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <div className="flex h-screen bg-surface-secondary overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-30 w-60 bg-surface border-r border-border-subtle flex flex-col',
          'transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Org header */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border-subtle flex-shrink-0">
          <div className="w-6 h-6 rounded bg-action flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {org?.name?.[0]?.toUpperCase() || 'I'}
            </span>
          </div>
          <span className="text-sm font-semibold text-ink truncate flex-1">
            {org?.name || 'IterateTrack'}
          </span>
          <ChevronDown className="w-4 h-4 text-ink-tertiary flex-shrink-0" />
        </div>

        {/* New item button */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => navigate('/intake/new')}
            className="w-full flex items-center gap-2 px-3 h-9 rounded-lg bg-action text-white text-sm font-medium hover:bg-action-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            New item
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const active = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-action/10 text-action'
                    : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-t border-border-subtle flex-shrink-0">
          <Avatar name={user?.user_metadata?.full_name || user?.email} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink truncate">
              {user?.user_metadata?.full_name || user?.email}
            </p>
            <p className="text-2xs text-ink-tertiary truncate">{user?.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/settings')}
              className="p-1.5 rounded text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border-subtle bg-surface lg:hidden flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-ink-secondary" />
          </button>
          <span className="text-sm font-semibold text-ink">{org?.name || 'IterateTrack'}</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
