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
                `🎉 Delivery Confirmed! Consignment "${l.title}" has safely arrived at destination and electronic e-POD was signed. TeleBirr Escrow payment has been released!`
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
              id: `TF-SH-${l.id.slice(-4).toUpperCase()}`,
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
              budget: l.targetBudgetEtb ? `${Number(l.targetBudgetEtb).toLocaleString()} ETB` : 'Competitive RFQ',
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
            navigate('/shipper/consignments');
          }, 1200);
        } else {
          handleRunAIMatching();
        }
      }
    } catch (err) {
      console.error('Error posting load to database:', err);
    }
  };

  const handleTelebirrPay = async (details: { phone: string; paymentMethod: string; amount: number }) => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      let targetLoadId: string | undefined = undefined;
      if (selectedMatch) {
        targetLoadId = shipments[0]?.rawId || shipments[0]?.id;
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
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to authorize TeleBirr escrow deposit.');
      }

      const data = await res.json();
      const txNum =
        data.payment?.telebirrTransactionNo ||
        data.telebirrReceipt?.transactionNo ||
        `TB-TF-${Date.now().toString().slice(-8)}`;

      setTxReceipt({
        transactionNo: txNum,
        amount: details.amount,
      });
      setPaymentSuccess(true);
      await fetchAllBids();
      await loadShipments();

      const notifMsg = selectedBid
        ? `✅ Bid accepted! ${details.amount.toLocaleString()} ETB locked in TeleBirr Escrow (${txNum}).`
        : `✅ Transporter assigned! ${details.amount.toLocaleString()} ETB locked in TeleBirr Escrow (${txNum}).`;
      setAcceptedBidNotification(notifMsg);
      setTimeout(() => setAcceptedBidNotification(''), 7000);

      setTimeout(() => {
        setTelebirrModalOpen(false);
        setPaymentSuccess(false);
        setIsProcessingPayment(false);
        navigate('/shipper/tracking');
      }, 2500);
    } catch (err: any) {
      console.error('TeleBirr payment initiation error:', err);
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
          <div className="bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-emerald-600/20 border-2 border-emerald-500 rounded-2xl p-4 text-white flex items-start justify-between shadow-xl shadow-emerald-500/10 animate-fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-black text-emerald-300 text-sm flex items-center gap-2">
                  <span>🎉 ጭነቱ በሰላም ደርሷል (Consignment Delivered & e-POD Signed)</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/40 uppercase font-mono">
                    Escrow Settled
                  </span>
                </p>
                <p className="text-xs text-white/90 font-medium mt-1 leading-relaxed">
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
                  className="text-emerald-300 hover:text-white text-xs font-bold px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition border border-emerald-400/30 cursor-pointer"
                >
                  ዝርዝሩን እይ
                </button>
              )}
              <button
                onClick={() => setDeliveryNotification('')}
                className="text-white/60 hover:text-white text-xs font-bold px-2 py-1.5 hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                ✕ ዝጋ (Dismiss)
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
              setSelectedBid(null);
              setPaymentError(null);
              setPaymentSuccess(false);
              setTxReceipt(null);
              setTelebirrModalOpen(true);
            }}
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
