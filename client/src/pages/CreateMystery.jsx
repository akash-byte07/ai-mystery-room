import React,{useEffect,useState}from'react';
import{useNavigate}from'react-router-dom';
import toast from'react-hot-toast';
import api from'../services/api';

const categories=['Murder Mystery','Theft','Missing Person','Cybercrime','Blackmail','Corporate Espionage','General Mystery'];
const mediaOptions=[
  {key:'generateImage',title:'Image clue',description:'A visual evidence photograph to inspect.'},
  {key:'generateAudio',title:'Audio clue',description:'A spoken evidence recording with a transcript.'},
  {key:'generateVideo',title:'Video clue',description:'A short evidence clip to review. It can take several minutes and use additional API quota.'}
];

export default function CreateMystery(){
  const[f,setF]=useState({category:categories[0],difficulty:'Medium',scenario:'',suspectCount:4,setting:'',generateImage:true,generateAudio:true,generateVideo:true});
  const[busy,setBusy]=useState(false),nav=useNavigate();
  const[readiness,setReadiness]=useState(null);
  useEffect(()=>{api.get('/health').then(r=>setReadiness(r.data)).catch(()=>setReadiness({status:'offline'}))},[]);
  const submit=async e=>{
    e.preventDefault();setBusy(true);
    try{
      const r=await api.post('/investigations/generate',f);
      toast('Case saved. Selected media is generating in the background.');
      nav(`/investigations/${r.data.investigation._id}`);
    }catch(e){toast.error(e.response?.data?.message||'Generation failed.')}finally{setBusy(false)}
  };
  return <main className="page narrow">
    <p className="eyebrow">CASE CONFIGURATION</p><h1>Build a new mystery</h1>
    <form className="panel form-grid" onSubmit={submit}>
      <label>Category<select value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Difficulty<select value={f.difficulty} onChange={e=>setF({...f,difficulty:e.target.value})}>{['Easy','Medium','Hard'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Suspects: {f.suspectCount}<input type="range" min="3" max="6" value={f.suspectCount} onChange={e=>setF({...f,suspectCount:+e.target.value})}/></label>
      <label>Setting (optional)<input maxLength="200" placeholder="e.g. a rain-soaked museum" value={f.setting} onChange={e=>setF({...f,setting:e.target.value})}/></label>
      <label className="full">Custom scenario (optional)<textarea maxLength="3000" placeholder="Leave blank for an original AI-generated scenario…" value={f.scenario} onChange={e=>setF({...f,scenario:e.target.value})}/></label>
      <fieldset className="full media-options"><legend>EVIDENCE CLUES</legend><p>These image, audio, and video clues are part of the case. Review them with the timeline and suspect profiles before you accuse someone. All are on by default.</p>{mediaOptions.map(item=><label className="media-option" key={item.key}><input type="checkbox" checked={f[item.key]} onChange={e=>setF({...f,[item.key]:e.target.checked})}/><span><b>{item.title}</b><small>{item.description}</small></span></label>)}</fieldset>
      {readiness&&<section className="provider-readiness full" aria-live="polite"><h2>Generation setup</h2>{readiness.status==='offline'?<p className="error">Could not reach the server. Start the backend and refresh this page.</p>:<><p>Database {readiness.database?.connected?'connected':'not connected'} · Gemini {readiness.providers?.gemini?'ready':'API key missing'} · Cloudinary {readiness.providers?.cloudinary?'ready':'not configured'}</p>{!readiness.providers?.gemini&&<small>Add GEMINI_API_KEY in server/.env. Image/audio/video also need Cloudinary credentials to attach files to the case.</small>}{readiness.models&&<small className="model-list">Text: {readiness.models.text} · Image: {readiness.models.image} · Audio: {readiness.models.audio} · Video: {readiness.models.video}</small>}</>}</section>}
      <button className="button full" disabled={busy}>{busy?'Gemini is building your case…':'Generate mystery'}</button>
    </form>
  </main>
}
