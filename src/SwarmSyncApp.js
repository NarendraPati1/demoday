import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import { 
  LayoutDashboard, 
  AlertTriangle, 
  Truck, 
  Activity, 
  MapPin, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Plus, 
  X,
  Wrench,
  CheckCircle2,
  Clock,
  ChevronRight,
  Phone,
  ArrowRightLeft,
  Fuel,
  Package,
  Star,
  History,
  Info,
  Check,
  XCircle,
  Loader2,
  Send,
  Lock,
  Construction,
  Ban,
  Siren,
  Trash2,
  Save,
  Square,
  Circle as CircleIcon,
  MousePointer2
} from 'lucide-react';

// --- Leaflet Icon Setup ---
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [20, 32], 
    iconAnchor: [10, 32]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Colored Icons
const RedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const GreenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- Mock Data ---

const PUNE_CENTER = [18.5204, 73.8567];
const FLEET_STATS = { total: 247, onTime: 218, delayed: 23, completed: 89, inTransit: 158 };

// 1. REALLOCATION DATA
const DELAYED_VEHICLES = [
  { 
    id: 'MH 12 AB 1234', 
    reason: 'Vehicle Breakdown', 
    severity: 'Critical', 
    location: 'Hinjewadi Phase 1', 
    coords: [18.5913, 73.7389], 
    delay: '45 min', 
    shipment: 'SHP-A1B2C3', 
    dest: 'Koramangala', 
    impact: '+2 hrs',
    loadRequired: 30 
  },
  { 
    id: 'MH 12 CD 5678', 
    reason: 'Traffic Congestion', 
    severity: 'High', 
    location: 'Silk Board Junction', 
    coords: [18.5156, 73.9168], 
    delay: '25 min', 
    shipment: 'SHP-D4E5F6', 
    dest: 'Electronic City', 
    impact: '+45 min',
    loadRequired: 15
  },
  { 
    id: 'MH 12 EF 9012', 
    reason: 'Accident', 
    severity: 'Critical', 
    location: 'Outer Ring Road', 
    coords: [18.5580, 73.8360],
    delay: '1 hr 15 min', 
    shipment: 'SHP-G7H8I9', 
    dest: 'Whitefield', 
    impact: '+3 hrs',
    loadRequired: 60
  }
];

const FLEET_POOL = [
  { id: 'MH 12 IJ 7890', status: 'available', coords: [18.5700, 73.7500], capacityFree: 65, speed: 40 },
  { id: 'MH 12 KL 1122', status: 'light load', coords: [18.5300, 73.8500], capacityFree: 45, speed: 35 },
  { id: 'MH 12 MN 3344', status: 'available', coords: [18.5500, 73.9200], capacityFree: 80, speed: 42 },
  { id: 'MH 12 OP 5566', status: 'en route', coords: [18.4900, 73.8000], capacityFree: 10, speed: 30 },
  { id: 'MH 12 QR 7788', status: 'available', coords: [18.6000, 73.7800], capacityFree: 70, speed: 40 }, 
];

// 2. NOTIFICATIONS
const NOTIFICATIONS = [
  { id: 1, type: 'critical', title: 'BREAKDOWN', vehicle: 'MH 12 AB 1234', time: 'Failure imminent', loc: 'Hinjewadi Phase 1', coords: [18.5913, 73.7389] },
  { id: 2, type: 'warning', title: 'DELAY RISK', vehicle: 'MH 12 CD 5678', time: 'SLA breach in 18 min', loc: 'Koregaon Park', coords: [18.5362, 73.8939] },
  { id: 3, type: 'success', title: 'DELIVERY COMPLETE', vehicle: 'MH 12 ST 9900', time: 'Completed 5 min ago', loc: 'Viman Nagar', coords: [18.5679, 73.9143] },
  { id: 4, type: 'warning', title: 'TRAFFIC ALERT', vehicle: 'MH 12 IJ 7890', time: '12 min delay expected', loc: 'Swargate Junction', coords: [18.5018, 73.8636] },
];

// 3. HEALTH
const HEALTH_VEHICLES = [
  { id: 'MH 12 EF 9012', status: 'critical', risk: '89%', nextService: 'OVERDUE', issues: ['Engine overheating', 'Oil pressure low', 'Brake wear critical'] },
  { id: 'MH 12 AB 1234', status: 'critical', risk: '78%', nextService: '2 days', issues: ['Battery voltage low'] },
  { id: 'MH 12 GH 3456', status: 'warning', risk: '34%', nextService: '15 days', issues: ['Tire pressure fluctuation'] },
  { id: 'MH 12 CD 5678', status: 'warning', risk: '21%', nextService: '20 days', issues: ['Coolant level low'] },
  { id: 'MH 12 IJ 7890', status: 'normal', risk: '8%', nextService: '45 days', issues: [] },
  { id: 'MH 12 KL 1122', status: 'normal', risk: '4%', nextService: '50 days', issues: [] },
];

// 4. ASSISTANCE DATA
const GARAGES = [
  { name: 'Tata Authorised Service Center', dist: '1.2 km', eta: '8 min', rating: 4.8, status: 'available', tags: ['engine', 'battery', 'tyre', 'other'], bestMatch: true },
  { name: 'QuickFix Auto Garage', dist: '2.1 km', eta: '12 min', rating: 4.5, status: 'available', tags: ['tyre', 'battery'] },
  { name: 'City Auto Works', dist: '3.5 km', eta: '20 min', rating: 4.0, status: 'available', tags: ['battery', 'tyre', 'other'] },
  { name: 'RoadRunner Mechanics', dist: '2.8 km', eta: '15 min', rating: 4.2, status: 'busy', tags: ['engine', 'other'] },
];

const INITIAL_ASSISTANCE_VEHICLES = [
    { id: 'MH 12 AB 1234', issue: 'Battery Failure', desc: 'Battery failure - vehicle not starting', loc: 'HSR Layout, Sector 2', time: '10:45 AM', status: 'Pending', driver: 'Ramesh Kumar' },
    { id: 'MH 12 EF 9012', issue: 'Engine Failure', desc: 'Engine overheating - smoke from bonnet', loc: 'Electronic City Phase 1', time: '10:30 AM', status: 'Pending', driver: 'Suresh Babu' },
    { id: 'MH 12 KL 1122', issue: 'Tyre Puncture', desc: 'Rear tyre puncture', loc: 'Marathahalli Bridge', time: '10:15 AM', status: 'Dispatched', driver: 'Vijay Sharma' },
    { id: 'MH 12 GH 3456', issue: 'Other Issue', desc: 'Brake pad worn out - grinding noise', loc: 'Whitefield Main Road', time: '09:50 AM', status: 'Pending', driver: 'Anil Reddy' }
];

// 5. VEHICLES & DRIVERS
const VEHICLES_LIST = [
  { id: 'MH 12 AB 1234', plate: 'MH 12 AB 1234', type: 'Long Haul', status: 'Active' },
  { id: 'MH 12 CD 5678', plate: 'MH 12 CD 5678', type: 'Regional', status: 'Active' },
  { id: 'MH 12 IJ 7890', plate: 'MH 12 IJ 7890', type: 'Last Mile', status: 'Maintenance' },
  { id: 'MH 12 GH 3456', plate: 'MH 12 GH 3456', type: 'Long Haul', status: 'Active' },
  { id: 'MH 12 EF 9012', plate: 'MH 12 EF 9012', type: 'Regional', status: 'Inactive' },
];

