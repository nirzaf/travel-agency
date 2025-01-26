import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Calendar, Users, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  duration_days: number;
  max_travelers: number;
  image_urls: string[];
  amenities: string[];
  start_date: string;
  end_date: string;
}

export default function PackageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [travelers, setTravelers] = useState(2);
  const { user } = useAuth();

  useEffect(() => {
    if (id) fetchPackage();
  }, [id]);

  async function fetchPackage() {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPkg(data);
    } catch (error) {
      console.error('Error fetching package:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-12">Loading package details...</div>;
  if (!pkg) return <div className="text-center py-12">Package not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image Gallery */}
        <div className="relative h-96">
          <img
            src={pkg.image_urls[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'}
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{pkg.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                {pkg.location}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">${pkg.price}</p>
              <p className="text-gray-600">per person</p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="font-semibold">{pkg.duration_days} days</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-semibold">{new Date(pkg.start_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-gray-600">Max Travelers</p>
                <p className="font-semibold">{pkg.max_travelers} people</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">About this package</h2>
            <p className="text-gray-600 whitespace-pre-line">{pkg.description}</p>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What's included</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pkg.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <Star className="h-5 w-5 text-blue-600 mr-2" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Section */}
          <div className="border-t pt-8">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">Book this package</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Number of Travelers</label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full h-12 border rounded-md"
                >
                  {[...Array(pkg.max_travelers)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'Traveler' : 'Travelers'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Total Price</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${pkg.price * travelers}
                </span>
              </div>
              <button
                onClick={() => {
                  if (!user) {
                    window.location.href = '/auth';
                    return;
                  }
                  // Handle booking
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                {user ? 'Book Now' : 'Sign in to Book'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}