import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HitSpot } from '../types';
import { CATEGORY_TRANSLATIONS } from '../i18n/translations';
import { 
  MapPin, 
  ExternalLink, 
  Compass, 
  ChevronRight,
  Navigation,
  LocateFixed,
  Loader2,
  X
} from 'lucide-react';

const REGION_CENTERS: Record<string, { lat: number; lng: number; zoom: number; labelEl: string }> = {
  ALL: { lat: 38.2749, lng: 23.8064, zoom: 6, labelEl: 'Όλη η Ελλάδα' },
  'Athens & Attica': { lat: 37.9838, lng: 23.7275, zoom: 12, labelEl: 'Αθήνα' },
  'Thessaloniki & North': { lat: 40.6401, lng: 22.9444, zoom: 12, labelEl: 'Θεσσαλονίκη' },
  'Chania & West Crete': { lat: 35.5138, lng: 24.0180, zoom: 11, labelEl: 'Χανιά' },
  'Cyclades (Naxos/Santorini/Paros)': { lat: 37.0094, lng: 25.3853, zoom: 10, labelEl: 'Κυκλάδες' }
};

// Haversine distance in kilometers between two coordinates
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const MapView: React.FC = () => {
  const { spots, language, t, setSelectedSpot, selectedCategory, showToast } = useApp();

  const [activeRegionTab, setActiveRegionTab] = useState<string>('ALL');
  const [activeSpotOnMap, setActiveSpotOnMap] = useState<HitSpot | null>(spots[0] || null);

  // User Location State ("Ενεργοποίηση δεδομένων τοποθεσίας")
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleEnableLocation = () => {
    if (userCoords) {
      // If already enabled, re-center on closest spot
      return;
    }

    setIsLocating(true);

    const applyCoordinates = (lat: number, lng: number, label?: string) => {
      setUserCoords({ lat, lng, label });
      setActiveRegionTab('ALL');
      setIsLocating(false);

      // Find nearest spot and focus map on it
      const sortedByDist = [...spots].sort(
        (a, b) =>
          getDistanceKm(lat, lng, a.coordinates.lat, a.coordinates.lng) -
          getDistanceKm(lat, lng, b.coordinates.lat, b.coordinates.lng)
      );
      if (sortedByDist[0]) {
        setActiveSpotOnMap(sortedByDist[0]);
      }

      showToast(
        language === 'el'
          ? 'Τα δεδομένα τοποθεσίας ενεργοποιήθηκαν! Εμφανίζονται τα κοντινότερα Hot Spots.'
          : 'Location data enabled! Showing nearest Hot Spots.',
        'success'
      );
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          applyCoordinates(
            position.coords.latitude,
            position.coords.longitude,
            language === 'el' ? 'Η Τοποθεσία σας (GPS)' : 'Your GPS Location'
          );
        },
        () => {
          // Fallback to central Athens if browser geolocation is blocked inside iframe
          applyCoordinates(
            37.9755,
            23.7348,
            language === 'el' ? 'Αθήνα • Κέντρο (Τοποθεσία Χρήστη)' : 'Athens Center (User Location)'
          );
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      applyCoordinates(
        37.9755,
        23.7348,
        language === 'el' ? 'Αθήνα • Κέντρο (Τοποθεσία Χρήστη)' : 'Athens Center (User Location)'
      );
    }
  };

  const handleDisableLocation = () => {
    setUserCoords(null);
    showToast(
      language === 'el'
        ? 'Η ταξινόμηση βάσει τοποθεσίας απενεργοποιήθηκε.'
        : 'Location sorting disabled.',
      'info'
    );
  };

  // Compute spots with distance if user location is enabled
  const processedSpots = spots
    .filter((spot) => {
      if (activeRegionTab !== 'ALL' && spot.region !== activeRegionTab) return false;
      if (selectedCategory !== 'ALL' && spot.category !== selectedCategory) return false;
      return true;
    })
    .map((spot) => {
      const distanceKm = userCoords
        ? getDistanceKm(
            userCoords.lat,
            userCoords.lng,
            spot.coordinates.lat,
            spot.coordinates.lng
          )
        : null;
      return {
        ...spot,
        distanceKm
      };
    })
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return b.rating - a.rating;
    });

  // OpenStreetMap embed coordinates
  const mapUrl = activeSpotOnMap
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${activeSpotOnMap.coordinates.lng - 0.03}%2C${activeSpotOnMap.coordinates.lat - 0.02}%2C${activeSpotOnMap.coordinates.lng + 0.03}%2C${activeSpotOnMap.coordinates.lat + 0.02}&layer=mapnik&marker=${activeSpotOnMap.coordinates.lat}%2C${activeSpotOnMap.coordinates.lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=19.5%2C34.5%2C28.5%2C41.5&layer=mapnik`;

  const activeSpotDistance =
    activeSpotOnMap && userCoords
      ? getDistanceKm(
          userCoords.lat,
          userCoords.lng,
          activeSpotOnMap.coordinates.lat,
          activeSpotOnMap.coordinates.lng
        )
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Map Header Controls + "Ενεργοποίηση δεδομένων τοποθεσίας" Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#243B35] dark:text-[#F1E9D2] flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-[#6B2F2F] dark:text-[#F4D6C6]" />
            <span>{language === 'el' ? 'Χάρτης των Spots' : 'Map of Spots'}</span>
          </h2>
          <p className="text-sm text-[#243B35]/80 dark:text-[#B7C9B1] mt-1 font-medium">
            {language === 'el'
              ? 'Ενεργοποιήστε την τοποθεσία σας για να δείτε αμέσως τα κοντινότερα Hot Spots δίπλα σας!'
              : 'Enable your location to immediately see the closest Hot Spots near you!'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* "Ενεργοποίηση δεδομένων τοποθεσίας" Button */}
          {!userCoords ? (
            <button
              type="button"
              onClick={handleEnableLocation}
              disabled={isLocating}
              className="px-4 py-2.5 rounded-2xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] border-2 border-[#D88C72] font-heading text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LocateFixed className="w-4 h-4 text-[#F4D6C6]" />
              )}
              <span>
                {language === 'el'
                  ? 'Ενεργοποίηση δεδομένων τοποθεσίας'
                  : 'Enable Location Data'}
              </span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 bg-[#243B35] text-[#F1E9D2] px-3.5 py-2 rounded-2xl border-2 border-[#6B8E7B] shadow-md">
              <LocateFixed className="w-4 h-4 text-[#CDFF9B] animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-[#CDFF9B]">
                {language === 'el'
                  ? `Τοποθεσία Ενεργή (${userCoords.label || 'GPS'})`
                  : `Location Active (${userCoords.label || 'GPS'})`}
              </span>
              <button
                type="button"
                onClick={handleDisableLocation}
                title={language === 'el' ? 'Απενεργοποίηση τοποθεσίας' : 'Disable location'}
                className="p-1 rounded-lg bg-[#6B8E7B]/40 hover:bg-[#6B8E7B] text-[#F1E9D2] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Location Banner & Quick City Reference Selector (when Location Data is active) */}
      {userCoords && (
        <div className="p-4 rounded-2xl bg-[#F4D6C6] dark:bg-slate-900 border-2 border-[#6B2F2F] dark:border-[#D88C72] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading text-sm sm:text-base font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                {language === 'el'
                  ? '🔥 Hot Spots κοντά στην τοποθεσία σας (Ταξινόμηση από το πιο κοντινό)'
                  : '🔥 Hot Spots near your location (Sorted from closest)'}
              </div>
              <p className="text-xs text-[#6B2F2F]/80 dark:text-stone-300 font-medium">
                {language === 'el'
                  ? 'Υπολογίστηκε η απόσταση σε χιλιόμετρα από το στίγμα σας προς κάθε Spot.'
                  : 'Distance in kilometers calculated from your coordinates to every Spot.'}
              </p>
            </div>
          </div>

          {/* Quick Location Switcher in case user wants to test proximity from another Greek hub */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#6B2F2F] dark:text-[#D88C72] mr-1">
              {language === 'el' ? 'Στίγμα:' : 'Pin:'}
            </span>
            {[
              { label: 'Αθήνα', lat: 37.9755, lng: 23.7348 },
              { label: 'Θεσσαλονίκη', lat: 40.6401, lng: 22.9444 },
              { label: 'Χανιά', lat: 35.5138, lng: 24.0180 },
              { label: 'Νάξος', lat: 37.0094, lng: 25.3853 }
            ].map((loc) => (
              <button
                key={loc.label}
                type="button"
                onClick={() => {
                  setUserCoords({ lat: loc.lat, lng: loc.lng, label: loc.label });
                  const nearest = [...spots].sort(
                    (a, b) =>
                      getDistanceKm(loc.lat, loc.lng, a.coordinates.lat, a.coordinates.lng) -
                      getDistanceKm(loc.lat, loc.lng, b.coordinates.lat, b.coordinates.lng)
                  )[0];
                  if (nearest) setActiveSpotOnMap(nearest);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                  userCoords.label?.includes(loc.label)
                    ? 'bg-[#6B2F2F] text-[#F4D6C6]'
                    : 'bg-white dark:bg-slate-800 text-[#6B2F2F] dark:text-[#F4D6C6] border border-[#D88C72]'
                }`}
              >
                📍 {loc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Region Jump Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {Object.keys(REGION_CENTERS).map((regKey) => (
          <button
            key={regKey}
            onClick={() => {
              setActiveRegionTab(regKey);
              const first = spots.find((s) => regKey === 'ALL' || s.region === regKey);
              if (first) setActiveSpotOnMap(first);
            }}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRegionTab === regKey
                ? 'bg-[#6B2F2F] text-[#F4D6C6] shadow-md'
                : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-slate-700 hover:border-[#A44A3F]'
            }`}
          >
            {regKey === 'ALL' ? t.filterAllRegions : regKey.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Main Map Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Spots List */}
        <div className="lg:col-span-5 space-y-3 max-h-[650px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#243B35] dark:text-[#B7C9B1] px-1">
            <span>
              {processedSpots.length}{' '}
              {userCoords
                ? language === 'el'
                  ? 'Hot Spots Κοντά σας'
                  : 'Hot Spots Near You'
                : 'Spots in View'}
            </span>
            {userCoords && (
              <span className="text-[#6B2F2F] dark:text-[#F4D6C6] font-extrabold">
                {language === 'el' ? 'Κατά Απόσταση (χλμ)' : 'By Distance (km)'}
              </span>
            )}
          </div>

          {processedSpots.map((spot, idx) => {
            const isSelected = activeSpotOnMap?.id === spot.id;
            const categoryConfig = CATEGORY_TRANSLATIONS[spot.category] || { el: spot.category, en: spot.category, icon: '🍽️' };
            const displayTitle = language === 'el' && spot.titleEl ? spot.titleEl : spot.title;
            const isNearbyHotSpot = spot.distanceKm !== null && spot.distanceKm <= 25;

            return (
              <div
                key={spot.id}
                onClick={() => setActiveSpotOnMap(spot)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-3.5 items-center ${
                  isSelected
                    ? 'bg-[#FFF7F2] dark:bg-slate-800 border-[#6B2F2F] ring-2 ring-[#A44A3F]/30 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 hover:border-[#D88C72]'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={spot.coverImageUrl}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  {userCoords && idx === 0 && (
                    <span className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-md bg-[#6B2F2F] text-[#F4D6C6] text-[9px] font-black uppercase shadow-xs">
                      Πιο Κοντινό
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-bold text-[#6B2F2F] dark:text-[#F4D6C6] truncate">
                      {categoryConfig.icon} {language === 'el' ? categoryConfig.el : categoryConfig.en}
                    </span>
                    <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-0.5 shrink-0">
                      ★ {spot.rating.toFixed(1)}
                    </span>
                  </div>

                  <h4 className="font-heading text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                    {displayTitle}
                  </h4>

                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{spot.address}</span>
                  </p>

                  {spot.distanceKm !== null && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${
                          isNearbyHotSpot
                            ? 'bg-[#6B2F2F] text-[#F4D6C6]'
                            : 'bg-[#F4D6C6] text-[#6B2F2F]'
                        }`}
                      >
                        <LocateFixed className="w-3 h-3" />
                        <span>
                          {spot.distanceKm < 1
                            ? `${Math.round(spot.distanceKm * 1000)} μέτρα μακριά`
                            : `${spot.distanceKm.toFixed(1)} χλμ μακριά`}
                        </span>
                      </span>
                      {isNearbyHotSpot && (
                        <span className="text-[10px] font-black text-[#A44A3F] dark:text-[#D88C72]">
                          🔥 Κοντά σας!
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400">
                      by {spot.author.firstName} ({spot.priceLevel})
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSpot(spot);
                      }}
                      className="text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{t.viewDetails}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Embedded Map Canvas & Active Pin Inspector */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden border-2 border-[#6B8E7B] shadow-xl bg-stone-100 dark:bg-slate-800">
            <iframe
              title="Greece Food Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapUrl}
              className="w-full h-full grayscale-[15%] contrast-110"
            />

            {/* Active Floating Spot Callout on Map */}
            {activeSpotOnMap && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-[#6B2F2F] shadow-2xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B2F2F] dark:text-[#F4D6C6]">
                        {activeSpotOnMap.category} • {activeSpotOnMap.region.split(' (')[0]}
                      </span>
                      {activeSpotDistance !== null && (
                        <span className="px-2 py-0.5 rounded-md bg-[#6B2F2F] text-[#F4D6C6] text-[10px] font-extrabold">
                          📍 {activeSpotDistance.toFixed(1)} χλμ
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-bold text-stone-900 dark:text-stone-50 mt-0.5">
                      {language === 'el' && activeSpotOnMap.titleEl ? activeSpotOnMap.titleEl : activeSpotOnMap.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#6B2F2F] text-[#F4D6C6] text-xs font-extrabold shrink-0">
                    ★ {activeSpotOnMap.rating.toFixed(1)}
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 italic line-clamp-2">
                  "{language === 'el' && activeSpotOnMap.whyIsItSpecialEl ? activeSpotOnMap.whyIsItSpecialEl : activeSpotOnMap.whyIsItSpecial}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800">
                  <a
                    href={activeSpotOnMap.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6] hover:underline flex items-center gap-1"
                  >
                    <span>{t.openGoogleMaps}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => setSelectedSpot(activeSpotOnMap)}
                    className="px-3 py-1.5 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] text-xs font-bold hover:bg-[#A44A3F] transition-colors cursor-pointer"
                  >
                    {t.viewDetails}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