const DRIVERS_LIST = [
  { name: 'Ramesh Kumar', id: 'DRV-101', score: 92, status: 'Active' },
  { name: 'Suresh Babu', id: 'DRV-102', score: 88, status: 'Active' },
  { name: 'Vijay Sharma', id: 'DRV-103', score: 85, status: 'On leave' },
  { name: 'Anil Reddy', id: 'DRV-104', score: 78, status: 'Active' },
  { name: 'Prasad Rao', id: 'DRV-105', score: 65, status: 'Inactive' },
];

// 6. ROAD BLOCKAGE DATA
const ROAD_BLOCKAGES = [
    { id: 'RB-001', type: 'Construction', location: 'Chandani Chowk', reporter: 'DRV-1234', time: '09:30', affected: 12, severity: 'High', clearTime: '2 hours', coords: [18.5089, 73.7917], desc: "Road widening work in progress. Two lanes blocked." },
    { id: 'RB-002', type: 'Accident', location: 'Holkar Bridge', reporter: 'MH-12-0847', time: '10:15', affected: 8, severity: 'Critical', clearTime: '45 min', coords: [18.5580, 73.8360], desc: "Multi-vehicle pileup. Emergency services on scene." },
    { id: 'RB-003', type: 'Congestion', location: 'Sancheti Hospital Chowk', reporter: 'DRV-5678', time: '08:45', affected: 5, severity: 'Medium', clearTime: '30 min', coords: [18.5293, 73.8505], desc: "Heavy traffic due to signal malfunction." },
    { id: 'RB-004', type: 'Road Closure', location: 'Katraj Tunnel', reporter: 'MH-12-1203', time: '07:00', affected: 20, severity: 'Critical', clearTime: '4 hours', coords: [18.4230, 73.8690], desc: "Tunnel maintenance. Complete closure." },
];

// 7. GEOFENCING DATA
const INITIAL_ZONES = [
    { id: 1, name: 'Hinjewadi Congestion', type: 'Delay-Prone', active: true, vehicles: 34, coords: [18.5913, 73.7389], appliesTo: 'Entire Fleet' },
    { id: 2, name: 'Shivajinagar Roadwork', type: 'Avoid', active: true, vehicles: 12, coords: [18.5293, 73.8505], appliesTo: 'Heavy Vehicles' },
    { id: 3, name: 'Viman Nagar Event', type: 'Conditional', active: false, vehicles: 0, coords: [18.5679, 73.9143], appliesTo: 'Selected Vehicles' },
    { id: 4, name: 'Airport Priority Corridor', type: 'High Priority', active: true, vehicles: 15, coords: [18.5793, 73.9089], appliesTo: 'Emergency Only' },
];

// 8. ANALYTICS
const ANALYTICS_DATA = {
  topVehicles: [
    { name: 'MH 12 AB 1234', deliveries: 342, score: 95 },
    { name: 'MH 12 CD 5678', deliveries: 215, score: 92 },
    { name: 'MH 12 GH 3456', deliveries: 389, score: 91 },
    { name: 'MH 12 IJ 7890', deliveries: 456, score: 89 },
    { name: 'MH 12 EF 9012', deliveries: 512, score: 87 },
  ],
  topDrivers: [
    { name: 'Rajesh Kumar', deliveries: 156, rating: 4.9, score: 96 },
    { name: 'Suresh Sharma', deliveries: 142, rating: 4.8, score: 94 },
    { name: 'Vijay Singh', deliveries: 138, rating: 4.7, score: 91 },
    { name: 'Amit Patel', deliveries: 129, rating: 4.6, score: 88 },
    { name: 'Kiran Reddy', deliveries: 121, rating: 4.5, score: 85 },
  ]
};

// --- ALGORITHM LOGIC ---
const calculateReallocationScore = (delayed, candidate) => {
  // Use array indices for distance calculation for Leaflet [lat, lng]
  const dist = Math.sqrt(Math.pow(candidate.coords[0] - delayed.coords[0], 2) + Math.pow(candidate.coords[1] - delayed.coords[1], 2));
  // Simple scalar for mock data distance display
  const displayDist = (dist * 111).toFixed(1); // Rough deg to km conversion
  
  const normalizedDist = Math.max(0, 100 - (dist * 1000)); // Increased sensitivity for mock lat/lng
  
  let capacityScore = candidate.capacityFree >= delayed.loadRequired ? 100 : 0;
  if (capacityScore === 0) return { score: 0, dist: displayDist, eta: 0 };

  const statusScores = { 'available': 100, 'light load': 70, 'en route': 30, 'maintenance': 0 };
  const statusScore = statusScores[candidate.status] || 0;
  
  const finalScore = (normalizedDist * 0.5) + (statusScore * 0.3) + (capacityScore * 0.2);
  
  return {
    score: Math.min(99, Math.round(finalScore)),
    dist: displayDist,
    eta: Math.round((dist * 500)) // Mock ETA
  };
};

// --- Helper Components ---

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Auto-zoom to fit two points
function PathFitter({ p1, p2 }) {
    const map = useMap();
    useEffect(() => {
        if (p1 && p2) {
            const bounds = L.latLngBounds([p1, p2]);
            map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
        }
    }, [p1, p2, map]);
    return null;
}

// Click Handler Component
const MapClickHandler = ({ isDrawing, onMapClick }) => {
    const map = useMapEvents({
      click: (e) => {
        if (isDrawing) {
          onMapClick(e.latlng);
        }
      },
    });
    
    useEffect(() => {
        if (isDrawing) {
            map.getContainer().style.cursor = 'crosshair';
        } else {
            map.getContainer().style.cursor = '';
        }
    }, [isDrawing, map]);

    return null;
  };

const Toggle = ({ active, onClick }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${active ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
        <div 
            className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} 
        />
    </div>
);

const StatusBadge = ({ type }) => {
  const styles = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    Critical: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-amber-100 text-amber-700 border-amber-200',
    Medium: 'bg-blue-100 text-blue-700 border-blue-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    normal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    available: 'bg-emerald-100 text-emerald-700',
    'light load': 'bg-amber-100 text-amber-800',
    'en route': 'bg-gray-100 text-gray-600',
    busy: 'bg-gray-100 text-gray-700',
    Active: 'bg-emerald-100 text-emerald-700',
    'On leave': 'bg-amber-100 text-amber-700',
    Inactive: 'bg-red-100 text-red-700',
    Maintenance: 'bg-amber-100 text-amber-700',
    Pending: 'bg-amber-100 text-amber-700',
    Dispatched: 'bg-emerald-100 text-emerald-700',
    Processing: 'bg-blue-100 text-blue-700 border-blue-200',
    Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Construction: 'bg-amber-100 text-amber-700',
    Accident: 'bg-red-100 text-red-700',
    Congestion: 'bg-blue-100 text-blue-700',
    'Road Closure': 'bg-red-100 text-red-700',
    'Delay-Prone': 'bg-amber-100 text-amber-700',
    Avoid: 'bg-red-100 text-red-700',
    Conditional: 'bg-gray-100 text-gray-700',
    'High Priority': 'bg-blue-100 text-blue-700',
    Cleared: 'bg-emerald-100 text-emerald-700'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border capitalize ${styles[type] || styles.normal}`}>
      {type}
    </span>
  );
};

const MetricCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
    {Icon && (
        <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('700', '50').replace('600', '50').replace('500', '50')} ${colorClass}`}>
        <Icon size={20} />
        </div>
    )}
  </div>
);

// --- Sub-Views ---

