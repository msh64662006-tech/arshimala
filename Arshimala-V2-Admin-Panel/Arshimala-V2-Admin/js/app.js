document.addEventListener("DOMContentLoaded",()=>{
  updateCartCount();
  const toggle=document.getElementById("menuToggle"), nav=document.getElementById("navLinks");
  if(toggle) toggle.addEventListener("click",()=>nav.classList.toggle("show"));
  renderFeatured();
  renderProducts();
});
function getCart(){return JSON.parse(localStorage.getItem("arshimalaCart")||"[]")}
function saveCart(cart){localStorage.setItem("arshimalaCart",JSON.stringify(cart));updateCartCount()}
function updateCartCount(){const el=document.getElementById("cartCount"); if(el) el.textContent=getCart().reduce((s,p)=>s+p.qty,0)}
function addToCart(id){
 const product=PRODUCTS.find(p=>p.id===Number(id)); if(!product)return;
 const cart=getCart(), found=cart.find(p=>p.id===product.id);
 if(found) found.qty++; else cart.push({...product,qty:1});
 saveCart(cart); showToast("Added to your cart");
}
function showToast(msg){let t=document.querySelector(".toast");if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t)}t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function productCard(p){
 return `<article class="product-card"><a href="product.html?id=${p.id}" class="product-image">${p.badge?`<span class="badge">${p.badge}</span>`:""}<img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/700x900/f7f2ef/9f1825?text=Arshimala'"></a><div class="product-info"><div><span class="product-category">${p.category}</span><h3>${p.name}</h3></div><strong>৳${p.price.toLocaleString()}</strong></div><button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button></article>`;
}
function renderFeatured(){const el=document.getElementById("featuredProducts");if(el)el.innerHTML=PRODUCTS.slice(0,4).map(productCard).join("")}
function renderProducts(){
 const grid=document.getElementById("productGrid");if(!grid)return;
 const search=document.getElementById("searchInput"),sort=document.getElementById("sortSelect");
 const draw=()=>{let arr=[...PRODUCTS],q=(search?.value||"").toLowerCase();arr=arr.filter(p=>(p.name+" "+p.category).toLowerCase().includes(q));if(sort?.value==="low")arr.sort((a,b)=>a.price-b.price);if(sort?.value==="high")arr.sort((a,b)=>b.price-a.price);if(sort?.value==="new")arr.sort((a,b)=>b.id-a.id);grid.innerHTML=arr.map(productCard).join("");document.getElementById("emptyState").hidden=arr.length>0};
 search?.addEventListener("input",draw);sort?.addEventListener("change",draw);draw();
}