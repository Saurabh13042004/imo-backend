import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Pages
import Index from '@/pages/Index'
import Search from '@/pages/Search'
import ProductDetails from '@/pages/ProductDetails'
import Profile from '@/pages/Profile'
import Likes from '@/pages/Likes'
import Auth from '@/pages/Auth'
import Pricing from '@/pages/Pricing'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Faq from '@/pages/Faq'
import HowItWorks from '@/pages/HowItWorks'
import NotFound from '@/pages/NotFound'
import PaymentSuccess from '@/pages/PaymentSuccess'
import PaymentCanceled from '@/pages/PaymentCanceled'
import Checkout from '@/pages/Checkout'

// Layout
import './App.css'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<Search />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/likes" element={<Likes />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-canceled" element={<PaymentCanceled />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
