
import { GoogleGenAI } from "@google/genai";
// FIX: Corrected the import path for types to navigate up from the 'services' directory.
import { Employee, Report } from '../types';

// Ensure the API key is available as an environment variable
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this context, we'll proceed assuming it's set.
  console.warn("Gemini API key not found in process.env.API_KEY");
}

// FIX: To avoid instantiating GoogleGenAI with an undefined API key at the module level, 
// the client is now created inside the function where the key is confirmed to exist. This prevents a potential crash on startup.

const getReportDetailsText = (report: Report): string => {
    let details = `Notas Gerais: ${report.notes}\n`;
    switch(report.role) {
        case 'Sales':
            details += `Leads Contactados: ${report.leadsContacted}\n`;
            details += `Contratos Assinados: ${report.contractsSigned}\n`;
            details += `Próximas Ações: ${report.nextActions}\n`;
            break;
        case 'Creative':
            details += `Projetos Realizados: ${report.projectsShot}\n`;
            details += `Horas em Locação: ${report.hoursOnLocation}\n`;
            details += `Equipamento Utilizado: ${report.equipmentUsed}\n`;
            details += `Próximos Passos: ${report.nextSteps}\n`;
            break;
        case 'IT':
            details += `Tickets Resolvidos: ${report.ticketsResolved}\n`;
            details += `Manutenção de Sistemas: ${report.systemsMaintenance}\n`;
            details += `Impedimentos: ${report.blockers}\n`;
            break;
    }
    return details;
}

/**
 * Generates a summary for a given employee report object using the Gemini API.
 * @param report The report object containing role-specific data.
 * @param employee The employee who submitted the report.
 * @returns A promise that resolves to the AI-generated summary string.
 */
export const getReportSummary = async (report: Report, employee: Employee): Promise<string> => {
  if (!API_KEY) {
    return "API Key não configurada. A funcionalidade de resumo por IA está desabilitada.";
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const reportDetails = getReportDetailsText(report);
    const prompt = `
      Você é um gerente experiente em uma empresa de fotografia e vídeo. Analise o seguinte relatório de um(a) ${employee.position} chamado(a) ${employee.name} e gere um resumo conciso em português (Brasil) com no máximo 3 frases. Destaque os pontos principais, como conquistas, dificuldades e as próximas ações mais importantes.

      Relatório de ${new Date(report.date).toLocaleDateString('pt-BR')}:
      ---
      ${reportDetails}
      ---

      Resumo:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Não foi possível gerar o resumo. Tente novamente mais tarde.";
  }
};
