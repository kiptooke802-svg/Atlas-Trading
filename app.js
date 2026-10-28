const API='https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=true&price_change_percentage=24h';
const ASSETS=[
{id:'bitcoin',symbol:'BTC',name:'Bitcoin',tv:'BINANCE:BTCUSDT'},
{id:'ethereum',symbol:'ETH',name:'Ethereum',tv:'BINANCE:ETHUSDT'},
{id:'solana',symbol:'SOL',name:'Solana',tv:'BINANCE:SOLUSDT'},
{id:'binancecoin',symbol:'BNB',name:'BNB',tv:'BINANCE:BNBUSDT'},
{id:'ripple',symbol:'XRP',name:'XRP',tv:'BINANCE:XRPUSDT'},
{id:'dogecoin',symbol:'DOGE',name:'Dogecoin',tv:'BINANCE:DOGEUSDT'},
{id:'cardano',symbol:'ADA',name:'Cardano',tv:'BINANCE:ADAUSDT'},
{id:'avalanche-2',symbol:'AVAX',name:'Avalanche',tv:'BINANCE:AVAXUSDT'},
{id:'chainlink',symbol:'LINK',name:'Chainlink',tv:'BINANCE:LINKUSDT'},
{id:'the-open-network',symbol:'TON',name:'Toncoin',tv:'BINANCE:TONUSDT'},
{id:'polkadot',symbol:'DOT',name:'Polkadot',tv:'BINANCE:DOTUSDT'},
{id:'litecoin',symbol:'LTC',name:'Litecoin',tv:'BINANCE:LTCUSDT'}];
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
let market=[],watchlist=JSON.parse(localStorage.getItem('atlas_watchlist')||'["bitcoin","ethereum","solana","binancecoin","ripple"]');
let paper=JSON.parse(localStorage.getItem('atlas_paper')||'{"cash":10000,"positions":[],"history":[]}');let side='buy';let selectedAsset='bitcoin';let lastFetch=null;
const money=n=>Number.isFinite(Number(n))?Number(n).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:Number(n)<1?5:2}):'—';
const compact=n=>n>=1e12?'$'+(n/1e12).toFixed(2)+'T':n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(2)+'M':money(n);
const pct=n=>`${Number(n)>=0?'+':''}${Number(n||0).toFixed(2)}%`;
const safe=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function getAsset(id){return market.find(x=>x.id===id)||{id,name:ASSETS.find(a=>a.id===id)?.name||id,symbol:ASSETS.find(a=>a.id===id)?.symbol||id, current_price:0,price_change_percentage_24h:0,market_cap:0,image:''}}
function coinIcon(c){return c.image?`<img class="coin-icon" src="${safe(c.image)}" alt="" loading="lazy" onerror="this.style.display='none'">`:`<span class="coin-icon">${safe((c.symbol||'?').slice(0,3).toUpperCase())}</span>`}
function assetCell(c){return `<div class="asset-cell">${coinIcon(c)}<div><div class="asset-name">${safe(c.name)}</div><div class="asset-symbol">${safe((c.symbol||'').toUpperCase())}</div></div></div>`}
function renderMarkets(){
 const rows=market.filter(c=>{let q=$('#marketSearch').value.toLowerCase().trim();return !q||c.name.toLowerCase().includes(q)||c.symbol.toLowerCase().includes(q)});
 $('#marketRows').innerHTML=rows.map(c=>`<tr><td>${assetCell(c)}</td><td><b>${money(c.current_price)}</b></td><td class="change ${c.price_change_percentage_24h>=0?'up':'down'}">${pct(c.price_change_percentage_24h)}</td><td>${compact(c.market_cap||0)}</td><td><button class="star-btn ${watchlist.includes(c.id)?'on':''}" data-watch="${c.id}" aria-label="Toggle ${safe(c.name)} watchlist">${watchlist.includes(c.id)?'★':'☆'}</button></td><td><button class="trade-mini" data-trade="${c.id}">Trade</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty-state">No assets match your search.</td></tr>';
 $('#topAssets').innerHTML=market.slice(0,7).map(c=>`<tr><td>${assetCell(c)}</td><td>${money(c.current_price)}</td><td class="change ${c.price_change_percentage_24h>=0?'up':'down'}">${pct(c.price_change_percentage_24h)}</td><td><button class="star-btn ${watchlist.includes(c.id)?'on':''}" data-watch="${c.id}" aria-label="Toggle watchlist">${watchlist.includes(c.id)?'★':'☆'}</button></td></tr>`).join('');
 $('#sideWatchlist').innerHTML=watchlist.map(id=>{let c=getAsset(id);return `<div class="side-watch" data-chartasset="${id}">${coinIcon(c)}<div class="sw-name">${safe(c.symbol?.toUpperCase())}<small>${safe(c.name)}</small></div><div class="sw-price">${money(c.current_price)}<small class="${c.price_change_percentage_24h>=0?'positive':'change down'}">${pct(c.price_change_percentage_24h)}</small></div></div>`}).join('')||'<div class="muted" style="padding:10px;font-size:10px">Add assets with ☆</div>';
 $('#watchCount').textContent=`${watchlist.length} assets`;updateOrderPrice();renderPositions();
}
async function fetchMarkets(){
 $('#connectionState').textContent='Connecting…';
 try{
  const response=await fetch(API,{cache:'no-store'});if(!response.ok)throw new Error('Market provider returned '+response.status);
  market=await response.json();lastFetch=new Date();$('#connectionState').textContent='Connected';$('#dataNote').textContent='CoinGecko public market data · Updated '+lastFetch.toLocaleTimeString()+' · API limits may apply.';
  renderMarkets();updatePortfolio();updateChartPrice();
 }catch(e){$('#connectionState').textContent='Unavailable';$('#dataNote').textContent='Live feed unavailable right now. Try Refresh in a moment. Provider limits or network restrictions may apply.';if(!market.length){$('#topAssets').innerHTML='<tr><td colspan="4" class="empty-state">Could not load market prices. Check your connection and refresh.</td></tr>';$('#marketRows').innerHTML='<tr><td colspan="6" class="empty-state">Market data unavailable. This page requires internet access.</td></tr>';}toast('Market data could not refresh. '+e.message);}
}
function save(){localStorage.setItem('atlas_paper',JSON.stringify(paper));localStorage.setItem('atlas_watchlist',JSON.stringify(watchlist))}
function updatePortfolio(){
 $('#balance').textContent=money(paper.cash);$('#availableCash').textContent=money(paper.cash);$('#openPositions').textContent=paper.positions.length;
 let pl=paper.positions.reduce((s,p)=>s+(getAsset(p.asset).current_price-p.entry)*p.qty,0);$('#unrealized').textContent=money(pl);$('#unrealized').className='stat-value '+(pl>=0?'positive':'change down');
}
function updateOrderPrice(){let c=getAsset($('#tradeAsset').value);$('#orderPrice').textContent=money(c.current_price);let amount=Number($('#orderAmount').value)||0;$('#orderQty').textContent=c.current_price>0?(amount/c.current_price).toFixed(6)+' '+(c.symbol||'').toUpperCase():'—'}
function updateChartPrice(){let c=getAsset(selectedAsset);if(c.current_price){$('#chartPrice').textContent=money(c.current_price);$('#chartChange').textContent=pct(c.price_change_percentage_24h);$('#chartChange').className='muted change '+(c.price_change_percentage_24h>=0?'up':'down');$('#chartHeading').innerHTML=`${safe(c.name)} <span class="symbol">${safe(c.symbol.toUpperCase())} / USD</span>`}}
function initChart(symbol){const el=$('#tv_chart');el.innerHTML='';if(!window.TradingView){el.innerHTML='<div class="empty-state">Chart provider script did not load. Check your connection.</div>';return;}try{new TradingView.widget({autosize:true,symbol:symbol||'BINANCE:BTCUSDT',interval:'60',timezone:'Africa/Nairobi',theme:'dark',style:'1',locale:'en',enable_publishing:false,allow_symbol_change:true,hide_top_toolbar:false,hide_legend:false,save_image:false,container_id:'tv_chart',backgroundColor:'#0b1220',gridColor:'#182538',studies:['MASimple@tv-basicstudies']});}catch(e){el.innerHTML='<div class="empty-state">Chart could not load. Please refresh.</div>';}}
function renderPositions(){
 let rows=paper.positions;
 $('#positionsRows').innerHTML=rows.length?rows.map((p,i)=>{let c=getAsset(p.asset),value=c.current_price*p.qty,pl=(c.current_price-p.entry)*p.qty;return `<tr><td>${assetCell(c)}</td><td class="${p.side==='BUY'?'side-buy':'side-sell'}">${p.side}</td><td>${p.qty.toFixed(6)}</td><td>${money(p.entry)}</td><td>${money(value)}</td><td class="change ${pl>=0?'up':'down'}">${money(pl)}</td><td><button class="close-position" data-close="${i}">Close</button></td></tr>`}).join(''):'<tr><td colspan="7" class="empty-state">No open paper positions yet. Place a demo order to get started.</td></tr>';
}
function toast(msg){let t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3500)}
function placeOrder(){
 let id=$('#tradeAsset').value,c=getAsset(id),amount=Number($('#orderAmount').value);
 if(!c.current_price){toast('No current price is available for this asset.');return}
 if(!Number.isFinite(amount)||amount<=0){toast('Enter a valid amount greater than zero.');return}
 if(side==='buy'&&amount>paper.cash){toast('Insufficient demo cash for this paper order.');return}
 if(side==='sell'){let idx=paper.positions.findIndex(p=>p.asset===id&&p.side==='BUY');if(idx<0){toast('You have no open paper position in this asset to sell.');return}let p=paper.positions[idx],qty=Math.min(p.qty,amount/c.current_price),proceeds=qty*c.current_price;paper.cash+=proceeds;p.qty-=qty;if(p.qty<0.00000001)paper.positions.splice(idx,1);paper.history.unshift({date:new Date().toISOString(),asset:id,side:'SELL',qty,price:c.current_price,total:proceeds});}
 else {paper.cash-=amount;paper.positions.push({asset:id,side:'BUY',qty:amount/c.current_price,entry:c.current_price,opened:new Date().toISOString()});paper.history.unshift({date:new Date().toISOString(),asset:id,side:'BUY',qty:amount/c.current_price,price:c.current_price,total:amount});}
 save();updatePortfolio();renderPositions();$('#orderMessage').textContent=`Paper ${side} order recorded · ${new Date().toLocaleTimeString()}`;toast(`Paper ${side.toLowerCase()} order recorded. No real trade was placed.`);$('#orderAmount').value=100;updateOrderPrice();
}
function setSide(s){side=s;$('#buyTab').classList.toggle('selected',s==='buy');$('#sellTab').classList.toggle('selected',s==='sell');$('#submitOrder').innerHTML=`${s==='buy'?'Buy':'Sell'} at market <span>→</span>`;$('#submitOrder').style.background=s==='buy'?'linear-gradient(100deg,#5978ec,#718cff)':'linear-gradient(100deg,#b34b63,#d75c75)'}
document.addEventListener('click',e=>{
 const w=e.target.closest('[data-watch]');if(w){let id=w.dataset.watch;watchlist=watchlist.includes(id)?watchlist.filter(x=>x!==id):[...watchlist,id];save();renderMarkets();return}
 const t=e.target.closest('[data-trade]');if(t){$('#tradeAsset').value=t.dataset.trade;updateOrderPrice();$('#tradePanel').scrollIntoView({behavior:'smooth',block:'center'});return}
 const sc=e.target.closest('[data-chartasset]');if(sc){selectedAsset=sc.dataset.chartasset;let a=ASSETS.find(x=>x.id===selectedAsset);$('#chartAsset').value=a?.tv?.split(':').pop()||'BINANCE:BTCUSDT';initChart(a?.tv||'BINANCE:BTCUSDT');updateChartPrice();return}
 const close=e.target.closest('[data-close]');if(close){let i=Number(close.dataset.close),p=paper.positions[i];if(!p)return;let c=getAsset(p.asset),value=c.current_price*p.qty;paper.cash+=value;paper.history.unshift({date:new Date().toISOString(),asset:p.asset,side:'CLOSE',qty:p.qty,price:c.current_price,total:value});paper.positions.splice(i,1);save();updatePortfolio();renderPositions();toast('Paper position closed at latest available price.');return}
 const goto=e.target.closest('[data-goto]');if(goto){let target=goto.dataset.goto==='history'?'positionsPanel':'marketTablePanel';document.getElementById(target).scrollIntoView({behavior:'smooth'});if(goto.dataset.goto==='history')showHistory();return}
 const nav=e.target.closest('[data-view]');if(nav){$$('.nav').forEach(n=>n.classList.toggle('active',n===nav));$('#pageTitle').textContent=nav.textContent.trim();let target={overview:'mainChartPanel',markets:'marketTablePanel',chart:'mainChartPanel',portfolio:'positionsPanel',history:'positionsPanel'}[nav.dataset.view];document.getElementById(target).scrollIntoView({behavior:'smooth'});if(nav.dataset.view==='history')showHistory();$('.sidebar').classList.remove('open')}
});
function showHistory(){let body=$('#positionsRows');if(!paper.history.length){toast('No paper orders have been recorded yet.');return}body.innerHTML=paper.history.map(h=>{let c=getAsset(h.asset);return `<tr><td>${assetCell(c)}</td><td>${h.side}</td><td>${h.qty.toFixed(6)}</td><td>${money(h.price)}</td><td>${money(h.total)}</td><td>${new Date(h.date).toLocaleString()}</td><td>Recorded</td></tr>`}).join('');$('.positions-panel h2').textContent='Paper order history';$('.positions-panel thead').innerHTML='<tr><th>Asset</th><th>Side</th><th>Quantity</th><th>Price</th><th>Total</th><th>Date</th><th>Status</th></tr>'}
$('#marketSearch').addEventListener('input',renderMarkets);$('#tradeAsset').addEventListener('change',updateOrderPrice);$('#orderAmount').addEventListener('input',updateOrderPrice);$('#buyTab').addEventListener('click',()=>setSide('buy'));$('#sellTab').addEventListener('click',()=>setSide('sell'));$('#submitOrder').addEventListener('click',placeOrder);$('#refreshBtn').addEventListener('click',fetchMarkets);$('#menuBtn').addEventListener('click',()=>$('.sidebar').classList.toggle('open'));
$('#chartAsset').addEventListener('change',e=>{let v=e.target.value;let tv=v.includes(':')?v:'BINANCE:'+v;let a=ASSETS.find(x=>x.tv===tv);if(a)selectedAsset=a.id;initChart(tv);updateChartPrice()});
$$('.period').forEach(b=>b.addEventListener('click',()=>{$$('.period').forEach(x=>x.classList.toggle('active',x===b));let map={'1D':'15','1W':'60','1M':'D'};const v=$('#chartAsset').value;initChart((v.includes(':')?v:'BINANCE:'+v));toast('Chart interval controls can be adjusted inside the TradingView chart toolbar.')}));
// Start up. This dashboard fetches real public market prices; paper orders are kept only in this browser.
initChart('BINANCE:BTCUSDT');fetchMarkets();setInterval(fetchMarkets,60000);setInterval(updatePortfolio,15000);
