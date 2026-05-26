import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useTheme } from '../../context/ThemeContext'

export default function Layout() {
  const { pathname } = useLocation()
  const { isDark }   = useTheme()
  const hideFooter   = pathname === '/audit' || pathname === '/results'

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ color: isDark ? '#E6EDF3' : '#1F2328' }}>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}
