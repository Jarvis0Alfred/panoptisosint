# OSINT Capabilities Deep Dive for Panoptis

## 1. Person OSINT

### Phone Numbers
- **Twilio Lookup**: Free tier (100 requests) - carrier, type, location
- **Numverify**: Free tier (100/month) - validate, format, line type
- **OpenCNAM**: Caller ID lookup
- **Truecaller**: Requires API access (limited)
- **HLR Lookup**: Home Location Register queries (paid)
- **Integration**: REST API → phone lookup plugin

### Email Addresses
- **Hunter.io**: Free tier (25 searches/month) - verify, find, domain search
- **Clearbit**: Free tier (100 requests/month) - enrich person/company data
- **HaveIBeenPwned**: Free API - breach history
- **EmailRep.io**: Free - reputation score
- **DeHashed**: Paid ($7.49/month) - breached credentials
- **Integration**: REST API → identity verification plugin

### Social Profiles
- **Sherlock**: Open source - username search across 400+ platforms
- **Social Searcher**: Free tier - real-time social media search
- **Maltego**: Free community edition - link analysis
- **WhatsMyName**: Open source - username enumeration
- **Namechk**: Free - username availability across platforms
- **Integration**: Python/sherlock integration → social profile mapper plugin

### Profile Pictures (Reverse Image Search)
- **Google Images**: Free - reverse image search API via custom search
- **TinEye**: Free tier (150 searches/day) - reverse image search
- **Pimeyes**: Paid (€29.99/month) - facial recognition search
- **Yandex Images**: Free - superior facial recognition
- **FaceCheck.ID**: Free tier (20 searches/month) - facial recognition
- **Integration**: Image upload → multi-engine reverse search plugin

### Leaked Databases / Data Brokers
- **DeHashed**: Paid ($7.49/month) - breached credentials
- **IntelX**: Free tier (100 results/day) - leaked data search
- **Leak-Lookup**: Free tier - breach database
- **HaveIBeenPwned**: Free API - breach notifications
- **Spokeo**: Paid ($19.95/month) - people search
- **Whitepages**: Paid - people/phone lookup
- **Integration**: REST API → breach database plugin

## 2. Digital Identity

### Domain WHOIS
- **WHOISXML API**: Free tier (500 requests/month)
- **RDAP**: Free - IANA RDAP protocol
- **ViewDNS.info**: Free - multiple DNS tools
- **Integration**: REST API → domain intelligence plugin

### DNS Records
- **DNSDumpster**: Free - DNS reconnaissance
- **SecurityTrails**: Free tier - DNS history
- **VirusTotal**: Free API (4 requests/min) - domain reputation
- **Shodan**: Free tier (100 results/month) - exposed services
- **Censys**: Free tier - internet asset search
- **Integration**: REST API → DNS reconnaissance plugin

### SSL Certificates
- **Crt.sh**: Free - certificate transparency logs
- **SSL Labs API**: Free - SSL testing
- **CertSpotter**: Free tier - certificate monitoring
- **Integration**: REST API → certificate tracking plugin

### IP Geolocation
- **IPinfo**: Free tier (50,000/month) - geolocation
- **IPGeolocation**: Free tier (30,000/month)
- **IP-API**: Free (non-commercial) - geolocation
- **MaxMind GeoLite2**: Free - city/country database
- **Integration**: REST API → IP mapping plugin

## 3. Financial OSINT

### Crypto Wallet Tracking
- **Etherscan API**: Free tier (5 calls/sec) - Ethereum
- **Blockchain.com API**: Free - Bitcoin
- **Blockchair API**: Free tier - multi-chain
- **Arkham Intelligence**: Free tier - entity labeling
- **Nansen**: Paid - wallet labeling
- **MistTrack**: Free - AML risk scoring
- **Integration**: REST API → crypto tracker plugin

### Transaction Tracing
- **Chainalysis**: Enterprise only
- **Elliptic**: Enterprise only
- **TRM Labs**: Enterprise only
- **Open source**: Blockchair + Arkham for basic tracing
- **Integration**: REST API → transaction flow plugin

## 4. Physical OSINT

### Vehicle Plates
- **No free global API exists**
- **Country-specific**: DMV lookups (US state-by-state)
- **UK**: DVLA (paid)
- **EU**: No unified system
- **Integration**: Manual research only

