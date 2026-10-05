# Customer Digital Presence Intelligence Tracker

**Product Type:** Internal Sales Intelligence Platform
**Version:** 1.0 MVP
**Status:** Ready for Development
**Primary Goal:** Mengidentifikasi customer yang belum memiliki website dan/atau memiliki Instagram yang tidak aktif untuk kebutuhan prospecting Website Development, SEO, dan Digital Services.

---

# 1. Product Vision

Customer Digital Presence Intelligence Tracker adalah internal tool yang mengubah database customer menjadi **actionable sales intelligence**.

Sistem secara otomatis menganalisis setiap customer berdasarkan dua digital presence utama:

1. **Website**
2. **Instagram**

Output akhirnya bukan sekadar:

> "Customer punya website atau tidak."

Tetapi:

> "Customer mana yang memiliki peluang layanan digital dan mengapa?"

Contoh:

```text
ABC Restaurant

Website:
❌ Not Found

Instagram:
🟢 Active
Last post: 4 days ago

Opportunity:
Website Development
```

Atau:

```text
XYZ Villa

Website:
🟢 Active

Instagram:
🔴 Dormant
Last post: 247 days ago

Opportunity:
Social Media / Content
```

---

# 2. Core Business Problem

Database customer biasanya hanya berisi informasi bisnis:

* Nama bisnis
* Contact person
* Nomor telepon
* Email
* Alamat
* Kategori bisnis

Database tersebut belum memberikan informasi mengenai digital presence.

Akibatnya sales harus melakukan:

```text
Cari customer
↓
Google nama bisnis
↓
Cari website
↓
Cari Instagram
↓
Buka Instagram
↓
Cek posting terakhir
↓
Catat manual
```

Jika terdapat 1.000+ customer, proses ini tidak scalable.

Product ini mengotomatisasi proses tersebut.

---

# 3. Product Objective

## Primary Objective

Secara otomatis menentukan:

```text
Customer
    ↓
Website Status
    +
Instagram Status
```

Kemudian menghasilkan daftar customer yang memiliki digital opportunity.

## Secondary Objective

* Mengurangi pengecekan manual.
* Menyimpan hasil discovery.
* Menyimpan histori pengecekan.
* Mengetahui kapan terakhir customer aktif di Instagram.
* Mengidentifikasi customer tanpa website.
* Mengidentifikasi customer dengan Instagram yang tidak aktif.
* Menghasilkan lead list yang siap digunakan sales.

---

# 4. MVP Scope

MVP hanya memiliki dua intelligence engine.

```text
┌─────────────────────────┐
│     CUSTOMER DATABASE    │
└────────────┬────────────┘
             │
       ┌─────┴─────┐
       ▼           ▼
   WEBSITE      INSTAGRAM
  DETECTION      TRACKER
       │           │
       ▼           ▼
    STATUS       STATUS
       │           │
       └─────┬─────┘
             ▼
      DIGITAL PRESENCE
          DASHBOARD
             │
             ▼
       LEAD SEGMENTS
             │
             ▼
          EXPORT
```

### Included

* Customer import
* Customer management
* Website discovery
* Website verification
* Instagram discovery
* Instagram activity detection
* Activity classification
* Dashboard
* Filtering
* Lead segmentation
* Manual verification
* Scan jobs
* Scheduled re-check
* CSV/XLSX export

### Not Included

* Facebook
* TikTok
* LinkedIn
* WhatsApp automation
* Email automation
* Full CRM
* AI chatbot
* AI lead scoring
* Full SEO audit
* Google Ads integration
* Meta Ads integration

---

# 5. Target User

## Primary

Internal sales / marketing team.

## Secondary

Management / owner.

## Technical

Developer / IT administrator.

---

# 6. Customer Data

Customer entity:

```text
customers
```

Fields:

```text
id
business_name
contact_name
phone
email
address
city
province
country
business_category
source
created_at
updated_at
```

### Required

```text
business_name
```

### Recommended

```text
city
address
business_category
phone
email
```

Location sangat penting untuk membedakan bisnis dengan nama yang sama.

---

# 7. Website Intelligence

Setiap customer dapat memiliki satu atau beberapa website candidate.

## Website Entity

```text
websites
```

Fields:

```text
id
customer_id
domain
url
status
discovery_source
confidence_score
http_status
ssl_valid
final_url
manually_verified
last_checked_at
first_discovered_at
created_at
updated_at
```

