import React, { useState, useEffect, useRef, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Polygon } from 'react-leaflet';
import { useUSGS, TimeRange } from '../hooks/useUSGS';
import { useIntelFeed } from '../hooks/useIntelFeed';
import { useOpenSky } from '../hooks/useOpenSky';
import { useMilitaryBases } from '../hooks/useMilitaryBases';
import { useMarineTraffic } from '../hooks/useMarineTraffic';
import { useNewsAPI } from '../hooks/useNewsAPI';
import { useSatellites } from '../hooks/useSatellites';
import { useSubmarineCables } from '../hooks/useSubmarineCables';
import { useInternetStatus } from '../hooks/useInternetStatus';
import { Layers, Plane, Zap, Radio, Shield, Anchor, Activity, Globe as GlobeIcon, Map as MapIcon, Satellite, Wifi, Network, Plus, Minus, Maximize, AlertTriangle, X, Pizza, TrendingUp, Eye } from 'lucide-react';
import * as THREE from 'three';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- ICONS FOR LEAFLET ---
const createPlaneIcon = (rotation: number) => {
  const iconMarkup = renderToStaticMarkup(
    <div style={{ transform: `rotate(${rotation - 45}deg)` }}>
      <Plane size={20} color="#ffffff" fill="#ffffff" fillOpacity={0.5} />
    </div>
  );
  return L.divIcon({ html: iconMarkup, className: 'bg-transparent', iconSize: [20, 20], iconAnchor: [10, 10] });
};

const createNetStatusIcon = (status: string, connectivity: number) => {
  const color = status === 'ONLINE' ? '#ffffff' : status === 'RESTRICTED' ? '#888888' : '#333333';
  const iconMarkup = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
       <div className="absolute inset-0 opacity-20 animate-pulse rounded-full" style={{ backgroundColor: color }}></div>
       <div className="bg-black/80 p-1 rounded border flex flex-col items-center" style={{ borderColor: color }}>
         <Wifi size={12} color={color} />
         <span className="text-[8px] font-bold text-white leading-none mt-0.5">{connectivity}%</span>
       </div>
    </div>
  );
  return L.divIcon({ html: iconMarkup, className: 'bg-transparent', iconSize: [30, 30], iconAnchor: [15, 15] });
}

interface GlobalMapProps {
  timeRange: TimeRange;
  selectedCountry: string | null;
}

// Custom hook for responsive dimensions
function useDimensions(ref: React.RefObject<HTMLDivElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (ref.current) {
        setDimensions({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, [ref]);

  return dimensions;
}

// Helper to sync map center
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);

  return null;
}

// Custom Zoom Control Component
function CustomZoomControl() {
  const map = useMap();
  return (
    <div className="flex flex-col gap-1">
      <button 
        onClick={() => map.zoomIn()}
        className="p-2 bg-[#0a0a0a]/90 border border-[#333] text-white hover:bg-[#333] hover:text-[#ffffff] transition-colors rounded-sm"
        title="Zoom In"
      >
        <Plus size={16} />
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="p-2 bg-[#0a0a0a]/90 border border-[#333] text-white hover:bg-[#333] hover:text-[#ffffff] transition-colors rounded-sm"
        title="Zoom Out"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}

// Helper to generate circular polygon coordinates
function generateCirclePolygon(lat: number, lng: number, radiusKm: number, numPoints: number = 30) {
  const coords = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    
    // Simple approximation for small radius (not great for poles, but fine for visual zones)
    const dLat = dy / 111;
    const dLng = dx / (111 * Math.cos(lat * Math.PI / 180));
    
    coords.push([lat + dLat, lng + dLng]);
  }
  // Close the loop
  coords.push(coords[0]);
  return [coords.map(p => [p[1], p[0]])]; // GeoJSON expects [lng, lat]
}

