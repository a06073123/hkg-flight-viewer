/**
 * Airport Data Service
 *
 * Provides airport code to name mapping for common destinations
 * from Hong Kong International Airport
 */

/**
 * Common airport codes and their names
 * Based on top destinations from HKIA
 */
export const AIRPORT_NAMES: Record<string, string> = {
	// Japan
	NRT: "Tokyo Narita",
	HND: "Tokyo Haneda",
	KIX: "Osaka Kansai",
	FUK: "Fukuoka",
	CTS: "Sapporo",
	NGO: "Nagoya",
	OKA: "Okinawa",

	// Korea
	ICN: "Seoul Incheon",
	GMP: "Seoul Gimpo",
	PUS: "Busan",
	CJU: "Jeju",

	// China Mainland
	PEK: "Beijing Capital",
	PKX: "Beijing Daxing",
	PVG: "Shanghai Pudong",
	SHA: "Shanghai Hongqiao",
	CAN: "Guangzhou",
	SZX: "Shenzhen",
	CTU: "Chengdu",
	TFU: "Chengdu Tianfu",
	CKG: "Chongqing",
	XIY: "Xi'an",
	KMG: "Kunming",
	NKG: "Nanjing",
	HGH: "Hangzhou",
	WUH: "Wuhan",
	CSX: "Changsha",
	TAO: "Qingdao",
	DLC: "Dalian",
	SHE: "Shenyang",
	TSN: "Tianjin",
	XMN: "Xiamen",
	FOC: "Fuzhou",
	NNG: "Nanning",
	HAK: "Haikou",
	SYX: "Sanya",
	HRB: "Harbin",
	CGO: "Zhengzhou",
	URC: "Urumqi",
	LHW: "Lanzhou",
	INC: "Yinchuan",
	TYN: "Taiyuan",
	HET: "Hohhot",
	KWE: "Guiyang",
	KWL: "Guilin",
	ZUH: "Zhuhai",

	// Taiwan
	TPE: "Taipei Taoyuan",
	TSA: "Taipei Songshan",
	KHH: "Kaohsiung",
	RMQ: "Taichung",

	// Southeast Asia
	SIN: "Singapore",
	BKK: "Bangkok Suvarnabhumi",
	DMK: "Bangkok Don Mueang",
	KUL: "Kuala Lumpur",
	MNL: "Manila",
	SGN: "Ho Chi Minh City",
	HAN: "Hanoi",
	DAD: "Da Nang",
	CGK: "Jakarta",
	DPS: "Bali Denpasar",
	SUB: "Surabaya",
	RGN: "Yangon",
	PNH: "Phnom Penh",
	REP: "Siem Reap",
	VTE: "Vientiane",
	CMB: "Colombo",
	MLE: "Malé",

	// South Asia
	DEL: "Delhi",
	BOM: "Mumbai",
	MAA: "Chennai",
	BLR: "Bangalore",
	CCU: "Kolkata",
	HYD: "Hyderabad",
	DAC: "Dhaka",
	KTM: "Kathmandu",

	// Middle East
	DXB: "Dubai",
	AUH: "Abu Dhabi",
	DOH: "Doha",
	RUH: "Riyadh",
	JED: "Jeddah",
	TLV: "Tel Aviv",
	AMM: "Amman",
	BAH: "Bahrain",
	KWI: "Kuwait",
	MCT: "Muscat",

	// Europe
	LHR: "London Heathrow",
	LGW: "London Gatwick",
	CDG: "Paris CDG",
	FRA: "Frankfurt",
	AMS: "Amsterdam",
	MUC: "Munich",
	ZRH: "Zurich",
	FCO: "Rome",
	MXP: "Milan",
	MAD: "Madrid",
	BCN: "Barcelona",
	VIE: "Vienna",
	CPH: "Copenhagen",
	ARN: "Stockholm",
	HEL: "Helsinki",
	OSL: "Oslo",
	DUB: "Dublin",
	MAN: "Manchester",
	IST: "Istanbul",
	ATH: "Athens",
	PRG: "Prague",
	BRU: "Brussels",
	WAW: "Warsaw",
	BUD: "Budapest",
	LED: "St Petersburg",
	SVO: "Moscow Sheremetyevo",
	DME: "Moscow Domodedovo",

	// Oceania
	SYD: "Sydney",
	MEL: "Melbourne",
	BNE: "Brisbane",
	PER: "Perth",
	AKL: "Auckland",
	CHC: "Christchurch",

	// North America
	LAX: "Los Angeles",
	SFO: "San Francisco",
	JFK: "New York JFK",
	EWR: "Newark",
	ORD: "Chicago",
	YVR: "Vancouver",
	YYZ: "Toronto",
	SEA: "Seattle",
	BOS: "Boston",
	DFW: "Dallas",
	IAH: "Houston",
	ATL: "Atlanta",
	MIA: "Miami",
	LAS: "Las Vegas",
	HNL: "Honolulu",

	// South America
	GRU: "São Paulo",
	EZE: "Buenos Aires",
	SCL: "Santiago",
	BOG: "Bogotá",
	LIM: "Lima",
	MEX: "Mexico City",

	// Africa
	JNB: "Johannesburg",
	CPT: "Cape Town",
	CAI: "Cairo",
	ADD: "Addis Ababa",
	NBO: "Nairobi",
	CMN: "Casablanca",
	MRU: "Mauritius",

	// Central Asia
	GYD: "Baku",
	TAS: "Tashkent",
	ALA: "Almaty",
	NQZ: "Astana",

	// Cargo Hubs
	LEJ: "Leipzig",
	CGN: "Cologne",
	LUX: "Luxembourg",
	ANC: "Anchorage",
	CVG: "Cincinnati",
	MEM: "Memphis",
	SDF: "Louisville",
};

/**
 * Get airport name by IATA code
 * Returns the code itself if name is not found
 */
export function getAirportName(code: string): string {
	return AIRPORT_NAMES[code] || code;
}

/**
 * Format airport display with code and name
 */
export function formatAirport(code: string): { code: string; name: string } {
	return {
		code,
		name: AIRPORT_NAMES[code] || "",
	};
}
