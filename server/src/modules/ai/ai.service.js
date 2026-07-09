import { config } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { Case } from '../../models/Case.js';
import { Document } from '../../models/Document.js';
import { Client } from '../../models/Client.js';
import { CaseParty } from '../../models/CaseParty.js';
import { readFileSync } from 'fs';
import path from 'path';
import OpenAI from 'openai';

class AIService {
  constructor() {
    if (config.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
      this.isEnabled = true;
    } else {
      this.isEnabled = false;
      logger.warn('OpenAI API key not found. AI features will use mock responses.');
    }
  }

  async analyzeDocument(file) {
    if (!this.isEnabled) {
      return this.getMockDocumentAnalysis(file);
    }

    try {
      // For PDF files, we'd use a PDF parser
      // For now, we'll use a simpler approach
      const textContent = file.buffer.toString('utf-8');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a legal document analyzer. Extract the following information from the document:
            - Case type
            - Plaintiff name
            - Defendant name
            - Claim amount
            - Important dates
            - Risk assessment
            - Summary
            Return as JSON.`,
          },
          {
            role: 'user',
            content: textContent.slice(0, 4000),
          },
        ],
        temperature: 0.3,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return {
        ...result,
        confidence: 0.85,
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('OpenAI analyze error:', error);
      return this.getMockDocumentAnalysis(file);
    }
  }

  async summarizeCase(caseId) {
    if (!this.isEnabled) {
      return this.getMockCaseSummary(caseId);
    }

    try {
      const caseData = await Case.findByPk(caseId, {
        include: [
          { model: Client, as: 'client' },
          { model: CaseParty, as: 'parties' },
          { model: Document, as: 'documents', limit: 5 },
        ],
      });

      if (!caseData) {
        throw new Error('Case not found');
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a legal assistant. Create a comprehensive summary of the case including:
            - Case overview
            - Key parties
            - Main issues
            - Current status
            - Recommendations
            Return as JSON with fields: overview, parties, issues, status, recommendations.`,
          },
          {
            role: 'user',
            content: JSON.stringify(caseData.toJSON()),
          },
        ],
        temperature: 0.3,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return {
        ...result,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('OpenAI summarize error:', error);
      return this.getMockCaseSummary(caseId);
    }
  }

  async generateLegalAdvice(query, context) {
    if (!this.isEnabled) {
      return this.getMockLegalAdvice(query);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a legal AI assistant. Provide professional legal advice based on the query.
            Include: 
            - Legal analysis
            - Relevant regulations
            - Recommendations
            - Risk assessment
            Be professional and clear.`,
          },
          {
            role: 'user',
            content: `Query: ${query}\nContext: ${context || 'None'}`,
          },
        ],
        temperature: 0.3,
      });

      return {
        advice: completion.choices[0].message.content,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('OpenAI legal advice error:', error);
      return this.getMockLegalAdvice(query);
    }
  }

  async extractEntities(text) {
    if (!this.isEnabled) {
      return this.getMockEntities(text);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Extract entities from the legal text. Extract:
            - Names (person, organization)
            - Dates
            - Locations
            - Amounts (money)
            - Legal terms
            Return as JSON with arrays for each type.`,
          },
          {
            role: 'user',
            content: text.slice(0, 4000),
          },
        ],
        temperature: 0.1,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return result;
    } catch (error) {
      logger.error('OpenAI extract entities error:', error);
      return this.getMockEntities(text);
    }
  }

  async generateDraft(type, data) {
    if (!this.isEnabled) {
      return this.getMockDraft(type);
    }

    try {
      const templates = {
        petition: `You are a legal document drafter. Create a professional petition based on the provided data.
        Include: Court name, parties, subject, claims, evidence, and signature block.`,
        contract: `You are a legal document drafter. Create a professional contract based on the provided data.
        Include: Parties, subject, terms, conditions, signatures.`,
        notice: `You are a legal document drafter. Create a professional legal notice based on the provided data.
        Include: Recipient, subject, body, action required, deadline.`,
      };

      const systemPrompt = templates[type] || templates.petition;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: JSON.stringify(data),
          },
        ],
        temperature: 0.3,
      });

      return {
        draft: completion.choices[0].message.content,
        type,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('OpenAI draft error:', error);
      return this.getMockDraft(type);
    }
  }

  async classifyDocument(file) {
    if (!this.isEnabled) {
      return this.getMockClassification(file);
    }

    try {
      const textContent = file.buffer.toString('utf-8').slice(0, 4000);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Classify the legal document into one of these categories:
            - Petition
            - Court Decision
            - Expert Report
            - Notification
            - Evidence
            - Correspondence
            - Other
            Provide confidence score and explanation. Return as JSON.`,
          },
          {
            role: 'user',
            content: textContent,
          },
        ],
        temperature: 0.1,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return result;
    } catch (error) {
      logger.error('OpenAI classify error:', error);
      return this.getMockClassification(file);
    }
  }

  async getCaseRecommendations(caseId) {
    if (!this.isEnabled) {
      return this.getMockRecommendations(caseId);
    }

    try {
      const caseData = await Case.findByPk(caseId, {
        include: [
          { model: Client, as: 'client' },
          { model: CaseParty, as: 'parties' },
          { model: Task, as: 'tasks' },
        ],
      });

      if (!caseData) {
        throw new Error('Case not found');
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze the case and provide strategic recommendations:
            - Next steps
            - Risk factors
            - Missing evidence
            - Legal strategy
            - Timeline suggestions
            Return as JSON.`,
          },
          {
            role: 'user',
            content: JSON.stringify(caseData.toJSON()),
          },
        ],
        temperature: 0.3,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return result;
    } catch (error) {
      logger.error('OpenAI recommendations error:', error);
      return this.getMockRecommendations(caseId);
    }
  }

  async analyzeSentiment(text) {
    if (!this.isEnabled) {
      return this.getMockSentiment(text);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze the sentiment of the legal text:
            - Sentiment (positive, negative, neutral)
            - Confidence score
            - Key emotional indicators
            - Urgency level
            Return as JSON.`,
          },
          {
            role: 'user',
            content: text.slice(0, 4000),
          },
        ],
        temperature: 0.1,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return result;
    } catch (error) {
      logger.error('OpenAI sentiment error:', error);
      return this.getMockSentiment(text);
    }
  }

  // Mock responses for when OpenAI is not available
  getMockDocumentAnalysis(file) {
    return {
      caseType: 'İş Davası',
      plaintiff: 'Ahmet Yılmaz',
      defendant: 'ABC Şirketi',
      claimAmount: '50.000 TL',
      importantDates: ['15.01.2023', '10.02.2023'],
      riskAssessment: 'Orta seviye',
      summary: 'Bu dava, Ahmet Yılmaz\'ın ABC Şirketi aleyhine açtığı iş davasıdır. Davacı, iş akdinin haksız feshedildiğini iddia etmektedir.',
      confidence: 0.75,
      isMock: true,
    };
  }

  getMockCaseSummary(caseId) {
    return {
      overview: 'Bu dava, iş akdinin feshi ile ilgili bir uyuşmazlıktır.',
      parties: 'Davacı: Ahmet Yılmaz, Davalı: ABC Şirketi',
      issues: 'İş akdinin haksız feshi, kıdem tazminatı, ihbar tazminatı',
      status: 'Bilirkişi raporu bekleniyor',
      recommendations: 'Bilirkişi raporu takip edilmeli, Yargıtay emsal kararları incelenmeli',
      isMock: true,
    };
  }

  getMockLegalAdvice(query) {
    return {
      advice: `Hukuki danışmanlık hizmetimiz, genel bilgilendirme amaçlıdır. 
      
      Sorunuzla ilgili olarak:
      1. İlgili mevzuat incelenmelidir
      2. Uzman bir avukattan birebir danışmanlık alınması önerilir
      3. Dava süreçleri profesyonel takip gerektirir
      
      Detaylı analiz için lütfen bir avukat ile görüşünüz.`,
      isMock: true,
    };
  }

  getMockEntities(text) {
    return {
      names: ['Ahmet Yılmaz', 'Ayşe Demir'],
      dates: ['15.01.2023', '10.02.2023'],
      locations: ['İstanbul', 'Ankara'],
      amounts: ['50.000 TL', '15.000 TL'],
      legalTerms: ['iş akdi', 'fesih', 'tazminat'],
      isMock: true,
    };
  }

  getMockDraft(type) {
    const templates = {
      petition: `[MAHKEME ADI]
      
      DAVACI: [Davacı Adı]
      DAVALI: [Davalı Adı]
      
      DAVA KONUSU: [Dava Konusu]
      
      AÇIKLAMALAR:
      [Açıklamalar]
      
      DELİLLER:
      1. [Delil 1]
      2. [Delil 2]
      
      SONUÇ VE İSTEM:`,
      contract: `[SÖZLEŞME ADI]
      
      TARAFLAR:
      1. [Taraf 1]
      2. [Taraf 2]
      
      KONU: [Sözleşme Konusu]
      
      MADDELER:
      1. [Madde 1]
      2. [Madde 2]
      
      İMZALAR:`,
      notice: `[İHTARNAME]
      
      MUHATAP: [Muhatap]
      
      KONU: [Konu]
      
      AÇIKLAMALAR:
      [Açıklamalar]
      
      SONUÇ:`,
    };

    return {
      draft: templates[type] || templates.petition,
      type,
      isMock: true,
    };
  }

  getMockClassification(file) {
    return {
      category: 'Petition',
      confidence: 0.78,
      explanation: 'Belge, dava dilekçesi formatında görünüyor.',
      isMock: true,
    };
  }

  getMockRecommendations(caseId) {
    return {
      nextSteps: [
        'Bilirkişi raporu bekleniyor',
        'Duruşma tarihi takip edilmeli',
        'Deliller hazırlanmalı',
      ],
      riskFactors: [
        'Zamanaşımı yaklaşıyor',
        'Tanık ifadeleri alınmamış',
      ],
      missingEvidence: [
        'Maaş bordroları',
        'SGK kayıtları',
      ],
      strategy: 'Uzlaşma yoluna gidilmeli, alternatif çözümler değerlendirilmeli',
      isMock: true,
    };
  }

  getMockSentiment(text) {
    return {
      sentiment: 'neutral',
      confidence: 0.65,
      indicators: ['resmi dil', 'hukuki terimler'],
      urgency: 'medium',
      isMock: true,
    };
  }
}

export const aiService = new AIService();