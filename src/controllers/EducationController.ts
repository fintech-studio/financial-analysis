import {
  EducationModel,
  EducationResource,
  EducationCategory,
  LearningPath,
  LearningProgress,
} from "../models/EducationModel";

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
  private educationModel: EducationModel;

  static getInstance(): EducationController {
    if (!EducationController.instance) {
      EducationController.instance = new EducationController();
    }
    return EducationController.instance;
  }

  private constructor() {
    this.educationModel = EducationModel.getInstance();
  }

  async getAllResources(params: EducationSearchParams = {}): Promise<{
    resources: EducationResource[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      return await this.educationModel.getAllResources(params);
    } catch (error) {
      console.error("Error fetching education resources:", error);
      throw new Error("無法獲取教育資源");
    }
  }

  async getResourceById(id: string): Promise<EducationResource | null> {
    try {
      return await this.educationModel.getResourceById(id);
    } catch (error) {
      console.error("Error fetching education resource:", error);
      throw new Error("無法獲取教育資源詳情");
    }
  }

  async getCategories(): Promise<EducationCategory[]> {
    try {
      return await this.educationModel.getCategories();
    } catch (error) {
      console.error("Error fetching education categories:", error);
      throw new Error("無法獲取教育分類");
    }
  }

  async getLearningPaths(): Promise<LearningPath[]> {
    try {
      return await this.educationModel.getLearningPaths();
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      throw new Error("無法獲取學習路徑");
    }
  }

  async getPopularResources(limit: number = 10): Promise<EducationResource[]> {
    try {
      const result = await this.educationModel.getAllResources({ limit });
      return result.resources.sort((a, b) => b.views - a.views);
    } catch (error) {
      console.error("Error fetching popular resources:", error);
      throw new Error("無法獲取熱門資源");
    }
  }

  async getRecentResources(limit: number = 10): Promise<EducationResource[]> {
    try {
      const result = await this.educationModel.getAllResources({ limit });
      return result.resources.sort(
        (a, b) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      );
    } catch (error) {
      console.error("Error fetching recent resources:", error);
      throw new Error("無法獲取最新資源");
    }
  }

  async getRecommendedResources(
    userLevel: string = "初級"
  ): Promise<EducationResource[]> {
    try {
      const result = await this.educationModel.getAllResources({
        level: userLevel,
      });
      return result.resources.sort((a, b) => b.rating - a.rating).slice(0, 5);
    } catch (error) {
      console.error("Error fetching recommended resources:", error);
      throw new Error("無法獲取推薦資源");
    }
  }

  async searchResources(query: string): Promise<EducationResource[]> {
    try {
      const result = await this.educationModel.getAllResources({ query });
      return result.resources;
    } catch (error) {
      console.error("Error searching resources:", error);
      throw new Error("搜尋資源失敗");
    }
  }

  async getResourcesByCategory(category: string): Promise<EducationResource[]> {
    try {
      const result = await this.educationModel.getAllResources({ category });
      return result.resources;
    } catch (error) {
      console.error("Error fetching resources by category:", error);
      throw new Error("無法獲取分類資源");
    }
  }

  async getResourcesByType(type: string): Promise<EducationResource[]> {
    try {
      const result = await this.educationModel.getAllResources({ type });
      return result.resources;
    } catch (error) {
      console.error("Error fetching resources by type:", error);
      throw new Error("無法獲取類型資源");
    }
  }

  async getUserProgress(userId: string): Promise<LearningProgress[]> {
    try {
      return await this.educationModel.getUserProgress(userId);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      throw new Error("無法獲取學習進度");
    }
  }

  async updateProgress(
    userId: string,
    resourceId: string,
    progress: number
  ): Promise<void> {
    try {
      await this.educationModel.updateProgress(userId, resourceId, progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      throw new Error("更新學習進度失敗");
    }
  }

  async recordView(resourceId: string): Promise<void> {
    try {
      await this.educationModel.recordView(resourceId);
    } catch (error) {
      console.error("Error recording view:", error);
      // 不拋出錯誤，因為這不是關鍵功能
    }
  }

  async rateResource(resourceId: string, rating: number): Promise<void> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error("評分必須在1-5之間");
      }
      await this.educationModel.rateResource(resourceId, rating);
    } catch (error) {
      console.error("Error rating resource:", error);
      throw new Error("評分失敗");
    }
  }
}

export default EducationController;
