import React, { useState, useEffect,useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';

// Merged Lucide-React Imports
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
  CheckCircle, 
  CheckCircle2, 
  Clock, 
  Clock as ClockIcon, 
  ChevronRight, 
  ChevronDown, // Added this
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
  MousePointer2,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Gauge,
  TrendingDown,
  Battery, 
  Thermometer,
  Route,
  ShoppingCart, 
  IndianRupee,
  Briefcase,     // Added
  CreditCard,    // Added
  Heart,User,FileCheck,Shield,AlertCircle
} from 'lucide-react';

// Fix for default Leaflet icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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

const GreyIcon = new L.Icon({ // For Maintenance / Inactive
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const BlueIcon = new L.Icon({ // For Destination Pointers
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const YellowIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// 1. Updated Checkbox (Matches the blue style in screenshot)
const Checkbox = ({ id, checked, onCheckedChange }) => (
  <input 
    type="checkbox" 
    id={id} 
    checked={checked} 
    onChange={(e) => onCheckedChange(e.target.checked)} 
    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
  />
);

// 2. Custom Toast Component (Floating notification)
const Toast = ({ title, message, onClose }) => (
  <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
    <div className="bg-white border border-gray-200 shadow-xl rounded-lg p-4 w-96 flex flex-col gap-1 border-l-4 border-l-blue-600">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        <button onClick={onClose}><X size={14} className="text-gray-400 hover:text-gray-600"/></button>
      </div>
      <p className="text-sm text-gray-600 leading-snug">{message}</p>
    </div>
  </div>
);

// --- Mock Data ---

const PUNE_CENTER = [18.5204, 73.8567];
const FLEET_STATS = { total: 247, onTime: 218, delayed: 23, completed: 89, inTransit: 158 };

const GARAGES = [
  { name: 'Tata Authorised Service Center', dist: '1.2 km', eta: '8 min', rating: 4.8, status: 'available', tags: ['engine', 'battery', 'tyre', 'other'], bestMatch: true },
  { name: 'QuickFix Auto Garage', dist: '2.1 km', eta: '12 min', rating: 4.5, status: 'available', tags: ['tyre', 'battery'] },
  { name: 'City Auto Works', dist: '3.5 km', eta: '20 min', rating: 4.0, status: 'available', tags: ['battery', 'tyre', 'other'] },
  { name: 'RoadRunner Mechanics', dist: '2.8 km', eta: '15 min', rating: 4.2, status: 'busy', tags: ['engine', 'other'] },
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

const UNIFIED_FLEET_DATA = [
  // 1. Critical Heavy Truck (Original)
  {
    id: "MH 12 AB 1234",
    driver: "Ramesh Kumar",
    type: "Heavy Truck",
    vin: "1HGBH41JXMN109186",
    makeModel: "Tata Prima 4928.S",
    year: "2022",
    fuelType: "Diesel",
    capacity: "28 Tonnes",
    lastService: "2024-01-10",
    insuranceExpiry: "2024-12-15",
    coords: [18.5913, 73.7389],
    locationName: "Hinjewadi Phase 1",
    destCoords: [18.5635, 73.8075],
    destinationName: "Aundh Chest Hospital",
    routeUpdates: [{ time: "09:00 AM", type: "status", title: "On Route", desc: "Proceeding to Aundh." }],
    status: "active",
    capacityFree: 30,
    healthScore: 12,
    healthStatus: "critical",
    nextServiceKm: -200,
    issues: [
        { id: "i1", description: "Engine overheating", faultCode: "P0217", severity: "critical", detectedAt: "10:30 AM" },
        { id: "i2", description: "Coolant level low", faultCode: "P0128", severity: "warning", detectedAt: "10:45 AM" }
    ],
    scheduledMaintenance: [
        { id: "sm1", type: "Engine Overhaul", dueDate: "2024-03-20", dueKm: -200, priority: "high", estimatedCost: 45000 },
        { id: "sm2", type: "Coolant Flush", dueDate: "2024-03-21", dueKm: 0, priority: "medium", estimatedCost: 3500 }
    ],
    maintenanceHistory: [
        { id: "h1", date: "2023-12-15", type: "oil_change", description: "Routine Oil Change", cost: 4500, garage: "Tata Service Hinjewadi", invoiceNumber: "INV-998" }
    ],
    isDelayed: true,
    delayReason: "Vehicle Breakdown",
    needsAssistance: true,
    assistanceIssue: "Engine Failure",
    assistanceStatus: "Pending"
  },
  // 2. Medium Truck Warning (Original)
  {
    id: "MH 12 CD 5678",
    driver: "Vijay Singh",
    type: "Medium Truck",
    vin: "2HGBH52KYNP210294",
    makeModel: "Eicher Pro 3015",
    year: "2023",
    fuelType: "CNG",
    capacity: "15 Tonnes",
    lastService: "2023-11-20",
    insuranceExpiry: "2025-01-20",
    coords: [18.5679, 73.9143],
    locationName: "Viman Nagar",
    destCoords: [18.5362, 73.8939],
    destinationName: "Koregaon Park",
    routeUpdates: [],
    status: "active",
    capacityFree: 45,
    healthScore: 54,
    healthStatus: "warning",
    nextServiceKm: 890,
    issues: [{ id: "i2", description: "Tire pressure low", faultCode: "C0750", severity: "warning", detectedAt: "11:00 AM" }],
    scheduledMaintenance: [
        { id: "sm3", type: "Wheel Alignment", dueDate: "2024-04-01", dueKm: 800, priority: "medium", estimatedCost: 1200 }
    ],
    maintenanceHistory: [],
    isDelayed: true,
    needsAssistance: false
  },
  // 3. Healthy Light Truck (Original)
  {
    id: "MH 12 IJ 7890",
    driver: "Anil Kapoor",
    type: "Light Truck",
    vin: "3JGBH63LZMQ321305",
    makeModel: "Tata Ace Gold",
    year: "2024",
    fuelType: "Diesel",
    capacity: "1.5 Tonnes",
    lastService: "2024-02-01",
    insuranceExpiry: "2025-02-01",
    coords: [18.5074, 73.8077],
    locationName: "Kothrud",
    destCoords: null,
    destinationName: "Swargate",
    routeUpdates: [],
    status: "active",
    capacityFree: 65,
    healthScore: 98,
    healthStatus: "normal",
    nextServiceKm: 2800,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 4. Maintenance Vehicle (Original)
  {
    id: "MH 12 EF 9012",
    driver: "Sunil Rao",
    type: "Medium Truck",
    vin: "5LGBH85NBOS543527",
    makeModel: "BharatBenz 1923C",
    year: "2020",
    fuelType: "Diesel",
    capacity: "19 Tonnes",
    lastService: "2024-01-05",
    insuranceExpiry: "2024-10-15",
    coords: [18.5018, 73.8636],
    locationName: "Swargate",
    destCoords: null,
    destinationName: null,
    routeUpdates: [],
    status: "maintenance",
    capacityFree: 100,
    healthScore: 23,
    healthStatus: "critical",
    nextServiceKm: 120,
    issues: [{ id: "i4", description: "Battery degradation", faultCode: "P0562", severity: "critical", detectedAt: "08:15 AM" }],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: true,
    assistanceIssue: "Battery Failure",
    assistanceStatus: "Dispatched"
  },
  // 5. Active Heavy Truck - Good Health
  {
    id: "MH 14 HG 4521",
    driver: "Vikram Malhotra",
    type: "Heavy Truck",
    vin: "6MGBH96PCPT654638",
    makeModel: "Ashok Leyland 5525",
    year: "2023",
    fuelType: "Diesel",
    capacity: "55 Tonnes",
    lastService: "2024-01-15",
    insuranceExpiry: "2025-03-10",
    coords: [18.6298, 73.7997],
    locationName: "Pimpri-Chinchwad",
    destCoords: [18.5204, 73.8567],
    destinationName: "Pune Station",
    routeUpdates: [],
    status: "active",
    capacityFree: 10,
    healthScore: 92,
    healthStatus: "normal",
    nextServiceKm: 4500,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 6. Delayed Light Truck - Traffic
  {
    id: "MH 12 KL 8899",
    driver: "Suresh Raina",
    type: "Light Truck",
    vin: "7NGBH07QDQU765749",
    makeModel: "Mahindra Bolero Pickup",
    year: "2021",
    fuelType: "Diesel",
    capacity: "1.7 Tonnes",
    lastService: "2023-11-05",
    insuranceExpiry: "2024-11-05",
    coords: [18.5203, 73.8567], // Near Shivajinagar
    locationName: "Shivajinagar",
    destCoords: [18.4967, 73.9417],
    destinationName: "Hadapsar",
    routeUpdates: [{ time: "11:15 AM", type: "alert", title: "Heavy Traffic", desc: "Congestion on University Road." }],
    status: "active",
    capacityFree: 50,
    healthScore: 78,
    healthStatus: "normal",
    nextServiceKm: 1200,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: true,
    delayReason: "Traffic Congestion",
    needsAssistance: false
  },
  // 7. Critical Warning - Brake Issue
  {
    id: "MH 12 XZ 1122",
    driver: "Deepak Chahar",
    type: "Medium Truck",
    vin: "8OHBH18RERV876850",
    makeModel: "Tata Ultra 1518",
    year: "2019",
    fuelType: "Diesel",
    capacity: "16 Tonnes",
    lastService: "2023-09-10",
    insuranceExpiry: "2024-09-10",
    coords: [18.4575, 73.8508],
    locationName: "Katraj",
    destCoords: null,
    destinationName: null,
    routeUpdates: [],
    status: "active",
    capacityFree: 80,
    healthScore: 45,
    healthStatus: "warning",
    nextServiceKm: 100,
    issues: [{ id: "i5", description: "Brake pads worn", faultCode: "C0035", severity: "warning", detectedAt: "09:00 AM" }],
    scheduledMaintenance: [
        { id: "sm5", type: "Brake Replacement", dueDate: "2024-02-15", dueKm: 100, priority: "high", estimatedCost: 5000 }
    ],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 8. Idle/Inactive Vehicle
  {
    id: "MH 14 BN 6677",
    driver: "Rajesh Koothrappali",
    type: "Heavy Truck",
    vin: "9PHBH29SFSW987961",
    makeModel: "Volvo FM 420",
    year: "2022",
    fuelType: "Diesel",
    capacity: "40 Tonnes",
    lastService: "2023-12-20",
    insuranceExpiry: "2024-12-20",
    coords: [18.6492, 73.7707],
    locationName: "Nigdi Warehouse",
    destCoords: null,
    destinationName: null,
    routeUpdates: [],
    status: "inactive",
    capacityFree: 100,
    healthScore: 99,
    healthStatus: "normal",
    nextServiceKm: 8000,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 9. Active - Cold Chain
  {
    id: "MH 12 CC 3344",
    driver: "Manoj Bajpayee",
    type: "Medium Truck",
    vin: "0QJBH30TGTX098072",
    makeModel: "Eicher Pro 2049 (Reefer)",
    year: "2023",
    fuelType: "CNG",
    capacity: "5 Tonnes",
    lastService: "2024-01-02",
    insuranceExpiry: "2025-01-02",
    coords: [18.5590, 73.7868],
    locationName: "Baner",
    destCoords: [18.5089, 73.9259],
    destinationName: "Hadapsar Industrial Area",
    routeUpdates: [],
    status: "active",
    capacityFree: 0,
    healthScore: 88,
    healthStatus: "normal",
    nextServiceKm: 3000,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 10. Breakdown - Tyre Burst
  {
    id: "MH 12 YY 5500",
    driver: "Ishant Sharma",
    type: "Heavy Truck",
    vin: "1RKBH41UHUY109183",
    makeModel: "Tata Signa 4018",
    year: "2020",
    fuelType: "Diesel",
    capacity: "40 Tonnes",
    lastService: "2023-10-01",
    insuranceExpiry: "2024-10-01",
    coords: [18.4967, 73.9417],
    locationName: "Hadapsar",
    destCoords: null,
    destinationName: null,
    routeUpdates: [],
    status: "inactive",
    capacityFree: 20,
    healthScore: 30,
    healthStatus: "critical",
    nextServiceKm: 500,
    issues: [{ id: "i6", description: "Tyre Pressure Critical / Burst", faultCode: "C0001", severity: "critical", detectedAt: "11:45 AM" }],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: true,
    delayReason: "Tyre Burst",
    needsAssistance: true,
    assistanceIssue: "Tyre Replacement",
    assistanceStatus: "Pending"
  },
  // 11. Active - Electric LCV
  {
    id: "MH 12 EV 9988",
    driver: "Pooja Hegde",
    type: "Light Truck",
    vin: "2SLBH52VIVZ210294",
    makeModel: "Tata Ace EV",
    year: "2024",
    fuelType: "Electric",
    capacity: "1 Tonne",
    lastService: "2024-01-20",
    insuranceExpiry: "2025-01-20",
    coords: [18.5314, 73.8446],
    locationName: "Shivajinagar",
    destCoords: [18.5514, 73.9348],
    destinationName: "Kharadi IT Park",
    routeUpdates: [],
    status: "active",
    capacityFree: 40,
    healthScore: 96,
    healthStatus: "normal",
    nextServiceKm: 5000,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 12. Maintenance - Scheduled
  {
    id: "MH 14 ZZ 2211",
    driver: "K. L. Rahul",
    type: "Medium Truck",
    vin: "3TMBH63WJWA321305",
    makeModel: "Ashok Leyland Partner",
    year: "2021",
    fuelType: "Diesel",
    capacity: "7 Tonnes",
    lastService: "2023-08-15",
    insuranceExpiry: "2024-08-15",
    coords: [18.6261, 73.8139],
    locationName: "Bhosari MIDC",
    destCoords: null,
    destinationName: null,
    routeUpdates: [],
    status: "maintenance",
    capacityFree: 100,
    healthScore: 70,
    healthStatus: "warning",
    nextServiceKm: 0,
    issues: [],
    scheduledMaintenance: [
        { id: "sm6", type: "Quarterly Service", dueDate: "2024-02-12", dueKm: 0, priority: "medium", estimatedCost: 4000 }
    ],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 13. Active - Long Haul
  {
    id: "MH 12 LH 7766",
    driver: "Jasprit Bumrah",
    type: "Heavy Truck",
    vin: "4UNBH74XKXB432416",
    makeModel: "Mahindra Blazo X 49",
    year: "2022",
    fuelType: "Diesel",
    capacity: "49 Tonnes",
    lastService: "2023-11-30",
    insuranceExpiry: "2024-11-30",
    coords: [18.4230, 73.8690], // Katraj Tunnel area
    locationName: "Katraj Tunnel",
    destCoords: [19.0760, 72.8777],
    destinationName: "Mumbai Port",
    routeUpdates: [],
    status: "active",
    capacityFree: 5,
    healthScore: 89,
    healthStatus: "normal",
    nextServiceKm: 2500,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 14. Delayed - Documentation Check
  {
    id: "MH 12 QQ 4433",
    driver: "Shikhar Dhawan",
    type: "Medium Truck",
    vin: "5VOBH85YLYC543527",
    makeModel: "Tata 1512 LPT",
    year: "2021",
    fuelType: "Diesel",
    capacity: "15 Tonnes",
    lastService: "2023-10-25",
    insuranceExpiry: "2024-10-25",
    coords: [18.5793, 73.9089],
    locationName: "Yerwada",
    destCoords: [18.5983, 73.7638],
    destinationName: "Wakad",
    routeUpdates: [{ time: "10:00 AM", type: "alert", title: "RTO Check", desc: "Stopped for routine documentation check." }],
    status: "active",
    capacityFree: 25,
    healthScore: 85,
    healthStatus: "normal",
    nextServiceKm: 1800,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: true,
    delayReason: "RTO Check",
    needsAssistance: false
  },
  // 15. Active - City Logistics
  {
    id: "MH 12 CL 1212",
    driver: "Hardik Pandya",
    type: "Light Truck",
    vin: "6WPBH96ZMZD654638",
    makeModel: "Ashok Leyland Dost+",
    year: "2023",
    fuelType: "Diesel",
    capacity: "1.5 Tonnes",
    lastService: "2024-01-05",
    insuranceExpiry: "2025-01-05",
    coords: [18.5158, 73.9272],
    locationName: "Magarpatta City",
    destCoords: [18.5246, 73.8629],
    destinationName: "Camp",
    routeUpdates: [],
    status: "active",
    capacityFree: 60,
    healthScore: 94,
    healthStatus: "normal",
    nextServiceKm: 3500,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 16. Warning - Oil Leak
  {
    id: "MH 14 WW 8989",
    driver: "Ravindra Jadeja",
    type: "Heavy Truck",
    vin: "7XQBH07ANAE765749",
    makeModel: "Tata Prima 5530.S",
    year: "2020",
    fuelType: "Diesel",
    capacity: "55 Tonnes",
    lastService: "2023-09-01",
    insuranceExpiry: "2024-09-01",
    coords: [18.7323, 73.6749], // Talegaon
    locationName: "Talegaon",
    destCoords: [18.6298, 73.7997],
    destinationName: "Chinchwad",
    routeUpdates: [],
    status: "active",
    capacityFree: 15,
    healthScore: 62,
    healthStatus: "warning",
    nextServiceKm: 200,
    issues: [{ id: "i7", description: "Minor Oil Leak", faultCode: "P0520", severity: "warning", detectedAt: "07:30 AM" }],
    scheduledMaintenance: [
        { id: "sm7", type: "Gasket Replacement", dueDate: "2024-02-18", dueKm: 200, priority: "medium", estimatedCost: 2500 }
    ],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 17. Active - Empty Return
  {
    id: "MH 12 ER 3434",
    driver: "Rohit Sharma",
    type: "Medium Truck",
    vin: "8YRBH18BOBF876850",
    makeModel: "BharatBenz 1217C",
    year: "2022",
    fuelType: "Diesel",
    capacity: "12 Tonnes",
    lastService: "2023-12-10",
    insuranceExpiry: "2024-12-10",
    coords: [18.6161, 73.7286], // Marunji
    locationName: "Marunji",
    destCoords: [18.5913, 73.7389],
    destinationName: "Hinjewadi Warehouse",
    routeUpdates: [],
    status: "active",
    capacityFree: 100,
    healthScore: 90,
    healthStatus: "normal",
    nextServiceKm: 6000,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 18. Critical - Transmission
  {
    id: "MH 12 TR 6767",
    driver: "Virat Kohli",
    type: "Heavy Truck",
    vin: "9ZSBH29CPCG987961",
    makeModel: "Eicher Pro 6028",
    year: "2019",
    fuelType: "Diesel",
    capacity: "28 Tonnes",
    lastService: "2023-07-20",
    insuranceExpiry: "2024-07-20",
    coords: [18.4697, 73.8037], // Dhayari
    locationName: "Dhayari",
    destCoords: null,
    destinationName: null,
    routeUpdates: [],
    status: "inactive",
    capacityFree: 50,
    healthScore: 18,
    healthStatus: "critical",
    nextServiceKm: -50,
    issues: [{ id: "i8", description: "Transmission Failure", faultCode: "P0700", severity: "critical", detectedAt: "Yesterday" }],
    scheduledMaintenance: [
        { id: "sm8", type: "Transmission Overhaul", dueDate: "2024-02-10", dueKm: -50, priority: "high", estimatedCost: 60000 }
    ],
    maintenanceHistory: [],
    isDelayed: true,
    delayReason: "Breakdown",
    needsAssistance: true,
    assistanceIssue: "Transmission Stuck",
    assistanceStatus: "Pending"
  },
  // 19. Active - Pharma Logistics
  {
    id: "MH 14 PL 2323",
    driver: "Rishabh Pant",
    type: "Light Truck",
    vin: "0ATBH30DQDH098072",
    makeModel: "Tata Intra V50",
    year: "2023",
    fuelType: "Diesel",
    capacity: "1.5 Tonnes",
    lastService: "2023-12-05",
    insuranceExpiry: "2024-12-05",
    coords: [18.6633, 73.8050], // Moshi
    locationName: "Moshi",
    destCoords: [18.6261, 73.8139],
    destinationName: "Bhosari Pharma Unit",
    routeUpdates: [],
    status: "active",
    capacityFree: 20,
    healthScore: 97,
    healthStatus: "normal",
    nextServiceKm: 4200,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 20. Warning - Battery
  {
    id: "MH 12 BA 9090",
    driver: "Shreyas Iyer",
    type: "Light Truck",
    vin: "1BUBH41EREI109183",
    makeModel: "Mahindra Supro",
    year: "2021",
    fuelType: "CNG",
    capacity: "1 Tonne",
    lastService: "2023-11-15",
    insuranceExpiry: "2024-11-15",
    coords: [18.5284, 73.8739], // Pune Station Area
    locationName: "Pune Station",
    destCoords: [18.5074, 73.8077],
    destinationName: "Kothrud",
    routeUpdates: [],
    status: "active",
    capacityFree: 60,
    healthScore: 55,
    healthStatus: "warning",
    nextServiceKm: 900,
    issues: [{ id: "i9", description: "Low Battery Voltage", faultCode: "P0560", severity: "warning", detectedAt: "08:00 AM" }],
    scheduledMaintenance: [
        { id: "sm9", type: "Battery Check/Replace", dueDate: "2024-02-25", dueKm: 900, priority: "medium", estimatedCost: 4000 }
    ],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 21. Active - Express Cargo
  {
    id: "MH 12 EX 5656",
    driver: "Krunal Pandya",
    type: "Medium Truck",
    vin: "2CVBH52FSFJ210294",
    makeModel: "Eicher Pro 2059",
    year: "2022",
    fuelType: "Diesel",
    capacity: "6 Tonnes",
    lastService: "2023-10-30",
    insuranceExpiry: "2024-10-30",
    coords: [18.5089, 73.9260],
    locationName: "Hadapsar",
    destCoords: [18.5514, 73.9348],
    destinationName: "Kharadi",
    routeUpdates: [],
    status: "active",
    capacityFree: 10,
    healthScore: 91,
    healthStatus: "normal",
    nextServiceKm: 3800,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 22. Inactive - Driver on Leave
  {
    id: "MH 14 DL 1100",
    driver: "Ajinkya Rahane",
    type: "Heavy Truck",
    vin: "3DWBH63GTGK321305",
    makeModel: "Tata LPT 3718",
    year: "2018",
    fuelType: "Diesel",
    capacity: "37 Tonnes",
    lastService: "2023-09-20",
    insuranceExpiry: "2024-09-20",
    coords: [18.6298, 73.7997],
    locationName: "Chinchwad Parking",
    destCoords: null,
    destinationName: null,
    routeUpdates: [],
    status: "inactive",
    capacityFree: 100,
    healthScore: 80,
    healthStatus: "normal",
    nextServiceKm: 1500,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 23. Active - Heavy Load
  {
    id: "MH 12 HL 7878",
    driver: "Mohammed Shami",
    type: "Heavy Truck",
    vin: "4EXBH74HUHL432416",
    makeModel: "Ashok Leyland 4825",
    year: "2023",
    fuelType: "Diesel",
    capacity: "48 Tonnes",
    lastService: "2024-01-10",
    insuranceExpiry: "2025-01-10",
    coords: [18.4416, 73.8242], // Katraj Bypass
    locationName: "Katraj Bypass",
    destCoords: [18.6504, 73.7786],
    destinationName: "Akurdi",
    routeUpdates: [],
    status: "active",
    capacityFree: 5,
    healthScore: 95,
    healthStatus: "normal",
    nextServiceKm: 5500,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 24. Maintenance - Accident Repair
  {
    id: "MH 12 AR 4545",
    driver: "Axar Patel",
    type: "Medium Truck",
    vin: "5FYBH85IVIM543527",
    makeModel: "Tata 1109",
    year: "2019",
    fuelType: "Diesel",
    capacity: "11 Tonnes",
    lastService: "2023-08-05",
    insuranceExpiry: "2024-08-05",
    coords: [18.5204, 73.8567], // Central Pune Garage
    locationName: "Central Workshop",
    destCoords: null,
    destinationName: null,
    routeUpdates: [],
    status: "maintenance",
    capacityFree: 100,
    healthScore: 10,
    healthStatus: "critical",
    nextServiceKm: 0,
    issues: [{ id: "i10", description: "Bumper Damage & Radiator Leak", faultCode: "ACC-001", severity: "critical", detectedAt: "2 days ago" }],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 25. Active - E-Commerce
  {
    id: "MH 12 EC 9900",
    driver: "Sanju Samson",
    type: "Light Truck",
    vin: "6GZBH96JWJN654638",
    makeModel: "Maruti Suzuki Super Carry",
    year: "2023",
    fuelType: "CNG",
    capacity: "0.7 Tonnes",
    lastService: "2023-12-25",
    insuranceExpiry: "2024-12-25",
    coords: [18.5635, 73.8075], // Aundh
    locationName: "Aundh",
    destCoords: [18.5590, 73.7868],
    destinationName: "Baner",
    routeUpdates: [],
    status: "active",
    capacityFree: 30,
    healthScore: 93,
    healthStatus: "normal",
    nextServiceKm: 2200,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 26. Active - Water Tanker
  {
    id: "MH 12 WT 2121",
    driver: "Yuzvendra Chahal",
    type: "Heavy Truck",
    vin: "7H0BH07KXKO765749",
    makeModel: "Tata 1613",
    year: "2017",
    fuelType: "Diesel",
    capacity: "16 Tonnes (Water)",
    lastService: "2023-11-10",
    insuranceExpiry: "2024-11-10",
    coords: [18.4750, 73.8900], // Undri
    locationName: "Undri",
    destCoords: [18.4900, 73.9000],
    destinationName: "Wanowrie",
    routeUpdates: [],
    status: "active",
    capacityFree: 0,
    healthScore: 68,
    healthStatus: "warning",
    nextServiceKm: 500,
    issues: [{ id: "i11", description: "Suspension noise", faultCode: "C0200", severity: "warning", detectedAt: "Yesterday" }],
    scheduledMaintenance: [
        { id: "sm10", type: "Suspension Check", dueDate: "2024-03-01", dueKm: 500, priority: "low", estimatedCost: 3000 }
    ],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 27. Delayed - Client Issue
  {
    id: "MH 14 CI 3434",
    driver: "Kuldeep Yadav",
    type: "Medium Truck",
    vin: "8I1BH18LYLP876850",
    makeModel: "Eicher Pro 3019",
    year: "2021",
    fuelType: "Diesel",
    capacity: "19 Tonnes",
    lastService: "2023-10-15",
    insuranceExpiry: "2024-10-15",
    coords: [18.6504, 73.7786], // Akurdi
    locationName: "Akurdi",
    destCoords: [18.6298, 73.7997],
    destinationName: "Chinchwad",
    routeUpdates: [{ time: "08:30 AM", type: "alert", title: "Loading Delay", desc: "Client goods not ready for pickup." }],
    status: "active",
    capacityFree: 100,
    healthScore: 86,
    healthStatus: "normal",
    nextServiceKm: 2800,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: true,
    delayReason: "Client Delay at Pickup",
    needsAssistance: false
  },
  // 28. Active - FMCG
  {
    id: "MH 12 FM 6565",
    driver: "Shardul Thakur",
    type: "Heavy Truck",
    vin: "9J2BH29MZMQ987961",
    makeModel: "Tata Signa 2818",
    year: "2022",
    fuelType: "Diesel",
    capacity: "28 Tonnes",
    lastService: "2024-01-08",
    insuranceExpiry: "2025-01-08",
    coords: [18.5983, 73.7638], // Wakad
    locationName: "Wakad",
    destCoords: [19.0330, 73.0297],
    destinationName: "Navi Mumbai",
    routeUpdates: [],
    status: "active",
    capacityFree: 10,
    healthScore: 93,
    healthStatus: "normal",
    nextServiceKm: 4000,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 29. Active - Construction Material
  {
    id: "MH 12 CM 8787",
    driver: "Mohammed Siraj",
    type: "Heavy Truck",
    vin: "0K3BH30NANS098072",
    makeModel: "BharatBenz 2823C (Tipper)",
    year: "2021",
    fuelType: "Diesel",
    capacity: "28 Tonnes",
    lastService: "2023-11-25",
    insuranceExpiry: "2024-11-25",
    coords: [18.5400, 73.7500], // Pashan
    locationName: "Pashan Sus Road",
    destCoords: [18.5590, 73.7868],
    destinationName: "Baner Construction Site",
    routeUpdates: [],
    status: "active",
    capacityFree: 0,
    healthScore: 75,
    healthStatus: "normal",
    nextServiceKm: 1500,
    issues: [],
    scheduledMaintenance: [],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  },
  // 30. Warning - Overheating History
  {
    id: "MH 14 OH 5454",
    driver: "Washington Sundar",
    type: "Medium Truck",
    vin: "1L4BH41OBOT109183",
    makeModel: "Tata 1212 LPT",
    year: "2018",
    fuelType: "Diesel",
    capacity: "12 Tonnes",
    lastService: "2023-09-30",
    insuranceExpiry: "2024-09-30",
    coords: [18.6000, 73.8500], // Vishrantwadi
    locationName: "Vishrantwadi",
    destCoords: [18.5293, 73.8505],
    destinationName: "Shivajinagar",
    routeUpdates: [],
    status: "active",
    capacityFree: 40,
    healthScore: 50,
    healthStatus: "warning",
    nextServiceKm: 300,
    issues: [{ id: "i12", description: "Engine Temp High", faultCode: "P0217", severity: "warning", detectedAt: "1 hour ago" }],
    scheduledMaintenance: [
        { id: "sm11", type: "Coolant Flush & Check", dueDate: "2024-02-20", dueKm: 300, priority: "high", estimatedCost: 2000 }
    ],
    maintenanceHistory: [],
    isDelayed: false,
    needsAssistance: false
  }
];

// Candidates for the algorithm (must match IDs above)
const FLEET_POOL = [
  { id: 'MH 12 IJ 7890', status: 'available', coords: [18.5700, 73.7500], capacityFree: 65 },
  { id: 'MH 12 AB 1234', status: 'available', coords: [18.5913, 73.7389], capacityFree: 30 },
  { id: 'MH 12 CD 5678', status: 'light load', coords: [18.5679, 73.9143], capacityFree: 45 },
];

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
// Helper to generate itinerary data
const getDisplayUpdates = (vehicle) => {
  if (!vehicle) return [];
  if (vehicle.routeUpdates && vehicle.routeUpdates.length > 0) return vehicle.routeUpdates;
  if (vehicle.destinationName) {
      return [{
          time: "09:00 AM",
          type: "status",
          title: "Route Assigned",
          desc: `Trip scheduled from ${vehicle.locationName} to ${vehicle.destinationName}.`
      }];
  }
  return [];
};
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


const MetricCard = ({ label, value, icon: Icon, colorClass, onClick, isActive }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:bg-gray-50' : ''
    } ${isActive ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}
  >
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

// Toggle Switch Component matching the design
const DashboardSwitch = ({ checked, onCheckedChange, label }) => (
  <div className="flex items-center gap-2">
    <div 
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </div>
    <span className="text-xs text-gray-600 font-medium cursor-pointer" onClick={() => onCheckedChange(!checked)}>
      {label}
    </span>
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

const ReallocationView = ({ fleet, setFleet }) => {
  const delayedVehicles = fleet.filter(v => v.isDelayed);
  const [selectedDelayedId, setSelectedDelayedId] = useState(delayedVehicles.length > 0 ? delayedVehicles[0].id : null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [progressState, setProgressState] = useState({}); 
  const [vehicleStatus, setVehicleStatus] = useState({});
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  const selectedVehicle = delayedVehicles.find(v => v.id === selectedDelayedId);

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
      if (!ORS_API_KEY || ORS_API_KEY === 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZmY2JjMTU3ZWRhZTRlZmJhZGIzYjM4Zjk1YmZkMWZjIiwiaCI6Im11cm11cjY0In0=') {
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
            const delayed = delayedVehicles.find(v => v.id === selectedDelayedId);
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
           {delayedVehicles.map((v) => {
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

const AssistanceView = ({ fleet, setFleet }) => {  // <--- 1. Add props here
    // Filter fleet for vehicles needing assistance
    const vehicles = fleet.filter(v => v.needsAssistance).map(v => ({
        id: v.id,
        issue: v.assistanceIssue,
        desc: v.issues[0]?.description || "Reported Issue",
        loc: v.locationName,
        time: "10:30 AM",
        status: v.assistanceStatus,
        driver: v.driver
    }));

    // Second declaration deleted here

    const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles.length > 0 ? vehicles[0].id : null);
    const [selectedGarageIndex, setSelectedGarageIndex] = useState(0); 
    const [toast, setToast] = useState(null);

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
    const selectedGarage = GARAGES[selectedGarageIndex];

    const handleDispatch = () => {
        // 2. Use setFleet to update the GLOBAL state
        setFleet(prev => prev.map(v => 
            v.id === selectedVehicleId 
            ? { ...v, assistanceStatus: 'Dispatched', status: 'maintenance' } 
            : v
        ));

        // Show Toast
        setToast({
            title: "Mechanic Dispatched",
            message: `${selectedGarage.name} has been notified. ETA: ${selectedGarage.eta}`
        });

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
                {/* FIX: Change 'vehicles' to 'vehicles' */}
                <div className="text-amber-600">Pending <span className="block text-lg text-right">{vehicles.filter(v => v.status === 'Pending').length}</span></div>
                {/* FIX: Change 'vehicles' to 'vehicles' */}
                <div className="text-emerald-600">Dispatched <span className="block text-lg text-right">{vehicles.filter(v => v.status === 'Dispatched').length}</span></div>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
             {/* FIX: Change 'vehicles' to 'vehicles' */}
             {vehicles.map(v => (
                 <div 
                    key={v.id} 
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`border rounded p-3 cursor-pointer transition-colors ${selectedVehicleId === v.id ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-100' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                 >
                   {/* ... (inner content remains the same) ... */}
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

const DashboardView = ({ setModalOpen, fleet, activeVehicleId, onVehicleSelect }) => {
  const [mapView, setMapView] = useState({ center: [18.5204, 73.8567], zoom: 12 });
  const [showNotificationVehiclesOnly, setShowNotificationVehiclesOnly] = useState(false);
  const [routePolyline, setRoutePolyline] = useState([]); 
  const [isRouting, setIsRouting] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);

  // API Key
  const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZmY2JjMTU3ZWRhZTRlZmJhZGIzYjM4Zjk1YmZkMWZjIiwiaCI6Im11cm11cjY0In0='; 

  // --- Derived Data ---
  const stats = {
    total: fleet.length,
    onTime: fleet.filter(v => v.status === 'active' && !v.isDelayed).length,
    delayed: fleet.filter(v => v.isDelayed).length,
    completed: 89, 
    inTransit: fleet.filter(v => v.status === 'active').length
  };

  const notificationVehicles = fleet.filter(v => v.healthStatus === 'critical' || v.isDelayed || v.healthStatus === 'warning');
  
  // Use the prop instead of local state
  const selectedVehicle = fleet.find(v => v.id === activeVehicleId);

  // --- STRICT FILTERING LOGIC ---
  const displayedVehicles = useMemo(() => {
    return showNotificationVehiclesOnly ? notificationVehicles : fleet;
  }, [showNotificationVehiclesOnly, fleet, notificationVehicles]);

  // --- Auto-Deselect Logic ---
  useEffect(() => {
    if (showNotificationVehiclesOnly && activeVehicleId) {
        const isVisible = notificationVehicles.find(v => v.id === activeVehicleId);
        if (!isVisible) {
            onVehicleSelect(null);
            setRoutePolyline([]);
        }
    }
  }, [showNotificationVehiclesOnly, activeVehicleId, notificationVehicles]);

  // --- Effect: Fetch Route when activeVehicleId changes ---
  useEffect(() => {
    if (selectedVehicle && (selectedVehicle.status === 'active' || selectedVehicle.isDelayed || selectedVehicle.healthStatus === 'warning') && selectedVehicle.destCoords) {
        fetchRoute(selectedVehicle.coords, selectedVehicle.destCoords);
        // Also center map on selection
        setMapView({ center: selectedVehicle.coords, zoom: 14 });
    } else {
        setRoutePolyline([]);
    }
  }, [activeVehicleId]); // Re-run when ID changes

  // --- Routing Logic ---
  const fetchRoute = async (start, end) => {
      setIsRouting(true);
      const startLngLat = `${start[1]},${start[0]}`;
      const endLngLat = `${end[1]},${end[0]}`;

      try {
        const response = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?start=${startLngLat}&end=${endLngLat}`,
          { headers: { 'Authorization': ORS_API_KEY } }
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const leafletCoords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRoutePolyline(leafletCoords);
        } else {
            setRoutePolyline([start, end]); 
        }
      } catch (error) {
        console.error("Routing Error:", error);
        setRoutePolyline([start, end]); 
      } finally {
          setIsRouting(false);
      }
  };

  const handleVehicleSelect = (id) => {
    onVehicleSelect(id); // Call parent handler
  };

  const handleNotificationClick = (coords, id) => {
    setMapView({ center: coords, zoom: 15 });
    handleVehicleSelect(id);
  };

  // --- COLOR TOKEN LOGIC (Strict 4 Colors) ---
  const getIcon = (v) => {
      if (v.healthStatus === 'critical') return RedIcon;
      if (v.healthStatus === 'warning' || v.isDelayed) return YellowIcon;
      if (v.status === 'maintenance' || v.status === 'inactive') return GreyIcon;
      return GreenIcon;
  };

  // Helper component to update map view
  const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
      if (center) map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }, [center, zoom, map]);
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4">
      
      {/* Top Stats Bar */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="Total Fleets" value={stats.total} icon={Truck} colorClass="text-gray-800" />
        <MetricCard label="On-Time" value={stats.onTime} icon={CheckCircle2} colorClass="text-emerald-500" />
        <MetricCard label="Delayed" value={stats.delayed} icon={Clock} colorClass="text-amber-500" />
        <MetricCard label="Completed Today" value={stats.completed} icon={CheckCircle2} colorClass="text-emerald-500" />
        <MetricCard label="In Transit" value={stats.inTransit} icon={Send} colorClass="text-gray-800" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-6 min-h-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
        
        {/* Left Panel: Dynamic Content */}
        <div className="w-80 flex flex-col border-r border-gray-100 bg-white transition-all duration-300">
          
          {/* --- SIDEBAR STATE 1: NOTIFICATIONS (When Toggle is ON) --- */}
          {showNotificationVehiclesOnly ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-red-50/30">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-red-800 uppercase text-xs tracking-wider flex items-center gap-2">
                        <AlertTriangle size={14}/> Critical Alerts
                    </h3>
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{notificationVehicles.length}</span>
                </div>
                <p className="text-[10px] text-gray-500">Vehicles requiring immediate attention</p>
              </div>
              
              <div className="overflow-y-auto flex-1 bg-white">
                {notificationVehicles.map((v) => (
                  <div 
                    key={v.id} 
                    onClick={() => handleNotificationClick(v.coords, v.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                      activeVehicleId === v.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-800">{v.id}</span>
                      </div>
                      <StatusBadge type={v.healthStatus === 'critical' ? 'critical' : 'warning'} />
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-1">
                        {v.issues?.[0]?.description || v.delayReason || "Issue reported"}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <MapPin size={10} /> {v.locationName}
                    </div>
                  </div>
                ))}
                {notificationVehicles.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20 text-emerald-500"/>
                        <p className="text-xs">No active alerts</p>
                    </div>
                )}
              </div>
            </>
          ) : (
            /* --- SIDEBAR STATE 2: DETAILS & ITINERARY (When Toggle is OFF) --- */
            <>
               <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Vehicle Details</h3>
                </div>
                <p className="text-[10px] text-gray-500">Select a vehicle on the map to view info</p>
              </div>

              <div className="overflow-y-auto flex-1 bg-white">
                {selectedVehicle ? (
                    <div className="p-4 space-y-6">
                        {/* Vehicle Header */}
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">{selectedVehicle.id}</h2>
                                    <p className="text-xs text-gray-500">{selectedVehicle.makeModel}</p>
                                </div>
                                <StatusBadge type={selectedVehicle.status} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                    <div className="text-[10px] text-gray-400 uppercase">Fuel</div>
                                    <div className="text-sm font-bold text-gray-700">{selectedVehicle.fuelType}</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                    <div className="text-[10px] text-gray-400 uppercase">Capacity</div>
                                    <div className="text-sm font-bold text-gray-700">{100 - (selectedVehicle.capacityFree || 0)}% Full</div>
                                </div>
                            </div>
                        </div>

                         {/* Accordion Info */}
                         <div className="border-t border-b border-gray-100 py-2">
                             <button 
                                 onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                                 className="w-full flex justify-between items-center py-2 text-sm font-bold text-gray-800"
                             >
                                 <span className="flex items-center gap-2"><Info size={14} className="text-blue-600"/> Vehicle Info</span>
                                 <ChevronDown size={14} className={`transition-transform ${isInfoExpanded ? 'rotate-180' : ''}`}/>
                             </button>
                             {isInfoExpanded && (
                                 <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs pt-2 pb-2">
                                     <div>
                                         <span className="text-gray-400 block">VIN</span>
                                         <span className="font-medium">{selectedVehicle.vin}</span>
                                     </div>
                                     <div>
                                         <span className="text-gray-400 block">Type</span>
                                         <span className="font-medium">{selectedVehicle.type}</span>
                                     </div>
                                     <div>
                                         <span className="text-gray-400 block">Last Service</span>
                                         <span className="font-medium">{selectedVehicle.lastService}</span>
                                     </div>
                                     <div>
                                          <span className="text-gray-400 block">Expiry</span>
                                          <span className="font-medium">{selectedVehicle.insuranceExpiry}</span>
                                     </div>
                                 </div>
                             )}
                         </div>

                        {/* Live Itinerary */}
                        <div>
                            <h4 className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center gap-2">
                                <Route size={12}/> Live Itinerary
                            </h4>
                            <div className="relative pl-2">
                                <div className="absolute left-[5px] top-2 bottom-4 w-0.5 bg-gray-200"></div>
                                {getDisplayUpdates(selectedVehicle).map((update, idx) => (
                                    <div key={idx} className="relative flex gap-3 mb-4 last:mb-0">
                                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm mt-1 relative z-10 flex-shrink-0 ${
                                            update.type === 'reroute' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`}></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-gray-800">{update.title}</span>
                                                <span className="text-[10px] text-gray-400">{update.time}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-600 leading-tight mt-0.5">{update.desc}</p>
                                        </div>
                                    </div>
                                ))}
                                {getDisplayUpdates(selectedVehicle).length === 0 && (
                                    <p className="text-xs text-gray-400 italic">No active route updates.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
                        <Truck size={48} className="mb-3 opacity-10"/>
                        <p className="text-sm font-medium text-center">No vehicle selected</p>
                        <p className="text-xs text-center mt-1">Click a marker on the map to view details.</p>
                    </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Panel: Map */}
        <div className="flex-1 flex flex-col relative">
          
          {/* Map Header / Toggle */}
          <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-white z-10 relative shadow-sm">
             <div className="text-xs text-gray-500">
                Showing <span className="font-bold text-gray-800">{displayedVehicles.length}</span> active vehicles
             </div>
             <DashboardSwitch 
                checked={showNotificationVehiclesOnly} 
                onCheckedChange={setShowNotificationVehiclesOnly}
                label="Show Notification Vehicles Only"
             />
          </div>

          {/* Map Container */}
          <div className="flex-1 relative z-0">
            <MapContainer center={[18.5204, 73.8567]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapUpdater center={mapView.center} zoom={mapView.zoom} />
              
              {/* Render Vehicles */}
              {displayedVehicles.map(v => (
                <Marker 
                    key={v.id} 
                    position={v.coords} 
                    icon={getIcon(v)}
                    eventHandlers={{ click: () => handleVehicleSelect(v.id) }}
                >
                  <Popup>
                      <div className="min-w-[180px]">
                          {/* --- HEADER: STATUS PILL REMOVED --- */}
                          <div className="flex justify-between items-center mb-2 border-b pb-1">
                              <span className="font-bold text-gray-800">{v.id}</span>
                          </div>
                          <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <MapPin size={12} className="text-blue-500"/> 
                                  <span className="truncate max-w-[140px]">{v.locationName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <FlagIcon size={12} className="text-red-500"/> 
                                  <span className="truncate max-w-[140px]">{v.destinationName || 'No Destination'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Fuel size={12} className="text-amber-500"/> 
                                  <span>{v.fuelType} ({(v.capacityFree !== undefined ? 100 - v.capacityFree : 65)}%)</span>
                              </div>
                          </div>
                      </div>
                  </Popup>
                </Marker>
              ))}

              {/* Draw Actual Road Route if Selected */}
              {activeVehicleId && routePolyline.length > 0 && (
                  <>
                    <Polyline 
                        positions={routePolyline} 
                        pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.7 }} 
                    />
                    
                    {/* Destination Marker (Blue Pointer) */}
                    <Marker position={routePolyline[routePolyline.length - 1]} icon={BlueIcon}>
                        <Popup className="font-bold">Destination</Popup>
                    </Marker>
                  </>
              )}

            </MapContainer>
            
            {/* Loading Indicator for Routing */}
            {isRouting && (
                <div className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded shadow-lg text-xs font-bold text-blue-600 z-[400] flex items-center gap-2 border border-blue-100">
                    <Loader2 size={12} className="animate-spin"/> Calculating Road Path...
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
// Helper Icon for Popup
const FlagIcon = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
);

// ... [HealthView, VehiclesView, DriversView, AnalyticsView kept consistent with Pune IDs] ...

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl border shadow-sm ${className}`}>{children}</div>
);

const Badge = ({ children, className = "", variant = "default" }) => {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    outline: "text-gray-800 border border-gray-200",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };
  // Handle custom Tailwind classes passed in className that might override background/text
  return <div className={`${base} ${!className.includes('bg-') ? variants[variant] : ''} ${className}`}>{children}</div>;
};

const Button = ({ children, className = "", variant = "default", onClick }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
  };
  return <button onClick={onClick} className={`${base} ${variants[variant] || ""} ${className}`}>{children}</button>;
};

const Progress = ({ value, className = "" }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}>
    <div className="h-full w-full flex-1 bg-current transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </div>
);



const Label = ({ htmlFor, children, className = "" }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>
);

const ScrollArea = ({ children, className }) => <div className={`overflow-y-auto ${className}`}>{children}</div>;

// --- Tabs Components ---
const Tabs = ({ value, onValueChange, children }) => {
  return React.Children.map(children, child => {
    // Pass the 'value' (current filter) and 'onValueChange' (setFilter) down to TabsList
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { value, onValueChange });
    }
    return child;
  });
};

const TabsList = ({ children, className, value, onValueChange }) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
      {React.Children.map(children, child => {
        // Pass the state down to the individual TabsTriggers
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            activeValue: value, // This tells the trigger "The current selected tab is X"
            onValueChange 
          });
        }
        return child;
      })}
    </div>
  );
};

const TabsTrigger = ({ value, children, className, onValueChange, activeValue }) => (
  <button 
    onClick={() => onValueChange && onValueChange(value)}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
      activeValue === value ? 'bg-white text-gray-950 shadow-sm' : ''
    } ${className}`}
  >
    {children}
  </button>
);

// --- Sheet (Side Drawer) Component ---
const Sheet = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50]" 
        onClick={() => onOpenChange(false)} 
      />
      <div className="fixed right-0 top-0 h-full w-[500px] bg-white z-[51] shadow-2xl border-l border-gray-200 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  );
};

const SheetHeader = ({ children }) => <div className="mb-6 space-y-2">{children}</div>;
const SheetTitle = ({ children, className }) => <h2 className={`text-xl font-bold text-gray-900 ${className}`}>{children}</h2>;

// --- Dialog Components ---
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">{children}</div>;
};
const DialogContent = ({ children, className = "" }) => <div className={`bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 ${className}`}>{children}</div>;
const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left p-6 border-b border-gray-100">{children}</div>;
const DialogTitle = ({ children, className }) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const DialogFooter = ({ children, className }) => <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t bg-gray-50 ${className}`}>{children}</div>;

// --- Select Component ---
const SimpleSelect = ({ value, onChange, options }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)} 
    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <option value="" disabled>Select a service center</option>
    {options.map((opt) => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
  </select>
);

// --- Unique Badge for Health View ---
const VehicleStatusBadge = ({ status }) => {
    const styles = {
        critical: "bg-red-100 text-red-700 hover:bg-red-200",
        warning: "bg-amber-100 text-amber-700 hover:bg-amber-200",
        normal: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
        maintenance: "bg-purple-100 text-purple-700 hover:bg-purple-200"
    };
    return <Badge className={`${styles[status] || "bg-gray-100"} uppercase border-none`}>{status}</Badge>;
};

// --- DATA CONSTANTS ---

const HEALTH_MAINTENANCE_LABELS = {
  oil_change: { label: "Oil Change", color: "bg-blue-100 text-blue-700" },
  brake_pad: { label: "Brake Pad", color: "bg-red-100 text-red-700" },
  tyre_replacement: { label: "Tyre Replacement", color: "bg-amber-100 text-amber-700" },
  engine_service: { label: "Engine Service", color: "bg-red-100 text-red-700" },
  battery: { label: "Battery", color: "bg-amber-100 text-amber-700" },
  general: { label: "General Service", color: "bg-gray-100 text-gray-600" },
};

const HEALTH_RECOMMENDATION_CONFIG = {
  monitor: { label: "Monitor", color: "text-emerald-600", bg: "bg-emerald-100", icon: Activity },
  schedule: { label: "Schedule Maintenance", color: "text-amber-600", bg: "bg-amber-100", icon: Calendar },
  immediate: { label: "Immediate Action", color: "text-red-600", bg: "bg-red-100", icon: AlertTriangle },
};

const HEALTH_SERVICE_CENTERS = [
  { id: "sc1", name: "Tata Authorized Service - Koramangala", rating: 4.8 },
  { id: "sc2", name: "Ashok Leyland Service - Electronic City", rating: 4.6 },
  { id: "sc3", name: "BharatBenz Service - Whitefield", rating: 4.7 },
  { id: "sc4", name: "Fleet Care Center - Marathahalli", rating: 4.5 },
  { id: "sc5", name: "Quick Service Hub - HSR Layout", rating: 4.4 },
];

const HEALTH_VEHICLES_DATA = [
  { 
    id: "BLR-0291", 
    healthScore: 12, 
    status: "critical", 
    failureProbability: 89, 
    nextServiceKm: -200, 
    issues: [
      { id: "i1", description: "Engine overheating", faultCode: "P0217", severity: "critical", detectedAt: "2024-01-15 08:30" },
      { id: "i2", description: "Oil pressure low", faultCode: "P0520", severity: "critical", detectedAt: "2024-01-15 09:15" },
      { id: "i3", description: "Brake wear critical", faultCode: "C0035", severity: "warning", detectedAt: "2024-01-14 14:00" },
    ],
    scheduledMaintenance: [
      { id: "sm1", type: "Oil Change", dueDate: "2024-01-18", dueKm: -200, priority: "high", estimatedCost: 4500 },
      { id: "sm2", type: "Brake Pad Replacement", dueDate: "2024-01-20", dueKm: 100, priority: "high", estimatedCost: 8500 },
    ],
    recommendation: "immediate",
    maintenanceHistory: [
      { id: "M001", date: "2024-01-05", type: "oil_change", description: "Full synthetic oil change", cost: 4500, garage: "Tata Authorized Service", invoiceNumber: "INV-2024-001" },
      { id: "M002", date: "2023-11-15", type: "brake_pad", description: "Front brake pads replaced", cost: 8500, garage: "Tata Authorized Service", invoiceNumber: "INV-2023-089" },
      { id: "M003", date: "2023-09-20", type: "general", description: "40,000 km scheduled service", cost: 12000, garage: "Tata Authorized Service", invoiceNumber: "INV-2023-072" },
      { id: "M004", date: "2023-06-10", type: "tyre_replacement", description: "All 6 tyres replaced - MRF", cost: 85000, garage: "MRF Tyre Zone", invoiceNumber: "INV-2023-045" },
    ]
  },
  { 
    id: "BLR-0847", 
    healthScore: 23, 
    status: "critical", 
    failureProbability: 78, 
    nextServiceKm: 120, 
    issues: [
      { id: "i4", description: "Battery degradation", faultCode: "P0562", severity: "critical", detectedAt: "2024-01-15 07:45" },
      { id: "i5", description: "Transmission slip detected", faultCode: "P0730", severity: "critical", detectedAt: "2024-01-14 16:30" },
    ],
    scheduledMaintenance: [
      { id: "sm3", type: "Battery Replacement", dueDate: "2024-01-22", dueKm: 500, priority: "high", estimatedCost: 18000 },
    ],
    recommendation: "immediate",
    maintenanceHistory: [
      { id: "M005", date: "2024-01-10", type: "battery", description: "Battery replaced - Exide 180Ah", cost: 18000, garage: "Quick Service Center", invoiceNumber: "INV-2024-015" },
      { id: "M006", date: "2023-12-01", type: "oil_change", description: "Engine oil + filter change", cost: 5200, garage: "Ashok Leyland Service", invoiceNumber: "INV-2023-112" },
    ]
  },
  { 
    id: "BLR-0934", 
    healthScore: 54, 
    status: "warning", 
    failureProbability: 34, 
    nextServiceKm: 890, 
    issues: [
      { id: "i6", description: "Tire pressure low", faultCode: "C0750", severity: "warning", detectedAt: "2024-01-15 10:00" },
      { id: "i7", description: "Air filter clogged", faultCode: "P0101", severity: "warning", detectedAt: "2024-01-14 11:20" },
    ],
    scheduledMaintenance: [
      { id: "sm4", type: "Filter Replacement", dueDate: "2024-01-25", dueKm: 890, priority: "medium", estimatedCost: 2500 },
      { id: "sm5", type: "Tire Service", dueDate: "2024-01-28", dueKm: 1200, priority: "medium", estimatedCost: 3000 },
    ],
    recommendation: "schedule",
    maintenanceHistory: [
      { id: "M007", date: "2023-12-28", type: "general", description: "30,000 km scheduled service", cost: 9500, garage: "BharatBenz Service", invoiceNumber: "INV-2023-125" },
    ]
  },
  { 
    id: "BLR-1203", 
    healthScore: 67, 
    status: "warning", 
    failureProbability: 21, 
    nextServiceKm: 1450, 
    issues: [
      { id: "i8", description: "Minor coolant leak detected", faultCode: "P0128", severity: "warning", detectedAt: "2024-01-13 09:30" },
    ],
    scheduledMaintenance: [
      { id: "sm6", type: "Coolant System Check", dueDate: "2024-02-01", dueKm: 1450, priority: "low", estimatedCost: 1500 },
    ],
    recommendation: "monitor",
    maintenanceHistory: [
      { id: "M008", date: "2024-01-02", type: "oil_change", description: "Oil change", cost: 4200, garage: "Fleet Care Center", invoiceNumber: "INV-2024-003" },
    ]
  },
  { id: "BLR-0562", healthScore: 82, status: "normal", failureProbability: 8, nextServiceKm: 2100, issues: [], scheduledMaintenance: [{ id: "sm7", type: "Regular Service", dueDate: "2024-02-10", dueKm: 2100, priority: "low", estimatedCost: 5000 }], recommendation: "monitor", maintenanceHistory: [] },
  { id: "BLR-1567", healthScore: 91, status: "normal", failureProbability: 4, nextServiceKm: 3200, issues: [], scheduledMaintenance: [], recommendation: "monitor", maintenanceHistory: [] },
  { id: "BLR-0123", healthScore: 88, status: "normal", failureProbability: 6, nextServiceKm: 2800, issues: [], scheduledMaintenance: [], recommendation: "monitor", maintenanceHistory: [] },
  { id: "BLR-0456", healthScore: 95, status: "normal", failureProbability: 2, nextServiceKm: 4100, issues: [], scheduledMaintenance: [], recommendation: "monitor", maintenanceHistory: [] },
];

// --- HEALTH VIEW COMPONENT ---

const HealthView = ({ fleet, setFleet }) => {
  // --- STATE ---
  const [selectedVehicleId, setSelectedVehicleId] = useState(fleet && fleet.length > 0 ? fleet[0].id : null);
  const [filter, setFilter] = useState("all");
  
  // Dialog States
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
  
  // Order Form States
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState([]);
  const [selectedServiceCenter, setSelectedServiceCenter] = useState("");

  // Notification State
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({ title: "", msg: "" });

  const selectedVehicle = fleet.find(v => v.id === selectedVehicleId) || fleet[0];

  // Mock Service Centers
  const SERVICE_CENTERS = [
    { id: "sc1", name: "BharatBenz Service - Whitefield" },
    { id: "sc2", name: "Tata Authorized Service - Hinjewadi" },
    { id: "sc3", name: "Ashok Leyland Hub - Nigdi" }
  ];

  // --- SENSOR DATA LOGIC (Same as before) ---
  const getSensorData = (vehicle) => {
    const score = vehicle.healthScore || 90;
    return [
      { label: 'Battery', icon: Battery, val: score > 50 ? 12.8 : 10.5, unit: 'V', status: score > 50 ? 'Good' : 'Weak', color: score > 50 ? 'text-emerald-600' : 'text-red-600', progress: score > 50 ? 90 : 40 },
      { label: 'Engine Temp', icon: Thermometer, val: score > 30 ? 88 : 108, unit: '°C', status: score > 30 ? 'Normal' : 'Overheating', color: score > 30 ? 'text-emerald-600' : 'text-red-600', progress: score > 30 ? 65 : 95 },
      { label: 'Oil Pressure', icon: Gauge, val: score > 40 ? 45 : 18, unit: ' PSI', status: score > 40 ? 'Optimal' : 'Low Pressure', color: score > 40 ? 'text-blue-600' : 'text-amber-600', progress: score > 40 ? 75 : 25 },
      { label: 'Brake Pads', icon: Activity, val: score > 60 ? 85 : 25, unit: '%', status: score > 60 ? 'Good' : 'Worn Out', color: score > 60 ? 'text-emerald-600' : 'text-red-600', progress: score > 60 ? 85 : 25 },
    ];
  };
  const sensorData = getSensorData(selectedVehicle);

  // --- ACTIONS ---

  const openCreateOrderDialog = () => {
    // Pre-select all critical issues
    setSelectedIssues((selectedVehicle.issues || []).map(i => i.id));
    // Pre-select high priority maintenance
    setSelectedMaintenance((selectedVehicle.scheduledMaintenance || []).filter(m => m.priority === "high").map(m => m.id));
    setSelectedServiceCenter(SERVICE_CENTERS[0].id);
    setCreateOrderDialogOpen(true);
  };

  const calculateTotalCost = () => {
    let total = 0;
    // Calculate Issue Costs (Mock logic: Critical=8000, others=3000 if not specified)
    selectedIssues.forEach(id => {
       const issue = selectedVehicle.issues.find(i => i.id === id);
       total += issue?.estimatedCost || (issue?.severity === 'critical' ? 8000 : 3000); 
    });
    // Calculate Maintenance Costs
    selectedMaintenance.forEach(id => {
       const maint = selectedVehicle.scheduledMaintenance.find(m => m.id === id);
       total += maint?.estimatedCost || 2000;
    });
    return total;
  };

  const handleConfirmOrder = () => {
    // 1. Update Global State
    setFleet(prev => prev.map(v => 
        v.id === selectedVehicle.id 
        ? { ...v, status: 'maintenance', healthStatus: 'maintenance' } 
        : v
    ));

    // 2. Prepare Toast Data
    const centerName = SERVICE_CENTERS.find(sc => sc.id === selectedServiceCenter)?.name || "Service Center";
    setToastContent({
        title: "Service Order Created",
        msg: `${selectedVehicle.id} has been sent to ${centerName}. Vehicle is now under maintenance.`
    });
    setShowToast(true);

    // 3. Close Modal
    setCreateOrderDialogOpen(false);

    // 4. Auto hide toast
    setTimeout(() => setShowToast(false), 5000);
  };

  // Stats Logic
  const fleetStats = {
    avgHealth: Math.round(fleet.reduce((acc, v) => acc + (v.healthScore || 0), 0) / fleet.length),
    critical: fleet.filter((v) => v.healthStatus === "critical").length,
    warning: fleet.filter((v) => v.healthStatus === "warning").length,
    healthy: fleet.filter((v) => v.healthStatus === "normal").length,
    maintenance: fleet.filter((v) => v.status === "maintenance").length,
  };
  const filteredVehicles = filter === "all" ? fleet : fleet.filter((v) => v.status === filter || v.healthStatus === filter);

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans relative">
      
      {/* --- TOAST NOTIFICATION --- */}
      {showToast && (
        <Toast 
            title={toastContent.title} 
            message={toastContent.msg} 
            onClose={() => setShowToast(false)} 
        />
      )}

      {/* Header Stats */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-5 gap-4">
          <MetricCard label="Avg Fleet Health" value={`${fleetStats.avgHealth}%`} icon={Activity} colorClass="text-gray-800" onClick={() => setFilter("all")} isActive={filter === "all"} />
          <MetricCard label="Critical" value={fleetStats.critical} icon={AlertTriangle} colorClass="text-red-600" onClick={() => setFilter("critical")} isActive={filter === "critical"} />
          <MetricCard label="At Risk" value={fleetStats.warning} icon={TrendingDown} colorClass="text-amber-600" onClick={() => setFilter("warning")} isActive={filter === "warning"} />
          <MetricCard label="Healthy" value={fleetStats.healthy} icon={CheckCircle2} colorClass="text-emerald-600" onClick={() => setFilter("normal")} isActive={filter === "normal"} />
          <MetricCard label="In Service" value={fleetStats.maintenance} icon={Wrench} colorClass="text-purple-600" onClick={() => setFilter("maintenance")} isActive={filter === "maintenance"} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left List */}
        <div className="w-[340px] border-r border-gray-200 bg-white flex flex-col">
          <div className="p-3 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Vehicles ({filteredVehicles.length})
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedVehicleId === vehicle.id
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold text-sm text-gray-800">{vehicle.id}</div>
                        <div className="text-xs text-gray-500">{vehicle.makeModel}</div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded ${
                        vehicle.healthStatus === 'critical' ? 'bg-red-100 text-red-700' :
                        vehicle.healthStatus === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                    }`}>
                        {vehicle.healthScore}%
                    </div>
                  </div>
                  {vehicle.issues && vehicle.issues.length > 0 && (
                      <div className="mt-2 text-[10px] text-red-600 flex items-center gap-1">
                          <AlertTriangle size={10}/> {vehicle.issues[0].description}
                      </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Detail */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-6">
            {/* Vehicle Header Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                        selectedVehicle.healthStatus === 'critical' ? 'bg-red-100 text-red-600' :
                        selectedVehicle.healthStatus === 'warning' ? 'bg-amber-100 text-amber-600' :
                        'bg-emerald-100 text-emerald-600'
                    }`}>
                        {selectedVehicle.healthScore}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedVehicle.id}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{selectedVehicle.makeModel}</span>
                            <span>•</span>
                            <span>{selectedVehicle.year}</span>
                            <span>•</span>
                            <span>{selectedVehicle.fuelType}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setMaintenanceDialogOpen(true)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <History size={16}/> History
                    </button>
                    <button 
                        onClick={openCreateOrderDialog}
                        className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                    >
                        <Wrench size={16}/> Service
                    </button>
                </div>
            </div>

            {/* Sensors */}
            <div className="grid grid-cols-4 gap-4">
                {sensorData.map((sensor, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <sensor.icon className="text-gray-500" size={20}/>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                sensor.status === 'Good' || sensor.status === 'Normal' || sensor.status === 'Optimal' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-red-50 text-red-700'
                            }`}>
                                {sensor.status}
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{sensor.label}</span>
                            <div className={`text-2xl font-bold font-mono ${sensor.color}`}>
                                {sensor.val}<span className="text-sm text-gray-400 ml-1">{sensor.unit}</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ${
                                    sensor.status === 'Overheating' || sensor.status === 'Weak' || sensor.status === 'Worn Out' || sensor.status === 'Low Pressure'
                                    ? 'bg-red-500' 
                                    : 'bg-emerald-500'
                                }`} 
                                style={{width: `${sensor.progress}%`}}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active DTC Codes & Upcoming Service Panels (Existing code structure) */}
            <div className="grid grid-cols-2 gap-6">
                {/* ... (Keep existing layout for DTC Codes) ... */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-red-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-red-800 flex items-center gap-2"><AlertTriangle size={16}/> Active DTC Codes</h3>
                        <span className="text-xs font-bold bg-white text-red-600 px-2 py-0.5 rounded border border-red-100">{selectedVehicle.issues ? selectedVehicle.issues.length : 0} Found</span>
                    </div>
                    <div className="p-4 space-y-3">
                        {selectedVehicle.issues && selectedVehicle.issues.map(issue => (
                            <div key={issue.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                                <div className="mt-0.5"><AlertTriangle size={16} className="text-red-500"/></div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold bg-white border px-1.5 rounded text-gray-700">{issue.faultCode}</span>
                                        <span className="text-sm font-bold text-gray-800">{issue.description}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Detected: {issue.detectedAt} • Severity: {issue.severity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ... (Keep existing layout for Maintenance) ... */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-blue-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-blue-800 flex items-center gap-2"><Calendar size={16}/> Upcoming Service</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {selectedVehicle.scheduledMaintenance && selectedVehicle.scheduledMaintenance.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Wrench size={16} className="text-blue-500"/>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{item.type}</p>
                                        <p className="text-xs text-gray-500">Due: {item.dueDate}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-mono font-bold text-gray-700">₹{item.estimatedCost.toLocaleString()}</p>
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{item.priority}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- CREATE SERVICE ORDER MODAL (Redesigned per Screenshot) --- */}
      {createOrderDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                    
                    <div className="p-6 space-y-6">
                        
                        {/* Issues List */}
                        {selectedVehicle.issues && selectedVehicle.issues.length > 0 && (
                            <div className="space-y-3">
                                {selectedVehicle.issues.map((issue) => (
                                    <div key={issue.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                        <Checkbox 
                                            id={`issue-${issue.id}`} 
                                            checked={selectedIssues.includes(issue.id)}
                                            onCheckedChange={(c) => {
                                                if(c) setSelectedIssues([...selectedIssues, issue.id]);
                                                else setSelectedIssues(selectedIssues.filter(x => x !== issue.id));
                                            }}
                                        />
                                        <div className="ml-3 flex-1 flex items-center gap-3">
                                            <Badge className="bg-white border border-gray-300 font-mono text-gray-600">{issue.faultCode}</Badge>
                                            <span className="font-medium text-gray-800 text-sm">{issue.description}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500">Est. ₹{(issue.estimatedCost || (issue.severity==='critical'?8000:3000)).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Maintenance Header & List */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Scheduled Maintenance</h4>
                            <div className="space-y-3">
                                {selectedVehicle.scheduledMaintenance && selectedVehicle.scheduledMaintenance.map((maint) => (
                                    <div key={maint.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                        <Checkbox 
                                            id={`maint-${maint.id}`} 
                                            checked={selectedMaintenance.includes(maint.id)}
                                            onCheckedChange={(c) => {
                                                if(c) setSelectedMaintenance([...selectedMaintenance, maint.id]);
                                                else setSelectedMaintenance(selectedMaintenance.filter(x => x !== maint.id));
                                            }}
                                        />
                                        <div className="ml-3 flex-1 flex items-center gap-3">
                                            <span className="font-medium text-gray-800 text-sm">{maint.type}</span>
                                            {maint.priority === 'high' && (
                                                <Badge className="bg-red-100 text-red-600 border border-red-200 uppercase text-[10px]">High</Badge>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-gray-800">₹{maint.estimatedCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Service Center Dropdown */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Designated Service Center</h4>
                            <select 
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedServiceCenter}
                                onChange={(e) => setSelectedServiceCenter(e.target.value)}
                            >
                                {SERVICE_CENTERS.map(sc => (
                                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Cost Summary Box (Blue) */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Estimated Total Cost</h4>
                                <p className="text-xs text-blue-600 mt-0.5">{selectedIssues.length} issues + {selectedMaintenance.length} maintenance items</p>
                            </div>
                            <div className="text-xl font-bold text-blue-700 font-mono">
                                ₹{calculateTotalCost().toLocaleString()}
                            </div>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 sticky bottom-0">
                        <button 
                            onClick={() => setCreateOrderDialogOpen(false)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmOrder}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <ShoppingCart size={16} /> Confirm & Create Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* History Dialog (kept simpler for now) */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Service History</DialogTitle></DialogHeader>
            <div className="p-6">
                {/* ... History List Content ... */}
                <p className="text-gray-500 text-sm">History records for {selectedVehicle.id}</p>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};
// --- New Helper Components for Vehicles View ---

const Input = ({ className, ...props }) => (
  <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);

const Collapsible = ({ open, children, className }) => (
  <div className={className}>{children}</div>
);

const CollapsibleTrigger = ({ asChild, children }) => children;

const CollapsibleContent = ({ open, children, className }) => (
  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} ${className}`}>
    {children}
  </div>
);

// Simplified Select for single-file compatibility
const Select = ({ value, onValueChange, children }) => (
  <div className="relative">
    {React.Children.map(children, child => 
      React.cloneElement(child, { value, onValueChange })
    )}
  </div>
);

const SelectTrigger = ({ children, className }) => <div className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}>{children}</div>;
const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;
const SelectContent = ({ children }) => <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white text-gray-950 shadow-md">{children}</div>;
const SelectItem = ({ value, children, onClick }) => (
  <div onClick={() => onClick(value)} className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
    {children}
  </div>
);
// Note: Accepting 'vehicles' as a prop now
const VehiclesView = () => {
  // --- Data from Screenshot (Embedded for functionality) ---
  const initialVehicles = [
    {
      id: "BLR-0847", vin: "1HGBH41JXMN109186", numberPlate: "KA 01 AB 1234", vehicleType: "Heavy Truck", make: "Tata", model: "Prima 4928.S", year: 2022, fuelType: "Diesel", capacity: "28 Tonnes", lastService: "2024-01-10", insuranceExpiry: "2024-12-15", status: "active", category: "Long Haul",
      documents: {
        registration: { number: "KA01AB1234RC", validTill: "2027-03-15" },
        insurance: { provider: "ICICI Lombard", policyNumber: "POL-2024-789456", validTill: "2024-12-15" },
        pollution: { certificateNumber: "PUC-BLR-2024-1234", validTill: "2024-06-30" },
        fitness: { certificateNumber: "FIT-KA-2024-5678", validTill: "2025-01-15" },
        permit: { type: "National Permit", validTill: "2025-03-15", regions: ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Maharashtra"] },
      },
      activity: {
        routeHistory: [
          { date: "2024-01-15", route: "HSR Layout → Koramangala → BTM Layout", distance: "24 km" },
          { date: "2024-01-14", route: "Whitefield → Marathahalli → Indiranagar", distance: "32 km" },
        ],
        shipmentsCompleted: [
          { id: "SHP-A1B2C3", date: "2024-01-15", from: "HSR Warehouse", to: "BTM Layout", status: "Delivered" },
        ],
        totalKm: 12450, totalShipments: 342,
      },
    },
    {
      id: "BLR-1203", vin: "2HGBH41JXMN209287", numberPlate: "KA 01 CD 5678", vehicleType: "Medium Truck", make: "Ashok Leyland", model: "BOSS 1920", year: 2023, fuelType: "Diesel", capacity: "19 Tonnes", lastService: "2024-01-05", insuranceExpiry: "2024-11-20", status: "active", category: "Regional",
      activity: { routeHistory: [{ date: "2024-01-15", route: "Koramangala → Ulsoor", distance: "18 km" }], shipmentsCompleted: [], totalKm: 8920, totalShipments: 215 },
      documents: {
        registration: { number: "KA01CD5678RC", validTill: "2028-01-10" },
        insurance: { provider: "HDFC Ergo", policyNumber: "POL-998877", validTill: "2024-11-20" },
        pollution: { certificateNumber: "PUC-888", validTill: "2024-08-01" },
        fitness: { certificateNumber: "FIT-999", validTill: "2025-02-20" },
        permit: { type: "State Permit", validTill: "2026-01-01", regions: ["Karnataka"] },
      }
    },
    {
      id: "BLR-0562", vin: "3HGBH41JXMN309388", numberPlate: "KA 01 EF 9012", vehicleType: "Light Truck", make: "Eicher", model: "Pro 2049", year: 2021, fuelType: "CNG", capacity: "7 Tonnes", lastService: "2024-01-12", insuranceExpiry: "2025-02-28", status: "maintenance", category: "Last Mile",
      activity: { routeHistory: [], shipmentsCompleted: [], totalKm: 15670, totalShipments: 456 },
    },
    {
        id: "BLR-0291", vin: "5HGBH41JXMN509590", numberPlate: "KA 01 IJ 7890", vehicleType: "Medium Truck", make: "Tata", model: "LPT 1613", year: 2020, fuelType: "Diesel", capacity: "16 Tonnes", lastService: "2024-01-08", insuranceExpiry: "2024-08-15", status: "inactive", category: "Regional",
        activity: { routeHistory: [], shipmentsCompleted: [], totalKm: 22100, totalShipments: 512 },
    },
  ];

  const [vehicles, setVehicles] = useState(initialVehicles);
  const [expandedVehicles, setExpandedVehicles] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [sheetType, setSheetType] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [selectedVehicleForDocs, setSelectedVehicleForDocs] = useState(null);
  const [newVehicle, setNewVehicle] = useState({ vin: "", numberPlate: "", vehicleType: "", fuelType: "", category: "", make: "", model: "", capacity: "" });
  
  // Custom Toast State since we aren't using the hook
  const [toast, setToast] = useState(null);

  const openDocsDialog = (vehicle) => {
    setSelectedVehicleForDocs(vehicle);
    setDocsDialogOpen(true);
  };

  const isDocExpiringSoon = (validTill) => {
    if(!validTill) return false;
    const expiryDate = new Date(validTill);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isDocExpired = (validTill) => {
    if(!validTill) return false;
    return new Date(validTill) < new Date();
  };

  const toggleExpand = (vehicleId, section) => {
    setExpandedVehicles((prev) => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [section]: !prev[vehicleId]?.[section],
      },
    }));
  };

  const openSheet = (vehicle, type) => {
    setSelectedVehicle(vehicle);
    setSheetType(type);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "maintenance": return "bg-amber-100 text-amber-700 border-amber-200";
      case "inactive": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const handleAddVehicle = () => {
    if (!newVehicle.vin || !newVehicle.numberPlate || !newVehicle.vehicleType) {
      alert("Please fill in required fields");
      return;
    }
    const vehicleId = `BLR-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const newVehicleData = {
      id: vehicleId,
      ...newVehicle,
      year: new Date().getFullYear(),
      make: newVehicle.make || "Unknown",
      model: newVehicle.model || "Unknown",
      capacity: newVehicle.capacity || "N/A",
      lastService: new Date().toISOString().split("T")[0],
      insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "active",
      activity: { routeHistory: [], shipmentsCompleted: [], totalKm: 0, totalShipments: 0 },
    };
    setVehicles([newVehicleData, ...vehicles]);
    setAddDialogOpen(false);
    setNewVehicle({ vin: "", numberPlate: "", vehicleType: "", fuelType: "", category: "", make: "", model: "", capacity: "" });
    setToast({ title: "Vehicle Added", message: `${vehicleId} has been added to the fleet.` });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Internal Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-white border border-gray-200 shadow-xl rounded-lg p-4 w-96 border-l-4 border-l-blue-600 animate-in slide-in-from-bottom-5">
            <h4 className="font-bold text-gray-900 text-sm">{toast.title}</h4>
            <p className="text-sm text-gray-600">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Vehicles</h1>
              <p className="text-sm text-gray-500">{vehicles.length} vehicles in fleet</p>
            </div>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add New Vehicle
          </Button>
        </div>
      </div>

      {/* Vehicle List */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden border border-gray-200 shadow-sm">
              <div className="p-4">
                {/* Vehicle Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-mono font-semibold text-gray-800">{vehicle.id}</h3>
                      <p className="text-xs text-gray-500">{vehicle.numberPlate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1 h-8 text-xs" onClick={() => openDocsDialog(vehicle)}>
                      <FileText className="w-3 h-3" /> Docs
                    </Button>
                    <Badge variant="outline" className="text-xs bg-white">{vehicle.category}</Badge>
                    <Badge className={getStatusColor(vehicle.status)}>
                      {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Expandable Options Row */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-between h-9" onClick={() => toggleExpand(vehicle.id, "info")}>
                      <span className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <Info className="w-3 h-3 text-blue-600" /> Vehicle Info
                      </span>
                      {expandedVehicles[vehicle.id]?.info ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </Button>
                    
                    <Collapsible open={expandedVehicles[vehicle.id]?.info}>
                        <CollapsibleContent open={expandedVehicles[vehicle.id]?.info} className="mt-2 space-y-3 bg-gray-50 p-3 rounded-md border border-gray-100">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div><span className="text-gray-400 block">VIN</span><p className="font-mono text-gray-800">{vehicle.vin}</p></div>
                                <div><span className="text-gray-400 block">Type</span><p className="text-gray-800">{vehicle.vehicleType}</p></div>
                                <div><span className="text-gray-400 block">Make/Model</span><p className="text-gray-800">{vehicle.make} {vehicle.model}</p></div>
                                <div><span className="text-gray-400 block">Fuel</span><p className="text-gray-800">{vehicle.fuelType}</p></div>
                                <div><span className="text-gray-400 block">Service</span><p className="text-gray-800">{vehicle.lastService}</p></div>
                                <div><span className="text-gray-400 block">Insurance</span><p className="text-gray-800">{vehicle.insuranceExpiry}</p></div>
                            </div>
                            <Button variant="secondary" size="sm" className="w-full h-7 text-xs bg-white border border-gray-200" onClick={() => openSheet(vehicle, "info")}>View Full Details</Button>
                        </CollapsibleContent>
                    </Collapsible>
                  </div>

                  <div className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-between h-9" onClick={() => toggleExpand(vehicle.id, "activity")}>
                      <span className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <Activity className="w-3 h-3 text-amber-600" /> Vehicle Activity
                      </span>
                      {expandedVehicles[vehicle.id]?.activity ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </Button>

                    <Collapsible open={expandedVehicles[vehicle.id]?.activity}>
                        <CollapsibleContent open={expandedVehicles[vehicle.id]?.activity} className="mt-2 space-y-3 bg-gray-50 p-3 rounded-md border border-gray-100">
                            <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                                <div className="flex items-center gap-2"><Gauge className="w-3 h-3 text-gray-400" /><div><span className="text-gray-400 block">Total KM</span><p className="font-mono text-gray-800">{vehicle.activity.totalKm.toLocaleString()}</p></div></div>
                                <div className="flex items-center gap-2"><Package className="w-3 h-3 text-gray-400" /><div><span className="text-gray-400 block">Shipments</span><p className="font-mono text-gray-800">{vehicle.activity.totalShipments}</p></div></div>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Recent Routes</span>
                                <div className="mt-1 space-y-1">
                                    {vehicle.activity.routeHistory.length > 0 ? vehicle.activity.routeHistory.slice(0, 2).map((route, idx) => (
                                    <div key={idx} className="text-[10px] flex items-center gap-2 bg-white p-1.5 rounded border border-gray-100">
                                        <Route className="w-3 h-3 text-gray-400" />
                                        <span className="text-gray-700 truncate flex-1">{route.route}</span>
                                        <span className="text-gray-400 font-mono">{route.distance}</span>
                                    </div>
                                    )) : <span className="text-[10px] text-gray-400 italic">No recent activity</span>}
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" className="w-full h-7 text-xs bg-white border border-gray-200" onClick={() => openSheet(vehicle, "activity")}>View Full Activity</Button>
                        </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Side Sheet */}
      <Sheet open={!!sheetType} onOpenChange={() => setSheetType(null)}>
        {selectedVehicle && sheetType === "info" && (
            <>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-blue-600"/> {selectedVehicle.id} Info</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <Truck className="w-16 h-16 text-gray-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500 text-xs">VIN</span><p className="font-mono text-gray-900">{selectedVehicle.vin}</p></div>
                        <div><span className="text-gray-500 text-xs">Plate</span><p className="font-mono text-gray-900">{selectedVehicle.numberPlate}</p></div>
                        <div><span className="text-gray-500 text-xs">Make</span><p className="text-gray-900">{selectedVehicle.make}</p></div>
                        <div><span className="text-gray-500 text-xs">Model</span><p className="text-gray-900">{selectedVehicle.model}</p></div>
                        <div><span className="text-gray-500 text-xs">Capacity</span><p className="text-gray-900">{selectedVehicle.capacity}</p></div>
                        <div><span className="text-gray-500 text-xs">Fuel</span><p className="text-gray-900">{selectedVehicle.fuelType}</p></div>
                    </div>
                </div>
            </>
        )}
        {selectedVehicle && sheetType === "activity" && (
            <>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-amber-600"/> Activity Log</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-center"><p className="text-2xl font-mono font-bold text-gray-800">{selectedVehicle.activity.totalKm.toLocaleString()}</p><p className="text-xs text-gray-500">Total Kilometers</p></div>
                        <div className="text-center"><p className="text-2xl font-mono font-bold text-gray-800">{selectedVehicle.activity.totalShipments}</p><p className="text-xs text-gray-500">Total Shipments</p></div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-3">Recent Routes</h4>
                        <div className="space-y-2">
                            {selectedVehicle.activity.routeHistory.map((route, idx) => (
                                <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg text-sm">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{route.date}</span><span className="font-mono">{route.distance}</span></div>
                                    <p className="text-gray-800">{route.route}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        )}
      </Sheet>

      {/* Docs Dialog */}
      <Dialog open={docsDialogOpen} onOpenChange={setDocsDialogOpen}>
        <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-600"/> Vehicle Documents</DialogTitle></DialogHeader>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {selectedVehicleForDocs?.documents ? (
                    <>
                        {/* RC */}
                        <div className="p-4 border rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center"><FileCheck className="w-5 h-5 text-blue-600"/></div>
                                    <div><h4 className="font-medium text-gray-900">Registration Certificate</h4><p className="text-xs font-mono text-gray-500">{selectedVehicleForDocs.documents.registration.number}</p></div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400">Valid Till</span>
                                    <p className={`text-sm font-bold ${isDocExpiringSoon(selectedVehicleForDocs.documents.registration.validTill) ? 'text-amber-600' : 'text-emerald-600'}`}>{selectedVehicleForDocs.documents.registration.validTill}</p>
                                </div>
                            </div>
                        </div>
                        {/* Insurance */}
                        <div className="p-4 border rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded bg-purple-50 flex items-center justify-center"><Shield className="w-5 h-5 text-purple-600"/></div>
                                    <div><h4 className="font-medium text-gray-900">Insurance</h4><p className="text-xs text-gray-500">{selectedVehicleForDocs.documents.insurance.provider}</p></div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400">Valid Till</span>
                                    <p className={`text-sm font-bold ${isDocExpiringSoon(selectedVehicleForDocs.documents.insurance.validTill) ? 'text-amber-600' : 'text-emerald-600'}`}>{selectedVehicleForDocs.documents.insurance.validTill}</p>
                                </div>
                            </div>
                        </div>
                        {/* Permit */}
                        <div className="p-4 border rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center"><MapPin className="w-5 h-5 text-orange-600"/></div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{selectedVehicleForDocs.documents.permit.type}</h4>
                                        <div className="flex flex-wrap gap-1 mt-1">{selectedVehicleForDocs.documents.permit.regions.map(r => <span key={r} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{r}</span>)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400">Valid Till</span>
                                    <p className="text-sm font-bold text-emerald-600">{selectedVehicleForDocs.documents.permit.validTill}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-gray-400"><AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20"/><p>No documents found.</p></div>
                )}
            </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Vehicle</DialogTitle></DialogHeader>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>VIN *</Label><Input value={newVehicle.vin} onChange={e => setNewVehicle({...newVehicle, vin: e.target.value})} placeholder="VIN Number"/></div>
                    <div><Label>Plate *</Label><Input value={newVehicle.numberPlate} onChange={e => setNewVehicle({...newVehicle, numberPlate: e.target.value})} placeholder="KA 01 AB 1234"/></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Type *</Label><select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm" value={newVehicle.vehicleType} onChange={e => setNewVehicle({...newVehicle, vehicleType: e.target.value})}><option value="">Select</option><option value="Heavy Truck">Heavy Truck</option><option value="Light Truck">Light Truck</option></select></div>
                    <div><Label>Fuel</Label><select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm" value={newVehicle.fuelType} onChange={e => setNewVehicle({...newVehicle, fuelType: e.target.value})}><option value="">Select</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Make</Label><Input value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} placeholder="Tata"/></div>
                    <div><Label>Capacity</Label><Input value={newVehicle.capacity} onChange={e => setNewVehicle({...newVehicle, capacity: e.target.value})} placeholder="10 Tonnes"/></div>
                </div>
            </div>
            <DialogFooter className="p-4 border-t border-gray-100">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddVehicle}>Add Vehicle</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DriversView = () => {
  // --- Rich Mock Data ---
  const initialDrivers = [
    {
      id: "DRV-101",
      name: "Ramesh Kumar",
      age: 35,
      address: "42, 3rd Cross, HSR Layout, Pune - 411057",
      phone: "+91 98765 43210",
      dateOfJoining: "2021-03-15",
      startingSalary: 25000,
      currentSalary: 32000,
      status: "active",
      performanceScore: 92,
      documents: {
        photo: { uploadedAt: "2021-03-15" },
        license: { number: "MH12 20210012345", type: "HMV", validTill: "2031-03-15" },
        aadhaar: { number: "XXXX-XXXX-1234" },
        pan: { number: "ABCDE1234F" },
        medicalCertificate: { validTill: "2024-09-15" },
      },
      history: {
        dailyShipments: [
          { date: "2024-01-15", count: 12, hours: 9 },
          { date: "2024-01-14", count: 10, hours: 8.5 },
          { date: "2024-01-13", count: 14, hours: 10 },
        ],
        totalShipments: 1847,
        totalHoursWorked: 4520,
        daysOff: 45,
      },
    },
    {
      id: "DRV-102",
      name: "Suresh Babu",
      age: 42,
      address: "156, 5th Main, Wakad, Pune - 411057",
      phone: "+91 98765 43211",
      dateOfJoining: "2019-08-01",
      startingSalary: 22000,
      currentSalary: 35000,
      status: "active",
      performanceScore: 88,
      documents: {
        license: { number: "MH14 20190054321", type: "HMV", validTill: "2029-08-01" },
        aadhaar: { number: "XXXX-XXXX-5678" },
        pan: { number: "FGHIJ5678K" },
        medicalCertificate: { validTill: "2024-12-01" },
      },
      history: {
        dailyShipments: [
          { date: "2024-01-15", count: 10, hours: 8 },
          { date: "2024-01-14", count: 9, hours: 7.5 },
        ],
        totalShipments: 2456,
        totalHoursWorked: 5890,
        daysOff: 62,
      },
    },
    {
      id: "DRV-103",
      name: "Vijay Sharma",
      age: 28,
      address: "78, 2nd Stage, Kothrud, Pune - 411038",
      phone: "+91 98765 43212",
      dateOfJoining: "2022-11-20",
      startingSalary: 24000,
      currentSalary: 28000,
      status: "on_leave",
      performanceScore: 85,
      history: {
        dailyShipments: [],
        totalShipments: 654,
        totalHoursWorked: 1580,
        daysOff: 18,
      },
    },
    {
      id: "DRV-104",
      name: "Anil Reddy",
      age: 38,
      address: "234, 4th Block, Baner, Pune - 411045",
      phone: "+91 98765 43213",
      dateOfJoining: "2020-05-10",
      startingSalary: 23000,
      currentSalary: 31000,
      status: "active",
      performanceScore: 78,
      history: {
        dailyShipments: [{ date: "2024-01-15", count: 9, hours: 8 }],
        totalShipments: 1678,
        totalHoursWorked: 4120,
        daysOff: 55,
      },
    },
    {
      id: "DRV-105",
      name: "Prasad Rao",
      age: 45,
      address: "89, 1st Main, Nigdi, Pune - 411044",
      phone: "+91 98765 43214",
      dateOfJoining: "2018-02-01",
      startingSalary: 20000,
      currentSalary: 38000,
      status: "inactive",
      performanceScore: 65,
      history: {
        dailyShipments: [],
        totalShipments: 3245,
        totalHoursWorked: 7890,
        daysOff: 98,
      },
    },
  ];

  const [drivers, setDrivers] = useState(initialDrivers);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [sheetType, setSheetType] = useState(null); // 'info' | 'history'
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [selectedDriverForDocs, setSelectedDriverForDocs] = useState(null);
  
  const [newDriver, setNewDriver] = useState({
    name: "",
    id: "",
    phone: "",
    age: "",
    startingSalary: "",
    address: "",
    dateOfJoining: "",
  });

  const openDocsDialog = (driver) => {
    setSelectedDriverForDocs(driver);
    setDocsDialogOpen(true);
  };

  const openSheet = (driver, type) => {
    setSelectedDriver(driver);
    setSheetType(type);
  };

  const isDocExpiringSoon = (validTill) => {
    const expiryDate = new Date(validTill);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isDocExpired = (validTill) => {
    return new Date(validTill) < new Date();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "on_leave": return "bg-amber-100 text-amber-700 border-amber-200";
      case "inactive": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-emerald-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.id || !newDriver.phone) {
      alert("Please fill in all required fields.");
      return;
    }

    const driver = {
      id: newDriver.id,
      name: newDriver.name,
      age: parseInt(newDriver.age) || 30,
      address: newDriver.address,
      phone: newDriver.phone,
      dateOfJoining: newDriver.dateOfJoining || new Date().toISOString().split('T')[0],
      startingSalary: parseInt(newDriver.startingSalary) || 25000,
      currentSalary: parseInt(newDriver.startingSalary) || 25000,
      status: "active",
      performanceScore: 75,
      history: {
        dailyShipments: [],
        totalShipments: 0,
        totalHoursWorked: 0,
        daysOff: 0,
      },
    };

    setDrivers([driver, ...drivers]);
    setAddDriverOpen(false);
    setNewDriver({ name: "", id: "", phone: "", age: "", startingSalary: "", address: "", dateOfJoining: "" });
  };

  return (
    <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Drivers</h2>
                    <p className="text-xs text-gray-500">{drivers.length} drivers registered</p>
                </div>
            </div>
            <button 
                onClick={() => setAddDriverOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
            >
                <Plus size={16} /> Add New Driver
            </button>
        </div>

        {/* Driver List */}
        <div className="space-y-3">
            {drivers.map((driver) => (
                <div key={driver.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    {/* Driver Summary Row */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                <User className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-base">{driver.name}</h3>
                                <p className="text-xs font-mono text-gray-500">{driver.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className={`flex items-center gap-1 font-bold ${getScoreColor(driver.performanceScore)}`}>
                                    <Star size={14} fill="currentColor" />
                                    <span>{driver.performanceScore}%</span>
                                </div>
                                <span className="text-[10px] text-gray-400 uppercase font-medium">Performance</span>
                            </div>
                            <Badge className={getStatusColor(driver.status)}>
                                {driver.status.replace("_", " ")}
                            </Badge>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-3 border-t border-gray-100">
                        <button 
                            onClick={() => openSheet(driver, "info")}
                            className="flex-1 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded flex items-center justify-center gap-2 transition-colors"
                        >
                            <Info size={14} className="text-blue-600"/> Driver Info
                        </button>
                        <button 
                            onClick={() => openSheet(driver, "history")}
                            className="flex-1 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded flex items-center justify-center gap-2 transition-colors"
                        >
                            <History size={14} className="text-amber-600"/> Driver History
                        </button>
                        <button 
                            onClick={() => openDocsDialog(driver)}
                            className="px-6 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded flex items-center justify-center gap-2 transition-colors"
                        >
                            <FileText size={14} className="text-emerald-600"/> Docs
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* --- ADD DRIVER DIALOG --- */}
        <Dialog open={addDriverOpen} onOpenChange={setAddDriverOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-800">
                        <Plus className="w-5 h-5 text-blue-600" /> Add New Driver
                    </DialogTitle>
                    <button onClick={() => setAddDriverOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </DialogHeader>
                
                <div className="grid gap-4 py-4 p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Name *</label>
                            <input 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Full name"
                                value={newDriver.name}
                                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Driver ID *</label>
                            <input 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., DRV-106"
                                value={newDriver.id}
                                onChange={(e) => setNewDriver({ ...newDriver, id: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                            <input 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+91 98765 43210"
                                value={newDriver.phone}
                                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Age</label>
                            <input 
                                type="number"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="30"
                                value={newDriver.age}
                                onChange={(e) => setNewDriver({ ...newDriver, age: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Starting Salary (₹)</label>
                            <input 
                                type="number"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="25000"
                                value={newDriver.startingSalary}
                                onChange={(e) => setNewDriver({ ...newDriver, startingSalary: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Date of Joining</label>
                            <input 
                                type="date"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newDriver.dateOfJoining}
                                onChange={(e) => setNewDriver({ ...newDriver, dateOfJoining: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Address</label>
                        <input 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Full address"
                            value={newDriver.address}
                            onChange={(e) => setNewDriver({ ...newDriver, address: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter className="p-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => setAddDriverOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddDriver} className="bg-blue-600 hover:bg-blue-700 text-white">Add Driver</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* --- DOCS DIALOG --- */}
        <Dialog open={docsDialogOpen} onOpenChange={setDocsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-800">
                        <FileText className="w-5 h-5 text-blue-600" /> {selectedDriverForDocs?.name} - Documents
                    </DialogTitle>
                    <button onClick={() => setDocsDialogOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </DialogHeader>

                <div className="p-6 space-y-4 bg-gray-50/50">
                    {selectedDriverForDocs?.documents ? (
                        <>
                            {/* License Card */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center border border-blue-100">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">Driving License</h4>
                                            <p className="text-xs font-mono text-gray-500">{selectedDriverForDocs.documents.license.number}</p>
                                            <Badge variant="outline" className="text-[10px] mt-1">{selectedDriverForDocs.documents.license.type}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-400 uppercase">Valid Till</span>
                                        <p className={`text-sm font-bold ${
                                            isDocExpired(selectedDriverForDocs.documents.license.validTill) ? "text-red-600" :
                                            isDocExpiringSoon(selectedDriverForDocs.documents.license.validTill) ? "text-amber-600" : "text-emerald-600"
                                        }`}>
                                            {selectedDriverForDocs.documents.license.validTill}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Card */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center border border-red-100">
                                            <Heart className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">Medical Certificate</h4>
                                            <p className="text-xs text-gray-500">Fitness Status: Active</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-400 uppercase">Valid Till</span>
                                        <p className={`text-sm font-bold ${
                                            isDocExpired(selectedDriverForDocs.documents.medicalCertificate?.validTill) ? "text-red-600" : "text-emerald-600"
                                        }`}>
                                            {selectedDriverForDocs.documents.medicalCertificate?.validTill || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Aadhaar & PAN */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-yellow-50 flex items-center justify-center border border-yellow-100">
                                            <FileText className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-xs uppercase">Aadhaar Card</h4>
                                            <p className="text-xs font-mono text-gray-500">{selectedDriverForDocs.documents.aadhaar?.number || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center border border-purple-100">
                                            <FileText className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-xs uppercase">PAN Card</h4>
                                            <p className="text-xs font-mono text-gray-500">{selectedDriverForDocs.documents.pan?.number || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-8 text-center flex flex-col items-center justify-center text-gray-400">
                            <XCircle className="w-12 h-12 mb-2 opacity-20" />
                            <p>No documents uploaded for this driver.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* --- INFO / HISTORY SHEET --- */}
        <Sheet open={!!sheetType} onOpenChange={() => setSheetType(null)}>
            {selectedDriver && sheetType === "info" && (
                <>
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2 text-xl text-gray-800">
                            <User className="w-6 h-6 text-blue-600" />
                            {selectedDriver.name}
                        </SheetTitle>
                        <p className="text-sm text-gray-500 font-normal ml-8">{selectedDriver.id} • {selectedDriver.status}</p>
                    </SheetHeader>
                    
                    <div className="mt-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-gray-400 uppercase mb-1">Age</p>
                                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400"/> {selectedDriver.age} years
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase mb-1">Phone</p>
                                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <Phone size={14} className="text-gray-400"/> {selectedDriver.phone}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-400 uppercase mb-1">Address</p>
                                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400"/> {selectedDriver.address}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase mb-1">Joined On</p>
                                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <Briefcase size={14} className="text-gray-400"/> {selectedDriver.dateOfJoining}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase mb-1">Current Salary</p>
                                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <IndianRupee size={14} className="text-gray-400"/> ₹{selectedDriver.currentSalary.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {selectedDriver && sheetType === "history" && (
                <>
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2 text-xl text-gray-800">
                            <History className="w-6 h-6 text-amber-600" />
                            Work History
                        </SheetTitle>
                        <p className="text-sm text-gray-500 font-normal ml-8">Activity log for {selectedDriver.name}</p>
                    </SheetHeader>

                    <div className="mt-8 space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                                <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-lg font-bold text-gray-800">{selectedDriver.history.totalShipments}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Shipments</p>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-lg text-center">
                                <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                <p className="text-lg font-bold text-gray-800">{selectedDriver.history.totalHoursWorked}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Hours</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg text-center">
                                <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                <p className="text-lg font-bold text-gray-800">{selectedDriver.history.daysOff}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Days Off</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase">Recent Daily Activity</h3>
                            <div className="space-y-2">
                                {selectedDriver.history.dailyShipments.length > 0 ? selectedDriver.history.dailyShipments.map((day, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                                        <span className="text-sm font-medium text-gray-600">{day.date}</span>
                                        <div className="flex gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-800">{day.count}</p>
                                                <p className="text-[10px] text-gray-400">Deliveries</p>
                                            </div>
                                            <div className="text-right w-12">
                                                <p className="text-sm font-bold text-gray-800">{day.hours}h</p>
                                                <p className="text-[10px] text-gray-400">Worked</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-400 italic text-center py-4">No recent activity found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Sheet>
    </div>
  );
};

const AnalyticsView = ({ fleet }) => { // <--- Receive fleet as prop
  const [activeSubTab, setActiveSubTab] = useState('performance');

  // Dynamic Data Calculation
  const totalFuel = fleet ? fleet.length * 450 : 0; // Mock math based on fleet size
  const activeCount = fleet ? fleet.filter(v => v.status === 'active').length : 0;
  
  // Sort fleet by health score to mock "performance"
  const sortedFleet = fleet ? [...fleet].sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0)) : [];

  const fuelUsageData = [
    { month: "Jan", diesel: 4500, cng: 1200, electric: 300 },
    { month: "Feb", diesel: 4200, cng: 1400, electric: 350 },
    { month: "Mar", diesel: 4800, cng: 1300, electric: 400 },
    { month: "Apr", diesel: 4100, cng: 1500, electric: 450 },
    { month: "May", diesel: 3900, cng: 1600, electric: 500 },
    { month: "Jun", diesel: 4300, cng: 1700, electric: 550 },
  ];

  const breakdownData = [
    { type: "Engine", count: 12 },
    { type: "Battery", count: 8 },
    { type: "Tyre", count: 15 },
    { type: "Brake", count: 6 },
    { type: "Electrical", count: 9 },
    { type: "Other", count: 5 },
  ];

  const operationalEfficiency = [
    { week: "W1", deliveries: 245, onTime: 232, delayed: 13 },
    { week: "W2", deliveries: 268, onTime: 251, delayed: 17 },
    { week: "W3", deliveries: 234, onTime: 218, delayed: 16 },
    { week: "W4", deliveries: 289, onTime: 275, delayed: 14 },
  ];

  const fleetUtilization = [
    { name: "Active", value: activeCount, color: "#10b981" },
    { name: "Maintenance", value: fleet ? fleet.filter(v => v.status === 'maintenance').length : 0, color: "#ef4444" },
    { name: "Idle", value: fleet ? fleet.filter(v => v.status === 'inactive').length : 0, color: "#fbbf24" }, 
  ];

  const kpiData = [
    { label: "Fleet Utilization", value: "87%", trend: "+3.2%", icon: Truck },
    { label: "On-Time Delivery", value: "94.8%", trend: "+1.5%", icon: ClockIcon },
    { label: "Avg. Fuel Efficiency", value: "7.9 km/L", trend: "+0.4", icon: Fuel },
    { label: "Total Deliveries", value: "1,036", trend: "+12%", icon: Package },
  ];

  const driverPerformance = [
    { id: "DRV-101", name: "Ramesh Kumar", deliveries: 156, rating: 4.9, score: 96 },
    { id: "DRV-102", name: "Suresh Babu", deliveries: 142, rating: 4.8, score: 94 },
    { id: "DRV-103", name: "Vijay Sharma", deliveries: 138, rating: 4.7, score: 91 },
    { id: "DRV-104", name: "Anil Reddy", deliveries: 129, rating: 4.6, score: 88 },
    { id: "DRV-105", name: "Prasad Rao", deliveries: 121, rating: 4.5, score: 85 },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Fleet Analytics</h1>
              <p className="text-sm text-gray-500">
                Comprehensive insights and performance metrics
              </p>
            </div>
          </div>
          <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Last updated: Just now
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{kpi.value}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    {kpi.trend}
                  </p>
                </div>
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Tabs */}
        <div className="space-y-4">
          <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-lg w-fit">
            {['performance', 'fuel', 'breakdowns', 'efficiency'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded capitalize transition-colors ${
                  activeSubTab === tab
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Performance Tab */}
          {activeSubTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Performing Vehicles - NOW USING REAL FLEET DATA */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-gray-800">
                    <Truck className="w-4 h-4 text-blue-600" />
                    Top Performing Vehicles
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {sortedFleet.slice(0, 5).map((vehicle, idx) => (
                    <div key={vehicle.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? "bg-yellow-100 text-yellow-700" :
                          idx === 1 ? "bg-gray-200 text-gray-700" :
                          idx === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-mono text-sm text-gray-800">{vehicle.id}</p>
                          <p className="text-xs text-gray-500">{vehicle.makeModel || vehicle.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">{vehicle.healthScore || 90}</p>
                        <p className="text-xs text-gray-500">score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Drivers */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-gray-800">
                    <Users className="w-4 h-4 text-blue-600" />
                    Top Performing Drivers
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {driverPerformance.slice(0, 5).map((driver, idx) => (
                    <div key={driver.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? "bg-yellow-100 text-yellow-700" :
                          idx === 1 ? "bg-gray-200 text-gray-700" :
                          idx === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">{driver.name}</p>
                          <p className="text-xs text-gray-500">{driver.deliveries} deliveries • ⭐ {driver.rating}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">{driver.score}</p>
                        <p className="text-xs text-gray-500">score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fleet Utilization Chart */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm col-span-1 lg:col-span-2">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-gray-800">
                    <Target className="w-4 h-4 text-blue-600" />
                    Fleet Utilization Overview
                  </h3>
                </div>
                <div className="p-4">
                  <div className="h-64 flex items-center">
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={fleetUtilization}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            label={({ name, value }) => `${value}`}
                          >
                            {fleetUtilization.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-3">
                      {fleetUtilization.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ... (Fuel, Breakdowns, Efficiency tabs remain the same as previous code, no changes needed there) ... */}
          {activeSubTab === 'fuel' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <h3 className="text-sm font-medium flex items-center gap-2 text-gray-800 mb-4">
                  <Fuel className="w-4 h-4 text-blue-600" />
                  Fuel Consumption by Type (Liters)
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fuelUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                      <Legend />
                      <Area type="monotone" dataKey="diesel" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Diesel" />
                      <Area type="monotone" dataKey="cng" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="CNG" />
                      <Area type="monotone" dataKey="electric" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Electric" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          {/* ... Breakdowns and Efficiency tabs (same as previous) ... */}
        </div>
      </div>
    </div>
  );
};
// --- App Layout ---


// --- 2. LOCAL CACHE (Fixes "Weak System" / API Failures) ---
const KNOWN_LOCATIONS = {
    "nigdi": [18.6492, 73.7707],
    "akurdi": [18.6504, 73.7786],
    "chinchwad": [18.6298, 73.7997],
    "pimpri": [18.6298, 73.7997],
    "kothrud": [18.5074, 73.8077],
    "hinjewadi": [18.5913, 73.7389],
    "wakad": [18.5983, 73.7638],
    "baner": [18.5590, 73.7868],
    "aundh": [18.5635, 73.8075],
    "shivajinagar": [18.5314, 73.8446],
    "swargate": [18.5018, 73.8636],
    "camp": [18.5144, 73.8744],
    "viman nagar": [18.5679, 73.9143],
    "kharadi": [18.5514, 73.9348],
    "hadapsar": [18.5089, 73.9260],
    "magarpatta": [18.5158, 73.9272]
};

export default function SwarmSyncApp() {
  const [activeTab, setActiveTab] = useState('command');
  const [expandedMenus, setExpandedMenus] = useState({
    critical: true, 
    audit: false
  });
  const [isModalOpen, setModalOpen] = useState(false);
  
  // --- STATE MANAGEMENT ---
  const [vehicles, setVehicles] = useState(UNIFIED_FLEET_DATA); 
  const [globalSelectedVehicleId, setGlobalSelectedVehicleId] = useState(null);
  
  // Form State
  const [deliveryForm, setDeliveryForm] = useState({
    id: 'SHP-' + Math.floor(Math.random() * 10000),
    pickup: '',
    dropoff: '',
    type: 'Normal', 
    size: 0, 
  });

  // Optimization States
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LOGIC: 1. Hybrid Coordinate Fetching ---
  const fetchCoordinates = async (query) => {
    const q = query.toLowerCase().trim();
    
    // A. Check Local Cache (Instant)
    const cacheHit = Object.keys(KNOWN_LOCATIONS).find(key => q.includes(key));
    if (cacheHit) return KNOWN_LOCATIONS[cacheHit];

    // B. Fallback to API
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Pune")}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // --- LOGIC: 2. Check Optimization (Find Best Truck) ---
  const handleCheckOptimization = async () => {
    setIsChecking(true);
    setOptimizationResult(null);

    const pickupCoords = await fetchCoordinates(deliveryForm.pickup);
    
    // Simulate calculation delay for realism
    setTimeout(() => {
      let bestMatch = null;
      let minDistance = Infinity;

      // Algorithm: Find closest active truck with enough capacity
      if (pickupCoords) {
        vehicles.forEach(vehicle => {
          if (vehicle.status !== 'active') return;

          // Euclidean distance calc
          const dist = Math.sqrt(
            Math.pow(vehicle.coords[0] - pickupCoords[0], 2) + 
            Math.pow(vehicle.coords[1] - pickupCoords[1], 2)
          );

          // Capacity Check (Safe default to 100 if undefined)
          const vehicleCap = vehicle.capacityFree !== undefined ? vehicle.capacityFree : 100;
          const requiredCap = parseInt(deliveryForm.size || 0);

          if (dist < minDistance && vehicleCap >= requiredCap) {
            minDistance = dist;
            bestMatch = vehicle;
          }
        });
      }

      // Fallback: If no coords found, match by name string
      if (!bestMatch) {
         const searchTerm = deliveryForm.pickup.toLowerCase();
         bestMatch = vehicles.find(v => 
           v.status === 'active' && 
           v.locationName.toLowerCase().includes(searchTerm)
         );
      }

      // Ultimate Fallback: Just pick the first active one (for demo continuity)
      if (!bestMatch) bestMatch = vehicles.find(v => v.status === 'active');

      if (bestMatch) {
        const displayDist = pickupCoords ? (minDistance * 111).toFixed(1) : "2.5";
        const displayTime = pickupCoords ? Math.ceil(minDistance * 200) : "15";

        setOptimizationResult({
            found: true,
            vehicle: bestMatch,
            savings: `${displayDist}km / ${displayTime} mins`,
            reason: `Closest available truck at ${bestMatch.locationName} with capacity.`
        });
      } else {
        setOptimizationResult({
            found: false,
            reason: 'No active vehicles available with required capacity.'
        });
      }
      
      setIsChecking(false);
    }, 800); 
  };

  const resetForm = () => {
      setDeliveryForm({
        id: 'SHP-' + Math.floor(Math.random() * 10000),
        pickup: '',
        dropoff: '',
        type: 'Normal', 
        size: 0, 
      });
      setOptimizationResult(null);
      setIsChecking(false);
  };

  // --- LOGIC: 3. Confirm & Merge Routes (The "Greedy" Algorithm) ---
  const handleConfirmDelivery = async () => {
    if (isSubmitting || !optimizationResult?.vehicle) return;
    setIsSubmitting(true);

    try {
        const targetId = optimizationResult.vehicle.id;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Get Coords
        const pickupCoords = await fetchCoordinates(deliveryForm.pickup);
        const dropoffCoords = await fetchCoordinates(deliveryForm.dropoff);

        // Fallback coords
        const validPickup = pickupCoords || [optimizationResult.vehicle.coords[0] + 0.01, optimizationResult.vehicle.coords[1] + 0.01];
        const validDropoff = dropoffCoords || [validPickup[0] + 0.02, validPickup[1] + 0.01];

        // Update Fleet State
        setVehicles(prevVehicles => prevVehicles.map(v => {
            if (v.id === targetId) {
                // Mock update logic
                let newWaypoints = [v.coords, validPickup, validDropoff];
                if(v.destCoords) newWaypoints = [v.coords, validPickup, v.destCoords, validDropoff]; // Basic append for demo

                const newLogEntry = {
                    time: timestamp,
                    type: "reroute",
                    title: "Route Optimized",
                    desc: `New delivery (ID: ${deliveryForm.id}) added.`
                };

                return {
                    ...v,
                    waypoints: newWaypoints, // Assign new path
                    destCoords: validDropoff,
                    destinationName: deliveryForm.dropoff,
                    routeUpdates: [newLogEntry, ...(v.routeUpdates || [])],
                };
            }
            return v;
        }));

        setModalOpen(false);
        setGlobalSelectedVehicleId(targetId);
        resetForm();

    } catch (error) {
        console.error("Error confirming delivery:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- LAYOUT HELPERS ---
  const toggleExpand = (id) => {
    setExpandedMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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

  const renderContent = () => {
    switch (activeTab) {
      case 'command': return <DashboardView fleet={vehicles} setModalOpen={setModalOpen} activeVehicleId={globalSelectedVehicleId} onVehicleSelect={setGlobalSelectedVehicleId} />;
      case 'health': return <HealthView fleet={vehicles} setFleet={setVehicles} />; 
      case 'reallocation': return <ReallocationView fleet={vehicles} setFleet={setVehicles} />;
      case 'assistance': return <AssistanceView fleet={vehicles} setFleet={setVehicles} />;
      case 'blockage': return <RoadBlockageView />;
      case 'geofencing': return <GeofencingView />;
      case 'vehicles': return <VehiclesView vehicles={vehicles} />;
      case 'drivers': return <DriversView />;
      case 'analytics': return <AnalyticsView fleet={vehicles} />;
      default: return <DashboardView fleet={vehicles} setModalOpen={setModalOpen} activeVehicleId={globalSelectedVehicleId} onVehicleSelect={setGlobalSelectedVehicleId} />;
    }
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
                 if (item.type === 'header') return <div key={index} className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2 mt-4">{item.label}</div>;
                 const Icon = item.icon || React.Fragment;
                 const isExpanded = expandedMenus[item.id];
                 const isActive = activeTab === item.id;
                 const hasActiveChild = item.subItems?.some(sub => sub.id === activeTab);

                 if (item.hasSubmenu) {
                     return (
                         <div key={item.id} className="mb-1">
                             <button onClick={() => toggleExpand(item.id)} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${isActive || hasActiveChild ? 'text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                                 <div className="flex items-center gap-3"><Icon size={18} />{item.label}</div>
                                 <ChevronRight size={14} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                             </button>
                             <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-48' : 'max-h-0'}`}>
                                 <div className="bg-gray-50/50 pb-1">
                                     {item.subItems.map(sub => (
                                         <button key={sub.id} onClick={() => setActiveTab(sub.id)} className={`w-full flex items-center gap-3 text-left pl-11 pr-4 py-2 text-sm transition-colors ${activeTab === sub.id ? 'text-blue-600 font-medium bg-blue-50/50 border-r-4 border-blue-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
                                             {sub.label}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                         </div>
                     );
                 }
                 return (
                     <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors mb-1 ${isActive ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                         <Icon size={18} /> {item.label}
                     </button>
                 );
             })}
           </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div>{getBreadcrumb()}</div>
          <div className="flex items-center gap-4">
             {/* --- UPDATED: CONDITIONAL RENDERING FOR ADD DELIVERY BUTTON --- */}
             {activeTab === 'command' && (
                 <button onClick={() => { setModalOpen(true); resetForm(); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                   <Plus size={16} /> Add New Delivery
                 </button>
             )}
             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                <User size={16} className="text-gray-600"/>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50/50">
           {renderContent()}
        </main>
      </div>

      {/* Add Delivery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                 <Truck className="text-blue-600" size={20}/> Add New Delivery
               </h3>
               <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Shipment ID</label><input type="text" value={deliveryForm.id} readOnly className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 font-mono" /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Delivery Type</label><select className="w-full border border-gray-300 rounded px-3 py-2 text-sm" onChange={(e) => setDeliveryForm({...deliveryForm, type: e.target.value})}><option value="Normal">Normal Cargo</option><option value="Refrigerated">Refrigerated</option></select></div>
              </div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Pickup</label><input type="text" placeholder="e.g., Nigdi" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" onChange={(e) => setDeliveryForm({...deliveryForm, pickup: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Dropoff</label><input type="text" placeholder="e.g., Koramangala" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" onChange={(e) => setDeliveryForm({...deliveryForm, dropoff: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Load Size</label><input type="range" min="1" max="100" defaultValue="0" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" onChange={(e) => setDeliveryForm({...deliveryForm, size: e.target.value})} /></div>

              <div className="pt-2">
                 {!optimizationResult && !isChecking && (
                    <button onClick={handleCheckOptimization} disabled={!deliveryForm.pickup || deliveryForm.size < 1} className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors disabled:opacity-50">
                      Check Route Optimization & Availability
                    </button>
                 )}

                 {isChecking && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
                        <Loader2 size={16} className="animate-spin text-blue-600"/> Calculating route efficiency...
                    </div>
                 )}

                 {optimizationResult && (
                    <div className={`p-4 rounded-lg border ${optimizationResult.found ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-start gap-3">
                            {optimizationResult.found ? <CheckCircle2 className="text-emerald-600 mt-0.5" size={20}/> : <Info className="text-amber-600 mt-0.5" size={20}/>}
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${optimizationResult.found ? 'text-emerald-800' : 'text-amber-800'}`}>
                                    {optimizationResult.found ? 'Optimal Vehicle Found' : 'No Capacity Available'}
                                </h4>
                                
                                {optimizationResult.found && optimizationResult.vehicle && (
                                    <div className="mt-3 bg-white p-3 rounded border border-emerald-100 shadow-sm space-y-2">
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="font-bold text-gray-800">{optimizationResult.vehicle.id}</span>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">MATCH 98%</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Users size={12}/> {optimizationResult.vehicle.driver}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Truck size={12}/> {optimizationResult.vehicle.makeModel}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Fuel size={12}/> {optimizationResult.vehicle.fuelType}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Package size={12}/> Free: {optimizationResult.vehicle.capacityFree}%
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-emerald-600 font-medium">
                                            Efficiency: {optimizationResult.savings}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                 )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm font-medium hover:bg-gray-100">Cancel</button>
              <button onClick={handleConfirmDelivery} 
                        disabled={isSubmitting || !optimizationResult?.found}
                        className={`px-4 py-2 text-white rounded text-sm font-medium shadow-sm flex items-center gap-2 ${
                          (isSubmitting || !optimizationResult?.found)
                            ? 'bg-blue-600 hover:bg-blue-700 opacity-50 cursor-not-allowed' 
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {isSubmitting ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> Processing...
                            </>
                        ) : (
                            optimizationResult?.found ? 'Confirm & Merge Route' : 'Create New Delivery'
                        )}
                      </button>
            </div> 
          </div>
        </div>
      )}
    </div>
  );
}