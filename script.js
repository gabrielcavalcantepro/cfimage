// Registra plugins GSAP
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Cria scroll smoother
ScrollSmoother.create({
    smooth: 1,
    effects: true,
    smoothTouch: 0.1,
});

// Animação de blur na primeira seção
gsap.to(".blur", {
    opacity: 0,
    filter: "blur(20px)",
    y: -50,
    stagger: 0.1,
    scrollTrigger: {
        trigger: ".secao-1",
        start: "top+=150 top",
        end: "bottom+=200 top",
        scrub: true,
    }
});

// Função para verificar se é mobile
function isMobile() {
    return window.innerWidth <= 767;
}

// SISTEMA DE ESTADO GLOBAL
const BotaoManager = {
    botaoAbertoAtual: null,
    todosBotoes: [],
    
    // Fecha o botão atual aberto
    fecharBotaoAtual() {
        if (this.botaoAbertoAtual && this.botaoAbertoAtual._tlSaida) {
            this.botaoAbertoAtual._tlEntrada?.pause();
            this.botaoAbertoAtual._tlSaida.restart();
            this.botaoAbertoAtual._aberto = false;
            
            setTimeout(() => {
                this.botaoAbertoAtual?.classList.remove('aberto');
            }, this.botaoAbertoAtual._config?.tempoAnimacao * 1000 || 350);
            
            this.botaoAbertoAtual = null;
        }
    },
    
    // Fecha TODOS os botões
    fecharTodos() {
        this.todosBotoes.forEach(botao => {
            if (botao.classList.contains('aberto')) {
                botao._tlEntrada?.pause();
                botao._tlSaida?.restart();
                botao._aberto = false;
                
                setTimeout(() => {
                    botao.classList.remove('aberto');
                }, botao._config?.tempoAnimacao * 1000 || 350);
            }
        });
        this.botaoAbertoAtual = null;
    },
    
    // Abre um botão específico
    abrirBotao(botao) {
        // Fecha o atual primeiro
        if (this.botaoAbertoAtual && this.botaoAbertoAtual !== botao) {
            this.fecharBotaoAtual();
        }
        
        // Abre o novo
        if (botao._tlEntrada && !botao._aberto) {
            botao._tlSaida?.pause();
            botao._tlEntrada.restart();
            botao.classList.add('aberto');
            botao._aberto = true;
            this.botaoAbertoAtual = botao;
        }
    },
    
    // Registra um botão no sistema
    registrarBotao(botao) {
        if (!this.todosBotoes.includes(botao)) {
            this.todosBotoes.push(botao);
        }
    }
};

// Detecta scroll brusco e fecha botão
let ultimaPosicaoScroll = window.pageYOffset;
let timeoutScroll;

function detectarScrollFecharBotao() {
    if (!isMobile() || !BotaoManager.botaoAbertoAtual) return;
    
    const posicaoAtual = window.pageYOffset;
    const diferenca = Math.abs(posicaoAtual - ultimaPosicaoScroll);
    
    // Se scrollou mais de 50px rapidamente, fecha o botão
    if (diferenca > 50) {
        BotaoManager.fecharBotaoAtual();
    }
    
    ultimaPosicaoScroll = posicaoAtual;
}

