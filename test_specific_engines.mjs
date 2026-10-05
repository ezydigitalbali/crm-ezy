async function testEngines() {
  const engines = ["bing", "google", "qwant", "yahoo", "duckduckgo"];
  for (const eng of engines) {
    try {
      const url = `http://127.0.0.1:8080/search?q=bali+restaurant&engines=${eng}&format=json`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      console.log(`Engine [${eng}]: results = ${data.results?.length || 0}, unresp:`, data.unresponsive_engines);
      if (data.results?.length > 0) {
        console.log(`  Top 1: ${data.results[0].title} -> ${data.results[0].url}`);
      }
    } catch (e) {
      console.log(`Engine [${eng}] error:`, e.message);
    }
  }
}

testEngines();
