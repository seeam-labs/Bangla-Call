import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Search, MapPin, ShieldCheck, Layers } from 'lucide-react';
import { Language } from '../types';
import { DISTRICTS_64, District } from '../data/districts';
import { BD_DIVISION_PATHS, MAP_WIDTH, MAP_HEIGHT, projectCoordinates } from '../data/bdMapPaths';

export const DIVISIONS = [
  { id: 'rangpur', nameBn: 'রংপুর', nameEn: 'Rangpur', geoName: 'Rangpur', color: '#F9A053', textColor: 'text-amber-600 dark:text-amber-400' },
  { id: 'rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi', geoName: 'Rajshahi', color: '#B8D960', textColor: 'text-lime-600 dark:text-lime-400' },
  { id: 'mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', geoName: 'Mymensingh', color: '#86C590', textColor: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet', geoName: 'Sylhet', color: '#A389D0', textColor: 'text-purple-600 dark:text-purple-400' },
  { id: 'dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka', geoName: 'Dhaka', color: '#68BB95', textColor: 'text-teal-600 dark:text-teal-400' },
  { id: 'khulna', nameBn: 'খুলনা', nameEn: 'Khulna', geoName: 'Khulna', color: '#FFE853', textColor: 'text-yellow-600 dark:text-yellow-400' },
  { id: 'barisal', nameBn: 'বরিশাল', nameEn: 'Barisal', geoName: 'Barishal', color: '#72BBE0', textColor: 'text-sky-600 dark:text-sky-400' },
  { id: 'chittagong', nameBn: 'চট্টগ্রাম', nameEn: 'Chittagong', geoName: 'Chattogram', color: '#E58A9F', textColor: 'text-pink-600 dark:text-pink-400' },
];

const NETWORK_LINKS: [string, string][] = [
  // Primary Trunk Lines from Dhaka (National Hub)
  ['dhaka', 'chattogram'],
  ['dhaka', 'sylhet'],
  ['dhaka', 'rajshahi'],
  ['dhaka', 'khulna'],
  ['dhaka', 'barishal'],
  ['dhaka', 'rangpur'],
  ['dhaka', 'mymensingh'],
  ['dhaka', 'cumilla'],
  ['dhaka', 'gazipur'],
  ['dhaka', 'tangail'],
  ['dhaka', 'faridpur'],
  
  // Division & Regional Ring Links
  ['chattogram', 'cox-s-bazar'],
  ['chattogram', 'feni'],
  ['chattogram', 'rangamati'],
  ['feni', 'cumilla'],
  ['cumilla', 'brahmanbaria'],
  ['brahmanbaria', 'habiganj'],
  ['habiganj', 'sylhet'],
  ['sylhet', 'maulvibazar'],
  ['sylhet', 'sunamganj'],
  ['mymensingh', 'netrokona'],
  ['mymensingh', 'jamalpur'],
  ['mymensingh', 'sherpur'],
  ['rangpur', 'dinajpur'],
  ['rangpur', 'kurigram'],
  ['rangpur', 'nilphamari'],
  ['rangpur', 'bogura'],
  ['bogura', 'rajshahi'],
  ['rajshahi', 'naogaon'],
  ['rajshahi', 'pabna'],
  ['rajshahi', 'natore'],
  ['pabna', 'kushtia'],
  ['kushtia', 'jashore'],
  ['jashore', 'khulna'],
  ['khulna', 'satkhira'],
  ['khulna', 'bagerhat'],
  ['khulna', 'barishal'],
  ['barishal', 'patuakhali'],
  ['barishal', 'bhola'],
  ['faridpur', 'gopalganj'],
  ['gopalganj', 'barishal'],
  ['tangail', 'sirajgonj'],
  ['sirajgonj', 'bogura'],
];

export const CoverageMap: React.FC<{ lang: Language }> = ({ lang }) => {
  const isBn = lang === 'bn';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [hoveredDistrict, setHoveredDistrict] = useState<District | null>(null);
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null);

  const getDivisionColor = (geoName: string) => {
    const nameLower = (geoName || '').toLowerCase();
    const div = DIVISIONS.find(
      (d) =>
        d.geoName.toLowerCase() === nameLower ||
        d.nameEn.toLowerCase() === nameLower ||
        (d.id === 'chittagong' && nameLower === 'chattogram') ||
        (d.id === 'barisal' && nameLower === 'barishal')
    );
    return div ? div.color : '#68BB95';
  };

  const filteredDistricts = useMemo(() => {
    return DISTRICTS_64.filter((d) => {
      const matchesSearch =
        d.nameBn.includes(searchQuery) ||
        d.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.divisionBn.includes(searchQuery) ||
        d.divisionEn.toLowerCase().includes(searchQuery.toLowerCase());

      const selDivLower = selectedDivision.toLowerCase();
      const matchesDivision =
        selectedDivision === 'all' ||
        d.divisionEn.toLowerCase() === selDivLower ||
        (selDivLower === 'chittagong' && d.divisionEn.toLowerCase() === 'chattogram') ||
        (selDivLower === 'chattogram' && d.divisionEn.toLowerCase() === 'chittagong') ||
        (selDivLower === 'barisal' && d.divisionEn.toLowerCase() === 'barishal') ||
        (selDivLower === 'barishal' && d.divisionEn.toLowerCase() === 'barisal');

      return matchesSearch && matchesDivision;
    });
  }, [searchQuery, selectedDivision]);

  return (
    <section id="coverage" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-y border-slate-200 dark:border-slate-800 relative transition-colors">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm border border-emerald-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isBn ? 'সারাদেশে ৬৪ জেলাতেই একটিভ নেটওয়ার্ক' : '100% Active Network Across All 64 Districts'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'সারাদেশে ৬৪ জেলায় বিটিআরসি অনুমোদিত ০৯৬৪৯ কাভারেজ' : 'Nationwide BTRC Licensed 09649 Coverage'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            {isBn
              ? 'বাংলাদেশের ৮টি বিভাগের প্রতিটি জেলায় বিটিআরসি অনুমোদিত উচ্চমানের জিরো-ল্যাটেন্সি ০৯৬৪৯ ভয়েস নেটওয়ার্ক।'
              : 'Delivering reliable 09649 calling service across every single district in Bangladesh with 99.99% network uptime.'}
          </p>
        </div>

        {/* Map & Directory Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Authentic Real Bangladesh Vector Map Card */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
            
            {/* Active Status Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isBn ? '৬৪/৬৪ জেলায় সম্পূর্ণ সক্রিয়' : '64/64 Districts Active'}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isBn ? 'বাংলাদেশের ইন্টারেক্টিভ মানচিত্র' : 'Interactive Bangladesh Map'}</span>
              </div>
            </div>

            {/* Interactive Clean Vector SVG Map Container */}
            <div className="relative w-full max-w-md sm:max-w-lg mx-auto my-2 flex items-center justify-center select-none overflow-visible">
              <svg
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                className="w-full h-auto drop-shadow-md overflow-visible"
              >
                {/* 8 Divisions SVG Paths */}
                {BD_DIVISION_PATHS.map((divPath) => {
                  const fillColor = getDivisionColor(divPath.name);
                  const isDivHovered = hoveredDivision === divPath.name;

                  return (
                    <path
                      key={divPath.name}
                      d={divPath.d}
                      fill={fillColor}
                      stroke={isDivHovered ? '#FFFFFF' : '#FFFFFF'}
                      strokeWidth={isDivHovered ? 2.2 : 1.2}
                      strokeLinejoin="round"
                      className="cursor-pointer transition-all duration-200 hover:brightness-110"
                      onMouseEnter={() => setHoveredDivision(divPath.name)}
                      onMouseLeave={() => setHoveredDivision(null)}
                      onClick={() => setSelectedDivision(divPath.name)}
                    />
                  );
                })}

                {/* Interconnected IP Telephony Network Lines & Animated Data Pulses */}
                <g className="pointer-events-none">
                  {NETWORK_LINKS.map(([fromId, toId], idx) => {
                    const fromDistrict = DISTRICTS_64.find(d => d.id === fromId || d.id === fromId.replace("-s-", "s"));
                    const toDistrict = DISTRICTS_64.find(d => d.id === toId || d.id === toId.replace("-s-", "s"));
                    if (!fromDistrict || !toDistrict) return null;

                    const [x1, y1] = projectCoordinates(fromDistrict.long, fromDistrict.lat);
                    const [x2, y2] = projectCoordinates(toDistrict.long, toDistrict.lat);

                    const isHighlighted =
                      hoveredDistrict?.id === fromDistrict.id ||
                      hoveredDistrict?.id === toDistrict.id;

                    const pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
                    const dur = `${2 + (idx % 5) * 0.6}s`;
                    const begin = `${(idx % 6) * 0.3}s`;

                    return (
                      <g key={`net-link-${fromId}-${toId}-${idx}`}>
                        {/* Base Network Line */}
                        <path
                          d={pathD}
                          stroke={isHighlighted ? '#10B981' : 'rgba(16, 185, 129, 0.45)'}
                          strokeWidth={isHighlighted ? 2.5 : 1.2}
                          strokeDasharray={isHighlighted ? 'none' : '3 3'}
                          className="transition-all duration-300"
                        />
                        {/* Animated Signal Pulse Dot Traveling Point-to-Point */}
                        <circle r={isHighlighted ? 3 : 2} fill={isHighlighted ? '#34D399' : '#10B981'} className="filter drop-shadow-[0_0_3px_#10B981]">
                          <animateMotion
                            path={pathD}
                            dur={dur}
                            begin={begin}
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    );
                  })}
                </g>

                {/* 64 District Geographic Markers overlay */}
                {DISTRICTS_64.map((district, index) => {
                  const [x, y] = projectCoordinates(district.long, district.lat);
                  const isHovered = hoveredDistrict?.id === district.id;
                  const isMainCity = ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal', 'rangpur', 'mymensingh'].includes(district.id);
                  const isFilteredIn = filteredDistricts.some((fd) => fd.id === district.id);

                  // Base radius
                  const baseRadius = isMainCity ? 6.5 : 4.5;
                  const animDelay = `${(index % 8) * 0.35}s`;

                  return (
                    <g
                      key={district.id}
                      className="cursor-pointer transition-opacity duration-200"
                      onMouseEnter={() => setHoveredDistrict(district)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      onClick={() => setSelectedDivision(district.divisionEn)}
                      opacity={isFilteredIn ? 1 : 0.3}
                    >
                      {/* Generous Invisible Hit Area for Easy Hovering */}
                      <circle
                        cx={x}
                        cy={y}
                        r={14}
                        fill="transparent"
                        className="cursor-pointer"
                      />

                      {/* Radar Beacon Wave Ring (Blinking & Expanding Pulse) */}
                      <circle
                        cx={x}
                        cy={y}
                        r={baseRadius}
                        fill="none"
                        stroke={isMainCity ? '#34D399' : '#10B981'}
                        strokeWidth={isMainCity ? 1.8 : 1.2}
                        className="pointer-events-none"
                      >
                        <animate
                          attributeName="r"
                          values={`${baseRadius};${baseRadius + (isMainCity ? 12 : 7)};${baseRadius + (isMainCity ? 16 : 9)}`}
                          dur={isMainCity ? '2s' : '2.6s'}
                          begin={animDelay}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.95;0.4;0"
                          dur={isMainCity ? '2s' : '2.6s'}
                          begin={animDelay}
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Hover Halo Glow */}
                      <circle
                        cx={x}
                        cy={y}
                        r={baseRadius + 5}
                        className={`fill-emerald-400/40 pointer-events-none transition-opacity duration-200 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ transformOrigin: `${x}px ${y}px`, transformBox: 'fill-box' }}
                      />

                      {/* Main District Point Circle with Smooth Blinking & Scale */}
                      <circle
                        cx={x}
                        cy={y}
                        r={baseRadius}
                        fill={isHovered ? '#10B981' : isMainCity ? '#059669' : '#047857'}
                        stroke="#FFFFFF"
                        strokeWidth={isHovered ? 2 : 1.2}
                        className="transition-transform duration-200 ease-out shadow-lg drop-shadow-sm"
                        style={{
                          transformOrigin: `${x}px ${y}px`,
                          transformBox: 'fill-box',
                          transform: isHovered ? 'scale(1.4)' : 'scale(1)',
                        }}
                      >
                        {!isHovered && (
                          <animate
                            attributeName="fill-opacity"
                            values="1;0.6;1"
                            dur={isMainCity ? '1.5s' : '2.2s'}
                            begin={animDelay}
                            repeatCount="indefinite"
                          />
                        )}
                      </circle>

                      {/* Center Target Dot with Pulsing Brightness */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isMainCity ? 2.2 : 1.5}
                        fill="#FFFFFF"
                        className="pointer-events-none transition-transform duration-200"
                        style={{
                          transformOrigin: `${x}px ${y}px`,
                          transformBox: 'fill-box',
                          transform: isHovered ? 'scale(1.4)' : 'scale(1)',
                        }}
                      >
                        <animate
                          attributeName="opacity"
                          values="1;0.25;1"
                          dur="1.8s"
                          begin={animDelay}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Active Hover Tooltip */}
              <AnimatePresence>
                {hoveredDistrict && (
                  <motion.div
                    key="district-tooltip"
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold shadow-2xl border border-emerald-500/40 z-30 flex items-center gap-2 whitespace-nowrap pointer-events-none"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>
                      {isBn ? hoveredDistrict.nameBn : hoveredDistrict.nameEn} ({isBn ? hoveredDistrict.divisionBn : hoveredDistrict.divisionEn}) — {isBn ? '৯৯.৯৯% সক্রিয়' : '99.99% Active'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Division Hover Pill */}
              <AnimatePresence>
                {hoveredDivision && !hoveredDistrict && (
                  <motion.div
                    key="division-tooltip"
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold border border-slate-700 shadow-xl z-20 pointer-events-none"
                  >
                    {hoveredDivision} Division
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Division Color Legend */}
            <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-4 sm:grid-cols-8 gap-2 text-[10px] font-bold text-center">
              {DIVISIONS.map((div) => (
                <button
                  key={div.id}
                  onClick={() => setSelectedDivision(div.nameEn)}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    selectedDivision.toLowerCase() === div.nameEn.toLowerCase() ||
                    selectedDivision.toLowerCase() === div.geoName.toLowerCase()
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : ''
                  }`}
                >
                  <span className="w-3 h-3 rounded-full shadow-sm border border-white/80" style={{ backgroundColor: div.color }} />
                  <span className="truncate text-slate-700 dark:text-slate-300">{isBn ? div.nameBn : div.nameEn}</span>
                </button>
              ))}
            </div>

            {/* Source Data Attribution */}
            <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-500" />
                <span>{isBn ? 'কাভারেজ:' : 'Coverage:'} Bangladesh 8 Divisions & 64 Districts</span>
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">09649 Network</span>
            </div>

          </div>

          {/* 64 District Directory List Panel */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              
              {/* Directory Filter Header */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm sm:text-base">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>{isBn ? '৬৪ জেলার নির্দেশিকা' : '64 District Coverage Directory'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    {filteredDistricts.length}
                  </span>
                </div>

                {/* Search Box */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isBn ? 'জেলা নাম অনুসন্ধান করুন...' : 'Search district name...'}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Division Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setSelectedDivision('all')}
                  className={`px-2.5 py-1 rounded-xl transition-all ${
                    selectedDivision === 'all'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isBn ? 'সব বিভাগ' : 'All Divisions'}
                </button>
                {DIVISIONS.map((div) => (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivision(div.nameEn)}
                    className={`px-2.5 py-1 rounded-xl transition-all ${
                      selectedDivision.toLowerCase() === div.nameEn.toLowerCase() ||
                      selectedDivision.toLowerCase() === div.geoName.toLowerCase()
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isBn ? div.nameBn : div.nameEn}
                  </button>
                ))}
              </div>

              {/* Districts Scrollable Grid */}
              <div className="max-h-[360px] overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2 custom-scrollbar">
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map((d) => (
                    <div
                      key={d.id}
                      onMouseEnter={() => setHoveredDistrict(d)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200/60 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 truncate">
                          {isBn ? d.nameBn : d.nameEn}
                        </span>
                      </div>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold shrink-0">
                        {isBn ? 'সক্রিয়' : 'Active'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    {isBn ? 'কোনো জেলা পাওয়া যায়নি' : 'No district found'}
                  </div>
                )}
              </div>

              {/* Network Uptime Summary Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">৬৪/৬৪</div>
                  <div className="text-[10px] text-slate-500 font-medium">{isBn ? 'সক্রিয় জেলা' : 'Active Districts'}</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="text-sm sm:text-base font-black text-sky-600 dark:text-sky-400">৯৯.৯৯%</div>
                  <div className="text-[10px] text-slate-500 font-medium">{isBn ? 'আপটাইম' : 'Uptime'}</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">&lt;২০ms</div>
                  <div className="text-[10px] text-slate-500 font-medium">{isBn ? 'ল্যাটেন্সি' : 'Latency'}</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
