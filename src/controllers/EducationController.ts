export interface EducationResource {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "初級" | "中級" | "高級";
  type: "文章" | "影片" | "課程" | "工具";
  duration?: string;
  author: string;
  publishDate: string;
  tags: string[];
  content?: string;
  videoUrl?: string;
  downloadUrl?: string;
  rating: number;
  views: number;
}

export interface EducationCategory {
  id: string;
  name: string;
  description: string;
  resourceCount: number;
  icon: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: "初級" | "中級" | "高級";
  estimatedTime: string;
  resources: EducationResource[];
  progress?: number;
}

export interface EducationSearchParams {
  query?: string;
  category?: string;
  level?: string;
  type?: string;
  limit?: number;
  page?: number;
}

export class EducationController {
  private static instance: EducationController;

  static getInstance(): EducationController {
    if (!EducationController.instance) {
      EducationController.instance = new EducationController();
    }
    return EducationController.instance;
  }

  private constructor() {}

  async getAllResources(params: EducationSearchParams = {}): Promise<{
    resources: EducationResource[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { query, category, level, type, limit = 20, page = 1 } = params;

    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 模擬教育資源數據
    const mockResources: EducationResource[] = [
      {
        id: "1",
        title: "股票投資基礎入門",
        description: "從零開始學習股票投資的基本概念",
        category: "股票投資",
        level: "初級",
        type: "課程",
        duration: "2小時",
        author: "投資專家王老師",
        publishDate: "2024-05-15",
        tags: ["股票", "投資", "基礎"],
        rating: 4.8,
        views: 15420,
      },
      {
        id: "2",
        title: "技術分析完全指南",
        description: "深入了解各種技術指標和圖表分析方法",
        category: "技術分析",
        level: "中級",
        type: "文章",
        duration: "45分鐘",
        author: "分析師李專家",
        publishDate: "2024-05-10",
        tags: ["技術分析", "指標", "圖表"],
        rating: 4.6,
        views: 8932,
      },
      {
        id: "3",
        title: "風險管理策略",
        description: "學習如何有效管理投資風險",
        category: "風險管理",
        level: "高級",
        type: "影片",
        duration: "1.5小時",
        author: "風險管理專家陳老師",
        publishDate: "2024-05-08",
        tags: ["風險管理", "策略", "投資"],
        videoUrl: "https://example.com/video/3",
        rating: 4.9,
        views: 12456,
      },
      {
        id: "4",
        title: "投資組合配置工具",
        description: "實用的投資組合分析和配置工具",
        category: "投資工具",
        level: "中級",
        type: "工具",
        author: "工具開發團隊",
        publishDate: "2024-05-05",
        tags: ["工具", "投資組合", "配置"],
        downloadUrl: "https://example.com/tool/4",
        rating: 4.5,
        views: 6789,
      },
    ];

    let filteredResources = [...mockResources];

    // 篩選邏輯
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredResources = filteredResources.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchTerm) ||
          resource.description.toLowerCase().includes(searchTerm) ||
          resource.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (category) {
      filteredResources = filteredResources.filter(
        (resource) => resource.category === category
      );
    }

    if (level) {
      filteredResources = filteredResources.filter(
        (resource) => resource.level === level
      );
    }

    if (type) {
      filteredResources = filteredResources.filter(
        (resource) => resource.type === type
      );
    }

    // 分頁處理
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResources = filteredResources.slice(startIndex, endIndex);

    return {
      resources: paginatedResources,
      total: filteredResources.length,
      page,
      totalPages: Math.ceil(filteredResources.length / limit),
    };
  }

  async getResourceById(id: string): Promise<EducationResource | null> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 這裡應該從數據庫獲取具體資源
    // 目前返回模擬數據
    const resources = await this.getAllResources();
    return resources.resources.find((resource) => resource.id === id) || null;
  }

  async getCategories(): Promise<EducationCategory[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    return [
      {
        id: "1",
        name: "股票投資",
        description: "學習股票市場和投資策略",
        resourceCount: 25,
        icon: "📈",
      },
      {
        id: "2",
        name: "技術分析",
        description: "掌握技術指標和圖表分析",
        resourceCount: 18,
        icon: "📊",
      },
      {
        id: "3",
        name: "基本面分析",
        description: "了解公司財務和行業分析",
        resourceCount: 15,
        icon: "📋",
      },
      {
        id: "4",
        name: "風險管理",
        description: "學習投資風險控制方法",
        resourceCount: 12,
        icon: "🛡️",
      },
      {
        id: "5",
        name: "投資工具",
        description: "實用的投資分析工具",
        resourceCount: 8,
        icon: "🔧",
      },
    ];
  }

  async getLearningPaths(): Promise<LearningPath[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 150));

    const resources = await this.getAllResources();

    return [
      {
        id: "1",
        title: "投資新手完整學習路徑",
        description: "從基礎概念到實戰操作的完整學習計劃",
        difficulty: "初級",
        estimatedTime: "4週",
        resources: resources.resources.filter((r) => r.level === "初級"),
      },
      {
        id: "2",
        title: "技術分析進階課程",
        description: "深入學習各種技術分析方法和策略",
        difficulty: "中級",
        estimatedTime: "6週",
        resources: resources.resources.filter((r) => r.category === "技術分析"),
      },
      {
        id: "3",
        title: "專業投資者培訓",
        description: "高級投資策略和風險管理",
        difficulty: "高級",
        estimatedTime: "8週",
        resources: resources.resources.filter((r) => r.level === "高級"),
      },
    ];
  }

  async getPopularResources(limit: number = 10): Promise<EducationResource[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    const resources = await this.getAllResources();

    // 按觀看次數排序
    return resources.resources
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  async getRecentResources(limit: number = 10): Promise<EducationResource[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    const resources = await this.getAllResources();

    // 按發布日期排序
    return resources.resources
      .sort(
        (a, b) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      )
      .slice(0, limit);
  }

  async getRecommendedResources(
    userLevel: string = "初級"
  ): Promise<EducationResource[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    const resources = await this.getAllResources();

    // 根據用戶級別推薦資源
    return resources.resources
      .filter((resource) => resource.level === userLevel)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }

  async searchResources(query: string): Promise<EducationResource[]> {
    return (await this.getAllResources({ query })).resources;
  }

  async getResourcesByCategory(category: string): Promise<EducationResource[]> {
    return (await this.getAllResources({ category })).resources;
  }

  async getResourcesByType(type: string): Promise<EducationResource[]> {
    return (await this.getAllResources({ type })).resources;
  }

  async recordView(resourceId: string): Promise<void> {
    // 模擬記錄觀看次數
    await new Promise((resolve) => setTimeout(resolve, 50));
    console.log(`Recorded view for resource: ${resourceId}`);
  }

  async rateResource(resourceId: string, rating: number): Promise<void> {
    // 模擬評分功能
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`Rated resource ${resourceId} with ${rating} stars`);
  }
}

export default EducationController;
