import { Client } from '../../models/Client.js';
import { Case } from '../../models/Case.js';
import { Document } from '../../models/Document.js';
import { Task } from '../../models/Task.js';
import { User } from '../../models/User.js';
import { Note } from '../../models/Note.js';
import { Op } from 'sequelize';

export const searchService = {
  async searchClients(query, limit) {
    const searchTerm = query.trim();
    const parts = searchTerm.split(' ').filter(p => p.length > 0);
    
    let where = {};
    
    if (parts.length === 1) {
      // TEK KELİME: Sadece o kelimeyi içeren kayıtları getir
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${parts[0]}%` } },
        { last_name: { [Op.iLike]: `%${parts[0]}%` } },
        { company_name: { [Op.iLike]: `%${parts[0]}%` } },
        { email: { [Op.iLike]: `%${parts[0]}%` } },
        { phone: { [Op.iLike]: `%${parts[0]}%` } },
        { tc_number: { [Op.iLike]: `%${parts[0]}%` } },
      ];
    } else if (parts.length >= 2) {
      // ÇOKLU KELİME: İLK kelime first_name, SONRAKİLER last_name olarak ARA!
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      
      // SADECE first_name + last_name kombinasyonu!
      where = {
        [Op.and]: [
          { first_name: { [Op.iLike]: `%${firstName}%` } },
          { last_name: { [Op.iLike]: `%${lastName}%` } },
        ]
      };
    }

    return Client.findAll({
      where,
      attributes: ['id', 'first_name', 'last_name', 'company_name', 'email', 'phone', 'status'],
      limit,
      order: [
        ['first_name', 'ASC'],
        ['last_name', 'ASC'],
      ],
    });
  },

  async searchCases(query, limit) {
    const searchTerm = query.trim();
    return Case.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { case_number: { [Op.iLike]: `%${searchTerm}%` } },
          { court_name: { [Op.iLike]: `%${searchTerm}%` } },
          { subject: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'company_name'],
        },
      ],
      attributes: ['id', 'title', 'case_number', 'court_name', 'status', 'opening_date'],
      limit,
      order: [['created_at', 'DESC']],
    });
  },

  async searchDocuments(query, limit) {
    const searchTerm = query.trim();
    return Document.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { original_name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { category: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      include: [
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
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      attributes: ['id', 'name', 'original_name', 'file_type', 'file_size', 'category', 'created_at'],
      limit,
      order: [['created_at', 'DESC']],
    });
  },

  async searchTasks(query, limit) {
    const searchTerm = query.trim();
    return Task.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      attributes: ['id', 'title', 'status', 'priority', 'due_date'],
      limit,
      order: [
        ['priority', 'DESC'],
        ['due_date', 'ASC'],
      ],
    });
  },

  async searchNotes(query, limit) {
    const searchTerm = query.trim();
    return Note.findAll({
      where: {
        [Op.or]: [
          { content: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      include: [
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
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      attributes: ['id', 'content', 'note_type', 'created_at'],
      limit,
      order: [['created_at', 'DESC']],
    });
  },

  async searchAll(query, limit) {
    const searchTerm = query.trim();
    const [clients, cases, documents, tasks, notes] = await Promise.all([
      this.searchClients(searchTerm, limit),
      this.searchCases(searchTerm, limit),
      this.searchDocuments(searchTerm, limit),
      this.searchTasks(searchTerm, limit),
      this.searchNotes(searchTerm, limit),
    ]);

    return {
      clients,
      cases,
      documents,
      tasks,
      notes,
      total: clients.length + cases.length + documents.length + tasks.length + notes.length,
    };
  },

  async search(query, type, limit) {
    const searchTerm = query.trim();
    let results = [];

    switch (type) {
      case 'clients':
        results = await this.searchClients(searchTerm, limit);
        break;
      case 'cases':
        results = await this.searchCases(searchTerm, limit);
        break;
      case 'documents':
        results = await this.searchDocuments(searchTerm, limit);
        break;
      case 'tasks':
        results = await this.searchTasks(searchTerm, limit);
        break;
      case 'notes':
        results = await this.searchNotes(searchTerm, limit);
        break;
      case 'all':
      default:
        results = await this.searchAll(searchTerm, limit);
        break;
    }

    return results;
  },

  async getSuggestions(query) {
    if (!query || query.length < 2) return [];

    const searchTerm = query.trim();
    const suggestions = [];

    // Client suggestions
    const clients = await Client.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${searchTerm}%` } },
          { last_name: { [Op.iLike]: `%${searchTerm}%` } },
          { company_name: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      attributes: ['id', 'first_name', 'last_name', 'company_name'],
      limit: 3,
    });

    clients.forEach((client) => {
      suggestions.push({
        type: 'client',
        id: client.id,
        label: `${client.first_name} ${client.last_name}${client.company_name ? ` (${client.company_name})` : ''}`,
        url: `/clients/${client.id}`,
      });
    });

    // Case suggestions
    const cases = await Case.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { case_number: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      attributes: ['id', 'title', 'case_number'],
      limit: 3,
    });

    cases.forEach((caseItem) => {
      suggestions.push({
        type: 'case',
        id: caseItem.id,
        label: `${caseItem.title}${caseItem.case_number ? ` (${caseItem.case_number})` : ''}`,
        url: `/cases/${caseItem.id}`,
      });
    });

    // Document suggestions
    const documents = await Document.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { original_name: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      attributes: ['id', 'name'],
      limit: 2,
    });

    documents.forEach((doc) => {
      suggestions.push({
        type: 'document',
        id: doc.id,
        label: doc.name,
        url: `/documents`,
      });
    });

    return suggestions;
  },
};