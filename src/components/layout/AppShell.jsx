import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCurrentUser, useStore } from '../../store/useStore';
import { fullName } from '../../lib/format';
import { Avatar, Button } from '../ui';

const NAV = [
  { to: '/', label: 'Nouveau document', icon: 'fa-solid fa-file-circle-plus', end: true },
  { to: '/archives', label: 'Archives', icon: 'fa-solid fa-box-archive' },
  { to: '/produits', label: 'Produits', icon: 'fa-solid fa-box-open' },
  { to: '/contenu', label: 'Contenu', icon: 'fa-solid fa-list-check' },
  { to: '/reglages', label: 'Réglages', icon: 'fa-solid fa-sliders' },
];

export const TITLES = [[/^\/$/, 'Nouveau document'], [/^\/archives/, 'Archives'], [/^\/produits/, 'Produits'], [/^\/contenu/, 'Contenu'], [/^\/reglages/, 'Réglages']];
export const pageLabel = (pathname) => TITLES.find(([re]) => re.test(pathname))?.[1] || 'Humana';

export function AppShell({ children }) {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useStore((s) => s.logout);
  const [scrolled, setScrolled] = useState(false);
  const wide = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [location.pathname]);

  const doLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo"><img src="./brand/logo-vert-crop.png" alt="Hu'mana – La Boutique" /></div>
        <nav className="nav-list" aria-label="Navigation principale">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
              <i className={item.icon} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <Avatar person={user} color={user.couleur} />
            <div className="grow">
              <div className="user-name truncate">{fullName(user)}</div>
              <div className="user-role">Gérante</div>
            </div>
            <Button variant="ghost" size="sm" icon="fa-solid fa-arrow-right-from-bracket" onClick={doLogout} aria-label="Changer de profil / se déconnecter" title="Se déconnecter" />
          </div>
        </div>
      </aside>

      <div className="main">
        <header className={`topbar ${scrolled ? 'is-scrolled' : ''}`}>
          <img className="topbar-logo" src="./brand/logo-vert-crop.png" alt="Hu'mana" />
          <div className="topbar-title"><span>Humana</span><i className="fa-solid fa-chevron-right" /><span style={{ color: 'var(--text)' }}>{pageLabel(location.pathname)}</span></div>
          <div className="topbar-actions">
            <Button variant="ghost" size="sm" icon="fa-solid fa-arrow-right-from-bracket" className="show-mobile" onClick={doLogout} aria-label="Se déconnecter" />
          </div>
        </header>
        <main className={`page ${wide ? 'page-wide' : ''}`} key={location.pathname}>{children}</main>
      </div>

      <nav className="bottom-nav" aria-label="Navigation mobile">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
            {({ isActive }) => (
              <button type="button" className={isActive ? 'is-active' : ''} tabIndex={-1}><i className={item.icon} />{item.label.replace('Nouveau document', 'Nouveau')}</button>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
