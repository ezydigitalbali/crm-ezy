async function testGoogle(query) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=id`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
    console.log('Google status:', res.status);
    const html = await res.text();
    console.log('HTML length:', html.length);
    // Cari semua link href di hasil pencarian
    const linkMatches = html.match(/href="https?:\/\/[^"&]+/g) || [];
    console.log('Found links count:', linkMatches.length);
    
    // Filter out google domains, directories, etc.
    const EXCLUDED = [
      'google.com', 'google.co.id', 'youtube.com', 'facebook.com', 'instagram.com', 
      'tiktok.com', 'tripadvisor.com', 'tripadvisor.co.id', 'traveloka.com', 'booking.com',
      'gofood.co.id', 'grab.com', 'tokopedia.com', 'shopee.co.id', 'maps.google.com', 'schema.org'
    ];
    
    const candidates = [];
    for (const raw of linkMatches) {
      const u = raw.replace(/^href="/, '');
      try {
        const parsed = new URL(u);
        const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
        if (!EXCLUDED.some(ex => host.includes(ex)) && !host.includes('google')) {
          candidates.push({ host, url: u });
        }
      } catch {}
    }
    
    console.log('Sample candidate URLs:', candidates.slice(0, 5));
  } catch (err) {
    console.error('Google test error:', err.message);
  }
}

async function run() {
  console.log('--- TEST: Aftertaste Bali website ---');
  await testGoogle('"Aftertaste" Bali website');
  console.log('\n--- TEST: Clip N Climb Bali website ---');
  await testGoogle('"Clip N Climb" Bali website');
}
run();
