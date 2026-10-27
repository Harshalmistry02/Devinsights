'use client';

import {
  BarChart3,
  Code2,
  Home,
  Lightbulb,
} from 'lucide-react';
import { NavBar } from "@/components/ui/tubelight-navbar";

export default function Navbar() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3, authRequired: true },
    { name: 'Repositories', url: '/repositories', icon: Code2, authRequired: true },
    { name: 'Insights', url: '/insights', icon: Lightbulb, authRequired: true },
  ];

  return <NavBar items={navItems} />;
}
