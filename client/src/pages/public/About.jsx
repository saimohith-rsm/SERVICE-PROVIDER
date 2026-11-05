import React from 'react';
import { ShieldCheck, Heart, Award, Users, MapPin, CheckCircle2, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Intro */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Our Mission & Story
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-navy-900 mt-2 mb-4">
          Empowering Local Service Professionals in Guntur & AP
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          ServeEase was born from a simple observation: finding trustworthy, skilled electricians, plumbers, and technicians in Guntur required asking neighbors, dealing with unvetted workers, and uncertain pricing.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-base font-bold text-navy-900 mb-2">100% Verified Partners</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every technician is vetted for skill verification, identity proof, and residential legitimacy before their profile is approved by our admin team.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
            <Award size={24} />
          </div>
          <h3 className="text-base font-bold text-navy-900 mb-2">Fair, Transparent Pricing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upfront rate cards eliminate bargaining and surprises. You always know the standard base charges before booking a specialist.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="text-base font-bold text-navy-900 mb-2">Local Community First</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We directly uplift neighborhood tradespeople in Brodipet, Arundelpet, Lakshmipuram and nearby Andhra Pradesh regions by connecting them with continuous demand.
          </p>
        </div>
      </div>

      {/* Regional Focus */}
      <div className="bg-navy-900 text-white rounded-3xl p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Regional Operations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-4">
              Proudly Headquartered in Guntur, Andhra Pradesh
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Our regional operations center coordinates quick response times across all primary residential and commercial districts, ensuring technicians arrive within their scheduled 2-hour slots.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Brodipet', 'Arundelpet', 'Lakshmipuram', 'Syamala Nagar', 'Koretipadu', 'Vidyanagar', 'Amaravati'].map((area) => (
                <span key={area} className="px-3 py-1 bg-navy-800 text-teal-300 font-semibold rounded-lg border border-slate-700">
                  📍 {area}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 bg-navy-950/70 border border-slate-800 rounded-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-600/20 text-teal-400 flex items-center justify-center mx-auto mb-3">
              <Heart size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Our Core Commitment</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Never compromise on customer safety, punctuality, or craftsmanship.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

