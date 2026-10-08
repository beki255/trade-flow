import React, { useState, useEffect } from 'react';
import { CheckCircle, CheckCircle2, Star, ShieldCheck, Lock, Truck, Info, Award, UserCheck } from 'lucide-react';
import { ReviewItem, ShipmentItem, BidItem } from '../types';
import { useAuth } from '../../../context/AuthContext';

interface RatingsTabProps {
  ratingSuccessMsg: string;
  ratingTargetTransporter: string;
  setRatingTargetTransporter: (val: string) => void;
  ratingStars: number;
  setRatingStars: (val: number) => void;
  ratingComment: string;
  setRatingComment: (val: string) => void;
  reviewsList: ReviewItem[];
  onSubmitRating: (e: React.FormEvent, customShipmentId?: string, customToUserId?: string) => void;
  shipments?: ShipmentItem[];
  bids?: BidItem[];
}

export const RatingsTab: React.FC<RatingsTabProps> = ({
  ratingSuccessMsg,
  ratingTargetTransporter,
  setRatingTargetTransporter,
  ratingStars,
  setRatingStars,
  ratingComment,
  setRatingComment,
  reviewsList,
  onSubmitRating,
  shipments = [],
  bids = [],
}) => {
  const { user, refreshUser } = useAuth();
  const [selectedLoadId, setSelectedLoadId] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'RECEIVED' | 'GIVEN'>('ALL');

  useEffect(() => {
    if (refreshUser) {
      refreshUser();
    }
  }, []);

  const receivedReviews = reviewsList.filter((rev) => {
    if (!user) return false;
    if (rev.toUserId && rev.toUserId === user.id) return true;
    if (rev.toUser?.id && rev.toUser.id === user.id) return true;
    const userComp = user.companyName?.trim().toLowerCase();
    const revComp = rev.toUser?.companyName?.trim().toLowerCase();
    if (userComp && revComp && userComp === revComp) return true;
    const userFull = user.fullName?.trim().toLowerCase();
    const revFull = rev.toUser?.fullName?.trim().toLowerCase();
    if (userFull && revFull && userFull === revFull) return true;
    return false;
  });

  const givenReviews = reviewsList.filter((rev) => {
    if (!user) return false;
    if (rev.fromUserId && rev.fromUserId === user.id) return true;
    if (rev.fromUser?.id && rev.fromUser.id === user.id) return true;
    const userComp = user.companyName?.trim().toLowerCase();
    const revComp = rev.fromUser?.companyName?.trim().toLowerCase();
    if (userComp && revComp && userComp === revComp) return true;
    const userFull = user.fullName?.trim().toLowerCase();
    const revFull = rev.fromUser?.fullName?.trim().toLowerCase();
    if (userFull && revFull && userFull === revFull) return true;
    return false;
  });

  // Calculate actual rating given by transporters
  const transporterReviewsCount = receivedReviews.length;
  const hasTransporterReviews = transporterReviewsCount > 0;
  const realAverageScore: number | null = hasTransporterReviews
    ? receivedReviews.reduce((sum, r) => sum + (Number(r.scoreStars) || 0), 0) / transporterReviewsCount
    : (user?.totalRatingsCount && user.totalRatingsCount > 0 && user?.ratingAvg && Number(user.ratingAvg) > 0
        ? Number(user.ratingAvg)
        : null);

  const displayedReviews = filterType === 'RECEIVED'
    ? receivedReviews
    : filterType === 'GIVEN'
    ? givenReviews
    : reviewsList;

  // Find accepted/delivered bids
  const deliveredBids = bids.filter(
    (b) => b.status === 'ACCEPTED' || b.status === 'DELIVERED'
  );

  const selectedBid = deliveredBids.find((b) => b.rawLoadId === selectedLoadId || b.id === selectedLoadId);

  // Check if selected consignment or transporter has already been reviewed
  const isAlreadyReviewed = reviewsList.some((rev) => {
    if (selectedBid && rev.toUser?.companyName) {
      return (
        rev.toUser.companyName.toLowerCase().trim() === selectedBid.transporterName.toLowerCase().trim() ||
        rev.toUser.fullName?.toLowerCase().trim() === selectedBid.transporterName.toLowerCase().trim()
      );
    }
    return false;
  });

  const existingReview = reviewsList.find((rev) => {
    if (selectedBid && rev.toUser?.companyName) {
      return (
        rev.toUser.companyName.toLowerCase().trim() === selectedBid.transporterName.toLowerCase().trim() ||
        rev.toUser.fullName?.toLowerCase().trim() === selectedBid.transporterName.toLowerCase().trim()
      );
    }
    return false;
  });

  const handleSelectConsignment = (bid: BidItem) => {
    setSelectedLoadId(bid.rawLoadId || bid.id);
    setRatingTargetTransporter(bid.transporterName);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (isAlreadyReviewed) {
      alert('This carrier has already been rated for this consignment. Corridor ratings are immutable audit records and cannot be repeated or edited.');
      return;
    }
    onSubmitRating(e, selectedBid?.rawLoadId || selectedBid?.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Post-Trip Ratings & Reviews
          </h2>
          <p className="text-xs text-slate-500">
            Submit verified carrier performance reviews upon delivery. Ratings are sealed permanently in the corridor ledger.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Immutable Ledger Integrity</span>
        </div>
      </div>

      {/* Delivered Consignments Selector */}
      {deliveredBids.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Select Delivered Consignment to Rate:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {deliveredBids.map((b) => {
              const isSelected = selectedLoadId === (b.rawLoadId || b.id);
              const alreadyRated = reviewsList.some(
                (rev) =>
                  rev.toUser?.companyName?.toLowerCase().trim() === b.transporterName.toLowerCase().trim() ||
                  rev.toUser?.fullName?.toLowerCase().trim() === b.transporterName.toLowerCase().trim()
              );

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectConsignment(b)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/50 ring-2 ring-sky-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-900 line-clamp-1">
                      {b.loadTitle}
                    </span>
                    {alreadyRated ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-emerald-600" />
                        Rated
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Ready to Rate
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span className="line-clamp-1">{b.transporterName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Route: {b.route}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Rating Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Rate Carrier for Delivered Consignment
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            Write-Once • Non-Editable
          </span>
        </div>

        {ratingSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{ratingSuccessMsg}</span>
          </div>
        )}

        {isAlreadyReviewed ? (
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>
                Verified Rating Recorded ({existingReview?.scoreStars ?? 5}.0 Stars)
              </span>
            </div>
            <p className="text-xs text-emerald-700 italic">
              "{existingReview?.reviewText || 'Professional corridor delivery completed.'}"
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 pt-1">
              <Info className="w-3.5 h-3.5" />
              <span>Corridor ratings are immutable audit records and cannot be repeated or edited.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Transporter / Carrier Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mulugeta Heavy Logistics & Fleet"
                value={ratingTargetTransporter}
                onChange={(e) => setRatingTargetTransporter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
              />
            </div>

            {/* 1-5 Interactive Star Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Carrier Rating Score (1 to 5 Stars) *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      ratingStars >= star
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{star}.0</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Review Comments & Delivery Feedback *
              </label>
              <textarea
                rows={3}
                required
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Enter post-trip delivery feedback (cargo care, punctuality, communication)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Carrier Rating & Feedback</span>
            </button>
          </form>
        )}
      </div>

      {/* Marketplace Reviews Feed */}
      <div className="space-y-4">
        {/* Shipper Reputation Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-black text-xl border border-amber-300/40">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>My Shipper Reputation Score</span>
                <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  {hasTransporterReviews ? 'VERIFIED RATING' : 'NOT RATED YET'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-950">
                  {realAverageScore !== null ? realAverageScore.toFixed(1) : '—'}
                </span>
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <Star
                      key={st}
                      className={`w-3.5 h-3.5 ${
                        realAverageScore !== null && st <= Math.round(realAverageScore)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {hasTransporterReviews
                    ? `(${transporterReviewsCount} verified transporter review${transporterReviewsCount > 1 ? 's' : ''})`
                    : '(Awaiting first transporter review)'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 font-bold self-stretch sm:self-auto justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Immutable Corridor Ledger</span>
          </div>
        </div>

        {/* Header & Filter Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
          <h3 className="text-sm font-bold text-slate-900">
            Corridor Rating History & Verified Reviews
          </h3>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold self-start">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({reviewsList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('RECEIVED')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterType === 'RECEIVED'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Received ({receivedReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('GIVEN')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterType === 'GIVEN'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Given ({givenReviews.length})
            </button>
          </div>
        </div>

        {displayedReviews.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
            <Star className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">
              {filterType === 'RECEIVED'
                ? 'No reviews received from transporters yet'
                : filterType === 'GIVEN'
                ? 'You have not submitted any carrier reviews yet'
                : 'No verified reviews recorded yet'}
            </div>
            <p className="text-[11px] text-slate-500">
              Carrier ratings and post-trip reviews will be cataloged here for complete marketplace transparency.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedReviews.map((rev) => {
              const isReceived = Boolean(
                user &&
                  ((rev.toUserId && rev.toUserId === user.id) ||
                    (rev.toUser?.id && rev.toUser.id === user.id) ||
                    (user.companyName && rev.toUser?.companyName && user.companyName.trim().toLowerCase() === rev.toUser.companyName.trim().toLowerCase()) ||
                    (user.fullName && rev.toUser?.fullName && user.fullName.trim().toLowerCase() === rev.toUser.fullName.trim().toLowerCase()))
              );
              return (
                <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {rev.fromUser?.companyName || rev.fromUser?.fullName || 'Verified Corridor Partner'}
                      </span>
                      {isReceived && (
                        <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-bold border border-sky-200">
                          To You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{rev.scoreStars}.0 / 5.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "{rev.reviewText}"
                  </p>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="truncate max-w-[150px]">
                      Recipient: {rev.toUser?.companyName || rev.toUser?.fullName || 'Transporter'}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
                      <Lock className="w-2.5 h-2.5" /> Immutable
                    </span>
                    <span className="shrink-0">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
