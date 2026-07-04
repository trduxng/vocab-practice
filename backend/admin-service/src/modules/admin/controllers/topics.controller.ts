import TopicService from '../services/topics.service.ts';

class TopicController {
  static async getTopics(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const topics = await TopicService.getTopics(page, limit, {
        search: req.query.search,
        status: req.query.status,
        categoryId: req.query.categoryId
      });
      res.status(200).json(topics);
    } catch (error) {
      next(error);
    }
  }

  static async getTopicCategories(req, res, next) {
    try {
      const categories = await TopicService.getTopicCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async createTopic(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await TopicService.createTopic(req.body, adminId);
      res.status(201).json({ message: "Tạo chủ đề thành công", data: result });
    } catch (error) {
      if (
        error.message === 'Invalid topic data' ||
        error.message === 'Topic already exists' ||
        error.message === 'Topic code already exists'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async updateTopic(req, res, next) {
    try {
      const success = await TopicService.updateTopic(req.params.id, req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
      }
      res.status(200).json({ message: 'Cập nhật chủ đề thành công' });
    } catch (error) {
      if (['Invalid topic data', 'Topic already exists', 'Topic code already exists'].includes(error.message)) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async deleteTopic(req, res, next) {
    try {
      const result = await TopicService.deleteTopic(req.params.id, req.user.id);
      if (!result.success) {
        return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
      }
      res.status(200).json({
        message: result.archived ? 'Đã lưu trữ chủ đề vì đang có nội dung liên quan' : 'Xóa chủ đề thành công',
        archived: result.archived
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTopicCategory(req, res, next) {
    try {
      const result = await TopicService.createTopicCategory(req.body, req.user.id);
      res.status(201).json({ message: 'Tạo danh mục chủ đề thành công', data: result });
    } catch (error) {
      if (['Invalid topic category data', 'Topic category code already exists'].includes(error.message)) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async updateTopicCategory(req, res, next) {
    try {
      const success = await TopicService.updateTopicCategory(req.params.id, req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục chủ đề' });
      }
      res.status(200).json({ message: 'Cập nhật danh mục chủ đề thành công' });
    } catch (error) {
      if (['Invalid topic category data', 'Topic category code already exists'].includes(error.message)) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async deleteTopicCategory(req, res, next) {
    try {
      const success = await TopicService.deleteTopicCategory(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục chủ đề' });
      }
      res.status(200).json({ message: 'Đã tắt danh mục chủ đề' });
    } catch (error) {
      next(error);
    }
  }
}

export default TopicController;
