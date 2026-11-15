import heroCollectionImg from '../assets/images/hero_mylar_collection_1794734513607.jpg';
import cosmicBerryImg from '../assets/images/mylar_cosmic_berry_1794734512515.jpg';
import chromeLemonImg from '../assets/images/mylar_chrome_lemon_1794734514562.jpg';
import obsidianGoldImg from '../assets/images/mylar_obsidian_gold_1794734514552.jpg';
import diecutEmeraldImg from '../assets/images/mylar_diecut_emerald_1794734513713.jpg';

export const FIVERR_GIG_URL = 'https://www.fiverr.com/s/bk0w0Xq';

export const HERO_SHOWCASE_IMAGE = heroCollectionImg;

const PRESET_IMAGE_MAP: Record<string, string> = {
  'preset:cosmic-berry': cosmicBerryImg,
  'preset:chrome-lemon': chromeLemonImg,
  'preset:obsidian-gold': obsidianGoldImg,
  'preset:diecut-emerald': diecutEmeraldImg,
  'preset:hero-trio': heroCollectionImg,
};

export function resolveDesignImageUrl(imageUrl: string): string {
  if (imageUrl in PRESET_IMAGE_MAP) {
    return PRESET_IMAGE_MAP[imageUrl];
  }
  return imageUrl;
}
