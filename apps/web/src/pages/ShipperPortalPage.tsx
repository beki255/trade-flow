import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
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
import { calculateCorridorRoadDistanceKm, resolveCorridorCoordinates } from '@tradeflow/shared';

// Modular Tabs
import { DashboardTab } from '../modules/shipper/tabs/DashboardTab';
import { PostLoadTab } from '../modules/shipper/tabs/PostLoadTab';
import { ConsignmentsTab } from '../modules/shipper/tabs/ConsignmentsTab';
import { BidsTab } from '../modules/shipper/tabs/BidsTab';
import { TrackingTab } from '../modules/shipper/tabs/TrackingTab';
import { DocumentsTab } from '../modules/shipper/tabs/DocumentsTab';
import { PaymentsTab } from '../modules/shipper/tabs/PaymentsTab';
import { RatingsTab } from '../modules/shipper/tabs/RatingsTab';
import { PricingContractsTab } from '../modules/shipper/tabs/PricingContractsTab';

// Modular Modal
import { TelebirrEscrowModal } from '../modules/shipper/components/TelebirrEscrowModal';

export const ShipperPortalPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
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
  const [lastCreatedLoadId, setLastCreatedLoadId] = useState<string | null>(null);

  // Map Modal State for "Pick on Map"
  const [mapModalOpen, setMapModalOpen] = useState<boolean>(false);
  const [mapModalTarget, setMapModalTarget] = useState<'ORIGIN' | 'DESTINATION'>('ORIGIN');

  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTimeWindow, setPickupTimeWindow] = useState<string>('');
  const [specialHandling, setSpecialHandling] = useState<string>('Standard Heavy Freight');
  const [targetBudget, setTargetBudget] = useState<string>('');

  // Booking Options ('INSTANT_MATCH' vs 'COMPETITIVE_BIDDING')
  const [bookingOption, setBookingOption] = useState<'INSTANT_MATCH' | 'COMPETITIVE_BIDDING'>('INSTANT_MATCH');
  const [matchingPreference, setMatchingPreference] = useState<'BALANCED' | 'COST_PRIORITY' | 'SPEED_PRIORITY' | 'RELIABILITY_PRIORITY'>('BALANCED');
  const [validityHours, setValidityHours] = useState<number>(24);

  // AI Matching Results & SLA
  const [matchingLoading, setMatchingLoading] = useState<boolean>(false);
  const [matchedTransporters, setMatchedTransporters] = useState<AIMatchCarrier[]>([]);
  const [matchingSla, setMatchingSla] = useState<MatchingSLA | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<AIMatchCarrier | null>(null);
  const [postedSuccess, setPostedSuccess] = useState<boolean>(false);

  // Dynamic Bids & Payments State
  const [bids, setBids] = useState<BidItem[]>([]);
  const [selectedBid, setSelectedBid] = useState<BidItem | null>(null);
  const [acceptedBidNotification, setAcceptedBidNotification] = useState<string>('');
  const [deliveryNotification, setDeliveryNotification] = useState<string>('');
  const prevShipmentStatusesRef = useRef<Record<string, string>>({});
  const [telebirrModalOpen, setTelebirrModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [txReceipt, setTxReceipt] = useState<{ transactionNo: string; amount: number } | null>(null);
  const [telebirrPhone, setTelebirrPhone] = useState(user?.phone || '+251911445566');

  // Ratings & Reviews State
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingTargetTransporter, setRatingTargetTransporter] = useState<string>('');
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string>('');

  // Dynamic corridor road distance in km (Real Ethiopian-Djibouti ground distance)
  const corridorDistanceKm = React.useMemo(() => {
    if (!originLocation.address && !destinationLocation.address) return 0;
    return calculateCorridorRoadDistanceKm(
      originLocation.address,
      destinationLocation.address,
      originLocation.lat,
      originLocation.lng,
      destinationLocation.lat,
      destinationLocation.lng
    );
  }, [originLocation, destinationLocation]);

  // Active consignment in progress (shippers manage at most 1 active load at a time)
  const activeShipment = shipments.find(
    (s) => s.status !== 'DELIVERED' && s.status !== 'CANCELLED'
  ) || null;

  // Run AI Matching Engine
  const handleRunAIMatching = async (preference?: 'BALANCED' | 'COST_PRIORITY' | 'SPEED_PRIORITY' | 'RELIABILITY_PRIORITY') => {
    if (!originLocation.address || !destinationLocation.address) return;
    const pref = preference || matchingPreference;
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
          priorityPreference: pref,
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
      if (refreshUser) {
        refreshUser();
      }
    } catch (err) {
      console.warn('Could not fetch reviews:', err);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent, customShipmentId?: string, customToUserId?: string) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/portal/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: user?.id,
          toUserId: customToUserId || ratingTargetTransporter || undefined,
          targetRole: 'TRANSPORTER',
          shipmentId: customShipmentId || undefined,
          scoreStars: ratingStars,
          reviewText: ratingComment || 'On-time cargo delivery along Djibouti–Addis corridor.',
        }),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        setRatingSuccessMsg('Verified carrier rating recorded permanently on the corridor ledger!');
        setRatingComment('');
        fetchReviews();
        setTimeout(() => setRatingSuccessMsg(''), 4000);
      } else {
        alert(resData.error || 'Could not submit rating. Ratings cannot be duplicated or edited.');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  // Fetch loads from PostgreSQL database (strictly isolated by current logged-in shipper)
  const loadShipments = async () => {
    if (!user?.id && !user?.email) {
      setShipments([]);
      return;
    }
    try {
      const q = user?.id ? `shipperId=${encodeURIComponent(user.id)}` : `shipperEmail=${encodeURIComponent(user.email || '')}`;
      const res = await fetch(`/api/portal/loads?${q}`);
      if (res.ok) {
        const data = await res.json();
        if (data.loads) {
          if (data.loads.length === 0) {
            setDeliveryNotification('');
            prevShipmentStatusesRef.current = {};
            setShipments([]);
            return;
          }
          // Detect status change to DELIVERED in real-time
          data.loads.forEach((l: any) => {
            const prevStatus = prevShipmentStatusesRef.current[l.id];
            if (prevStatus && prevStatus !== 'DELIVERED' && l.status === 'DELIVERED') {
              setDeliveryNotification(
                `🎉 Delivery Confirmed! Consignment "${l.title}" has safely arrived at destination and electronic e-POD was signed. Digital Escrow payment has been released!`
              );
              // Auto-dismiss after 8 seconds so it doesn't linger
              setTimeout(() => {
                setDeliveryNotification('');
              }, 8000);
            }
            prevShipmentStatusesRef.current[l.id] = l.status;
          });
          const mapped: ShipmentItem[] = data.loads.map((l: any) => {
            const resO = resolveCorridorCoordinates(l.originName, l.originLat, l.originLng);
            const resD = resolveCorridorCoordinates(l.destName, l.destLat, l.destLng);
            const distanceKm = calculateCorridorRoadDistanceKm(
              l.originName,
              l.destName,
              resO.lat,
              resO.lng,
              resD.lat,
              resD.lng
            );
            return {
              id: l.id,
              rawId: l.id,
              title: l.title,
              type: l.cargoType || 'Containerized Cargo',
              weight: `${l.weightTons ? Number(l.weightTons).toFixed(1) : (l.weightKg ? (l.weightKg / 1000).toFixed(1) : '28.0')} Tons`,
              weightTons: l.weightTons ? Number(l.weightTons) : 28.0,
              route: `${l.originName || l.originAddress || 'Addis Ababa'} ➔ ${l.destName || l.destinationAddress || 'Djibouti Port'}`,
              originName: l.originName || l.originAddress || 'Addis Ababa',
              destName: l.destName || l.destinationAddress || 'Djibouti Port',
              originLat: resO.lat,
              originLng: resO.lng,
              destLat: resD.lat,
              destLng: resD.lng,
              distanceKm,
              budget: l.targetBudgetEtb ? `${Number(l.targetBudgetEtb).toLocaleString()} ETB` : 'Open for Quotes',
              targetBudgetEtb: l.targetBudgetEtb ? Number(l.targetBudgetEtb) : null,
              status: l.status || 'OPEN',
              createdAt: new Date(l.createdAt).toLocaleDateString(),
              bidsCount: l.bids?.length || 0,
              cargoDescription: l.cargoDescription || '',
            };
          });
          setShipments(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch shipments from database:', err);
    }
  };

  // Delete / Cancel Consignment Load from Database (SRS 4.2)
  const handleDeleteLoad = async (rawLoadId: string) => {
    if (!rawLoadId) return;
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this freight consignment? Any incoming bids for this load will also be permanently deleted from the database.'
    );
    if (!confirmDelete) return;

    setDeleteLoadingId(rawLoadId);
    try {
      const res = await fetch(`/api/portal/loads/${rawLoadId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadShipments();
        await fetchAllBids();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete load');
      }
    } catch (err) {
      console.error('Error deleting load:', err);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Fetch bids submitted by transporters (strictly isolated by current logged-in shipper)
  const fetchAllBids = async () => {
    if (!user?.id && !user?.email) {
      setBids([]);
      return;
    }
    try {
      const q = user?.id ? `shipperId=${encodeURIComponent(user.id)}` : '';
      const res = await fetch(`/api/portal/bids${q ? `?${q}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.bids) {
          if (data.bids.length === 0) {
            setBids([]);
            return;
          }
          const mapped: BidItem[] = data.bids.map((b: any) => {
            const payment = b.load?.shipment?.payment;
            const hasPayment = Boolean(
              payment &&
              (payment.status === 'HELD_IN_ESCROW' ||
               payment.status === 'CONFIRMED' ||
               payment.status === 'SETTLED')
            );
            const hasDispatched = Boolean(
              b.load?.shipment?.status === 'DISPATCHED' ||
              b.load?.shipment?.status === 'IN_TRANSIT' ||
              b.load?.shipment?.status === 'DELIVERED' ||
              b.proposalNotes?.toLowerCase().includes('dispatched') ||
              b.notes?.toLowerCase().includes('dispatched') ||
              b.proposalNotes?.toLowerCase().includes('escrow')
            );
            const isEscrowPaid = hasPayment || hasDispatched;

            return {
              id: b.id,
              loadId: b.load?.title || 'Corridor Consignment',
              rawLoadId: b.loadId || b.load?.id,
              loadTitle: b.load?.title || 'Corridor Freight Consignment',
              route:
                b.load?.originName && b.load?.destName
                  ? `${b.load.originName} ➔ ${b.load.destName}`
                  : 'Addis Ababa ➔ Djibouti Port',
              transporterName: b.transporter?.companyName || b.transporter?.fullName || 'Registered Carrier',
              transporterPhone: b.transporter?.phone || '+251 91 123 4567',
              rating: (b.transporter?.totalRatingsCount && b.transporter.totalRatingsCount > 0) ? b.transporter.ratingAvg : 0.0,
              bidAmount: Number(b.proposedRateEtb || 0),
              estimatedHours: `${b.validityHours || 24}h Validity`,
              validityHours: Number(b.validityHours) || 24,
              expiresAt: b.expiresAt,
              transporterVerificationStatus: b.transporter?.verificationStatus || 'VERIFIED',
              notes: b.proposalNotes || 'Carrier quote submitted via RFQ board.',
              status: b.status || 'PENDING',
              createdAt: new Date(b.createdAt).toLocaleDateString(),
              isEscrowPaid,
              paymentStatus: payment?.status || (hasDispatched ? 'HELD_IN_ESCROW' : 'PENDING'),
              paymentMethod: payment?.paymentMethod || 'TELEBIRR',
            };
          });
          setBids(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch bids from database:', err);
    }
  };

  const handleAcceptBid = (bid: BidItem) => {
    setSelectedBid(bid);
    setSelectedMatch(null);
    setPaymentError(null);
    setPaymentSuccess(false);
    setTxReceipt(null);
    setTelebirrModalOpen(true);
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
    // Immediate state reset when logged-in shipper changes
    setShipments([]);
    setBids([]);
    setDeliveryNotification('');
    prevShipmentStatusesRef.current = {};

    if (user?.id || user?.email) {
      loadShipments();
      fetchAllBids();
      fetchReviews();

      // Auto-poll every 3.5s for real-time delivery and bid notifications
      const interval = setInterval(() => {
        loadShipments();
        fetchAllBids();
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [user?.id, user?.email]);

  const handlePostLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoName || !weightTons || !originLocation.address || !destinationLocation.address) return;

    // Option A: Instant Match -> Only run AI matching to discover and rank verified carriers.
    // Does NOT post load or send offers to any carrier until shipper reviews and clicks "Send AI Match Offer ➔".
    if (bookingOption === 'INSTANT_MATCH') {
      handleRunAIMatching();
      return;
    }

    // Option B: Competitive Bidding (Live RFQ) -> Publish directly to Corridor Load Board
    const resO = resolveCorridorCoordinates(originLocation.address, originLocation.lat, originLocation.lng);
    const resD = resolveCorridorCoordinates(destinationLocation.address, destinationLocation.lat, destinationLocation.lng);
    const calculatedKm = calculateCorridorRoadDistanceKm(
      originLocation.address,
      destinationLocation.address,
      resO.lat,
      resO.lng,
      resD.lat,
      resD.lng
    );

    try {
      const res = await fetch('/api/matching/post-load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipperId: user?.id,
          shipperEmail: user?.email,
          title: cargoName,
          cargoType: cargoCategory || 'General Cargo',
          cargoDescription,
          weightTons,
          volumeM3,
          originAddress: originLocation.address || resO.resolvedName,
          originGps: { lat: resO.lat, lng: resO.lng },
          destinationAddress: destinationLocation.address || resD.resolvedName,
          destinationGps: { lat: resD.lat, lng: resD.lng },
          distanceKm: calculatedKm,
          pickupWindowStart: pickupDate,
          specialHandling,
          validityHours,
          priorityPreference: matchingPreference,
          targetBudgetEtb: targetBudget ? parseFloat(targetBudget) : null,
          bookingOption: 'COMPETITIVE_BIDDING',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.load?.id) {
          setLastCreatedLoadId(data.load.id);
        }
        setPostedSuccess(true);
        loadShipments();
        setTimeout(() => {
          setPostedSuccess(false);
          navigate('/shipper/consignments');
        }, 1200);
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error || 'Failed to post load to database.');
      }
    } catch (err) {
      console.error('Error posting load to database:', err);
    }
  };

  const handleSendDirectOfferToCarrier = async (carrier: any) => {
    try {
      setMatchingLoading(true);

      const resO = resolveCorridorCoordinates(originLocation.address, originLocation.lat, originLocation.lng);
      const resD = resolveCorridorCoordinates(destinationLocation.address, destinationLocation.lat, destinationLocation.lng);
      const calculatedKm = calculateCorridorRoadDistanceKm(
        originLocation.address,
        destinationLocation.address,
        resO.lat,
        resO.lng,
        resD.lat,
        resD.lng
      );

      // Create the consignment and dispatch the Direct AI Match Offer to the selected carrier
      const res = await fetch('/api/matching/post-load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipperId: user?.id,
          shipperEmail: user?.email,
          title: cargoName || `${cargoCategory || 'General Freight'} Consignment`,
          cargoType: cargoCategory || 'General Cargo',
          cargoDescription,
          weightTons: weightTons || '28',
          volumeM3: volumeM3 || '40',
          originAddress: originLocation.address || resO.resolvedName,
          originGps: { lat: resO.lat, lng: resO.lng },
          destinationAddress: destinationLocation.address || resD.resolvedName,
          destinationGps: { lat: resD.lat, lng: resD.lng },
          distanceKm: calculatedKm,
          pickupWindowStart: pickupDate,
          specialHandling,
          validityHours: validityHours || 24,
          priorityPreference: matchingPreference,
          targetBudgetEtb: carrier.calculatedSpotRateEtb || (targetBudget ? parseFloat(targetBudget) : null),
          bookingOption: 'INSTANT_MATCH',
          selectedInstantTransporterId: carrier.carrierId,
          selectedInstantTransporterName: carrier.companyName,
          spotRateEtb: carrier.calculatedSpotRateEtb,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.load?.id) {
          setLastCreatedLoadId(data.load.id);
        }
        setPostedSuccess(false);
        setAcceptedBidNotification(
          `✓ Direct AI Match offer sent to ${carrier.companyName}! Waiting for carrier to review and accept.`
        );
        setTimeout(() => setAcceptedBidNotification(''), 7000);
        await fetchAllBids();
        await loadShipments();
        navigate('/shipper/bids');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to dispatch offer to carrier.');
      }
    } catch (err) {
      console.error('Error sending direct offer to carrier:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleTelebirrPay = async (details: { phone: string; paymentMethod: string; amount: number }) => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      let targetLoadId: string | undefined = undefined;
      if (selectedMatch) {
        targetLoadId = lastCreatedLoadId || shipments[0]?.rawId || shipments[0]?.id;
      } else if (selectedBid?.rawLoadId) {
        targetLoadId = selectedBid.rawLoadId;
      }

      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId: selectedBid?.id,
          loadId: targetLoadId,
          grossAmountEtb: details.amount,
          telebirrPhone: details.phone || telebirrPhone,
          paymentMethod: details.paymentMethod || 'TELEBIRR',
          shipperId: user?.id,
          transporterId: selectedMatch?.carrierId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to authorize escrow deposit.');
      }

      const data = await res.json();
      const prefix = details.paymentMethod === 'CBE_BIRR' ? 'CBE-TF-' : 'TB-TF-';
      const txNum =
        data.payment?.telebirrTransactionNo ||
        data.telebirrReceipt?.transactionNo ||
        `${prefix}${Date.now().toString().slice(-8)}`;

      setTxReceipt({
        transactionNo: txNum,
        amount: details.amount,
      });
      setPaymentSuccess(true);
      await fetchAllBids();
      await loadShipments();

      const methodLabel = details.paymentMethod === 'CBE_BIRR' ? 'CBE Birr' : 'TeleBirr';
      const notifMsg = selectedBid
        ? `✅ Bid accepted! ${details.amount.toLocaleString()} ETB locked in ${methodLabel} Escrow (${txNum}).`
        : `✅ Transporter assigned! ${details.amount.toLocaleString()} ETB locked in ${methodLabel} Escrow (${txNum}).`;
      setAcceptedBidNotification(notifMsg);
      setTimeout(() => setAcceptedBidNotification(''), 7000);

      setTimeout(() => {
        setTelebirrModalOpen(false);
        setPaymentSuccess(false);
        setIsProcessingPayment(false);
        navigate('/shipper/tracking');
      }, 2500);
    } catch (err: any) {
      console.error('Smart escrow payment initiation error:', err);
      setPaymentError(err.message || 'Payment processing failed. Please verify your mobile wallet number.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <DashboardLayout
      portalRole="SHIPPER"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-6">
        {/* Real-time Delivery Alert Banner (Visible only on Dashboard or Consignments, NEVER on Post Load) */}
        {deliveryNotification && (activeTab === 'dashboard' || activeTab === 'consignments') && (
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 text-slate-800 flex items-start justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-black text-emerald-950 text-sm flex items-center gap-2">
                  <span>🎉 Consignment Delivered & e-POD Signed</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 uppercase font-mono font-bold">
                    Escrow Settled
                  </span>
                </p>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  {deliveryNotification}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              {activeTab !== 'consignments' && (
                <button
                  onClick={() => {
                    setDeliveryNotification('');
                    navigate('/shipper/consignments');
                  }}
                  className="text-emerald-700 hover:text-emerald-800 text-xs font-bold px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition border border-emerald-300 cursor-pointer"
                >
                  View Details
                </button>
              )}
              <button
                onClick={() => setDeliveryNotification('')}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1.5 hover:bg-emerald-100/50 rounded-lg transition cursor-pointer"
              >
                ✕ Dismiss
              </button>
            </div>
          </div>
        )}

        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            user={user}
            shipments={shipments}
            bids={bids}
            onNavigatePostLoad={() => navigate('/shipper/post-load')}
            onNavigateConsignments={() => navigate('/shipper/consignments')}
            onNavigateBids={() => navigate('/shipper/bids')}
            onDeleteLoad={handleDeleteLoad}
            deleteLoadingId={deleteLoadingId}
          />
        )}

        {/* 2. LOAD POSTING & AI MATCHING */}
        {activeTab === 'post-load' && (
          <PostLoadTab
            postedSuccess={postedSuccess}
            activeShipment={activeShipment}
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
            matchingPreference={matchingPreference}
            setMatchingPreference={setMatchingPreference}
            validityHours={validityHours}
            setValidityHours={setValidityHours}
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
            onSelectCarrier={handleSendDirectOfferToCarrier}
            onNavigateConsignments={() => navigate('/shipper/consignments')}
          />
        )}

        {/* 3. MY CONSIGNMENTS (STANDALONE FREIGHT MANAGEMENT TAB) */}
        {activeTab === 'consignments' && (
          <ConsignmentsTab
            shipments={shipments}
            onDeleteLoad={handleDeleteLoad}
            deleteLoadingId={deleteLoadingId}
            onNavigatePostLoad={() => navigate('/shipper/post-load')}
            onNavigateBids={() => navigate('/shipper/bids')}
            onNavigateTracking={() => navigate('/shipper/tracking')}
            onRateCarrier={(item) => {
              setRatingTargetTransporter(item.id || item.rawId);
              navigate('/shipper/ratings');
            }}
          />
        )}

        {/* 4. BIDS & QUOTES */}
        {activeTab === 'bids' && (
          <BidsTab
            bids={bids}
            onAcceptBid={handleAcceptBid}
            onRejectBid={handleRejectBid}
            acceptedBidNotification={acceptedBidNotification}
          />
        )}

        {/* 4. LIVE TRACKING MAP */}
        {activeTab === 'tracking' && (
          <TrackingTab
            onNavigatePostLoad={() => navigate('/shipper/post-load')}
            onNavigateConsignments={() => navigate('/shipper/consignments')}
            onNavigatePayments={() => navigate('/shipper/payments')}
          />
        )}

        {/* 5. CUSTOMS DOCUMENTS */}
        {activeTab === 'documents' && <DocumentsTab />}

        {/* 6. PAYMENTS & ESCROW */}
        {activeTab === 'payments' && <PaymentsTab bids={bids} shipments={shipments} />}

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
            shipments={shipments}
            bids={bids}
          />
        )}

        {/* 8. DYNAMIC PRICING & CONTRACT RATE MANAGEMENT (FR-04) */}
        {activeTab === 'pricing-contracts' && <PricingContractsTab />}
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
        onClose={() => {
          if (!isProcessingPayment) {
            setTelebirrModalOpen(false);
            setSelectedBid(null);
            setSelectedMatch(null);
            setPaymentError(null);
          }
        }}
        selectedMatch={selectedMatch}
        selectedBid={selectedBid}
        paymentSuccess={paymentSuccess}
        isProcessing={isProcessingPayment}
        error={paymentError}
        telebirrPhone={telebirrPhone}
        setTelebirrPhone={setTelebirrPhone}
        onPay={handleTelebirrPay}
        txReceipt={txReceipt}
      />
    </DashboardLayout>
  );
};
