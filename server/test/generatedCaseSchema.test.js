import test from 'node:test';
import assert from 'node:assert/strict';
import { generatedCaseSchema } from '../src/validators/schemas.js';

function makeCase(difficulty) {
  const suspects = ['s1','s2','s3'].map((id,index)=>({suspectId:id,name:`Suspect ${index+1}`,age:30+index,occupation:'Curator',background:'Worked at the museum for years.',relationship:'Colleague',motive:'Had access to the archive.',alibi:'Was elsewhere during the incident.',suspiciousDetails:'Their account needs checking.'}));
  const evidence = [
    {evidenceId:'e-image',title:'Dust on display case',description:'A clear swipe crosses the dust by the rear latch.',evidenceType:'IMAGE',category:'Forensic',content:'Dust trace',timestamp:'21:00',relatedSuspectIds:['s1'],clueRole:'SUPPORTING',importance:'High'},
    {evidenceId:'e-audio',title:'Hallway recording',description:'A short recording catches a clock chime and footsteps.',evidenceType:'AUDIO',category:'Recording',content:'At the ninth chime, the door closes.',transcript:'At the ninth chime, the door closes.',timestamp:'21:10',relatedSuspectIds:['s1'],clueRole:'SUPPORTING',importance:'High'},
    {evidenceId:'e-video',title:'East corridor clip',description:'The clip shows a figure entering before the alarm.',evidenceType:'VIDEO',category:'CCTV',content:'A figure enters the east corridor.',timestamp:'21:15',relatedSuspectIds:['s1'],clueRole:'RED_HERRING',importance:'Medium'},
    {evidenceId:'e-message',title:'Shift message',description:'A message confirms the night guard changed rounds.',evidenceType:'MESSAGE',category:'Digital',content:'Rounds changed at 20:45.',timestamp:'20:30',relatedSuspectIds:['s2'],clueRole:'CONTEXT',importance:'Low'},
    {evidenceId:'e-key',title:'Spare key log',description:'A key was checked out under the culprit’s initials.',evidenceType:'PHYSICAL',category:'Access',content:'Key log entry: s1.',timestamp:'20:40',relatedSuspectIds:['s1'],clueRole:'SUPPORTING',importance:'Critical'}
  ];
  return {publicCase:{caseTitle:`${difficulty} case`,caseCategory:'Theft',difficulty,scenario:'An artifact has gone missing.',description:'A museum theft.',detailedStory:'The artifact disappeared during the evening shift.',incidentLocation:'City Museum',incidentDate:'Yesterday',objectives:['Find the culprit'],suspects,evidence,timeline:[{time:'20:30',event:'Shift message sent.'},{time:'20:45',event:'Rounds change.'},{time:'21:15',event:'Corridor clip recorded.'}]},solution:{culpritSuspectId:'s1',motive:'Debt',method:'Used a copied key.',completeExplanation:'The key and recording place the culprit at the archive.',supportingEvidenceIds:['e-image','e-audio','e-key'],redHerringEvidenceIds:['e-video'],redHerringExplanations:[{suspectId:'s2',explanation:'The schedule change looks suspicious, but it was logged before the theft.'}],solutionNarrative:'The evidence converges on suspect one.'}};
}

for (const difficulty of ['Easy','Medium','Hard']) {
  test(`accepts a consistent ${difficulty.toLowerCase()} case with relevant media clues`,()=>{
    assert.equal(generatedCaseSchema.parse(makeCase(difficulty)).publicCase.difficulty,difficulty);
  });
}

test('rejects a media clue that is not connected to the solution',()=>{
  const value=makeCase('Medium');
  value.solution.redHerringEvidenceIds=[];
  assert.throws(()=>generatedCaseSchema.parse(value),/used in the solution|red herring/);
});

test('rejects a case without video evidence',()=>{
  const value=makeCase('Easy');
  value.publicCase.evidence=value.publicCase.evidence.filter(item=>item.evidenceType!=='VIDEO');
  value.solution.redHerringEvidenceIds=[];
  assert.throws(()=>generatedCaseSchema.parse(value),/video evidence item is required/);
});

test('rejects an unknown culprit',()=>{
  const value=makeCase('Hard');
  value.solution.culpritSuspectId='missing';
  assert.throws(()=>generatedCaseSchema.parse(value),/Culprit must be one/);
});
