import { useLocation, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FloatingFeedback from './FloatingFeedback';
import GreetingBanner from './GreetingBanner';
import { useHoverActiveStyle } from '../hooks/useHoverStyle';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  const mindfulHover = useHoverActiveStyle<HTMLAnchorElement>(
    { background: 'var(--brand-dark)', transform: 'translateY(-2px)', boxShadow: '0 8px 28px rgba(158,172,202,0.55)' },
    { background: '#64749A', transform: 'translateY(0)', boxShadow: '0 4px 16px rgba(100,116,154,0.6)' },
    { background: 'var(--brand)', transform: 'none', boxShadow: '0 4px 20px rgba(158,172,202,0.45)' },
  );

  return (
    <div className="layout">
      <Header />
      <div className="container" style={{ paddingTop: '80px' }}>
        <GreetingBanner />
      </div>
      <main id="main" className="container">
        {children}
      </main>
      <Footer />
      <FloatingFeedback />
      {!isChatPage && (
        <Link
          to="/chat"
          title="Open AI Wellness Companion"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 20px 0 14px',
            height: '48px',
            borderRadius: '9999px',
            background: 'var(--brand)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            boxShadow: '0 4px 20px rgba(158,172,202,0.45)',
            zIndex: 1000,
            transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
          }}
          {...mindfulHover}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>💬</span>
          Ask MindfulMind
        </Link>
      )}
    </div>
  );
}
