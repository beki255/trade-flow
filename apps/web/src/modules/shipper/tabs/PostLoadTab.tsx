import React, { useState } from 'react';
import {
  CheckCircle,
  Route,
  MapPin,
  Zap,
  Scale,
  PlusCircle,
  Package,
  Trash2,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import { LocationData, AIMatchCarrier, MatchingSLA, ShipmentItem } from '../types';
import { AIMatchingResultsCard } from '../components/AIMatchingResultsCard';
import { RouteLocationPickerCard } from '../components/RouteLocationPickerCard';

interface PostLoadTabProps {
  postedSuccess: boolean;
  bookingOption: 'INSTANT_MATCH' | 'COMPETITIVE_BIDDING';
  setBookingOption: (val: 'INSTANT_MATCH' | 'COMPETITIVE_BIDDING') => void;
  cargoName: string;
  setCargoName: (val: string) => void;
  cargoCategory: string;
  setCargoCategory: (val: string) => void;
  cargoDescription: string;
  setCargoDescription: (val: string) => void;
  weightTons: string;
  setWeightTons: (val: string) => void;
  volumeM3: string;
  setVolumeM3: (val: string) => void;
  originLocation: LocationData;
  setOriginLocation: React.Dispatch<React.SetStateAction<LocationData>>;
  destinationLocation: LocationData;
  setDestinationLocation: React.Dispatch<React.SetStateAction<LocationData>>;
  corridorDistanceKm: number;
  pickupDate: string;
  setPickupDate: (val: string) => void;
  pickupTimeWindow: string;
  setPickupTimeWindow: (val: string) => void;
  specialHandling: string;
  setSpecialHandling: (val: string) => void;
  targetBudget: string;
  setTargetBudget: (val: string) => void;
  matchingLoading: boolean;
  matchedTransporters: AIMatchCarrier[];
  matchingSla: MatchingSLA | null;
  onOpenMapPicker: (target: 'ORIGIN' | 'DESTINATION') => void;
  onRunAIMatching: () => void;
  onSubmitPostLoad: (e: React.FormEvent) => void;
  onSelectCarrier: (carrier: AIMatchCarrier) => void;
  onNavigateConsignments?: () => void;
}

export const PostLoadTab: React.FC<PostLoadTabProps> = ({
  postedSuccess,
  bookingOption,
  setBookingOption,
  cargoName,
  setCargoName,
  cargoCategory,
  setCargoCategory,
  cargoDescription,
  setCargoDescription,
  weightTons,
  setWeightTons,
  volumeM3,
  setVolumeM3,
  originLocation,
  setOriginLocation,
  destinationLocation,
  setDestinationLocation,
  corridorDistanceKm,
  pickupDate,
  setPickupDate,
  pickupTimeWindow,
  setPickupTimeWindow,
  specialHandling,
  setSpecialHandling,
  targetBudget,
  setTargetBudget,
  matchingLoading,
  matchedTransporters,
  matchingSla,
  onOpenMapPicker,
  onRunAIMatching,
  onSubmitPostLoad,
  onSelectCarrier,
  onNavigateConsignments,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              Freight Consignment Posting
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
              Post New Freight Consignment
            </h2>
            <p className="text-xs text-slate-500">
              Enter cargo specs, set locations with the GPS picker, and broadcast for carrier quotes or instant AI matching.
            </p>
          </div>

          {onNavigateConsignments && (
            <button
              type="button"
              onClick={onNavigateConsignments}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Package className="w-4 h-4 text-sky-600" />
              <span>View My Consignments ➔</span>
            </button>
          )}
        </div>

        {postedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                {bookingOption === 'INSTANT_MATCH'
                  ? 'Load successfully matched with top-ranked carrier at spot rate.'
                  : 'Load published to corridor marketplace. Shortlisted transporters can now place competitive bids.'}
              </span>
            </div>
            {onNavigateConsignments && (
              <button
                type="button"
                onClick={onNavigateConsignments}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Go to My Consignments ➔</span>
              </button>
            )}
          </div>
        )}

        <form onSubmit={onSubmitPostLoad} className="space-y-6">
            {/* 1. MODULAR ORIGIN & DESTINATION WITH PICK ON MAP (4.2.1) */}
            <RouteLocationPickerCard
              originLocation={originLocation}
              setOriginLocation={setOriginLocation}
              destinationLocation={destinationLocation}
              setDestinationLocation={setDestinationLocation}
              corridorDistanceKm={corridorDistanceKm}
              onOpenMapPicker={onOpenMapPicker}
            />

            {/* 2. Cargo Category, Weight & Volume */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cargo Category *
                </label>
                <select
                  value={cargoCategory}
                  onChange={(e) => setCargoCategory(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium bg-white text-slate-900"
                >
                  <option value="">Select Cargo Category</option>
                  <option value="Coffee Beans & Agricultural Exports">Coffee Beans & Agricultural Exports</option>
                  <option value="Industrial Machinery & Equipment">Industrial Machinery & Equipment</option>
                  <option value="Textiles & Apparel (Hawassa IP)">Textiles & Apparel (Hawassa IP)</option>
                  <option value="Sesame Seeds & Pulses">Sesame Seeds & Pulses</option>
                  <option value="Perishable Produce (Horticulture)">Perishable Produce (Horticulture)</option>
                  <option value="Petroleum / Liquid Chemical Tanker">Petroleum / Liquid Chemical Tanker</option>
                  <option value="Electronics & Consumer Goods">Electronics & Consumer Goods</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cargo Title / Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={cargoName}
                  onChange={(e) => setCargoName(e.target.value)}
                  placeholder="e.g. Export Washed Coffee Beans"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Weight (Tons) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={weightTons}
                      onChange={(e) => setWeightTons(e.target.value)}
                      placeholder="e.g. 28.5"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Volume (m³) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={volumeM3}
                      onChange={(e) => setVolumeM3(e.target.value)}
                      placeholder="e.g. 42"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cargo Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cargo Specifications & Packaging Details *
              </label>
              <textarea
                rows={2}
                required
                value={cargoDescription}
                onChange={(e) => setCargoDescription(e.target.value)}
                placeholder="Enter packaging specifications, container sizing, moisture requirements, etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
              />
            </div>

            {/* 3. Pickup Date & Special Handling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Pickup Window *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
                  />
                  <input
                    type="text"
                    value={pickupTimeWindow}
                    onChange={(e) => setPickupTimeWindow(e.target.value)}
                    placeholder="e.g. 08:00 AM - 12:00 PM"
                    className="w-44 px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Handling Requirements *
                </label>
                <select
                  value={specialHandling}
                  onChange={(e) => setSpecialHandling(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium bg-white text-slate-900"
                >
                  <option value="Standard Heavy Freight">Standard Heavy Freight</option>
                  <option value="Moisture-Controlled / High-Security Escort">Moisture-Controlled / High-Security Escort</option>
                  <option value="Refrigerated (Reefer -20°C to +4°C)">Refrigerated (Reefer -20°C to +4°C)</option>
                  <option value="Fragile / Delicate Industrial Cargo">Fragile / Delicate Industrial Cargo</option>
                  <option value="Hazardous Materials (HAZMAT Class 3)">Hazardous Materials (HAZMAT Class 3)</option>
                </select>
              </div>
            </div>

            {/* 4. Booking Options */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Corridor Booking Method
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A */}
                <div
                  onClick={() => setBookingOption('INSTANT_MATCH')}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    bookingOption === 'INSTANT_MATCH'
                      ? 'border-sky-600 bg-sky-50/50 ring-1 ring-sky-600/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-sky-600" />
                    <div className="text-xs font-bold text-slate-900">
                      Option A: AI Instant Match
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    System matches and ranks top available carriers by multi-factor weighted utility score. Instant booking at calculated spot rate.
                  </p>
                </div>

                {/* Option B */}
                <div
                  onClick={() => setBookingOption('COMPETITIVE_BIDDING')}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    bookingOption === 'COMPETITIVE_BIDDING'
                      ? 'border-sky-600 bg-sky-50/50 ring-1 ring-sky-600/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-sky-600" />
                    <div className="text-xs font-bold text-slate-900">
                      Option B: Competitive Bidding
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Broadcasts RFQ to qualified shortlisted corridor transporters. Review competing quotes and select preferred carrier.
                  </p>
                </div>
              </div>
            </div>

            {/* Target Budget - ONLY for Option A */}
            {bookingOption === 'INSTANT_MATCH' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Budget (ETB) *
                </label>
                <input
                  type="number"
                  required
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  placeholder="e.g. 185000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900"
                />
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5">
                <Scale className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Competitive Bidding Mode (Option B RFQ):</span> No budget entry needed. Qualified corridor transporters will inspect your route, cargo specifications, and payload tonnage to submit their custom price quotes for you to review and choose.
                </div>
              </div>
            )}

            {/* Form Submit & AI Match Trigger Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
              {bookingOption === 'INSTANT_MATCH' && (
                <button
                  type="button"
                  onClick={onRunAIMatching}
                  disabled={matchingLoading || !originLocation.address || !destinationLocation.address}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-sky-400" />
                  <span>{matchingLoading ? 'Calculating AI Utility Scores...' : 'Run AI Matching Engine (< 1.0s SLA)'}</span>
                </button>
              )}

              <button
                type="submit"
                className="w-full flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {bookingOption === 'INSTANT_MATCH'
                    ? 'Confirm & Proceed with Top AI Match'
                    : 'Broadcast RFQ for Competitive Bidding'}
                </span>
              </button>
            </div>
          </form>
      </div>

      {/* AI MATCHING RESULTS PRESENTATION */}
      <AIMatchingResultsCard
        matchedTransporters={matchedTransporters}
        matchingSla={matchingSla}
        onSelectCarrier={onSelectCarrier}
      />
    </div>
  );
};