---

# 8. Website Status

Status website:

```text
ACTIVE
INACTIVE
NOT_FOUND
NEEDS_REVIEW
SCAN_FAILED
```

## ACTIVE

Website berhasil ditemukan dan dapat diakses.

Contoh:

```text
HTTP 200
HTTPS valid
```

## INACTIVE

Domain ditemukan tetapi website tidak dapat digunakan secara normal.

Contoh:

```text
DNS failure
HTTP 5xx
expired domain
```

## NOT_FOUND

Sistem tidak menemukan website yang cukup meyakinkan.

Penting:

> NOT_FOUND ≠ bisnis pasti tidak memiliki website.

## NEEDS_REVIEW

Ada kandidat domain tetapi sistem belum cukup yakin.

## SCAN_FAILED

External search/check gagal.

`SCAN_FAILED` tidak boleh diklasifikasikan sebagai `NOT_FOUND`.

---

# 9. Website Discovery Architecture

Discovery menggunakan layered approach.

## Layer 1 — Existing Customer Data

Jika database customer sudah memiliki domain:

```text
customer.website
```

langsung lakukan verification.

Tidak perlu search ulang.

---

# 10. Layer 2 — OpenStreetMap

OpenStreetMap digunakan sebagai sumber gratis pertama.

Jika bisnis memiliki website di data OSM:

```text
website=https://example.com
```

domain menjadi candidate.

Discovery source:

```text
OPENSTREETMAP
```

---

# 11. Layer 3 — SearXNG

Jika website belum ditemukan:

```text
Customer
↓
Search query
↓
Self-hosted SearXNG
↓
Search results
↓
Candidate domains
```

SearXNG dapat dijalankan sendiri dengan Docker/Compose dan digunakan sebagai metasearch layer tanpa menggunakan paid search API.

Contoh query:

```text
"ABC Restaurant" Canggu Bali official website
```

atau:

```text
"ABC Restaurant" Bali website
```

---

# 12. Website Candidate Filtering

Search result tidak boleh langsung dianggap sebagai official website.

Exclude:

```text
facebook.com
instagram.com
tiktok.com
tripadvisor.com
google.com
yelp.com
traveloka.com
booking.com
tokopedia.com
shopee.co.id
directory websites
review websites
```

Candidate harus melalui matching.

---

# 13. Website Matching Score

Contoh scoring:

```text
Business name similarity       +40
Location similarity            +20
Domain similarity              +20
Search relevance               +20
-----------------------------------
Maximum                         100
```

Classification:

```text
80–100 → Strong Candidate
60–79  → Needs Review
<60    → Discard
```

Score configurable.

---

# 14. Website Verification

Setelah domain candidate ditemukan:

```text
DNS
↓
HTTP
↓
HTTPS
↓
Redirect
↓
Response
```

Data:

```text
http_status
response_time
ssl_valid
final_url
```

Redirect dianggap valid:

```text
http://example.com
        ↓
https://example.com
        ↓
200
```

---

# 15. Instagram Intelligence

Instagram hanya satu platform.

Tidak ada Facebook/TikTok/LinkedIn pada MVP.

Entity:

```text
instagram_profiles
```

Fields:

```text
id
customer_id
username
profile_url
display_name
status
last_post_at
posts_last_30_days
posts_last_90_days
discovery_source
confidence_score
manually_verified
last_checked_at
created_at
updated_at
```

---

# 16. Instagram Discovery

Flow:

```text
Customer
↓
Search
↓
Instagram Candidate
↓
Match Business
↓
Verify Profile
↓
Detect Latest Post
↓
Calculate Activity
```

Search query contoh:

```text
"ABC Restaurant" Canggu Bali Instagram
```

atau:

```text
"ABC Restaurant Bali" Instagram
```

SearXNG digunakan sebagai search layer untuk menemukan profile candidate.

---

# 17. Instagram Candidate Matching

Sistem harus membedakan:

```text
ABC Restaurant Bali
```

dengan:

```text
ABC Restaurant Official
ABC Restaurant Jakarta
ABC Restaurant Fanpage
ABC Restaurant Supplier
```

Matching berdasarkan:

```text
Business name
Username
Display name
Location
Search context
Profile URL
```

---

# 18. Instagram Activity

