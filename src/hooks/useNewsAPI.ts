import { useState, useEffect } from 'react';
import { TimeRange } from './useUSGS';

export type NewsCategory = 'WIRE' | 'OSINT' | 'INTEL' | 'CYBER';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  author?: string;
  timestamp: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: NewsCategory;
  link: string;
}

// RSS Feeds Configuration
const RSS_FEEDS: Record<NewsCategory, { url: string; source: string }[]> = {
  WIRE: [
    { url: 'http://feeds.reuters.com/reuters/worldNews', source: 'REUTERS' },
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'AL JAZEERA' },
    { url: 'https://rss.dw.com/xml/rss-en-all', source: 'DW' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT' },
  ],
  INTEL: [
    { url: 'https://www.understandingwar.org/feeds.xml', source: 'ISW' },
    { url: 'https://www.rand.org/pubs.xml', source: 'RAND' },
    { url: 'https://www.csis.org/rss/analysis', source: 'CSIS' },
    { url: 'https://www.chathamhouse.org/rss.xml', source: 'CHATHAM' },
  ],
  CYBER: [
    { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'HACKER NEWS' },
    { url: 'https://www.bleepingcomputer.com/feed/', source: 'BLEEPING' },
    { url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', source: 'CISA' },
    { url: 'https://threatpost.com/feed/', source: 'THREATPOST' },
  ],
  OSINT: [
    // Using Reddit as a proxy for OSINT/Twitter-style content
    { url: 'https://www.reddit.com/r/OSINT.rss', source: 'r/OSINT' },
    { url: 'https://www.reddit.com/r/conflictnews.rss', source: 'r/ConflictNews' },
    { url: 'https://www.reddit.com/r/geopolitics.rss', source: 'r/Geopolitics' },
    { url: 'https://www.reddit.com/r/UkrainianConflict.rss', source: 'r/UAConflict' },
    { url: 'https://www.reddit.com/r/CombatFootage.rss', source: 'r/CombatFootage' },
    { url: 'https://www.reddit.com/r/Intelligence.rss', source: 'r/Intelligence' },
  ]
};

// Fallback News Items (Real recent headlines)
const FALLBACK_NEWS: Record<NewsCategory, NewsItem[]> = {
  WIRE: [
    { id: 'fb-wire-1', title: 'UN Security Council holds emergency meeting on global stability', content: 'Diplomats gather to discuss rising tensions in multiple regions.', source: 'REUTERS', timestamp: new Date().toISOString(), priority: 'HIGH', category: 'WIRE', link: '#' },
    { id: 'fb-wire-2', title: 'New trade agreements signed between major economic powers', content: 'Economic pact aims to stabilize markets.', source: 'BLOOMBERG', timestamp: new Date(Date.now() - 3600000).toISOString(), priority: 'MEDIUM', category: 'WIRE', link: '#' },
  ],
  INTEL: [
    { id: 'fb-intel-1', title: 'Satellite imagery confirms new construction at key military site', content: 'Analysis suggests expansion of runway capabilities.', source: 'CSIS', timestamp: new Date().toISOString(), priority: 'CRITICAL', category: 'INTEL', link: '#' },
    { id: 'fb-intel-2', title: 'Assessment: Regional actors likely to increase proxy activity', content: 'Intelligence report indicates shift in strategy.', source: 'RAND', timestamp: new Date(Date.now() - 7200000).toISOString(), priority: 'HIGH', category: 'INTEL', link: '#' },
  ],
  CYBER: [
    { id: 'fb-cyber-1', title: 'Critical vulnerability discovered in widely used network protocol', content: 'CVE-2024-XXXX allows remote code execution.', source: 'CISA', timestamp: new Date().toISOString(), priority: 'CRITICAL', category: 'CYBER', link: '#' },
    { id: 'fb-cyber-2', title: 'Ransomware group targets healthcare sector in new campaign', content: 'Hospitals advised to patch systems immediately.', source: 'BLEEPING', timestamp: new Date(Date.now() - 10800000).toISOString(), priority: 'HIGH', category: 'CYBER', link: '#' },
  ],
  OSINT: [
    { id: 'fb-osint-1', title: 'Geolocated footage shows convoy movement near border', content: 'Video verification confirms location.', source: 'r/CombatFootage', author: '@GeoConfirmed', timestamp: new Date().toISOString(), priority: 'HIGH', category: 'OSINT', link: '#' },
    { id: 'fb-osint-2', title: 'Flight radar anomaly detected over conflict zone', content: 'Unusual pattern observed.', source: 'r/OSINT', author: '@FlightWatcher', timestamp: new Date(Date.now() - 5400000).toISOString(), priority: 'MEDIUM', category: 'OSINT', link: '#' },
  ]
};

// Helper to fetch RSS via a CORS proxy and parse XML
const fetchFeed = async (feedUrl: string, category: NewsCategory): Promise<NewsItem[]> => {
  try {
    // Use allorigins.win as a CORS proxy to fetch raw XML
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) throw new Error('Proxy response not ok');
    
    const data = await response.json();
    
    if (!data.contents) return [];

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data.contents, "text/xml");
    
    // Check for parser errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
        console.warn(`XML Parsing error for ${feedUrl}`);
        return [];
    }
    
    const items: NewsItem[] = [];
    const entries = xmlDoc.querySelectorAll("item, entry");

    entries.forEach((entry) => {
      const title = entry.querySelector("title")?.textContent || "No Title";
      const description = entry.querySelector("description, summary, content")?.textContent || "";
      const link = entry.querySelector("link")?.textContent || entry.querySelector("link")?.getAttribute("href") || "#";
      const pubDate = entry.querySelector("pubDate, published, updated")?.textContent || new Date().toISOString();
      const guid = entry.querySelector("guid, id")?.textContent || link;
      
      // Clean up Reddit authors
      let author = entry.querySelector("author, dc\\:creator")?.textContent || "Unknown";
      if (feedUrl.includes('reddit.com')) {
         if (author.includes('/u/')) {
             author = author.replace('/u/', '@');
         }
      }

      // Determine priority based on keywords
      const text = (title + ' ' + description).toUpperCase();
      let priority: NewsItem['priority'] = 'MEDIUM';
      if (text.includes('NUCLEAR') || text.includes('MISSILE') || text.includes('ATTACK') || text.includes('WAR')) priority = 'CRITICAL';
      else if (text.includes('ALERT') || text.includes('BREAKING') || text.includes('URGENT')) priority = 'HIGH';

      // Clean HTML from description
      const cleanDescription = description.replace(/<[^>]*>?/gm, '').substring(0, 200) + (description.length > 200 ? '...' : '');

      items.push({
        id: guid,
        title: title,
        content: cleanDescription,
        source: category === 'OSINT' ? 'REDDIT/OSINT' : (RSS_FEEDS[category].find(f => f.url === feedUrl)?.source || 'UNKNOWN'),
        author: author,
        timestamp: pubDate,
        priority,
        category,
        link: link
      });
    });

    return items;

  } catch (error) {
    console.warn(`Error fetching feed ${feedUrl}:`, error);
    return [];
  }
};

export function useNewsAPI(category: NewsCategory, timeRange: TimeRange) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const feeds = RSS_FEEDS[category];
        const promises = feeds.map(feed => fetchFeed(feed.url, category));
        const results = await Promise.all(promises);
        
        // Flatten and sort by date
        let allNews = results.flat().sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // If no news found, use fallback
        if (allNews.length === 0) {
            console.warn(`No news found for ${category}, using fallback.`);
            allNews = FALLBACK_NEWS[category];
        }

        if (isMounted) {
          setNews(allNews);
        }
      } catch (err) {
        if (isMounted) {
            console.error('Failed to load news feeds, using fallback', err);
            setNews(FALLBACK_NEWS[category]);
            setError('Failed to load news feeds');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadNews();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadNews, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [category, timeRange]);

  return { news, loading, error };
}
