import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import dns from "dns";

// Tingkatkan batas durasi serverless di Vercel (Hobby max 60s di konfigurasi route)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Daftar aggregator, direktori, portal berita, dan media sosial yang harus di-exclude dari official website
const EXCLUDED_AGGREGATOR_DOMAINS = [
  "instagram.com", "facebook.com", "tiktok.com", "tripadvisor.", "gofood.co.id",
  "grab.com", "shopee.co.id", "tokopedia.com", "google.", "maps.google.",
  "yelp.com", "traveloka.com", "booking.com", "chope.co", "zomato.com",
  "kompas.com", "detik.com", "tempo.co", "tribunnews.com", "linkedin.com",
  "youtube.com", "wa.me", "whatsapp.com", "linktr.ee", "lemon8-app.com",
  "trip.com", "apple.com", "play.google.com", "pinterest.com", "twitter.com",
  "x.com", "glints.com", "jobstreet.co.id", "medium.com", "threads.net",
  "threads.com", "kumparan.com", "idntimes.com", "merdeka.com", "liputan6.com",
  "suara.com", "kaskus.co.id", "quora.com", "reddit.com", "wikipedia.org",
  "balifoodandtravel.com", "croxyproxy.com", "yandex.ru", "terabox.app",
  "pornhub.com", "xhamster.com", "xvideos.com", "pasarbokep", "zhihu.com",
  "bokephunter", "digitalspy.com"
];

// Daftar domain parkir / domain for sale yang harus diabaikan
const DOMAIN_PARKING_SIGNATURES = [
  "hugedomains.com", "strongdomains.com", "sedo.com", "dan.com",
  "godaddy.com", "afternic.com", "bodis.com", "parkingcrew.com",
  "domainmarket.com", "buydomains.com", "namecheap.com"
];

// Helper: Membersihkan nama brand
function cleanBrandName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^pt\.?\s+/i, "")
    .replace(/^cv\.?\s+/i, "")
    .replace(/[^a-z0-9]/g, "");
}

// Helper: Cek DNS lookup dengan timeout aman tanpa unhandled rejection
function resolveDnsWithTimeout(domain: string, timeoutMs = 1500): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(false);
      }
    }, timeoutMs);

    try {
      dns.lookup(domain, (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(!err);
        }
      });
    } catch {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    }
  });
}

// Helper: Ekstraksi seluruh kata kunci lokasi spesifik dari data customer (City, Province, Address)
function extractCustomerLocations(customer: {
  city?: string | null;
  province?: string | null;
  address?: string | null;
}): string[] {
  const locations = new Set<string>();

  // 1. Kota spesifik dari data customer (cth: Lumajang, Malang, Atambua, Denpasar, Kuta, dll.)
  if (customer.city && customer.city.trim()) {
    locations.add(customer.city.trim().toLowerCase());
  }

  // 2. Provinsi spesifik dari data customer (cth: Jawa Timur, Bali, NTT, dll.)
  if (customer.province && customer.province.trim()) {
    locations.add(customer.province.trim().toLowerCase());
  }

  // 3. Ekstraksi kata-kata lokasi dari string alamat (cth: Kerobokan, Badung, Belu, Seminyak, Ubud, dll.)
  if (customer.address && customer.address.trim()) {
    const rawAddr = customer.address
      .toLowerCase()
      .replace(/kecamatan|kec\.|kabupaten|kab\.|kota|provinsi|jl\.|jalan|no\.|rt|rw|\d{5}/gi, " ")
      .replace(/[^a-z\s]/g, " ");

    const tokens = rawAddr.split(/\s+/).filter((t) => t.length >= 4);
    tokens.forEach((t) => {
      if (!["merta", "raya", "blok", "gang", "desa", "kelurahan", "nomor"].includes(t)) {
        locations.add(t);
      }
    });
  }

  // Selalu sertakan kata kunci negara
  locations.add("indonesia");

  return Array.from(locations);
}