Definisi utama activity:

> **Seberapa baru bisnis terakhir melakukan posting di Instagram.**

Bukan:

* jumlah followers;
* jumlah likes;
* jumlah comments;
* jumlah following.

Follower count bukan indikator utama untuk menentukan active/inactive.

---

# 19. Instagram Status

Status:

```text
ACTIVE
COOLING
INACTIVE
DORMANT
NOT_FOUND
NEEDS_REVIEW
SCAN_FAILED
```

## ACTIVE

Last post:

```text
≤ 30 days
```

## COOLING

```text
31–60 days
```

## INACTIVE

```text
61–180 days
```

## DORMANT

```text
>180 days
```

## NOT_FOUND

Tidak ditemukan profile Instagram yang cukup meyakinkan.

## NEEDS_REVIEW

Profile ditemukan tetapi tidak dapat diverifikasi secara reliable.

## SCAN_FAILED

Pengecekan gagal.

---

# 20. Example

Jika tanggal pengecekan:

```text
1 October 2026
```

Maka:

```text
Last post:
28 September 2026
→ ACTIVE

10 August 2026
→ COOLING

15 May 2026
→ INACTIVE

December 2025
→ DORMANT
```

---

# 21. Instagram Posting Metrics

Sistem menyimpan:

```text
last_post_at

posts_last_30_days

posts_last_90_days
```

Contoh:

```text
Last post:
27 September 2026

Posts last 30 days:
8

Posts last 90 days:
21

Status:
ACTIVE
```

---

# 22. Instagram Data Collection Strategy

MVP harus menggunakan pendekatan yang **modular dan rate-limited**.

Instagram adalah bagian paling sensitif dari sistem karena automated access dapat berubah reliability-nya.

Karena itu architecture harus menggunakan:

```text
InstagramDiscoveryProvider
```

bukan hard-code scraper langsung ke dashboard.

Interface:

```text
discoverProfile()
verifyProfile()
getLatestPost()
getActivity()
```

Dengan begitu provider dapat diganti tanpa mengubah aplikasi utama.

---

# 23. Important Instagram Rule

Jika sistem tidak dapat memastikan tanggal posting terakhir:

```text
DO NOT:
INACTIVE
```

Gunakan:

```text
NEEDS_REVIEW
```

Jika request gagal:

```text
SCAN_FAILED
```

Jangan:

```text
NOT_FOUND
```

Ini mencegah false leads.

---

# 24. Digital Presence Matrix

Dashboard utama harus bisa menampilkan kombinasi website + Instagram.

Contoh:

| Business       | Website     | Instagram   | Last Post | Opportunity      |
| -------------- | ----------- | ----------- | --------- | ---------------- |
| ABC Restaurant | ❌ Not Found | 🟢 Active   | 4 days    | Website          |
| XYZ Cafe       | 🟢 Active   | 🔴 Dormant  | 220 days  | Social           |
| Bali Villa     | ❌ Not Found | 🟢 Active   | 2 days    | Website          |
| ABC Spa        | 🟢 Active   | 🟢 Active   | 6 days    | SEO              |
| XYZ Store      | ❌ Not Found | ❌ Not Found | —         | Digital Presence |

---

# 25. Lead Segmentation

System-generated segments.

## Segment 1 — Website Opportunity

```text
Website = NOT_FOUND
```

## Segment 2 — High Website Opportunity

```text
Website = NOT_FOUND
Instagram = ACTIVE
```

Interpretation:

Bisnis terlihat aktif melakukan digital marketing tetapi belum ditemukan website.

---

## Segment 3 — Website + Social Opportunity

```text
Website = NOT_FOUND
Instagram = NOT_FOUND
```

Potential digital presence lead.

---

## Segment 4 — Social Opportunity

```text
Website = ACTIVE
Instagram = INACTIVE
```

Potential social/content opportunity.

---

## Segment 5 — SEO Candidate

MVP hanya menandai:

```text
Website = ACTIVE
```

Actual SEO opportunity scoring dilakukan pada fase berikutnya.

---

# 26. Dashboard

Dashboard menggunakan:

**Next.js + React**

Bukan static HTML.

Layout:

