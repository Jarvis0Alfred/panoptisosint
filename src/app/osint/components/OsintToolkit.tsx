"use client";

import { useState, useCallback } from "react";
import {
    Search,
    Phone,
    Mail,
    User,
    Image,
    Globe,
    Shield,
    Bitcoin,
    Car,
    Building2,
    FileSearch,
    MessageSquare,
    Radar,
    Database,
    ExternalLink,
    Copy,
    Check,
    AlertTriangle,
    Info,
    Clock,
    Newspaper,
    BookOpen,
    Radio,
    Landmark,
    Home,
    FileText,
    Code,
    MapPin,
    Video,
} from "lucide-react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────

interface OsintTool {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    url: string;
    freeTier: string;
    paidTier?: string;
    requiresKey: boolean;
    keyName?: string;
    inputType: "text" | "phone" | "email" | "username" | "image" | "domain" | "ip" | "hash" | "wallet" | "plate";
    placeholder: string;
    tip: string;
}

interface OsintCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
}

// ─── Categories ─────────────────────────────────────────────

const CATEGORIES: OsintCategory[] = [
    { id: "person", name: "Person OSINT", icon: "User", description: "Phone, email, social profiles, images" },
    { id: "digital", name: "Digital Identity", icon: "Globe", description: "Domains, DNS, IPs, SSL, certificates" },
    { id: "financial", name: "Financial OSINT", icon: "Bitcoin", description: "Crypto wallets, transactions, exchanges" },
    { id: "threat", name: "Threat Intel", icon: "Shield", description: "Malware, IPs, dark web, breaches" },
    { id: "physical", name: "Physical OSINT", icon: "Car", description: "Vehicles, geolocation, EXIF, cameras" },
    { id: "business", name: "Business", icon: "Building2", description: "Companies, directors, registries" },
    { id: "archives", name: "Archives", icon: "Clock", description: "Web history, snapshots" },
    { id: "social-deep", name: "Social Deep", icon: "Video", description: "Deep social media" },
    { id: "geospatial", name: "Geospatial", icon: "MapPin", description: "Maps, satellite" },
    { id: "developer", name: "Developer", icon: "Code", description: "GitHub, code repos" },
    { id: "documents", name: "Documents", icon: "FileText", description: "Leaked docs" },
    { id: "legal", name: "Court & Legal", icon: "Landmark", description: "Case law" },
    { id: "realestate", name: "Real Estate", icon: "Home", description: "Property records" },
    { id: "patents", name: "Patents", icon: "ScanLine", description: "Trademarks, IP" },
    { id: "academic", name: "Academic", icon: "BookOpen", description: "Papers, researchers" },
    { id: "news", name: "News & Media", icon: "Newspaper", description: "News monitoring" },
    { id: "radio", name: "Radio & Comms", icon: "Radio", description: "Flight, marine, police" },
];

// ─── Tools Database ─────────────────────────────────────────

