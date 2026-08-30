import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  PlusCircle,
  Gavel,
  Navigation,
  FileText,
  CreditCard,
  Star,
  CheckCircle,
  Truck,
  ArrowRight,
  UploadCloud,
  FileCheck,
  Smartphone,
  Inbox,
} from 'lucide-react';

export const ShipperPortalPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Dynamic Shipments State (Populated by real user posts)
  const [shipments, setShipments] = useState<any[]>([]);

  // Load posting form states (Start empty)
  const [cargoName, setCargoName] = useState('');
  const [cargoType, setCargoType] = useState('Containerized (40ft High-Cube)');
  const [weightTons, setWeightTons] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [targetBudget, setTargetBudget] = useState('');
  const [postedSuccess, setPostedSuccess] = useState(false);

  // Dynamic Bids & Payments State
  const [bids, setBids] = useState<any[]>([]);
  const [telebirrModalOpen, setTelebirrModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePostLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoName || !weightTons || !origin || !destination) return;

    const newLoad = {
      id: `TF-SH-${Date.now().toString().slice(-4)}`,
      title: cargoName,
      type: cargoType,
      weight: `${weightTons} Tons`,
      route: `${origin} ➔ ${destination}`,
      budget: `${Number(targetBudget).toLocaleString()} ETB`,
      status: 'AWAITING_BIDS',
      createdAt: new Date().toLocaleDateString(),
    };

    setShipments([newLoad, ...shipments]);
    setPostedSuccess(true);
    setCargoName('');
    setWeightTons('');
    setOrigin('');
    setDestination('');
    setTargetBudget('');

    setTimeout(() => {
      setPostedSuccess(false);
      setActiveTab('dashboard');
    }, 1500);
  };

  return (
    <DashboardLayout
      portalRole="SHIPPER"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0284C7] text-white shadow-lg">
            <div>
              <h1 className="text-xl sm:text-2xl font-black">
                {language === 'AM' ? `እንኳን ደህና መጡ፣ ${user?.fullName || 'ዳዊት ታደሰ'}!` : `Welcome, ${user?.fullName || 'Shipper'}!`}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                {user?.companyName || 'TradeFlow Shipper Portal'} • TIN: {user?.tin || '0098473621'} (Verified ✓)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('post-load')}
              className="px-5 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'AM' ? 'አዲስ ጭነት መዝግብ' : 'Post New Load'}</span>
            </button>
          </div>

          {/* 4 KPI Status Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-[#0284C7]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  {language === 'AM' ? 'የተመዘገቡ ጭነቶች' : 'Active Shipments'}
                </div>
                <div className="text-xl font-black text-slate-900">{shipments.length} Loads</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  {language === 'AM' ? 'የገቡ የጨረታ ዋጋዎች' : 'Pending Quotes'}
                </div>
                <div className="text-xl font-black text-slate-900">{bids.length}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  {language === 'AM' ? 'የጉምሩክ ማረጋገጫ' : 'Customs Status'}
                </div>
                <div className="text-xl font-black text-slate-900">Online ✓</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  {language === 'AM' ? 'የተያዘ ክፍያ (Escrow)' : 'Escrow Protected'}
                </div>
                <div className="text-xl font-black text-slate-900">0 ETB</div>
              </div>
            </div>
          </div>

          {/* Active Shipments List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0284C7]" />
                <span>{language === 'AM' ? 'የጭነቶች ዝርዝር' : 'Shipment Register'}</span>
              </h3>
            </div>

            {shipments.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-700">
                  {language === 'AM' ? 'እስካሁን የተመዘገበ ጭነት የለም' : 'No cargo loads posted yet'}
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'AM' ? 'ከላይ ያለውን "አዲስ ጭነት መዝግብ" ቁልፍ በመጫን ጭነትዎን ያስመዝግቡ።' : 'Click "Post New Load" above to publish your first shipment.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {shipments.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{s.title}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {s.id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        📍 {s.route} • {s.weight} ({s.type})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-[#0284C7]">{s.budget}</div>
                      <div className="text-[10px] text-slate-400">{s.createdAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. LOAD POSTING */}
      {activeTab === 'post-load' && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900 mb-1">
            {language === 'AM' ? 'አዲስ ጭነት መመዝገቢያ' : 'Post New Freight Load'}
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            {language === 'AM' ? 'የጭነትዎን ዝርዝር መረጃዎች በማስገባት ለአጓጓዦች ጨረታ ያቅርቡ።' : 'Enter shipment details to receive competitive bids from verified transporters.'}
          </p>

          {postedSuccess && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{language === 'AM' ? 'ጭነቱ በተሳካ ሁኔታ ተመዝግቧል!' : 'Load published successfully!'}</span>
            </div>
          )}

          <form onSubmit={handlePostLoad} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'AM' ? 'የጭነት ስም እና ዝርዝር *' : 'Cargo Description *'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'AM' ? 'ለምሳሌ፡ 28 ቶን የታጠበ አንደኛ ደረጃ ቡና' : 'e.g. 28 Tons Grade 1 Washed Coffee'}
                value={cargoName}
                onChange={(e) => setCargoName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'AM' ? 'የኮንቴይነር አይነት *' : 'Container Type *'}
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                >
                  <option>Containerized (40ft High-Cube)</option>
                  <option>Containerized (20ft Standard)</option>
                  <option>Bulk Bagged Goods</option>
                  <option>Refrigerated (Reefer)</option>
                  <option>Flatbed / Heavy Machinery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'AM' ? 'ጠቅላላ ክብደት (ቶን) *' : 'Total Weight (Tons) *'}
                </label>
                <input
                  type="number"
                  required
                  placeholder="28"
                  value={weightTons}
                  onChange={(e) => setWeightTons(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'AM' ? 'መነሻ ቦታ *' : 'Origin Location *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'AM' ? 'ለምሳሌ፡ አዲስ አበባ ቃሊቲ' : 'e.g. Addis Ababa (Kaliti)'}
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'AM' ? 'መዳረሻ ቦታ *' : 'Destination Location *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'AM' ? 'ለምሳሌ፡ የጅቡቲ ወደብ' : 'e.g. Djibouti Port'}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'AM' ? 'የታሰበው በጀት (ብር) *' : 'Target Budget (ETB) *'}
              </label>
              <input
                type="number"
                required
                placeholder="145000"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
              >
                <span>{language === 'AM' ? 'ጭነቱን አስመዝግብ' : 'Publish Load to Corridor'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. BID MANAGEMENT */}
      {activeTab === 'bids' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'የጨረታ ዋጋዎች ንጽጽር' : 'Bid Management'}
          </h2>

          {bids.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
              <Gavel className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">
                {language === 'AM' ? 'እስካሁን የቀረበ የጨረታ ዋጋ የለም' : 'No transporter bids received yet'}
              </div>
              <p className="text-xs text-slate-400">
                {language === 'AM' ? 'አጓጓዦች ለተመዘገቡት ጭነቶች ዋጋ ሲያቀርቡ እዚህ ጋር ይዘረዘራሉ።' : 'When transporters place quotes for your active loads, they will appear here for review.'}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* 4. LIVE TRACKING MAP */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'የቀጥታ ካርታ ክትትል' : 'Live Corridor Telematics Map'}
          </h2>

          <div className="h-72 rounded-2xl bg-[#090E17] border border-slate-800 p-6 flex flex-col justify-center items-center text-center text-white space-y-3">
            <Navigation className="w-10 h-10 text-[#38BDF8] animate-pulse" />
            <div className="text-sm font-bold">
              {language === 'AM' ? 'የኢትዮጵያ–ጅቡቲ ኮሪደር የቀጥታ ካርታ መስመር' : 'Djibouti–Addis Ababa Corridor Telematics Stream Active'}
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              {language === 'AM' ? 'በጉዞ ላይ ያሉ ጭነቶች የጂፒኤስ ፍጥነትና መገኛ በቅጽበት ይተላለፋል።' : 'Real-time GPS coordinates and checkpoint pass events are streamed live.'}
            </p>
          </div>
        </div>
      )}

      {/* 5. CUSTOMS DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">
              {language === 'AM' ? 'የጉምሩክ ሰነዶች' : 'Customs Document Vault'}
            </h2>
            <button className="px-4 py-2 rounded-xl bg-[#0284C7] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <UploadCloud className="w-4 h-4" />
              <span>{language === 'AM' ? 'ሰነድ ጫን' : 'Upload Document'}</span>
            </button>
          </div>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'የተጫነ ሰነድ የለም' : 'No documents uploaded yet'}
            </div>
            <p className="text-xs text-slate-400">
              {language === 'AM' ? 'የማስመጫ/የማስላኪያ ኢንቮይስ እና ቢል ኦፍ ሌዲንግ ሰነዶችን እዚህ ጋር ይጫኑ።' : 'Upload Bill of Lading, Commercial Invoice, and Packing lists.'}
            </p>
          </div>
        </div>
      )}

      {/* 6. PAYMENTS & TELEBIRR */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'ክፍያዎችና ቴሌብር' : 'Payment History & Escrow'}
          </h2>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'እስካሁን የተፈጸመ ክፍያ የለም' : 'No transactions recorded yet'}
            </div>
            <p className="text-xs text-slate-400">
              {language === 'AM' ? 'ለተጓጓዘው ጭነት በቴሌብር ወይም በባንክ የተፈጸመ ክፍያ እዚህ ጋር ይመዘገባል።' : 'TeleBirr smart escrow locks and releases will appear here.'}
            </p>
          </div>
        </div>
      )}

      {/* 7. RATINGS & REVIEWS */}
      {activeTab === 'ratings' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'ግምገማ እና ደረጃ' : 'Transporter Ratings & Reviews'}
          </h2>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <Star className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'እስካሁን የተሰጠ ግምገማ የለም' : 'No reviews recorded yet'}
            </div>
            <p className="text-xs text-slate-400">
              {language === 'AM' ? 'ጭነትዎ መዳረሻው ሲደርስ ለአጓጓዡ ደረጃና አስተያየት መስጠት ይችላሉ።' : 'You can rate transporters upon trip delivery completion.'}
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