```text
┌──────────────────────────────────────────┐
│ Digital Presence Tracker                 │
├──────────────────────────────────────────┤
│                                          │
│ Customers    Websites    Instagram       │
│ 1,284        812         934             │
│                                          │
├──────────────────────────────────────────┤
│ Website Opportunities        327         │
│ High Opportunities           184         │
│ Instagram Inactive           286         │
│ Needs Review                  91         │
├──────────────────────────────────────────┤
│ Customer Table                           │
│                                          │
└──────────────────────────────────────────┘
```

---

# 27. Customer Table

Columns:

```text
Business
Category
Location
Website
Instagram
Last Instagram Post
Opportunity
Last Checked
```

Example:

```text
ABC Restaurant
Restaurant
Canggu

Website:
Not Found

Instagram:
@abcrestaurant

Last Post:
4 days ago

Opportunity:
Website
```

---

# 28. Filters

### Website

```text
All
Active
Inactive
Not Found
Needs Review
```

### Instagram

```text
All
Active
Cooling
Inactive
Dormant
Not Found
Needs Review
```

### Opportunity

```text
Website
Social
Website + Social
SEO
Digital Presence
```

### Location

```text
Province
City
Area
```

### Category

Dynamic from database.

---

# 29. Search

Global search:

```text
ABC Restaurant
```

Search:

```text
Business name
Contact name
Phone
Email
Domain
Instagram username
```

---

# 30. Customer Detail Page

Route:

```text
/customers/[id]
```

Sections:

### Business

```text
Business name
Category
Address
Phone
Email
```

### Website

```text
Domain
Status
Confidence
Source
HTTP Status
SSL
Last Checked
```

### Instagram

```text
Profile
Username
Status
Last Post
Posts / 30 Days
Posts / 90 Days
Confidence
Last Checked
```

### Opportunity

```text
Website Opportunity
Social Opportunity
SEO Candidate
```

### Scan History

```text
Date
Website Result
Instagram Result
Scan Status
```

---

# 31. Manual Verification

User dapat override automated result.

Example:

```text
Instagram Candidate

@abc_restaurant_bali

Confidence:
74

[Confirm]
[Reject]
```

Setelah confirm:

```text
manually_verified = true
```

System tidak boleh mengganti manually verified profile kecuali user melakukan re-verification.

---

# 32. Import

Supported:

```text
CSV
XLSX
```

Flow:

```text
Upload
↓
Preview
↓
Map Columns
↓
Validate
↓
Duplicate Check
↓
Confirm
↓
Import
```

---

# 33. Column Mapping

Example:

```text
Excel Column       System Field

Nama Bisnis        business_name
Nama Contact       contact_name
No HP              phone
Email              email
Alamat             address
Kota               city
Kategori           business_category
```

Mapping dapat disimpan.

---

# 34. Duplicate Detection

Primary:

```text
business_name
+
location
```

Secondary:

```text
phone
email
```

Potential duplicate:

```text
ABC Restaurant
Canggu

Existing record found.
```

Options:

```text
Skip
Merge
Create Anyway
```

---

# 35. Scan System

Semua discovery dilakukan melalui background job.

```text
User
 ↓
Start Scan
 ↓
Scan Job
 ↓
Queue
 ↓
Worker
 ↓
Website Discovery
 ↓
Instagram Discovery
 ↓
Verification
 ↓
Database
 ↓
Dashboard
```

---

# 36. Queue Architecture

Gunakan:

```text
BullMQ
+
Redis
```

BullMQ merupakan queue system TypeScript/Node.js berbasis Redis dan mendukung worker, retry, delayed jobs, concurrency, serta scheduled jobs.

Queues:

```text
customer-import
website-discovery
website-verification
instagram-discovery
instagram-verification
activity-check
```

---

# 37. Scan Job

Table:

```text
scan_jobs
```

Fields:

```text
id
type
status
total
processed
successful
failed
created_by
started_at
completed_at
```

Status:

```text
QUEUED
RUNNING
COMPLETED
FAILED
CANCELLED
```

---

# 38. Progress UI

Dashboard:

```text
Website Scan

██████████████░░░░░░ 72%

923 / 1,284 processed

Successful: 871
Needs Review: 31
Failed: 21
```

User dapat melihat progress secara realtime/polling.

---

# 39. Retry

External request failures:

```text
Retry:
1
2
3
```

Setelah maksimal retry:

```text
SCAN_FAILED
```

Backoff digunakan agar sistem tidak melakukan request berulang secara agresif.

---

