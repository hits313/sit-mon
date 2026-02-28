import { useState, useEffect } from 'react';

export interface MilitaryBase {
  id: string;
  name: string;
  country: string;
  type: 'AIR' | 'NAVAL' | 'ARMY' | 'JOINT';
  coordinates: [number, number]; // lat, lon
}

const BASES: MilitaryBase[] = [
  // USA
  { id: 'us-ramstein', name: 'Ramstein Air Base', country: 'USA', type: 'AIR', coordinates: [49.4396, 7.6056] },
  { id: 'us-guam', name: 'Andersen AFB', country: 'USA', type: 'AIR', coordinates: [13.5841, 144.9244] },
  { id: 'us-diego', name: 'Diego Garcia', country: 'USA', type: 'JOINT', coordinates: [-7.3195, 72.4229] },
  { id: 'us-pearl', name: 'Pearl Harbor', country: 'USA', type: 'NAVAL', coordinates: [21.3445, -157.9748] },
  { id: 'us-norfolk', name: 'Naval Station Norfolk', country: 'USA', type: 'NAVAL', coordinates: [36.9450, -76.3270] },
  { id: 'us-kadena', name: 'Kadena Air Base', country: 'USA', type: 'AIR', coordinates: [26.3556, 127.7675] },
  { id: 'us-yokosuka', name: 'Yokosuka Naval Base', country: 'USA', type: 'NAVAL', coordinates: [35.2931, 139.6625] },
  { id: 'us-osan', name: 'Osan Air Base', country: 'USA', type: 'AIR', coordinates: [37.0925, 127.0303] },
  { id: 'us-lakenheath', name: 'RAF Lakenheath', country: 'USA', type: 'AIR', coordinates: [52.4094, 0.5606] },
  { id: 'us-aviano', name: 'Aviano Air Base', country: 'USA', type: 'AIR', coordinates: [46.0319, 12.5964] },
  { id: 'us-thule', name: 'Thule Air Base', country: 'USA', type: 'AIR', coordinates: [76.5311, -68.7032] },
  { id: 'us-edwards', name: 'Edwards AFB', country: 'USA', type: 'AIR', coordinates: [34.9055, -117.8836] },
  { id: 'us-nellis', name: 'Nellis AFB', country: 'USA', type: 'AIR', coordinates: [36.2361, -115.0342] },
  { id: 'us-whiteman', name: 'Whiteman AFB', country: 'USA', type: 'AIR', coordinates: [38.7303, -93.5478] },
  { id: 'us-barksdale', name: 'Barksdale AFB', country: 'USA', type: 'AIR', coordinates: [32.5019, -93.6661] },

  // RUSSIA
  { id: 'ru-tartus', name: 'Tartus Naval Facility', country: 'RUSSIA', type: 'NAVAL', coordinates: [34.9126, 35.8753] },
  { id: 'ru-hmeimim', name: 'Hmeimim Air Base', country: 'RUSSIA', type: 'AIR', coordinates: [35.4111, 35.9456] },
  { id: 'ru-sevastopol', name: 'Sevastopol Naval Base', country: 'RUSSIA', type: 'NAVAL', coordinates: [44.6166, 33.5254] },
  { id: 'ru-engels', name: 'Engels-2 Air Base', country: 'RUSSIA', type: 'AIR', coordinates: [51.4833, 46.2167] },
  { id: 'ru-murmansk', name: 'Severomorsk Naval Base', country: 'RUSSIA', type: 'NAVAL', coordinates: [69.0833, 33.4167] },
  { id: 'ru-vladivostok', name: 'Vladivostok Naval Base', country: 'RUSSIA', type: 'NAVAL', coordinates: [43.1155, 131.8855] },
  { id: 'ru-plesetsk', name: 'Plesetsk Cosmodrome', country: 'RUSSIA', type: 'JOINT', coordinates: [62.9278, 40.5750] },
  { id: 'ru-kaliningrad', name: 'Chkalovsk Naval Air Base', country: 'RUSSIA', type: 'AIR', coordinates: [54.7667, 20.4000] },

  // CHINA
  { id: 'cn-djibouti', name: 'PLA Support Base', country: 'CHINA', type: 'JOINT', coordinates: [11.5950, 43.0650] },
  { id: 'cn-yulin', name: 'Yulin Naval Base', country: 'CHINA', type: 'NAVAL', coordinates: [18.2094, 109.6833] },
  { id: 'cn-shanghai', name: 'Jiangnan Shipyard', country: 'CHINA', type: 'NAVAL', coordinates: [31.3500, 121.7333] },
  { id: 'cn-fian', name: 'Fiery Cross Reef', country: 'CHINA', type: 'JOINT', coordinates: [9.5500, 112.8833] },
  { id: 'cn-subi', name: 'Subi Reef', country: 'CHINA', type: 'JOINT', coordinates: [10.9167, 114.0667] },
  { id: 'cn-mischief', name: 'Mischief Reef', country: 'CHINA', type: 'JOINT', coordinates: [9.9167, 115.5333] },
  { id: 'cn-dingxin', name: 'Dingxin Air Base', country: 'CHINA', type: 'AIR', coordinates: [40.4139, 99.7833] },

  // UK
  { id: 'uk-akrotiri', name: 'RAF Akrotiri', country: 'UK', type: 'AIR', coordinates: [34.5886, 32.9868] },
  { id: 'uk-brize', name: 'RAF Brize Norton', country: 'UK', type: 'AIR', coordinates: [51.7500, -1.5833] },
  { id: 'uk-portsmouth', name: 'HMNB Portsmouth', country: 'UK', type: 'NAVAL', coordinates: [50.8058, -1.1078] },
  { id: 'uk-falklands', name: 'RAF Mount Pleasant', country: 'UK', type: 'AIR', coordinates: [-51.8228, -58.4472] },

  // FRANCE
  { id: 'fr-djibouti', name: 'Camp Lemonnier', country: 'FRANCE', type: 'JOINT', coordinates: [11.5450, 43.1480] },
  { id: 'fr-toulon', name: 'Toulon Arsenal', country: 'FRANCE', type: 'NAVAL', coordinates: [43.1206, 5.9206] },
  { id: 'fr-uae', name: 'Camp de la Paix', country: 'FRANCE', type: 'JOINT', coordinates: [24.4333, 54.4667] },

  // IRAN
  { id: 'ir-bandar', name: 'Bandar Abbas Naval Base', country: 'IRAN', type: 'NAVAL', coordinates: [27.1494, 56.2250] },
  { id: 'ir-esfahan', name: 'Shahid Vaten Pour Air Base', country: 'IRAN', type: 'AIR', coordinates: [32.6183, 51.6933] },
  { id: 'ir-bushehr', name: 'Bushehr Air Base', country: 'IRAN', type: 'AIR', coordinates: [28.9733, 50.8386] },
  { id: 'ir-tehran', name: 'Mehrabad Air Base', country: 'IRAN', type: 'AIR', coordinates: [35.6892, 51.3133] },

  // ISRAEL
  { id: 'il-telnof', name: 'Tel Nof Airbase', country: 'ISRAEL', type: 'AIR', coordinates: [31.8394, 34.8236] },
  { id: 'il-ramat', name: 'Ramat David Airbase', country: 'ISRAEL', type: 'AIR', coordinates: [32.6636, 35.1783] },
  { id: 'il-nevatim', name: 'Nevatim Airbase', country: 'ISRAEL', type: 'AIR', coordinates: [31.2097, 35.0125] },
  { id: 'il-haifa', name: 'Haifa Naval Base', country: 'ISRAEL', type: 'NAVAL', coordinates: [32.8258, 34.9967] },

  // OTHERS
  { id: 'tr-incirlik', name: 'Incirlik Air Base', country: 'TURKEY', type: 'AIR', coordinates: [37.0019, 35.4258] },
  { id: 'qa-udeid', name: 'Al Udeid Air Base', country: 'QATAR', type: 'AIR', coordinates: [25.1181, 51.3153] },
  { id: 'jp-yokota', name: 'Yokota Air Base', country: 'JAPAN', type: 'AIR', coordinates: [35.7486, 139.3486] },
  { id: 'kr-osan', name: 'Osan Air Base', country: 'SOUTH KOREA', type: 'AIR', coordinates: [37.0925, 127.0303] },
  { id: 'in-ambala', name: 'Ambala Air Force Station', country: 'INDIA', type: 'AIR', coordinates: [30.3683, 76.8125] },
  { id: 'in-mumbai', name: 'INS Mumbai', country: 'INDIA', type: 'NAVAL', coordinates: [18.9256, 72.8411] },
  { id: 'sa-prince', name: 'Prince Sultan Air Base', country: 'SAUDI ARABIA', type: 'AIR', coordinates: [24.0606, 47.5689] },
  
  // EUROPE (Expanded)
  { id: 'de-spangdahlem', name: 'Spangdahlem Air Base', country: 'GERMANY', type: 'AIR', coordinates: [49.9753, 6.6933] },
  { id: 'de-grafenwoehr', name: 'Grafenwoehr Training Area', country: 'GERMANY', type: 'ARMY', coordinates: [49.7167, 11.9000] },
  { id: 'it-sigonella', name: 'NAS Sigonella', country: 'ITALY', type: 'NAVAL', coordinates: [37.4019, 14.9211] },
  { id: 'it-naples', name: 'NSA Naples', country: 'ITALY', type: 'NAVAL', coordinates: [40.8833, 14.2833] },
  { id: 'es-rota', name: 'Naval Station Rota', country: 'SPAIN', type: 'NAVAL', coordinates: [36.6453, -6.3428] },
  { id: 'es-moron', name: 'Morón Air Base', country: 'SPAIN', type: 'AIR', coordinates: [37.1769, -5.6158] },
  { id: 'gr-souda', name: 'Souda Bay', country: 'GREECE', type: 'NAVAL', coordinates: [35.4933, 24.1500] },
  { id: 'no-orland', name: 'Orland Main Air Station', country: 'NORWAY', type: 'AIR', coordinates: [63.7000, 9.6000] },
  { id: 'pl-lask', name: 'Lask Air Base', country: 'POLAND', type: 'AIR', coordinates: [51.5517, 19.1792] },

  // ASIA (Expanded)
  { id: 'jp-misawa', name: 'Misawa Air Base', country: 'JAPAN', type: 'AIR', coordinates: [40.7017, 141.3664] },
  { id: 'jp-iwakuni', name: 'MCAS Iwakuni', country: 'JAPAN', type: 'AIR', coordinates: [34.1439, 132.2356] },
  { id: 'jp-sasebo', name: 'Sasebo Naval Base', country: 'JAPAN', type: 'NAVAL', coordinates: [33.1667, 129.7167] },
  { id: 'kr-kunsan', name: 'Kunsan Air Base', country: 'SOUTH KOREA', type: 'AIR', coordinates: [35.9036, 126.6158] },
  { id: 'kr-humphreys', name: 'Camp Humphreys', country: 'SOUTH KOREA', type: 'ARMY', coordinates: [36.9667, 127.0167] },
  { id: 'in-hindon', name: 'Hindon Air Force Station', country: 'INDIA', type: 'AIR', coordinates: [28.7083, 77.3611] },
  { id: 'in-karwar', name: 'INS Kadamba', country: 'INDIA', type: 'NAVAL', coordinates: [14.7667, 74.1500] },
  { id: 'pk-sargodha', name: 'PAF Base Mushaf', country: 'PAKISTAN', type: 'AIR', coordinates: [32.0417, 72.6722] },
  { id: 'pk-karachi', name: 'PNS Mehran', country: 'PAKISTAN', type: 'NAVAL', coordinates: [24.8833, 67.1167] },
  { id: 'tw-hualien', name: 'Chiashan Air Force Base', country: 'TAIWAN', type: 'AIR', coordinates: [24.0250, 121.6167] },
  { id: 'sg-changi', name: 'Changi Naval Base', country: 'SINGAPORE', type: 'NAVAL', coordinates: [1.3167, 104.0333] },
  { id: 'au-darwin', name: 'RAAF Base Darwin', country: 'AUSTRALIA', type: 'AIR', coordinates: [-12.4147, 130.8767] },
  { id: 'au-tindal', name: 'RAAF Base Tindal', country: 'AUSTRALIA', type: 'AIR', coordinates: [-14.5211, 132.3778] },

  // AMERICAS (Expanded)
  { id: 'br-natal', name: 'Natal Air Force Base', country: 'BRAZIL', type: 'AIR', coordinates: [-5.9111, -35.2478] },
  { id: 'ca-coldlake', name: 'CFB Cold Lake', country: 'CANADA', type: 'AIR', coordinates: [54.4050, -110.2794] },
  { id: 'ca-halifax', name: 'CFB Halifax', country: 'CANADA', type: 'NAVAL', coordinates: [44.6569, -63.5756] },
];

export function useMilitaryBases() {
  const [bases, setBases] = useState<MilitaryBase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async load
    setTimeout(() => {
      setBases(BASES);
      setLoading(false);
    }, 500);
  }, []);

  return { bases, loading };
}
