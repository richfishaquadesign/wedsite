import { Pool } from 'pg';

let pool;
const defaults = { id: 'home', kind: 'page', blocks: [{ id: 'hero', title: 'Một khoảng\nthiên nhiên.\nMột dấu ấn riêng.', caption: 'RF AQUARIUM', image: '/images/source/home-2.webp' }] };
function database() {
  if (!process.env.DATABASE_URL) throw Error('storage');
  return pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
}
async function authorized(pin) {
  if (!/^\d{4,12}$/.test(pin || '')) return false;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!key || !url) throw Error('identity');
  const endpoint = new URL('/rest/v1/Config_NhanSu', url);
  endpoint.search = new URLSearchParams({select:'Phân Quyền','Mã PIN':'eq.'+pin,limit:'2'});
  const r = await fetch(endpoint,{headers:{apikey:key,Authorization:'Bearer '+key}});
  if (!r.ok) throw Error('identity');
  const rows = await r.json();
  return rows.length === 1 && rows[0]['Phân Quyền']?.trim().toUpperCase() === 'TỐI CAO';
}
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  try {
    if (req.method === 'GET') {
      const {rows} = await database().query('SELECT published FROM rf_workspace_home WHERE id=1');
      return res.json(rows[0]?.published ?? null);
    }
    if (req.method !== 'POST') return res.status(405).end();
    const {pin,operation,revision,document} = req.body || {};
    if (!(await authorized(pin))) return res.status(403).json({error:'Cần quyền TỐI CAO trong RF Workspace v2.'});
    const db=database();
    if (operation === 'list') {
      const {rows}=await db.query('SELECT draft,revision FROM rf_workspace_home WHERE id=1');
      return res.json([{id:'home',...(rows[0] ?? {revision:0,draft:defaults})}]);
    }
    if (!Number.isInteger(revision)||revision<0) return res.status(400).json({error:'Phiên bản không hợp lệ.'});
    let result;
    if (operation === 'save') {
      const b=document?.blocks?.[0];
      if (!b || ['title','caption','image'].some(k=>typeof b[k]!=='string'||!b[k].trim()||b[k].length>1500) || !/^(?:https:\/\/|\/(?!\/))/.test(b.image)) return res.status(400).json({error:'Kiểm tra tiêu đề, chú thích và ảnh.'});
      const draft=JSON.stringify({...defaults,blocks:[{id:'hero',title:b.title,caption:b.caption,image:b.image}]});
      result=revision===0 ? await db.query('INSERT INTO rf_workspace_home(id,draft,revision) VALUES(1,$1,1) ON CONFLICT DO NOTHING RETURNING draft,revision',[draft]) : await db.query('UPDATE rf_workspace_home SET draft=$1,revision=revision+1 WHERE id=1 AND revision=$2 RETURNING draft,revision',[draft,revision]);
    } else if(operation==='publish') {
      result=await db.query('UPDATE rf_workspace_home SET published=draft WHERE id=1 AND revision=$1 RETURNING draft,revision',[revision]);
    } else return res.status(400).json({error:'Thao tác không hợp lệ.'});
    if(!result.rowCount)return res.status(409).json({error:'Hãy tải lại phiên bản hiện tại.'});
    return res.json({id:'home',...result.rows[0]});
  } catch {
    return res.status(503).json({error:'Chưa kết nối được kho nội dung hoặc bảng phân quyền Workspace.'});
  }
}
