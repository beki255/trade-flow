import React, { useState, useEffect } from 'react';
import { CheckCircle, CheckCircle2, Star, ShieldCheck, Lock, Truck, Info, Award, UserCheck } from 'lucide-react';
import { ReviewItem, ShipmentItem, BidItem } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

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
  const { language, t } = useLanguage();
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
      alert(
        language === 'AM'
          ? 'ይህ አጓጓዥ ለዚህ ጭነት አስቀድሞ ደረጃ ተሰጥቶታል። የኮሪደር ደረጃዎች ቋሚ የኦዲት መዛግብት በመሆናቸው ሊደገሙ ወይም ሊሻሻሉ አይችሉም።'
          : language === 'OM'
          ? 'Fe\'aan kun fe\'isa kanaaf duraanuu sadarkaan kennameeraaf. Galmeen kun hin jijjiiramu ykn hin irra deebi\'amu.'
          : 'This carrier has already been rated for this consignment. Corridor ratings are immutable audit records and cannot be repeated or edited.'
      );
      return;
    }
    onSubmitRating(e, selectedBid?.rawLoadId || selectedBid?.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {language === 'AM' ? 'ከጉዞ በኋላ ደረጃ እና አስተያየት መስጫ' : language === 'OM' ? 'Sadarkaa fi Yaada Erga Imala Boodaa' : 'Post-Trip Ratings & Reviews'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'AM'
              ? 'እቃው በደረሰ ጊዜ የተረጋገጠ የአጓጓዥ አፈጻጸም ደረጃ ይስጡ። ደረጃዎች በኮሪደሩ መዝገብ ላይ በቋሚነት ይመዘገባሉ።'
              : language === 'OM'
              ? 'Fe\'isi yeroo ga\'u sadarkaa raawwii fe\'aa mirkanaa\'e kennaa. Sadarkaan galmee kooridoorii irratti dhaabbataan cufama.'
              : 'Submit verified carrier performance reviews upon delivery. Ratings are sealed permanently in the corridor ledger.'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'AM' ? 'የማይለወጥ የመዝገብ ታማኝነት' : language === 'OM' ? 'Qulqullina Galmee Hin Jijjiiramne' : 'Immutable Ledger Integrity'}</span>
        </div>
      </div>

      {/* Delivered Consignments Selector */}
      {deliveredBids.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            {language === 'AM' ? 'ደረጃ ለመስጠት የደረሰ ጭነት ይምረጡ፦' : language === 'OM' ? 'Sadarkaa kennuuf fe\'isa ga\'e filadhaa:' : 'Select Delivered Consignment to Rate:'}
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
                        {language === 'AM' ? 'ተመዝግቧል' : language === 'OM' ? 'Sadarkaa Qaba' : 'Rated'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {language === 'AM' ? 'ደረጃ ለመስጠት ዝግጁ' : language === 'OM' ? 'Qophii' : 'Ready to Rate'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span className="line-clamp-1">{b.transporterName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {language === 'AM' ? 'መስመር፦' : language === 'OM' ? 'Daandii:' : 'Route:'} {b.route}
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
            {language === 'AM' ? 'ለደረሰው ጭነት ለአጓጓዡ ደረጃ ይስጡ' : language === 'OM' ? 'Fe\'isa ga\'eef abbaa fe\'isaaf sadarkaa kennaa' : 'Rate Carrier for Delivered Consignment'}
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            {language === 'AM' ? 'አንድ ጊዜ ብቻ የሚጻፍ • የማይቀየር' : language === 'OM' ? 'Al Tokko Barreeffama • Hin Jijjiiramu' : 'Write-Once • Non-Editable'}
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
                {language === 'AM' ? 'የተረጋገጠ ደረጃ ተመዝግቧል' : language === 'OM' ? 'Sadarkaan Mirkanaa\'e Galmaa\'eera' : 'Verified Rating Recorded'} ({existingReview?.scoreStars ?? 5}.0 {language === 'AM' ? 'ኮከቦች' : language === 'OM' ? 'Urjii' : 'Stars'})
              </span>
            </div>
            <p className="text-xs text-emerald-700 italic">
              "{existingReview?.reviewText || 'Professional corridor delivery completed.'}"
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 pt-1">
              <Info className="w-3.5 h-3.5" />
              <span>
                {language === 'AM'
                  ? 'የኮሪደር ደረጃዎች ቋሚ የኦዲት መዛግብት በመሆናቸው ሊደገሙ ወይም ሊሻሻሉ አይችሉም።'
                  : language === 'OM'
                  ? 'Galmeen kun hin jijjiiramu ykn hin irra deebi\'amu.'
                  : 'Corridor ratings are immutable audit records and cannot be repeated or edited.'}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'AM' ? 'የአጓጓዥ / ድርጅት ስም *' : language === 'OM' ? 'Maqaa Abbaa Fe\'isaa / Dhaabbataa *' : 'Transporter / Carrier Name *'}
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
                {language === 'AM' ? 'የአጓጓዥ አፈጻጸም ነጥብ (ከ1 እስከ 5 ኮከቦች) *' : language === 'OM' ? 'Qabxii Sadarkaa Fe\'aa (Urjii 1 hanga 5) *' : 'Carrier Rating Score (1 to 5 Stars) *'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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
                {language === 'AM' ? 'የአስተያየት እና የርክክብ ግምገማ ዝርዝር *' : language === 'OM' ? 'Yaada fi Madaallii Geessaa *' : 'Review Comments & Delivery Feedback *'}
              </label>
              <textarea
                rows={3}
                required
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder={
                  language === 'AM'
                    ? 'ስለ ጭነት እንክብካቤ፣ ሰዓት አክባሪነት፣ ተግባቦት ያለዎትን ግምገማ ያስገቡ...'
                    : language === 'OM'
                    ? 'Eegumsa fe\'isaa, sa\'aatii eeguu fi wal-qunnamtii irratti yaada keessan galchaa...'
                    : 'Enter post-trip delivery feedback (cargo care, punctuality, communication)...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'AM' ? 'የአጓጓዥ ደረጃ እና አስተያየትን መዝግብ' : language === 'OM' ? 'Sadarkaa fi Yaada Fe\'aa Galchi' : 'Submit Carrier Rating & Feedback'}</span>
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
                <span>{language === 'AM' ? 'የላኪነት ስም እና ዝና ነጥቤ' : language === 'OM' ? 'Qabxii Kabaja Abbaa Fe\'isaa Koo' : 'My Shipper Reputation Score'}</span>
                <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  {hasTransporterReviews
                    ? (language === 'AM' ? 'የተረጋገጠ ደረጃ' : language === 'OM' ? 'SADARKAA MIRKANAA\'E' : 'VERIFIED RATING')
                    : (language === 'AM' ? 'እስካሁን ደረጃ አልተሰጠም' : language === 'OM' ? 'HIN LAFATAMNE' : 'NOT RATED YET')}
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
                    ? `(${transporterReviewsCount} ${language === 'AM' ? 'የተረጋገጡ የአጓጓዥ አስተያየቶች' : language === 'OM' ? 'yaada fe\'aa mirkanaa\'an' : 'verified transporter reviews'})`
                    : (language === 'AM' ? '(የመጀመሪያውን የአጓጓዥ አስተያየት በመጠባበቅ ላይ)' : '(Awaiting first transporter review)')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 font-bold self-stretch sm:self-auto justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{language === 'AM' ? 'የማይለወጥ የኮሪደር መዝገብ' : language === 'OM' ? 'Galmee Kooridoorii Dhaabbataa' : 'Immutable Corridor Ledger'}</span>
          </div>
        </div>

        {/* Header & Filter Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'AM' ? 'የኮሪደር ደረጃ ታሪክ እና የተረጋገጡ አስተያየቶች' : language === 'OM' ? 'Seenaa Sadarkaa fi Yaada Mirkanaa\'an' : 'Corridor Rating History & Verified Reviews'}
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
              {language === 'AM' ? 'ሁሉም' : language === 'OM' ? 'Hunda' : 'All'} ({reviewsList.length})
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
              {language === 'AM' ? 'የደረሱኝ' : language === 'OM' ? 'Kan Naaf Dhufe' : 'Received'} ({receivedReviews.length})
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
              {language === 'AM' ? 'የሰጠኋቸው' : language === 'OM' ? 'Kan Ani Kenne' : 'Given'} ({givenReviews.length})
            </button>
          </div>
        </div>

        {displayedReviews.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
            <Star className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">
              {filterType === 'RECEIVED'
                ? (language === 'AM' ? 'እስካሁን ከአጓጓዦች የተሰጠ ምንም አስተያየት የለም' : language === 'OM' ? 'Fe\'aa irraa yaanni dhufe hin jiru' : 'No reviews received from transporters yet')
                : filterType === 'GIVEN'
                ? (language === 'AM' ? 'እስካሁን ለአጓጓዥ ምንም ደረጃ አልሰጡም' : language === 'OM' ? 'Fe\'aadhaaf sadarkaan hin kennamne' : 'You have not submitted any carrier reviews yet')
                : (language === 'AM' ? 'እስካሁን ምንም የተመዘገቡ ደረጃዎች እና አስተያየቶች የሉም' : language === 'OM' ? 'Yaanni mirkanaa\'e hin jiru' : 'No verified reviews recorded yet')}
            </div>
            <p className="text-[11px] text-slate-500">
              {language === 'AM'
                ? 'የአጓጓዥ ደረጃዎች እና ከጉዞ በኋላ የሚሰጡ አስተያየቶች ለገበያው ግልጽነት እዚህ ይመዘገባሉ።'
                : language === 'OM'
                ? 'Sadarkaan fe\'aa fi yaanni iftoomina gabaaf asirratti galmaa\'u.'
                : 'Carrier ratings and post-trip reviews will be cataloged here for complete marketplace transparency.'}
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
                        {rev.fromUser?.companyName || rev.fromUser?.fullName || (language === 'AM' ? 'የተረጋገጠ አጋር' : 'Verified Corridor Partner')}
                      </span>
                      {isReceived && (
                        <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-bold border border-sky-200">
                          {language === 'AM' ? 'ለእርስዎ የቀረበ' : language === 'OM' ? 'Siif' : 'To You'}
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
                      {language === 'AM' ? 'ተቀባይ፦' : language === 'OM' ? 'Fudhaa:' : 'Recipient:'} {rev.toUser?.companyName || rev.toUser?.fullName || 'Transporter'}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
                      <Lock className="w-2.5 h-2.5" /> {language === 'AM' ? 'የማይለወጥ' : language === 'OM' ? 'Hin Jijjiiramne' : 'Immutable'}
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
