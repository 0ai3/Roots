export type NewsImage = {
  url: string;
  description: string;
};

export type NewsSource = {
  website: string;
  author: string;
};

export type NewsArticle = {
  _id: string;
  title: string;
  date_created: string;
  source: NewsSource;
  content: {
    text: string;
    images: NewsImage[];
  };
  country: string;
  continent: string;
};

const NEWS_ARTICLES: NewsArticle[] = [
  {
    _id: "news-1",
    title: "China's Economic Growth Slows Amid Global Uncertainty",
    date_created: "2025-11-15",
    source: {
      website: "www.china-daily.com",
      author: "Li Wei",
    },
    content: {
      text: "China's economy faces a significant slowdown as it grapples with trade tensions and a global recession. Experts warn that growth could dip below 5% in the coming quarter, a sharp contrast from earlier projections.",
      images: [
        {
          url: "https://www.china-daily.com/images/economic-slowdown.jpg",
          description:
            "A street scene in Beijing showing a mix of retail stores and empty storefronts, illustrating China's economic uncertainty.",
        },
        {
          url: "https://www.china-daily.com/images/china-economy-graph.jpg",
          description: "Graph showing the decline in China's GDP growth rate over the past year.",
        },
      ],
    },
    country: "China",
    continent: "Asia",
  },
  {
    _id: "news-2",
    title: "China Launches Mars Exploration Rover",
    date_created: "2025-11-14",
    source: {
      website: "www.space-news.cn",
      author: "Zhang Tao",
    },
    content: {
      text: "China successfully launched its new Mars exploration rover, which will study the planet's atmosphere, surface, and potential signs of life. This marks a major milestone in China's space exploration program.",
      images: [
        {
          url: "https://www.space-news.cn/images/mars-rover-launch.jpg",
          description: "The Mars rover being launched from the Jiuquan Satellite Launch Center.",
        },
        {
          url: "https://www.space-news.cn/images/mars-rover-closeup.jpg",
          description:
            "Close-up of the rover's main camera array, designed to capture high-definition images of the Martian surface.",
        },
      ],
    },
    country: "China",
    continent: "Asia",
  },
  {
    _id: "news-3",
    title: "India's Economic Outlook Brightens as Reforms Take Effect",
    date_created: "2025-11-16",
    source: {
      website: "www.india-times.com",
      author: "Rajesh Kumar",
    },
    content: {
      text: "India's economy is showing signs of recovery after major reforms in key sectors, including manufacturing and agriculture. Growth is expected to exceed 7% for the upcoming fiscal year.",
      images: [
        {
          url: "https://www.india-times.com/images/india-reform-impact.jpg",
          description:
            "A bustling manufacturing plant in India, showing increased production after recent reforms.",
        },
      ],
    },
    country: "India",
    continent: "Asia",
  },
];

const slugify = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export type CountrySummary = {
  name: string;
  slug: string;
  count: number;
};

export type ContinentSummary = {
  name: string;
  slug: string;
  count: number;
  countries: CountrySummary[];
};

function buildGeoIndex() {
  const continents = new Map<
    string,
    { name: string; slug: string; count: number; countries: Map<string, CountrySummary> }
  >();

  for (const article of NEWS_ARTICLES) {
    const continentName = article.continent || "Global";
    const continentSlug = slugify(continentName);
    const existingContinent = continents.get(continentSlug);
    let continentEntry = existingContinent;

    if (!continentEntry) {
      continentEntry = {
        name: continentName,
        slug: continentSlug,
        count: 0,
        countries: new Map(),
      };
      continents.set(continentSlug, continentEntry);
    }
    continentEntry.count += 1;

    const countryName = article.country || "General";
    const countrySlug = slugify(countryName);
    const existingCountry = continentEntry.countries.get(countrySlug);
    if (existingCountry) {
      existingCountry.count += 1;
    } else {
      continentEntry.countries.set(countrySlug, {
        name: countryName,
        slug: countrySlug,
        count: 1,
      });
    }
  }

  return continents;
}

export function getAllNews(): NewsArticle[] {
  return [...NEWS_ARTICLES].sort((a, b) =>
    new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
  );
}

export function getNewsById(id: string): NewsArticle | null {
  return NEWS_ARTICLES.find((article) => article._id === id) ?? null;
}

export function getContinents(): ContinentSummary[] {
  const index = buildGeoIndex();
  return Array.from(index.values())
    .map((entry) => ({
      name: entry.name,
      slug: entry.slug,
      count: entry.count,
      countries: Array.from(entry.countries.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getContinentData(continentSlug: string) {
  const normalizedSlug = slugify(continentSlug);
  const index = buildGeoIndex();
  const continent = index.get(normalizedSlug);
  if (!continent) {
    return null;
  }
  const articles = getAllNews().filter(
    (article) => slugify(article.continent || "global") === normalizedSlug
  );
  return {
    name: continent.name,
    slug: normalizedSlug,
    count: continent.count,
    countries: Array.from(continent.countries.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    articles,
  };
}

export function getCountryData(continentSlug: string, countrySlug: string) {
  const continent = getContinentData(continentSlug);
  if (!continent) {
    return null;
  }
  const normalizedCountry = slugify(countrySlug);
  const country = continent.countries.find((entry) => entry.slug === normalizedCountry);
  if (!country) {
    return null;
  }
  const articles = continent.articles.filter(
    (article) => slugify(article.country || "general") === normalizedCountry
  );

  return {
    continentName: continent.name,
    continentSlug: continent.slug,
    continentCountryCount: continent.countries.length,
    continentArticleCount: continent.count,
    countryName: country.name,
    countrySlug: country.slug,
    countryArticleCount: articles.length,
    articles,
  };
}

export { slugify };
