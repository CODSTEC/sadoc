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

// ===== Galeria =====
const galeria = document.getElementById("galeria");
if (!CONFIG.galeria.length) {
  galeria.innerHTML = '<p class="vazio">Em breve, fotos dos nossos trabalhos.</p>';
} else {
  CONFIG.galeria.forEach((foto) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.setAttribute("aria-label", `Ampliar: ${foto.alt}`);

    const picture = document.createElement("picture");
    if (foto.thumb) {
      const source = document.createElement("source");
      source.srcset = foto.thumb;
      source.type = "image/webp";
      picture.appendChild(source);
    }
    const img = document.createElement("img");
    img.src = foto.thumbFallback || foto.srcFallback || foto.src;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    picture.appendChild(img);

    botao.appendChild(picture);
    botao.addEventListener("click", () => abrir(foto));
    galeria.appendChild(botao);
  });
}

// ===== Lightbox acessível (focus trap + Esc + clique fora) =====
const lightbox = document.getElementById("lightbox");
const imgGrande = lightbox.querySelector("img");
const botaoFechar = lightbox.querySelector(".fechar");
let ultimoFoco = null;
let liberarTrap = null;

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

function abrir(foto) {
  ultimoFoco = document.activeElement;
  const fallback = foto.srcFallback || foto.src;
  const preferido = foto.src && foto.src !== fallback ? foto.src : null;

  if (preferido) {
    const teste = new Image();
    teste.onload = () => { imgGrande.src = preferido; };
    teste.onerror = () => { imgGrande.src = fallback; };
    imgGrande.src = fallback;
    teste.src = preferido;
  } else {
    imgGrande.src = fallback;
  }

  imgGrande.alt = foto.alt || "";
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  liberarTrap = prenderFoco(lightbox);
  botaoFechar.focus();
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
lightbox.addEventListener("click", (e) => {
  if (e.target !== imgGrande) fechar();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fechar();
});

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
