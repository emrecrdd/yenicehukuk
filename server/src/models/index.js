// server/src/models/index.js
import { User } from './User.js';
import { Client } from './Client.js';
import { Case } from './Case.js';
import { CaseParty } from './CaseParty.js';
import { Document } from './Document.js';
import { Task } from './Task.js';
import { Event } from './Event.js';
import { Meeting } from './Meeting.js';
import { Payment } from './Payment.js';
import { Note } from './Note.js';
import { AuditLog } from './AuditLog.js';
import { Notification } from './Notification.js';
import { PowerOfAttorney } from './PowerOfAttorney.js';
import { Template } from './Template.js';

const initModels = (sequelize) => {
  // Initialize all models
  User.initModel(sequelize);
  Client.initModel(sequelize);
  Case.initModel(sequelize);
  CaseParty.initModel(sequelize);
  Document.initModel(sequelize);
  Task.initModel(sequelize);
  Event.initModel(sequelize);
  Meeting.initModel(sequelize);
  Payment.initModel(sequelize);
  Note.initModel(sequelize);
  AuditLog.initModel(sequelize);
  Notification.initModel(sequelize);
  PowerOfAttorney.initModel(sequelize);
  Template.initModel(sequelize);

  // ============ USER ASSOCIATIONS ============
  User.hasMany(Client, { foreignKey: 'created_by', as: 'clients' });
  Client.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  User.hasMany(Case, { foreignKey: 'created_by', as: 'createdCases' });
  Case.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  User.hasMany(Case, { foreignKey: 'assigned_to', as: 'assignedCases' });
  Case.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

  // ============ TASK ASSOCIATIONS ============
  User.hasMany(Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });
  Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

  User.hasMany(Task, { foreignKey: 'assigned_by', as: 'assignedByTasks' });  // ✅ YENİ
  Task.belongsTo(User, { foreignKey: 'assigned_by', as: 'assigner' });        // ✅ YENİ

  User.hasMany(Task, { foreignKey: 'created_by', as: 'createdTasks' });
  Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // ============ TASK - CLIENT / CASE ============
  Task.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  Client.hasMany(Task, { foreignKey: 'client_id', as: 'tasks' });

  Task.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });
  Case.hasMany(Task, { foreignKey: 'case_id', as: 'tasks' });

  // ============ SUBTASKS ============
  Task.hasMany(Task, { foreignKey: 'parent_task_id', as: 'subtasks' });
  Task.belongsTo(Task, { foreignKey: 'parent_task_id', as: 'parentTask' });

  // ============ USER - NOTE ============
  User.hasMany(Note, { foreignKey: 'created_by', as: 'createdNotes' });
  Note.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // ============ USER - AUDIT LOG ============
  User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
  AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // ============ USER - DOCUMENT ============
  User.hasMany(Document, { foreignKey: 'uploaded_by', as: 'uploadedDocuments' });
  Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

  // ============ USER - EVENT ============
  User.hasMany(Event, { foreignKey: 'created_by', as: 'createdEvents' });
  Event.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  User.hasMany(Event, { foreignKey: 'assigned_to', as: 'assignedEvents' });
  Event.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedTo' });

  // ============ USER - MEETING ============
  User.hasMany(Meeting, { foreignKey: 'created_by', as: 'createdMeetings' });
  Meeting.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  User.hasMany(Meeting, { foreignKey: 'assigned_to', as: 'assignedMeetings' });
  Meeting.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

  // ============ USER - PAYMENT ============
  User.hasMany(Payment, { foreignKey: 'created_by', as: 'payments' });
  Payment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // ============ USER - TEMPLATE ============
  User.hasMany(Template, { foreignKey: 'created_by', as: 'templates' });
  Template.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  User.hasMany(Template, { foreignKey: 'updated_by', as: 'updatedTemplates' });
  Template.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

  // ============ USER - POWER OF ATTORNEY ============
  User.hasMany(PowerOfAttorney, { foreignKey: 'created_by', as: 'powerOfAttorneys' });
  PowerOfAttorney.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // ============ USER - NOTIFICATION ============
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // ============ CLIENT ASSOCIATIONS ============
  Client.belongsToMany(Case, {
    through: 'case_clients',
    foreignKey: 'client_id',
    otherKey: 'case_id',
    as: 'cases',
  });
  Client.hasMany(Note, { foreignKey: 'client_id', as: 'clientNotes' });
  Note.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

  Client.hasMany(Payment, { foreignKey: 'client_id', as: 'payments' });
  Payment.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

  Client.hasMany(Document, { foreignKey: 'client_id', as: 'documents' });
  Document.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

  Client.hasMany(Meeting, { foreignKey: 'client_id', as: 'meetings' });
  Meeting.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

  Client.hasMany(PowerOfAttorney, { foreignKey: 'client_id', as: 'powerOfAttorneys' });
  PowerOfAttorney.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

  // ============ CASE ASSOCIATIONS ============
  Case.belongsToMany(Client, {
    through: 'case_clients',
    foreignKey: 'case_id',
    otherKey: 'client_id',
    as: 'clients',
  });
  Case.hasMany(CaseParty, { foreignKey: 'case_id', as: 'parties' });
  CaseParty.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

  Case.hasMany(Document, { foreignKey: 'case_id', as: 'documents' });
  Document.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

  Case.hasMany(Event, { foreignKey: 'case_id', as: 'events' });
  Event.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

  Case.hasMany(Note, { foreignKey: 'case_id', as: 'notes' });
  Note.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

  Case.hasMany(Payment, { foreignKey: 'case_id', as: 'payments' });
  Payment.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

  Case.hasMany(Meeting, { foreignKey: 'case_id', as: 'meetings' });
  Meeting.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

  Case.hasMany(PowerOfAttorney, { foreignKey: 'case_id', as: 'powerOfAttorneys' });
  PowerOfAttorney.belongsTo(Case, { foreignKey: 'case_id', as: 'case' });

  // ============ DOCUMENT ASSOCIATIONS ============
  Document.hasMany(Document, { foreignKey: 'parent_id', as: 'versions' });
  Document.belongsTo(Document, { foreignKey: 'parent_id', as: 'parent' });

  PowerOfAttorney.hasMany(Document, {
    foreignKey: 'power_of_attorney_id',
    as: 'documents',
  });
  Document.belongsTo(PowerOfAttorney, {
    foreignKey: 'power_of_attorney_id',
    as: 'powerOfAttorney',
  });

  return sequelize;
};

export {
  initModels,
  User,
  Client,
  Case,
  CaseParty,
  Document,
  Task,
  Event,
  Meeting,
  Payment,
  Note,
  AuditLog,
  Notification,
  PowerOfAttorney,
  Template,
};