const COUNTRY_COORDS: Record<string, [number, number]> = {
  'US': [38, -97], 'USA': [38, -97], 'AMERICA': [38, -97],
  'UK': [55, -3], 'BRITAIN': [55, -3], 'LONDON': [51.5, -0.1],
  'RUSSIA': [61, 105], 'MOSCOW': [55.7, 37.6],
  'CHINA': [35, 104], 'BEIJING': [39.9, 116.4],
  'IRAN': [32, 53], 'TEHRAN': [35.6, 51.3],
  'ISRAEL': [31, 34.7], 'JERUSALEM': [31.7, 35.2],
  'UKRAINE': [48, 31], 'KYIV': [50.4, 30.5],
  'GERMANY': [51, 10], 'BERLIN': [52.5, 13.4],
  'FRANCE': [46, 2], 'PARIS': [48.8, 2.3],
  'NORTH KOREA': [40, 127],
  'INDIA': [20, 77], 'DELHI': [28.6, 77.2],
  'JAPAN': [36, 138], 'TOKYO': [35.6, 139.6],
  'TAIWAN': [23.6, 121],
  'AUSTRALIA': [-25, 133],
  'CANADA': [56, -106],
  'BRAZIL': [-14, -51],
};

export default function GlobalMap({ timeRange, selectedCountry }: GlobalMapProps) {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useDimensions(containerRef);

  // View State
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [mapLayer, setMapLayer] = useState<'DARK' | 'SATELLITE'>('DARK');
  const [center, setCenter] = useState<[number, number]>([34, 44]); // Middle East Center
  const [alertPopup, setAlertPopup] = useState<{ title: string; message: string; visible: boolean } | null>(null);

  // Data Hooks
  const { data: earthquakes } = useUSGS(timeRange);
  const { data: conflicts, zones } = useIntelFeed(timeRange);
  const { flights, error: flightError } = useOpenSky();
  const { bases } = useMilitaryBases();
  const { vessels } = useMarineTraffic();
  const { news: cyberNews } = useNewsAPI('CYBER', timeRange);
  const { news: breakingNews } = useNewsAPI('WIRE', timeRange);
  const { satellites } = useSatellites();
  const { cables } = useSubmarineCables();
  const { netStatus } = useInternetStatus();

  // Layer Toggles
  const [layers, setLayers] = useState({
    flights: true,
    earthquakes: false,
    conflicts: true,
    bases: false,
    marine: false,
    cyber: false,
    news: false,
    satellites: false,
    cables: true,
    internet: false
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Effect to fly to selected country
  useEffect(() => {
    if (selectedCountry && COUNTRY_COORDS[selectedCountry]) {
      const [lat, lng] = COUNTRY_COORDS[selectedCountry];
      setCenter([lat, lng]);
      if (globeEl.current) {
        globeEl.current.pointOfView({ lat, lng, altitude: 1.5 }, 1000);
      }
    }
  }, [selectedCountry]);

  // Simulate Critical Alert Popup
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% chance every minute to show a critical alert
      if (Math.random() > 0.8) {
        const alerts = [
          { title: "CRITICAL SIGNAL", message: "US military aware of civilian harm in Iran strikes" },
          { title: "AIR DEFENSE ACTIVE", message: "Multiple interceptors launched over Tel Aviv" },
          { title: "CYBER BLACKOUT", message: "Major connectivity loss detected in Eastern Europe" },
          { title: "NAVAL MOVEMENT", message: "Carrier Strike Group 5 changing course in South China Sea" }
        ];
        const alert = alerts[Math.floor(Math.random() * alerts.length)];
        setAlertPopup({ ...alert, visible: true });

        // Auto hide after 10 seconds
        setTimeout(() => setAlertPopup(prev => prev ? { ...prev, visible: false } : null), 10000);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // --- DATA PREPARATION FOR GLOBE ---

  const earthquakeData = useMemo(() => {
    if (!layers.earthquakes) return [];
    return earthquakes.map(eq => ({
      lat: eq.geometry.coordinates[1],
      lng: eq.geometry.coordinates[0],
      maxR: Math.max(eq.properties.mag * 2, 2),
      propagationSpeed: (eq.properties.mag / 10) * 2,
      repeatPeriod: 1000 - (eq.properties.mag * 50),
      color: '#ffffff', // Monochromatic
      name: eq.properties.title
    }));
  }, [earthquakes, layers.earthquakes]);

  const flightData = useMemo(() => {
    if (!layers.flights) return [];
    return flights.map(f => ({
      lat: f.latitude,
      lng: f.longitude,
      alt: f.altitude / 200000,
      color: '#ffffff', // Monochromatic
      label: f.callsign || 'UNKNOWN',
      ...f
    }));
  }, [flights, layers.flights]);

  // Use Polygons for Zones instead of Rings
  const conflictZonesData = useMemo(() => {
    if (!layers.conflicts) return [];
    
    const zonePolys = zones.map(z => ({
      coords: generateCirclePolygon(z.coords[0], z.coords[1], 500), // 500km radius
      color: z.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.4)' : z.severity === 'HIGH' ? 'rgba(249, 115, 22, 0.4)' : 'rgba(234, 179, 8, 0.4)',
      name: z.name,
      altitude: 0.01,
      severity: z.severity
    }));

    const livePolys = conflicts.map(c => {
      if (c.geometry && c.geometry.type === 'Point' && c.type !== 'LIVE_INTEL') {
        const isCritical = c.properties.severity === 'CRITICAL';
        const isHigh = c.properties.severity === 'HIGH';
        const color = isCritical ? 'rgba(239, 68, 68, 0.4)' : isHigh ? 'rgba(249, 115, 22, 0.4)' : 'rgba(234, 179, 8, 0.4)';
        return {
          coords: generateCirclePolygon(c.geometry.coordinates[1], c.geometry.coordinates[0], isCritical ? 300 : 150),
          color: color,
          name: c.properties.name,
          altitude: 0.01,
          severity: c.properties.severity
        };
      }
      return null;
    }).filter(Boolean) as any[];

    return [...zonePolys, ...livePolys].filter(p => p.coords && p.coords.length > 0);
  }, [zones, conflicts, layers.conflicts]);

  const cablePaths = useMemo(() => {
    if (!layers.cables) return [];
    return cables.map(c => ({
      coords: c.coords,
      color: '#444444', // Dark grey for cables
      name: `${c.name} (${c.capacity})`
    }));
  }, [cables, layers.cables]);

  const internetData = useMemo(() => {
    if (!layers.internet) return [];
    let data = netStatus;
    if (selectedCountry) {
        data = data.filter(s => s.countryName.toUpperCase().includes(selectedCountry) || s.countryCode === selectedCountry);
    }
    return data.map(s => ({
      lat: s.coords[0],
      lng: s.coords[1],
      name: `${s.countryName}: ${s.connectivity}%`,
      color: s.status === 'ONLINE' ? '#ffffff' : '#555555',
      size: 1.0,
      ...s
    }));
  }, [netStatus, layers.internet, selectedCountry]);

  // Reused data preps...
  const baseData = useMemo(() => {
    if (!layers.bases) return [];
    return bases.map(b => ({
      lat: b.coordinates[0],
      lng: b.coordinates[1],
      name: b.name,
      type: b.type,
      color: '#ffffff',
      size: 0.5
    }));
  }, [bases, layers.bases]);

  const marineData = useMemo(() => {
    if (!layers.marine) return [];
    return vessels.map(v => ({
      lat: v.coordinates[0],
      lng: v.coordinates[1],
      name: v.name,
      color: '#888888',
      size: 0.3
    }));
  }, [vessels, layers.marine]);


  const cyberData = useMemo(() => {
    if (!layers.cyber) return [];
    return cyberNews.map(item => {
      const text = (item.title + ' ' + item.content).toUpperCase();
      const country = Object.keys(COUNTRY_COORDS).find(c => text.includes(c));
      if (country) {
        const [lat, lon] = COUNTRY_COORDS[country];
        return {
          lat: lat + (Math.random() - 0.5) * 5,
          lng: lon + (Math.random() - 0.5) * 5,
          name: item.title,
          color: '#cccccc',
          size: 0.8,
          source: item.source,
          country: country
        };
      }
      return null;
    }).filter(Boolean) as any[];
  }, [cyberNews, layers.cyber]);

  const newsData = useMemo(() => {
    if (!layers.news) return [];
    return breakingNews.map(item => {
      const text = (item.title + ' ' + item.content).toUpperCase();
      const country = Object.keys(COUNTRY_COORDS).find(c => text.includes(c));
      if (country) {
        const [lat, lon] = COUNTRY_COORDS[country];
        return {
          lat: lat + (Math.random() - 0.5) * 2,
          lng: lon + (Math.random() - 0.5) * 2,
          name: item.title,
          color: '#ffffff',
          size: 0.6,
          source: item.source,
          country: country
        };
      }
      return null;
    }).filter(Boolean) as any[];
  }, [breakingNews, layers.news]);


  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: center[0], lng: center[1], altitude: 2.5 });
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.2; // Slower rotation
    }
  }, []);

  const handleGlobeClick = (point: any) => {
    if (point) {
      globeEl.current?.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.5 }, 1000);
      setCenter([point.lat, point.lng]);
    }
  };

  // Calculate Tension Index based on active conflicts and critical news
  const tensionIndex = useMemo(() => {
    const criticalNews = breakingNews.filter(n => n.priority === 'CRITICAL').length;
    const criticalConflicts = conflicts.filter(c => c.properties.severity === 'CRITICAL').length;
    const base = 50;
    return Math.min(100, base + (criticalNews * 5) + (criticalConflicts * 10));
  }, [breakingNews, conflicts]);

  // Calculate Pizza Meter (Simulated based on tension)
  const pizzaIndex = useMemo(() => {
    // Higher tension = Higher pizza orders (simulated)
    return Math.min(100, Math.max(10, tensionIndex + (Math.random() * 20 - 10)));
  }, [tensionIndex]);

  return (
    <div ref={containerRef} className="h-full w-full relative bg-[#000000] overflow-hidden">
      
      {/* --- CRITICAL ALERT POPUP --- */}
      {alertPopup && alertPopup.visible && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-[#0a0a0a]/95 border border-white shadow-[0_0_30px_rgba(255,255,255,0.1)] rounded-sm p-0 overflow-hidden max-w-md w-full">
            <div className="bg-white px-3 py-1 flex items-center justify-between">
              <div className="flex items-center gap-2 text-black font-bold text-xs tracking-widest">
                <AlertTriangle size={14} /> {alertPopup.title}
              </div>
              <button onClick={() => setAlertPopup(null)} className="text-black hover:text-gray-600 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-white font-mono text-sm font-bold leading-relaxed">
                {alertPopup.message}
              </p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-[#888]">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE INTEL • JUST NOW
              </div>
            </div>
            <div className="h-1 w-full bg-[#333]">
              <div className="h-full bg-white animate-[progress_10s_linear_forwards]"></div>
            </div>
          </div>
        </div>
      )}

      {/* --- METRICS OVERLAY --- */}
      <div className="absolute top-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
        <div className="bg-black/80 border border-white/20 p-3 rounded-sm backdrop-blur-md w-64">
           <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
               <TrendingUp size={12} /> GLOBAL TENSION
             </span>
             <span className="text-xl font-bold text-white font-mono">{tensionIndex.toFixed(0)}%</span>
           </div>
           <div className="h-1 bg-[#333] w-full rounded-full overflow-hidden">
             <div className="h-full bg-white transition-all duration-1000" style={{ width: `${tensionIndex}%` }}></div>
           </div>
        </div>

        <div className="bg-black/80 border border-white/20 p-3 rounded-sm backdrop-blur-md w-64">
           <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
               <Pizza size={12} /> PIZZA METER (PENTAGON)
             </span>
             <span className="text-xl font-bold text-white font-mono">{pizzaIndex.toFixed(0)}</span>
           </div>
           <div className="flex gap-1">
             {Array.from({ length: 10 }).map((_, i) => (
               <div key={i} className={`h-1 flex-1 rounded-full ${i < pizzaIndex / 10 ? 'bg-white' : 'bg-[#333]'}`}></div>
             ))}
           </div>
           <div className="mt-1 text-[9px] text-gray-500 text-right">
             {pizzaIndex > 75 ? 'OVERFLOW' : pizzaIndex > 50 ? 'HIGH VOLUME' : 'NORMAL'}
           </div>
        </div>
      </div>

      {/* --- 3D GLOBE VIEW --- */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${viewMode === '3D' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        {width > 0 && height > 0 && (
          <Globe
            ref={globeEl}
            width={width}
            height={height}
            // Monochromatic Theme
            backgroundColor="#000000"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg" // We can use filters in CSS to make this grayscale if needed, but earth-night is close.
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            
            // Atmosphere
            atmosphereColor="#ffffff"
            atmosphereAltitude={0.1}

            // Polygons (Zones)
            polygonsData={conflictZonesData}
            polygonGeoJsonGeometry={d => (d as any).coords}
            polygonCapColor={d => (d as any).color}
            polygonSideColor={() => 'rgba(0,0,0,0)'}
            polygonStrokeColor={() => '#ffffff'}
            polygonAltitude={d => (d as any).altitude}

            // Points
            pointsData={[...flightData, ...marineData]}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude={d => (d as any).alt || 0.01}
            pointRadius={d => (d as any).size || 0.2}
            pointLabel="label"

            // Labels
            labelsData={[...baseData, ...cyberData, ...newsData, ...internetData]}
            labelLat="lat"
            labelLng="lng"
            labelText="name"
            labelSize={d => (d as any).size || 0.5}
            labelDotRadius={0.3}
            labelColor="color"
            labelResolution={2}

            // Submarine Cables (Paths)
            pathsData={cablePaths}
            pathPoints="coords"
            pathPointLat="lat"
            pathPointLng="lng"
            pathPointAlt="alt"
            pathColor="color"
            pathStroke={1}
            pathDashLength={0.1}
            pathDashGap={0.05}
            pathDashAnimateTime={12000}

            // Satellites
            objectsData={layers.satellites ? satellites : []}
            objectLat="lat"
            objectLng="lng"
            objectAltitude="alt"
            objectLabel="name"
            objectThreeObject={() => {
              const group = new THREE.Group();
              const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.5, 0.5),
                new THREE.MeshLambertMaterial({ color: '#ffffff' })
              );
              group.add(body);
              return group;
            }}

            onPointClick={handleGlobeClick}
            onGlobeClick={(d) => {
               if(d) globeEl.current?.pointOfView({ lat: d.lat, lng: d.lng, altitude: 2.0 }, 1000);
            }}
          />
        )}
      </div>

      {/* --- 2D MAP VIEW --- */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${viewMode === '2D' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
         {viewMode === '2D' && (
           <MapContainer 
             center={center} 
             zoom={5} 
             className="h-full w-full bg-[#050505]"
             zoomControl={false} // Disable default zoom control
             attributionControl={false}
           >
             <MapController center={center} />
             
             {/* Tile Layer Toggle */}
             {mapLayer === 'DARK' ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  className="map-tiles-tactical grayscale"
                />
             ) : (
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
             )}

             {/* Conflict Zones (Polygons) */}
             {conflictZonesData.map((zone, idx) => (
               <Polygon 
                 key={`zone-${idx}`}
                 positions={zone.coords.map((c: any) => [c.lat, c.lng])}
                 pathOptions={{ 
                   color: zone.severity === 'CRITICAL' ? '#ef4444' : zone.severity === 'HIGH' ? '#f97316' : '#eab308', 
                   fillColor: zone.severity === 'CRITICAL' ? '#ef4444' : zone.severity === 'HIGH' ? '#f97316' : '#eab308',
                   fillOpacity: 0.3,
                   weight: 1
                 }}
               />
             ))}

             {layers.flights && flights.map(f => (
               <Marker key={f.icao24} position={[f.latitude, f.longitude]} icon={createPlaneIcon(f.true_track)}>
                 <Popup>{f.callsign}</Popup>
               </Marker>
             ))}

             {layers.internet && internetData.map(s => (
               <Marker key={s.countryCode} position={[s.coords[0], s.coords[1]]} icon={createNetStatusIcon(s.status, s.connectivity)}>
                 <Popup>{s.countryName}: {s.connectivity}%</Popup>
               </Marker>
             ))}

             {/* Cables in 2D (Simplified as Polylines) */}
             {layers.cables && cables.map(c => (
               <Polyline 
                 key={c.id} 
                 positions={c.coords.map(p => [p.lat, p.lng]) as [number, number][]} 
                 pathOptions={{ color: '#666666', weight: 1, opacity: 0.6 }} 
               />
             ))}

             {/* Custom Zoom Control Positioned Top Right */}
             <div className="leaflet-top leaflet-right" style={{ top: '80px', right: '24px' }}>
                <div className="leaflet-control">
                  <CustomZoomControl />
                </div>
             </div>

           </MapContainer>
         )}
      </div>

      {/* --- CONTROLS UI --- */}
      <div className="absolute top-6 right-6 z-50 flex flex-col gap-2">
        {/* View Toggle */}
        <div className="bg-[#0a0a0a]/90 border border-white/30 p-1 rounded-sm backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.1)] flex flex-col gap-1">
          <button 
            onClick={() => setViewMode('3D')}
            className={`p-2 rounded-sm transition-colors font-mono text-xs ${viewMode === '3D' ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
            title="3D Globe View"
          >
            <GlobeIcon size={18} />
          </button>
          <button 
            onClick={() => setViewMode('2D')}
            className={`p-2 rounded-sm transition-colors font-mono text-xs ${viewMode === '2D' ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
            title="2D Map View"
          >
            <MapIcon size={18} />
          </button>
          
          {/* Satellite Layer Toggle (Only visible in 2D mode) */}
          {viewMode === '2D' && (
             <button 
                onClick={() => setMapLayer(prev => prev === 'DARK' ? 'SATELLITE' : 'DARK')}
                className={`p-2 rounded-sm transition-colors font-mono text-xs ${mapLayer === 'SATELLITE' ? 'bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/50' : 'text-[#666] hover:bg-white/5'}`}
                title="Toggle Satellite Imagery"
             >
                <Eye size={18} />
             </button>
          )}

          <button 
            onClick={() => {
               if (document.fullscreenElement) {
                 document.exitFullscreen();
               } else {
                 containerRef.current?.requestFullscreen();
               }
            }}
            className="p-2 rounded-sm transition-colors font-mono text-xs text-[#666] hover:bg-white/5 hover:text-white"
            title="Maximize"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* Layer Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-50 bg-[#0a0a0a]/90 border border-white/30 p-3 rounded-sm backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/20">
          <Layers size={14} className="text-white" />
          <span className="text-[10px] font-bold tracking-widest text-white font-mono">DATA LAYERS</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => toggleLayer('flights')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors ${layers.flights ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
          >
            <Plane size={12} /> FLIGHTS <span className="text-[9px] opacity-70 ml-1">({flights.length})</span>
          </button>
          <button 
            onClick={() => toggleLayer('earthquakes')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors ${layers.earthquakes ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
          >
            <Activity size={12} /> SEISMIC <span className="text-[9px] opacity-70 ml-1">({earthquakes.length})</span>
          </button>
          <button 
            onClick={() => toggleLayer('conflicts')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors ${layers.conflicts ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
          >
            <Zap size={12} /> CONFLICTS <span className="text-[9px] opacity-70 ml-1">({conflicts.length})</span>
          </button>
          <button 
            onClick={() => toggleLayer('bases')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors ${layers.bases ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
          >
            <Shield size={12} /> BASES <span className="text-[9px] opacity-70 ml-1">({bases.length})</span>
          </button>
          <button 
            onClick={() => toggleLayer('marine')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors ${layers.marine ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
          >
            <Anchor size={12} /> MARINE <span className="text-[9px] opacity-70 ml-1">({vessels.length})</span>
          </button>
          <button 
            onClick={() => toggleLayer('cyber')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors ${layers.cyber ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
          >
            <Radio size={12} /> CYBER <span className="text-[9px] opacity-70 ml-1">({cyberNews.length})</span>
          </button>
          <button 
            onClick={() => toggleLayer('news')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors ${layers.news ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
          >
            <Activity size={12} /> NEWS <span className="text-[9px] opacity-70 ml-1">({breakingNews.length})</span>
          </button>
           <button 
            onClick={() => toggleLayer('satellites')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors ${layers.satellites ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
          >
            <Satellite size={12} /> SATELLITES <span className="text-[9px] opacity-70 ml-1">({satellites.length})</span>
          </button>
          <button 
            onClick={() => toggleLayer('cables')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors ${layers.cables ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
          >
            <Network size={12} /> CABLES <span className="text-[9px] opacity-70 ml-1">({cables.length})</span>
          </button>
          <button 
            onClick={() => toggleLayer('internet')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors ${layers.internet ? 'bg-white/20 text-white border border-white/50' : 'text-[#666] hover:bg-white/5'}`}
          >
            <Wifi size={12} /> NET STATUS <span className="text-[9px] opacity-70 ml-1">({netStatus.length})</span>
          </button>
        </div>
      </div>

      {/* Overlay Scanline Effect */}
      <div className="pointer-events-none absolute inset-0 z-[400] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(255,255,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat opacity-20 grayscale"></div>
    </div>
  );
}