# 40. Scheduled Recheck

Default:

```text
Weekly
```

Priority:

### NOT_FOUND

Recheck:

```text
7 days
```

### NEEDS_REVIEW

```text
7 days
```

### INACTIVE

```text
14 days
```

### ACTIVE Website

```text
30 days
```

### ACTIVE Instagram

```text
7 days
```

Instagram perlu dicek lebih sering karena status activity berubah lebih cepat.

---

# 41. Scan Optimization

Sistem tidak melakukan full scan setiap kali.

Contoh:

```text
1,000 customers

Website:
Active → check monthly
Not Found → check weekly

Instagram:
Active → check weekly
Dormant → check monthly
```

Ini mengurangi external requests secara signifikan.

---

# 42. Database Schema

Core tables:

```text
customers
websites
website_candidates
website_checks

instagram_profiles
instagram_candidates
instagram_posts
instagram_checks

scan_jobs
scan_job_items

import_jobs
audit_logs
settings
users
```

---

# 43. PostgreSQL

Database:

```text
PostgreSQL 18+
```

Primary relational database.

Reason:

* relational customer data;
* filtering;
* indexing;
* historical records;
* transactional consistency;
* mature ecosystem.

---

# 44. ORM

Recommended:

```text
Prisma ORM 7
```

Prisma 8 pada saat PRD ini dibuat masih berada pada release-candidate stage, dengan perubahan API yang masih dapat terjadi; Prisma 7 tetap supported. Untuk internal production MVP, stabilitas lebih penting daripada memakai RC.

Upgrade ke Prisma 8 dapat dilakukan setelah GA dan compatibility review.

---

# 45. Frontend Stack

## Framework

```text
Next.js 16.3.8
```

Next.js 16.3.8 adalah Active LTS patch setelah security release September 2026.

## UI

```text
React 19.3
```

React 19.3 sudah stable sejak September 9, 2026.

## Styling

```text
Tailwind CSS 4.3
```

Tailwind 4.3 merupakan release terbaru yang dipublikasikan pada 2026.

## Icons

```text
Lucide React
```

## Charts

```text
Recharts
```

## Tables

Gunakan:

```text
TanStack Table
```

untuk filtering, sorting, pagination, dan column configuration.

---

# 46. UI Design Direction

UI tidak boleh terlihat seperti:

* AI dashboard generik;
* template SaaS berlebihan;
* terlalu banyak gradient;
* glassmorphism berlebihan;
* dashboard penuh kartu.

Style:

```text
Modern
Minimal
Professional
Dense
Data-oriented
Fast
```

Prioritas:

```text
Information density
+
Clear hierarchy
+
Fast filtering
```

---

# 47. Next.js Architecture

Gunakan App Router.

Struktur:

```text
src/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── customers/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── scans/
│   ├── imports/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── customers/
│   ├── websites/
│   └── instagram/
│
├── lib/
│   ├── db/
│   ├── search/
│   ├── website/
│   ├── instagram/
│   └── scoring/
│
└── types/
```

---

# 48. Backend Architecture

Next.js menangani:

```text
Authentication
API
CRUD
Dashboard
Server Actions
Database queries
```

Worker terpisah menangani:

```text
Search
Scraping / discovery
Website checking
Instagram checking
Queue processing
Scheduled jobs
```

Jangan menjalankan crawler berat di request lifecycle Next.js.

---

# 49. Worker

Technology:

```text
Node.js
TypeScript
BullMQ
Redis
```

Worker:

```text
worker/
├── queues/
├── jobs/
│   ├── website-discovery.ts
│   ├── website-check.ts
│   ├── instagram-discovery.ts
│   └── instagram-check.ts
├── providers/
│   ├── osm/
│   ├── searxng/
│   ├── website/
│   └── instagram/
└── scoring/
```

---

# 50. Search Provider Architecture

Jangan hard-code search engine.

Interface:

```text
SearchProvider
```

Methods:

```text
search(query)
```

Provider:

```text
SearXNGProvider
```

Future:

```text
GoogleProvider
BingProvider
BraveProvider
```

Tidak diperlukan pada MVP.

---

# 51. Website Provider Architecture

```text
WebsiteDiscoveryProvider
```

Providers:

```text
OpenStreetMapProvider
SearXNGWebsiteProvider
```

---

# 52. Instagram Provider Architecture

