'use client';

import { Home, BarChart3, Lightbulb } from 'lucide-react';
import { NavBar } from "@/components/ui/tubelight-navbar";

export default function Navbar() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3, authRequired: true },
    { name: 'Insights', url: '/insights', icon: Lightbulb, authRequired: true },
  ];

  return <NavBar items={navItems} />;
}