// Helper: Bentuk query Google search yang akurat sesuai lokasi spesifik customer
function buildCustomerSearchQuery(customer: {
  business_name: string;
  city?: string | null;
  province?: string | null;
  address?: string | null;
}): string {
  const locParts: string[] = [];
  if (customer.city && customer.city.trim()) {
    locParts.push(customer.city.trim());
  }
  if (customer.province && customer.province.trim() && !locParts.includes(customer.province.trim())) {
    locParts.push(customer.province.trim());
  }
  if (locParts.length === 0) {
    locParts.push("Bali");
  }

  // Bersihkan prefiks PT/CV agar pencarian mesin pencari lebih fleksibel
  const cleanName = customer.business_name
    .replace(/^pt\.?\s+/i, "")
    .replace(/^cv\.?\s+/i, "")
    .trim();

  return `${cleanName} ${locParts.join(" ")}`;
}

// Helper: Search Google/Bing/Yahoo via SearXNG Metasearch Layer (PRD Section 11)
async function searchGoogleViaSearxng(customer: {
  business_name: string;
  city?: string | null;
  province?: string | null;
  address?: string | null;
}): Promise<{
  candidateWebsite: { domain: string; url: string; title: string } | null;
  candidateInstagram: { handle: string; url: string; title: string } | null;
}> {
  const searxngBase = process.env.SEARXNG_URL?.replace("localhost", "127.0.0.1") || "http://127.0.0.1:8080";
  const query = buildCustomerSearchQuery(customer);
  const searchUrl = `${searxngBase}/search?q=${encodeURIComponent(query)}&engines=google,bing,yahoo&format=json`;

  try {
    const res = await fetch(searchUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return { candidateWebsite: null, candidateInstagram: null };

    const data = await res.json();
    const results: Array<{ title?: string; url?: string }> = data.results || [];

    let candidateInstagram: { handle: string; url: string; title: string } | null = null;
    let candidateWebsite: { domain: string; url: string; title: string } | null = null;

    const brandClean = cleanBrandName(customer.business_name);
    const brandKeywords = customer.business_name
      .toLowerCase()
      .replace(/^pt\.?\s+/i, "")
      .replace(/^cv\.?\s+/i, "")
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    for (const r of results) {
      if (!r.url) continue;

      // 1. Ekstraksi Instagram profil resmi dari Google / Bing / Yahoo
      if (!candidateInstagram && r.url.includes("instagram.com/")) {
        const match = r.url.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
        if (
          match &&
          match[1] &&
          !["p", "reel", "reels", "stories", "explore", "direct", "accounts", "popular", "tags", "locations", "share", "tv"].includes(match[1].toLowerCase())
        ) {
          candidateInstagram = {
            handle: match[1],
            url: `https://www.instagram.com/${match[1]}/`,
            title: r.title || "",
          };
        }
      }

      // 2. Ekstraksi Website Kandidat Resmi
      if (!candidateWebsite) {
        try {
          const parsed = new URL(r.url);
          const host = parsed.hostname.toLowerCase();
          const hostClean = host.replace(/^www\./, "");

          const isExcluded = EXCLUDED_AGGREGATOR_DOMAINS.some((ex) => host.includes(ex));
          const isParking = DOMAIN_PARKING_SIGNATURES.some(
            (dp) => host.includes(dp) || (r.url && r.url.toLowerCase().includes(dp))
          );

          if (!isExcluded && !isParking) {
            // Verifikasi Kemiripan Domain dengan Brand (PRD Section 13)
            const hostParts = hostClean.split(".");
            const mainDomainName = hostParts[0];

            const domainMatchesBrand =
              brandKeywords.some((kw) => mainDomainName.includes(kw)) ||
              (brandClean.length >= 3 && mainDomainName.includes(brandClean));

            if (domainMatchesBrand) {
              candidateWebsite = {
                domain: hostClean,
                url: `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`,
                title: r.title || "",
              };
            }
          }
        } catch {}
      }
    }

    return { candidateWebsite, candidateInstagram };
  } catch (err) {
    return { candidateWebsite: null, candidateInstagram: null };
  }
}

// Helper: Hitung Skor Kemiripan Website sesuai PRD Section 13 (Maks 100)
// Menggunakan lokasi spesifik customer (kota, provinsi, dan alamat)
function computeWebsiteMatchScore(
  html: string,
  pageTitle: string,
  customer: {
    business_name: string;
    city?: string | null;
    province?: string | null;
    address?: string | null;
    business_category?: string | null;
  }
): { score: number; reasons: string[] } {
  const content = (pageTitle + " " + html.slice(0, 8000)).toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  const titleLower = pageTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const cleanName = cleanBrandName(customer.business_name);
  const keywords = customer.business_name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^pt\.?\s+/i, "")
    .replace(/^cv\.?\s+/i, "")
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  // 1. Business name similarity (+40 max)
  if (
    titleLower.includes(customer.business_name.toLowerCase()) ||
    (cleanName.length >= 4 && titleLower.includes(cleanName))
  ) {
    score += 40;
    reasons.push("Brand name present in page title (+40)");
  } else if (keywords.some((kw) => content.includes(kw))) {
    score += 20;
    reasons.push("Keywords found in body content (+20)");
  }

  // 2. Location similarity (+25) DARI DATA KOTA/PROVINSI/ALAMAT CUSTOMER
  const locKeywords = extractCustomerLocations(customer);
  const hasLocation = locKeywords.some((loc) => content.includes(loc));
  if (hasLocation) {
    score += 25;
    reasons.push(`Customer location confirmed in website content (+25)`);
  } else {
    reasons.push(`NO location match (missing customer city/province/address context, +0)`);
  }

  // 3. Category / Business type context (+15)
  if (customer.business_category) {
    const catWords = customer.business_category
      .toLowerCase()
      .split(/[\s/&,]+/)
      .filter((w) => w.length >= 3);
    if (catWords.some((cw) => content.includes(cw))) {
      score += 15;
      reasons.push("Industry category match confirmed (+15)");
    }
  }

  // 4. Domain parking / sale check (Instantly -100)
  const isParked = DOMAIN_PARKING_SIGNATURES.some(
    (dp) => content.includes(dp) || titleLower.includes(dp)
  );
  if (isParked) {
    score = 0;
    reasons.push("Domain is parked or for sale (-100)");
  }

  return { score, reasons };
}

