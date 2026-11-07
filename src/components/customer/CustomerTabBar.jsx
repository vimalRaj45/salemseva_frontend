import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { House, ReceiptText, Wallet, LifeBuoy } from 'lucide-react';

/**
 * The phone's primary navigation.
 *
 * Before this existed the app had a top navbar plus a drawer on mobile, and three
 * pages each rendered their own three-tab bottom bar with different labels and
 * colours. One bar now owns the role, it reads its active state from the route, and
 * it sits above the home indicator through --sab.
 */

const TABS = [
  { key: 'home', label: 'Home', to: '/', Icon: House, matches: (p) => p === '/' },
  { key: 'bookings', label: 'Bookings', to: '/history', Icon: ReceiptText, matches: (p) => p.startsWith('/history') },
  { key: 'wallet', label: 'Wallet', to: '/wallet', Icon: Wallet, matches: (p) => p.startsWith('/wallet') },
  { key: 'help', label: 'Help', to: '/support', Icon: LifeBuoy, matches: (p) => p.startsWith('/support') }
];

export default function CustomerTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasLiveJob, setHasLiveJob] = useState(false);

  // A live job is the one thing worth flagging from the tab bar: the customer is
  // mid-service and should be able to get back to it in one tap.
  useEffect(() => {
    const read = () => {
      try {
        setHasLiveJob(Boolean(localStorage.getItem('shazuone_active_booking')));
      } catch (_) {
        setHasLiveJob(false);
      }
    };
    read();
    window.addEventListener('shazuone:active-booking-changed', read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener('shazuone:active-booking-changed', read);
      window.removeEventListener('storage', read);
    };
  }, [location.pathname]);

  return (
    <nav className="cz-tabbar" aria-label="Primary navigation">
      {TABS.map(({ key, label, to, Icon, matches }) => {
        const isActive = matches(location.pathname);
        const showDot = key === 'bookings' && hasLiveJob && !isActive;

        return (
          <button
            key={key}
            type="button"
            className="cz-tabbar__item"
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
            onClick={() => {
              if (!isActive) navigate(to);
            }}
          >
            <span className="cz-tabbar__icon" aria-hidden="true" style={{ position: 'relative' }}>
              <Icon size={21} strokeWidth={isActive ? 2.4 : 1.9} />
              {showDot && <span className="cz-tabbar__dot" aria-hidden="true" />}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
