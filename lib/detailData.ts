import type { HackathonDetail } from "./types";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const rawDetail = require("@/public_json/public_hackathon_detail.json");

const detailMap = new Map<string, HackathonDetail>();

detailMap.set(rawDetail.slug, {
  slug: rawDetail.slug,
  title: rawDetail.title,
  sections: rawDetail.sections,
});

for (const d of rawDetail.extraDetails ?? []) {
  detailMap.set(d.slug, {
    slug: d.slug,
    title: d.title,
    sections: d.sections,
  });
}

export function getHackathonDetail(slug: string): HackathonDetail | null {
  return detailMap.get(slug) ?? null;
}