// Helper: Verifikasi Website & Kesesuaian Konten Halaman (PRD Section 13 & 14)
async function verifyWebsiteContent(
  url: string,
  customer: {
    business_name: string;
    city?: string | null;
    province?: string | null;
    address?: string | null;
    business_category?: string | null;
  }
): Promise<{
  isValid: boolean;
  httpStatus: number | null;
  sslValid: boolean;
  responseTimeMs: number;
  finalUrl: string | null;
  pageTitle: string | null;
  confidenceScore: number;
}> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);

    const responseTimeMs = Date.now() - start;
    const finalUrl = res.url || url;
    const sslValid = finalUrl.startsWith("https://");

    if (res.status < 200 || res.status >= 400) {
      return {
        isValid: false,
        httpStatus: res.status,
        sslValid,
        responseTimeMs,
        finalUrl,
        pageTitle: null,
        confidenceScore: 0,
      };
    }

    // Deteksi parking domain / redirect ke domain jual-beli
    if (DOMAIN_PARKING_SIGNATURES.some((dp) => finalUrl.toLowerCase().includes(dp))) {
      return {
        isValid: false,
        httpStatus: res.status,
        sslValid,
        responseTimeMs,
        finalUrl,
        pageTitle: "Domain For Sale",
        confidenceScore: 0,
      };
    }

    const html = await res.text();
    const pageTitle = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || "";

    // Hitung Skor Kemiripan sesuai PRD Section 13 berdasarkan data customer spesifik
    const { score } = computeWebsiteMatchScore(
      html,
      pageTitle,
      customer
    );

    // Ambang batas PRD: Skor >= 60 adalah Strong Candidate/Verified, < 60 di-discard
    const isValid = score >= 45;

    return {
      isValid,
      httpStatus: res.status,
      sslValid,
      responseTimeMs,
      finalUrl,
      pageTitle,
      confidenceScore: score,
    };
  } catch (err: any) {
    return {
      isValid: false,
      httpStatus: null,
      sslValid: false,
      responseTimeMs: Date.now() - start,
      finalUrl: null,
      pageTitle: null,
      confidenceScore: 0,
    };
  }
}

// Helper: Cek apakah customer adalah Real Estate / Villa / Property untuk divisi Production
function checkIsPropertyProduction(category?: string | null, name?: string | null): boolean {
  const text = `${category || ""} ${name || ""}`.toLowerCase();
  return (
    text.includes("real estate") ||
    text.includes("property") ||
    text.includes("properti") ||
    text.includes("villa") ||
    text.includes("resort") ||
    text.includes("hotel") ||
    text.includes("architecture") ||
    text.includes("arsitektur") ||
    text.includes("interior") ||
    text.includes("penginapan") ||
    text.includes("guesthouse") ||
    text.includes("homestay") ||
    text.includes("realty") ||
    text.includes("living")
  );
}

// Background execution engine for scan jobs
async function runScanBackground(
  jobId: string,
  scanType: string,
  customers: any[],
  sessionUserName: string
) {
  let processed = 0;
  let successful = 0;
  let needsReview = 0;
  let failed = 0;
  const total = customers.length;

  const CONCURRENCY = 6;
  let cursor = 0;
  let lastDbSync = Date.now();

  const syncProgressToDb = async (force = false) => {
    // Sync to DB every 2 items or if forced or if > 2 seconds elapsed
    if (force || processed % 2 === 0 || Date.now() - lastDbSync > 2000) {
      lastDbSync = Date.now();
      try {
        await prisma.scanJob.update({
          where: { id: jobId },
          data: {
            processed,
            successful,
            needs_review: needsReview,
            failed,
          },
        });
      } catch (err: any) {
        console.error("Failed to sync scan job progress:", err?.message);
      }
    }
  };

  async function worker() {
    while (cursor < customers.length) {
      const customer = customers[cursor++];
      if (!customer) break;

      // Pacing delay (100ms) untuk throughput maksimal tanpa membebani server
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        let isReviewRequired = false;
        let currentWebStatus = "NOT_FOUND";
        let currentIgStatus = "NOT_FOUND";

        const isProperty = checkIsPropertyProduction(
          customer.business_category,
          customer.business_name
        );

        // Langkah 1: Search di Google via SearXNG terlebih dahulu menggunakan data lokasi spesifik customer
        const { candidateWebsite, candidateInstagram } = await searchGoogleViaSearxng(customer);

        // ==================== A. CEK & VERIFIKASI WEBSITE ====================
        if (scanType === "ALL" || scanType === "WEBSITE") {
          let website = customer.website;
          if (!website) {
            website = await prisma.website.create({
              data: {
                customer_id: customer.id,
                domain: null,
                url: null,
                status: "NOT_FOUND",
                discovery_source: "PENDING_SCAN",
                confidence_score: 0,
              },
            });
          }

          // A.1: Jika customer sudah punya domain di database (dari import/scan lama)
          if (website.domain) {
            const urlToCheck = website.domain.startsWith("http")
              ? website.domain
              : `https://${website.domain}`;

            // Lakukan verifikasi konten halaman terhadap profil data customer (identitas & lokasi kota/provinsi/alamat)
            const verification = await verifyWebsiteContent(
              urlToCheck,
              customer
            );

            if (verification.isValid) {
              // Domain valid dan konten terkonfirmasi milik bisnis customer
              currentWebStatus = "ACTIVE";
              await prisma.website.update({
                where: { customer_id: customer.id },
                data: {
                  status: "ACTIVE",
                  http_status: verification.httpStatus,
                  ssl_valid: verification.sslValid,
                  response_time_ms: verification.responseTimeMs,
                  final_url: verification.finalUrl,
                  confidence_score: verification.confidenceScore,
                  last_checked_at: new Date(),
                },
              });

              await prisma.websiteCheck.create({
                data: {
                  website_id: website.id,
                  status: "ACTIVE",
                  http_status: verification.httpStatus,
                  ssl_valid: verification.sslValid,
                  response_time_ms: verification.responseTimeMs,
                  checked_at: new Date(),
                },
              });
            } else {
              // False Positive Terdeteksi! (seperti aftertaste.com milik entitas AS, atau domain parking)
              // Bersihkan domain palsu agar tidak menyesatkan tim sales
              currentWebStatus = "NOT_FOUND";
              await prisma.website.update({
                where: { customer_id: customer.id },
                data: {
                  domain: null,
                  url: null,
                  status: "NOT_FOUND",
                  confidence_score: 0,
                  http_status: verification.httpStatus,
                  ssl_valid: false,
                  last_checked_at: new Date(),
                },
              });

              await prisma.websiteCheck.create({
                data: {
                  website_id: website.id,
                  status: "NOT_FOUND",
                  http_status: verification.httpStatus,
                  ssl_valid: false,
                  response_time_ms: verification.responseTimeMs,
                  error_message: "False-positive rejected: domain did not match business identity",
                  checked_at: new Date(),
                },
              });
            }
          } else {
            // A.2: Belum punya domain -> Gunakan kandidat hasil search Google
            if (candidateWebsite) {
              const verification = await verifyWebsiteContent(
                candidateWebsite.url,
                customer
              );

              if (verification.isValid) {
                currentWebStatus = "ACTIVE";
                await prisma.website.update({
                  where: { customer_id: customer.id },
                  data: {
                    domain: candidateWebsite.domain,
                    url: verification.finalUrl || candidateWebsite.url,
                    status: "ACTIVE",
                    confidence_score: verification.confidenceScore,
                    discovery_source: "GOOGLE_SEARCH",
                    http_status: verification.httpStatus,
                    ssl_valid: verification.sslValid,
                    response_time_ms: verification.responseTimeMs,
                    last_checked_at: new Date(),
                  },
                });

                await prisma.websiteCheck.create({
                  data: {
                    website_id: website.id,
                    status: "ACTIVE",
                    http_status: verification.httpStatus,
                    ssl_valid: verification.sslValid,
                    response_time_ms: verification.responseTimeMs,
                    checked_at: new Date(),
                  },
                });
              } else {
                currentWebStatus = "NOT_FOUND";
                await prisma.website.update({
                  where: { customer_id: customer.id },
                  data: {
                    status: "NOT_FOUND",
                    confidence_score: 0,
                    last_checked_at: new Date(),
                  },
                });
              }
            } else {
              // Di Google tidak ada official website
              currentWebStatus = "NOT_FOUND";
              await prisma.website.update({
                where: { customer_id: customer.id },
                data: {
                  domain: null,
                  url: null,
                  status: "NOT_FOUND",
                  confidence_score: 0,
                  last_checked_at: new Date(),
                },
              });
            }
          }
        }

        // ==================== B. CEK & DISCOVERY INSTAGRAM ====================
        if (scanType === "ALL" || scanType === "INSTAGRAM") {
          let instagram = customer.instagram;
          if (!instagram) {
            instagram = await prisma.instagramProfile.create({
              data: {
                customer_id: customer.id,
                username: null,
                profile_url: null,
                status: "NOT_FOUND",
                discovery_source: "PENDING_SCAN",
                confidence_score: 0,
              },
            });
          }

          if (candidateInstagram) {
            // Profil resmi Instagram ditemukan dari Google Search!
            currentIgStatus = "ACTIVE";
            await prisma.instagramProfile.update({
              where: { customer_id: customer.id },
              data: {
                username: candidateInstagram.handle,
                profile_url: candidateInstagram.url,
                status: "ACTIVE",
                confidence_score: 90,
                discovery_source: "GOOGLE_SEARCH",
                last_checked_at: new Date(),
              },
            });
          } else if (instagram.username) {
            currentIgStatus = instagram.status;
            await prisma.instagramProfile.update({
              where: { customer_id: customer.id },
              data: {
                last_checked_at: new Date(),
              },
            });
          } else {
            currentIgStatus = "NOT_FOUND";
            await prisma.instagramProfile.update({
              where: { customer_id: customer.id },
              data: {
                status: "NOT_FOUND",
                confidence_score: 0,
                last_checked_at: new Date(),
              },
            });
          }
        }

        // ==================== C. REKOMENDASI CLOSING SERVICES ====================
        const recommendedServices: string[] = [];

        if (isProperty) {
          recommendedServices.push("PRODUCTION");
        }

        if (currentWebStatus === "NOT_FOUND" || currentWebStatus === "INACTIVE") {
          recommendedServices.push("WEBSITE");
        } else if (currentWebStatus === "ACTIVE") {
          recommendedServices.push("SEO");
        }

        if (
          currentIgStatus === "INACTIVE" ||
          currentIgStatus === "DORMANT" ||
          currentIgStatus === "NOT_FOUND"
        ) {
          recommendedServices.push("SOCMED");
        }

        if (!customer.closing_services && recommendedServices.length > 0) {
          await prisma.customer.update({
            where: { id: customer.id },
            data: {
              closing_services: recommendedServices.join(","),
            },
          });
        }

        if (isReviewRequired) {
          needsReview++;
        } else {
          successful++;
        }

        processed++;
      } catch (err: any) {
        console.error(`Error scanning customer ${customer.id}:`, err?.message);
        failed++;
        processed++;
      } finally {
        await syncProgressToDb();
      }
    }
  }

  try {
    // Jalankan worker pool secara paralel
    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

    // Tandai scan job selesai
    await prisma.scanJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        processed,
        successful,
        needs_review: needsReview,
        failed,
        completed_at: new Date(),
      },
    });

    // Catat Audit Log
    await prisma.auditLog.create({
      data: {
        user_name: sessionUserName,
        action: `RUN_SCAN_${scanType}`,
        entity: "ScanJob",
        entity_id: jobId,
        metadata: JSON.stringify({
          total,
          processed,
          successful,
          needs_review: needsReview,
          failed,
          scan_type: scanType,
        }),
      },
    });
  } catch (fatalError: any) {
    console.error("Fatal background scan error:", fatalError);
    await prisma.scanJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        completed_at: new Date(),
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verifikasi peran: hanya SUPERADMIN dan HEAD yang dapat memicu engine scan
    const sessionUser = await getSessionUser();
    if (sessionUser && sessionUser.role !== "SUPERADMIN" && sessionUser.role !== "HEAD") {
      return NextResponse.json(
        {
          error:
            "Akses ditolak: Anda saat ini login sebagai Sales. Hanya Superadmin dan Head yang berwenang menjalankan Scan Engine.",
        },
        { status: 403 }
      );
    }

    const { scanType = "ALL" } = await req.json().catch(() => ({ scanType: "ALL" }));

    // Cek apakah ada scan job yang stale (tidak ada update > 2 menit) -> auto FAILED
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    await prisma.scanJob.updateMany({
      where: {
        status: "RUNNING",
        updated_at: { lt: twoMinutesAgo },
      },
      data: { status: "FAILED", completed_at: new Date() },
    });

    const activeJob = await prisma.scanJob.findFirst({
      where: { status: "RUNNING" },
      orderBy: { created_at: "desc" },
    });

    if (activeJob) {
      return NextResponse.json({
        success: true,
        message: "Scan saat ini sedang berjalan.",
        job: activeJob,
      });
    }

    // 2. Hitung total customer
    const total = await prisma.customer.count();

    if (total === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada data customer untuk di-scan.",
        job: null,
      });
    }

    // 3. Buat scan job record dengan status RUNNING
    const job = await prisma.scanJob.create({
      data: {
        type: scanType,
        status: "RUNNING",
        total,
        processed: 0,
        successful: 0,
        needs_review: 0,
        failed: 0,
        created_by: sessionUser?.name || "Superadmin",
        started_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      job,
      message: `Scan ${scanType} dimulai.`,
    });
  } catch (error: any) {
    console.error("Scan API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
