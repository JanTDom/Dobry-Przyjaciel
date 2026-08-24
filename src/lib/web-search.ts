/**
 * Szybkie i niezawodne wyszukiwanie w internecie w czasie rzeczywistym
 */
export async function searchLiveWeb(query: string): Promise<string> {
  if (!query || query.trim().length === 0) return "";
  
  const cleanQuery = query.trim();

  // 1. DuckDuckGo Instant Answer API (JSON)
  try {
    const instantUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
    const instantRes = await fetch(instantUrl, {
      headers: { "User-Agent": "PrzyjacielApp/1.0" },
      next: { revalidate: 60 },
    });
    
    if (instantRes.ok) {
      const data = await instantRes.json();
      const parts: string[] = [];
      if (data.AbstractText) parts.push(data.AbstractText);
      if (data.Answer) parts.push(data.Answer);
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 3)) {
          if (topic.Text) parts.push(topic.Text);
        }
      }
      if (parts.length > 0) {
        return parts.join("\n\n");
      }
    }
  } catch (e) {
    console.warn("DuckDuckGo Instant Answer error:", e);
  }

  // 2. DuckDuckGo HTML Search Scraper (pełne wyniki na żywo)
  try {
    const htmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`;
    const res = await fetch(htmlUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8",
      },
    });

    if (res.ok) {
      const html = await res.text();
      const snippets: string[] = [];
      const resultBlockRegex = /<div class="result__body">([\s\S]*?)<\/div>/gi;
      let match;
      while ((match = resultBlockRegex.exec(html)) !== null && snippets.length < 4) {
        const text = match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (text.length > 20) {
          snippets.push(text);
        }
      }

      if (snippets.length > 0) {
        return snippets.join("\n---\n");
      }
    }
  } catch (e) {
    console.warn("DuckDuckGo HTML search error:", e);
  }

  // 3. Fallback: Wikipedia API po polsku
  try {
    const wikiUrl = `https://pl.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&utf8=1`;
    const wikiRes = await fetch(wikiUrl);
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      const searchItems = wikiData.query?.search || [];
      if (searchItems.length > 0) {
        const wikiSnippets = searchItems.slice(0, 3).map((item: any) => {
          const cleanSnippet = (item.snippet || "").replace(/<[^>]+>/g, "");
          return `${item.title}: ${cleanSnippet}`;
        });
        return wikiSnippets.join("\n---\n");
      }
    }
  } catch (e) {
    console.warn("Wikipedia fallback search error:", e);
  }

  return "";
}
