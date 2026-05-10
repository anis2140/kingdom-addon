const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
  id: "org.kingdom.addon",
  version: "1.0.0",
  name: "Kingdom Anime JP Names",
  description: "Kingdom Season 1-6 with Japanese Names Subtitles",
  resources: ["catalog", "meta", "stream"],
  types: ["series"],
  catalogs: [
    {
      type: "series",
      id: "kingdom-series",
      name: "Kingdom",
    },
  ],
};

const builder = new addonBuilder(manifest);

// ---------- CATALOG ----------
builder.defineCatalogHandler(() => {
  return Promise.resolve({
    metas: [
      {
        id: "kingdom-series",
        type: "series",
        name: "Kingdom",
        poster:
          "https://cdn.anisearch.com/images/anime/cover/14/14737_600.webp",
      },
    ],
  });
});

// ---------- META ----------
builder.defineMetaHandler((args) => {
  if (args.id === "kingdom-series") {
    return Promise.resolve({
      meta: {
        id: "kingdom-series",
        type: "series",
        name: "Kingdom",
        videos: Array.from({ length: 162 }, (_, i) => {
          let season = 1;
          let episode = i + 1;

          if (i >= 38 && i < 77) {
            season = 2;
            episode = i - 38 + 1;
          } else if (i >= 77 && i < 103) {
            season = 3;
            episode = i - 77 + 1;
          } else if (i >= 103 && i < 129) {
            season = 4;
            episode = i - 103 + 1;
          } else if (i >= 129 && i < 142) {
            season = 5;
            episode = i - 129 + 1;
          } else if (i >= 142) {
            season = 6;
            episode = i - 142 + 1;
          }

          return {
            id: `kingdom:${season}:${episode}`,
            title: `S${season}E${episode}`,
            season,
            episode,
          };
        }),
      },
    });
  }

  return Promise.resolve({ meta: null });
});

// ---------- STREAM ----------
builder.defineStreamHandler((args) => {
  const infoHash = "badb74bee729cfb976f2e4f7f3d3464105a3b1b5";

  const id = args.id;

  const match = id.match(/kingdom:(\d+):(\d+)/);

  if (!match) {
    return Promise.resolve({ streams: [] });
  }

  const season = parseInt(match[1]);
  const episode = parseInt(match[2]);

  const offsets = {
    1: 0,
    2: 38,
    3: 77,
    4: 103,
    5: 129,
    6: 142,
  };

  const maxEpisodes = {
    1: 38,
    2: 39,
    3: 26,
    4: 26,
    5: 13,
    6: 13,
  };

  if (!offsets.hasOwnProperty(season)) {
    return Promise.resolve({ streams: [] });
  }

  if (episode < 1 || episode > maxEpisodes[season]) {
    return Promise.resolve({ streams: [] });
  }

  const fileIdx = offsets[season] + (episode - 1);

  return Promise.resolve({
    streams: [
      {
        title: `Kingdom S${season}E${episode}`,
        infoHash,
        fileIdx,
      },
    ],
  });
});

// ---------- SERVER ----------
const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });
