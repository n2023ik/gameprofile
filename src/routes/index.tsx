import { createFileRoute } from '@tanstack/react-router';
import PixelAdventure from '@/pixel/PixelAdventure';
export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'Nikhil Pandey — Pixel Career City' },
    { name: 'description', content: 'Play Nikhil Pandey’s pixel-art Career City: seven career destinations, projects, experience and a fantasy platform adventure.' },
    { property: 'og:title', content: 'Nikhil Pandey — Pixel Career City' },
    { property: 'og:description', content: 'Seven badges. One career story. Explore a playable pixel-art portfolio of product, data and development.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: PixelAdventure,
});
