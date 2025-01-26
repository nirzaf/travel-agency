import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, Calendar, CreditCard } from 'lucide-react';

interface Booking {
  id: string;
  package: {
    title: string;
    location: string;
    start_date: string;
    end_date: string;
  };
  booking_date: string;
  traveler_count: number;
  total_price: number;
  status: string;
  payment_status: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  async function fetchBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          package:packages (
            title,
            location,
            start_date,
            end_date
          )
        `)
        .eq('user_id', user?.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <div className="text-center py-12">Please sign in to view your dashboard</div>;
  if (loading) return <div className="text-center py-12">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-gray-600">Upcoming Trips</p>
              <p className="text-2xl font-bold">
                {bookings.filter(b => new Date(b.package.start_date) > new Date()).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold">
                ${bookings.reduce((sum, b) => sum + b.total_price, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">My Bookings</h2>
        </div>
        <div className="divide-y">
          {bookings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No bookings found. Start exploring our packages!
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{booking.package.title}</h3>
                    <p className="text-gray-600 mb-1">{booking.package.location}</p>
                    <p className="text-gray-600">
                      {new Date(booking.package.start_date).toLocaleDateString()} - 
                      {new Date(booking.package.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-600">${booking.total_price}</p>
                    <p className="text-sm text-gray-500">{booking.traveler_count} travelers</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}