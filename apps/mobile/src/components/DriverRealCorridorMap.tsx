import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  LayoutChangeEvent,
  PanResponder,
  Modal,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Svg, { Circle, Polyline, Rect, Text as SvgText, G, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getDynamicCorridorWaypoints, calculateCorridorRoadDistanceKm, resolveCorridorCoordinates } from '../shared';
import { getCorridorRoadPolylineLocal, fetchOsmHighwayRoute, RoadCoordinate } from '../utils/corridorRoads';
import { ActiveTripDetails } from '../screens/driver/types';

interface Props {
  activeTrip: ActiveTripDetails | null;
  onStartTrip?: () => void;
  actionLoading?: boolean;
  driverGpsLocation?: {
    latitude: number;
    longitude: number;
    speedKmh?: number;
    heading?: number;
    accuracy?: number;
  } | null;
  gpsStatus?: string;
  onEnableGps?: () => void;
  onMapInteractionChange?: (interacting: boolean) => void;
}

// ── Web Mercator Projection (Identical to Leaflet & OpenStreetMap) ──
function toMercator(lat: number, lng: number, z: number) {
  const scale = 256 * Math.pow(2, z);
  const x = ((lng + 180) / 360) * scale;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * scale;
  return { x, y };
}

function tileUrl(layer: string, col: number, row: number, z: number): string {
  if (layer === 'sat') {
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${row}/${col}`;
  }
  // OSM: OpenStreetMap France mirror (osmfr) serves standard OpenStreetMap Carto tiles
  // and does not block mobile/Expo OkHttp network requests with 403 Access Blocked.
  return `https://a.tile.openstreetmap.fr/osmfr/${z}/${col}/${row}.png`;
}

export const DriverRealCorridorMap: React.FC<Props> = ({
  activeTrip,
  onStartTrip,
  actionLoading,
  driverGpsLocation,
  gpsStatus,
  onEnableGps,
  onMapInteractionChange,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Map layer toggle: strictly OSM (OpenStreetMap) and Sat (Satellite)
  const [layer, setLayer] = useState<'osm' | 'sat'>('osm');
  const userManuallySelectedLayerRef = useRef<boolean>(false);
  const handleTileError = () => {};

  // Navigation Modal State (Authentic 3D Google Maps Turn-by-Turn View)
  const [isNavActive, setIsNavActive] = useState<boolean>(false);
  const [isNorthUp, setIsNorthUp] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [nav3DZoom, setNav3DZoom] = useState<number>(1.0);
  const [nav3DPanOffset, setNav3DPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [navModalFollowTruck, setNavModalFollowTruck] = useState<boolean>(true);
  const [manualHeading, setManualHeading] = useState<number | null>(null);
  const manualHeadingRef = useRef<number | null>(null);
  const truckHeadingRef = useRef<number>(0);
  const nav3DStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const stableLocationRef = useRef<{ lat: number; lng: number; heading: number } | null>(null);

  // Auto-transition to close-up Follow Truck view when driver starts trip
  const prevStatusRef = useRef(activeTrip?.status);
  useEffect(() => {
    if (prevStatusRef.current !== 'IN_TRANSIT' && activeTrip?.status === 'IN_TRANSIT') {
      setIsFollowTruck(true);
      setZoom(1.0);
      setPanOffset({ x: 0, y: 0 });
      setNavModalFollowTruck(true);
      setIsNorthUp(false);
    }
    prevStatusRef.current = activeTrip?.status;
  }, [activeTrip?.status]);

  // Inline dimensions & pan/zoom
  const [containerW, setContainerW] = useState<number>(340);
  const [zoom, setZoom] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPanOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFollowTruck, setIsFollowTruck] = useState<boolean>(true);
  const [selectedWp, setSelectedWp] = useState<any>(null);

  const H = 295;
  const W = Math.max(280, containerW);
  const navW = windowWidth || 360;
  const navH = windowHeight || 640;

  const isDispatchedOnly = activeTrip?.status === 'DISPATCHED' || activeTrip?.status === 'ASSIGNED';
  const isInTransit = activeTrip?.status === 'IN_TRANSIT';
  const isDrivingState = activeTrip?.isDriving !== undefined ? activeTrip.isDriving : (activeTrip?.speedKmh ?? 0) > 5;
  const speed = isDispatchedOnly || !isInTransit || !isDrivingState
    ? 0
    : (driverGpsLocation?.speedKmh && driverGpsLocation.speedKmh > 5
        ? driverGpsLocation.speedKmh
        : (activeTrip?.speedKmh || 58));
  const isMoving = isInTransit && isDrivingState;

  // Resolve actual origin and destination coordinates dynamically (no hardcoded Debre Sina / Addis defaults)
  const originCoords = useMemo(() => {
    return resolveCorridorCoordinates(activeTrip?.origin, activeTrip?.originLat, activeTrip?.originLng);
  }, [activeTrip?.origin, activeTrip?.originLat, activeTrip?.originLng]);

  const destCoords = useMemo(() => {
    return resolveCorridorCoordinates(activeTrip?.destination, activeTrip?.destLat, activeTrip?.destLng);
  }, [activeTrip?.destination, activeTrip?.destLat, activeTrip?.destLng]);

  const origin = (activeTrip?.origin?.split(',')[0] && !activeTrip?.origin?.includes('Pickup Point'))
    ? activeTrip.origin.split(',')[0].trim()
    : originCoords.resolvedName;
  const dest = (activeTrip?.destination?.split(',')[0] && !activeTrip?.destination?.includes('Delivery Point'))
    ? activeTrip.destination.split(',')[0].trim()
    : destCoords.resolvedName;

  // Exact real-world road kilometer calculated dynamically via corridor network
  const totalRoadKm = useMemo(() => {
    if (!activeTrip) return 0;
    return calculateCorridorRoadDistanceKm(
      activeTrip.origin,
      activeTrip.destination,
      originCoords.lat,
      originCoords.lng,
      destCoords.lat,
      destCoords.lng
    );
  }, [
    activeTrip?.origin,
    activeTrip?.destination,
    originCoords,
    destCoords,
  ]);

  // Build complete, real-world corridor waypoints from origin to destination
  const WAYPOINTS = useMemo(() => {
    if (!activeTrip) return [];

    if (activeTrip?.waypoints && activeTrip.waypoints.length > 2) {
      return activeTrip.waypoints.map((w: any, idx: number) => ({
        id: w.id || `WP-${idx + 1}`,
        name: w.name || `Waypoint ${idx + 1}`,
        lat: Number(w.latitude ?? w.lat),
        lng: Number(w.longitude ?? w.lng),
        type: w.type || (idx === 0 ? 'ORIGIN' : idx === (activeTrip.waypoints ? activeTrip.waypoints.length - 1 : 0) ? 'DESTINATION' : 'CHECKPOINT'),
      }));
    }

    const dyn = getDynamicCorridorWaypoints(
      origin,
      dest,
      originCoords.lat,
      originCoords.lng,
      destCoords.lat,
      destCoords.lng,
      isInTransit ? (activeTrip?.progressPercentage ?? 0) : 0,
      activeTrip?.status || 'DISPATCHED'
    );

    return dyn.map((w, idx) => ({
      id: w.id || `WP-${idx + 1}`,
      name: w.name,
      lat: Number(w.latitude),
      lng: Number(w.longitude),
      type: w.type || (idx === 0 ? 'ORIGIN' : idx === dyn.length - 1 ? 'DESTINATION' : 'CHECKPOINT'),
    }));
  }, [
    activeTrip?.waypoints,
    activeTrip?.status,
    isInTransit,
    activeTrip?.progressPercentage,
    origin,
    dest,
    originCoords,
    destCoords,
  ]);

  // Progress tick
  const [tick, setTick] = useState<number>(() => {
    if (isDispatchedOnly || !isInTransit) return 0;
    return activeTrip?.progressPercentage ?? 0;
  });

  useEffect(() => {
    if (isDispatchedOnly || !isInTransit) {
      setTick(0);
      return;
    }
    if (typeof activeTrip?.progressPercentage === 'number') {
      setTick(activeTrip.progressPercentage);
    }
  }, [activeTrip?.progressPercentage, isDispatchedOnly, isInTransit]);



  // Live genuine OpenStreetMap / Google Maps road coordinates fetched via OSRM
  const [liveOsmRoad, setLiveOsmRoad] = useState<RoadCoordinate[] | null>(null);

  // Stable coarse coordinates (rounded to 3 decimals, ~110m) to avoid unnecessary route re-fetches
  const gpsLatKey = driverGpsLocation?.latitude ? Math.round(driverGpsLocation.latitude * 1000) / 1000 : null;
  const gpsLngKey = driverGpsLocation?.longitude ? Math.round(driverGpsLocation.longitude * 1000) / 1000 : null;

  useEffect(() => {
    if (!activeTrip) {
      setLiveOsmRoad(null);
      return;
    }
    let isMounted = true;
    // Route from the driver's genuine current location if GPS is present, or from posted origin
    const startLat = (driverGpsLocation && typeof driverGpsLocation.latitude === 'number')
      ? driverGpsLocation.latitude
      : originCoords.lat;
    const startLng = (driverGpsLocation && typeof driverGpsLocation.longitude === 'number')
      ? driverGpsLocation.longitude
      : originCoords.lng;
    const dLat = destCoords.lat;
    const dLng = destCoords.lng;

    fetchOsmHighwayRoute(startLat, startLng, dLat, dLng).then((route) => {
      if (isMounted && route && route.length >= 10) {
        setLiveOsmRoad(route);
      } else if (isMounted && !route) {
        // Fall back gracefully when offline
        if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
          // Keep active layer
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    activeTrip?.id,
    gpsLatKey,
    gpsLngKey,
    originCoords.lat,
    originCoords.lng,
    destCoords.lat,
    destCoords.lng,
  ]);

  // High-density, real curving highway road geometry matching Google Maps
  const ROAD_POINTS = useMemo(() => {
    if (!activeTrip) return [];

    // 1. If genuine live OpenStreetMap highway road points are fetched, use them directly
    if (liveOsmRoad && liveOsmRoad.length >= 10) {
      return liveOsmRoad;
    }

    // 2. High-density authentic Ethiopian Highway road polyline
    const oName = origin;
    const dName = dest;
    const startLat = (driverGpsLocation && typeof driverGpsLocation.latitude === 'number')
      ? driverGpsLocation.latitude
      : originCoords.lat;
    const startLng = (driverGpsLocation && typeof driverGpsLocation.longitude === 'number')
      ? driverGpsLocation.longitude
      : originCoords.lng;
    const dLat = destCoords.lat;
    const dLng = destCoords.lng;

    const localRoad = getCorridorRoadPolylineLocal(oName, dName, startLat, startLng, dLat, dLng);
    if (localRoad && localRoad.length >= 5) {
      return localRoad;
    }

    // 3. Fallback: connect waypoints if custom rural route
    if (WAYPOINTS && WAYPOINTS.length >= 2) {
      return WAYPOINTS.map((w) => ({ lat: w.lat, lng: w.lng }));
    }

    return [{ lat: startLat, lng: startLng }, { lat: dLat, lng: dLng }];
  }, [
    liveOsmRoad,
    activeTrip,
    origin,
    dest,
    originCoords,
    destCoords,
    WAYPOINTS,
    driverGpsLocation?.latitude,
    driverGpsLocation?.longitude,
  ]);

  // Truck geographic coordinates interpolated along the curved highway road with Anti-Jitter Stationary Lock
  const truckGeo = useMemo(() => {
    const route = ROAD_POINTS.length >= 2 ? ROAD_POINTS : WAYPOINTS.map((w) => ({ lat: w.lat, lng: w.lng }));

    // 1. High-Precision Real GPS Snapping on Expo Mobile with Deadband Filter
    if (driverGpsLocation && typeof driverGpsLocation.latitude === 'number' && typeof driverGpsLocation.longitude === 'number' && route.length >= 2) {
      const isStationary = !isInTransit || !isDrivingState || (driverGpsLocation.speedKmh ?? 0) < 3.0;

      // When stationary or resting, anchor coordinates within 25m to eliminate jitter
      if (isStationary && stableLocationRef.current) {
        const delta = Math.hypot(
          driverGpsLocation.latitude - stableLocationRef.current.lat,
          driverGpsLocation.longitude - stableLocationRef.current.lng
        );
        if (delta < 0.00025) {
          return stableLocationRef.current;
        }
      }

      let bestDist = Infinity;
      let bestIdx = 0;
      for (let i = 0; i < route.length; i++) {
        const d = Math.hypot(route[i].lat - driverGpsLocation.latitude, route[i].lng - driverGpsLocation.longitude);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      const roadPt = route[bestIdx];
      const lookAhead = Math.min(route.length - 1, bestIdx + 4);
      const nextPt = route[lookAhead] || roadPt;
      const dy = nextPt.lat - roadPt.lat;
      const dx = (nextPt.lng - roadPt.lng) * Math.cos((roadPt.lat * Math.PI) / 180);
      const roadHeading = nextPt !== roadPt
        ? Math.round(((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360)
        : 0;

      // Authentic Google Maps navigation: automatically aligns camera along the upcoming road
      const heading = (isMoving && typeof driverGpsLocation.heading === 'number' && driverGpsLocation.heading > 0 && (driverGpsLocation.speedKmh ?? 0) > 12)
        ? driverGpsLocation.heading
        : roadHeading;

      // When stationary or resting, freeze heading to prevent 3D canvas spinning
      if (isStationary && stableLocationRef.current && stableLocationRef.current.heading) {
        // Keep stable road heading
      }

      let result: { lat: number; lng: number; heading: number };
      // Snap within ~3.5 km of highway corridor to stay glued to asphalt
      if (bestDist < 0.035) {
        result = { lat: roadPt.lat, lng: roadPt.lng, heading };
      } else {
        result = { lat: driverGpsLocation.latitude, lng: driverGpsLocation.longitude, heading };
      }

      stableLocationRef.current = result;
      return result;
    }

    if (!isInTransit || tick <= 0 || route.length === 0) {
      const p0 = route[0] || { lat: 9.852, lng: 39.761 };
      const p1 = route[1] || p0;
      const heading = p1 !== p0
        ? Math.round(((Math.atan2(p1.lng - p0.lng, p1.lat - p0.lat) * 180) / Math.PI + 360) % 360)
        : 215;
      return { lat: p0.lat, lng: p0.lng, heading };
    }
    const segs = route.length - 1;
    const idx = (tick / 100) * segs;
    const i = Math.min(Math.floor(idx), segs - 1);
    const f = idx - i;
    const p1 = route[i];
    const p2 = route[i + 1] ?? p1;
    const lat = p1.lat + (p2.lat - p1.lat) * f;
    const lng = p1.lng + (p2.lng - p1.lng) * f;
    const heading = Math.round(
      ((Math.atan2(p2.lng - p1.lng, p2.lat - p1.lat) * 180) / Math.PI + 360) % 360
    );
    return { lat, lng, heading };
  }, [isInTransit, tick, ROAD_POINTS, WAYPOINTS, driverGpsLocation, isDrivingState]);

  // Keep references in sync for gesture callbacks
  useEffect(() => {
    truckHeadingRef.current = truckGeo.heading;
  }, [truckGeo.heading]);

  useEffect(() => {
    manualHeadingRef.current = manualHeading;
  }, [manualHeading]);

  // Active map camera heading: manual hand rotation overrides vehicle heading, North-Up sets 0°
  // When stationary, anchor to stable heading so camera never rotates or spins
  const activeHeading = isNorthUp
    ? 0
    : (manualHeading !== null
        ? manualHeading
        : (isMoving ? truckGeo.heading : (stableLocationRef.current?.heading ?? truckGeo.heading)));

  // Route center coordinates & span (accounts for all highway curves and waypoints)
  const routeCenter = useMemo(() => {
    const points = ROAD_POINTS.length >= 2 ? ROAD_POINTS : WAYPOINTS;
    if (!points || points.length === 0) {
      return { lat: 9.43, lng: 39.26, maxSpan: 1.0, baseZ: 9 };
    }
    const lats = points.map((w) => w.lat);
    const lngs = points.map((w) => w.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const maxSpan = Math.max(latSpan, lngSpan);

    // Exact zoom level determination matching Web App (Image 1)
    let baseZ = 8;
    if (maxSpan < 1.3) baseZ = 9; // e.g. Debre Sina to Addis Ababa (Zoom 9 shows Fitche, Debre Birhan, Addis Ababa)
    else if (maxSpan < 2.8) baseZ = 8;
    else baseZ = 7; // e.g. Addis Ababa to Djibouti

    return {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
      maxSpan,
      baseZ,
    };
  }, [ROAD_POINTS, WAYPOINTS]);

  // ── True Web Mercator Projection for Pixel Mapping ──
  const createMercatorProjector = (
    curW: number,
    curH: number,
    curZoom: number,
    curPan: { x: number; y: number },
    followTruck: boolean
  ) => {
    // When following truck, use street/highway navigation driving zoom level (Z=15) centered on vehicle
    // When in overview, use comfortable corridor zoom level (Z=10 or 11) centered between vehicle and destination
    let effectiveZ: number;
    let localScale: number;

    if (followTruck) {
      // True turn-by-turn driving zoom (Z=15) - crisp OSM tiles and sharp highway curves
      effectiveZ = 15;
      localScale = curZoom * 1.15;
    } else {
      // Comfortable corridor overview towards destination (Z=10 or 11)
      const latDiff = Math.abs(truckGeo.lat - destCoords.lat);
      const lngDiff = Math.abs(truckGeo.lng - destCoords.lng);
      const span = Math.max(latDiff, lngDiff);
      const overviewBaseZ = span < 0.8 ? 12 : span < 1.8 ? 11 : span < 3.5 ? 10 : 9;
      effectiveZ = overviewBaseZ;
      localScale = curZoom;
    }
    const centerCoord = followTruck
      ? truckGeo
      : {
          lat: (truckGeo.lat + destCoords.lat) / 2,
          lng: (truckGeo.lng + destCoords.lng) / 2,
        };
    const centerMerc = toMercator(centerCoord.lat, centerCoord.lng, effectiveZ);

    const geo2px = (lat: number, lng: number) => {
      const pt = toMercator(lat, lng, effectiveZ);
      const x = (pt.x - centerMerc.x) * localScale + curW / 2 + curPan.x;
      const y = (pt.y - centerMerc.y) * localScale + curH / 2 + curPan.y;
      return { x, y };
    };
    // Calculate tiles covering visible screen with zero seams
    const halfW = curW / 2;
    const halfH = curH / 2;
    const effPanX = curPan.x;
    const effPanY = curPan.y;

    const leftMerc = centerMerc.x + (-halfW - effPanX) / localScale;
    const rightMerc = centerMerc.x + (halfW - effPanX) / localScale;
    const topMerc = centerMerc.y + (-halfH - effPanY) / localScale;
    const bottomMerc = centerMerc.y + (halfH - effPanY) / localScale;

    const colMin = Math.floor(leftMerc / 256);
    const colMax = Math.floor(rightMerc / 256);
    const rowMin = Math.floor(topMerc / 256);
    const rowMax = Math.floor(bottomMerc / 256);

    const maxTilesAtZ = Math.pow(2, effectiveZ);
    const tiles: Array<{
      col: number;
      row: number;
      z: number;
      x: number;
      y: number;
      w: number;
      h: number;
    }> = [];

    for (let col = colMin; col <= colMax; col++) {
      for (let row = rowMin; row <= rowMax; row++) {
        if (row < 0 || row >= maxTilesAtZ) continue;
        const normCol = ((col % maxTilesAtZ) + maxTilesAtZ) % maxTilesAtZ;

        const x = (col * 256 - centerMerc.x) * localScale + halfW + effPanX;
        const y = (row * 256 - centerMerc.y) * localScale + halfH + effPanY;
        // +1px overlap completely eliminates any hairline gaps/seams between tiles!
        const w = 256 * localScale + 1;
        const h = 256 * localScale + 1;

        tiles.push({ col: normCol, row, z: effectiveZ, x, y, w, h });
      }
    }

    return { geo2px, tiles, effectiveZ };
  };

  const inlineProj = useMemo(
    () => createMercatorProjector(W, H, zoom, panOffset, isFollowTruck),
    [W, H, zoom, panOffset, isFollowTruck, destCoords, truckGeo]
  );

  // Compute pixel points for corridor polyline (Inline) following authentic curving highway geometry
  const corridorRoutePoints = useMemo(() => {
    const pts = ROAD_POINTS.length >= 2 ? ROAD_POINTS : WAYPOINTS;
    return pts.map((p) => {
      const pt = inlineProj.geo2px(p.lat, p.lng);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  }, [ROAD_POINTS, WAYPOINTS, inlineProj]);

  // Completed route segment points (green trace when in transit) along curved road
  const truckInlinePt = useMemo(() => inlineProj.geo2px(truckGeo.lat, truckGeo.lng), [inlineProj, truckGeo]);

  const donePoints = useMemo(() => {
    const route = ROAD_POINTS.length >= 2 ? ROAD_POINTS : WAYPOINTS;
    if (!isInTransit || tick <= 0 || route.length === 0) return '';
    const segs = route.length - 1;
    const currentProgressIndex = (tick / 100) * segs;
    const segmentIndex = Math.min(Math.floor(currentProgressIndex), segs - 1);

    const pts = route.slice(0, segmentIndex + 1).map((p) => {
      const pt = inlineProj.geo2px(p.lat, p.lng);
      return `${pt.x},${pt.y}`;
    });
    pts.push(`${truckInlinePt.x},${truckInlinePt.y}`);
    return pts.join(' ');
  }, [isInTransit, tick, ROAD_POINTS, WAYPOINTS, inlineProj, truckInlinePt]);

  // Next upcoming waypoint along corridor
  const nextWaypoint = useMemo(() => {
    if (!WAYPOINTS || WAYPOINTS.length === 0) return null;
    if (!isInTransit || tick <= 0) return WAYPOINTS[1] || WAYPOINTS[0];
    const segs = WAYPOINTS.length - 1;
    const curIdx = Math.min(segs, Math.floor((tick / 100) * segs) + 1);
    return WAYPOINTS[curIdx] || WAYPOINTS[segs];
  }, [WAYPOINTS, isInTransit, tick]);

  const completedKm = Math.round(totalRoadKm * (tick / 100));
  const remainingKm = Math.max(0, totalRoadKm - completedKm);

  // Highway shield determination (A2 for North-South Ethiopian Corridor, A1 for Djibouti, A8 for Hawassa)
  const highwayShield = useMemo(() => {
    const o = (activeTrip?.origin || '').toLowerCase();
    const d = (activeTrip?.destination || '').toLowerCase();
    if (o.includes('djibouti') || d.includes('djibouti') || o.includes('adama') || d.includes('adama') || o.includes('dire') || d.includes('dire')) {
      return 'A1';
    }
    if (o.includes('hawassa') || d.includes('hawassa')) {
      return 'A8';
    }
    return 'A2';
  }, [activeTrip?.origin, activeTrip?.destination]);

  // Dynamic Live Position Intelligence (Resolves exact real town/corridor location of the truck)
  const driverCurrentLocation = useMemo(() => {
    const cleanOrigin = (origin || 'Origin Hub').split(',')[0].trim();
    const cleanDest = (dest || 'Destination Hub').split(',')[0].trim();

    if (!WAYPOINTS || WAYPOINTS.length === 0) {
      return {
        townName: cleanOrigin,
        shortTown: cleanOrigin,
        subText: 'At Dispatch Terminal',
        nextStopName: cleanDest,
        distToNext: totalRoadKm,
      };
    }

    // 1. If at start / awaiting departure
    if (!isInTransit || tick <= 0) {
      const firstWp = WAYPOINTS[1] ? WAYPOINTS[1].name.split(',')[0].trim() : cleanDest;
      const distToFirst = Math.max(1, Math.round(calculateCorridorRoadDistanceKm(
        origin,
        WAYPOINTS[1]?.name || dest,
        originCoords.lat,
        originCoords.lng,
        WAYPOINTS[1]?.lat || destCoords.lat,
        WAYPOINTS[1]?.lng || destCoords.lng
      )));
      const cleanOriginShort = cleanOrigin.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        townName: cleanOrigin.toLowerCase().includes('terminal') || cleanOrigin.toLowerCase().includes('depot')
          ? cleanOrigin
          : `${cleanOriginShort} Terminal`,
        shortTown: cleanOriginShort,
        subText: 'Vehicle at Origin Station · Ready to roll',
        nextStopName: firstWp,
        distToNext: distToFirst,
      };
    }

    // 2. If completed / reached destination
    if (tick >= 100) {
      return {
        townName: `${cleanDest} Hub`,
        shortTown: cleanDest,
        subText: 'Trip Completed · At Destination',
        nextStopName: 'Delivered',
        distToNext: 0,
      };
    }

    // 3. Find closest waypoint along route to current truck coordinate
    let closestWp = WAYPOINTS[0];
    let minWpDist = 999999;
    let closestIdx = 0;

    WAYPOINTS.forEach((wp, idx) => {
      const d = calculateCorridorRoadDistanceKm(
        origin,
        wp.name,
        truckGeo.lat,
        truckGeo.lng,
        wp.lat,
        wp.lng
      );
      if (d < minWpDist) {
        minWpDist = d;
        closestWp = wp;
        closestIdx = idx;
      }
    });

    const cleanClosest = closestWp.name.split(',')[0].trim();
    const nextWp = WAYPOINTS[closestIdx + 1] || WAYPOINTS[WAYPOINTS.length - 1];
    const cleanNext = nextWp.name.split(',')[0].trim();

    const distToNext = Math.max(1, Math.round(calculateCorridorRoadDistanceKm(
      origin,
      nextWp.name,
      truckGeo.lat,
      truckGeo.lng,
      nextWp.lat,
      nextWp.lng
    )));

    if (minWpDist <= 4.0) {
      return {
        townName: `${cleanClosest} Corridor`,
        shortTown: cleanClosest,
        subText: `At checkpoint · ${remainingKm} km left to ${cleanDest}`,
        nextStopName: cleanNext,
        distToNext: distToNext,
      };
    }

    return {
      townName: `${cleanClosest} Highway Sector`,
      shortTown: cleanClosest,
      subText: `Near ${cleanClosest} (${Math.round(minWpDist)} km) · heading to ${cleanNext}`,
      nextStopName: cleanNext,
      distToNext: distToNext,
    };
  }, [WAYPOINTS, isInTransit, tick, truckGeo, origin, dest, originCoords, destCoords, totalRoadKm, remainingKm]);

  // Turn-by-Turn Maneuver guidance matching Google Maps navigation
  const upcomingManeuver = useMemo(() => {
    if (!navModalFollowTruck) {
      return {
        arrow: '⤊',
        mainText: 'Corridor Overview',
        shield: highwayShield,
        thenArrow: 'B',
        subText: `${origin} ➔ ${dest} · ${remainingKm} km remaining`,
      };
    }

    let maneuverArrow = '⬆';
    let thenTurn = '↰';

    if (nextWaypoint) {
      if (nextWaypoint.type === 'SCALE_CHECK') {
        thenTurn = '↳';
      } else if (nextWaypoint.type === 'CHECKPOINT') {
        thenTurn = '↰';
      } else if (nextWaypoint.name.toLowerCase().includes('sina') || nextWaypoint.name.toLowerCase().includes('tunnel')) {
        thenTurn = '↱';
      }
    }

    return {
      arrow: maneuverArrow,
      mainText: driverCurrentLocation.nextStopName,
      shield: highwayShield,
      thenArrow: thenTurn,
      subText: `Currently: ${driverCurrentLocation.townName} • ${driverCurrentLocation.distToNext} km ahead`,
    };
  }, [driverCurrentLocation, nextWaypoint, highwayShield, origin, dest, navModalFollowTruck, remainingKm]);

  // Dynamic ETA Duration and Clock Arrival Time (e.g. "4 hr 20 min" • "5:14 am")
  const { etaDurationText, arrivalClockTime } = useMemo(() => {
    const calcSpeed = speed > 5 ? speed : 55;
    const hoursLeft = remainingKm > 0 ? remainingKm / calcSpeed : totalRoadKm / 55;
    const hrs = Math.floor(hoursLeft);
    const mins = Math.round((hoursLeft - hrs) * 60);

    const arrivalDate = new Date(Date.now() + hoursLeft * 3600000);
    const ampm = arrivalDate.getHours() >= 12 ? 'pm' : 'am';
    const formattedHr = arrivalDate.getHours() % 12 || 12;
    const formattedMin = String(arrivalDate.getMinutes()).padStart(2, '0');

    return {
      etaDurationText: hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`,
      arrivalClockTime: `${formattedHr}:${formattedMin} ${ampm}`,
    };
  }, [remainingKm, totalRoadKm, speed]);

  // 3D Canvas dimensions (enlarged to 3.5x to fully cover the horizon without dark bars)
  const nav3DW = Math.max(1600, Math.round(navW * 3.5));
  const nav3DH = Math.max(1800, Math.round(navH * 3.5));

  const nav3DProj = useMemo(() => {
    // When following truck, use street/highway driving navigation level (Z=16) centered on vehicle
    // When in overview, use comfortable corridor level (Z=10 or 11) centered towards destination
    let targetZ: number;
    let localScale: number;

    if (navModalFollowTruck) {
      targetZ = 16;
      localScale = nav3DZoom * 1.55;
    } else {
      const latDiff = Math.abs(truckGeo.lat - destCoords.lat);
      const lngDiff = Math.abs(truckGeo.lng - destCoords.lng);
      const span = Math.max(latDiff, lngDiff);
      const overviewBaseZ = span < 0.8 ? 12 : span < 1.8 ? 11 : span < 3.5 ? 10 : 9;
      targetZ = overviewBaseZ;
      localScale = nav3DZoom;
    }

    const centerCoord = navModalFollowTruck
      ? truckGeo
      : {
          lat: (truckGeo.lat + destCoords.lat) / 2,
          lng: (truckGeo.lng + destCoords.lng) / 2,
        };
    const centerMerc = toMercator(centerCoord.lat, centerCoord.lng, targetZ);

    const geo2px = (lat: number, lng: number) => {
      const pt = toMercator(lat, lng, targetZ);
      const x = (pt.x - centerMerc.x) * localScale + nav3DW / 2 + nav3DPanOffset.x;
      const y = (pt.y - centerMerc.y) * localScale + nav3DH / 2 + nav3DPanOffset.y;
      return { x, y };
    };

    const halfW = nav3DW / 2;
    const halfH = nav3DH / 2;
    const effPanX = nav3DPanOffset.x;
    const effPanY = nav3DPanOffset.y;

    const leftMerc = centerMerc.x + (-halfW - effPanX) / localScale;
    const rightMerc = centerMerc.x + (halfW - effPanX) / localScale;
    const topMerc = centerMerc.y + (-halfH - effPanY) / localScale;
    const bottomMerc = centerMerc.y + (halfH - effPanY) / localScale;

    const colMin = Math.floor(leftMerc / 256);
    const colMax = Math.floor(rightMerc / 256);
    const rowMin = Math.floor(topMerc / 256);
    const rowMax = Math.floor(bottomMerc / 256);

    const maxTilesAtZ = Math.pow(2, targetZ);
    const tiles: Array<{
      col: number;
      row: number;
      z: number;
      x: number;
      y: number;
      w: number;
      h: number;
    }> = [];

    const cMin = Math.max(0, colMin);
    const cMax = Math.min(maxTilesAtZ - 1, colMax);
    const rMin = Math.max(0, rowMin);
    const rMax = Math.min(maxTilesAtZ - 1, rowMax);

    for (let col = cMin; col <= cMax; col++) {
      for (let row = rMin; row <= rMax; row++) {
        const normCol = ((col % maxTilesAtZ) + maxTilesAtZ) % maxTilesAtZ;
        const x = (col * 256 - centerMerc.x) * localScale + halfW + effPanX;
        const y = (row * 256 - centerMerc.y) * localScale + halfH + effPanY;
        const w = 256 * localScale + 1;
        const h = 256 * localScale + 1;
        tiles.push({ col: normCol, row, z: targetZ, x, y, w, h });
      }
    }

    return { geo2px, tiles, effectiveZ: targetZ };
  }, [nav3DW, nav3DH, nav3DZoom, nav3DPanOffset, truckGeo, navModalFollowTruck, destCoords]);

  // Find where the truck is along the active road
  const truckRoadIdx = useMemo(() => {
    const route = ROAD_POINTS.length >= 2 ? ROAD_POINTS : WAYPOINTS;
    if (!route || route.length === 0) return 0;
    let bestIdx = 0;
    let minD = Infinity;
    for (let i = 0; i < route.length; i++) {
      const d = Math.hypot(route[i].lat - truckGeo.lat, route[i].lng - truckGeo.lng);
      if (d < minD) {
        minD = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [ROAD_POINTS, WAYPOINTS, truckGeo]);

  // Ahead road: follows the exact curving road geometry ahead of the truck (vibrant Google Maps blue)
  const nav3DRoutePoints = useMemo(() => {
    const route = ROAD_POINTS.length >= 2 ? ROAD_POINTS : WAYPOINTS;
    if (!route || route.length === 0) return '';
    const ahead = route.slice(truckRoadIdx);
    const truckPt = nav3DProj.geo2px(truckGeo.lat, truckGeo.lng);
    const pts = [`${truckPt.x},${truckPt.y}`];
    for (let i = 1; i < ahead.length; i++) {
      const pt = nav3DProj.geo2px(ahead[i].lat, ahead[i].lng);
      pts.push(`${pt.x},${pt.y}`);
    }
    return pts.join(' ');
  }, [ROAD_POINTS, WAYPOINTS, nav3DProj, truckRoadIdx, truckGeo]);

  // Completed road: follows the exact curving road geometry behind the truck (emerald green)
  const nav3DDonePoints = useMemo(() => {
    const route = ROAD_POINTS.length >= 2 ? ROAD_POINTS : WAYPOINTS;
    if (!isInTransit || truckRoadIdx <= 0 || route.length === 0) return '';
    const done = route.slice(0, truckRoadIdx);
    const pts = done.map((p) => {
      const pt = nav3DProj.geo2px(p.lat, p.lng);
      return `${pt.x},${pt.y}`;
    });
    const truckPt = nav3DProj.geo2px(truckGeo.lat, truckGeo.lng);
    pts.push(`${truckPt.x},${truckPt.y}`);
    return pts.join(' ');
  }, [isInTransit, truckRoadIdx, ROAD_POINTS, WAYPOINTS, nav3DProj, truckGeo]);

  // ── 3D Navigation Multi-Touch Handlers, Pinch Zoom & Wheel Listeners ──
  const nav3DLastPinchDistRef = useRef<number | null>(null);
  const nav3DLastTapTimeRef = useRef<number>(0);
  const nav3DContainerRef = useRef<View>(null);

  useEffect(() => {
    if (!isNavActive) return;
    const el = nav3DContainerRef.current as unknown as HTMLElement;
    if (!el || typeof el.addEventListener !== 'function') return;

    let initialPinchDist: number | null = null;
    let initialAngle: number | null = null;
    let startHeading: number = 0;
    let startX: number | null = null;
    let startY: number | null = null;
    let lastTap = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialAngle = (Math.atan2(
          e.touches[1].clientY - e.touches[0].clientY,
          e.touches[1].clientX - e.touches[0].clientX
        ) * 180) / Math.PI;
        startHeading = manualHeadingRef.current !== null ? manualHeadingRef.current : truckHeadingRef.current;
      } else if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        const now = Date.now();
        if (now - lastTap < 320) {
          e.preventDefault();
          setNav3DZoom((z) => Math.min(8.0, Math.max(0.35, Math.round(z * 1.35 * 100) / 100)));
          lastTap = 0;
        } else {
          lastTap = now;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        const curDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const curAngle = (Math.atan2(
          e.touches[1].clientY - e.touches[0].clientY,
          e.touches[1].clientX - e.touches[0].clientX
        ) * 180) / Math.PI;

        // 1. Two-finger twist 360° hand rotation
        if (initialAngle === null) {
          initialAngle = curAngle;
          startHeading = manualHeadingRef.current !== null ? manualHeadingRef.current : truckHeadingRef.current;
        } else {
          let deltaAngle = curAngle - initialAngle;
          if (deltaAngle > 180) deltaAngle -= 360;
          if (deltaAngle < -180) deltaAngle += 360;
          if (Math.abs(deltaAngle) > 2) {
            const nextH = Math.round(((startHeading - deltaAngle) % 360 + 360) % 360);
            setManualHeading(nextH);
            setIsNorthUp(false);
          }
        }

        // 2. Two-finger continuous pinch to zoom in & zoom out (Smooth & Flexible up to 800%)
        if (initialPinchDist === null || initialPinchDist <= 5) {
          initialPinchDist = curDist;
        } else {
          const factor = curDist / initialPinchDist;
          if (Number.isFinite(factor) && factor > 0.4 && factor < 2.5) {
            setNav3DZoom((prevZoom) => {
              const next = prevZoom * factor;
              return Math.min(8.0, Math.max(0.35, next));
            });
          }
          initialPinchDist = curDist;
        }
        return;
      }

      // Single-finger drag panning
      if (e.touches.length === 1 && startX !== null && startY !== null) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          e.preventDefault();
          setNav3DPanOffset((prev) => ({
            x: Math.max(-800, Math.min(800, prev.x + dx * 0.85)),
            y: Math.max(-800, Math.min(800, prev.y + dy * 0.85)),
          }));
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }
      }
    };

    const handleTouchEnd = () => {
      initialPinchDist = null;
      initialAngle = null;
      startX = null;
      startY = null;
    };

    // Wheel zoom on desktop mouse and trackpad pinch
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      setNav3DZoom((z) => Math.min(8.0, Math.max(0.35, Math.round(z * factor * 1000) / 1000)));
    };

    // Double-click zoom on desktop
    const handleDblClick = (e: MouseEvent) => {
      e.preventDefault();
      setNav3DZoom((z) => Math.min(8.0, Math.max(0.35, Math.round(z * 1.35 * 100) / 100)));
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('dblclick', handleDblClick);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('dblclick', handleDblClick);
    };
  }, [isNavActive]);

  // React Native PanResponder for native mobile devices (360° hand rotation + pinch zoom)
  const nav3DLastAngleRef = useRef<number | null>(null);

  const nav3DPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: (evt) => {
          return !!(evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 2);
        },
        onMoveShouldSetPanResponder: (evt, g) => {
          if (evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 2) return true;
          return Math.abs(g.dx) > 2.5 || Math.abs(g.dy) > 2.5;
        },
        onMoveShouldSetPanResponderCapture: (evt) => {
          return !!(evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 2);
        },
        onPanResponderGrant: (evt) => {
          nav3DStartPanRef.current = { ...nav3DPanOffset };
          const touches = evt.nativeEvent.touches;
          const now = Date.now();

          // 1-Finger Double-Tap to Zoom In
          if (!touches || touches.length <= 1) {
            if (now - nav3DLastTapTimeRef.current < 320) {
              setNav3DZoom((prevZoom) => Math.min(8.0, Math.max(0.35, prevZoom * 1.35)));
              nav3DLastTapTimeRef.current = 0;
            } else {
              nav3DLastTapTimeRef.current = now;
            }
            nav3DLastPinchDistRef.current = null;
            nav3DLastAngleRef.current = null;
            return;
          }

          // 2-Finger Touch Down: initialize pinch baseline and rotation angle
          if (touches.length >= 2) {
            nav3DLastPinchDistRef.current = Math.hypot(
              touches[0].pageX - touches[1].pageX,
              touches[0].pageY - touches[1].pageY
            );
            nav3DLastAngleRef.current = (Math.atan2(
              touches[1].pageY - touches[0].pageY,
              touches[1].pageX - touches[0].pageX
            ) * 180) / Math.PI;
          }
        },
        onPanResponderMove: (evt, g) => {
          const touches = evt.nativeEvent.touches;

          if (touches && touches.length >= 2) {
            const currentDist = Math.hypot(
              touches[0].pageX - touches[1].pageX,
              touches[0].pageY - touches[1].pageY
            );
            const currentAngle = (Math.atan2(
              touches[1].pageY - touches[0].pageY,
              touches[1].pageX - touches[0].pageX
            ) * 180) / Math.PI;

            // 1. Two-finger twist 360° hand rotation
            if (nav3DLastAngleRef.current === null) {
              nav3DLastAngleRef.current = currentAngle;
            } else {
              let delta = currentAngle - nav3DLastAngleRef.current;
              if (delta > 180) delta -= 360;
              if (delta < -180) delta += 360;
              if (Math.abs(delta) > 1.5) {
                setManualHeading((prev) => {
                  const base = prev !== null ? prev : truckHeadingRef.current;
                  return Math.round(((base - delta) % 360 + 360) % 360);
                });
                setIsNorthUp(false);
                nav3DLastAngleRef.current = currentAngle;
              }
            }

            // 2. Two-finger continuous pinch to zoom in & zoom out (Smooth & Flexible up to 800%)
            if (nav3DLastPinchDistRef.current === null || nav3DLastPinchDistRef.current <= 5) {
              nav3DLastPinchDistRef.current = currentDist;
            } else {
              const factor = currentDist / nav3DLastPinchDistRef.current;
              if (Number.isFinite(factor) && factor > 0.4 && factor < 2.5) {
                setNav3DZoom((prevZoom) => {
                  const next = prevZoom * factor;
                  return Math.min(8.0, Math.max(0.35, next));
                });
              }
              nav3DLastPinchDistRef.current = currentDist;
            }
            return;
          }

          nav3DLastPinchDistRef.current = null;
          nav3DLastAngleRef.current = null;

          // Single-finger smooth panning with boundary clamping
          setNav3DPanOffset({
            x: Math.max(-800, Math.min(800, nav3DStartPanRef.current.x + g.dx)),
            y: Math.max(-800, Math.min(800, nav3DStartPanRef.current.y + g.dy)),
          });
        },
        onPanResponderRelease: () => {
          nav3DLastPinchDistRef.current = null;
          nav3DLastAngleRef.current = null;
        },
        onPanResponderTerminate: () => {
          nav3DLastPinchDistRef.current = null;
          nav3DLastAngleRef.current = null;
        },
      }),
    []
  );

  // Continuous Delta Pinch & Tap Gesture Handlers (Inline Map)
  const lastPinchDistRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Direct DOM Ref for clean non-passive wheel zoom (eliminates 'Unable to preventDefault inside passive listener' errors)
  const inlineMapRef = useRef<View>(null);

  useEffect(() => {
    const el = inlineMapRef.current as unknown as HTMLElement;
    if (!el || typeof el.addEventListener !== 'function') return;

    let inlinePinchDist: number | null = null;
    let startX: number | null = null;
    let startY: number | null = null;
    let lastTap = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        inlinePinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      } else if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        const now = Date.now();
        if (now - lastTap < 320) {
          e.preventDefault();
          setZoom((z) => Math.min(8.0, Math.max(0.35, Math.round(z * 1.35 * 100) / 100)));
          lastTap = 0;
        } else {
          lastTap = now;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // 1. Two-finger continuous pinch to zoom in & out (Smooth & Flexible up to 800%)
      if (e.touches.length >= 2) {
        e.preventDefault();
        const curDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (inlinePinchDist === null || inlinePinchDist <= 5) {
          inlinePinchDist = curDist;
        } else {
          const factor = curDist / inlinePinchDist;
          if (Number.isFinite(factor) && factor > 0.4 && factor < 2.5) {
            setZoom((prevZoom) => {
              const next = prevZoom * factor;
              return Math.min(8.0, Math.max(0.35, next));
            });
          }
          inlinePinchDist = curDist;
        }
        return;
      }

      // 2. Single-finger drag panning
      if (e.touches.length === 1 && startX !== null && startY !== null) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          e.preventDefault();
          setIsFollowTruck(false);
          setPanOffset((prev) => ({
            x: Math.max(-800, Math.min(800, prev.x + dx * 0.9)),
            y: Math.max(-800, Math.min(800, prev.y + dy * 0.9)),
          }));
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }
      }
    };

    const handleTouchEnd = () => {
      inlinePinchDist = null;
      startX = null;
      startY = null;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      setZoom((z) => Math.min(8.0, Math.max(0.35, z * factor)));
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Inline Pan Responder with Double-Tap Zoom & High-Sensitivity Pinch
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: (evt) => {
          return !!(evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 2);
        },
        onMoveShouldSetPanResponder: (evt, g) => {
          if (evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 2) return true;
          return Math.abs(g.dx) > 1.5 || Math.abs(g.dy) > 1.5;
        },
        onMoveShouldSetPanResponderCapture: (evt) => {
          return !!(evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 2);
        },
        onPanResponderGrant: (evt) => {
          startPanOffsetRef.current = { ...panOffset };
          setIsFollowTruck(false);
          onMapInteractionChange?.(true);

          const touches = evt.nativeEvent.touches;
          const now = Date.now();

          // 1-Finger Double-Tap to Zoom In (Google Maps standard)
          if (!touches || touches.length <= 1) {
            if (now - lastTapTimeRef.current < 320) {
              setZoom((prevZoom) => Math.min(8.0, Math.max(0.35, prevZoom * 1.35)));
              lastTapTimeRef.current = 0;
            } else {
              lastTapTimeRef.current = now;
            }
            lastPinchDistRef.current = null;
            return;
          }

          // 2-Finger Touch Down: initialize pinch baseline immediately
          if (touches.length >= 2) {
            lastPinchDistRef.current = Math.hypot(
              touches[0].pageX - touches[1].pageX,
              touches[0].pageY - touches[1].pageY
            );
          }
        },
        onPanResponderMove: (evt, g) => {
          const touches = evt.nativeEvent.touches;

          // Two-finger continuous pinch to zoom in & zoom out (Smooth & Flexible up to 800%)
          if (touches && touches.length >= 2) {
            const currentDist = Math.hypot(
              touches[0].pageX - touches[1].pageX,
              touches[0].pageY - touches[1].pageY
            );

            if (lastPinchDistRef.current === null || lastPinchDistRef.current <= 5) {
              lastPinchDistRef.current = currentDist;
            } else {
              const factor = currentDist / lastPinchDistRef.current;
              if (Number.isFinite(factor) && factor > 0.4 && factor < 2.5) {
                setZoom((prevZoom) => {
                  const next = prevZoom * factor;
                  return Math.min(8.0, Math.max(0.35, next));
                });
              }
              lastPinchDistRef.current = currentDist;
            }
            return;
          }

          lastPinchDistRef.current = null;

          // Single-finger smooth panning with boundary clamping
          const maxPanX = W * 1.5;
          const maxPanY = H * 1.5;
          setPanOffset({
            x: Math.max(-maxPanX, Math.min(maxPanX, startPanOffsetRef.current.x + g.dx)),
            y: Math.max(-maxPanY, Math.min(maxPanY, startPanOffsetRef.current.y + g.dy)),
          });
        },
        onPanResponderRelease: () => {
          lastPinchDistRef.current = null;
          onMapInteractionChange?.(false);
        },
        onPanResponderTerminate: () => {
          lastPinchDistRef.current = null;
          onMapInteractionChange?.(false);
        },
      }),
    [onMapInteractionChange, W, H, panOffset]
  );

  // Zoom Button Handlers (Inline Map up to 800%)
  const handleZoomIn = () => {
    setZoom((z) => Math.min(8.0, Math.round((z + 0.35) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.35, Math.round((z - 0.35) * 100) / 100));
  };

  const handleFollowTruck = () => {
    setZoom(1.0);
    setIsFollowTruck(true);
    setPanOffset({ x: 0, y: 0 });
    setSelectedWp(null);
  };

  const handleResetRoute = () => {
    setZoom(1.0);
    setIsFollowTruck(false);
    setPanOffset({ x: 0, y: 0 });
    setSelectedWp(null);
  };

  const handleStartTripWith3D = () => {
    setIsFollowTruck(true);
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
    setNavModalFollowTruck(true);
    setIsNorthUp(false);
    onStartTrip?.();
  };

  if (!activeTrip) {
    return (
      <View style={s.card}>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="map-outline" size={15} color="#0284C7" />
              <Text style={s.title}>REALTIME CORRIDOR MAP</Text>
              <View style={[s.badgeLive, { backgroundColor: '#374151' }]}>
                <Text style={s.badgeLiveTxt}>AWAITING DISPATCH</Text>
              </View>
            </View>
            <Text style={s.sub}>No active trip assigned</Text>
          </View>
        </View>
        <View style={{ height: 160, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1120', borderRadius: 12, marginVertical: 8, padding: 16 }}>
          <Ionicons name="bus-outline" size={36} color="#64748B" style={{ marginBottom: 8 }} />
          <Text style={{ color: '#F9FAFB', fontSize: 14, fontWeight: '700', textAlign: 'center' }}>
            No Active Trip Dispatched
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            Turn-by-turn navigation, checkpoints, and real-time corridor directions will appear here once assigned.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.card}>
      {/* ── Inline Header ── */}
      <View style={s.headerRow}>
        {/* Row 1: Title, Status Badge & Layer Switcher */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="map-outline" size={15} color="#0284C7" />
            <Text style={s.title}>CORRIDOR MAP</Text>
            <View
              style={[
                s.badgeLive,
                {
                  backgroundColor: isInTransit
                    ? (isMoving ? '#065F46' : '#92400E')
                    : '#0284C7',
                },
              ]}
            >
              <Text style={s.badgeLiveTxt}>
                {isInTransit
                  ? (isMoving ? 'DRIVING' : 'STATIONARY')
                  : 'READY AT ORIGIN'}
              </Text>
            </View>
          </View>

          <View style={s.switcher}>
            {(['osm', 'sat'] as const).map((l) => (
              <TouchableOpacity
                key={l}
                style={[s.btn, layer === l && s.btnActive]}
                onPress={() => {
                  userManuallySelectedLayerRef.current = true;
                  setLayer(l);
                }}
              >
                <Text style={[s.btnTxt, layer === l && s.btnTxtActive]}>
                  {l === 'osm' ? 'OSM' : 'Sat'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Row 2: Full-width Corridor Route & 3D Navigation Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={[s.sub, { flex: 1, marginRight: 8 }]} numberOfLines={1}>
            {totalRoadKm} km · {origin} ➔ {dest}
          </Text>
          <TouchableOpacity
            style={s.nav3dLaunchBtn}
            onPress={() => {
              setIsNorthUp(false);
              setManualHeading(null);
              setNavModalFollowTruck(true);
              setNav3DZoom(1.0);
              setNav3DPanOffset({ x: 0, y: 0 });
              setIsNavActive(true);
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="compass" size={12} color="#FFFFFF" />
              <Text style={s.nav3dLaunchTxt}>3D Navigation</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Inline Map Frame ── */}
      <View
        ref={inlineMapRef}
        style={[s.mapFrame, { height: H }]}
        onLayout={(e: LayoutChangeEvent) => {
          const w = Math.floor(e.nativeEvent.layout.width);
          if (w > 0) setContainerW(w);
        }}
        {...panResponder.panHandlers}
      >
        {/* Floating Recenter Button when panned away or in overview */}
        {(panOffset.x !== 0 || panOffset.y !== 0 || !isFollowTruck) && (
          <TouchableOpacity
            style={s.inlineRecenterBtn}
            onPress={handleFollowTruck}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={12} color="#FFFFFF" />
            <Text style={s.inlineRecenterTxt}>Recenter</Text>
          </TouchableOpacity>
        )}

        {/* Compact Zoom Control Pill (Bottom-left, never collides with route!) */}
        <View style={s.inlineZoomControl} pointerEvents="box-none">
          <TouchableOpacity style={s.compactZoomBtn} onPress={handleZoomIn} activeOpacity={0.7}>
            <Text style={s.compactZoomBtnTxt}>＋</Text>
          </TouchableOpacity>
          <View style={s.compactZoomBadge}>
            <Text style={s.compactZoomBadgeTxt}>{Math.round(zoom * 100)}%</Text>
          </View>
          <TouchableOpacity style={s.compactZoomBtn} onPress={handleZoomOut} activeOpacity={0.7}>
            <Text style={s.compactZoomBtnTxt}>－</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Seamless Web Mercator Map Tiles */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {inlineProj.tiles.map((t) => (
            <Image
              key={`inline-${t.z}-${t.col}-${t.row}`}
              source={{
                uri: tileUrl(layer, t.col, t.row, t.z),
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 TradeFlow-Corridor/2.0',
                  'Referer': 'https://tradeflow.et/',
                },
              }}
              style={{
                position: 'absolute',
                left: t.x,
                top: t.y,
                width: t.w,
                height: t.h,
              }}
              resizeMode="cover"
              fadeDuration={100}
              onError={handleTileError}
            />
          ))}
        </View>

        {/* 2. SVG Telematics & Route Layer (Exact match with Web App) */}
        <Svg width={W} height={H} style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {/* Subtle Dashed Checkpoint Zone Circles */}
          {WAYPOINTS.slice(1, -1).map((wp) => {
            const p = inlineProj.geo2px(wp.lat, wp.lng);
            return (
              <Circle
                key={`zone-${wp.id}`}
                cx={p.x}
                cy={p.y}
                r={24}
                fill="rgba(245, 158, 11, 0.08)"
                stroke="#F59E0B"
                strokeWidth={1.2}
                strokeDasharray="4, 4"
              />
            );
          })}

          {/* 1. AUTHENTIC HIGHWAY NAVIGATION ROUTE (Solid Google Maps Blue with Contrast Border) */}
          {corridorRoutePoints.length > 0 && (
            <>
              {/* Outer Border / Casing for High Contrast on any Map Layer (OSM, Satellite, Roads) */}
              <Polyline
                points={corridorRoutePoints}
                fill="none"
                stroke="#1E3A8A"
                strokeWidth={isFollowTruck ? 10.0 : 7.0}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.88}
              />
              {/* Solid Vibrant Google Maps Navigation Blue Core Line */}
              <Polyline
                points={corridorRoutePoints}
                fill="none"
                stroke="#2563EB"
                strokeWidth={isFollowTruck ? 6.5 : 4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* 2. COMPLETED ROUTE SEGMENT (Solid Emerald Green Trace) */}
          {donePoints.length > 0 && (
            <>
              <Polyline
                points={donePoints}
                fill="none"
                stroke="#064E3B"
                strokeWidth={isFollowTruck ? 10.5 : 7.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.92}
              />
              <Polyline
                points={donePoints}
                fill="none"
                stroke="#10B981"
                strokeWidth={isFollowTruck ? 6.8 : 4.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* 3. Key Intermediate Checkpoint & Town Markers (with Visible Place Names) */}
          {WAYPOINTS.slice(1, -1).map((wp, idx) => {
            const p = inlineProj.geo2px(wp.lat, wp.lng);
            const isScale = wp.type === 'SCALE_CHECK' || wp.name.toLowerCase().includes('weighbridge');
            const isCustoms = wp.type === 'CHECKPOINT' || wp.name.toLowerCase().includes('customs');
            const iconBg = isCustoms ? '#0284C7' : isScale ? '#D97706' : '#334155';
            const townName = wp.name.split(',')[0].trim();
            const boxW = Math.max(74, Math.min(150, townName.length * 6.4 + 20));

            return (
              <G key={`wp-${wp.id}`} x={p.x} y={p.y}>
                {/* Pointer tip pointing directly to asphalt */}
                <Path d="M -3 -2 L 0 3 L 3 -2 Z" fill={iconBg} />
                {/* Checkpoint circular badge with index */}
                <Circle cx={0} cy={-13} r={11} fill={iconBg} stroke="#FFFFFF" strokeWidth={1.8} />
                <SvgText x={0} y={-9.5} textAnchor="middle" fontSize={8.5} fontWeight="900" fill="#FFFFFF">
                  {idx + 1}
                </SvgText>
                {/* High-Contrast Place Name Badge */}
                <Rect
                  x={-boxW / 2}
                  y={-41}
                  width={boxW}
                  height={16}
                  rx={4}
                  fill="#0F172A"
                  stroke={iconBg}
                  strokeWidth={1.2}
                />
                <SvgText
                  x={0}
                  y={-29}
                  textAnchor="middle"
                  fontSize={8.5}
                  fontWeight="800"
                  fill="#FFFFFF"
                >
                  {townName}
                </SvgText>
              </G>
            );
          })}

          {/* 4. POSTED ORIGIN MARKER (with Full Origin Place Name) */}
          {WAYPOINTS.length > 0 && (() => {
            const p0 = inlineProj.geo2px(WAYPOINTS[0].lat, WAYPOINTS[0].lng);
            const label = `Origin: ${origin}`;
            const boxW = Math.max(90, Math.min(180, label.length * 6.5 + 20));
            return (
              <G x={p0.x} y={p0.y}>
                <Path d="M -3 -1 L 0 3 L 3 -1 Z" fill="#10B981" />
                <Circle cx={0} cy={-13} r={13} fill="#10B981" stroke="#FFFFFF" strokeWidth={2} />
                <SvgText x={0} y={-9} textAnchor="middle" fontSize={10} fontWeight="900" fill="#FFFFFF">
                  A
                </SvgText>
                <Rect x={-boxW / 2} y={-44} width={boxW} height={18} rx={5} fill="#064E3B" stroke="#10B981" strokeWidth={1.2} />
                <SvgText x={0} y={-31} textAnchor="middle" fill="#FFFFFF" fontSize={9} fontWeight="900">
                  {label}
                </SvgText>
              </G>
            );
          })()}

          {/* 5. POSTED DESTINATION MARKER (with Full Destination Place Name) */}
          {WAYPOINTS.length > 1 && (() => {
            const pd = inlineProj.geo2px(WAYPOINTS[WAYPOINTS.length - 1].lat, WAYPOINTS[WAYPOINTS.length - 1].lng);
            const label = `Dest: ${dest}`;
            const boxW = Math.max(90, Math.min(180, label.length * 6.5 + 20));
            return (
              <G x={pd.x} y={pd.y}>
                <Path d="M -3 -1 L 0 3 L 3 -1 Z" fill="#0284C7" />
                <Circle cx={0} cy={-13} r={13} fill="#0284C7" stroke="#FFFFFF" strokeWidth={2} />
                <SvgText x={0} y={-9} textAnchor="middle" fontSize={10} fontWeight="900" fill="#FFFFFF">
                  B
                </SvgText>
                <Rect x={-boxW / 2} y={-44} width={boxW} height={18} rx={5} fill="#0369A1" stroke="#38BDF8" strokeWidth={1.2} />
                <SvgText x={0} y={-31} textAnchor="middle" fill="#FFFFFF" fontSize={9} fontWeight="900">
                  {label}
                </SvgText>
              </G>
            );
          })()}

          {/* 6. LIVE VEHICLE MARKER (Rotating Vehicle with White Arrow & Speed Tag - EXACT MATCH with Web App) */}
          <G x={truckInlinePt.x} y={truckInlinePt.y}>
            {/* Live Location Speech Bubble Tag above truck */}
            {(() => {
              const label = driverCurrentLocation.shortTown;
              const tagW = Math.max(70, Math.min(180, label.length * 7.2 + 16));
              return (
                <G>
                  <Path d="M -4 -17 L 0 -13 L 4 -17 Z" fill="#0F172A" />
                  <Rect
                    x={-tagW / 2}
                    y={-37}
                    width={tagW}
                    height={20}
                    rx={6}
                    fill="#0F172A"
                    stroke="#38BDF8"
                    strokeWidth={1.4}
                  />
                  <SvgText
                    x={0}
                    y={-23}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={9.5}
                    fontWeight="900"
                  >
                    {label}
                  </SvgText>
                </G>
              );
            })()}

            <Circle
              cx={0}
              cy={0}
              r={20}
              fill={isMoving ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}
              stroke={isMoving ? '#10B981' : '#F59E0B'}
              strokeWidth={1.5}
            />
            <Circle
              cx={0}
              cy={0}
              r={13}
              fill={isMoving ? '#0284C7' : '#D97706'}
              stroke="#FFFFFF"
              strokeWidth={2.2}
            />
            {/* White Directional Pointer Arrow */}
            <G transform={`rotate(${truckGeo.heading})`}>
              <Path d="M 0 -6 L 4 5 L 0 3 L -4 5 Z" fill="#FFFFFF" />
            </G>
            {/* Speed Badge Tag Below Vehicle */}
            <Rect
              x={-24}
              y={14}
              width={48}
              height={14}
              rx={4}
              fill="#0F172A"
              stroke={isMoving ? 'rgba(56, 189, 248, 0.4)' : 'rgba(245, 158, 11, 0.4)'}
              strokeWidth={0.8}
            />
            <SvgText
              x={0}
              y={24}
              textAnchor="middle"
              fill={isMoving ? '#38BDF8' : '#FCD34D'}
              fontSize={8}
              fontWeight="800"
            >
              {isInTransit ? (isMoving ? `${speed} km/h` : '⏸ 0 km/h') : '⏸ 0 km/h'}
            </SvgText>
          </G>
        </Svg>

        {/* Selected Waypoint Popover Banner */}
        {selectedWp && (
          <View style={s.waypointBanner}>
            <View style={{ flex: 1 }}>
              <Text style={s.waypointTitle}>{selectedWp.name}</Text>
              <Text style={s.waypointSub}>
                GPS: {selectedWp.lat.toFixed(4)}° N, {selectedWp.lng.toFixed(4)}° E · Type: {selectedWp.type}
              </Text>
            </View>
            <TouchableOpacity style={s.closeWpBtn} onPress={() => setSelectedWp(null)}>
              <Text style={{ color: '#94A3B8', fontWeight: 'bold', fontSize: 13 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Inline Action Bar (Cleanly placed BELOW map, NEVER overlapping the route!) ── */}
      <View style={s.cleanActionBar}>
        <TouchableOpacity
          style={[s.cleanActionPill, s.cleanActionPillActive, { flex: 1 }]}
          onPress={handleFollowTruck}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Ionicons name="navigate-circle" size={15} color="#FFFFFF" />
            <Text style={[s.cleanActionPillTxt, s.cleanActionPillTxtActive]}>
              Follow Vehicle (Close-Up)
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Inline Progress & Distance Bar ── */}
      <View style={s.footer}>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${Math.min(100, Math.max(0, tick))}%` }]} />
          <View
            style={[
              s.truckDot,
              { left: `${Math.min(94, Math.max(0, tick))}%` },
            ]}
          >
            <Ionicons name="bus" size={10} color="#FFFFFF" />
          </View>
        </View>
        <View style={s.routeRow}>
          <View style={s.routePt}>
            <View style={[s.dot, { backgroundColor: '#10B981' }]} />
            <Text style={s.routeTxt} numberOfLines={1}>{origin}</Text>
          </View>
          <Text style={s.pctTxt}>
            {tick.toFixed(0)}% • {completedKm} / {totalRoadKm} km
          </Text>
          <View style={[s.routePt, { justifyContent: 'flex-end' }]}>
            <View style={[s.dot, { backgroundColor: '#0284C7' }]} />
            <Text style={s.routeTxt} numberOfLines={1}>{dest}</Text>
          </View>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 3D GOOGLE MAPS TURN-BY-TURN NAVIGATION MODAL ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={isNavActive}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsNavActive(false)}
      >
        <SafeAreaView style={s.navModalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#054740" />

          <View
            ref={nav3DContainerRef}
            style={s.nav3dContainer}
            {...nav3DPanResponder.panHandlers}
          >
            {/* 3D Tilted & Rotated Map Canvas */}
            <View
              style={{
                position: 'absolute',
                left: Math.round(navW / 2 - nav3DW / 2),
                top: Math.round((navModalFollowTruck ? navH * 0.70 : navH * 0.50) - nav3DH / 2),
                width: nav3DW,
                height: nav3DH,
                transform: [
                  { perspective: navModalFollowTruck ? 900 : 0 },
                  { rotateX: !navModalFollowTruck || isNorthUp ? '0deg' : '48deg' },
                  { rotateZ: navModalFollowTruck ? `${-activeHeading}deg` : '0deg' },
                ],
              }}
              pointerEvents="none"
            >
              {/* 1. Map Tiles */}
              {nav3DProj.tiles.map((t) => (
                <Image
                  key={`nav3d-${t.z}-${t.col}-${t.row}`}
                  source={{
                    uri: tileUrl(layer, t.col, t.row, t.z),
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 TradeFlow-Corridor/2.0',
                      'Referer': 'https://tradeflow.et/',
                    },
                  }}
                  style={{
                    position: 'absolute',
                    left: t.x,
                    top: t.y,
                    width: t.w,
                    height: t.h,
                  }}
                  resizeMode="cover"
                  fadeDuration={80}
                  onError={handleTileError}
                />
              ))}

              {/* Subtle Night Contrast Tint */}
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(5, 14, 28, 0.38)' }]} />

              {/* 2. SVG Route, Waypoints & Vehicle Puck */}
              <Svg width={nav3DW} height={nav3DH} style={StyleSheet.absoluteFillObject} pointerEvents="none">
                {/* Ahead Highway Route: Double-casing Google Maps solid blue */}
                {nav3DRoutePoints.length > 0 && (
                  <>
                    <Polyline
                      points={nav3DRoutePoints}
                      fill="none"
                      stroke="#082F49"
                      strokeWidth={26}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.92}
                    />
                    <Polyline
                      points={nav3DRoutePoints}
                      fill="none"
                      stroke="#00D2FF"
                      strokeWidth={16}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Completed Trajectory (Green Emerald Casing + Core) */}
                {nav3DDonePoints.length > 0 && (
                  <>
                    <Polyline
                      points={nav3DDonePoints}
                      fill="none"
                      stroke="#064E3B"
                      strokeWidth={26}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.94}
                    />
                    <Polyline
                      points={nav3DDonePoints}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth={16}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* 3D Highway Overhead Checkpoints & Place Name Billboards */}
                {WAYPOINTS.map((wp, idx) => {
                  const p = nav3DProj.geo2px(wp.lat, wp.lng);
                  if (p.x < 20 || p.x > nav3DW - 20 || p.y < 20 || p.y > nav3DH - 20) return null;
                  const isDest = idx === WAYPOINTS.length - 1;
                  const isOrigin = idx === 0;
                  const cleanName = wp.name.split(',')[0].trim();
                  const badgeColor = isDest ? '#0284C7' : isOrigin ? '#10B981' : '#F59E0B';
                  const badgeBorder = isDest ? '#38BDF8' : isOrigin ? '#34D399' : '#FBBF24';
                  const badgeTitle = isDest ? `B · ${cleanName}` : isOrigin ? `A · ${cleanName}` : `${idx + 1} · ${cleanName}`;
                  const badgeW = Math.max(110, Math.min(240, badgeTitle.length * 9.5 + 24));

                  return (
                    <G key={`wp-3d-${wp.id}`} x={p.x} y={p.y}>
                      {/* Pointer needle to the road surface */}
                      <Path d="M -6 -12 L 0 0 L 6 -12 Z" fill={badgeColor} />
                      
                      {/* Circular pin badge */}
                      <Circle
                        cx={0}
                        cy={-26}
                        r={18}
                        fill={badgeColor}
                        stroke="#FFFFFF"
                        strokeWidth={2.8}
                      />
                      <SvgText x={0} y={-20} textAnchor="middle" fontSize={14} fontWeight="900" fill="#FFFFFF">
                        {isDest ? 'B' : isOrigin ? 'A' : String(idx + 1)}
                      </SvgText>

                      {/* Prominent Highway Billboard with Clear Town / Place Name */}
                      <Rect
                        x={-badgeW / 2}
                        y={-68}
                        width={badgeW}
                        height={32}
                        rx={7}
                        fill="#0F172A"
                        stroke={badgeBorder}
                        strokeWidth={1.8}
                      />
                      <SvgText
                        x={0}
                        y={-47}
                        textAnchor="middle"
                        fontSize={13}
                        fontWeight="900"
                        fill="#FFFFFF"
                      >
                        {badgeTitle}
                      </SvgText>
                    </G>
                  );
                })}

                {/* ── LIVE VEHICLE NAVIGATION PUCK AT EXACT FOCAL POSITION ── */}
                {(() => {
                  const pTruck = nav3DProj.geo2px(truckGeo.lat, truckGeo.lng);
                  return (
                    <G x={pTruck.x} y={pTruck.y}>
                      {/* Pulsing beacon aura */}
                      <Circle cx={0} cy={0} r={52} fill="rgba(37, 99, 235, 0.22)" />
                      <Circle cx={0} cy={0} r={34} fill="rgba(56, 189, 248, 0.40)" stroke="#38BDF8" strokeWidth={2.0} />
                      
                      {/* Google Maps White Ring & Deep Blue Puck */}
                      <Circle cx={0} cy={0} r={20} fill="#2563EB" stroke="#FFFFFF" strokeWidth={4.5} />
                      <Circle cx={0} cy={0} r={8} fill="#FFFFFF" />

                      {/* Forward Navigation Arrow */}
                      <G transform={`rotate(${truckGeo.heading}, 0, 0)`}>
                        <Path d="M 0 -36 L 10 -20 L 0 -24 L -10 -20 Z" fill="#FFFFFF" />
                      </G>
                    </G>
                  );
                })()}
              </Svg>
            </View>

            {/* ── 2D HUD OVERLAYS (FLAT ON SCREEN) ── */}

            {/* 1. TOP TURN-BY-TURN MANEUVER CARD (Deep Forest Green Google Maps Banner) */}
            <View style={s.navTopCardContainer} pointerEvents="box-none">
              <View style={s.navTopCard}>
                <View style={s.navTopMainRow}>
                  {/* Direction Arrow */}
                  <View style={s.navArrowBox}>
                    <Text style={s.navArrowTxt}>{upcomingManeuver.arrow}</Text>
                  </View>

                  {/* towards [A2] */}
                  <View style={s.navTowardCol}>
                    <View style={s.navTowardRow}>
                      <Text style={s.navTowardTxt}>{upcomingManeuver.mainText}</Text>
                      <View style={s.navHighwayBadge}>
                        <Text style={s.navHighwayTxt}>{upcomingManeuver.shield}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Sparkle Action Icon */}
                  <TouchableOpacity
                    style={s.navSparkleBtn}
                    onPress={() => setShowSearchModal(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="sparkles" size={15} color="#38BDF8" />
                  </TouchableOpacity>
                </View>

                {/* Sub-maneuver Row: Then ↰ in ... */}
                <View style={s.navSubManeuverRow}>
                  <View style={s.navThenBadge}>
                    <Text style={s.navThenTxt}>Then {upcomingManeuver.thenArrow}</Text>
                  </View>
                  <Text style={s.navSubManeuverTxt} numberOfLines={1}>
                    {upcomingManeuver.subText}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. FLOATING SPEEDOMETER (Bottom-Left) */}
            <View style={s.navSpeedometerBadge} pointerEvents="none">
              <Text style={s.navSpeedometerDigits}>{speed > 0 ? speed : '--'}</Text>
              <Text style={s.navSpeedometerUnit}>km/h</Text>
            </View>

            {/* 3. FLOATING RIGHT COLUMN CONTROLS */}
            <View style={s.navRightControls} pointerEvents="box-none">
              {/* Compass Needle Button (Shows True North; tap to reset manual rotation or toggle North-Up) */}
              <TouchableOpacity
                style={[
                  s.navFloatingCircleBtn,
                  manualHeading !== null && { borderColor: '#F59E0B', backgroundColor: '#78350F' },
                ]}
                onPress={() => {
                  if (manualHeading !== null) {
                    // Manual rotation active -> Snap back to truck's forward heading!
                    setManualHeading(null);
                    setIsNorthUp(false);
                  } else {
                    // Toggle North-Up (0°) vs Head-Up
                    setIsNorthUp(!isNorthUp);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={{ transform: [{ rotate: `${-activeHeading}deg` }] }}>
                  <Svg width={30} height={30} viewBox="-15 -15 30 30">
                    <Path d="M 0 -12 L 4 0 L -4 0 Z" fill="#EF4444" />
                    <Path d="M 0 12 L 4 0 L -4 0 Z" fill="#E2E8F0" />
                    <Circle cx={0} cy={0} r={2.5} fill="#0F172A" stroke="#FFFFFF" strokeWidth={1} />
                  </Svg>
                </View>
              </TouchableOpacity>

              {/* Manual 360° Hand-Rotation Buttons (Rotate Left 30° & Rotate Right 30°) */}
              <TouchableOpacity
                style={s.navFloatingCircleBtn}
                onPress={() => {
                  setIsNorthUp(false);
                  setManualHeading((h) => {
                    const base = h !== null ? h : truckGeo.heading;
                    return Math.round(((base - 30) % 360 + 360) % 360);
                  });
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 16, color: '#38BDF8', fontWeight: 'bold' }}>↺</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.navFloatingCircleBtn}
                onPress={() => {
                  setIsNorthUp(false);
                  setManualHeading((h) => {
                    const base = h !== null ? h : truckGeo.heading;
                    return Math.round(((base + 30) % 360 + 360) % 360);
                  });
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 16, color: '#38BDF8', fontWeight: 'bold' }}>↻</Text>
              </TouchableOpacity>

              {/* Search Route Stops */}
              <TouchableOpacity
                style={s.navFloatingCircleBtn}
                onPress={() => setShowSearchModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="search" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Sound Guidance Toggle */}
              <TouchableOpacity
                style={s.navFloatingCircleBtn}
                onPress={() => setIsMuted(!isMuted)}
                activeOpacity={0.8}
              >
                <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={16} color="#FFFFFF" />
              </TouchableOpacity>

              {/* 3D / 2D Perspective Toggle */}
              <TouchableOpacity
                style={[s.navFloatingCircleBtn, !isNorthUp && { borderColor: '#38BDF8', backgroundColor: '#0284C7' }]}
                onPress={() => setIsNorthUp(!isNorthUp)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF' }}>
                  {!isNorthUp ? '3D' : '2D'}
                </Text>
              </TouchableOpacity>

              {/* Recenter button when panned, zoomed, in overview, or manually rotated */}
              {(!navModalFollowTruck || nav3DPanOffset.x !== 0 || nav3DPanOffset.y !== 0 || nav3DZoom !== 1.0 || manualHeading !== null) && (
                <TouchableOpacity
                  style={[s.navFloatingCircleBtn, { borderColor: '#10B981', backgroundColor: '#064E3B' }]}
                  onPress={() => {
                    setNavModalFollowTruck(true);
                    setNav3DPanOffset({ x: 0, y: 0 });
                    setNav3DZoom(1.0);
                    setManualHeading(null);
                    setIsNorthUp(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="locate" size={16} color="#34D399" />
                </TouchableOpacity>
              )}

              {/* Zoom In */}
              <TouchableOpacity
                style={s.navFloatingCircleBtn}
                onPress={() => setNav3DZoom((z) => Math.min(8.0, Math.round((z + 0.35) * 100) / 100))}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' }}>＋</Text>
              </TouchableOpacity>

              {/* Live Zoom Level Indicator */}
              <View style={s.navZoomLevelBadge}>
                <Text style={s.navZoomLevelTxt}>{Math.round(nav3DZoom * 100)}%</Text>
              </View>

              {/* Zoom Out */}
              <TouchableOpacity
                style={s.navFloatingCircleBtn}
                onPress={() => setNav3DZoom((z) => Math.max(0.35, Math.round((z - 0.35) * 100) / 100))}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' }}>－</Text>
              </TouchableOpacity>

              {/* Layer Toggle (OSM ⟷ Sat) */}
              <TouchableOpacity
                style={s.navFloatingCircleBtn}
                onPress={() => setLayer(layer === 'sat' ? 'osm' : 'sat')}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#38BDF8' }}>
                  {layer === 'sat' ? 'SAT' : 'OSM'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4. BOTTOM NAVIGATION CARD (Obsidian Black Pill) */}
            <View style={s.navBottomCardContainer} pointerEvents="box-none">
              <View style={s.navBottomCard}>
                <View style={s.navDragHandle} />

                <View style={s.navBottomMainRow}>
                  {/* Close / Exit Button */}
                  <TouchableOpacity
                    style={s.navExitCircleBtn}
                    onPress={() => setIsNavActive(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.navExitCircleTxt}>✕</Text>
                  </TouchableOpacity>

                  {/* ETA & Distance Info */}
                  <View style={s.navEtaCol}>
                    <Text style={s.navEtaBigTxt}>{etaDurationText}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="location" size={11} color="#38BDF8" />
                      <Text style={s.navSubEtaTxt} numberOfLines={1}>
                        {driverCurrentLocation.townName} • Next: {driverCurrentLocation.nextStopName} ({driverCurrentLocation.distToNext} km)
                      </Text>
                    </View>
                  </View>

                </View>

                {/* Start Trip Button if awaiting departure */}
                {activeTrip && !isInTransit && activeTrip.status !== 'DELIVERED' && onStartTrip && (
                  <TouchableOpacity
                    style={[s.navStartTripBtn, { marginTop: 10 }]}
                    onPress={handleStartTripWith3D}
                    disabled={actionLoading}
                    activeOpacity={0.85}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Ionicons name="play" size={14} color="#FFFFFF" />
                        <Text style={s.navStartTripBtnTxt}>Start Trip</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Search Corridor Stops Sheet Modal */}
          {showSearchModal && (
            <Modal
              transparent
              visible={showSearchModal}
              animationType="fade"
              onRequestClose={() => setShowSearchModal(false)}
            >
              <TouchableOpacity
                style={s.searchModalOverlay}
                activeOpacity={1}
                onPress={() => setShowSearchModal(false)}
              >
                <View style={s.searchModalSheet} onStartShouldSetResponder={() => true}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="search" size={15} color="#38BDF8" />
                      <Text style={{ fontSize: 15, fontWeight: '900', color: '#FFFFFF' }}>
                        Corridor Stops along {highwayShield}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                      <Text style={{ color: '#94A3B8', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ gap: 10 }}>
                    <View style={s.searchStopCard}>
                      <Ionicons name="speedometer-outline" size={20} color="#38BDF8" />
                      <View style={{ flex: 1 }}>
                        <Text style={s.searchStopTitle}>TotalEnergies / Shell Station</Text>
                        <Text style={s.searchStopSub}>High-speed diesel & driver rest · 12 km ahead</Text>
                      </View>
                    </View>

                    <View style={s.searchStopCard}>
                      <Ionicons name="scale-outline" size={20} color="#F59E0B" />
                      <View style={{ flex: 1 }}>
                        <Text style={s.searchStopTitle}>National Weighbridge & Scale</Text>
                        <Text style={s.searchStopSub}>Axle load verification station · 28 km ahead</Text>
                      </View>
                    </View>

                    <View style={s.searchStopCard}>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
                      <View style={{ flex: 1 }}>
                        <Text style={s.searchStopTitle}>Customs Inspection Gate</Text>
                        <Text style={s.searchStopSub}>Transit clearance checkpoint · 45 km ahead</Text>
                      </View>
                    </View>

                    <View style={s.searchStopCard}>
                      <Ionicons name="bed-outline" size={20} color="#818CF8" />
                      <View style={{ flex: 1 }}>
                        <Text style={s.searchStopTitle}>Safe Driver Rest Area & Parking</Text>
                        <Text style={s.searchStopSub}>Secure truck parking & cafeteria · 62 km ahead</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  title: { fontSize: 11, fontWeight: '900', color: '#38BDF8', letterSpacing: 0.4 },
  sub: { fontSize: 9, color: '#64748B', marginTop: 1 },
  badgeLive: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  badgeLiveTxt: { fontSize: 8, fontWeight: '900', color: '#FFFFFF' },
  switcher: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 8, padding: 2 },
  btn: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  btnActive: { backgroundColor: '#0284C7' },
  btnTxt: { fontSize: 9, fontWeight: '700', color: '#94A3B8' },
  btnTxtActive: { color: '#FFF' },
  mapFrame: {
    alignSelf: 'stretch',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#E5E7EB', // Neutral light base matching OSM
    position: 'relative',
    ...(Platform.OS === 'web' ? ({ touchAction: 'none' } as any) : {}),
  },
  driverLiveLocationBar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#0284C7',
    zIndex: 998,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  driverLiveLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  driverLiveLocationTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  driverLiveLocationSub: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#38BDF8',
    marginTop: 1.5,
  },
  inlineRecenterBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#0284C7',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  inlineRecenterTxt: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  inlineZoomControl: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    zIndex: 999,
  },
  compactZoomBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  compactZoomBtnTxt: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  compactZoomBadge: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactZoomBadgeTxt: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#38BDF8',
  },
  cleanActionBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  cleanActionPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanActionPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  cleanActionPillTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#CBD5E1',
  },
  cleanActionPillTxtActive: {
    color: '#FFFFFF',
  },
  waypointBanner: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 10,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
  },
  waypointTitle: { fontSize: 11, fontWeight: '900', color: '#FFFFFF' },
  waypointSub: { fontSize: 9, color: '#94A3B8', marginTop: 1 },
  closeWpBtn: { padding: 4 },
  footer: { marginTop: 6 },
  progressTrack: {
    height: 5,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    marginBottom: 6,
    position: 'relative',
  },
  progressFill: { height: 5, backgroundColor: '#0284C7', borderRadius: 3 },
  truckDot: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    borderWidth: 1.5,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routePt: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  routeTxt: { fontSize: 9.5, fontWeight: '700', color: '#CBD5E1', flex: 1 },
  pctTxt: { fontSize: 10, fontWeight: '900', color: '#10B981', marginHorizontal: 8 },
  startTripMapBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#34D399',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  startTripMapTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  /* ═══════════════════════════════════════════════════ */
  /* 3D NAVIGATION MODAL STYLES */
  /* ═══════════════════════════════════════════════════ */
  navModalContainer: {
    flex: 1,
    backgroundColor: '#090E17',
  },
  navStartTripBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#34D399',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  navStartTripBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  // ── Google Maps 3D Turn-by-Turn Navigation Styles ──
  nav3dLaunchBtn: {
    backgroundColor: '#054740',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav3dLaunchTxt: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '900',
  },
  nav3dContainer: {
    flex: 1,
    backgroundColor: '#090E17',
    position: 'relative',
    overflow: 'hidden',
    touchAction: 'none' as any,
    userSelect: 'none' as any,
  },
  navZoomLevelBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  navZoomLevelTxt: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#38BDF8',
  },
  navTopCardContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 38) : 48,
    left: 14,
    right: 14,
    zIndex: 100,
  },
  navTopCard: {
    backgroundColor: '#054740',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#0D6257',
  },
  navTopMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navArrowBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navArrowTxt: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  navTowardCol: {
    flex: 1,
  },
  navTowardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navTowardTxt: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '800',
    flexShrink: 1,
  },
  navHighwayBadge: {
    backgroundColor: '#FBBF24',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#D97706',
  },
  navHighwayTxt: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.5,
  },
  navSparkleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  navSubManeuverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
    gap: 8,
  },
  navThenBadge: {
    backgroundColor: '#03342E',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  navThenTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  navSubManeuverTxt: {
    fontSize: 12.5,
    color: '#CCFBF1',
    fontWeight: '600',
    flex: 1,
  },
  navSpeedometerBadge: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 172 : (Platform.OS === 'ios' ? 136 : 105),
    left: 16,
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 7,
  },
  navSpeedometerDigits: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  navSpeedometerUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: -2,
  },
  navRightControls: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 172 : (Platform.OS === 'ios' ? 136 : 105),
    right: 16,
    alignItems: 'center',
    gap: 10,
    zIndex: 100,
  },
  navFloatingCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#090E17',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 5,
  },
  navBottomCardContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 68 : (Platform.OS === 'ios' ? 36 : 14),
    left: 14,
    right: 14,
    zIndex: 100,
  },
  navBottomCard: {
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  navDragHandle: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#525252',
    alignSelf: 'center',
    marginBottom: 10,
  },
  navBottomMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navExitCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navExitCircleTxt: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  navEtaCol: {
    flex: 1,
    alignItems: 'center',
  },
  navEtaBigTxt: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  navSubEtaTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
  },
  navAltRouteBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  return3dBtn: {
    marginTop: 6,
    backgroundColor: '#054740',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  return3dTxt: {
    fontSize: 11,
    fontWeight: '900',
    color: '#A7F3D0',
  },
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  searchModalSheet: {
    backgroundColor: '#090E17',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  searchStopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchStopTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  searchStopSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
});
