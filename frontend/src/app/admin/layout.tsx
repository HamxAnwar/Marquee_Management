"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Building2, 
  ChefHat, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  SparklesIcon
} from 'lucide-react';
import { APP_NAME } from '@/constants';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useLogout, useCurrentUser } from '@/hooks/use-auth';
import { getRefreshToken } from '@/lib/api-client';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: 'Halls',
    href: '/admin/halls',
    icon: Building2,
    current: false,
  },
  {
    name: 'Menu',
    href: '/admin/menu',
    icon: ChefHat,
    current: false,
  },
  {
    name: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
    current: false,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    current: false,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { data: user } = useCurrentUser();

  // Don't protect the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      logoutMutation.mutate(refreshToken);
    } else {
      // If no refresh token, just clear local storage and redirect
      logoutMutation.mutate('');
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'staff']}>
      <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-sm font-bold text-gray-900">{APP_NAME}</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user ? `${user.first_name} ${user.last_name}` : 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'admin@marquee.com'}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="ml-2 text-lg font-semibold text-gray-900">
                {navigation.find(item => pathname === item.href || pathname.startsWith(item.href + '/'))?.name || 'Admin'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>

              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {user ? `${user.first_name[0]}${user.last_name[0]}` : 'AD'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user ? `${user.first_name} ${user.last_name}` : 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
      </div>
    </ProtectedRoute>
  );
}
