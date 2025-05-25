"use client";

import React from "react";
import Link from "next/link";
import { SITE_CONFIG, NAVIGATION } from "../../constants";

export const Footer = () => {
  return (
    <footer className="bg-grunge-charcoal border-grunge-steel bg-noise border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="relative">
                <i className="fas fa-skull text-accent-electric text-2xl"></i>
                <i className="fas fa-bolt text-accent-fire absolute -right-1 -top-1 text-xs"></i>
              </div>
              <h3 className="font-grunge text-band-white text-xl">{SITE_CONFIG.name}</h3>
            </div>
            <p className="text-grunge-light leading-relaxed">{SITE_CONFIG.description}</p>
          </div>
          <div>
            <h4 className="font-metal text-accent-electric mb-4 text-sm font-semibold uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="text-grunge-light space-y-3 text-sm">
              {NAVIGATION.footer.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-accent-electric group flex items-center transition-colors duration-300"
                  >
                    <i className="fas fa-angle-right group-hover:text-accent-electric mr-2 text-xs transition-colors"></i>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-metal text-accent-electric mb-4 text-sm font-semibold uppercase tracking-wider">
              Join the Underground
            </h4>
            <div className="flex space-x-6">
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-grunge-light hover:text-accent-electric group transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-2xl group-hover:animate-pulse"></i>
              </a>
              <a
                href={SITE_CONFIG.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-grunge-light hover:text-accent-electric group transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter text-2xl group-hover:animate-pulse"></i>
              </a>
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-grunge-light hover:text-accent-electric group transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook text-2xl group-hover:animate-pulse"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-metal text-accent-electric mb-4 text-sm font-semibold uppercase tracking-wider">
              Stay in the Loop
            </h4>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email for underground updates"
                className="input-grunge"
              />
              <button type="submit" className="btn-electric">
                <i className="fas fa-paper-plane mr-2"></i>
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="border-grunge-steel text-grunge-fog mt-12 border-t pt-8 text-center text-sm">
          <p className="font-metal">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved. Keep it
            underground.
          </p>
          <div className="mt-3 flex justify-center space-x-6">
            {NAVIGATION.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:text-accent-electric transition-colors duration-300"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
