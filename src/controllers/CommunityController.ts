export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: string;
  };
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies: number;
  views: number;
  isLiked?: boolean;
  isPinned?: boolean;
  status: "active" | "closed" | "deleted";
}

export interface CommunityReply {
  id: string;
  postId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: string;
  };
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  parentReplyId?: string;
}

export interface CommunityUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: string;
  joinDate: string;
  postsCount: number;
  repliesCount: number;
  likesReceived: number;
  reputation: number;
  bio?: string;
  expertise: string[];
}

export interface CommunitySearchParams {
  query?: string;
  category?: string;
  author?: string;
  tags?: string[];
  sortBy?: "latest" | "popular" | "trending";
  limit?: number;
  page?: number;
}

export class CommunityController {
  private static instance: CommunityController;

  static getInstance(): CommunityController {
    if (!CommunityController.instance) {
      CommunityController.instance = new CommunityController();
    }
    return CommunityController.instance;
  }

  private constructor() {}

  async getAllPosts(params: CommunitySearchParams = {}): Promise<{
    posts: CommunityPost[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      query,
      category,
      author,
      tags,
      sortBy = "latest",
      limit = 20,
      page = 1,
    } = params;

    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 模擬社群貼文數據
    const mockPosts: CommunityPost[] = [
      {
        id: "1",
        title: "2024年台股投資展望討論",
        content: "想聽聽大家對今年台股的看法，特別是科技股的部分...",
        author: {
          id: "user1",
          name: "投資老手",
          avatar: "https://example.com/avatar1.jpg",
          level: "專業投資者",
        },
        category: "市場討論",
        tags: ["台股", "展望", "科技股"],
        createdAt: "2024-06-01T10:00:00Z",
        updatedAt: "2024-06-01T10:00:00Z",
        likes: 25,
        replies: 12,
        views: 156,
        isPinned: true,
        status: "active",
      },
      {
        id: "2",
        title: "新手投資問題求解",
        content: "剛開始投資股票，想請教一些基本問題...",
        author: {
          id: "user2",
          name: "投資新手",
          level: "初學者",
        },
        category: "新手問答",
        tags: ["新手", "基礎", "問答"],
        createdAt: "2024-06-01T09:30:00Z",
        updatedAt: "2024-06-01T09:30:00Z",
        likes: 8,
        replies: 15,
        views: 89,
        status: "active",
      },
      {
        id: "3",
        title: "AI選股策略分享",
        content: "最近研究了一些AI選股的方法，想跟大家分享...",
        author: {
          id: "user3",
          name: "量化分析師",
          level: "專業分析師",
        },
        category: "策略分享",
        tags: ["AI", "選股", "量化"],
        createdAt: "2024-06-01T08:45:00Z",
        updatedAt: "2024-06-01T08:45:00Z",
        likes: 42,
        replies: 8,
        views: 234,
        status: "active",
      },
    ];

    let filteredPosts = [...mockPosts];

    // 篩選邏輯
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (category) {
      filteredPosts = filteredPosts.filter(
        (post) => post.category === category
      );
    }

    if (author) {
      filteredPosts = filteredPosts.filter((post) => post.author.id === author);
    }

    if (tags && tags.length > 0) {
      filteredPosts = filteredPosts.filter((post) =>
        tags.some((tag) => post.tags.includes(tag))
      );
    }

    // 排序邏輯
    switch (sortBy) {
      case "popular":
        filteredPosts.sort((a, b) => b.likes - a.likes);
        break;
      case "trending":
        filteredPosts.sort(
          (a, b) => b.likes + b.replies - (a.likes + a.replies)
        );
        break;
      case "latest":
      default:
        filteredPosts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    // 分頁處理
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      total: filteredPosts.length,
      page,
      totalPages: Math.ceil(filteredPosts.length / limit),
    };
  }

