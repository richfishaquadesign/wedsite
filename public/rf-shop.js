(async function () {
  const items = await fetch('/rf-shop-items.json').then(r => r.json());
  const byId = new Map(items.map(p => [p.id,p]));
  const key = 'rf-collection-cart-v1';
  function lines() {
    try { return Object.entries(JSON.parse(localStorage.getItem(key) || '{}')).filter(([id,n]) => byId.has(id) && Number.isInteger(n) && n>0 && n<=99); } catch { return []; }
  }
  function element(tag,text,cls) {
    const el=document.createElement(tag);
    if (text) el.textContent=text;
    if (cls) el.className=cls;
    return el;
  }
  function change(id,n) {
    const values=Object.fromEntries(lines());
    if (n>0) values[id]=Math.min(99,n); else delete values[id];
    localStorage.setItem(key,JSON.stringify(values));
    refreshBadge();
  }
  function refreshBadge() {
    const link=document.getElementById('rf-cart-link');
    const label='Giỏ hàng ('+lines().reduce((n,[,qty])=>n+qty,0)+')';
    if (link && link.textContent!==label) link.textContent=label;
  }
  function addButton(p) {
    const button=element('button','Thêm vào giỏ','button primary');
    button.type='button';
    button.onclick=()=>{change(p.id,(Object.fromEntries(lines())[p.id]||0)+1);button.textContent='Đã thêm vào giỏ';};
    return button;
  }
  function image(img,p) {
    if (!img || img.dataset.rfProduct===p.id) return;
    img.dataset.rfProduct=p.id;
    img.referrerPolicy='no-referrer';
    img.removeAttribute('srcset');
    img.src=p.image;
  }
  function cart(main) {
    const section=element('section',null,'wrap section');
    section.id='rf-cart-content';main.replaceChildren(section);
    section.append(element('h1','Giỏ hàng'));
    const list=lines();
    for(const [id,n] of list) {
      const p=byId.get(id),row=element('div',null,'filter-bar');
      const label=element('label',p.name+' · '+(p.price==null?'RF xác nhận giá':Number(p.price).toLocaleString('vi-VN')+' ₫')+' · Số lượng ');
      const input=element('input');input.type='number';input.min=1;input.max=99;input.value=n;
      input.onchange=()=>{const qty=Number(input.value);if(Number.isInteger(qty)&&qty>=1&&qty<=99)change(id,qty);else input.value=Object.fromEntries(lines())[id]};
      const remove=element('button','Xóa','button');remove.onclick=()=>{change(id,0);cart(main)};
      label.append(input);row.append(label,remove);section.append(row);
    }
    const back=element('a','Chọn thêm sản phẩm','button');back.href='/bo-suu-tap';
    if(!list.length) section.append(element('p','Giỏ hàng đang trống.'));
    section.append(back);
    if(!list.length)return;
    section.append(element('h2','Gửi giỏ hàng cho RF'),element('p','RF sẽ xác nhận giá và tình trạng hàng qua email.'));
    const mail=element('a','Soạn email gửi RF','button primary');
    function draft() {
      const body='Tôi muốn đặt các sản phẩm sau:\n'+lines().map(([id,n])=>{const p=byId.get(id);return p.name+' ('+p.sku+') × '+n}).join('\n');
      return {body, subject:'Yêu cầu đặt hàng RF Aquarium'};
    }
    mail.href='mailto:richfishaquarium@gmail.com';
    mail.onclick=()=>{const d=draft();mail.href='mailto:richfishaquarium@gmail.com?subject='+encodeURIComponent(d.subject)+'&body='+encodeURIComponent(d.body)};
    const gmail=element('a','Mở trong Gmail','button');gmail.target='_blank';gmail.rel='noopener';gmail.href='https://mail.google.com/mail/';
    gmail.onclick=()=>{const d=draft();gmail.href='https://mail.google.com/mail/?'+new URLSearchParams({view:'cm',fs:'1',to:'richfishaquarium@gmail.com',su:d.subject,body:d.body})};
    section.append(mail,document.createTextNode(' '),gmail);
  }
  function update() {
    const main=document.querySelector('main');
    if(!main)return;
    const nav=document.querySelector('.header-inner');
    if(nav&&!document.getElementById('rf-cart-link')){
      const link=element('a',null,'button');link.id='rf-cart-link';link.href='/gio-hang';nav.insertBefore(link,nav.querySelector('.menu-button'));refreshBadge();
    }
    const path=location.pathname.replace(/\/$/,'');
    if(path==='/gio-hang'){if(!main.querySelector('#rf-cart-content'))cart(main);return}
    if(path==='/bo-suu-tap'){
      for(const link of main.querySelectorAll('a[href*="/bo-suu-tap/"]')){
        const p=byId.get(new URL(link.href).pathname.split('/').pop());if(!p)continue;
        image(link.querySelector('img'),p);
        const grid=link.parentElement;
        grid.style.position='relative';
        link.style.paddingBottom='54px';
        let button=grid.querySelector('[data-add-id="'+CSS.escape(p.id)+'"]');
        if(!button){
          button=addButton(p);button.dataset.addId=p.id;button.style.position='absolute';
          grid.append(button);
        }
        button.style.left=(link.offsetLeft+12)+'px';
        button.style.top=(link.offsetTop+link.offsetHeight-48)+'px';
      }
      for(const button of main.querySelectorAll('[data-add-id]')){
        if(!Array.from(button.parentElement.querySelectorAll('a')).some(a=>new URL(a.href).pathname.endsWith('/'+button.dataset.addId)))button.remove();
      }
    } else if(path.startsWith('/bo-suu-tap/')){
      const p=byId.get(decodeURIComponent(path.split('/').pop())),article=main.querySelector('article');if(!p||!article)return;
      image(article.querySelector('img'),p);
      if(!article.querySelector('.rf-buy')){
        const controls=element('div',null,'rf-buy');controls.append(addButton(p));article.querySelector('h1')?.after(controls);
        const form=article.querySelector('form');if(form){form.hidden=true;let prev=form.previousElementSibling;while(prev&&['P','H2'].includes(prev.tagName)){prev.hidden=true;prev=prev.previousElementSibling}}
      }
    }
  }
  const style=element('style');style.textContent='.rf-product-tile{display:flex;flex-direction:column;gap:8px}.rf-product-tile>.work{flex:1}.rf-product-tile .button{align-self:flex-start}.rf-buy{margin:16px 0}#rf-cart-link{white-space:nowrap}#rf-cart-content .filter-bar{padding-block:12px}#rf-cart-content input{width:5em}';document.head.append(style);
  window.addEventListener("resize", update);
  document.addEventListener("load", event=>{if(event.target instanceof HTMLImageElement)update()}, true);
  update();
  let waiting=false;
  new MutationObserver(()=>{if(!waiting){waiting=true;requestAnimationFrame(()=>{waiting=false;update()})}}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('storage',()=>{refreshBadge();if(document.querySelector('#rf-cart-content'))cart(document.querySelector('main'))});
})().catch(e=>console.error('RF storefront',e));
