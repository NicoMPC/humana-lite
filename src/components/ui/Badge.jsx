import { DIAG_TYPES } from '../../data/constants';

export function Badge({ tone, icon, dot = false, outline = false, children, className = '', ...rest }) {
  const cls = ['badge', tone && `badge-${tone}`, dot && 'badge-dot', outline && 'badge-outline', className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {icon && <i className={icon} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function TypeBadge({ type, outline = true }) {
  const t = DIAG_TYPES[type] || DIAG_TYPES.peau;
  return <Badge tone={t.color} outline={outline} icon={t.icon}>{t.label}</Badge>;
}
