import { CaseParty } from '../../models/CaseParty.js';
import { Case } from '../../models/Case.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';

export const casePartyService = {
  // ✅ Taraf oluştur
  async create(data) {
    const party = await CaseParty.create(data);
    return party;
  },

  // ✅ Bir davaya ait tüm tarafları getir
  async findByCase(caseId) {
    return CaseParty.findAll({
      where: { case_id: caseId },
      order: [
        ['party_type', 'ASC'],
        ['created_at', 'ASC'],
      ],
    });
  },

  // ✅ Tek bir tarafı getir
  async findOne(id) {
    const party = await CaseParty.findByPk(id);
    if (!party) {
      throw new Error('Taraf bulunamadı');
    }
    return party;
  },

  // ✅ Taraf güncelle
  async update(id, data) {
    const party = await CaseParty.findByPk(id);
    if (!party) {
      throw new Error('Taraf bulunamadı');
    }
    await party.update(data);
    return party;
  },

  // ✅ Taraf sil
  async remove(id) {
    const party = await CaseParty.findByPk(id);
    if (!party) {
      throw new Error('Taraf bulunamadı');
    }
    await party.destroy();
    return party;
  },

  // ✅ Davaya göre tarafları getir (paginated)
  async findAll({ case_id, page = 1, limit = 10, party_type }) {
    const where = {};

    if (case_id) {
      where.case_id = case_id;
    }

    if (party_type) {
      where.party_type = party_type;
    }

    const query = paginate({ where }, page, limit);
    const { count, rows } = await CaseParty.findAndCountAll({
      ...query,
      order: [['party_type', 'ASC']],
    });

    const pagination = getPaginationData(count, page, limit);

    return {
      data: rows,
      pagination,
    };
  },

  // ✅ Taraf sayısı
  async countByCase(caseId) {
    return CaseParty.count({
      where: { case_id: caseId },
    });
  },
};