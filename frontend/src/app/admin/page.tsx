import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect /admin to /admin (dashboard)
  // Since this is already the admin dashboard, just show the dashboard content
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to the Marquee Management System</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Halls</h3>
          <p className="text-3xl font-bold text-green-600">4</p>
          <p className="text-sm text-gray-500 mt-1">Available venues</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue</h3>
           <p className="text-3xl font-bold text-purple-600">PKR 2.4L</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Menu Items</h3>
          <p className="text-3xl font-bold text-orange-600">45</p>
          <p className="text-sm text-gray-500 mt-1">Available dishes</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a 
            href="/admin/bookings" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium">New Booking</h4>
            <p className="text-sm text-gray-500">Create booking</p>
          </a>
          
          <a 
            href="/admin/halls" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium">Manage Halls</h4>
            <p className="text-sm text-gray-500">View & edit halls</p>
          </a>
          
          <a 
            href="/admin/menu" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium">Menu Items</h4>
            <p className="text-sm text-gray-500">Manage menu</p>
          </a>
          
          <a 
            href="/admin/users" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium">User Management</h4>
            <p className="text-sm text-gray-500">Manage users</p>
          </a>
        </div>
      </div>
    </div>
  );
}