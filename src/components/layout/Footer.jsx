import { Link } from 'react-router-dom'
import Container from './Container'
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram
} from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <Container>
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">
              ShopCart
            </h3>
            <p className="text-sm text-gray-400">
              Simple. Reliable. Affordable shopping for everyone.
            </p>

            <div className="flex gap-3 mt-4">
              <a className="hover:text-white" href="#"><FaFacebookF /></a>
              <a className="hover:text-white" href="#"><FaTwitter /></a>
              <a className="hover:text-white" href="#"><FaInstagram /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white">All Products</Link></li>
              <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-medium mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              {/* <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li> */}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium mb-3">Contact</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                +91 8010809489
              </p>
              <p className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                support@shopcart.com
              </p>
              <p className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />410 4th Floor , Mehta Chamber, opp. Railway Station, above Shabri Hotel, Nalasopara East, Mumbai, Maharashtra 401209
              </p>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 ShopCart. All rights reserved.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
