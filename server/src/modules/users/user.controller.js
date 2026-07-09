import { User } from '../../models/User.js';
import { Op } from 'sequelize';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { paginate, getPaginationData } from '../../utils/paginate.js';
import { AuditLog } from '../../models/AuditLog.js';

export const userController = {
  async findAll(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const where = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where[Op.or] = [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const query = paginate({ where }, page, limit);
      const { count, rows } = await User.findAndCountAll({
        ...query,
        attributes: { exclude: ['password', 'refresh_token'] },
        order: [['created_at', 'DESC']],
      });

      const pagination = getPaginationData(count, page, limit);
      return paginatedResponse(res, rows, pagination, 'Users fetched successfully');
    } catch (error) {
      console.error('❌ User findAll error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findOne(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password', 'refresh_token'] },
      });
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      return successResponse(res, user, 'User fetched successfully');
    } catch (error) {
      console.error('❌ User findOne error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ Kullanıcı güncelle
  async update(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      const { first_name, last_name, email, phone, role, title, bio, is_active } = req.body;

      await user.update({
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        email: email || user.email,
        phone: phone !== undefined ? phone : user.phone,
        role: role || user.role,
        title: title !== undefined ? title : user.title,
        bio: bio !== undefined ? bio : user.bio,
        is_active: is_active !== undefined ? is_active : user.is_active,
      });

      // ✅ Logla
      await AuditLog.create({
        action: 'update',
        entity_type: 'user',
        entity_id: user.id,
        user_id: req.user.id,
        description: `"${user.email}" kullanıcısı güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, user, 'Kullanıcı başarıyla güncellendi');
    } catch (error) {
      console.error('❌ User update error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ Kullanıcı sil (Soft Delete)
  async delete(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // ✅ Kendini silmesini engelle
      if (user.id === req.user.id) {
        return errorResponse(res, 'Kendi hesabınızı silemezsiniz', 400);
      }

      const userEmail = user.email;
      await user.destroy();

      // ✅ Logla
      await AuditLog.create({
        action: 'delete',
        entity_type: 'user',
        entity_id: user.id,
        user_id: req.user.id,
        description: `"${userEmail}" kullanıcısı silindi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Kullanıcı başarıyla silindi');
    } catch (error) {
      console.error('❌ User delete error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ Kullanıcı aktif/pasif değiştir
  async toggleActive(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // ✅ Kendini pasif yapmasını engelle
      if (user.id === req.user.id) {
        return errorResponse(res, 'Kendi hesabınızı pasif yapamazsınız', 400);
      }

      const newStatus = !user.is_active;
      await user.update({ is_active: newStatus });

      // ✅ Logla
      await AuditLog.create({
        action: 'update',
        entity_type: 'user',
        entity_id: user.id,
        user_id: req.user.id,
        description: `"${user.email}" kullanıcısı ${newStatus ? 'aktif' : 'pasif'} yapıldı`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, user, `Kullanıcı ${newStatus ? 'aktif' : 'pasif'} yapıldı`);
    } catch (error) {
      console.error('❌ User toggleActive error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ Kullanıcı rol değiştir
  async changeRole(req, res) {
    try {
      const { role } = req.body;
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      if (!role) {
        return errorResponse(res, 'Rol belirtilmelidir', 400);
      }

      // ✅ Kendi rolünü değiştirmesini engelle (isteğe bağlı)
      if (user.id === req.user.id) {
        return errorResponse(res, 'Kendi rolünüzü değiştiremezsiniz', 400);
      }

      const oldRole = user.role;
      await user.update({ role });

      // ✅ Logla
      await AuditLog.create({
        action: 'update',
        entity_type: 'user',
        entity_id: user.id,
        user_id: req.user.id,
        description: `"${user.email}" kullanıcısının rolü "${oldRole}" → "${role}" olarak değiştirildi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, user, 'Kullanıcı rolü başarıyla değiştirildi');
    } catch (error) {
      console.error('❌ User changeRole error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};