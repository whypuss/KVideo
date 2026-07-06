import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag') || '热门';
  const pageLimit = searchParams.get('page_limit') || '20';
  const pageStart = searchParams.get('page_start') || '0';
  const type = searchParams.get('type') || 'movie'; // movie or tv

  try {
    // Douban TV API (type=tv) doesn't return any results for tags
    // Use movie API with TV-related tags instead
    let apiType = type;
    let apiTag = tag;

    // For TV type, use movie API with appropriate tags
    if (type === 'tv') {
      apiType = 'movie';
      // Map TV tags to movie tags
      const tvTagMap: Record<string, string> = {
        '国产剧': '国产',
        '港剧': '香港',
        '韩剧': '韩国',
        '美剧': '美国',
        '日剧': '日本',
        '英剧': '英国',
        '泰剧': '泰国',
        '台剧': '台湾',
        '热门': '热门',
        '最新': '最新',
        '经典': '经典',
      };
      apiTag = tvTagMap[tag] || tag;
    }

    const url = `https://movie.douban.com/j/search_subjects?type=${apiType}&tag=${encodeURIComponent(apiTag)}&sort=recommend&page_limit=${pageLimit}&page_start=${pageStart}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://movie.douban.com/',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Douban API returned ${response.status}`);
    }

    const data = await response.json();

    // 转换图片链接使用代理
    if (data.subjects && Array.isArray(data.subjects)) {
      data.subjects = data.subjects.map((item: any) => ({
        ...item,
        cover: item.cover ? `/api/douban/image?url=${encodeURIComponent(item.cover)}` : item.cover,
      }));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Douban API error:', error);
    return NextResponse.json(
      { subjects: [], error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
