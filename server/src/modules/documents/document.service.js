import { Document } from '../../models/Document.js';
import { User } from '../../models/User.js';
import { Case } from '../../models/Case.js';
import { Client } from '../../models/Client.js';
import { Op, Sequelize } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const documentService = {
  async upload(data) {
    const { file, ...documentData } = data;
    
    // ✅ TAGS'İ DÜZELT - string'den array'e çevir
    let tags = documentData.tags;
    if (typeof tags === 'string') {
      tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (!Array.isArray(tags)) {
      tags = [];
    }
    
    // ✅ ORİJİNAL ADI KORU (Türkçe karakter sorununu çöz)
    let originalName = file.originalname;
    try {
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (e) {
      originalName = file.originalname;
    }
    
    // Generate unique filename
    const ext = path.extname(originalName);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Determine file type
    const mimeType = file.mimetype;
    let fileType = 'other';
    if (mimeType.includes('pdf')) fileType = 'pdf';
    else if (mimeType.includes('word') || mimeType.includes('document')) fileType = 'word';
    else if (mimeType.includes('excel') || mimeType.includes('sheet')) fileType = 'excel';
    else if (mimeType.includes('image')) fileType = 'image';

    // Create document record
    const document = await Document.create({
      name: documentData.name || originalName,
      original_name: originalName,
      file_path: filename,
      file_size: file.size,
      mime_type: mimeType,
      file_type: fileType,
      category: documentData.category || 'general',
      tags: tags,
      description: documentData.description,
      case_id: documentData.case_id || null,
      client_id: documentData.client_id || null,
      uploaded_by: documentData.uploaded_by,
      is_public: documentData.is_public || false,
      metadata: documentData.metadata || {},
      version: 1,
    });

    return document;
  },

  async findAll({ page, limit, search, category, case_id, client_id }) {
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { original_name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (case_id) {
      where.case_id = case_id;
    }

    if (client_id) {
      where.client_id = client_id;
    }

    const query = paginate({ where, order: [['created_at', 'DESC']] }, page, limit);
    const { count, rows } = await Document.findAndCountAll({
      ...query,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    const pagination = getPaginationData(count, page, limit);

    return {
      data: rows,
      pagination,
    };
  },

  async findOne(id) {
    const document = await Document.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  },

  async update(id, data) {
    const document = await Document.findByPk(id);
    if (!document) {
      throw new Error('Document not found');
    }

    await document.update(data);
    return document;
  },

  async remove(id) {
    const document = await Document.findByPk(id);
    if (!document) {
      throw new Error('Document not found');
    }

    const filePath = path.join(UPLOAD_DIR, document.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.destroy();
    return document;
  },

  async download(document) {
    const filePath = path.join(UPLOAD_DIR, document.file_path);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    return fs.createReadStream(filePath);
  },

  async getVersions(documentId) {
    const parentDoc = await Document.findByPk(documentId);
    if (!parentDoc) {
      throw new Error('Document not found');
    }

    return Document.findAll({
      where: {
        parent_id: parentDoc.id,
      },
      order: [['version', 'DESC']],
    });
  },

  async getCategories() {
    const documents = await Document.findAll({
      attributes: ['category'],
      group: ['category'],
    });
    return documents.map(d => d.category).filter(Boolean);
  },

  async getStatistics(userId) {
    const totalDocuments = await Document.count();
    const totalSize = await Document.sum('file_size');
    const totalSizeMB = totalSize ? (totalSize / (1024 * 1024)).toFixed(2) : 0;

    const categories = await Document.findAll({
      attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('category')), 'count']],
      group: ['category'],
      raw: true,
    });

    return {
      totalDocuments,
      totalSizeMB,
      categories,
    };
  },
};