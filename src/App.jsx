import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Suspense, lazy } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { CurrencyProvider } from './context/CurrencyContext'
import Layout       from './components/layout/Layout'
import AuditLoading from './components/results/AuditLoading'
import { useAuditReport } from './hooks/useAuditReport'
import SEOMeta from './components/seo/SEOMeta'

const LandingPage      = lazy(() => import('./pages/LandingPage'))
const AuditPage        = lazy(() => import('./pages/AuditPage'))
const ResultsPage      = lazy(() => import('./pages/ResultsPage'))
const SharedAuditPage  = lazy(() => import('./pages/SharedAuditPage'))
const ROICalculatorPage = lazy(() => import('./pages/ROICalculatorPage'))
const ComparisonPage   = lazy(() => import('./pages/ComparisonPage'))
const BenchmarksPage   = lazy(() => import('./pages/BenchmarksPage'))

function AppRoutes() {
  const { report, loading, generate, clearReport, publicId } = useAuditReport()

  return (
    <Suspense fallback={<AuditLoading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"            element={<LandingPage />} />
          <Route path="/audit"       element={<AuditPage onGenerateReport={generate} reportLoading={loading} />} />
          <Route path="/results"     element={<ResultsPage report={report} loading={loading} onReset={clearReport} publicId={publicId} />} />
          <Route path="/shared/:publicId" element={<SharedAuditPage />} />
          <Route path="/calculator"  element={<ROICalculatorPage />} />
          <Route path="/compare"     element={<ComparisonPage />} />
          <Route path="/benchmarks"  element={<BenchmarksPage />} />
          <Route path="*"            element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <SEOMeta />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CurrencyProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
}

function NotFound() {
  return (
    <>
      <SEOMeta title="Page Not Found" noIndex />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="font-mono text-6xl mb-4" style={{ color: '#21262D' }}>404</div>
          <h1 className="font-display font-bold text-2xl mb-3" style={{ color: '#E6EDF3' }}>Page not found</h1>
          <p className="font-body text-sm mb-8" style={{ color: '#8B949E' }}>
            The page you're looking for doesn't exist.
          </p>
          <a href="/" className="btn-primary text-sm px-8 py-3 inline-flex">Go home</a>
        </div>
      </div>
    </>
  )
}
