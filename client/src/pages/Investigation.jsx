import React,{useEffect,useState}from'react';
import{useParams,useNavigate,Link}from'react-router-dom';
import toast from'react-hot-toast';
import api from'../services/api';

const labels={MESSAGE:'Messages',IMAGE:'Images',AUDIO:'Audio',VIDEO:'Video',WITNESS_STATEMENT:'Statements',PHYSICAL:'Physical',DIGITAL:'Digital'};
const formatDuration=value=>value?`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`:'';

export default function Investigation(){
  const{id}=useParams(),nav=useNavigate();
  const[x,setX]=useState(null),[tab,setTab]=useState('All'),[pick,setPick]=useState('');
  const[notes,setNotes]=useState([]),[note,setNote]=useState(''),[error,setError]=useState(''),[image,setImage]=useState(null);
  const[board,setBoard]=useState({bookmarkedEvidenceIds:[],links:[]}),[linkSelections,setLinkSelections]=useState({});

  useEffect(()=>{
    let active=true;
    const load=async()=>{
      try{const r=await api.get(`/investigations/${id}`);if(!active)return;const item=r.data.investigation;if(item.status==='completed'){nav(`/investigations/${id}/result`,{replace:true});return}setX(item)}
      catch(e){if(active)setError(e.response?.data?.message||'Could not load this case.')}
    };
    load();
    api.get(`/notes/${id}`).then(r=>{if(active)setNotes(r.data.notes)}).catch(()=>{});
    api.get(`/investigations/${id}/board`).then(r=>{if(active)setBoard(r.data)}).catch(()=>{});
    const timer=setInterval(()=>{if(active)load()},3000);
    return()=>{active=false;clearInterval(timer)};
  },[id,nav]);

  const saveBoard=async next=>{setBoard(next);try{const r=await api.put(`/investigations/${id}/board`,next);setBoard(r.data)}catch(e){toast.error(e.response?.data?.message||'Could not save the evidence board.')}};
  const toggleBookmark=evidenceId=>{const ids=board.bookmarkedEvidenceIds.includes(evidenceId)?board.bookmarkedEvidenceIds.filter(id=>id!==evidenceId):[...board.bookmarkedEvidenceIds,evidenceId];saveBoard({...board,bookmarkedEvidenceIds:ids})};
  const linkEvidence=evidenceId=>{const suspectId=linkSelections[evidenceId];if(!suspectId)return toast.error('Choose a suspect to connect.');saveBoard({...board,links:[...board.links,{evidenceId,suspectId}]});setLinkSelections({...linkSelections,[evidenceId]:''})};
  const unlinkEvidence=(evidenceId,suspectId)=>saveBoard({...board,links:board.links.filter(link=>link.evidenceId!==evidenceId||link.suspectId!==suspectId)});
  const submit=async()=>{if(!pick)return toast.error('Select a suspect first.');if(!confirm('Your accusation is final. Submit it?'))return;try{await api.post(`/investigations/${id}/submit`,{selectedSuspectId:pick});nav(`/investigations/${id}/result`)}catch(e){toast.error(e.response?.data?.message||'Unable to submit')}};
  const add=async e=>{e.preventDefault();if(!note.trim())return;try{const r=await api.post(`/notes/${id}`,{noteContent:note.trim()});setNotes([r.data.note,...notes]);setNote('')}catch(e){toast.error(e.response?.data?.message||'Could not save your note.')}};

  if(error)return <main className="page narrow"><section className="panel"><p role="alert" className="error">{error}</p><Link className="button" to="/history">Back to case files</Link></section></main>;
  if(!x)return <div className="loading">Retrieving evidence…</div>;
  const evidence=tab==='All'?x.evidence:x.evidence.filter(e=>labels[e.evidenceType]===tab);
  const pending=['queued','processing'].includes(x.mediaGeneration?.status);
  const evidenceById=new Map(x.evidence.map(item=>[item.evidenceId,item]));
  const suspectById=new Map(x.suspects.map(item=>[item.suspectId,item]));

  return <main className="page case">
    <p className="eyebrow">{x.caseCategory} · {x.difficulty} · ACTIVE CASE</p><h1>{x.caseTitle}</h1><p className="lede">{x.description}</p>
    {pending&&<section className="media-progress panel" aria-live="polite"><b>Evidence media is being generated</b><p>Your case is ready. Files will appear here as each one finishes.</p><small>Image: {x.mediaGeneration.image} · Audio: {x.mediaGeneration.audio} · Video: {x.mediaGeneration.video}</small></section>}
    {x.mediaGeneration?.message&&x.mediaGeneration.status!=='ready'&&x.mediaGeneration.status!=='processing'&&<section className="media-progress panel"><b>Media status: {x.mediaGeneration.status.replaceAll('_',' ')}</b><p>{x.mediaGeneration.message}</p></section>}
    <section className="story panel"><h2>Case briefing</h2><p>{x.detailedStory}</p><small>{x.incidentLocation} · {x.incidentDate}</small></section>
    <div className="workspace">
      <section><h2>Suspects</h2><div className="suspects">{x.suspects.map(s=><article className={'suspect '+(pick===s.suspectId?'selected':'')} key={s.suspectId}>
        <label className="suspect-choice"><input type="radio" name="suspect" value={s.suspectId} checked={pick===s.suspectId} onChange={()=>setPick(s.suspectId)}/><span><b>{s.name}</b><small>{s.occupation} · {s.age}</small></span></label>
        <p>{s.relationship}</p><details><summary>Read profile</summary><p>{s.background}</p><p><b>Motive:</b> {s.motive}</p><p><b>Alibi:</b> {s.alibi}</p><p><b>Suspicion:</b> {s.suspiciousDetails}</p></details>
      </article>)}</div><button className="button danger" onClick={submit}>Submit final accusation</button></section>
      <aside><h2>Timeline</h2>{x.timeline.map((t,i)=><div className="timeline" key={i}><b>{t.time}</b><p>{t.event}</p></div>)}<h2>Private notes</h2><form onSubmit={add}><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Record a clue…" maxLength="3000"/><button className="plain">Save note</button></form>{notes.map(n=><p className="note" key={n._id}>{n.noteContent}</p>)}</aside>
    </div>
    <section className="board panel"><h2>Private evidence board</h2><p>Bookmark clues and connect them to suspects. Only you can see these working notes.</p>{board.bookmarkedEvidenceIds.length===0&&board.links.length===0?<p className="muted">No clues pinned yet. Use the controls on any evidence card to start building connections.</p>:<div className="board-items">{[...new Set([...board.bookmarkedEvidenceIds,...board.links.map(link=>link.evidenceId)])].map(evidenceId=>{const clue=evidenceById.get(evidenceId);if(!clue)return null;const linked=board.links.filter(link=>link.evidenceId===evidenceId);return <article key={evidenceId}><b>{clue.title}</b>{board.bookmarkedEvidenceIds.includes(evidenceId)&&<small>BOOKMARKED</small>}{linked.map(link=><span className="board-link" key={link.suspectId}>{suspectById.get(link.suspectId)?.name||'Suspect'} <button onClick={()=>unlinkEvidence(evidenceId,link.suspectId)} aria-label="Remove suspect connection">×</button></span>)}</article>})}</div>}</section>
    <section><h2>Evidence</h2><div className="tabs">{['All',...Object.values(labels)].map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div>
      <div className="evidence">{evidence.map(e=><article className="panel" key={e.evidenceId}>
        <span className="tag">{labels[e.evidenceType]}</span><h3>{e.title}</h3><p>{e.description}</p>
        {e.clueRole&&e.clueRole!=='CONTEXT'&&<small className="clue-role">{e.clueRole.replace('_',' ')}</small>}
        {e.relatedSuspectIds?.length>0&&<small>Related: {e.relatedSuspectIds.map(id=>suspectById.get(id)?.name||id).join(', ')}</small>}
        {e.evidenceType==='IMAGE'&&e.fileUrl&&<button className="media-preview" onClick={()=>setImage(e)}><img src={e.fileUrl} alt={e.title}/><span>Open image</span></button>}
        {e.evidenceType==='AUDIO'&&e.fileUrl&&<><audio controls preload="none" src={e.fileUrl}>Audio playback is not supported in this browser.</audio>{e.durationSeconds&&<small>Recording · {formatDuration(e.durationSeconds)}</small>}</>}
        {e.evidenceType==='VIDEO'&&e.fileUrl&&<><video controls preload="metadata" src={e.fileUrl}>Video playback is not supported in this browser.</video>{e.durationSeconds&&<small>Evidence clip · {formatDuration(e.durationSeconds)}</small>}</>}
        {['IMAGE','AUDIO','VIDEO'].includes(e.evidenceType)&&!e.fileUrl&&<p className="muted">{pending?'Media file is being prepared. Review the written description in the meantime.':'No media file is attached. Review the written description and any transcript.'}</p>}
        {e.content&&<pre>{typeof e.content==='string'?e.content:JSON.stringify(e.content,null,2)}</pre>}
        {e.transcript&&<p><b>Transcript:</b> {e.transcript}</p>}<small>{e.timestamp}</small>
        <div className="evidence-board-controls"><button className="plain" onClick={()=>toggleBookmark(e.evidenceId)}>{board.bookmarkedEvidenceIds.includes(e.evidenceId)?'★ Bookmarked':'☆ Bookmark clue'}</button><div><select aria-label={`Choose suspect for ${e.title}`} value={linkSelections[e.evidenceId]||''} onChange={event=>setLinkSelections({...linkSelections,[e.evidenceId]:event.target.value})}><option value="">Connect to suspect…</option>{x.suspects.map(s=><option value={s.suspectId} key={s.suspectId}>{s.name}</option>)}</select><button className="plain" onClick={()=>linkEvidence(e.evidenceId)}>Connect</button></div></div>
      </article>)}</div>
    </section>
    {image&&<div className="lightbox" role="dialog" aria-modal="true" aria-label={image.title} onClick={()=>setImage(null)}><button className="lightbox-close" onClick={()=>setImage(null)} aria-label="Close image">×</button><img src={image.fileUrl} alt={image.title} onClick={e=>e.stopPropagation()}/><p>{image.title}</p></div>}
  </main>
}