```text
InstagramDiscoveryProvider
```

Methods:

```text
discover()
verify()
getLatestPost()
getActivity()
```

Provider dibuat isolated karena mekanisme akses Instagram dapat berubah.

---

# 53. SearXNG

SearXNG dijalankan sebagai service Docker:

```text
searxng
```

Sistem dapat menggunakan private instance sehingga pencarian internal tidak bergantung pada public SearXNG instance. Dokumentasi resmi SearXNG juga merekomendasikan container/Compose untuk deployment dan mendukung private/self-hosted instances.

---

# 54. Docker Architecture

```text
                    Browser
                       │
                       ▼
                ┌─────────────┐
                │   Next.js   │
                │     App     │
                └──────┬──────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      ┌─────────────┐      ┌─────────────┐
      │ PostgreSQL  │      │    Redis    │
      └─────────────┘      └──────┬──────┘
                                  │
                                  ▼
                           ┌─────────────┐
                           │   Worker    │
                           └──────┬──────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                 SearXNG         OSM       Web/Instagram
```

---

# 55. Docker Services

```text
app
worker
postgres
redis
searxng
```

Optional:

```text
reverse-proxy
```

Development menggunakan:

```text
docker compose
```

Production dapat menggunakan Docker Compose di VPS.

---

# 56. Authentication

MVP:

```text
Email
Password
```

Role:

```text
ADMIN
SALES
VIEWER
```

Permissions:

| Feature        | Admin | Sales | Viewer |
| -------------- | ----: | ----: | -----: |
| View customers |     ✓ |     ✓ |      ✓ |
| Import         |     ✓ |     ✓ |      — |
| Run scan       |     ✓ |     ✓ |      — |
| Edit customer  |     ✓ |     ✓ |      — |
| Delete         |     ✓ |     — |      — |
| Settings       |     ✓ |     — |      — |

---

# 57. Audit Log

Table:

```text
audit_logs
```

Record:

```text
user
action
entity
entity_id
timestamp
metadata
```

Contoh:

```text
Joan
CONFIRM_INSTAGRAM
customer:123
2026-10-01
```

---

# 58. Security

Environment variables:

```text
DATABASE_URL
REDIS_URL
SEARXNG_URL
AUTH_SECRET
```

Tidak ada credentials di source code.

Customer data tidak boleh dikirim ke external AI provider pada MVP.

---

# 59. Privacy

System hanya menyimpan informasi yang diperlukan.

Untuk Instagram:

```text
Profile URL
Username
Last post date
Activity metrics
Discovery metadata
```

Tidak perlu menyimpan:

```text
Full post content
Images
Videos
Comments
DMs
Private account data
```

---

# 60. Rate Limiting

Semua external requests harus memiliki:

```text
Concurrency limit
Timeout
Retry
Backoff
Request logging
```

Contoh:

```text
Website checker:
Concurrency = 5

Search:
Concurrency = 2

Instagram:
Concurrency = configurable
```

Nilai tersebut configurable, bukan hard-coded.

---

# 61. Error States

Setiap provider harus dapat menghasilkan:

```text
SUCCESS
NOT_FOUND
RATE_LIMITED
TIMEOUT
BLOCKED
PROVIDER_ERROR
```

Mapping ke business status harus dilakukan secara eksplisit.

Contoh:

```text
RATE_LIMITED
≠
NOT_FOUND
```

---

# 62. Data Confidence

Setiap automated discovery memiliki:

```text
confidence_score
```

Example:

```text
90–100
Strong match

70–89
Likely match

50–69
Needs review

<50
Discard
```

Confidence score adalah internal matching score, bukan probabilitas.

---

# 63. Export

Supported:

```text
CSV
XLSX
```

Export mengikuti filter yang sedang aktif.

Contoh:

```text
Website = NOT_FOUND
Instagram = ACTIVE
City = Denpasar
```

Export:

```text
denpasar_website_opportunities.xlsx
```

Fields:

```text
Business
Contact
Phone
Email
Address
Category
Website
Website Status
Instagram
Instagram Status
Last Instagram Post
Posts 30 Days
Posts 90 Days
Opportunity
Confidence
Last Checked
```

---

# 64. Lead View

Dedicated page:

```text
/opportunities
```

Default segments:

```text
Website Opportunities
Website + Active Instagram
Social Opportunities
Needs Review
```