const TOOLS: OsintTool[] = [
    // Person OSINT
    {
        id: "sherlock",
        name: "Sherlock",
        description: "Search username across 400+ social platforms. The gold standard for username enumeration.",
        category: "person",
        icon: "Search",
        url: "https://github.com/sherlock-project/sherlock",
        freeTier: "Unlimited (self-hosted)",
        requiresKey: false,
        inputType: "username",
        placeholder: "Enter username (e.g., johndoe123)",
        tip: "Try variations: johndoe, john_doe, j.doe. Check archived results on Wayback Machine.",
    },
    {
        id: "whatsmyname",
        name: "WhatsMyName",
        description: "Web-based username search across 600+ sites. No install needed.",
        category: "person",
        icon: "User",
        url: "https://whatsmyname.app",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "username",
        placeholder: "Enter username",
        tip: "Combine with Sherlock for maximum coverage. Export results for cross-reference.",
    },
    {
        id: "hunter",
        name: "Hunter.io",
        description: "Find and verify professional email addresses. Domain search for company contacts.",
        category: "person",
        icon: "Mail",
        url: "https://hunter.io",
        freeTier: "25 searches/month",
        paidTier: "$49/month",
        requiresKey: true,
        keyName: "HUNTER_API_KEY",
        inputType: "email",
        placeholder: "Enter email or domain (e.g., sitesmiths.gr)",
        tip: "Pattern finder guesses emails: {first}@{domain}, {f.last}@{domain}. Verify before using.",
    },
    {
        id: "haveibeenpwned",
        name: "Have I Been Pwned",
        description: "Check if email/phone/username appeared in data breaches. Free API available.",
        category: "person",
        icon: "Database",
        url: "https://haveibeenpwned.com",
        freeTier: "1.5M requests/day (API)",
        requiresKey: true,
        keyName: "HIBP_API_KEY",
        inputType: "email",
        placeholder: "Enter email address",
        tip: "Use k-anonymity endpoint for privacy: only send first 5 chars of SHA-1 hash.",
    },
    {
        id: "dehashed",
        name: "DeHashed",
        description: "Search breached databases. Find passwords, IPs, emails, usernames from leaks.",
        category: "person",
        icon: "Database",
        url: "https://dehashed.com",
        freeTier: "Limited",
        paidTier: "$7.49/month",
        requiresKey: true,
        keyName: "DEHASHED_API_KEY",
        inputType: "text",
        placeholder: "Email, username, IP, or password",
        tip: "Use quotes for exact matches. Filter by source with 'source:linkedin' syntax.",
    },
    {
        id: "intelx",
        name: "Intelligence X",
        description: "Search leaked data, dark web, public records. Historical snapshots of any URL.",
        category: "person",
        icon: "FileSearch",
        url: "https://intelx.io",
        freeTier: "100 results/day",
        paidTier: "Pay-per-use",
        requiresKey: true,
        keyName: "INTELX_API_KEY",
        inputType: "text",
        placeholder: "Email, domain, URL, Bitcoin address, IP",
        tip: "Use selectors: email:, domain:, ip:, btc:. Search dark web with 'dark web' filter.",
    },
    {
        id: "numverify",
        name: "Numverify",
        description: "Validate phone numbers. Get carrier, location, line type, country.",
        category: "person",
        icon: "Phone",
        url: "https://numverify.com",
        freeTier: "100/month",
        paidTier: "$14.99/month",
        requiresKey: true,
        keyName: "NUMVERIFY_API_KEY",
        inputType: "phone",
        placeholder: "+1234567890 (include country code)",
        tip: "Always include country code. Line type reveals: mobile vs landline vs VoIP.",
    },
    {
        id: "twilio-lookup",
        name: "Twilio Lookup",
        description: "Carrier info, caller name, SIM swap risk. Telco-grade data.",
        category: "person",
        icon: "Phone",
        url: "https://twilio.com/lookup",
        freeTier: "100 requests",
        paidTier: "$0.005/lookup",
        requiresKey: true,
        keyName: "TWILIO_AUTH_TOKEN",
        inputType: "phone",
        placeholder: "+1234567890",
        tip: "Caller ID lookup costs extra. Carrier lookup is cheapest option.",
    },
    {
        id: "truecaller",
        name: "Truecaller",
        description: "Caller ID and spam detection. Community-powered phone directory.",
        category: "person",
        icon: "Phone",
        url: "https://truecaller.com",
        freeTier: "Limited (app required)",
        paidTier: "€2.99/month",
        requiresKey: false,
        inputType: "phone",
        placeholder: "+1234567890",
        tip: "Reverse search: upload contact lists to find names. Privacy concerns apply.",
    },
    {
        id: "yandex-images",
        name: "Yandex Images",
        description: "Reverse image search with superior facial recognition. Better than Google for faces.",
        category: "person",
        icon: "Image",
        url: "https://yandex.com/images",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "image",
        placeholder: "Upload image or paste URL",
        tip: "Best for finding similar faces, profile pictures, and photo sources. Use cropped close-ups.",
    },
    {
        id: "tineye",
        name: "TinEye",
        description: "Reverse image search. Find where an image appears online. 66+ billion images indexed.",
        category: "person",
        icon: "Image",
        url: "https://tineye.com",
        freeTier: "150 searches/day",
        paidTier: "Pay-per-use",
        requiresKey: false,
        inputType: "image",
        placeholder: "Upload image or paste URL",
        tip: "Sort by 'Oldest' to find original source. Compare match percentage.",
    },
    {
        id: "facecheck",
        name: "FaceCheck.ID",
        description: "AI facial recognition search. Find photos of a person across the web.",
        category: "person",
        icon: "Image",
        url: "https://facecheck.id",
        freeTier: "20 searches/month",
        paidTier: "$9/month",
        requiresKey: false,
        inputType: "image",
        placeholder: "Upload a face photo",
        tip: "Clear frontal photos work best. Multiple angles improve results. Check for false positives.",
    },
    {
        id: "pimeyes",
        name: "Pimeyes",
        description: "Advanced facial recognition. Deep search across billions of photos.",
        category: "person",
        icon: "Image",
        url: "https://pimeyes.com",
        freeTier: "Limited",
        paidTier: "€29.99/month",
        requiresKey: false,
        inputType: "image",
        placeholder: "Upload a face photo",
        tip: "Premium tier shows source URLs. Use for serious investigations only. Privacy sensitive.",
    },
    // Digital Identity
    {
        id: "whoisxml",
        name: "WHOISXML API",
        description: "Domain WHOIS, DNS, IP, SSL lookups. Comprehensive domain intelligence.",
        category: "digital",
        icon: "Globe",
        url: "https://whoisxmlapi.com",
        freeTier: "500 requests/month",
        paidTier: "$15/month",
        requiresKey: true,
        keyName: "WHOISXML_API_KEY",
        inputType: "domain",
        placeholder: "example.com",
        tip: "Historical WHOIS shows previous owners. Reverse WHOIS finds all domains by email/owner.",
    },
    {
        id: "dnsdumpster",
        name: "DNSDumpster",
        description: "DNS reconnaissance. Maps subdomains, MX, NS, TXT records visually.",
        category: "digital",
        icon: "Globe",
        url: "https://dnsdumpster.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "domain",
        placeholder: "example.com",
        tip: "Look for dev/staging subdomains. MX records reveal email provider. SPF/DKIM in TXT.",
    },
    {
        id: "securitytrails",
        name: "SecurityTrails",
        description: "DNS history, domain associations, IP neighbors. Historical DNS data.",
        category: "digital",
        icon: "Globe",
        url: "https://securitytrails.com",
        freeTier: "50 queries/month",
        paidTier: "$50/month",
        requiresKey: true,
        keyName: "SECURITYTRAILS_API_KEY",
        inputType: "domain",
        placeholder: "example.com or IP address",
        tip: "Historical DNS shows infrastructure changes. Associated domains reveal related projects.",
    },
    {
        id: "shodan",
        name: "Shodan",
        description: "Search engine for internet-connected devices. Webcams, routers, servers, ICS.",
        category: "digital",
        icon: "Radar",
        url: "https://shodan.io",
        freeTier: "100 results/month",
        paidTier: "$59/month",
        requiresKey: true,
        keyName: "SHODAN_API_KEY",
        inputType: "text",
        placeholder: "IP, domain, or query (e.g., webcam, apache)",
        tip: "Filters: country:GR, org:'OTE', ssl:'sitesmiths.gr'. Use Shodan Monitor for alerts.",
    },
    {
        id: "censys",
        name: "Censys",
        description: "Internet asset search. Hosts, certificates, services. Academic-grade data.",
        category: "digital",
        icon: "Radar",
        url: "https://censys.io",
        freeTier: "250 queries/month",
        paidTier: "$99/month",
        requiresKey: true,
        keyName: "CENSYS_API_KEY",
        inputType: "text",
        placeholder: "IP, domain, or search query",
        tip: "Certificate search reveals all domains on same infrastructure. Search by ASN for ISP ranges.",
    },
    {
        id: "virustotal",
        name: "VirusTotal",
        description: "File/hash/URL/IP/domain reputation. Multi-engine malware scanning.",
        category: "threat",
        icon: "Shield",
        url: "https://virustotal.com",
        freeTier: "4 requests/min",
        paidTier: "€785/year (enterprise)",
        requiresKey: true,
        keyName: "VIRUSTOTAL_API_KEY",
        inputType: "hash",
        placeholder: "Hash (MD5/SHA1/SHA256), URL, IP, or domain",
        tip: "Community comments often reveal context. Check 'Relations' for connected indicators. 'Graph' shows campaign links.",
    },
    {
        id: "crtsh",
        name: "Crt.sh",
        description: "Certificate Transparency logs. Find all SSL certificates for a domain.",
        category: "digital",
        icon: "Globe",
        url: "https://crt.sh",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "domain",
        placeholder: "%example.com (wildcards supported)",
        tip: "Wildcard search %domain finds subdomains. Monitor new certs for infrastructure changes.",
    },
    {
        id: "ipinfo",
        name: "IPinfo",
        description: "IP geolocation, ASN, carrier, VPN/proxy detection. Accurate and fast.",
        category: "digital",
        icon: "Globe",
        url: "https://ipinfo.io",
        freeTier: "50,000/month",
        paidTier: "$99/month",
        requiresKey: true,
        keyName: "IPINFO_API_KEY",
        inputType: "ip",
        placeholder: "192.168.1.1",
        tip: "Privacy Detection API flags VPN, proxy, hosting. ASN reveals ISP/organization.",
    },
    {
        id: "ip-api",
        name: "IP-API",
        description: "Free IP geolocation. No key required for non-commercial use.",
        category: "digital",
        icon: "Globe",
        url: "https://ip-api.com",
        freeTier: "45 requests/min (non-commercial)",
        paidTier: "$15/month (pro)",
        requiresKey: false,
        inputType: "ip",
        placeholder: "192.168.1.1",
        tip: "Batch requests supported with JSON. Fields: lat, lon, org, as, mobile, proxy.",
    },
    {
        id: "abuseipdb",
        name: "AbuseIPDB",
        description: "IP reputation and abuse reports. Community-driven threat intelligence.",
        category: "threat",
        icon: "Shield",
        url: "https://abuseipdb.com",
        freeTier: "1,000 checks/day",
        paidTier: "Donation-based",
        requiresKey: true,
        keyName: "ABUSEIPDB_API_KEY",
        inputType: "ip",
        placeholder: "192.168.1.1",
        tip: "Confidence score 0-100. Categories: brute force, DDoS, hacking, spam. Report malicious IPs.",
    },
    // Financial OSINT
    {
        id: "etherscan",
        name: "Etherscan",
        description: "Ethereum blockchain explorer. Transactions, wallets, contracts, tokens.",
        category: "financial",
        icon: "Bitcoin",
        url: "https://etherscan.io",
        freeTier: "5 calls/sec",
        paidTier: "$199/month",
        requiresKey: true,
        keyName: "ETHERSCAN_API_KEY",
        inputType: "wallet",
        placeholder: "0x... (Ethereum address)",
        tip: "Token transfers reveal exchange usage. Contract interactions show DeFi activity. Tag known addresses.",
    },
    {
        id: "blockchain",
        name: "Blockchain.com",
        description: "Bitcoin explorer. Track transactions, wallets, mining pools.",
        category: "financial",
        icon: "Bitcoin",
        url: "https://blockchain.com/explorer",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "wallet",
        placeholder: "bc1q... or 1A... (Bitcoin address)",
        tip: "Clustering groups addresses by common inputs. Transaction graph shows money flow. Watch-only wallets.",
    },
    {
        id: "blockchair",
        name: "Blockchair",
        description: "Multi-chain explorer. Bitcoin, Ethereum, Ripple, Litecoin, Cardano, and more.",
        category: "financial",
        icon: "Bitcoin",
        url: "https://blockchair.com",
        freeTier: "1440 calls/day",
        paidTier: "Pay-per-use",
        requiresKey: true,
        keyName: "BLOCKCHAIR_API_KEY",
        inputType: "wallet",
        placeholder: "Wallet address or transaction hash",
        tip: "Search across 17 blockchains. Privacy-o-meter scores transaction traceability.",
    },
    {
        id: "arkham",
        name: "Arkham Intelligence",
        description: "Crypto entity labeling. Link wallets to exchanges, funds, individuals.",
        category: "financial",
        icon: "Bitcoin",
        url: "https://arkhamintelligence.com",
        freeTier: "Limited",
        paidTier: "Custom",
        requiresKey: true,
        keyName: "ARKHAM_API_KEY",
        inputType: "wallet",
        placeholder: "0x... or bc1q...",
        tip: "Entity labels reveal exchange deposits/withdrawals. Visualizer shows transaction flows. Intel exchange.",
    },
    // Threat Intel
    {
        id: "urlhaus",
        name: "URLhaus",
        description: "Malware distribution sites database. Submit and query malicious URLs.",
        category: "threat",
        icon: "Shield",
        url: "https://urlhaus.abuse.ch",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "URL or hash",
        tip: "Download malware samples for analysis. API returns JSON with tags, payloads, signatures.",
    },
    {
        id: "threatfox",
        name: "ThreatFox",
        description: "IOC sharing platform. Indicators of compromise from security community.",
        category: "threat",
        icon: "Shield",
        url: "https://threatfox.abuse.ch",
        freeTier: "Unlimited",
        requiresKey: true,
        keyName: "THREATFOX_API_KEY",
        inputType: "text",
        placeholder: "IP, domain, URL, hash, or IOC",
        tip: "Search by malware family. Export to MISP. Query recent IOCs by tag or reporter.",
    },
    {
        id: "malwarebazaar",
        name: "MalwareBazaar",
        description: "Malware sample database. Download and analyze malware samples.",
        category: "threat",
        icon: "Shield",
        url: "https://bazaar.abuse.ch",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "hash",
        placeholder: "SHA256 hash of malware sample",
        tip: "Download samples in password-protected ZIP (infected). YARA rules for detection. Upload samples.",
    },
    {
        id: "greynoise",
        name: "GreyNoise",
        description: "Internet noise filtering. Separate benign scanning from targeted attacks.",
        category: "threat",
        icon: "Shield",
        url: "https://greynoise.io",
        freeTier: "Community (limited)",
        paidTier: "$99/month",
        requiresKey: true,
        keyName: "GREYNOISE_API_KEY",
        inputType: "ip",
        placeholder: "192.168.1.1",
        tip: "Tags show scanning purpose: SSH brute force, Telnet exploitation, Mirai variant.",
    },
    {
        id: "emergingthreats",
        name: "EmergingThreats",
        description: "Open Suricata/Snort rules. Track compromised IPs, malware C2.",
        category: "threat",
        icon: "Shield",
        url: "https://rules.emergingthreats.net",
        freeTier: "Unlimited (open rules)",
        requiresKey: false,
        inputType: "ip",
        placeholder: "192.168.1.1",
        tip: "Download ruleset for IDS/IPS. Categories: malware, compromised, botnet, policy violation.",
    },
    // Physical OSINT
    {
        id: "exiftool",
        name: "ExifTool",
        description: "Extract metadata from photos. GPS, camera model, timestamps, software.",
        category: "physical",
        icon: "Image",
        url: "https://exiftool.org",
        freeTier: "Unlimited (command-line)",
        requiresKey: false,
        inputType: "image",
        placeholder: "Upload image file",
        tip: "Look for GPSLatitude, GPSLongitude. Camera serial in ImageUniqueID. Software reveals editing history.",
    },
    {
        id: "pic2map",
        name: "Pic2Map",
        description: "Extract GPS coordinates from photos online. No install needed.",
        category: "physical",
        icon: "Image",
        url: "https://pic2map.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "image",
        placeholder: "Upload image or paste URL",
        tip: "Works with any JPEG with EXIF. Shows location on map. Compare with claimed location.",
    },
    {
        id: "sun-calc",
        name: "SunCalc",
        description: "Calculate sun position for any time/location. Verify photo shadows.",
        category: "physical",
        icon: "Image",
        url: "https://suncalc.org",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Lat, Lon, Date, Time",
        tip: "Compare sun azimuth with photo shadows to verify location and time. Critical for verification.",
    },
    {
        id: "google-lens",
        name: "Google Lens",
        description: "Visual search. Identify landmarks, text, objects, similar images.",
        category: "physical",
        icon: "Image",
        url: "https://lens.google.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "image",
        placeholder: "Upload image",
        tip: "Identify landmarks for geolocation. Extract text for translation/search. Find product sources.",
    },
    // Business
    {
        id: "opencorporates",
        name: "OpenCorporates",
        description: "Global company registry. 200M+ companies. Free for open data.",
        category: "business",
        icon: "Building2",
        url: "https://opencorporates.com",
        freeTier: "Unlimited (web)",
        paidTier: "API: £200/month",
        requiresKey: false,
        inputType: "text",
        placeholder: "Company name or registration number",
        tip: "Search by jurisdiction. Officer search finds linked directors. Network view shows ownership.",
    },
    {
        id: "companies-house",
        name: "Companies House",
        description: "UK company registry. Free API. Directors, filings, charges, insolvency.",
        category: "business",
        icon: "Building2",
        url: "https://find-and-update.company-information.service.gov.uk",
        freeTier: "Unlimited (API)",
        requiresKey: true,
        keyName: "COMPANIES_HOUSE_API_KEY",
        inputType: "text",
        placeholder: "Company name or number",
        tip: "Officer appointments reveal career history. Charges show secured loans. Filing history tracks changes.",
    },
    {
        id: "sec-edgar",
        name: "SEC EDGAR",
        description: "US public company filings. 10-K, 10-Q, 8-K, insider trading.",
        category: "business",
        icon: "Building2",
        url: "https://sec.gov/cgi-bin/browse-edgar",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Ticker or company name (e.g., TSLA)",
        tip: "Insider trading forms 3/4/5 reveal executive transactions. Beneficial ownership in Schedule 13D/G.",
    },
    {
        id: "occrp-aleph",
        name: "OCCRP Aleph",
        description: "Investigative data platform. Leaks, sanctions, company data, court records.",
        category: "business",
        icon: "Building2",
        url: "https://aleph.occrp.org",
        freeTier: "Unlimited (public datasets)",
        paidTier: "Custom (full access)",
        requiresKey: false,
        inputType: "text",
        placeholder: "Person, company, or keyword",
        tip: "Cross-reference leaks with company data. Sanctions lists. Court records from multiple countries.",
    },
    {
        id: "littlesis",
        name: "LittleSis",
        description: "Relationship mapping for powerful people and organizations.",
        category: "business",
        icon: "Building2",
        url: "https://littlesis.org",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Person or organization name",
        tip: "Map connections between politicians, donors, corporations. Oligarch research. Influence networks.",
    },
    // Communications
    {
        id: "telegram-lookup",
        name: "Telegram Lookup",
        description: "Search public Telegram channels and groups. Username/phone resolution.",
        category: "person",
        icon: "MessageSquare",
        url: "https://tgstat.com",
        freeTier: "Unlimited (web)",
        requiresKey: false,
        inputType: "username",
        placeholder: "@username or channel name",
        tip: "TGStat shows channel stats, growth, mentions. Use t.me/username for direct links. Search via Google: site:t.me keyword.",
    },
    {
        id: "twitter-archive",
        name: "Twitter/X Archive",
        description: "Search deleted tweets. Wayback Machine and archive.is snapshots.",
        category: "person",
        icon: "MessageSquare",
        url: "https://archive.org/web",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "twitter.com/username or tweet URL",
        tip: "Wayback Machine saves tweets. Google cache: 'cache:twitter.com/user'. Nitter instances for no-login viewing.",
    },
    // Archives
    {
        id: "wayback",
        name: "Wayback Machine",
        description: "View historical versions of any webpage. 800+ billion pages archived since 1996.",
        category: "archives",
        icon: "Clock",
        url: "https://web.archive.org",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Enter URL (e.g., example.com)",
        tip: "Use calendar view to see all snapshots. Compare versions to track changes.",
    },
    {
        id: "archive-today",
        name: "Archive.today",
        description: "Snapshot any webpage, bypass paywalls. Preserves content even if original is deleted.",
        category: "archives",
        icon: "Clock",
        url: "https://archive.today",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Enter URL to snapshot",
        tip: "Useful for articles behind paywalls. Creates permanent snapshot.",
    },
    {
        id: "google-cache",
        name: "Google Cache",
        description: "View cached versions of webpages from Google's index.",
        category: "archives",
        icon: "Clock",
        url: "https://webcache.googleusercontent.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "cache:example.com/page",
        tip: "Search 'cache:URL' in Google. Text-only version loads faster.",
    },
    {
        id: "commoncrawl",
        name: "Common Crawl",
        description: "Open repository of web crawl data. 8+ years of raw web content.",
        category: "archives",
        icon: "Database",
        url: "https://commoncrawl.org",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Domain or URL prefix",
        tip: "Download petabyte-scale data from S3. Use CDX API for URL lookups.",
    },
    // Social Deep
    {
        id: "redditsearch",
        name: "Reddit Search",
        description: "Deep search across Reddit posts and comments. Real-time ground truth from communities.",
        category: "social-deep",
        icon: "MessageSquare",
        url: "https://redditsearch.io",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Keyword, username, or subreddit",
        tip: "Search deleted comments with Removeddit or Reveddit. Use Pushshift API.",
    },
    {
        id: "linkedin-search",
        name: "LinkedIn Search Tricks",
        description: "Google dorks for LinkedIn profiles without login. Find people by title, company, location.",
        category: "social-deep",
        icon: "User",
        url: "https://google.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "site:linkedin.com/in/ 'Engineer' 'Google'",
        tip: "Query: site:linkedin.com/in/ 'title' 'company' 'location'. Use cached view if private.",
    },
    {
        id: "instagram-search",
        name: "Instagram Search",
        description: "Find posts by location, hashtag, or user. Stories and reels analysis.",
        category: "social-deep",
        icon: "Image",
        url: "https://dumpor.io",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "username",
        placeholder: "@username or hashtag",
        tip: "Dumpor, Imginn view profiles without login. Search stories by location tag.",
    },
    {
        id: "tiktok-search",
        name: "TikTok Search",
        description: "Search videos by sound, hashtag, location. Trending content analysis.",
        category: "social-deep",
        icon: "Video",
        url: "https://tiktok.com/search",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Hashtag, username, or keyword",
        tip: "Location tags reveal where videos were filmed. Sort by 'Most liked'.",
    },
    {
        id: "facebook-graph",
        name: "Facebook Search",
        description: "Alternative Facebook search via intelx.io. Find profiles by email/phone.",
        category: "social-deep",
        icon: "Globe",
        url: "https://intelx.io/facebook",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Facebook profile name or ID",
        tip: "IntelX indexes public Facebook data. Search cached pages for old Graph results.",
    },
    // Geospatial
    {
        id: "overpass-turbo",
        name: "Overpass Turbo",
        description: "Query OpenStreetMap data. Find buildings, POIs, infrastructure, boundaries.",
        category: "geospatial",
        icon: "MapPin",
        url: "https://overpass-turbo.eu",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Query or map area",
        tip: "Wizard mode for easy queries. Find: buildings, hospitals, military bases. Export GeoJSON.",
    },
    {
        id: "wikimapia",
        name: "Wikimapia",
        description: "User-annotated map with millions of building names and local notes.",
        category: "geospatial",
        icon: "MapPin",
        url: "https://wikimapia.org",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Building name or location",
        tip: "Often has names Google Maps lacks. Community annotations reveal local knowledge.",
    },
    {
        id: "sentinel-hub",
        name: "Sentinel Hub",
        description: "Free satellite imagery from ESA Sentinel. 10m resolution, 5-day revisit.",
        category: "geospatial",
        icon: "MapPin",
        url: "https://sentinel-hub.com",
        freeTier: "Limited",
        paidTier: "€50/month",
        requiresKey: true,
        keyName: "SENTINEL_HUB_KEY",
        inputType: "text",
        placeholder: "Lat, Lon or location name",
        tip: "EO Browser for visual analysis. Time series shows changes. NDVI for vegetation.",
    },
    {
        id: "yandex-maps",
        name: "Yandex Maps / Panoramas",
        description: "Street view where Google doesn't cover. Better for Eastern Europe, Russia, Central Asia.",
        category: "geospatial",
        icon: "MapPin",
        url: "https://yandex.com/maps",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Address or coordinates",
        tip: "Panoramas often more recent than Street View for certain regions.",
    },
    {
        id: "mapillary",
        name: "Mapillary",
        description: "Crowdsourced street-level imagery. Millions of photos from contributors worldwide.",
        category: "geospatial",
        icon: "MapPin",
        url: "https://mapillary.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Location or coordinates",
        tip: "Filter by date for recent imagery. Object detection API identifies signs, buildings.",
    },
    // Developer
    {
        id: "github-search",
        name: "GitHub Deep Search",
        description: "Search code, commits, issues, users. Find leaked credentials, developer identity.",
        category: "developer",
        icon: "Code",
        url: "https://github.com/search",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Search query or username",
        tip: "Code search: 'password' extension:env. Commit history reveals real names/emails.",
    },
    {
        id: "gitlab-search",
        name: "GitLab Search",
        description: "Alternative code host search. Often has different repos than GitHub.",
        category: "developer",
        icon: "Code",
        url: "https://gitlab.com/explore",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Project name or username",
        tip: "Self-hosted GitLab instances are public too. Search via Google: site:gitlab.company.com.",
    },
    {
        id: "npm-search",
        name: "npm Registry Search",
        description: "Find packages by author. Link developer identity across projects.",
        category: "developer",
        icon: "Code",
        url: "https://npmjs.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Package name or author",
        tip: "Author pages list all packages. package.json emails reveal identity.",
    },
    {
        id: "stack-overflow",
        name: "Stack Overflow",
        description: "Developer Q&A. Link accounts to real identities via profiles.",
        category: "developer",
        icon: "Code",
        url: "https://stackoverflow.com/users",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Username or real name",
        tip: "Developer story pages link to GitHub, Twitter. Network profile links all StackExchange accounts.",
    },
    // Documents
    {
        id: "wikileaks",
        name: "WikiLeaks",
        description: "Leaked documents, cables, datasets. Official government and corporate leaks.",
        category: "documents",
        icon: "FileText",
        url: "https://wikileaks.org",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Keyword or document name",
        tip: "Cablegate for diplomatic cables. Vault 7 for CIA tools. PlusD for emails.",
    },
    {
        id: "ddosecrets",
        name: "DDoSecrets",
        description: "Alternative to WikiLeaks. Leaks, hacks, whistleblower submissions.",
        category: "documents",
        icon: "FileText",
        url: "https://ddosecrets.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Keyword or dataset name",
        tip: "BlueLeaks: US police documents. Parler archive: January 6 data. GabLeaks.",
    },
    {
        id: "documentcloud",
        name: "DocumentCloud",
        description: "Journalist-uploaded documents. FOIA responses, court filings.",
        category: "documents",
        icon: "FileText",
        url: "https://documentcloud.org",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Keyword or document title",
        tip: "Entity extraction finds people, places, orgs. View page notes from journalists.",
    },
    // Legal
    {
        id: "courtlistener",
        name: "CourtListener",
        description: "US federal court opinions. Search case law, dockets.",
        category: "legal",
        icon: "Landmark",
        url: "https://courtlistener.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Case name, party, or citation",
        tip: "Full-text search across millions of opinions. Docket alerts. RECAP archive for PACER docs.",
    },
    {
        id: "justia",
        name: "Justia",
        description: "Case law, codes, regulations. Federal and state decisions.",
        category: "legal",
        icon: "Landmark",
        url: "https://justia.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Case name or legal topic",
        tip: "Docket search for ongoing cases. Lawyer directory. Trademark search. Supreme Court center.",
    },
    // Real Estate
    {
        id: "zillow",
        name: "Zillow",
        description: "Property records, ownership history, tax assessments. US-focused.",
        category: "realestate",
        icon: "Home",
        url: "https://zillow.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Address or property address",
        tip: "Sale history reveals ownership changes. Tax history shows assessment changes.",
    },
    {
        id: "county-assessor",
        name: "County Assessor Records",
        description: "Property ownership, tax records, parcel maps. Direct from government.",
        category: "realestate",
        icon: "Home",
        url: "https://google.com",
        freeTier: "Varies by county",
        requiresKey: false,
        inputType: "text",
        placeholder: "County name + assessor search",
        tip: "Search: 'county name assessor property search'. Many counties have online databases.",
    },
    // Patents
    {
        id: "uspto-tess",
        name: "USPTO TESS",
        description: "US trademark search. Word and design mark searching.",
        category: "patents",
        icon: "ScanLine",
        url: "https://tmsearch.uspto.gov",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Trademark name or owner",
        tip: "Basic Word Search for exact matches. Assignment search shows ownership transfers.",
    },
    {
        id: "wipo-global",
        name: "WIPO Global Brand DB",
        description: "International trademark search across multiple jurisdictions.",
        category: "patents",
        icon: "ScanLine",
        url: "https://wipo.int/globalbrand",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Brand name or owner",
        tip: "Search Madrid System international registrations. Covers 100+ countries.",
    },
    {
        id: "google-patents",
        name: "Google Patents",
        description: "Patent search with full text. Prior art search, citations analysis.",
        category: "patents",
        icon: "ScanLine",
        url: "https://patents.google.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Patent number, inventor, or keyword",
        tip: "Full text search across 100M+ patents. Similar patents via AI. Family patents across jurisdictions.",
    },
    // Academic
    {
        id: "google-scholar",
        name: "Google Scholar",
        description: "Academic papers, citations, author profiles. Find researchers.",
        category: "academic",
        icon: "BookOpen",
        url: "https://scholar.google.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Paper title, author, or keyword",
        tip: "Author profiles show h-index, all publications. Cited by reveals influence.",
    },
    {
        id: "orcid",
        name: "ORCID",
        description: "Researcher ID registry. Persistent identifiers for academics.",
        category: "academic",
        icon: "BookOpen",
        url: "https://orcid.org",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Researcher name or ORCID ID",
        tip: "ORCID IDs link all publications. Employment history. Funding sources. Co-author networks.",
    },
    {
        id: "researchgate",
        name: "ResearchGate",
        description: "Academic social network. Full-text papers, Q&A, impact metrics.",
        category: "academic",
        icon: "BookOpen",
        url: "https://researchgate.net",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "Researcher name or paper title",
        tip: "Full-text PDFs often available. Research interests reveal expertise. Institution history.",
    },
    // News
    {
        id: "ground-news",
        name: "Ground News",
        description: "Compare news coverage across political spectrum. Bias detection.",
        category: "news",
        icon: "Newspaper",
        url: "https://ground.news",
        freeTier: "Limited",
        paidTier: "$9.99/month",
        requiresKey: false,
        inputType: "text",
        placeholder: "News topic or event",
        tip: "Bias comparison shows left/center/right coverage. Factuality ratings. Timeline.",
    },
    {
        id: "news-lookup",
        name: "NewsLookup",
        description: "Search thousands of news sources by keyword, date, source.",
        category: "news",
        icon: "Newspaper",
        url: "https://newslookup.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "News keyword or headline",
        tip: "Search by source domain. Date range filtering. RSS feeds for monitoring.",
    },
    // Radio & Comms
    {
        id: "flightaware",
        name: "FlightAware",
        description: "Flight tracking with history, schedules, airport activity.",
        category: "radio",
        icon: "Radio",
        url: "https://flightaware.com",
        freeTier: "Limited",
        paidTier: "$39.95/month",
        requiresKey: true,
        keyName: "FLIGHTAWARE_API_KEY",
        inputType: "text",
        placeholder: "Flight number, tail number, or airport",
        tip: "Historical data shows past routes. Aircraft type and registration.",
    },
    {
        id: "radarbox",
        name: "RadarBox",
        description: "Flight tracking with photos, statistics, fleet info.",
        category: "radio",
        icon: "Radio",
        url: "https://radarbox.com",
        freeTier: "Limited",
        paidTier: "€9.90/month",
        requiresKey: false,
        inputType: "text",
        placeholder: "Flight, aircraft, or airport",
        tip: "Photo database of aircraft. Fleet info by airline. Playback mode.",
    },
    {
        id: "broadcastify",
        name: "Broadcastify",
        description: "Live police, fire, EMS, aircraft radio feeds worldwide.",
        category: "radio",
        icon: "Radio",
        url: "https://broadcastify.com",
        freeTier: "Unlimited",
        requiresKey: false,
        inputType: "text",
        placeholder: "City, county, or agency name",
        tip: "Search by state/county. Archives for recent incidents. Premium for extended archives.",
    },
    {
        id: "marinetraffic-web",
        name: "MarineTraffic (Web)",
        description: "Ship tracking with photos, specs, port schedules. AIS-based global coverage.",
        category: "radio",
        icon: "Radio",
        url: "https://marinetraffic.com",
        freeTier: "Limited",
        paidTier: "$15/month",
        requiresKey: false,
        inputType: "text",
        placeholder: "Vessel name, MMSI, or IMO",
        tip: "Historical tracks show voyage history. Port arrivals/departures. Vessel specs and photos.",
    },
    {
        id: "vesselfinder",
        name: "VesselFinder",
        description: "Alternative ship tracking. Often different coverage than MarineTraffic.",
        category: "radio",
        icon: "Radio",
        url: "https://vesselfinder.com",
        freeTier: "Unlimited (web)",
        paidTier: "€49/month (API)",
        requiresKey: false,
        inputType: "text",
        placeholder: "Vessel name, MMSI, or IMO",
        tip: "Compare with MarineTraffic for verification. Photo database. Port calls history.",
    },
];

