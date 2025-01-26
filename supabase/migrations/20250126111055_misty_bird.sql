/*
  # TravelNest Initial Schema

  1. New Tables
    - `profiles`
      - User profiles for both travelers and agencies
      - Stores basic user information and role
    - `packages`
      - Travel packages offered by agencies
      - Includes pricing, descriptions, and availability
    - `bookings`
      - Records of package bookings
      - Links travelers with packages
    - `reviews`
      - User reviews and ratings for packages
    
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Ensure data privacy and security
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('traveler', 'agency');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  role user_role NOT NULL DEFAULT 'traveler',
  avatar_url text,
  company_name text,
  company_description text,
  verification_status boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  location text NOT NULL,
  duration_days integer NOT NULL,
  max_travelers integer NOT NULL,
  image_urls text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES packages(id) NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  booking_date timestamptz DEFAULT now(),
  traveler_count integer NOT NULL,
  total_price decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES packages(id) NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Packages policies
CREATE POLICY "Packages are viewable by everyone"
  ON packages FOR SELECT
  USING (true);

CREATE POLICY "Agencies can insert their own packages"
  ON packages FOR INSERT
  WITH CHECK (auth.uid() = agency_id);

CREATE POLICY "Agencies can update their own packages"
  ON packages FOR UPDATE
  USING (auth.uid() = agency_id);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'agency' THEN 'agency'::user_role 
      ELSE 'traveler'::user_role 
    END
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();