Ini adalah halaman yang paling sering digunakan sales.

---

# 65. Example Sales Dataset

Filter:

```text
Website:
NOT_FOUND

Instagram:
ACTIVE
```

Output:

| Business     | Instagram     | Last Post | Website   |
| ------------ | ------------- | --------- | --------- |
| Restaurant A | @restaurant_a | 2 days    | Not Found |
| Cafe B       | @cafeb        | 6 days    | Not Found |
| Spa C        | @spac         | 12 days   | Not Found |

Ini menjadi **target list Website Development**.

---

# 66. Recheck Logic

System menyimpan:

```text
last_checked_at
```

Kemudian menentukan kapan perlu dicek kembali.

### Website

```text
ACTIVE       → 30 days
INACTIVE     → 14 days
NOT_FOUND    → 7 days
NEEDS_REVIEW → 7 days
```

### Instagram

```text
ACTIVE       → 7 days
COOLING      → 7 days
INACTIVE     → 14 days
DORMANT      → 30 days
NOT_FOUND    → 7 days
NEEDS_REVIEW → 7 days
```

---

# 67. Important Product Rule

**System harus menyimpan history.**

Jangan hanya menyimpan:

```text
instagram_status = ACTIVE
```

Tetapi:

```text
1 Oct → ACTIVE
24 Sep → ACTIVE
17 Sep → ACTIVE
10 Sep → COOLING
```

Dengan demikian kita dapat melihat perubahan aktivitas.

---

# 68. Future Intelligence

Data history nantinya memungkinkan:

```text
Instagram:
Active
↓
Cooling
↓
Inactive
```

atau:

```text
No Website
↓
Website Found
```

System kemudian dapat mendeteksi perubahan digital presence.

---

# 69. Phase 2

Setelah MVP stabil:

### SEO Intelligence

Untuk website ACTIVE:

```text
HTTPS
PageSpeed
Indexability
Meta
Title
Canonical
Sitemap
Robots
Basic technical issues
```

Kemudian:

```text
SEO Opportunity Score
```

---

# 70. Phase 3

Business intelligence:

```text
Website
+
Instagram
+
SEO
+
Google Business Profile
```

menjadi:

```text
Digital Presence Score
```

---

# 71. Phase 4

Sales workflow:

```text
Opportunity
↓
Contacted
↓
Interested
↓
Meeting
↓
Proposal
↓
Won
↓
Lost
```

Pada tahap ini aplikasi dapat berkembang menjadi lightweight CRM.

---

# 72. MVP Acceptance Criteria

## Customer

* [ ] Import CSV.
* [ ] Import XLSX.
* [ ] Column mapping.
* [ ] Duplicate detection.
* [ ] Customer table.
* [ ] Customer detail.
* [ ] Search.
* [ ] Filtering.

## Website

* [ ] OSM discovery.
* [ ] SearXNG fallback.
* [ ] Candidate scoring.
* [ ] Domain verification.
* [ ] HTTP checking.
* [ ] HTTPS checking.
* [ ] Redirect handling.
* [ ] Status classification.
* [ ] History.

## Instagram

* [ ] Instagram profile discovery.
* [ ] Candidate scoring.
* [ ] Profile verification.
* [ ] Last post detection.
* [ ] 30-day activity count.
* [ ] 90-day activity count.
* [ ] Active status.
* [ ] Cooling status.
* [ ] Inactive status.
* [ ] Dormant status.
* [ ] Not Found.
* [ ] Needs Review.
* [ ] Scan Failed.
* [ ] History.

## Dashboard

* [ ] KPI cards.
* [ ] Customer table.
* [ ] Website filters.
* [ ] Instagram filters.
* [ ] Opportunity filters.
* [ ] Location filters.
* [ ] Category filters.
* [ ] Customer detail.

## Jobs

* [ ] Background queue.
* [ ] Scan progress.
* [ ] Retry.
* [ ] Backoff.
* [ ] Error handling.
* [ ] Scheduled scan.
* [ ] Scan history.

## Export

* [ ] CSV.
* [ ] XLSX.
* [ ] Filter-aware export.

---

# 73. Recommended Final Tech Stack