// ─── Component ────────────────────────────────────────────────

export function OsintToolkit() {
    const [activeCategory, setActiveCategory] = useState("person");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [selectedTool, setSelectedTool] = useState<OsintTool | null>(null);
    const [copied, setCopied] = useState(false);

    const filteredTools = TOOLS.filter(
        (t) =>
            t.category === activeCategory &&
            (searchQuery === "" ||
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const getIcon = (iconName: string) => {
        const icons: Record<string, React.ReactNode> = {
            Search: <Search className="w-5 h-5" />,
            Phone: <Phone className="w-5 h-5" />,
            Mail: <Mail className="w-5 h-5" />,
            User: <User className="w-5 h-5" />,
            Image: <Image className="w-5 h-5" />,
            Globe: <Globe className="w-5 h-5" />,
            Shield: <Shield className="w-5 h-5" />,
            Bitcoin: <Bitcoin className="w-5 h-5" />,
            Car: <Car className="w-5 h-5" />,
            Building2: <Building2 className="w-5 h-5" />,
            FileSearch: <FileSearch className="w-5 h-5" />,
            MessageSquare: <MessageSquare className="w-5 h-5" />,
            Radar: <Radar className="w-5 h-5" />,
            Database: <Database className="w-5 h-5" />,
            Clock: <Clock className="w-5 h-5" />,
            Newspaper: <Newspaper className="w-5 h-5" />,
            BookOpen: <BookOpen className="w-5 h-5" />,
            Radio: <Radio className="w-5 h-5" />,
            Landmark: <Landmark className="w-5 h-5" />,
            Home: <Home className="w-5 h-5" />,
            FileText: <FileText className="w-5 h-5" />,
            Code: <Code className="w-5 h-5" />,
            MapPin: <MapPin className="w-5 h-5" />,
            Video: <Video className="w-5 h-5" />,
        };
        return icons[iconName] || <Search className="w-5 h-5" />;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
            {/* Header */}
            <header className="border-b border-gray-800 bg-[#0f0f16]">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            href="/"
                            className="text-sm text-gray-500 hover:text-cyan-400 transition-colors"
                        >
                            ← Back to Globe
                        </Link>
                        <span className="text-xs text-gray-600 font-mono">
                            PANOPTIS OSINT TOOLKIT
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        OSINT Intelligence Toolkit
                    </h1>
                    <p className="text-gray-400 max-w-2xl">
                        The ultimate open-source intelligence collection. Find anyone,
                        anything, anywhere. 70+ tools. All free tiers included.
                    </p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#13131f] border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-gray-200 placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeCategory === cat.id
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                                    : "bg-[#13131f] text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-300"
                            }`}
                        >
                            {getIcon(cat.icon)}
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTools.map((tool) => (
                        <div
                            key={tool.id}
                            className={`bg-[#13131f] border rounded-lg p-5 cursor-pointer transition-all hover:border-gray-600 ${
                                selectedTool?.id === tool.id
                                    ? "border-cyan-500/50 ring-1 ring-cyan-500/20"
                                    : "border-gray-800"
                            }`}
                            onClick={() => setSelectedTool(tool)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#1a1a2e] rounded-lg text-cyan-400">
                                        {getIcon(tool.icon)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-100">
                                            {tool.name}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {tool.freeTier}
                                        </span>
                                    </div>
                                </div>
                                {tool.requiresKey && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">
                                        KEY
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {tool.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Selected Tool Detail */}
                {selectedTool && (
                    <div className="mt-8 bg-[#13131f] border border-gray-800 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#1a1a2e] rounded-lg text-cyan-400">
                                    {getIcon(selectedTool.icon)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {selectedTool.name}
                                    </h2>
                                    <div className="flex items-center gap-3 text-xs mt-1">
                                        <span className="text-green-400">
                                            Free: {selectedTool.freeTier}
                                        </span>
                                        {selectedTool.paidTier && (
                                            <span className="text-gray-500">
                                                Paid: {selectedTool.paidTier}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <a
                                href={selectedTool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                Open <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        <p className="text-gray-300 mb-6 leading-relaxed">
                            {selectedTool.description}
                        </p>

                        {/* Search Input */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-500 mb-2">
                                {selectedTool.inputType === "image"
                                    ? "Upload or paste image"
                                    : "Enter target"}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={selectedTool.placeholder}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="flex-1 bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                                />
                                <button
                                    onClick={() => handleCopy(searchInput)}
                                    className="px-4 py-3 bg-[#1a1a2e] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    title="Copy"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Tip */}
                        <div className="flex items-start gap-2 bg-[#1a1a2e] border border-gray-800 rounded-lg p-3">
                            <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-400">{selectedTool.tip}</p>
                        </div>

                        {/* API Key Notice */}
                        {selectedTool.requiresKey && (
                            <div className="flex items-start gap-2 mt-3 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                <p className="text-sm text-amber-400/80">
                                    Requires{" "}
                                    <code className="bg-amber-500/10 px-1.5 py-0.5 rounded text-xs">
                                        {selectedTool.keyName}
                                    </code>{" "}
                                    environment variable. Add via Vercel dashboard or
                                    .env file.
                                </p>
                            </div>
                        )}

                        {/* Direct Link */}
                        <div className="mt-4 flex gap-2">
                            <a
                                href={
                                    searchInput
                                        ? `${selectedTool.url}${
                                              selectedTool.url.includes("?")
                                                  ? "&"
                                                  : "?"
                                          }q=${encodeURIComponent(searchInput)}`
                                        : selectedTool.url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-medium"
                            >
                                <Search className="w-4 h-4" />
                                {searchInput ? "Search with Input" : "Open Tool"}
                            </a>
                        </div>
                    </div>
                )}

                {/* Guide Section */}
                <div className="mt-12 border-t border-gray-800 pt-8">
                    <h2 className="text-xl font-bold text-white mb-6">
                        Investigation Workflows
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#13131f] border border-gray-800 rounded-lg p-5">
                            <h3 className="font-semibold text-cyan-400 mb-3">
                                1. Person Investigation
                            </h3>
                            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                                <li>
                                    Start with{" "}
                                    <strong className="text-gray-300">Sherlock</strong> or{" "}
                                    <strong className="text-gray-300">WhatsMyName</strong> for
                                    username enumeration
                                </li>
                                <li>
                                    Use <strong className="text-gray-300">Hunter.io</strong> to
                                    find email patterns at target's company
                                </li>
                                <li>
                                    Check <strong className="text-gray-300">Have I Been Pwned</strong>{" "}
                                    for breached accounts
                                </li>
                                <li>
                                    Search emails in{" "}
                                    <strong className="text-gray-300">DeHashed</strong> or{" "}
                                    <strong className="text-gray-300">IntelX</strong>
                                </li>
                                <li>
                                    Reverse image search with{" "}
                                    <strong className="text-gray-300">Yandex</strong> and{" "}
                                    <strong className="text-gray-300">FaceCheck</strong>
                                </li>
                                <li>
                                    Verify phone with{" "}
                                    <strong className="text-gray-300">Numverify</strong> or{" "}
                                    <strong className="text-gray-300">Twilio</strong>
                                </li>
                            </ol>
                        </div>
                        <div className="bg-[#13131f] border border-gray-800 rounded-lg p-5">
                            <h3 className="font-semibold text-cyan-400 mb-3">
                                2. Infrastructure Investigation
                            </h3>
                            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                                <li>
                                    <strong className="text-gray-300">WHOIS</strong> lookup for
                                    domain registration details
                                </li>
                                <li>
                                    <strong className="text-gray-300">DNSDumpster</strong> to map
                                    subdomains and DNS records
                                </li>
                                <li>
                                    <strong className="text-gray-300">Crt.sh</strong> for SSL
                                    certificate transparency logs
                                </li>
                                <li>
                                    <strong className="text-gray-300">Shodan</strong> for exposed
                                    services and devices
                                </li>
                                <li>
                                    <strong className="text-gray-300">Censys</strong> for
                                    certificate and host analysis
                                </li>
                                <li>
                                    <strong className="text-gray-300">IPinfo</strong> for
                                    geolocation and ASN data
                                </li>
                            </ol>
                        </div>
                        <div className="bg-[#13131f] border border-gray-800 rounded-lg p-5">
                            <h3 className="font-semibold text-cyan-400 mb-3">
                                3. Crypto Tracking
                            </h3>
                            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                                <li>
                                    Start with <strong className="text-gray-300">Etherscan</strong>{" "}
                                    for Ethereum addresses
                                </li>
                                <li>
                                    <strong className="text-gray-300">Blockchain.com</strong> for
                                    Bitcoin tracing
                                </li>
                                <li>
                                    <strong className="text-gray-300">Blockchair</strong> for
                                    multi-chain analysis
                                </li>
                                <li>
                                    <strong className="text-gray-300">Arkham</strong> for entity
                                    labeling and clustering
                                </li>
                                <li>
                                    Follow token transfers to identify exchange usage
                                </li>
                                <li>
                                    Cross-reference with{" "}
                                    <strong className="text-gray-300">OpenSanctions</strong> for
                                    sanctioned entities
                                </li>
                            </ol>
                        </div>
                        <div className="bg-[#13131f] border border-gray-800 rounded-lg p-5">
                            <h3 className="font-semibold text-cyan-400 mb-3">
                                4. Threat Hunting
                            </h3>
                            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                                <li>
                                    <strong className="text-gray-300">VirusTotal</strong> for
                                    file/hash/URL reputation
                                </li>
                                <li>
                                    <strong className="text-gray-300">URLhaus</strong> for
                                    malware distribution sites
                                </li>
                                <li>
                                    <strong className="text-gray-300">ThreatFox</strong> for IOC
                                    sharing and malware families
                                </li>
                                <li>
                                    <strong className="text-gray-300">AbuseIPDB</strong> for IP
                                    reputation and reports
                                </li>
                                <li>
                                    <strong className="text-gray-300">GreyNoise</strong> to filter
                                    benign internet scanning
                                </li>
                                <li>
                                    <strong className="text-gray-300">EmergingThreats</strong>{" "}
                                    rules for IDS/IPS detection
                                </li>
                            </ol>
                        </div>
                        <div className="bg-[#13131f] border border-gray-800 rounded-lg p-5">
                            <h3 className="font-semibold text-cyan-400 mb-3">
                                5. Document Investigation
                            </h3>
                            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                                <li>
                                    <strong className="text-gray-300">WikiLeaks</strong> for official
                                    government leaks
                                </li>
                                <li>
                                    <strong className="text-gray-300">DDoSecrets</strong> for
                                    alternative leak archives
                                </li>
                                <li>
                                    <strong className="text-gray-300">DocumentCloud</strong> for
                                    journalist-uploaded documents
                                </li>
                                <li>
                                    <strong className="text-gray-300">OCCRP Aleph</strong> for
                                    cross-border investigations
                                </li>
                            </ol>
                        </div>
                        <div className="bg-[#13131f] border border-gray-800 rounded-lg p-5">
                            <h3 className="font-semibold text-cyan-400 mb-3">
                                6. Geolocation Verification
                            </h3>
                            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                                <li>
                                    <strong className="text-gray-300">Overpass Turbo</strong> for
                                    infrastructure mapping
                                </li>
                                <li>
                                    <strong className="text-gray-300">Wikimapia</strong> for
                                    building names
                                </li>
                                <li>
                                    <strong className="text-gray-300">Yandex Maps</strong> for
                                    regions Google doesn't cover
                                </li>
                                <li>
                                    <strong className="text-gray-300">SunCalc</strong> for shadow
                                    analysis
                                </li>
                            </ol>
                        </div>
                        <div className="bg-[#13131f] border border-gray-800 rounded-lg p-5">
                            <h3 className="font-semibold text-cyan-400 mb-3">
                                7. Developer Identity
                            </h3>
                            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                                <li>
                                    <strong className="text-gray-300">GitHub</strong> search for
                                    code and commit history
                                </li>
                                <li>
                                    <strong className="text-gray-300">GitLab</strong> for
                                    alternative code hosts
                                </li>
                                <li>
                                    <strong className="text-gray-300">npm/Stack Overflow</strong>{" "}
                                    for cross-platform linking
                                </li>
                            </ol>
                        </div>
                        <div className="bg-[#13131f] border border-gray-800 rounded-lg p-5">
                            <h3 className="font-semibold text-cyan-400 mb-3">
                                8. Asset & Property
                            </h3>
                            <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                                <li>
                                    <strong className="text-gray-300">Zillow</strong> for US
                                    property history
                                </li>
                                <li>
                                    <strong className="text-gray-300">County assessor records</strong>{" "}
                                    for ownership
                                </li>
                                <li>
                                    <strong className="text-gray-300">OpenCorporates</strong> for
                                    business property links
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
