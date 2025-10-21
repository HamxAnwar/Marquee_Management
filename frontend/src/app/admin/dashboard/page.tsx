"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Calendar,
  Users,
  Building2,
  ChefHat,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';

// Mock data - in real app this would come from API
const statsData = [
  {
    title: 'Total Bookings',
    value: '156',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Calendar,
    description: 'This month'
  },
  {
    title: 'Active Halls',
    value: '8',
    change: '+2',
    changeType: 'positive' as const,
    icon: Building2,
    description: 'Available venues'
  },
  {
    title: 'Menu Items',
    value: '87',
    change: '+5',
    changeType: 'positive' as const,
    icon: ChefHat,
    description: 'Active items'
  },
  {
    title: 'Revenue',
    value: '₹2.4M',
    change: '+18%',
    changeType: 'positive' as const,
    icon: DollarSign,
    description: 'This month'
  }
];

const monthlyBookingsData = [
  { month: 'Jan', bookings: 45, revenue: 180000 },
  { month: 'Feb', bookings: 52, revenue: 220000 },
  { month: 'Mar', bookings: 48, revenue: 195000 },
  { month: 'Apr', bookings: 61, revenue: 280000 },
  { month: 'May', bookings: 67, revenue: 320000 },
  { month: 'Jun', bookings: 58, revenue: 290000 },
];

const eventTypesData = [
  { name: 'Wedding', value: 45, color: '#8884d8' },
  { name: 'Corporate', value: 28, color: '#82ca9d' },
  { name: 'Birthday', value: 20, color: '#ffc658' },
  { name: 'Anniversary', value: 12, color: '#ff7c7c' },
  { name: 'Other', value: 8, color: '#8dd1e1' },
];

const recentBookings = [
  {
    id: 'BK123456',
    customer: 'Ahmad Khan',
    event: 'Wedding',
    hall: 'Main Hall',
    date: '2024-01-15',
    amount: '₹85,000',
    status: 'confirmed'
  },
  {
    id: 'BK123457',
    customer: 'Sarah Ahmed',
    event: 'Corporate Event',
    hall: 'Garden Hall',
    date: '2024-01-18',
    amount: '₹45,000',
    status: 'pending'
  },
  {
    id: 'BK123458',
    customer: 'Ali Hassan',
    event: 'Birthday Party',
    hall: 'Main Hall',
    date: '2024-01-20',
    amount: '₹32,000',
    status: 'confirmed'
  }
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your marquee business.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Bookings</CardTitle>
            <CardDescription>Booking trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyBookingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
            <CardDescription>Distribution of event types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {eventTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking requests</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{booking.customer}</span>
                    <Badge variant="outline" className="text-xs">
                      {booking.event}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.hall} • {booking.date}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-medium">{booking.amount}</div>
                  <Badge 
                    variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Today's overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Confirmed Bookings</span>
              </div>
              <span className="font-medium">24</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Pending Approval</span>
              </div>
              <span className="font-medium">7</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Requires Attention</span>
              </div>
              <span className="font-medium">3</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Today's Events</span>
              </div>
              <span className="font-medium">5</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyBookingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}