'use client';

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2024)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const footerLinks = {
    'Buy Cars': [
      { name: 'Used Cars', href: '/cars/used' },
      { name: 'New Cars', href: '/cars/new' },
      { name: 'Certified Cars', href: '/cars/certified' },
      { name: 'Car Reviews', href: '/reviews' },
      { name: 'Compare Cars', href: '/compare' },
    ],
    'Sell Cars': [
      { name: 'Sell Your Car', href: '/sell' },
      { name: 'Free Valuation', href: '/valuation' },
      { name: 'Selling Tips', href: '/tips/selling' },
      { name: 'Pricing Guide', href: '/pricing' },
      { name: 'Upload Photos', href: '/sell/photos' },
    ],
    'Services': [
      { name: 'Car Finance', href: '/finance' },
      { name: 'Car Insurance', href: '/insurance' },
      { name: 'Extended Warranty', href: '/warranty' },
      { name: 'Vehicle Inspection', href: '/inspection' },
      { name: 'Car History Report', href: '/history' },
    ],
    'Company': [
      { name: 'About Us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' },
    ],
    'Support': [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety Tips', href: '/safety' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  }

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">KC</span>
                </div>
                <div>
                  <span className="text-lg font-bold">Kenya</span>
                  <span className="text-lg font-bold text-primary-400">Cars</span>
                </div>
              </div>
              
              <p className="text-secondary-300 mb-4 leading-relaxed text-sm">
                Kenya's premier online marketplace for buying and selling new and used cars. 
                Find the best deals from trusted dealers and private sellers across the country.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3 text-primary-400" />
                  <span className="text-secondary-300 text-sm">+254 700 123 456</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-primary-400" />
                  <span className="text-secondary-300 text-sm">info@kenyacars.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 text-primary-400" />
                  <span className="text-secondary-300 text-sm">Nairobi, Kenya</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-semibold text-white mb-3 text-sm">{category}</h3>
                <ul className="space-y-1.5">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-secondary-800 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            {/* Copyright */}
            <div className="text-secondary-400 text-xs">
              © {currentYear} Kenya Car Marketplace. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              <span className="text-secondary-400 text-xs">Follow us:</span>
              <div className="flex space-x-2">
                <Link
                  href="https://facebook.com/kenyacarmarketplace"
                  className="text-secondary-400 hover:text-primary-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="w-4 h-4" />
                </Link>
                <Link
                  href="https://twitter.com/kenyacarmarket"
                  className="text-secondary-400 hover:text-primary-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-4 h-4" />
                </Link>
                <Link
                  href="https://instagram.com/kenyacarmarketplace"
                  className="text-secondary-400 hover:text-primary-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-3 text-xs">
              <Link
                href="/terms"
                className="text-secondary-400 hover:text-primary-400 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-secondary-400 hover:text-primary-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/cookies"
                className="text-secondary-400 hover:text-primary-400 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}