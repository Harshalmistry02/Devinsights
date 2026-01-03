'use client';

import { Home, BarChart3, Lightbulb, Github } from 'lucide-react';
import { NavBar } from "@/components/ui/tubelight-navbar";

export default function Navbar() {
  const navItems = [
    { name: 'Features', url: '/features', icon: Home },
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { name: 'Insights', url: '/insights', icon: Lightbulb },
  ];

  return <NavBar items={navItems} />;
}
