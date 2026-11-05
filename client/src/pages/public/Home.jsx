import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Wrench,
  Tv,
  Sparkles,
  Hammer,
  Paintbrush,
  Car,
  ChevronRight,
  UserCheck,
  Award,
  ThumbsUp,
} from 'lucide-react';
import api from '../../services/api';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Guntur');
  const [categories, setCategories] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map category icons
  const getCategoryIcon = (name) => {
    switch (name) {
      case 'Electrician':
        return <Zap size={22} className="text-amber-500" />;
      case 'Plumbing':
        return <Wrench size={22} className="text-blue-500" />;
      case 'AC & Appliance Repair':
        return <Tv size={22} className="text-teal-500" />;
      case 'Home Deep Cleaning':
        return <Sparkles size={22} className="text-purple-500" />;
      case 'Carpentry':
        return <Hammer size={22} className="text-orange-500" />;
      case 'Painting & Wall Care':
        return <Paintbrush size={22} className="text-rose-500" />;
      default:
        return <Wrench size={22} className="text-teal-600" />;
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, provRes, servRes] = await Promise.all([
          api.get('/categories'),
          api.get('/providers?limit=4'),
          api.get('/services?limit=6'),
        ]);

        if (catRes.data.success) setCategories(catRes.data.categories);
        if (provRes.data.success) setFeaturedProviders(provRes.data.providers);
        if (servRes.data.success) setPopularServices(servRes.data.services);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedLocation && selectedLocation !== 'all') params.append('location', selectedLocation);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-16 pb-24 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ShieldCheck size={14} className="text-teal-400" />
            <span>Serving Guntur, Vijayawada & Amaravati Region</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight mb-6">
            Find Trusted Local Experts <span className="text-teal-400">Near You</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Book certified electricians, plumbers, AC mechanics, and home cleaning specialists with transparent pricing and real customer reviews.
          </p>

          {/* 2. Interactive Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-2 sm:p-3 rounded-2xl shadow-2xl shadow-navy-950/50 max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-2 border border-slate-200"
          >
            {/* Service Input */}
            <div className="flex items-center gap-3 px-3 py-2 w-full flex-1">
              <Search size={20} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="What service do you need? (e.g. Electrician, AC repair...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            <div className="hidden md:block h-8 w-px bg-slate-200"></div>

            {/* Location Selector */}
            <div className="flex items-center gap-3 px-3 py-2 w-full md:w-56">
              <MapPin size={20} className="text-teal-600 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="Guntur">Guntur (All Areas)</option>
                <option value="Brodipet">Brodipet</option>
                <option value="Arundelpet">Arundelpet</option>
                <option value="Lakshmipuram">Lakshmipuram</option>
                <option value="Syamala Nagar">Syamala Nagar</option>
                <option value="Amaravati">Amaravati</option>
                <option value="all">Any Location</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              Search Experts <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Trending in Guntur:</span>
            {['Fan Fitting', 'AC Jet Service', 'Pipe Leakage', 'Home Cleaning'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchTerm(tag);
                  navigate(`/services?search=${encodeURIComponent(tag)}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-navy-800/80 hover:bg-navy-700 text-teal-300 font-medium transition-colors border border-navy-700"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Popular Service Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Explore Our Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
              Popular Service Categories
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 group"
          >
            All Services <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading categories..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/services?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors shadow-inner">
                  {getCategoryIcon(cat.name)}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-navy-900 group-hover:text-teal-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    {cat.serviceCount || 'Active'} offerings
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Popular Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Top Booked Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
              Recommended Services
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 group"
          >
            Explore all {popularServices.length}+ services <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                    {service.categoryId?.name || 'General Service'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock size={12} /> {service.estimatedDuration}
                  </span>
                </div>

                <h3 className="text-base font-bold text-navy-900 mb-2 leading-snug line-clamp-1">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {/* Provider Mini Info */}
                {service.providerId && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Provider</span>
                      <span className="font-bold text-slate-800">
                        {service.providerId.businessName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star size={14} className="fill-amber-400" />
                      <span>{service.providerId.averageRating?.toFixed(1) || '5.0'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price and Action Footer */}
              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Standard Rate</span>
                  <span className="text-lg font-black text-navy-900">₹{service.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/services/${service._id}`}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-navy-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Details
                  </Link>
                  <Link
                    to={`/book/${service._id}`}
                    className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Verified Providers */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Verified Partners
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
              Top Rated Providers in Guntur
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              All providers undergo rigorous credential and background verification before joining ServeEase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProviders.map((provider) => (
              <div
                key={provider._id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-navy-900 text-teal-400 font-bold flex items-center justify-center text-base shadow-sm">
                      {provider.businessName.charAt(0)}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-navy-900 mb-1 line-clamp-1">
                    {provider.businessName}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                    {provider.description}
                  </p>

                  <div className="mb-3">
                    <StarRating rating={provider.averageRating} totalReviews={provider.totalReviews} size={13} />
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Award size={13} className="text-teal-600 shrink-0" />
                      <span>{provider.experience}+ Years Experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-teal-600 shrink-0" />
                      <span className="truncate">{provider.serviceAreas?.slice(0, 3).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/providers/${provider._id}`}
                  className="w-full text-center py-2.5 text-xs font-bold text-navy-900 hover:text-white bg-slate-100 hover:bg-navy-900 rounded-xl transition-all"
                >
                  View Profile & Rates
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How ServeEase Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
            How ServeEase Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Connecting you to reputable specialists in less than 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {[
            {
              step: '01',
              title: 'Discover & Compare',
              description: 'Search electricians, plumbers, and technicians. Compare transparent prices and real customer reviews.',
              icon: Search,
            },
            {
              step: '02',
              title: 'Pick Date & Slot',
              description: 'Select an open appointment slot that fits your schedule with zero overlapping booking conflicts.',
              icon: Clock,
            },
            {
              step: '03',
              title: 'Doorstep Execution',
              description: 'A verified professional arrives on-time with specialized tools and executes high quality repairs.',
              icon: UserCheck,
            },
            {
              step: '04',
              title: 'Pay & Share Review',
              description: 'Inspect the completed work, pay cash or digital on completion, and leave a genuine verified review.',
              icon: ThumbsUp,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-teal-500/30">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <Icon size={18} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Why Choose ServeEase */}
      <section className="bg-navy-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                The ServeEase Promise
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 mb-6 leading-tight">
                Why Thousands of Homes Trust Us in Guntur & AP
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-8">
                We remove the guesswork and stress from hiring home service workers. Every provider is personally verified, rated honestly by previous customers, and held to professional service standards.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: '100% Background-Verified Specialists',
                    desc: 'Every technician is verified with identity credentials and past experience checks before listing services.',
                  },
                  {
                    title: 'Upfront & Transparent Pricing',
                    desc: 'No hidden surge pricing or surprises. Clear rate cards with fixed inspection fees and itemized quotes.',
                  },
                  {
                    title: 'On-Time Arrival Guarantee',
                    desc: 'Pick your preferred 2-hour window. Our providers confirm bookings directly and arrive punctually.',
                  },
                  {
                    title: 'Customer Satisfaction Protection',
                    desc: 'If a problem arises, our dedicated support desk and complaint resolution team ensures prompt resolution.',
                  },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <CheckCircle2 size={18} className="text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual metrics card */}
            <div className="bg-navy-950/70 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="p-4 bg-navy-900/80 rounded-2xl border border-slate-800">
                  <span className="text-3xl font-black text-teal-400 block mb-1">98.5%</span>
                  <span className="text-xs text-slate-300 font-medium">Customer Satisfaction</span>
                </div>
                <div className="p-4 bg-navy-900/80 rounded-2xl border border-slate-800">
                  <span className="text-3xl font-black text-teal-400 block mb-1">500+</span>
                  <span className="text-xs text-slate-300 font-medium">Jobs Completed</span>
                </div>
                <div className="p-4 bg-navy-900/80 rounded-2xl border border-slate-800">
                  <span className="text-3xl font-black text-teal-400 block mb-1">4.9 / 5</span>
                  <span className="text-xs text-slate-300 font-medium">Average Rating</span>
                </div>
                <div className="p-4 bg-navy-900/80 rounded-2xl border border-slate-800">
                  <span className="text-3xl font-black text-teal-400 block mb-1">&lt; 30 min</span>
                  <span className="text-xs text-slate-300 font-medium">Avg Request Response</span>
                </div>
              </div>

              <div className="p-5 bg-teal-950/40 border border-teal-500/20 rounded-2xl">
                <p className="text-xs text-teal-200 italic leading-relaxed">
                  "Found Ramesh Kumar for my home's circuit tripping issue in Brodipet within 10 minutes. He arrived promptly, detected a burned neutral line, and fixed it safely. Great platform!"
                </p>
                <span className="block text-[11px] text-teal-400 font-bold mt-2">
                  — Rahul S., Brodipet, Guntur
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call To Action (For Customers and Providers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-navy-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-200 border border-white/10">
              Partner with ServeEase
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-3 mb-2 leading-tight">
              Are you a skilled technician or service business in AP?
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
              Grow your customer base in Guntur, Brodipet, Arundelpet and beyond. Manage bookings, set your prices, and build local reputation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-navy-900 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-100 transition-colors shadow-md text-center"
            >
              Register as Provider
            </Link>
            <Link
              to="/services"
              className="w-full sm:w-auto px-6 py-3.5 bg-navy-900/80 hover:bg-navy-950 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors border border-white/20 text-center"
            >
              Book a Service
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

