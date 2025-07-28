import { VideoItem, VideoCategory } from '@/lib/types/video';

export const videoCategories: VideoCategory[] = [
  {
    id: 'all',
    name: 'All Videos',
    slug: 'all',
    color: 'bg-gray-500',
  },
  {
    id: 'ad',
    name: 'Advertising',
    slug: 'advertising',
    color: 'bg-blue-500',
    icon: '📺',
  },
  {
    id: 'trailer',
    name: 'Trailers',
    slug: 'trailers',
    color: 'bg-purple-500',
    icon: '🎬',
  },
  {
    id: 'bts',
    name: 'Behind the Scenes',
    slug: 'behind-the-scenes',
    color: 'bg-green-500',
    icon: '🎭',
  },
];

export const videoShowreel: VideoItem[] = [
  {
    id: 'loreal-eva-lipdub',
    title: "L'Oréal Paris – Eva's Lip-Dub",
    description: 'Creative advertising campaign showcasing innovative lip-dub technique for L\'Oréal Paris, demonstrating advanced video production and post-production capabilities.',
    videoId: 'M1PTVmaO6Yg',
    category: videoCategories.find(cat => cat.id === 'ad')!,
    publishedAt: '2023-01-15',
    featured: true,
    tags: ['advertising', 'beauty', 'creative', 'lip-dub'],
    metrics: {
      views: 125000,
      engagement: 8.5,
    },
  },
  {
    id: 'ipg-studios-reel',
    title: 'IPG Studios NYC – Capabilities Reel',
    description: 'Comprehensive showcase of IPG Studios NYC capabilities, highlighting diverse production expertise and creative solutions across multiple media formats.',
    videoId: 'xq8uEfXZeOQ',
    category: videoCategories.find(cat => cat.id === 'ad')!,
    publishedAt: '2023-02-20',
    featured: true,
    tags: ['capabilities', 'studio', 'production', 'showcase'],
    metrics: {
      views: 89000,
      engagement: 9.2,
    },
  },
  {
    id: 'maybelline-chromaverse',
    title: 'Maybelline Chromaverse AR Game Trailer',
    description: 'Innovative AR gaming experience for Maybelline, combining beauty and technology through immersive augmented reality gameplay and interactive features.',
    videoId: '0BH-2mqatoo',
    category: videoCategories.find(cat => cat.id === 'ad')!,
    publishedAt: '2023-03-10',
    featured: true,
    tags: ['AR', 'gaming', 'beauty', 'innovation', 'interactive'],
    metrics: {
      views: 234000,
      engagement: 12.8,
    },
  },
  {
    id: 'quiet-place-trailer',
    title: 'A Quiet Place 2021 Game Awards Trailer',
    description: 'High-impact trailer for A Quiet Place game presentation at the 2021 Game Awards, showcasing cinematic storytelling and atmospheric tension.',
    videoId: '9Ujbx5iVW9k',
    category: videoCategories.find(cat => cat.id === 'trailer')!,
    publishedAt: '2021-12-09',
    featured: false,
    tags: ['gaming', 'trailer', 'awards', 'cinematic'],
    metrics: {
      views: 456000,
      engagement: 15.3,
    },
  },
  {
    id: 'dub-lincoln-navigator',
    title: 'DUB Magazine – Myles Kovacs\' Custom Lincoln Navigator',
    description: 'Automotive showcase featuring custom Lincoln Navigator build, highlighting luxury customization and detailed craftsmanship for DUB Magazine.',
    videoId: 'kQdGKqci8oE',
    category: videoCategories.find(cat => cat.id === 'ad')!,
    publishedAt: '2022-08-15',
    featured: false,
    tags: ['automotive', 'luxury', 'customization', 'magazine'],
    metrics: {
      views: 67000,
      engagement: 7.1,
    },
  },
  {
    id: 'south-pole-bts',
    title: 'South Pole Ladies SS 2009 – Behind the Scenes',
    description: 'Exclusive behind-the-scenes footage from South Pole Ladies Spring/Summer 2009 campaign, showcasing fashion production process and creative direction.',
    videoId: 'x_yOGg9jlkU',
    category: videoCategories.find(cat => cat.id === 'bts')!,
    publishedAt: '2009-04-20',
    featured: false,
    tags: ['fashion', 'behind-the-scenes', 'campaign', 'spring-summer'],
    metrics: {
      views: 34000,
      engagement: 6.8,
    },
  },
];