// Função para inicializar botões
function inicializarBotao(botao) {
    const extra = botao.querySelector(".botton-extra");
    
    // Verifica se é mobile
    const mobile = isMobile();
    
    // Configurações
    const config = {
        alturaOriginal: mobile ? 490 : 390,
        alturaHover: mobile ? 600 : (extra ? 570 : 485),
        tempoAnimacao: mobile ? 0.35 : 0.4
    };
    
    // Salva config no botão para acesso global
    botao._config = config;
    
    // Cria a película sólida (apenas para mobile)
    let pelicula;
    
    if (mobile) {
        pelicula = document.createElement('div');
        pelicula.className = 'pelicula-overlay';
        botao.appendChild(pelicula);
        botao.style.position = 'relative';
    }
    
    // Timeline de entrada (ABRIR)
    const tlEntrada = gsap.timeline({ paused: true });
    
    // 1. Expande altura
    tlEntrada.to(botao, {
        height: config.alturaHover,
        duration: config.tempoAnimacao,
        ease: "power2.out"
    }, 0);
    
    // 2. Fade in da película
    if (mobile && pelicula) {
        tlEntrada.to(pelicula, {
            opacity: 0.9,
            duration: config.tempoAnimacao * 0.6,
            ease: "power2.out"
        }, 0.1);
    }
    
    // 3. Conteúdo extra
    if (extra) {
        const itens = extra.querySelectorAll(".lista li, .saiba-mais");
        
        tlEntrada.to(extra, {
            height: "auto",
            opacity: 1,
            y: 0,
            duration: config.tempoAnimacao,
            ease: "power2.out"
        }, mobile ? 0.05 : 0.1);
        
        tlEntrada.to(itens, {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            stagger: 0.08,
            duration: config.tempoAnimacao,
            ease: "power2.out"
        }, mobile ? 0.1 : 0.2);
    }
    
    // Timeline de saída (FECHAR)
    const tlSaida = gsap.timeline({ paused: true });
    
    // 1. Fade out da película
    if (mobile && pelicula) {
        tlSaida.to(pelicula, {
            opacity: 0,
            duration: config.tempoAnimacao * 0.5,
            ease: "power2.in"
        }, 0);
    }
    
    // 2. Conteúdo extra (se houver)
    if (extra) {
        const itens = extra.querySelectorAll(".lista li, .saiba-mais");
        
        tlSaida.to(itens, {
            opacity: 0,
            filter: "blur(12px)",
            y: 20,
            stagger: 0.05,
            duration: config.tempoAnimacao * 0.8,
            ease: "power2.in"
        }, 0);
        
        tlSaida.to(extra, {
            height: 0,
            opacity: 0,
            y: 10,
            duration: config.tempoAnimacao * 0.9,
            ease: "power2.in"
        }, 0.1);
    }
    
    // 3. Reduz altura
    tlSaida.to(botao, {
        height: config.alturaOriginal,
        duration: config.tempoAnimacao,
        ease: "power2.in"
    }, extra ? (mobile ? 0.15 : 0.2) : 0);
    
    // Remove listeners antigos
    botao._mobileListener?.remove();
    botao._desktopEnterListener?.remove();
    botao._desktopLeaveListener?.remove();
    botao._outsideClickListener?.remove();
    
    // Salva timelines no botão
    botao._tlEntrada = tlEntrada;
    botao._tlSaida = tlSaida;
    botao._aberto = false;
    
    // Registra no sistema global
    BotaoManager.registrarBotao(botao);
    
    if (mobile) {
        const clickHandler = (e) => {
            // Evita clique em links
            if (e.target.tagName === 'A' || e.target.closest('a')) return;
            e.stopPropagation();
            
            if (botao._aberto) {
                // Se já está aberto, fecha
                BotaoManager.fecharBotaoAtual();
            } else {
                // Se não está aberto, abre (fechando qualquer outro)
                BotaoManager.abrirBotao(botao);
            }
        };
        
        botao.addEventListener("click", clickHandler);
        botao._mobileListener = { remove: () => botao.removeEventListener("click", clickHandler) };
        
    } else {
        // DESKTOP: Mantém hover
        let animacaoAtiva = false;
        
        const enterHandler = () => {
            if (animacaoAtiva) return;
            animacaoAtiva = true;
            tlSaida.pause();
            tlEntrada.restart();
        };
        
        const leaveHandler = () => {
            if (!animacaoAtiva) return;
            tlEntrada.pause();
            tlSaida.restart().then(() => {
                animacaoAtiva = false;
            });
        };
        
        botao.addEventListener("mouseenter", enterHandler);
        botao.addEventListener("mouseleave", leaveHandler);
        
        botao._desktopEnterListener = { remove: () => botao.removeEventListener("mouseenter", enterHandler) };
        botao._desktopLeaveListener = { remove: () => botao.removeEventListener("mouseleave", leaveHandler) };
    }
}

// Fecha ao clicar fora (para mobile)
function setupClicarFora() {
    if (!isMobile()) return;
    
    const clickForaHandler = (e) => {
        const clicouEmBotao = e.target.closest('.botton');
        if (!clicouEmBotao && BotaoManager.botaoAbertoAtual) {
            BotaoManager.fecharBotaoAtual();
        }
    };
    
    document.addEventListener('click', clickForaHandler);
    return () => document.removeEventListener('click', clickForaHandler);
}

// Fecha no scroll (para mobile)
function setupScrollFechar() {
    if (!isMobile()) return;
    
    const scrollHandler = () => {
        clearTimeout(timeoutScroll);
        timeoutScroll = setTimeout(detectarScrollFecharBotao, 100);
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', scrollHandler);
}

// Inicializa todos os botões
function inicializarTodosBotoes() {
    // Limpa películas antigas
    document.querySelectorAll('.pelicula-overlay').forEach(el => el.remove());
    
    // Reseta sistema global
    BotaoManager.botaoAbertoAtual = null;
    BotaoManager.todosBotoes = [];
    
    // Remove listeners globais antigos
    if (window._removeClickFora) window._removeClickFora();
    if (window._removeScroll) window._removeScroll();
    
    // Configura listeners globais
    window._removeClickFora = setupClicarFora();
    window._removeScroll = setupScrollFechar();
    
    const botoes = gsap.utils.toArray(".botton");
    botoes.forEach(inicializarBotao);
}

// Inicialização
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarTodosBotoes);
} else {
    inicializarTodosBotoes();
}

// Redimensionamento
let timeoutResize;
window.addEventListener("resize", () => {
    clearTimeout(timeoutResize);
    timeoutResize = setTimeout(() => {
        // Limpa tudo
        document.querySelectorAll('.pelicula-overlay').forEach(el => el.remove());
        
        // Fecha todos os botões
        BotaoManager.fecharTodos();
        
        // Limpa listeners individuais
        const botoes = document.querySelectorAll(".botton");
        botoes.forEach(botao => {
            botao._mobileListener?.remove();
            botao._desktopEnterListener?.remove();
            botao._desktopLeaveListener?.remove();
            gsap.set(botao, { clearProps: "height" });
        });
        
        // Re-inicializa
        inicializarTodosBotoes();
    }, 250);
});


// JavaScript
document.querySelector('.clicavel').addEventListener('click', function() {
  window.location.href = this.dataset.link;
});