const RoadBlockageView = () => {
    const [blockages, setBlockages] = useState(ROAD_BLOCKAGES);
    const [selectedBlockageId, setSelectedBlockageId] = useState(null);
    const [clearedBlockages, setClearedBlockages] = useState([]);

    const selectedBlockage = blockages.find(b => b.id === selectedBlockageId);

    const handleClear = () => {
        if (!selectedBlockage) return;
        setBlockages(blockages.filter(b => b.id !== selectedBlockageId));
        setClearedBlockages([...clearedBlockages, { ...selectedBlockage, status: 'Cleared' }]);
        setSelectedBlockageId(null);
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)]">
            {/* Left: Map */}
            <div className="w-2/3 bg-white rounded-lg border border-gray-200 relative overflow-hidden shadow-sm">
                <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded shadow text-sm font-bold text-gray-800 z-[1000] border border-gray-200 flex items-center gap-2">
                    <MapPin size={16} className="text-red-500"/> Pune Metro Area
                </div>
                <MapContainer center={PUNE_CENTER} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {blockages.map(block => (
                        <Marker 
                            key={block.id} 
                            position={block.coords}
                            eventHandlers={{ click: () => setSelectedBlockageId(block.id) }}
                        >
                            <Popup>
                                <div className="font-bold">{block.type}</div>
                                <div className="text-xs">{block.location}</div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Right: Active Blockages List & Details */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-700 uppercase text-sm">Active Blockages ({blockages.length})</h3>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div> Live Updates
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-3 space-y-3">
                        {blockages.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedBlockageId(item.id)}
                                className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedBlockageId === item.id ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-100' : 'bg-white border-gray-200 hover:border-red-300'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <Construction size={16} className="text-blue-600"/>
                                        <span className="font-bold text-gray-800 text-sm">{item.id}</span>
                                    </div>
                                    <StatusBadge type={item.type}/>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-1">
                                    <MapPin size={14} className="text-gray-400"/> {item.location}
                                </div>
                                <div className="text-xs text-gray-500 mb-2 flex gap-4">
                                    <span className="flex items-center gap-1"><Users size={10}/> Reported by {item.reporter}</span>
                                    <span className="flex items-center gap-1"><Clock size={10}/> {item.time}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-xs flex justify-between items-center mt-2">
                                    <span className="text-gray-600">{item.affected} vehicles affected</span>
                                    <span className="font-bold text-amber-600 flex items-center gap-1"><AlertTriangle size={10}/> {item.severity.toUpperCase()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Panel - Shows when selected */}
                {selectedBlockage && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm animate-in slide-in-from-bottom-5">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-gray-700 text-sm uppercase">Blockage Details</h3>
                            <button onClick={() => setSelectedBlockageId(null)}><X size={14} className="text-gray-400 hover:text-gray-600"/></button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{selectedBlockage.desc}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                            <div>
                                <span className="text-gray-400 block">Reported By</span>
                                <span className="font-medium">{selectedBlockage.reporter}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Affected Vehicles</span>
                                <span className="font-medium">{selectedBlockage.affected}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleClear}
                            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={16}/> Mark as Cleared
                        </button>
                    </div>
                )}

                {/* Recently Cleared */}
                {!selectedBlockage && clearedBlockages.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="font-bold text-gray-400 text-xs uppercase mb-2">Recently Cleared</h3>
                        {clearedBlockages.map(b => (
                            <div key={b.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded mb-1">
                                <span className="text-gray-600 truncate">{b.location}</span>
                                <StatusBadge type="Cleared"/>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const GeofencingView = () => {
    const [zones, setZones] = useState(INITIAL_ZONES);
    const [selectedZoneId, setSelectedZoneId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Drawing Mode State
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [pendingZoneData, setPendingZoneData] = useState(null);

    // Form State
    const [editForm, setEditForm] = useState({ type: '', appliesTo: '', name: '' });
    const [newZoneForm, setNewZoneForm] = useState({ name: '', type: 'High Priority', shape: 'Polygon' });

    const selectedZone = zones.find(z => z.id === selectedZoneId);

    // Initialize form when zone selected
    useEffect(() => {
        if (selectedZone) {
            setEditForm({
                type: selectedZone.type,
                appliesTo: selectedZone.appliesTo || 'Entire Fleet',
                name: selectedZone.name
            });
            setIsEditing(true);
        } else {
            setIsEditing(false);
        }
    }, [selectedZone]);

    const toggleZone = (id) => {
        setZones(zones.map(z => z.id === id ? { ...z, active: !z.active } : z));
    };

    const handleFormChange = (key, value) => {
        setEditForm(prev => ({ ...prev, [key]: value }));
        // Live Update
        if (selectedZone) {
            setZones(zones.map(z => z.id === selectedZoneId ? { ...z, [key]: value } : z));
        }
    };

    const handleCreateZoneStep1 = () => {
        setPendingZoneData(newZoneForm);
        setIsAddModalOpen(false);
        setIsDrawingMode(true);
    };

    const handleMapClick = (latlng) => {
        if(!isDrawingMode || !pendingZoneData) return;

        const newId = zones.length + 1;
        const newZone = { 
            id: newId, 
            name: pendingZoneData.name || `New Zone ${newId}`, 
            type: pendingZoneData.type, 
            active: true, 
            vehicles: 0, 
            coords: [latlng.lat, latlng.lng],
            appliesTo: 'Entire Fleet'
        };
        setZones([...zones, newZone]);
        setSelectedZoneId(newId);
        
        // Reset states
        setIsDrawingMode(false);
        setPendingZoneData(null);
        setNewZoneForm({ name: '', type: 'High Priority', shape: 'Polygon' });
    };

    const handleDelete = () => {
        setZones(zones.filter(z => z.id !== selectedZoneId));
        setSelectedZoneId(null);
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)] relative">
            {/* Create New Zone Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
                                <Square size={16}/> Create New Zone
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Zone Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Airport Priority Corridor" 
                                    value={newZoneForm.name}
                                    onChange={(e) => setNewZoneForm({...newZoneForm, name: e.target.value})}
                                    className="w-full border border-blue-300 ring-1 ring-blue-100 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Zone Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['High Priority', 'Avoid Completely', 'Delay-Prone', 'Conditional'].map(type => (
                                        <div 
                                            key={type}
                                            onClick={() => setNewZoneForm({...newZoneForm, type})} 
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${newZoneForm.type === type ? 'border-blue-600' : 'border-gray-300'}`}>
                                                {newZoneForm.type === type && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                                            </div>
                                            <span className="text-xs text-gray-700">{type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Shape</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setNewZoneForm({...newZoneForm, shape: 'Polygon'})}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded border flex items-center justify-center gap-2 ${newZoneForm.shape === 'Polygon' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                                    >
                                        <Square size={14}/> Polygon
                                    </button>
                                    <button 
                                        onClick={() => setNewZoneForm({...newZoneForm, shape: 'Circle'})}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded border flex items-center justify-center gap-2 ${newZoneForm.shape === 'Circle' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                                    >
                                        <CircleIcon size={14}/> Circle
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-gray-50 flex justify-end gap-2">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-xs font-medium hover:bg-gray-100">Cancel</button>
                            <button onClick={handleCreateZoneStep1} className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 shadow-sm">Create Zone</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left: Map */}
            <div className="w-2/3 bg-white rounded-lg border border-gray-200 relative overflow-hidden shadow-sm">
                <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded shadow text-sm font-bold text-gray-800 z-[1000] border border-gray-200">
                    <Settings size={16} className="inline mr-2"/> Geofencing Control
                </div>
                
                {/* Drawing Mode Instruction Banner */}
                {isDrawingMode && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-[1000] flex items-center gap-3 animate-in slide-in-from-top-2">
                        <MousePointer2 size={16} />
                        <span className="text-sm font-medium">Click on the map to place <strong>{pendingZoneData?.name}</strong></span>
                        <button onClick={() => setIsDrawingMode(false)} className="bg-blue-700 p-1 rounded hover:bg-blue-800"><X size={14}/></button>
                    </div>
                )}

                <MapContainer center={PUNE_CENTER} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    <MapClickHandler isDrawing={isDrawingMode} onMapClick={handleMapClick} />

                    {zones.filter(z => z.active).map(zone => (
                        <Circle 
                            key={zone.id} 
                            center={zone.coords} 
                            radius={1500} 
                            pathOptions={{ 
                                color: zone.type === 'Avoid' ? 'red' : 'blue', 
                                fillColor: zone.type === 'Avoid' ? 'red' : 'blue', 
                                fillOpacity: 0.2 
                            }} 
                        />
                    ))}
                </MapContainer>
            </div>

            {/* Right: Sidebar */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 uppercase text-sm">Active Zones</h3>
                        <Plus onClick={() => setIsAddModalOpen(true)} size={16} className="text-gray-500 cursor-pointer hover:text-blue-600"/>
                    </div>
                    <div className="overflow-y-auto flex-1 p-3 space-y-3">
                        {zones.map(zone => (
                            <div 
                                key={zone.id} 
                                onClick={() => setSelectedZoneId(zone.id)}
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedZoneId === zone.id ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-100' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        {zone.type === 'Avoid' ? <Ban size={16} className="text-red-500"/> : <Siren size={16} className="text-amber-500"/>}
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">{zone.name}</div>
                                            <StatusBadge type={zone.type}/>
                                        </div>
                                    </div>
                                    <Toggle active={zone.active} onClick={() => toggleZone(zone.id)} />
                                </div>
                                <div className="text-xs text-gray-500 pl-6">
                                    <Truck size={10} className="inline mr-1"/> {zone.vehicles} vehicles affected
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Configuration Panel - COMPACT & FIXED (Name Input Removed) */}
                <div className={`bg-white rounded-lg border border-gray-200 p-3 transition-all ${isEditing ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-800 text-[10px] uppercase tracking-wide">Zone Config</h3>
                        {selectedZone && (
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${selectedZone.active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {selectedZone.active ? 'ON' : 'OFF'}
                                </span>
                                <Toggle active={selectedZone.active} onClick={() => toggleZone(selectedZone.id)} />
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        {/* Zone Name Display Only - No Input */}
                        <div className="mb-1">
                             <span className="text-xs font-bold text-gray-700 block truncate">{selectedZone?.name || 'Select a zone'}</span>
                        </div>

                        {/* Zone Type Radio */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-1 block uppercase">Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['High Priority', 'Avoid', 'Delay-Prone', 'Conditional'].map(type => (
                                    <div 
                                        key={type} 
                                        onClick={() => handleFormChange('type', type)}
                                        className={`flex items-center gap-1.5 cursor-pointer p-1.5 rounded border transition-all ${editForm.type === type ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${editForm.type === type ? 'border-blue-600' : 'border-gray-400'}`}>
                                            {editForm.type === type && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
                                        </div>
                                        <label className={`text-[10px] cursor-pointer ${type === 'Avoid' ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{type}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Applies To Radio */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-1 block uppercase">Applies To</label>
                            <div className="space-y-1.5">
                                {['Entire Fleet', 'Selected Vehicles', 'Emergency Only'].map(opt => (
                                    <div 
                                        key={opt} 
                                        onClick={() => handleFormChange('appliesTo', opt)}
                                        className="flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${editForm.appliesTo === opt ? 'border-blue-600' : 'border-gray-400'}`}>
                                            {editForm.appliesTo === opt && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
                                        </div>
                                        <span className="text-xs text-gray-700">{opt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t mt-2">
                            <button 
                                onClick={handleDelete}
                                className="flex-1 py-1.5 bg-gray-100 text-red-600 rounded text-xs font-medium hover:bg-red-50 flex items-center justify-center gap-1"
                            >
                                <Trash2 size={14}/> Delete
                            </button>
                            <button 
                                onClick={() => setSelectedZoneId(null)}
                                className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 flex items-center justify-center gap-1"
                            >
                                <Save size={14}/> Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReallocationView = () => {
  const [selectedDelayedId, setSelectedDelayedId] = useState(DELAYED_VEHICLES[0].id);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [progressState, setProgressState] = useState({}); 
  const [vehicleStatus, setVehicleStatus] = useState({});
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  const selectedVehicle = DELAYED_VEHICLES.find(v => v.id === selectedDelayedId);

  // *** IMPORTANT: REPLACE WITH YOUR RAW 40-CHAR ORS API KEY ***
  const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZmY2JjMTU3ZWRhZTRlZmJhZGIzYjM4Zjk1YmZkMWZjIiwiaCI6Im11cm11cjY0In0='; 

  useEffect(() => {
    if (!selectedVehicle) return;

    const scoredCandidates = FLEET_POOL.map(candidate => {
      const result = calculateReallocationScore(selectedVehicle, candidate);
      return { ...candidate, ...result };
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score);

    setCandidates(scoredCandidates);
    if(scoredCandidates.length > 0 && !selectedCandidateId) {
        setSelectedCandidateId(scoredCandidates[0].id);
    }
  }, [selectedDelayedId, selectedVehicle]);

  const fetchRoute = async (start, end) => {
      if (!ORS_API_KEY || ORS_API_KEY === 'YOUR_ORS_API_KEY_HERE') {
          console.error("Please set your OpenRouteService API Key");
          return;
      }
      // ORS expects [lng, lat] structure
      const startLngLat = `${start[1]},${start[0]}`;
      const endLngLat = `${end[1]},${end[0]}`;

      try {
        const response = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?start=${startLngLat}&end=${endLngLat}`,
          { headers: { 'Authorization': ORS_API_KEY } }
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          // Swap back to [lat, lng] for Leaflet Polyline
          const leafletCoords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoordinates(leafletCoords);
        }
      } catch (error) {
        console.error("Error fetching route from ORS:", error);
      }
  };

  const handleApprove = () => {
    if (!selectedCandidateId || !selectedDelayedId) return;

    setVehicleStatus(prev => ({ ...prev, [selectedDelayedId]: 'Processing' }));
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10; // Faster for demo
        setProgressState(prev => ({ ...prev, [selectedDelayedId]: progress }));
        
        if (progress >= 100) {
            clearInterval(interval);
            setVehicleStatus(prev => ({ ...prev, [selectedDelayedId]: 'Resolved' }));
            
            // Fetch route after approval
            const delayed = DELAYED_VEHICLES.find(v => v.id === selectedDelayedId);
            const candidate = candidates.find(c => c.id === selectedCandidateId);
            if(delayed && candidate) {
                fetchRoute(delayed.coords, candidate.coords);
            }
        }
    }, 100);
  };

  const currentStatus = vehicleStatus[selectedDelayedId] || 'Pending';
  const currentProgress = progressState[selectedDelayedId] || 0;

  return (
    <div className="flex gap-6 relative h-[calc(100vh-140px)]">
      <div className="w-1/3 flex flex-col gap-4 h-full">
        <h3 className="font-bold text-gray-700 text-sm uppercase px-1 mt-2">Delayed Vehicles</h3>
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
           {DELAYED_VEHICLES.map((v) => {
             const isSelected = selectedDelayedId === v.id;
             const status = vehicleStatus[v.id] || 'Pending';

             return (
               <div 
                 key={v.id}
                 onClick={() => setSelectedDelayedId(v.id)}
                 className={`p-4 rounded shadow-sm border transition-all relative overflow-hidden cursor-pointer ${
                   isSelected 
                     ? 'bg-white border-blue-500 ring-1 ring-blue-500 shadow-md' 
                     : 'bg-white border-gray-200 hover:border-blue-300'
                 }`}
               >
                  <div className="flex justify-between items-start mb-2">
                     <div className={`font-bold flex items-center gap-2 ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                       <Truck size={16} className={v.severity === 'Critical' ? 'text-red-500' : 'text-amber-500'}/> {v.id}
                     </div>
                     {status === 'Pending' ? (
                        <StatusBadge type={v.severity}/>
                     ) : (
                        <StatusBadge type={status}/>
                     )}
                  </div>
                  
                  {status === 'Processing' && (
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                          <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-100" style={{ width: `${progressState[v.id]}%` }}></div>
                      </div>
                  )}

                  <div className={`text-xs font-medium mb-2 ${v.severity === 'Critical' ? 'text-red-500' : 'text-amber-600'}`}>
                    {v.reason}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                     <div className="flex items-center gap-2"><MapPin size={12}/> {v.location}</div>
                     <div className="flex items-center gap-2"><Clock size={12}/> Delayed: {v.delay}</div>
                     <div className="flex items-center gap-2"><ArrowRightLeft size={12}/> {v.shipment} → {v.dest}</div>
                  </div>
                  <div className="mt-3 text-xs text-red-600 font-bold">ETA Impact: {v.impact}</div>
               </div>
             );
           })}
        </div>
      </div>

      <div className="w-2/3 bg-white rounded-lg border border-gray-200 p-6 flex flex-col h-full">
         <div className="flex justify-between border-b pb-4 mb-4 flex-shrink-0">
           <div>
             <div className="text-sm text-gray-500">Reallocating cargo from</div>
             <div className="font-bold text-lg flex items-center gap-2">
               {selectedVehicle?.id} 
               <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                 Req. Load: {selectedVehicle?.loadRequired}%
               </span>
             </div>
           </div>
           <div className="text-right">
             <div className="text-sm text-gray-500">Shipment ID</div>
             <div className="font-mono font-bold">{selectedVehicle?.shipment}</div>
           </div>
         </div>

         <div className="flex justify-between items-end mb-4 flex-shrink-0">
           <div>
             <h3 className="font-semibold text-gray-700 mb-1">BEST CANDIDATE VEHICLES</h3>
             <p className="text-xs text-gray-500">Ranked by proximity, capacity, and current status</p>
           </div>
           
           {currentStatus !== 'Resolved' && (
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium flex items-center gap-2 hover:bg-gray-200">
                        <X size={16}/> Deny
                    </button>
                    <button 
                        onClick={handleApprove}
                        disabled={currentStatus === 'Processing'}
                        className={`px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium flex items-center gap-2 shadow-sm transition-all ${currentStatus === 'Processing' ? 'opacity-75 cursor-wait' : 'hover:bg-emerald-700'}`}
                    >
                        {currentStatus === 'Processing' ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>}
                        {currentStatus === 'Processing' ? 'Processing...' : 'Approve Reallocation'}
                    </button>
                </div>
           )}
         </div>

         <div className="space-y-3 overflow-y-auto flex-1 pr-1 relative">
           
           {/* MAP ADDED HERE - ONLY ON APPROVAL - REMOVED TEXT BLOCK */}
           {currentStatus === 'Resolved' ? (
                <div className="h-full rounded-lg overflow-hidden border border-gray-200 relative z-0">
                    <MapContainer center={PUNE_CENTER} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer attribution='&copy; OSM & OpenRouteService' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        
                        {/* Draw Delayed Vehicle */}
                        {selectedVehicle && (
                            <Marker position={selectedVehicle.coords} icon={RedIcon}>
                                <Popup>Delayed: {selectedVehicle.id}</Popup>
                            </Marker>
                        )}

                        {/* Draw Candidate Vehicle */}
                        {selectedCandidateId && candidates.find(c => c.id === selectedCandidateId) && (
                            <Marker position={candidates.find(c => c.id === selectedCandidateId).coords} icon={GreenIcon}>
                                <Popup>Candidate: {selectedCandidateId}</Popup>
                            </Marker>
                        )}

                        {/* Draw Path from ORS Data */}
                        {routeCoordinates.length > 0 && (
                            <Polyline 
                                    positions={routeCoordinates} 
                                    pathOptions={{ color: 'blue', weight: 4, opacity: 0.7 }} 
                            />
                        )}
                        
                        {/* Fit map to points */}
                        {selectedVehicle && selectedCandidateId && candidates.find(c => c.id === selectedCandidateId) && (
                            <PathFitter p1={selectedVehicle.coords} p2={candidates.find(c => c.id === selectedCandidateId).coords} />
                        )}
                    </MapContainer>
                </div>
           ) : (
                candidates.length > 0 ? candidates.map((c, idx) => {
                    const isCandidateSelected = selectedCandidateId === c.id;
                    return (
                        <div 
                            key={c.id} 
                            onClick={() => currentStatus === 'Pending' && setSelectedCandidateId(c.id)}
                            className={`p-4 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                                isCandidateSelected 
                                    ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-200 shadow-sm' 
                                    : 'bg-white border-gray-100 opacity-90 hover:opacity-100 hover:border-gray-300'
                            } ${currentStatus === 'Processing' && !isCandidateSelected ? 'opacity-40 pointer-events-none' : ''}`}
                        >
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${idx === 0 ? 'bg-emerald-500' : 'bg-blue-300'}`}>#{idx + 1}</div>
                            <div>
                                <div className="font-bold text-gray-800">{c.id}</div>
                                <div className="text-xs text-gray-500 flex gap-3 mt-1">
                                    <span className="flex items-center gap-1"><MapPin size={10}/> {c.dist}km away</span>
                                    <span className="flex items-center gap-1"><Package size={10}/> Cap: {c.capacityFree}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <StatusBadge type={c.status} />
                            <div className="text-right w-20">
                                <div className="text-xs text-gray-400">Est. Arrival</div>
                                <div className="font-medium text-sm">{c.eta} min</div>
                            </div>
                            <div className="w-24 text-right">
                                <div className="text-blue-600 font-bold text-lg">{c.score}%</div>
                                <div className="text-[10px] text-gray-400 uppercase font-medium">Match Score</div>
                            </div>
                            {isCandidateSelected && <CheckCircle2 className="text-blue-600" size={24} />}
                        </div>
                        
                        {currentStatus === 'Processing' && isCandidateSelected && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                                <div className="w-1/2">
                                    <div className="flex justify-between text-xs font-bold text-blue-700 mb-1">
                                        <span>Reallocating...</span>
                                        <span>{currentProgress}%</span>
                                    </div>
                                    <div className="w-full bg-white rounded-full h-2 border border-blue-100">
                                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-100" style={{ width: `${currentProgress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
                    );
                }) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <AlertTriangle size={48} className="mb-2 opacity-20"/>
                        <p>No suitable candidates found within range.</p>
                    </div>
                )
           )}
         </div>
      </div>
    </div>
  );
};

const AssistanceView = () => {
    // Dynamic State for Assistance Vehicles
    const [vehicles, setVehicles] = useState(INITIAL_ASSISTANCE_VEHICLES);
    const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0].id);
    const [selectedGarageIndex, setSelectedGarageIndex] = useState(0); 
    const [toast, setToast] = useState(null);

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
    const selectedGarage = GARAGES[selectedGarageIndex];

    const handleDispatch = () => {
        // 1. Update status in list to "Dispatched" (Green)
        const updatedVehicles = vehicles.map(v => 
            v.id === selectedVehicleId ? { ...v, status: 'Dispatched' } : v
        );
        setVehicles(updatedVehicles);

        // 2. Show Toast
        setToast({
            title: "Mechanic Dispatched",
            message: `${selectedGarage.name} has been notified. ETA: ${selectedGarage.eta}`
        });

        // 3. Auto hide toast
        setTimeout(() => setToast(null), 5000);
    };

    return (
      <div className="flex gap-6 h-[calc(100vh-140px)] relative">
        {/* Toast Notification */}
        {toast && (
            <div className="absolute bottom-4 right-4 bg-white border border-gray-200 p-4 rounded-lg shadow-xl z-50 w-96 animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-800 text-sm">{toast.title}</h4>
                    <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{toast.message}</p>
            </div>
        )}

        {/* Left: Vehicle List */}
        <div className="w-1/3 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div>
                <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Vehicles with Issues</h3>
                <p className="text-xs text-gray-500">Select a vehicle to assign assistance</p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
                <div className="text-amber-600">Pending <span className="block text-lg text-right">{vehicles.filter(v => v.status === 'Pending').length}</span></div>
                <div className="text-emerald-600">Dispatched <span className="block text-lg text-right">{vehicles.filter(v => v.status === 'Dispatched').length}</span></div>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
             {vehicles.map(v => (
                 <div 
                    key={v.id} 
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`border rounded p-3 cursor-pointer transition-colors ${selectedVehicleId === v.id ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-100' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                 >
                   <div className="flex justify-between mb-1">
                     <span className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                        {v.issue === 'Engine Failure' ? <Settings size={14} className="text-red-500"/> : <Truck size={14} className="text-amber-500"/>}
                        {v.id}
                     </span>
                     <StatusBadge type={v.status} />
                   </div>
                   <div className={`text-xs font-semibold mb-1 ${v.issue === 'Engine Failure' ? 'text-red-500' : 'text-amber-600'}`}>{v.issue}</div>
                   <p className="text-xs text-gray-600 mb-2">{v.desc}</p>
                   <div className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={10}/> {v.loc}</div>
                   <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={10}/> Reported at {v.time}</div>
                 </div>
             ))}
          </div>
        </div>
    
        {/* Right: Assistance Details */}
        <div className="w-2/3 flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Header Area with Actions */}
          <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                    <div className="text-xs text-gray-500 uppercase">Assisting</div>
                    <div className="text-lg font-bold text-gray-800">{selectedVehicle?.id}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase">Driver</div>
                    <div className="font-medium text-gray-800">{selectedVehicle?.driver}</div>
                </div>
                <button className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium ml-4">
                    <Phone size={14}/> Call
                </button>
              </div>

              {/* Action Buttons MOVED TO TOP - Conditional Rendering */}
              <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase">Nearby Authorised Garages</h3>
                    <p className="text-xs text-gray-400 mt-1">Best candidate highlighted based on distance</p>
                  </div>
                  
                  {selectedVehicle?.status === 'Pending' ? (
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 flex items-center gap-2 border border-gray-200">
                                <X size={16}/> Deny Request
                            </button>
                            <button 
                                onClick={handleDispatch}
                                className="px-4 py-2 bg-emerald-500 text-white rounded text-sm font-medium hover:bg-emerald-600 flex items-center gap-2 shadow-sm"
                            >
                                <Check size={16}/> Dispatch Mechanic
                            </button>
                        </div>
                  ) : (
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded text-sm font-medium flex items-center gap-2 border border-emerald-200">
                          <Check size={16}/> Mechanic Dispatched
                      </div>
                  )}
              </div>
          </div>
    
          {/* Garages List */}
          <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
            <div className="space-y-3">
                {GARAGES.map((g, idx) => (
                <div 
                    key={idx} 
                    onClick={() => setSelectedGarageIndex(idx)}
                    className={`p-4 rounded-lg border flex flex-col gap-2 cursor-pointer transition-all ${
                        selectedGarageIndex === idx 
                        ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-100' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 text-sm">{g.name}</h4>
                            {g.bestMatch && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Best Match</span>}
                        </div>
                        <StatusBadge type={g.status} />
                    </div>
                    
                    <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span className="flex items-center gap-1"><ArrowRightLeft size={12}/> {g.dist}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> ETA: {g.eta}</span>
                        <span className="flex items-center gap-1 text-amber-500 font-bold">★ {g.rating}</span>
                    </div>

                    <div className="flex gap-2 mt-1">
                        {g.tags.map(tag => (
                            <span key={tag} className={`text-[10px] border px-2 py-0.5 rounded-full uppercase tracking-wide ${tag === 'battery' && g.bestMatch ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-gray-600 bg-white'}`}>{tag}</span>
                        ))}
                    </div>
                    
                    {selectedGarageIndex === idx && (
                        <div className="absolute right-10 mt-8 text-blue-600">
                            <Check size={20}/>
                        </div>
                    )}
                </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
};

const DashboardView = ({ setModalOpen }) => {
  const [mapView, setMapView] = useState({ center: PUNE_CENTER, zoom: 12 });
  const [activeVehicleId, setActiveVehicleId] = useState(null);

  const handleNotificationClick = (coords, id) => {
    setMapView({ center: coords, zoom: 15 });
    setActiveVehicleId(id);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard label="Total Fleets" value={FLEET_STATS.total} icon={Truck} colorClass="text-gray-800" />
        <MetricCard label="On-Time" value={FLEET_STATS.onTime} icon={CheckCircle2} colorClass="text-emerald-500" />
        <MetricCard label="Delayed" value={FLEET_STATS.delayed} icon={Clock} colorClass="text-amber-500" />
        <MetricCard label="Completed Today" value={FLEET_STATS.completed} icon={CheckCircle2} colorClass="text-emerald-500" />
        <MetricCard label="In Transit" value={FLEET_STATS.inTransit} icon={Send} colorClass="text-gray-800" />
      </div>

      <div className="flex gap-6 h-[600px]">
        {/* Notification List (Left) */}
        <div className="w-1/3 space-y-4 overflow-y-auto pr-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700 uppercase text-xs">Notifications</h3>
            <span className="text-xs text-gray-400">2 critical, 3 warnings</span>
          </div>
          {NOTIFICATIONS.map((note) => (
            <div 
              key={note.id} 
              onClick={() => handleNotificationClick(note.coords, note.id)}
              className={`p-4 rounded-lg border shadow-sm cursor-pointer transition-all ${
                activeVehicleId === note.id ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300' : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`flex items-center gap-2 font-bold ${note.type === 'critical' ? 'text-gray-800' : 'text-gray-800'}`}>
                    <div className={`p-1.5 rounded ${note.type === 'critical' ? 'bg-red-100 text-red-600' : note.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {note.type === 'critical' ? <AlertTriangle size={14} /> : note.type === 'warning' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                    </div>
                    {note.title}
                </div>
                <StatusBadge type={note.type} />
              </div>
              <div className="text-sm font-bold text-gray-700 mt-1 flex items-center gap-2"><Truck size={14}/> {note.vehicle}</div>
              <div className="text-xs text-gray-500 mt-1 pl-6"><Clock size={10} className="inline mr-1"/> {note.time}</div>
              <div className="text-xs text-gray-400 mt-1 pl-6">{note.loc}</div>
            </div>
          ))}
        </div>

        {/* Live Map (Right) */}
        <div className="w-2/3 bg-white rounded-lg border border-gray-200 relative overflow-hidden shadow-sm">
          {/* Simplified Map Label */}
          <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded shadow text-sm font-bold text-gray-800 z-[1000] border border-gray-200 flex items-center gap-2">
            <MapPin size={16} className="text-red-500"/> Pune
          </div>
          
          <MapContainer 
            center={PUNE_CENTER} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapView.center} zoom={mapView.zoom} />
            {NOTIFICATIONS.map(marker => (
              <Marker key={marker.id} position={marker.coords}>
                <Popup>
                  <div className="font-sans">
                    <strong className="block text-gray-800">{marker.vehicle}</strong>
                    <span className={`text-xs font-bold ${marker.type === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>{marker.title}</span>
                    <br/>
                    <span className="text-xs text-gray-500">{marker.loc}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

// ... [HealthView, VehiclesView, DriversView, AnalyticsView kept consistent with Pune IDs] ...

const HealthView = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-4 gap-4">
       <div className="bg-white p-4 rounded border-l-4 border-blue-500 shadow-sm">
         <div className="text-sm text-gray-500">FLEET HEALTH</div>
         <div className="text-3xl font-bold text-gray-800">64%</div>
       </div>
       <div className="bg-white p-4 rounded border-l-4 border-red-500 shadow-sm flex justify-between items-center">
         <div>
            <div className="text-sm text-gray-500 uppercase">Critical</div>
            <div className="text-2xl font-bold text-red-600">2</div>
         </div>
         <AlertTriangle className="text-red-200" />
       </div>
       <div className="bg-white p-4 rounded border-l-4 border-amber-400 shadow-sm flex justify-between items-center">
         <div>
            <div className="text-sm text-gray-500 uppercase">At Risk</div>
            <div className="text-2xl font-bold text-amber-500">2</div>
         </div>
         <Activity className="text-amber-200" />
       </div>
       <div className="bg-white p-4 rounded border-l-4 border-emerald-500 shadow-sm flex justify-between items-center">
         <div>
            <div className="text-sm text-gray-500 uppercase">Healthy</div>
            <div className="text-2xl font-bold text-emerald-600">4</div>
         </div>
         <CheckCircle2 className="text-emerald-200" />
       </div>
    </div>

    <div className="flex gap-6">
      <div className="w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b text-sm font-medium text-gray-500">
           <button className="flex-1 py-3 text-center text-blue-600 border-b-2 border-blue-600 bg-blue-50">All</button>
           <button className="flex-1 py-3 text-center hover:bg-gray-50">Critical</button>
           <button className="flex-1 py-3 text-center hover:bg-gray-50">At Risk</button>
           <button className="flex-1 py-3 text-center hover:bg-gray-50">Healthy</button>
        </div>
        <div className="divide-y max-h-[500px] overflow-y-auto">
          {HEALTH_VEHICLES.map(v => (
            <div key={v.id} className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${v.id === 'MH 12 EF 9012' ? 'bg-blue-50 border-blue-500' : 'border-transparent'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-700">{v.id}</span>
                <StatusBadge type={v.status} />
              </div>
              <div className="text-xs text-gray-500">{v.risk} failure risk next 100km</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-2/3 space-y-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
           <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-3">
               <div className="bg-red-100 text-red-600 font-bold p-3 rounded text-xl">12</div>
               <div>
                 <h2 className="text-xl font-bold text-gray-800">MH 12 EF 9012 <StatusBadge type="critical"/></h2>
                 <p className="text-sm text-gray-500">Next service in OVERDUE</p>
               </div>
             </div>
             <button className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 flex items-center gap-2">
               <Wrench size={16} /> Immediate Action
             </button>
           </div>

           <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border rounded p-4">
                <div className="text-xs text-gray-400 uppercase mb-1">Failure Probability</div>
                <div className="text-3xl font-bold text-red-600">89%</div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                  <div className="bg-red-600 h-1.5 rounded-full" style={{width: '89%'}}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">next 100km</div>
              </div>
              <div className="border rounded p-4">
                <div className="text-xs text-gray-400 uppercase mb-1">Service Status</div>
                <div className="text-2xl font-bold text-red-600">OVERDUE</div>
              </div>
              <div className="border rounded p-4 bg-red-50 border-red-100">
                <div className="text-xs text-gray-400 uppercase mb-1">Recommendation</div>
                <div className="flex items-center gap-2 text-red-700 font-medium">
                  <AlertTriangle size={16}/> Immediate Action
                </div>
              </div>
           </div>

           <h3 className="font-semibold text-gray-700 mb-3 uppercase text-sm">Detected Issues</h3>
           <div className="space-y-2">
             <div className="bg-gray-50 p-3 rounded border border-gray-200 flex gap-2 text-gray-700 items-center">
               <AlertTriangle size={16} className="text-red-500" /> Engine overheating
             </div>
             <div className="bg-gray-50 p-3 rounded border border-gray-200 flex gap-2 text-gray-700 items-center">
               <AlertTriangle size={16} className="text-amber-500" /> Oil pressure low
             </div>
             <div className="bg-gray-50 p-3 rounded border border-gray-200 flex gap-2 text-gray-700 items-center">
               <AlertTriangle size={16} className="text-amber-500" /> Brake wear critical
             </div>
           </div>
        </div>
      </div>
    </div>
  </div>
);

const VehiclesView = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
            <div>
                <h2 className="text-lg font-bold text-gray-800">Vehicles</h2>
                <p className="text-xs text-gray-500">5 vehicles in fleet</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                <Plus size={16} /> Add New Vehicle
            </button>
        </div>

        <div className="space-y-3">
            {VEHICLES_LIST.map((v) => (
                <div key={v.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="bg-gray-100 p-2 rounded">
                               <Truck size={20} className="text-gray-600"/>
                           </div>
                           <div>
                               <div className="font-bold text-gray-800">{v.id}</div>
                               <div className="text-xs text-gray-500">{v.plate}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">{v.type}</span>
                            <StatusBadge type={v.status} />
                        </div>
                    </div>
                    <div className="flex gap-0 border-t border-gray-100 pt-0">
                         <button className="flex-1 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-bl-lg">
                             <Info size={14}/> Vehicle Info
                         </button>
                         <div className="w-px bg-gray-100"></div>
                         <button className="flex-1 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-br-lg">
                             <Activity size={14}/> Vehicle Activity
                         </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DriversView = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
            <div>
                <h2 className="text-lg font-bold text-gray-800">Drivers</h2>
                <p className="text-xs text-gray-500">5 drivers registered</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                <Plus size={16} /> Add New Driver
            </button>
        </div>

        <div className="space-y-3">
            {DRIVERS_LIST.map((d) => (
                <div key={d.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="bg-gray-100 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                               <Users size={20} className="text-gray-600"/>
                           </div>
                           <div>
                               <div className="font-bold text-gray-800">{d.name}</div>
                               <div className="text-xs text-gray-500">{d.id}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-sm font-bold text-emerald-600 flex items-center gap-1"><Star size={12} fill="currentColor"/> {d.score}%</div>
                                <div className="text-[10px] text-gray-400 uppercase">Performance</div>
                            </div>
                            <StatusBadge type={d.status} />
                        </div>
                    </div>
                    <div className="flex gap-0 border-t border-gray-100 pt-0">
                         <button className="flex-1 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                             <Info size={14}/> Driver Info
                         </button>
                         <div className="w-px bg-gray-100"></div>
                         <button className="flex-1 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                             <History size={14}/> Driver History
                         </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AnalyticsView = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Fleet Utilization" value="87%" trend="+3.2%" icon={Truck} colorClass="text-blue-600" />
            <MetricCard label="On-Time Delivery" value="94.8%" trend="+1.5%" icon={Clock} colorClass="text-emerald-600" />
            <MetricCard label="Avg. Fuel Efficiency" value="7.9 km/L" trend="+0.4" icon={Fuel} colorClass="text-gray-700" />
            <MetricCard label="Total Deliveries" value="1,036" trend="+12%" icon={Package} colorClass="text-blue-600" />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-1 w-fit">
            <div className="flex gap-1">
                <button className="px-4 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 rounded">Performance</button>
                <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded">Fuel Usage</button>
                <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded">Breakdowns</button>
                <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded">Efficiency</button>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4"><Truck size={18} className="text-blue-500"/> Top Performing Vehicles</h3>
                <div className="space-y-4">
                    {ANALYTICS_DATA.topVehicles.map((v, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                <div>
                                    <div className="text-sm font-bold text-gray-800">{v.name}</div>
                                    <div className="text-xs text-gray-500">{v.deliveries} deliveries</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-800">{v.score}</div>
                                <div className="text-[10px] text-gray-400">score</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4"><Users size={18} className="text-blue-500"/> Top Performing Drivers</h3>
                <div className="space-y-4">
                    {ANALYTICS_DATA.topDrivers.map((d, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                <div>
                                    <div className="text-sm font-bold text-gray-800">{d.name}</div>
                                    <div className="text-xs text-gray-500">{d.deliveries} deliveries • ⭐ {d.rating}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-800">{d.score}</div>
                                <div className="text-[10px] text-gray-400">score</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-6"><Activity size={18} className="text-blue-500"/> Fleet Utilization Overview</h3>
            <div className="flex items-center justify-around">
                 {/* Simple CSS Pie Chart representation */}
                 <div className="relative w-48 h-48 rounded-full" style={{
                     background: 'conic-gradient(#10b981 0% 78%, #ef4444 78% 86%, #fbbf24 86% 100%)'
                 }}>
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-800">87%</div>
                            <div className="text-xs text-gray-500">Active Fleet</div>
                        </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                         <div className="text-sm text-gray-600">Active (78%)</div>
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-500"></div>
                         <div className="text-sm text-gray-600">Maintenance (8%)</div>
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                         <div className="text-sm text-gray-600">Idle (14%)</div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
);

// --- App Layout ---

export default function SwarmSyncApp() {
  const [activeTab, setActiveTab] = useState('command');
  const [expandedMenus, setExpandedMenus] = useState({
    critical: true, 
    audit: false
  });
  const [isModalOpen, setModalOpen] = useState(false);

  // Configuration for the Sidebar Menu Structure
  const MENU_STRUCTURE = [
    { type: 'header', label: 'Main' },
    { id: 'command', label: 'Command Center', icon: LayoutDashboard },
    
    { type: 'header', label: 'Operations' },
    { 
      id: 'critical', 
      label: 'Critical Events', 
      icon: AlertTriangle,
      hasSubmenu: true,
      subItems: [
        { id: 'reallocation', label: 'Cargo Reallocation' },
        { id: 'assistance', label: 'Road Side Assistance' },
        { id: 'blockage', label: 'Road Blockage' }
      ]
    },
    { id: 'geofencing', label: 'Geofencing', icon: MapPin },
    { id: 'health', label: 'Vehicle Health', icon: Activity },
    
    { 
      id: 'audit', 
      label: 'Audit Log', 
      icon: FileText,
      hasSubmenu: true,
      subItems: [
        { id: 'vehicles', label: 'Vehicles', icon: Truck },
        { id: 'drivers', label: 'Drivers', icon: Users }
      ]
    },

    { type: 'header', label: 'Fleet' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const toggleExpand = (id) => {
    setExpandedMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'command': return <DashboardView setModalOpen={setModalOpen} />;
      case 'health': return <HealthView />;
      case 'reallocation': return <ReallocationView />;
      case 'assistance': return <AssistanceView />;
      case 'blockage': return <RoadBlockageView />;
      case 'geofencing': return <GeofencingView />;
      case 'vehicles': return <VehiclesView />;
      case 'drivers': return <DriversView />;
      case 'analytics': return <AnalyticsView />;
      default: return <DashboardView setModalOpen={setModalOpen} />;
    }
  };

  // Helper to get breadcrumb text
  const getBreadcrumb = () => {
    const activeItem = MENU_STRUCTURE.find(item => item.id === activeTab) || 
                       MENU_STRUCTURE.flatMap(i => i.subItems || []).find(sub => sub.id === activeTab);
    
    if (!activeItem) return 'Dashboard';

    let parent = MENU_STRUCTURE.find(item => item.subItems?.some(sub => sub.id === activeTab));
    const parentLabel = parent ? parent.label : 'Operations';
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">{parentLabel}</span>
        <ChevronRight size={14} className="text-gray-400"/>
        <span className="font-semibold text-gray-800">{activeItem.label}</span>
      </div>
    );
  };


  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1 rounded"><Activity size={20} /></div>
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">SwarmSync</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Operator Console</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {MENU_STRUCTURE.map((item, index) => {
            if (item.type === 'header') {
              return (
                <div key={index} className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2 mt-4">
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon || React.Fragment;
            const isExpanded = expandedMenus[item.id];
            const isActive = activeTab === item.id;
            const hasActiveChild = item.subItems?.some(sub => sub.id === activeTab);

            if (item.hasSubmenu) {
              return (
                <div key={item.id} className="mb-1">
                  <button 
                    onClick={() => toggleExpand(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${isActive || hasActiveChild ? 'text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      {item.label}
                    </div>
                    <ChevronRight size={14} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {/* Accordion Body */}
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-48' : 'max-h-0'}`}>
                    <div className="bg-gray-50/50 pb-1">
                      {item.subItems.map(sub => {
                          const SubIcon = sub.icon;
                          return (
                            <button
                                key={sub.id}
                                onClick={() => setActiveTab(sub.id)}
                                className={`w-full flex items-center gap-3 text-left pl-11 pr-4 py-2 text-sm transition-colors ${
                                activeTab === sub.id 
                                    ? 'text-blue-600 font-medium bg-blue-50/50 border-r-4 border-blue-600' 
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            >
                                {SubIcon && <SubIcon size={16} className={activeTab === sub.id ? 'text-blue-500' : 'text-gray-400'} />}
                                {sub.label}
                            </button>
                          );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors mb-1 ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
           <button className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-gray-900">
             <Settings size={18} /> Settings
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - No Bell, Breadcrumb style */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div>
             {getBreadcrumb()}
          </div>
          
          <div className="flex items-center gap-4">
             {activeTab === 'command' && (
                <button 
                  onClick={() => setModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Plus size={16} /> Add New Delivery
                </button>
             )}
             {(activeTab === 'vehicles') && (
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
                  <Plus size={16} /> Add New Vehicle
                </button>
             )}
             {(activeTab === 'drivers') && (
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
                  <Plus size={16} /> Add New Driver
                </button>
             )}
             
             <div className="h-6 w-px bg-gray-300 mx-2"></div>
             
             <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-800">Admin User</div>
                    <div className="text-xs text-gray-500">Operator</div>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
                AU
                </div>
             </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50/50">
           {renderContent()}
        </main>
      </div>

      {/* Modal Overlay (Fixed Z-Index & Layout) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                 <Truck className="text-blue-600" size={20}/> Add New Delivery
               </h3>
               <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={20} />
               </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Shipment Number</label>
                <input type="text" defaultValue="SHP-C9FUCA" className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600" />
              </div>
              
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Start Point (Pickup Location)</label>
                 <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3 text-green-600"/>
                    <input type="text" placeholder="e.g., HSR Layout Warehouse" className="w-full pl-9 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
              </div>
              
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Location</label>
                 <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3 text-red-500"/>
                    <input type="text" placeholder="e.g., Koramangala 5th Block" className="w-full pl-9 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Available Vehicles on Route</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select vehicle for delivery</option>
                  <option>MH 12 IJ 7890 • HSR Layout</option>
                  <option>MH 12 KL 1122 • Whitefield</option>
                  <option>MH 12 MN 3344 • Electronic City</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm font-medium hover:bg-gray-100">Cancel</button>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm">Create Delivery</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}