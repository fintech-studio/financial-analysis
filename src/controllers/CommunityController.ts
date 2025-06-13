import { ChatBubbleLeftIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import {
  CommunityModel,
  CommunityPost,
  CommunityReply,
  CommunityUser,
} from "../models/CommunityModel";

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
  private communityModel: CommunityModel;

  static getInstance(): CommunityController {
    if (!CommunityController.instance) {
      CommunityController.instance = new CommunityController();
    }
    return CommunityController.instance;
  }

  private constructor() {
    this.communityModel = CommunityModel.getInstance();
  }

  async getAllPosts(params: CommunitySearchParams = {}): Promise<{
    posts: CommunityPost[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      return await this.communityModel.getAllPosts(params);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      throw new Error("無法獲取社群貼文");
    }
  }

  async getPostById(id: string): Promise<CommunityPost | null> {
    try {
      return await this.communityModel.getPostById(id);
    } catch (error) {
      console.error("Error fetching post:", error);
      throw new Error("無法獲取貼文詳情");
    }
  }

  async getRepliesByPostId(postId: string): Promise<CommunityReply[]> {
    try {
      return await this.communityModel.getRepliesByPostId(postId);
    } catch (error) {
      console.error("Error fetching replies:", error);
      throw new Error("無法獲取回覆");
    }
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
    try {
      return await this.communityModel.createPost(post);
    } catch (error) {
      console.error("Error creating post:", error);
      throw new Error("創建貼文失敗");
    }
  }

  async createReply(
    reply: Omit<CommunityReply, "id" | "createdAt" | "likes">
  ): Promise<CommunityReply> {
    try {
      return await this.communityModel.createReply(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      throw new Error("創建回覆失敗");
    }
  }

  async likePost(postId: string, userId: string): Promise<void> {
    try {
      await this.communityModel.likePost(postId, userId);
    } catch (error) {
      console.error("Error liking post:", error);
      throw new Error("按讚失敗");
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      await this.communityModel.unlikePost(postId, userId);
    } catch (error) {
      console.error("Error unliking post:", error);
      throw new Error("取消按讚失敗");
    }
  }

  async likeReply(replyId: string, userId: string): Promise<void> {
    try {
      // 模擬回覆按讚功能
      console.log(`User ${userId} liked reply ${replyId}`);
    } catch (error) {
      console.error("Error liking reply:", error);
      throw new Error("回覆按讚失敗");
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      return await this.communityModel.getCategories();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("無法獲取分類");
    }
  }

  async getTrendingTags(): Promise<string[]> {
    try {
      return await this.communityModel.getTrendingTags();
    } catch (error) {
      console.error("Error fetching trending tags:", error);
      throw new Error("無法獲取熱門標籤");
    }
  }

  async getUserProfile(userId: string): Promise<CommunityUser | null> {
    try {
      return await this.communityModel.getUserProfile(userId);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("無法獲取用戶資料");
    }
  }

  async getTopContributors(limit: number = 10): Promise<CommunityUser[]> {
    try {
      // 模擬獲取頂級貢獻者
      const mockUsers: CommunityUser[] = Array.from(
        { length: limit },
        (_, i) => ({
          id: `user_${i + 1}`,
          name: `貢獻者${i + 1}`,
          email: `contributor${i + 1}@example.com`,
          level: "專業投資者",
          joinDate: "2023-01-01",
          postsCount: Math.floor(Math.random() * 100) + 50,
          repliesCount: Math.floor(Math.random() * 200) + 100,
          likesReceived: Math.floor(Math.random() * 500) + 200,
          reputation: Math.floor(Math.random() * 1000) + 500,
          bio: "活躍的社群貢獻者",
          expertise: ["投資分析", "市場研究"],
        })
      );

      return mockUsers.sort((a, b) => b.reputation - a.reputation);
    } catch (error) {
      console.error("Error fetching top contributors:", error);
      throw new Error("無法獲取頂級貢獻者");
    }
  }

  async searchPosts(query: string): Promise<CommunityPost[]> {
    try {
      return await this.communityModel.searchPosts(query);
    } catch (error) {
      console.error("Error searching posts:", error);
      throw new Error("搜尋貼文失敗");
    }
  }

  async getPopularPosts(limit: number = 10): Promise<CommunityPost[]> {
    try {
      return await this.communityModel.getPopularPosts(limit);
    } catch (error) {
      console.error("Error fetching popular posts:", error);
      throw new Error("無法獲取熱門貼文");
    }
  }

  async getTrendingPosts(limit: number = 10): Promise<CommunityPost[]> {
    try {
      return await this.communityModel.getTrendingPosts(limit);
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      throw new Error("無法獲取趨勢貼文");
    }
  }

  async reportPost(
    postId: string,
    reason: string,
    reporterId: string
  ): Promise<void> {
    try {
      // 模擬舉報功能
      console.log(`Post ${postId} reported by ${reporterId} for: ${reason}`);
    } catch (error) {
      console.error("Error reporting post:", error);
      throw new Error("舉報失敗");
    }
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      // 模擬刪除功能
      console.log(`Post ${postId} deleted by ${userId}`);
    } catch (error) {
      console.error("Error deleting post:", error);
      throw new Error("刪除貼文失敗");
    }
  }

  async getForums(): Promise<any[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 模擬論壇數據
    const mockForums = [
      {
        id: 1,
        name: "PTT 股票版",
        description: "台灣最大的股票討論社群",
        url: "https://www.ptt.cc/bbs/Stock/index.html",
        icon: GlobeAltIcon,
        category: "股票討論",
        posts: [
          {
            title: "[標的] 台積電(2330) 多",
            author: "stockmaster",
            timestamp: "10分鐘前",
            url: "https://www.ptt.cc/bbs/Stock/M.1234567890.A.123.html",
            category: "個股分析",
          },
          {
            title: "[新聞] 聯發科法說會重點整理",
            author: "technews",
            timestamp: "30分鐘前",
            url: "https://www.ptt.cc/bbs/Stock/M.1234567891.A.456.html",
            category: "新聞資訊",
          },
        ],
      },
      {
        id: 2,
        name: "Mobile01 投資理財",
        description: "綜合性投資理財討論區",
        url: "https://www.mobile01.com/topiclist.php?f=291",
        icon: GlobeAltIcon,
        category: "綜合討論",
        posts: [
          {
            title: "2024年投資展望與策略分享",
            author: "投資達人",
            timestamp: "1小時前",
            url: "https://www.mobile01.com/topicdetail.php?f=291&t=1234567",
            category: "投資策略",
          },
          {
            title: "定期定額vs單筆投資比較",
            author: "理財顧問",
            timestamp: "2小時前",
            url: "https://www.mobile01.com/topicdetail.php?f=291&t=1234568",
            category: "投資策略",
          },
        ],
      },
    ];

    return mockForums;
  }

  async getSavedPosts(userId: string): Promise<string[]> {
    try {
      // 模擬獲取收藏的貼文
      return [
        "https://www.ptt.cc/bbs/Stock/M.1234567890.A.123.html",
        "https://www.mobile01.com/topicdetail.php?t=6789012",
      ];
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      throw new Error("無法獲取收藏貼文");
    }
  }

  async savePost(userId: string, postUrl: string): Promise<void> {
    try {
      console.log(`User ${userId} saved post: ${postUrl}`);
    } catch (error) {
      console.error("Error saving post:", error);
      throw new Error("收藏貼文失敗");
    }
  }

  async unsavePost(userId: string, postUrl: string): Promise<void> {
    try {
      console.log(`User ${userId} unsaved post: ${postUrl}`);
    } catch (error) {
      console.error("Error unsaving post:", error);
      throw new Error("取消收藏失敗");
    }
  }

  async searchForumPosts(params: {
    query: string;
    category?: string;
    forum?: string;
    timeRange?: string;
    sortBy?: string;
  }): Promise<any[]> {
    try {
      // 模擬搜尋論壇貼文
      return [];
    } catch (error) {
      console.error("Error searching forum posts:", error);
      throw new Error("搜尋論壇貼文失敗");
    }
  }

  async likeExternalPost(userId: string, postUrl: string): Promise<void> {
    try {
      console.log(`User ${userId} liked external post: ${postUrl}`);
    } catch (error) {
      console.error("Error liking external post:", error);
      throw new Error("按讚外部貼文失敗");
    }
  }
}

export default CommunityController;
