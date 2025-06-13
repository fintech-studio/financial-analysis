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

export interface Forum {
  id: number;
  name: string;
  description: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: string;
  posts: ForumPost[];
}

export interface ForumPost {
  title: string;
  author: string;
  timestamp: string;
  url: string;
  category: string;
  likes?: number;
  views?: number;
}

export class CommunityModel {
  private static instance: CommunityModel;
  private posts: Map<string, CommunityPost> = new Map();
  private replies: Map<string, CommunityReply[]> = new Map();
  private users: Map<string, CommunityUser> = new Map();
  private categories: string[] = [];
  private tags: string[] = [];

  static getInstance(): CommunityModel {
    if (!CommunityModel.instance) {
      CommunityModel.instance = new CommunityModel();
    }
    return CommunityModel.instance;
  }

  private constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    this.initializeCategories();
    this.initializeTags();
    this.initializeMockPosts();
    this.initializeMockUsers();
  }

  private initializeCategories(): void {
    this.categories = [
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

  private initializeTags(): void {
    this.tags = [
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

  private initializeMockPosts(): void {
    const mockPosts: CommunityPost[] = [
      {
        id: "post_001",
        title: "新手投資者該如何開始？",
        content: "剛接觸投資，想請教各位前輩一些建議...",
        author: {
          id: "user_001",
          name: "投資新手",
          level: "新手投資者",
        },
        category: "新手問答",
        tags: ["新手", "投資策略"],
        createdAt: "2024-06-01T10:00:00Z",
        updatedAt: "2024-06-01T10:00:00Z",
        likes: 25,
        replies: 8,
        views: 156,
        status: "active",
      },
      {
        id: "post_002",
        title: "台積電未來展望討論",
        content: "對於台積電接下來的發展有什麼看法？",
        author: {
          id: "user_002",
          name: "科技股分析師",
          level: "專業投資者",
        },
        category: "股票推薦",
        tags: ["台股", "半導體"],
        createdAt: "2024-06-01T09:30:00Z",
        updatedAt: "2024-06-01T09:30:00Z",
        likes: 42,
        replies: 15,
        views: 289,
        status: "active",
      },
    ];

    mockPosts.forEach((post) => {
      this.posts.set(post.id, post);
    });
  }

  private initializeMockUsers(): void {
    const mockUsers: CommunityUser[] = [
      {
        id: "user_001",
        name: "投資新手",
        email: "newbie@example.com",
        level: "新手投資者",
        joinDate: "2024-01-15",
        postsCount: 5,
        repliesCount: 20,
        likesReceived: 45,
        reputation: 120,
        bio: "剛開始學習投資的新手",
        expertise: ["基礎投資"],
      },
      {
        id: "user_002",
        name: "科技股分析師",
        email: "analyst@example.com",
        level: "專業投資者",
        joinDate: "2023-03-10",
        postsCount: 35,
        repliesCount: 120,
        likesReceived: 280,
        reputation: 850,
        bio: "專注科技股分析的投資專家",
        expertise: ["技術分析", "科技股", "產業分析"],
      },
    ];

    mockUsers.forEach((user) => {
      this.users.set(user.id, user);
    });
  }

  async getAllPosts(
    params: {
      query?: string;
      category?: string;
      author?: string;
      tags?: string[];
      sortBy?: "latest" | "popular" | "trending";
      limit?: number;
      page?: number;
    } = {}
  ): Promise<{
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

    let filteredPosts = Array.from(this.posts.values()).filter(
      (post) => post.status === "active"
    );

    // 篩選邏輯
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm)
      );
    }

    if (category) {
      filteredPosts = filteredPosts.filter(
        (post) => post.category === category
      );
    }

    if (author) {
      filteredPosts = filteredPosts.filter(
        (post) => post.author.name === author
      );
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

    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      total,
      page,
      totalPages,
    };
  }

  async getPostById(id: string): Promise<CommunityPost | null> {
    const post = this.posts.get(id);
    if (post) {
      // 增加瀏覽數
      post.views += 1;
    }
    return post || null;
  }

  async getRepliesByPostId(postId: string): Promise<CommunityReply[]> {
    return this.replies.get(postId) || [];
  }

  async createPost(
    postData: Omit<
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
    const newPost: CommunityPost = {
      ...postData,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      replies: 0,
      views: 0,
      status: "active",
    };

    this.posts.set(newPost.id, newPost);
    return newPost;
  }

  async createReply(
    replyData: Omit<CommunityReply, "id" | "createdAt" | "likes">
  ): Promise<CommunityReply> {
    const newReply: CommunityReply = {
      ...replyData,
      id: `reply_${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    const postReplies = this.replies.get(replyData.postId) || [];
    postReplies.push(newReply);
    this.replies.set(replyData.postId, postReplies);

    // 更新貼文回覆數
    const post = this.posts.get(replyData.postId);
    if (post) {
      post.replies += 1;
    }

    return newReply;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      post.likes += 1;
      post.isLiked = true;
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (post && post.likes > 0) {
      post.likes -= 1;
      post.isLiked = false;
    }
  }

  async getUserProfile(userId: string): Promise<CommunityUser | null> {
    return this.users.get(userId) || null;
  }

  async getCategories(): Promise<string[]> {
    return [...this.categories];
  }

  async getTrendingTags(): Promise<string[]> {
    return [...this.tags];
  }

  async searchPosts(query: string): Promise<CommunityPost[]> {
    const result = await this.getAllPosts({ query });
    return result.posts;
  }

  async getPopularPosts(limit: number = 10): Promise<CommunityPost[]> {
    const result = await this.getAllPosts({ sortBy: "popular", limit });
    return result.posts;
  }

  async getTrendingPosts(limit: number = 10): Promise<CommunityPost[]> {
    const result = await this.getAllPosts({ sortBy: "trending", limit });
    return result.posts;
  }
}

export default CommunityModel;
