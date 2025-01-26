import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Filter, MapPin, Calendar, Users } from 'lucide-react';

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  duration_days: number;
  image_urls: string[];
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Destination"
              className="pl-10 w-full h-12 border rounded-md"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              className="pl-10 w-full h-12 border rounded-md"
            />
          </div>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select className="pl-10 w-full h-12 border rounded-md">
              <option>Any Size</option>
              <option>1-2 Travelers</option>
              <option>3-5 Travelers</option>
              <option>6+ Travelers</option>
            </select>
          </div>
          <div>
            <select className="w-full h-12 border rounded-md">
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Duration: Shortest</option>
              <option>Duration: Longest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="text-center py-12">Loading packages...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Link key={pkg.id} to={`/packages/${pkg.id}`} className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={pkg.image_urls[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-xl font-semibold text-white">{pkg.title}</h3>
                    <p className="text-white/90">{pkg.location}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-2 line-clamp-2">{pkg.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-blue-600">${pkg.price}</p>
                    <p className="text-gray-500">{pkg.duration_days} days</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}