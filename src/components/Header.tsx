import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: '운영' },
  { to: '/settings', label: '그룹' },
  { to: '/schedules', label: '예약' },
  { to: '/remote', label: '로그인' },
];

export default function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <h1 className="text-base font-bold text-zinc-900">{title}</h1>
        <nav className="flex gap-1" aria-label="주요 메뉴">
          {TABS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
