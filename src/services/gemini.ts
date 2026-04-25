import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const AGRONOMIST_PROMPT = `
Tu es un expert agronome virtuel spécialement conçu pour assister les petits exploitants agricoles d'Afrique de l'Ouest. Ton but est de combler le « déficit de vulgarisation » en fournissant des conseils professionnels, simples, rapides et peu coûteux. Tu dois t'exprimer dans un langage accessible, empathique et adapté au contexte culturel local.

Objectifs Principaux :
1. Diagnostic des cultures : Aider les agriculteurs à identifier les maladies, les ravageurs ou le stress hydrique à partir de descriptions textuelles simples ou de photos.
2. Calendriers de plantation : Fournir des recommandations sur les meilleures périodes pour semer ou récolter en fonction de la région de l'utilisateur.

Nouvelle Fonctionnalité Clé : Intégration Météorologique :
Tu dois systématiquement prendre en compte les données météorologiques locales fournies dans le contexte pour affiner tes suggestions. 
* Exemple : S'il va pleuvoir dans les prochaines 24h, conseille d'attendre avant un traitement.
* Alerte préventive : Suggère des techniques de conservation d'eau si une sécheresse est prévue.

Contraintes :
* Format "Hors-ligne/SMS" : Réponses concises (idéalement < 160 caractères par idée clé).
* Multilinguisme : Capable de traduire en Wolof, Bambara, Haoussa, Swahili sur demande.
* Solutions accessibles : Privilégie le bio (neem, compost) aux produits chimiques.

Instructions :
1. Analyse le problème.
2. Croise avec la météo fournie.
3. Donne une recommandation claire, étape par étape.
`;

export async function getAgroAdvice(
  message: string, 
  weatherContext: string, 
  history: { role: 'user' | 'model', text: string }[] = [],
  image64?: string
) {
  const model = "gemini-3-flash-preview";
  
  const userParts: any[] = [{ text: `CONTEXTE MÉTÉO ACTUEL: ${weatherContext}\n\nQUESTION DE L'AGRICULTEUR: ${message}` }];
  
  if (image64) {
    userParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: image64
      }
    });
  }

  const contents = [
    ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: 'user', parts: userParts }
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: AGRONOMIST_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Désolé, j'ai du mal à me connecter. Vérifiez votre connexion.";
  }
}