| Layer           | Technology                                   |
| --------------- | -------------------------------------------- |
| Framework       | **Next.js 16.3.8**                           |
| UI              | **React 19.3**                               |
| Styling         | **Tailwind CSS 4.3**                         |
| Language        | **TypeScript**                               |
| UI Components   | Custom + Radix/shadcn-style components       |
| Icons           | Lucide React                                 |
| Data Table      | TanStack Table                               |
| Charts          | Recharts                                     |
| Database        | **PostgreSQL 18+**                           |
| ORM             | **Prisma 7**                                 |
| Queue           | **BullMQ**                                   |
| Queue Storage   | **Redis**                                    |
| Search          | **SearXNG self-hosted**                      |
| Business Data   | **OpenStreetMap / Overpass**                 |
| Worker          | Node.js + TypeScript                         |
| Container       | Docker + Docker Compose                      |
| Auth            | Auth.js / equivalent Next.js-compatible auth |
| Validation      | Zod                                          |
| Package Manager | pnpm                                         |

Next.js 16.3.x dan React 19.3 adalah pilihan yang sesuai untuk aplikasi React modern saat ini; Tailwind 4.3 juga merupakan lini terbaru yang tersedia.

BullMQ dipilih agar worker bisa dipisahkan dari Next.js dan menangani retry, concurrency, delayed/scheduled jobs, dan crash recovery.

---

# 74. Project Structure

```text
customer-digital-tracker/
│
├── app/
│
├── worker/
│   ├── jobs/
│   ├── queues/
│   ├── providers/
│   └── scoring/
│
├── components/
│
├── lib/
│   ├── db/
│   ├── auth/
│   ├── search/
│   ├── website/
│   ├── instagram/
│   └── exports/
│
├── prisma/
│
├── public/
│
├── docker/
│   └── searxng/
│
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md
```

---

# 75. Development Priority

## Sprint 1 — Foundation

```text
Next.js
React
Tailwind
PostgreSQL
Prisma
Auth
Docker
```

## Sprint 2 — Customer

```text
Customer CRUD
CSV
XLSX
Import
Duplicate detection
```

## Sprint 3 — Website

```text
OSM
SearXNG
Candidate scoring
HTTP checker
Website status
```

## Sprint 4 — Instagram

```text
Instagram discovery
Profile matching
Last post
Activity calculation
Status
```

## Sprint 5 — Intelligence

```text
Dashboard
Filters
Opportunity segments
History
```

## Sprint 6 — Operations

```text
BullMQ
Redis
Background worker
Retry
Scheduled scan
Export
```

---

# 76. Definition of Done

MVP dianggap production-ready ketika:

```text
Customer imported
        ↓
Website scanned
        ↓
Instagram scanned
        ↓
Results persisted
        ↓
Dashboard updated
        ↓
Opportunity filtered
        ↓
Lead exported
```

dapat berjalan tanpa intervensi manual untuk setiap customer.

Manual intervention hanya diperlukan untuk:

```text
NEEDS_REVIEW
```

---

# 77. Final Product Concept

Produk ini bukan:

> "Website Checker."

Dan bukan:

> "Instagram Scraper."

Produk ini adalah:

> **Customer Digital Presence Intelligence System.**

Core loop:

```text
CUSTOMER
   ↓
DISCOVER
   ↓
VERIFY
   ↓
CLASSIFY
   ↓
MONITOR
   ↓
IDENTIFY OPPORTUNITY
   ↓
EXPORT TO SALES
```

Dengan MVP ini, database customer kamu bisa langsung berubah menjadi:

```text
┌─────────────────────────────────────────┐
│ DIGITAL PRESENCE                        │
├─────────────────────────────────────────┤
│                                         │
│ 1,284 Customers                         │
│                                         │
│ 812  Website Active                     │
│ 327  Website Not Found                  │
│ 145  Website Needs Review               │
│                                         │
│ 934  Instagram Active                   │
│ 286  Instagram Inactive/Dormant         │
│                                         │
├─────────────────────────────────────────┤
│ OPPORTUNITIES                           │
│                                         │
│ 184  No Website + Active Instagram      │
│ 219  Website + Inactive Instagram       │
│ 143  No Website + No Active Instagram   │
│                                         │
└─────────────────────────────────────────┘
```

**Core business outcome:**

> Dari database customer → mengetahui siapa yang belum punya website → mengetahui siapa yang masih aktif di Instagram → mendapatkan target prospect yang jauh lebih actionable untuk Website Development dan SEO.
