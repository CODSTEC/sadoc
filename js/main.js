// ===== Analytics (GA4) — só carrega se CONFIG.analyticsId estiver preenchido =====
if (CONFIG.analyticsId) {
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.analyticsId}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", CONFIG.analyticsId);
}

// ===== WhatsApp =====
const linkWhatsapp = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensagem)}`;
document.querySelectorAll("[data-whatsapp]").forEach((el) => {
  el.href = linkWhatsapp;
  el.target = "_blank";
  el.rel = "noopener";
});

// ===== Galeria (apenas .webp) =====
const galeria = document.getElementById("galeria");
const fotos = CONFIG.galeria;

if (!fotos.length) {
  galeria.innerHTML = '<p class="vazio">Em breve, fotos dos nossos trabalhos.</p>';
} else {
  fotos.forEach((foto, i) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.setAttribute("aria-label", `Ampliar: ${foto.alt}`);

    const img = document.createElement("img");
    img.src = foto.src;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";

    botao.appendChild(img);
    botao.addEventListener("click", () => abrir(i));
    galeria.appendChild(botao);
  });
}

// ===== Lightbox acessível (focus trap + Esc + setas + clique fora) =====
const lightbox = document.getElementById("lightbox");
const imgGrande = lightbox.querySelector("img");
const botaoFechar = lightbox.querySelector(".fechar");
const botaoPrev = lightbox.querySelector(".lb-prev");
const botaoNext = lightbox.querySelector(".lb-next");
let ultimoFoco = null;
let liberarTrap = null;
let indiceAtual = 0;

function focaveisEm(raiz) {
  return [...raiz.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");
}

function prenderFoco(container) {
  const handler = (e) => {
    if (e.key !== "Tab") return;
    const lista = focaveisEm(container);
    if (!lista.length) {
      e.preventDefault();
      return;
    }
    const primeiro = lista[0];
    const ultimo = lista[lista.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}

function mostrarFoto(foto) {
  imgGrande.src = foto.src;
  imgGrande.alt = foto.alt || "";
}

function abrir(indice) {
  if (!fotos.length) return;
  indiceAtual = ((indice % fotos.length) + fotos.length) % fotos.length;
  ultimoFoco = document.activeElement;
  mostrarFoto(fotos[indiceAtual]);
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  if (!liberarTrap) liberarTrap = prenderFoco(lightbox);
  botaoFechar.focus();
}

function irPara(delta) {
  if (lightbox.hidden || fotos.length < 2) return;
  indiceAtual = (indiceAtual + delta + fotos.length) % fotos.length;
  mostrarFoto(fotos[indiceAtual]);
}

function fechar() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  imgGrande.removeAttribute("src");
  imgGrande.alt = "";
  document.body.style.overflow = "";
  if (liberarTrap) {
    liberarTrap();
    liberarTrap = null;
  }
  if (ultimoFoco && typeof ultimoFoco.focus === "function") ultimoFoco.focus();
}

botaoFechar.addEventListener("click", fechar);
botaoPrev.addEventListener("click", (e) => {
  e.stopPropagation();
  irPara(-1);
});
botaoNext.addEventListener("click", (e) => {
  e.stopPropagation();
  irPara(1);
});

lightbox.addEventListener("click", (e) => {
  if (e.target === imgGrande || e.target.closest(".lb-nav") || e.target === botaoFechar) return;
  fechar();
});

document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") fechar();
  if (e.key === "ArrowLeft") irPara(-1);
  if (e.key === "ArrowRight") irPara(1);
});

// Esconde setas se houver só uma foto
if (fotos.length < 2) {
  botaoPrev.hidden = true;
  botaoNext.hidden = true;
}

// ===== Menu de celular =====
const botaoMenu = document.querySelector(".menu-botao");
const menu = document.getElementById("menu");

function alternarMenu(abrirMenu) {
  menu.classList.toggle("aberto", abrirMenu);
  botaoMenu.setAttribute("aria-expanded", String(abrirMenu));
  botaoMenu.setAttribute("aria-label", abrirMenu ? "Fechar menu" : "Abrir menu");
}

botaoMenu.addEventListener("click", () => alternarMenu(!menu.classList.contains("aberto")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => alternarMenu(false)));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("aberto")) alternarMenu(false);
});

// ===== Service Worker =====
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