  async getPostById(id: string): Promise<CommunityPost | null> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    const posts = await this.getAllPosts();
    return posts.posts.find((post) => post.id === id) || null;
  }

  async getRepliesByPostId(postId: string): Promise<CommunityReply[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 模擬回覆數據
    const mockReplies: CommunityReply[] = [
      {
        id: "reply1",
        postId,
        content: "我也很關注這個話題，感謝分享！",
        author: {
          id: "user4",
          name: "市場觀察者",
          level: "中級投資者",
        },
        createdAt: "2024-06-01T11:00:00Z",
        likes: 3,
      },
      {
        id: "reply2",
        postId,
        content: "有沒有具體的數據支持這個觀點？",
        author: {
          id: "user5",
          name: "數據控",
          level: "分析師",
        },
        createdAt: "2024-06-01T11:15:00Z",
        likes: 1,
      },
    ];

    return mockReplies;
  }

  async createPost(
    post: Omit<
      CommunityPost,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "likes"
      | "replies"
      | "views"
      | "status"
    >
  ): Promise<CommunityPost> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newPost: CommunityPost = {
      ...post,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      replies: 0,
      views: 0,
      status: "active",
    };

    return newPost;
  }

  async createReply(
    reply: Omit<CommunityReply, "id" | "createdAt" | "likes">
  ): Promise<CommunityReply> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 200));

    const newReply: CommunityReply = {
      ...reply,
      id: `reply_${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    return newReply;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`User ${userId} liked post ${postId}`);
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`User ${userId} unliked post ${postId}`);
  }

  async likeReply(replyId: string, userId: string): Promise<void> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`User ${userId} liked reply ${replyId}`);
  }

  async getCategories(): Promise<string[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 50));

    return [
      "市場討論",
      "新手問答",
      "策略分享",
      "技術分析",
      "基本面分析",
      "投資心得",
      "風險管理",
      "股票推薦",
      "產業分析",
      "國際市場",
    ];
  }

  async getTrendingTags(): Promise<string[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 50));

    return [
      "台股",
      "美股",
      "AI",
      "半導體",
      "技術分析",
      "新手",
      "投資策略",
      "風險管理",
      "量化交易",
      "基本面",
    ];
  }

  async getUserProfile(userId: string): Promise<CommunityUser | null> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 模擬用戶數據
    const mockUser: CommunityUser = {
      id: userId,
      name: "投資達人",
      email: "investor@example.com",
      level: "專業投資者",
      joinDate: "2023-01-15",
      postsCount: 25,
      repliesCount: 89,
      likesReceived: 156,
      reputation: 420,
      bio: "十年投資經驗，專注價值投資",
      expertise: ["價值投資", "財務分析", "風險管理"],
    };

    return mockUser;
  }

  async getTopContributors(limit: number = 10): Promise<CommunityUser[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 模擬頂級貢獻者數據
    const mockUsers: CommunityUser[] = [
      {
        id: "user1",
        name: "投資大師",
        email: "master@example.com",
        level: "專業投資者",
        joinDate: "2022-01-01",
        postsCount: 150,
        repliesCount: 500,
        likesReceived: 1200,
        reputation: 2500,
        expertise: ["技術分析", "量化交易"],
      },
      {
        id: "user2",
        name: "價值投資者",
        email: "value@example.com",
        level: "專業分析師",
        joinDate: "2022-03-15",
        postsCount: 80,
        repliesCount: 300,
        likesReceived: 800,
        reputation: 1800,
        expertise: ["價值投資", "基本面分析"],
      },
    ];

    return mockUsers.slice(0, limit);
  }

  async searchPosts(query: string): Promise<CommunityPost[]> {
    return (await this.getAllPosts({ query })).posts;
  }

  async getPopularPosts(limit: number = 10): Promise<CommunityPost[]> {
    return (await this.getAllPosts({ sortBy: "popular", limit })).posts;
  }

  async getTrendingPosts(limit: number = 10): Promise<CommunityPost[]> {
    return (await this.getAllPosts({ sortBy: "trending", limit })).posts;
  }

  async reportPost(
    postId: string,
    reason: string,
    reporterId: string
  ): Promise<void> {
    // 模擬舉報功能
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`Post ${postId} reported by ${reporterId} for: ${reason}`);
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    // 模擬刪除貼文
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`Post ${postId} deleted by ${userId}`);
  }
}

export default CommunityController;
