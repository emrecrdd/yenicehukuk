import OpenAI from 'openai';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

class AIProvider {
  constructor() {
    this.client = null;
    this.isEnabled = false;

    if (config.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: config.OPENAI_API_KEY,
      });
      this.isEnabled = true;
      logger.info('✅ OpenAI service configured');
    } else {
      logger.warn('⚠️ OpenAI service not configured');
    }
  }

  async chatCompletion(messages, options = {}) {
    if (!this.isEnabled) {
      return this.getMockResponse(messages);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 2000,
        ...options,
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI chat completion error:', error);
      return this.getMockResponse(messages);
    }
  }

  async analyzeLegalDocument(text) {
    const systemPrompt = `
      You are a legal document analyzer. Extract the following information from the legal text:
      1. Case type
      2. Plaintiff/Applicant name
      3. Defendant/Respondent name
      4. Claim amount (if any)
      5. Important dates
      6. Risk assessment (low/medium/high)
      7. Summary (max 100 words)
      
      Return as JSON format.
    `;

    return this.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ]);
  }

  async generateCaseSummary(caseData) {
    const systemPrompt = `
      You are a legal assistant. Create a comprehensive case summary including:
      1. Case overview
      2. Key parties involved
      3. Main legal issues
      4. Current status and progress
      5. Strategic recommendations
      6. Risk factors
      
      Return as JSON format.
    `;

    return this.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(caseData) },
    ]);
  }

  async getLegalAdvice(query, context = '') {
    const systemPrompt = `
      You are a legal AI assistant. Provide professional legal advice based on the query.
      Include:
      - Legal analysis
      - Relevant regulations and laws
      - Practical recommendations
      - Risk assessment
      - Next steps
      
      Be professional, clear, and practical.
    `;

    return this.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Query: ${query}\nContext: ${context}` },
    ]);
  }

  async generateLegalDraft(type, data) {
    const templates = {
      petition: `
        Create a professional legal petition including:
        - Court name and address
        - Plaintiff/Applicant details
        - Defendant/Respondent details
        - Subject and legal basis
        - Claims and demands
        - Evidence list
        - Signature block
      `,
      contract: `
        Create a professional legal contract including:
        - Parties involved
        - Subject and scope
        - Terms and conditions
        - Payment terms
        - Duration
        - Termination clauses
        - Signatures
      `,
      notice: `
        Create a professional legal notice including:
        - Recipient details
        - Subject
        - Legal basis
        - Action required
        - Deadline
        - Consequences of non-compliance
      `,
    };

    const template = templates[type] || templates.petition;

    return this.chatCompletion([
      { role: 'system', content: template },
      { role: 'user', content: JSON.stringify(data) },
    ]);
  }

  async classifyLegalDocument(text) {
    const systemPrompt = `
      Classify the legal document into one of these categories:
      - Petition
      - Court Decision
      - Expert Report
      - Notification
      - Evidence
      - Correspondence
      - Contract
      - Other
      
      Also provide confidence score (0-1) and brief explanation.
      Return as JSON.
    `;

    return this.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ]);
  }

  async analyzeSentiment(text) {
    const systemPrompt = `
      Analyze the sentiment of the legal text:
      - Overall sentiment (positive, negative, neutral)
      - Confidence score (0-1)
      - Key emotional indicators
      - Urgency level (low, medium, high)
      - Tone (formal, aggressive, defensive, etc.)
      
      Return as JSON.
    `;

    return this.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ]);
  }

  getMockResponse(messages) {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.content.includes('extract')) {
      return JSON.stringify({
        caseType: 'İş Davası',
        plaintiff: 'Ahmet Yılmaz',
        defendant: 'ABC Şirketi',
        claimAmount: '50.000 TL',
        importantDates: ['15.01.2023', '10.02.2023'],
        riskAssessment: 'medium',
        summary: 'İş akdinin haksız feshi ile ilgili dava',
        _mock: true,
      });
    }

    if (lastMessage.content.includes('classify')) {
      return JSON.stringify({
        category: 'Petition',
        confidence: 0.78,
        explanation: 'Belge dava dilekçesi formatında',
        _mock: true,
      });
    }

    if (lastMessage.content.includes('sentiment')) {
      return JSON.stringify({
        sentiment: 'neutral',
        confidence: 0.65,
        indicators: ['resmi dil', 'hukuki terimler'],
        urgency: 'medium',
        tone: 'formal',
        _mock: true,
      });
    }

    return JSON.stringify({
      overview: 'Dava iş akdinin feshi ile ilgili',
      parties: 'Ahmet Yılmaz vs ABC Şirketi',
      issues: 'Haksız fesih, tazminat',
      status: 'Bilirkişi raporu bekleniyor',
      recommendations: 'Bilirkişi raporu takip edilmeli',
      _mock: true,
    });
  }
}

export const aiProvider = new AIProvider();
export default aiProvider;