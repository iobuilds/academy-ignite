import courseIot from '@/assets/course-iot.png';
import courseEmbedded from '@/assets/course-embedded.png';
import courseProduct from '@/assets/course-product.png';
import courseIotHero from '@/assets/course-iot-hero.png';
import courseEmbeddedHero from '@/assets/course-embedded-hero.png';
import courseProductHero from '@/assets/course-product-hero.png';

export interface CourseInfo {
  id: string;
  title: string;
  description: string;
  image: string;
  heroImage: string;
  duration: string;
  ageGroup: string;
  highlights: string[];
  price: number;
}

export const courseImages: Record<string, { card: string; hero: string }> = {
  'iot-robotics': { card: courseIot, hero: courseIotHero },
  'embedded-systems': { card: courseEmbedded, hero: courseEmbeddedHero },
  'product-development': { card: courseProduct, hero: courseProductHero },
};

export const courseIds = ['iot-robotics', 'embedded-systems', 'product-development'] as const;
export type CourseId = typeof courseIds[number];
