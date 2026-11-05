import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Star,
  SlidersHorizontal,
  X,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StarRating from '../../components/common/StarRating';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  // Data States
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch Categories for Filter
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Sync state if URL query params change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'all');
    setLocation(searchParams.get('location') || 'all');
  }, [searchParams]);

  // Fetch Services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category && category !== 'all') params.append('category', category);
      if (location && location !== 'all') params.append('location', location);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      if (sort) params.append('sort', sort);
      params.append('page', page);
      params.append('limit', 9);

      const res = await api.get(`/services?${params.toString()}`);
      if (res.data.success) {
        setServices(res.data.services);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [search, category, location, minPrice, maxPrice, minRating, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setLocation('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Professional Doorstep Assistance
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-900 mt-1">
          Explore Services in Guntur & AP
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Browse verified local providers, transparent prices, customer ratings, and instant appointment booking.
        </p>
      </div>

      {/* Search and Mobile Filter Toggle */}
      <div className="flex items-center gap-3 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by service name, task, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs text-slate-800"
          />
        </form>

        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden p-3 bg-white border border-slate-200 rounded-2xl text-slate-700 hover:text-navy-900 shadow-xs flex items-center gap-2 text-xs font-bold shrink-0"
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`lg:w-64 shrink-0 space-y-6 ${
            mobileFilterOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block'
              : 'hidden lg:block'
          }`}
        >
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 lg:hidden mb-4">
              <h3 className="font-bold text-navy-900 text-base">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Location Filter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-teal-600" /> Service Location
            </h4>
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Guntur & AP Locations</option>
              <option value="Guntur">Guntur City</option>
              <option value="Brodipet">Brodipet</option>
              <option value="Arundelpet">Arundelpet</option>
              <option value="Lakshmipuram">Lakshmipuram</option>
              <option value="Syamala Nagar">Syamala Nagar</option>
              <option value="Koretipadu">Koretipadu</option>
              <option value="Amaravati">Amaravati</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-3">
              Categories
            </h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  setCategory('all');
                  setPage(1);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-semibold transition-colors flex items-center justify-between ${
                  category === 'all'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                <span>{total}</span>
              </button>
              {categories.map((cat) => {
                const isSelected = category === cat.name || category === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => {
                      setCategory(cat.name);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl font-semibold transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[11px] opacity-80">{cat.serviceCount}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-3">
              Price Range (₹)
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-3">
              Minimum Provider Rating
            </h4>
            <div className="space-y-1 text-xs">
              {[
                { label: 'Any Rating', val: '' },
                { label: '4.5+ Stars Only', val: '4.5' },
                { label: '4.0+ Stars Only', val: '4.0' },
                { label: '3.5+ Stars Only', val: '3.5' },
              ].map((r) => (
                <button
                  key={r.val}
                  onClick={() => {
                    setMinRating(r.val);
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    minRating === r.val ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Clear All Filters
          </button>
        </aside>

        {/* Services Results Grid */}
        <div className="flex-1">
          {/* Top Sort Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-3">
            <p className="text-xs font-semibold text-slate-600">
              Showing <span className="text-navy-900 font-bold">{services.length}</span> of{' '}
              <span className="text-navy-900 font-bold">{total}</span> services found
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="text-xs font-semibold p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="newest">Newest Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Rated Provider</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Searching available services..." />
          ) : services.length === 0 ? (
            <EmptyState
              title="No services match your criteria"
              description="Try broadening your location, removing price constraints, or searching with another keyword."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-800 rounded-md border border-teal-200">
                        {service.categoryId?.name || 'Service'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={12} /> {service.estimatedDuration}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-navy-900 mb-1.5 group-hover:text-teal-600 transition-colors line-clamp-1">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Provider mini info */}
                    {service.providerId && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Provider</span>
                          <span className="font-bold text-slate-800 truncate block max-w-[140px]">
                            {service.providerId.businessName}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs justify-end">
                            <Star size={13} className="fill-amber-400" />
                            <span>{service.providerId.averageRating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {service.providerId.totalReviews || 0} reviews
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Starting Price</span>
                      <span className="text-base font-black text-navy-900">₹{service.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/services/${service._id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Info
                      </Link>
                      <Link
                        to={`/book/${service._id}`}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs"
                      >
                        Book Slot
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    p === page
                      ? 'bg-teal-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;

