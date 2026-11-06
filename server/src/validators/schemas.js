import { z } from 'zod';
const suspect = z.object({ suspectId: z.string(), name: z.string(), age: z.number().int().min(16).max(110), occupation: z.string(), background: z.string(), relationship: z.string(), motive: z.string(), alibi: z.string(), suspiciousDetails: z.string(), avatarUrl: z.string().optional().default('') });
const evidence = z.object({ evidenceId: z.string(), title: z.string(), description: z.string(), evidenceType: z.enum(['MESSAGE','IMAGE','AUDIO','VIDEO','WITNESS_STATEMENT','PHYSICAL','DIGITAL']), category: z.string(), content: z.any(), fileUrl: z.string().optional().default(''), transcript: z.string().optional().default(''), durationSeconds: z.number().positive().optional(), timestamp: z.string(), relatedSuspectIds: z.array(z.string()).default([]), clueRole: z.enum(['SUPPORTING','CONTRADICTING','RED_HERRING','CONTEXT']).default('CONTEXT'), importance: z.string() });
export const generatedCaseBaseSchema = z.object({ publicCase: z.object({ caseTitle: z.string(), caseCategory: z.string(), difficulty: z.string(), scenario: z.string(), description: z.string(), detailedStory: z.string(), incidentLocation: z.string(), incidentDate: z.string(), objectives: z.array(z.string()), suspects: z.array(suspect).min(3).max(6), evidence: z.array(evidence).min(5), timeline: z.array(z.object({ time: z.string(), event: z.string() })).min(3) }), solution: z.object({ culpritSuspectId: z.string(), motive: z.string(), method: z.string(), completeExplanation: z.string(), supportingEvidenceIds: z.array(z.string()).min(2), redHerringEvidenceIds: z.array(z.string()).default([]), redHerringExplanations: z.array(z.object({ suspectId: z.string(), explanation: z.string() })), solutionNarrative: z.string() }) });
const providerSchemaFields = new Set(['type','properties','required','items','enum','minItems','maxItems','minimum','maximum','description']);
function toGeminiSchema(value) {
  if (Array.isArray(value)) return value.map(toGeminiSchema);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).flatMap(([key, child]) => {
    if (!providerSchemaFields.has(key)) return [];
    if (key === 'properties') return [[key, Object.fromEntries(Object.entries(child).map(([name, property]) => [name, toGeminiSchema(property)]))]];
    return [[key, toGeminiSchema(child)]];
  }));
}
export const generatedCaseJsonSchema = toGeminiSchema(z.toJSONSchema(generatedCaseBaseSchema, { target: 'draft-07' }));
export const generatedCaseSchema = generatedCaseBaseSchema.superRefine((v, ctx) => {
  const suspects = new Set(v.publicCase.suspects.map(s => s.suspectId));
  const evidence = new Map(v.publicCase.evidence.map(item => [item.evidenceId, item]));
  const supporting = new Set(v.solution.supportingEvidenceIds);
  const redHerrings = new Set(v.solution.redHerringEvidenceIds);
  const addIssue = message => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  if (!suspects.has(v.solution.culpritSuspectId)) addIssue('Culprit must be one of the generated suspects');
  for (const type of ['IMAGE','AUDIO','VIDEO']) if (!v.publicCase.evidence.some(item => item.evidenceType === type)) addIssue(`At least one ${type.toLowerCase()} evidence item is required`);
  for (const id of [...supporting, ...redHerrings]) if (!evidence.has(id)) addIssue(`Solution references missing evidence: ${id}`);
  for (const item of v.publicCase.evidence) {
    if (item.relatedSuspectIds.some(id => !suspects.has(id))) addIssue(`Evidence ${item.evidenceId} references an unknown suspect`);
    if (['IMAGE','AUDIO','VIDEO'].includes(item.evidenceType)) {
      if (!item.relatedSuspectIds.length) addIssue(`${item.evidenceType} evidence must be connected to a suspect`);
      if (item.clueRole === 'CONTEXT') addIssue(`${item.evidenceType} evidence must affect the case solution`);
      if (!supporting.has(item.evidenceId) && !redHerrings.has(item.evidenceId)) addIssue(`${item.evidenceType} evidence must be used in the solution or explained as a red herring`);
    }
  }
  for (const id of v.solution.redHerringEvidenceIds) if (supporting.has(id)) addIssue(`Evidence ${id} cannot be both supporting evidence and a red herring`);
  for (const item of v.solution.redHerringExplanations) if (!suspects.has(item.suspectId)) addIssue(`Red herring explanation references an unknown suspect: ${item.suspectId}`);
});
