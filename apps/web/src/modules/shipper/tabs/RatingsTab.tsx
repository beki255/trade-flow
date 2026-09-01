import React from 'react';
import { CheckCircle, CheckCircle2, Star } from 'lucide-react';
import { ReviewItem } from '../types';

interface RatingsTabProps {
  ratingSuccessMsg: string;
  ratingTargetTransporter: string;
  setRatingTargetTransporter: (val: string) => void;
  ratingStars: number;
  setRatingStars: (val: number) => void;
  ratingComment: string;
  setRatingComment: (val: string) => void;
  reviewsList: ReviewItem[];
  onSubmitRating: (e: React.FormEvent) => void;
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
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Post-Trip Ratings & Reviews
          </h2>
          <p className="text-xs text-slate-500">
            Rate transporters after delivery completion. Ratings update average carrier scores and foster corridor transparency.
          </p>
        </div>
      </div>

      {/* Submit Rating Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Rate Carrier for Delivered Consignment
        </h3>

        {ratingSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{ratingSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={onSubmitRating} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Transporter & Trip
            </label>
            <select
              value={ratingTargetTransporter}
              onChange={(e) => setRatingTargetTransporter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
            >
              <option value="Red Sea Freight Logistics">Red Sea Freight Logistics — TF-SH-8821 (Djibouti ➔ Mojo)</option>
              <option value="Abyssinia Cargo Express">Abyssinia Cargo Express — TF-SH-9140 (Galafi ➔ Addis Ababa)</option>
              <option value="Horn of Africa Fleet">Horn of Africa Fleet — TF-SH-7712 (Modjo ➔ Kaliti)</option>
            </select>
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
              placeholder="Enter post-trip delivery feedback..."
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
      </div>

      {/* Marketplace Reviews Feed */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Marketplace Rating History & Transparency
        </h3>

        {reviewsList.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
            <Star className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">
              No verified reviews recorded yet
            </div>
            <p className="text-[11px] text-slate-500">
              Carrier ratings and post-trip reviews will be cataloged here for complete marketplace transparency.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {rev.fromUser?.companyName || rev.fromUser?.fullName || 'Verified Shipper'}
                  </span>
                  <div className="flex items-center text-xs font-bold text-amber-500">
                    <span>{rev.scoreStars}.0 / 5.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "{rev.reviewText}"
                </p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Recipient: {rev.toUser?.companyName || rev.toUser?.fullName || 'Transporter'}</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
