import { MetadataRoute } from 'next';
import { getBdsData, convertToSlug } from '@/lib/googleSheets';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tranhuyland.vn';
  const data = await getBdsData();

  const bdsUrls = data.map((item) => ({
    url: `${baseUrl}/nha-dat/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const districts = ['hai-chau', 'cam-le', 'thanh-khe', 'lien-chieu', 'son-tra', 'ngu-hanh-son'];
  const districtUrls = districts.map((slug) => ({
    url: `${baseUrl}/quan/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...bdsUrls,
    ...districtUrls,
  ];
}
