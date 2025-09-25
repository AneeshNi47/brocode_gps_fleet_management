import { cn } from '../../lib/utils';

// Utility small components
export function Kbd({
  children
}: {
  children: React.ReactNode;
}) {
  return <kbd className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs text-muted-foreground bg-secondary">
      {children}
    </kbd>;
}
export function Badge({
  children,
  variant = 'default'
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'info';
}) {
  const color = variant === 'success' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : variant === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200' : variant === 'destructive' ? 'bg-rose-100 text-rose-700 border-rose-200' : variant === 'outline' ? 'bg-transparent text-foreground border-border' : variant === 'info' ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-gray-100 text-gray-700 border-gray-200';
  return <span className={cn('inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium', color)}>{children}</span>;
}
export function PillButton({
  children,
  icon,
  onClick,
  variant = 'primary',
  type = 'button'
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
}) {
  const style = variant === 'primary' ? 'bg-primary text-primary-foreground hover:opacity-90' : variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'hover:bg-muted text-foreground';
  return <button type={type} onClick={onClick} className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition', style)}>
      {icon}
      {children}
    </button>;
}
export function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>{children}</div>;
}
export function CardHeader({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex items-center justify-between p-4 border-b', className)}>{children}</div>;
}
export function CardContent({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('p-4', className)}>{children}</div>;
}


export function PhoneIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.11a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z"></path></svg>;
}
export function IdIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="8" x2="13" y2="8" /><line x1="7" y1="12" x2="10" y2="12" /><circle cx="17" cy="12" r="2" /></svg>;
}