### Geolocation from Photos (EXIF)
- **ExifTool**: Open source - extract metadata
- **Jeffrey's Image Metadata Viewer**: Web-based
- **Pic2Map**: Free - extract GPS from images
- **Integration**: File upload → EXIF extractor plugin

### Camera Matching
- **SerialNumber.in**: Free - camera serial number search
- **StolenCameraFinder**: Free - find stolen cameras
- **Integration**: Image upload → camera fingerprinting plugin

## 5. Communications

### Signal/WhatsApp/Telegram Verification
- **WhatsApp**: No official API for number verification
- **Telegram**: MTProto API (complex)
- **Signal**: No API for number verification
- **Workaround**: Web scraping (terms of service risk)
- **Integration**: Limited - manual research only

### Carrier Lookup
- **Twilio Lookup**: Free tier (100 requests)
- **Numverify**: Free tier (100/month)
- **Telnyx**: Free tier - carrier info
- **Integration**: REST API → carrier lookup plugin

## 6. Business/Company

### Corporate Registries
- **OpenCorporates**: Free tier - global company data
- **SEC EDGAR**: Free - US filings
- **Companies House**: Free - UK companies
- **OpenOwnership**: Free - beneficial ownership
- **Integration**: REST API → corporate registry plugin

### Beneficial Ownership
- **OpenOwnership**: Free - BODS data
- **OCCRP Aleph**: Free - investigative data
- **Integration**: REST API → ownership graph plugin

### Linked Directors
- **OpenCorporates**: Free tier - officer search
- **LittleSis**: Free - relationship mapping
- **Integration**: REST API → director network plugin

## 7. Threat Intelligence

### Malware Hashes
- **VirusTotal**: Free API (4 requests/min) - hash lookup
- **MalwareBazaar**: Free - malware sample database
- **URLhaus**: Free - malware distribution sites
- **ThreatFox**: Free - IOC sharing
- **Integration**: REST API → malware tracker plugin

### IP Reputation
- **AbuseIPDB**: Free tier (1,000 checks/day)
- **VirusTotal**: Free API - IP lookup
- **GreyNoise**: Free tier - noise filtering
- **IBM X-Force Exchange**: Free - threat intelligence
- **Integration**: REST API → IP reputation plugin

### Dark Web Monitoring
- **HaveIBeenPwned**: Free - breach notifications
- **DeHashed**: Paid - dark web search
- **OnionScan**: Open source - dark web scanner
- **Ahmia**: Free - dark web search engine
- **Integration**: Limited - manual/API hybrid

## Integration Architecture for Panoptis Marketplace

```
OSINT Plugin Types:
1. Declarative (JSON config) - simple REST APIs
2. Bundle (JS code) - complex multi-step lookups
3. Static (GeoJSON) - pre-processed datasets

Plugin Manifest Example:
{
  id: "phone-lookup",
  name: "Phone Intelligence",
  category: "osint",
  capabilities: ["data:own", "ui:search", "globe:overlay"],
  dataSource: {
    url: "/api/osint/phone",
    method: "POST",
    format: "json",
    auth: { type: "header", key: "X-API-Key", envVar: "NUMVERIFY_KEY" }
  },
  fieldMapping: {
    id: "number",
    latitude: "location.latitude",
    longitude: "location.longitude",
    label: "carrier.name"
  }
}
```

## Legal/Ethical Considerations

- **GDPR**: EU data protection - consent required for personal data
- **CFAA**: US - unauthorized access to computers
- **Terms of Service**: Most platforms prohibit scraping
- **Data Retention**: Minimize storage of personal data
- **Transparency**: Clearly mark data sources and confidence levels
- **User Consent**: Require explicit consent for sensitive lookups

## Cost Summary

**Free APIs:**
- Hunter.io (25/month)
- HaveIBeenPwned (free)
- DeHashed (limited)
- VirusTotal (4/min)
- Shodan (100/month)
- Censys (limited)
- IPinfo (50K/month)
- Etherscan (5/sec)
- Sherlock (open source)
- OpenCorporates (limited)
- URLhaus (free)
- ThreatFox (free)
- AbuseIPDB (1K/day)

**Paid APIs (Recommended):**
- DeHashed ($7.49/month)
- Pimeyes (€29.99/month)
- Clearbit (paid plans)
- Nansen (paid)
- Chainalysis (enterprise)

**Enterprise Only:**
- Chainalysis
- Elliptic
- TRM Labs
- FortiGuard
