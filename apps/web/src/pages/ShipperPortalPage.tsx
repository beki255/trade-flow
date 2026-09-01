import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { MapLocationModal } from '../components/map/MapLocationModal';
import {
  LocationData,
  ShipmentItem,
  BidItem,
  ReviewItem,
  AIMatchCarrier,
  MatchingSLA,
} from '../modules/shipper/types';

// Modular Tabs
import { DashboardTab } from '../modules/shipper/tabs/DashboardTab';
import { PostLoadTab } from '../modules/shipper/tabs/PostLoadTab';
import { BidsTab } from '../modules/shipper/tabs/BidsTab';
import { TrackingTab } from '../modules/shipper/tabs/TrackingTab';
import { DocumentsTab } from '../modules/shipper/tabs/DocumentsTab';
import { PaymentsTab } from '../modules/shipper/tabs/PaymentsTab';
import { RatingsTab } from '../modules/shipper/tabs/RatingsTab';

// Modular Modal
import { TelebirrEscrowModal } from '../modules/shipper/components/TelebirrEscrowModal';

export const ShipperPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'dashboard';

  const handleTabChange = (newTab: string) => {
    navigate(`/shipper/${newTab}`);
  };

  // Dynamic Shipments State
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);

  // Load Posting Form States
  const [cargoName, setCargoName] = useState<string>('');
  const [cargoCategory, setCargoCategory] = useState<string>('');
  const [cargoDescription, setCargoDescription] = useState<string>('');
  const [weightTons, setWeightTons] = useState<string>('');
  const [volumeM3, setVolumeM3] = useState<string>('');

  // Interactive GPS Map Origin & Destination
  const [originLocation, setOriginLocation] = useState<LocationData>({
    address: '',
    lat: 0,
    lng: 0,
  });
  const [destinationLocation, setDestinationLocation] = useState<LocationData>({
    address: '',
    lat: 0,
    lng: 0,
  });

  // Map Modal State for "Pick on Map"
  const [mapModalOpen, setMapModalOpen] = useState<boolean>(false);
  const [mapModalTarget, setMapModalTarget] = useState<'ORIGIN' | 'DESTINATION'>('ORIGIN');

  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTimeWindow, setPickupTimeWindow] = useState<string>('');
  const [specialHandling, setSpecialHandling] = useState<string>('Standard Heavy Freight');
  const [targetBudget, setTargetBudget] = useState<string>('');

  // Booking Options ('INSTANT_MATCH' vs 'COMPETITIVE_BIDDING')
  const [bookingOption, setBookingOption] = useState<'INSTANT_MATCH' | 'COMPETITIVE_BIDDING'>('INSTANT_MATCH');

  // AI Matching Results & SLA
  const [matchingLoading, setMatchingLoading] = useState<boolean>(false);
  const [matchedTransporters, setMatchedTransporters] = useState<AIMatchCarrier[]>([]);
  const [matchingSla, setMatchingSla] = useState<MatchingSLA | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<AIMatchCarrier | null>(null);
  const [postedSuccess, setPostedSuccess] = useState<boolean>(false);

  // Dynamic Bids & Payments State
  const [bids, setBids] = useState<BidItem[]>([]);
  const [telebirrModalOpen, setTelebirrModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [telebirrPhone, setTelebirrPhone] = useState(user?.phone || '');

  // Ratings & Reviews State
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingTargetTransporter, setRatingTargetTransporter] = useState<string>('Red Sea Freight Logistics');
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string>('');

  // Calculate corridor distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const corridorDistanceKm = calculateDistance(
    originLocation.lat,
    originLocation.lng,
    destinationLocation.lat,
    destinationLocation.lng
  );

  // Run AI Matching Engine
  const handleRunAIMatching = async () => {
    if (!originLocation.address || !destinationLocation.address) return;
    setMatchingLoading(true);
    try {
      const res = await fetch('/api/matching/find-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: originLocation.address,
          originGps: { lat: originLocation.lat, lng: originLocation.lng },
          destination: destinationLocation.address,
          destinationGps: { lat: destinationLocation.lat, lng: destinationLocation.lng },
          cargoType: cargoCategory || 'General Freight',
          cargoDescription,
          weightTons: weightTons || '25',
          volumeM3: volumeM3 || '35',
          pickupWindow: pickupDate ? `${pickupDate} (${pickupTimeWindow || 'Morning'})` : 'Flexible',
          specialHandling,
          targetBudgetEtb: targetBudget || '180000',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMatchedTransporters(data.topMatches || []);
        setMatchingSla(data.sla || { actualExecutionTimeMs: '34ms', target: '< 1.0s (P95)' });
        if (data.topMatches && data.topMatches.length > 0) {
          setSelectedMatch(data.topMatches[0]);
        }
      }
    } catch (err) {
      console.warn('Could not run AI matching engine:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/portal/ratings');
      if (res.ok) {
        const data = await res.json();
        if (data.ratings) {
          setReviewsList(data.ratings);
        }
      }
    } catch (err) {
      console.warn('Could not fetch reviews:', err);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/portal/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: user?.id,
          scoreStars: ratingStars,
          reviewText: ratingComment || 'On-time cargo delivery along Djibouti–Addis corridor.',
        }),
      });

      if (res.ok) {
        setRatingSuccessMsg('Review & rating submitted successfully!');
        setRatingComment('');
        fetchReviews();
        setTimeout(() => setRatingSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  // Fetch loads from PostgreSQL database
  const loadShipments = async () => {
    try {
      const res = await fetch('/api/portal/loads');
      if (res.ok) {
        const data = await res.json();
        if (data.loads) {
          const mapped: ShipmentItem[] = data.loads.map((l: any) => ({
            id: `TF-SH-${l.id.slice(-4).toUpperCase()}`,
            rawId: l.id,
            title: l.title,
            type: 'Containerized Cargo',
            weight: `${(l.weightKg / 1000).toFixed(1)} Tons`,
            route: `${l.originAddress} ➔ ${l.destinationAddress}`,
            budget: `${Number(l.targetBudgetEtb || '180000').toLocaleString()} ETB`,
            status: l.status || 'OPEN',
            createdAt: new Date(l.createdAt).toLocaleDateString(),
          }));
          setShipments(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch shipments from database:', err);
    }
  };

  // Fetch bids submitted by transporters
  const fetchAllBids = async () => {
    try {
      const res = await fetch('/api/portal/bids');
      if (res.ok) {
        const data = await res.json();
        if (data.bids) {
          const mapped: BidItem[] = data.bids.map((b: any) => ({
            id: b.id,
            loadId: `TF-SH-${b.load?.id?.slice(-4).toUpperCase() || 'LOAD'}`,
            loadTitle: b.load?.title || 'Corridor Freight Consignment',
            route:
              b.load?.originName && b.load?.destName
                ? `${b.load.originName} ➔ ${b.load.destName}`
                : 'Addis Ababa ➔ Djibouti Port',
            transporterName: b.transporter?.companyName || b.transporter?.fullName || 'Registered Carrier',
            transporterPhone: b.transporter?.phone || '+251 91 123 4567',
            rating: b.transporter?.ratingAvg || 4.9,
            bidAmount: Number(b.proposedRateEtb || 0),
            estimatedHours: `${b.validityHours || 24}h Validity`,
            notes: b.proposalNotes || 'Carrier quote submitted via RFQ board.',
            status: b.status || 'PENDING',
            createdAt: new Date(b.createdAt).toLocaleDateString(),
          }));
          setBids(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch bids from database:', err);
    }
  };

  const handleAcceptBid = async (bid: BidItem) => {
    try {
      const res = await fetch('/api/portal/bids/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId: bid.id, action: 'ACCEPT' }),
      });
      if (res.ok) {
        setSelectedMatch({
          companyName: bid.transporterName,
          ratingStars: bid.rating,
          totalCompletedTrips: 45,
          totalMatchScorePct: 96,
          calculatedSpotRateEtb: bid.bidAmount,
          assignedTruckPlate: 'ET-3-TRUCK',
          estimatedTransitHours: bid.estimatedHours,
          breakdownScores: {
            costOptimization: 95,
            historicalReliability: 98,
            fuelEfficiency: 90,
            proximityAndAvailability: 94,
          },
        });
        setTelebirrModalOpen(true);
        fetchAllBids();
        loadShipments();
      }
    } catch (err) {
      console.error('Error accepting bid:', err);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      const res = await fetch('/api/portal/bids/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId, action: 'REJECT' }),
      });
      if (res.ok) {
        fetchAllBids();
      }
    } catch (err) {
      console.error('Error rejecting bid:', err);
    }
  };

  useEffect(() => {
    loadShipments();
    fetchAllBids();
    fetchReviews();
  }, []);

  const handlePostLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoName || !weightTons || !originLocation.address || !destinationLocation.address) return;

    try {
      const res = await fetch('/api/matching/post-load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cargoName,
          cargoType: cargoCategory || 'General Cargo',
          cargoDescription,
          weightTons,
          volumeM3,
          originAddress: originLocation.address,
          originGps: { lat: originLocation.lat, lng: originLocation.lng },
          destinationAddress: destinationLocation.address,
          destinationGps: { lat: destinationLocation.lat, lng: destinationLocation.lng },
          pickupWindowStart: pickupDate,
          specialHandling,
          targetBudgetEtb:
            bookingOption === 'COMPETITIVE_BIDDING'
              ? null
              : targetBudget
              ? parseFloat(targetBudget)
              : null,
          bookingOption,
        }),
      });

      if (res.ok) {
        setPostedSuccess(true);
        loadShipments();
        if (bookingOption === 'COMPETITIVE_BIDDING') {
          setTimeout(() => {
            setPostedSuccess(false);
            navigate('/shipper/bids');
          }, 1200);
        } else {
          handleRunAIMatching();
        }
      }
    } catch (err) {
      console.error('Error posting load to database:', err);
    }
  };

  const handleTelebirrPay = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setTelebirrModalOpen(false);
      setPaymentSuccess(false);
      navigate('/shipper/tracking');
    }, 2000);
  };

  return (
    <DashboardLayout
      portalRole="SHIPPER"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-6">
        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            user={user}
            shipments={shipments}
            bids={bids}
            onNavigatePostLoad={() => navigate('/shipper/post-load')}
          />
        )}

        {/* 2. LOAD POSTING & AI MATCHING */}
        {activeTab === 'post-load' && (
          <PostLoadTab
            postedSuccess={postedSuccess}
            bookingOption={bookingOption}
            setBookingOption={setBookingOption}
            cargoName={cargoName}
            setCargoName={setCargoName}
            cargoCategory={cargoCategory}
            setCargoCategory={setCargoCategory}
            cargoDescription={cargoDescription}
            setCargoDescription={setCargoDescription}
            weightTons={weightTons}
            setWeightTons={setWeightTons}
            volumeM3={volumeM3}
            setVolumeM3={setVolumeM3}
            originLocation={originLocation}
            setOriginLocation={setOriginLocation}
            destinationLocation={destinationLocation}
            setDestinationLocation={setDestinationLocation}
            corridorDistanceKm={corridorDistanceKm}
            pickupDate={pickupDate}
            setPickupDate={setPickupDate}
            pickupTimeWindow={pickupTimeWindow}
            setPickupTimeWindow={setPickupTimeWindow}
            specialHandling={specialHandling}
            setSpecialHandling={setSpecialHandling}
            targetBudget={targetBudget}
            setTargetBudget={setTargetBudget}
            matchingLoading={matchingLoading}
            matchedTransporters={matchedTransporters}
            matchingSla={matchingSla}
            onOpenMapPicker={(target) => {
              setMapModalTarget(target);
              setMapModalOpen(true);
            }}
            onRunAIMatching={handleRunAIMatching}
            onSubmitPostLoad={handlePostLoad}
            onSelectCarrier={(carrier) => {
              setSelectedMatch(carrier);
              setTelebirrModalOpen(true);
            }}
          />
        )}

        {/* 3. BIDS & QUOTES */}
        {activeTab === 'bids' && (
          <BidsTab
            bids={bids}
            onAcceptBid={handleAcceptBid}
            onRejectBid={handleRejectBid}
          />
        )}

        {/* 4. LIVE TRACKING MAP */}
        {activeTab === 'tracking' && <TrackingTab />}

        {/* 5. CUSTOMS DOCUMENTS */}
        {activeTab === 'documents' && <DocumentsTab />}

        {/* 6. PAYMENTS & ESCROW */}
        {activeTab === 'payments' && <PaymentsTab />}

        {/* 7. RATINGS & REVIEWS */}
        {activeTab === 'ratings' && (
          <RatingsTab
            ratingSuccessMsg={ratingSuccessMsg}
            ratingTargetTransporter={ratingTargetTransporter}
            setRatingTargetTransporter={setRatingTargetTransporter}
            ratingStars={ratingStars}
            setRatingStars={setRatingStars}
            ratingComment={ratingComment}
            setRatingComment={setRatingComment}
            reviewsList={reviewsList}
            onSubmitRating={handleSubmitRating}
          />
        )}
      </div>

      {/* INTERACTIVE MAP MODAL */}
      <MapLocationModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        targetType={mapModalTarget}
        initialLocation={mapModalTarget === 'ORIGIN' ? originLocation : destinationLocation}
        onConfirm={(selectedLoc) => {
          if (mapModalTarget === 'ORIGIN') {
            setOriginLocation(selectedLoc);
          } else {
            setDestinationLocation(selectedLoc);
          }
        }}
      />

      {/* TELEBIRR SMART ESCROW CHECKOUT MODAL */}
      <TelebirrEscrowModal
        isOpen={telebirrModalOpen}
        onClose={() => setTelebirrModalOpen(false)}
        selectedMatch={selectedMatch}
        paymentSuccess={paymentSuccess}
        telebirrPhone={telebirrPhone}
        setTelebirrPhone={setTelebirrPhone}
        onPay={handleTelebirrPay}
      />
    </DashboardLayout>
  );
};
