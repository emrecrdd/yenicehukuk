import { dashboardService } from './dashboard.service.js';
import { successResponse } from '../../utils/response.js';

export const dashboardController = {
  async getStats(req, res) {
    try {
      const stats = await dashboardService.getStats();
      return successResponse(res, stats, 'Dashboard stats fetched successfully');
    } catch (error) {
      console.error('Get stats error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getTodayHearings(req, res) {
    try {
      const hearings = await dashboardService.getTodayHearings();
      return successResponse(res, hearings, 'Today\'s hearings fetched successfully');
    } catch (error) {
      console.error('Get hearings error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getUpcomingTasks(req, res) {
    try {
      const tasks = await dashboardService.getUpcomingTasks(req.user.id);
      return successResponse(res, tasks, 'Upcoming tasks fetched successfully');
    } catch (error) {
      console.error('Get tasks error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getRecentActivities(req, res) {
    try {
      const activities = await dashboardService.getRecentActivities();
      return successResponse(res, activities, 'Recent activities fetched successfully');
    } catch (error) {
      console.error('Get activities error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};