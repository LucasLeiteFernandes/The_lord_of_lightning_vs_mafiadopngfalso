let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let canvas2 = document.getElementById('coluna');
let ctx2 = canvas2.getContext('2d');

const canvas3 = document.getElementById("barra");
const ctxb = canvas3.getContext("2d");

const canva4 = document.getElementById('especial');
let ctxs = canva4.getContext("2d");

const trovao = new Audio('./jogoSons/trovao.mp3')
trovao.volume = 0.5
const choque = new Audio('./jogoSons/choque.mp3')
choque.volume = 0.5
const dialo = new Audio('./jogoSons/dialogo.wav')
dialo.volume = 0.2
const iten = new Audio('./jogoSons/item.wav')
iten.volume = 0.3
const compra = new Audio('./jogoSons/compra.wav')
compra.volume = 0.2

const musicaIntro = new Audio('./jogoSons/intro.mp3')
musicaIntro.loop = true;
musicaIntro.volume = 0.4;

const  bfg = new Audio('./jogoSons/bfg.mp3')
bfg.loop = true;
bfg.volume = 0.3; 

const rip = new Audio('./jogoSons/rip.mp3')
rip.loop = true
rip.volume = 0.3

const flesh = new Audio('./jogoSons/flesh.mp3')
flesh.loop = true;
flesh.volume = 0.6;
flesh.currentTime = 30

const har = new Audio('./jogoSons/har.mp3')
har.loop = true;
har.volume = 0.4;
har.currentTime = 60

const loja = new Audio('./jogoSons/loja.mp3')
loja.loop = true;
loja.volume = 0.2

let teclas = {};
let podeAtirar = true;
let tempoRecarga = 400;
let poder = [];
let tiros = [];
let enemigos = [];
let dropsVisiveis = [];
let inv = [];
let iVelocidade = 0;
let tmax = 1000;
let tmin = 400;
let chanceDrop = 0.10;
let fase = 0;
let texto = 0;
let particulas = []

let jogo = { //estados do jogo
    rodando: false,
    inicio: true,
    fim: false,
    passarFase: false,
    reiniciar: false,
    infinito: false,
}

let cqt = {
    tela: false,
    morra: false,
    wajaja: false,
    bolo: false,
    mate: 0,
    promo: false,
    podendo: false,
    platina: false,
    dez: false,
    muquirana: false,
    desvio: false
}

let muquirana = true
let tomi = true

function platina() {
    if (cqt.morra === true &&
        cqt.wajaja === true &&
        cqt.bolo === true &&
        cqt.mate >= 500 &&
        cqt.promo === true &&
        cqt.podendo === true &&
        cqt.dez === true &&
        cqt.muquirana === true &&
        cqt.desvio === true) {
        cqt.platina = true
    }
}

let caj = new Image()
caj.src = "./jogoImages/Cajado.png"

let cajado = { // item comprado na loja que diminui o tempoRecarga(atira mais rapido)  
    x: 350,
    y: 400,
    raio: 50,
    preco: 6,
    ativo: true,
    img: new Image(),
    desenha: function () {
        if (!this.ativo) return;
        this.img = caj
        ctx.beginPath();
        ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '50px Comic Sans MS'
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'left'
        ctx.fillText(this.preco, 360, 500)
        ctx.closePath()

        ctx.beginPath();
        ctx.drawImage(dindin, 300, 455, 50, 50);
        ctx.closePath();
        if (pers.dinheiro >= this.preco) {
            if (colideComPers(this)) {
                tempoRecarga -= 25;
                pers.dinheiro = pers.dinheiro - this.preco
                this.ativo = false;
                this.preco += 1
                muquirana = false;
                compra.play()
                if (cajado.ativo === false && bota.ativo === false && promocao.ativo === false) { cqt.podendo = true }
            }
        }
    }
}

let bot = new Image()
bot.src = './jogoImages/tenis.png'
let bota = { // item comprado na loja que aumenta a pers.velocidade
    x: 500,
    y: 400,
    raio: 50,
    preco: 4,
    ativo: true,
    img: new Image(),
    desenha: function () {
        if (!this.ativo) return;
        this.img = bot;
        ctx.beginPath();
        ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '50px Comic Sans MS'
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'left'
        ctx.fillText(this.preco, 510, 500)
        ctx.closePath()

        ctx.beginPath();
        ctx.drawImage(dindin, 450, 455, 50, 50);
        ctx.closePath();
        if (pers.dinheiro >= this.preco) {
            if (colideComPers(this)) {
                pers.velocidade += 0.5;
                pers.dinheiro = pers.dinheiro - this.preco
                this.ativo = false;
                this.preco += 1
                muquirana = false
                compra.play()
                if (cajado.ativo === false && bota.ativo === false && promocao.ativo === false) { cqt.podendo = true }
            }
        }
    }
}

let promocao = { // faz a mesma coisa dos dois outros itens só que com um desconto
    x: 650,
    y: 400,
    raio: 50,
    preco: 8,
    ativo: true,
    img: new Image(),
    desenha: function () {
        if (!this.ativo) return;
        this.img.src = './jogoImages/podendo.webp';
        ctx.beginPath();
        ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '50px Comic Sans MS'
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'left'
        ctx.fillText(this.preco, 660, 500)
        ctx.closePath()

        ctx.beginPath();
        ctx.drawImage(dindin, 600, 455, 50, 50);
        ctx.closePath();

        if (pers.dinheiro >= this.preco) {
            if (colideComPers(this)) {
                tempoRecarga -= 25;
                pers.velocidade += 0.5;
                chanceDrop += 0.02
                pers.dinheiro = pers.dinheiro - this.preco
                this.preco += 1
                this.ativo = false;
                cqt.promo = true
                muquirana = false
                compra.play()
                if (cajado.ativo === false && bota.ativo === false && promocao.ativo === false) { cqt.podendo = true }
            }
        }
    }
}

let saida = { // função para começar a proxima fase
    x: 500,
    y: 950,
    raio: 50,
    ativo: true,
    desenha: function () {
        if (!this.ativo) return;
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.fillRect(400, 950, 200, 50)
        ctx.closePath();
        ctx.beginPath();
        ctx.font = '30px Comic Sans MS'
        ctx.fillStyle = 'white'
        ctx.textAlign = "left"
        ctx.fillText("SAIDA", 450, 985)
        ctx.closePath();
        if (colideComPers(this)) {
            this.ativo = false
            pers.x = 500
            pers.y = 500
            loja.pause()
            passarFase();
            musicaIntro.pause()
            if (fase <= 6) { iVelocidade += 0.33}
            if (fase == 1) { fase1() }
            if (fase == 2) { fase2() }
            if (fase == 3) { fase3() }
            if (fase == 4) { fase4() }
            if (fase == 5) { fase5() }
            if (fase >= 6) {
                const fasesAleatorias = [fase2, fase3, fase4];
                const comecarFaseAleatoria = fasesAleatorias[Math.floor(Math.random() * fasesAleatorias.length)];
                comecarFaseAleatoria();
                a = Math.floor(Math.random() * 2);
                console.log(a)
                if (fase >= 10) { cqt.dez = true }
            }
        }
    }
}

// definem o que vai acontecer em cada fase
function fase1() {
    spawnarInimigo();
    jogo.rodando = true
    tempoTotal = 90000
    tempoRestante = tempoTotal
    flesh.play()
}

function fase2() {
    spawnarInimigo();
    spawnarInimigo();
    rip.play()

    tmax = 1300;
    tmin = 650;
    tempoTotal += 15000;
    tempoRestante = tempoTotal;

    paredes.push({ x: 200, y: 200, w: 150, h: 50 });
    paredes.push({ x: 200, y: 200, w: 50, h: 150 });

    paredes.push({ x: 650, y: 200, w: 150, h: 50 });
    paredes.push({ x: 750, y: 200, w: 50, h: 150 });

    paredes.push({ x: 200, y: 650, h: 150, w: 50 });
    paredes.push({ x: 200, y: 750, h: 50, w: 150 });

    paredes.push({ x: 650, y: 750, w: 150, h: 50 });
    paredes.push({ x: 750, y: 650, w: 50, h: 150 });
    desenharParedes();
}

function fase3() {
    spawnarInimigo();
    spawnarInimigoB();
    har.play()
    tmax = 1000;
    tmin = 400;
    tempoTotal += 15000;
    tempoRestante = tempoTotal;

    trocarParede()
    gerarParedes(fase)
}

function fase4() {
    spawnarInimigo();
    spawnarInimigo();
    spawnInimigoB();

    bfg.play()
    tmax = 1200;
    tmin = 300;
    tempoTotal += 15000;
    tempoRestante = tempoTotal;

    gerarParedes(fase)
    trocarParede()
}

let paredesAleatorias = []
let a = Math.floor(Math.random() * 2);
function gerarParedes(fase) {
    paredesAleatorias = []

    if (fase === 3 || fase >= 6 && a === 1) {
        paredesAleatorias.push(
            { x: 400, y: 200, w: 200, h: 50, ativa: true },
            { x: 200, y: 400, w: 50, h: 200, ativa: true },
            { x: 400, y: 750, w: 200, h: 50, ativa: true },
            { x: 750, y: 400, w: 50, h: 200, ativa: true }
        );
    } if (fase === 4 || fase >= 6 && a === 0) {
        paredesAleatorias.push(
            { x: 200, y: 200, w: 400, h: 50, ativa: true },
            { x: 600, y: 200, w: 200, h: 50, ativa: true },
            { x: 200, y: 750, w: 200, h: 50, ativa: true },
            { x: 400, y: 750, w: 400, h: 50, ativa: true },
            { x: 200, y: 200, w: 50, h: 400, ativa: true },
            { x: 200, y: 600, w: 50, h: 200, ativa: true },
            { x: 750, y: 200, w: 50, h: 200, ativa: true },
            { x: 750, y: 400, w: 50, h: 400, ativa: true }
        );
    }
}

let intervaloParedes;
function trocarParede() {
    clearInterval(intervaloParedes);

    intervaloParedes = setInterval(() => {
        for (let pa of paredesAleatorias) {
            pa.ativa = Math.random() < 0.5;
        }
    }, 3000);
}
function pararParedes() {
    clearInterval(intervaloParedes);
    for (let p of paredesAleatorias) {
        p.ativa = false;
    }
}

function fase5() {''
    texto = 12
    musicaIntro.currentTime = 0
    musicaIntro.play()
    pers.x = 500;
    pers.y = 75;
}

const fasesAleatorias = [fase2, fase3, fase4]
const comecarFaseAleatoria = fasesAleatorias[Math.floor(Math.random() * fasesAleatorias.length)]

let pers = {
    x: 500,
    y: 500,
    raio: 60,
    velocidade:2.5,
    vida: 3,
    dinheiro: 0,
    vivo: true,
    img: (() => {
        const i = new Image();
        i.src = './jogoImages/lwS.png';
        return i;
    })(),
    desenha() {
        if (!this.vivo) return;
        ctx.beginPath();
        ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
        ctx.closePath();
    }
};

function criarItem(nome, x, y) { // cria os drops dos inimigos
    let base = {
        x, y,
        raio: 40,
        visivel: true,
        img: new Image()
    };

    switch (nome) {
        case 'cura':// aumenta um de vida com o maximo de 8
            base.img.src = './jogoImages/chapeu.png';
            base.desenha = function () {
                if (!this.visivel) return;
                ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
                if (colideComPers(this)) {
                    if (pers.vida < 8) {
                        pers.vida++;
                        this.visivel = false;
                        iten.play()
                    }
                    else {
                        this.visivel = false;
                    }
                }
            };
            break;
        case 'raio_bola':// um tiro especial grande e que atravessas os inimigos
            base.img.src = './jogoImages/pilha2.png'
            base.desenha = function () {
                if (!this.visivel) return;
                ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
                if (colideComPers(this)) {
                    this.visivel = false;
                    iten.play()
                    inv.push({ nome: 'raio_bola' });
                }
            };
            break;
        case 'dinheiro':// dinheiro para comprar itens na loja
            base.img.src = './jogoImages/moeda.png'
            base.desenha = function () {
                if (!this.visivel) return;
                ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
                if (colideComPers(this)) {
                    this.visivel = false;
                    pers.dinheiro++;
                    iten.play()
                };
            };
            break;
        case 'arco_raio'://uma circunferencia em volta do personagem que mata os inimigos e dura 8 seg
            base.img.src = './jogoImages/bateria2.png'
            base.desenha = function () {
                if (!this.visivel) return;
                ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
                if (colideComPers(this)) {
                    this.visivel = false;
                    iten.play()
                    inv.push({ nome: 'arco_raio' });
                }
            }
    }
    base.nome = nome;
    return base;
}
//cria os drops
let bola = criarItem('raio_bola');
let cura = criarItem('cura');
let tenis = criarItem('tenis');
let dinheiro = criarItem('dinheiro')
let arco = criarItem('arco_raio')

let drops = [cura, tenis, bola, dinheiro];

function colideComPers(obj) { // função para a colisão com o personagem
    return obj.x > pers.x - pers.raio && obj.x < pers.x + pers.raio &&
        obj.y > pers.y - pers.raio && obj.y < pers.y + pers.raio;
}

function temRaioBola() { // verifica se o item raio bola esta no inv
    return inv.some(item => item.nome === 'raio_bola');
}

document.addEventListener('keydown', e => { //ativa um dos poderes
    teclas[e.key] = true;
    if (e.key === ' ') {
        if (temRaioBola() && inv[0].nome === 'raio_bola') {
            atirarRB();
            inv.splice(0, 1);
            trovao.play()
        }
        else if (temArcoRaio() && inv[0].nome === 'arco_raio') {
            arcoRaio();
            inv.splice(0, 1);
            trovao.play()
        }
    }
});

function temArcoRaio() {
    return inv.some(item => item.nome === 'arco_raio');
}

let arcoImg = new Image();
arcoImg.src = './jogoImages/ArcoRaio.png';

let ArcoRaio = {
    x: 500,
    y: 500,
    raio: 125,
    dano: 500,
    ativo: false,
    img: new Image(),
    desenha: function () {
        if (!this.ativo) return;
        this.img = arcoImg
        ctx.beginPath();
        ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
        ctx.closePath();
        for (let i = 0; i < enemigos.length; i++) {
            let inimigo = enemigos[i];
            if (!inimigo.ativo) continue;

            let distancia = Math.sqrt(
                Math.pow(this.x - inimigo.x, 2) + Math.pow(this.y - inimigo.y, 2)
            );

            if (distancia < this.raio + inimigo.raio) {
                inimigo.ativo = false;
                criarParticulas(inimigo.x, inimigo.y)
                enemigos = enemigos.filter(inimigo => inimigo.ativo == true);
                if (Math.random() < chanceDrop) {
                    dropar(inimigo.x, inimigo.y);
                }
            }
        }
    }
}

function arcoRaio() { //função do arco raio
    ArcoRaio.x = pers.x
    ArcoRaio.y = pers.y;
    ArcoRaio.ativo = true
    pers.velocidade *= 0.5
    const intervalo = setInterval(() => {
        if (ArcoRaio.ativo) {
            ArcoRaio.x = pers.x;
            ArcoRaio.y = pers.y;
        } else {
            clearInterval(intervalo);
        }
    }, 16);
    setTimeout(() => {
        ArcoRaio.ativo = false
        pers.velocidade /= 0.5
    }, 8000);
}

let mira = { // o objeto mira
    x: 250,
    y: 250,
    raio: 20,
    img: (() => {
        const i = new Image();
        i.src = './jogoImages/mira.png';
        return i;
    })(),
    desenha() {
        ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
    }
};

document.addEventListener('mousedown', () => { // atira
    if (!podeAtirar) return;
    podeAtirar = false;
    setTimeout(() => podeAtirar = true, tempoRecarga);

    atirarNormal();
});

function atirarNormal() { // atira os tiros normais com o mouse
    criarTiro(15, 6, './jogoImages/raioBola.png', tiros);
}

function atirarRB() { //atira o especial com o espaço
    criarTiro(120, 4, './jogoImages/raioBola.png', poder, true);
}

function criarTiro(raio, velocidade, imgSrc, lista, especial = false) {
    let dx = mira.x - pers.x;
    let dy = mira.y - pers.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    dx /= dist;
    dy /= dist;

    let img = new Image();
    img.src = imgSrc;

    lista.push({
        x: pers.x,
        y: pers.y,
        raio,
        velocidade,
        dx,
        dy,
        ativo: true,
        img,
        dano: 1,
        especial,
        dano_especial: 5,
        normal: true,
        desenha() {
            ctx.beginPath();
            ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
            ctx.closePath();
        },
        mover() {
            this.x += this.dx * this.velocidade;
            this.y += this.dy * this.velocidade;

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                criarParticulas(this.x, this.y)
                this.ativo = false;
                choque.play()
            }

            if (colideComParedes(this) && this.especial == false) {
                criarParticulas(this.x, this.y)
                this.ativo = false;
                choque.play()
            }

            for (let i = 0; i < enemigos.length; i++) {
                let inimigo = enemigos[i];
                if (!inimigo.ativo) continue;

                if (this.x > inimigo.x - inimigo.raio && this.x < inimigo.x + inimigo.raio &&
                    this.y > inimigo.y - inimigo.raio && this.y < inimigo.y + inimigo.raio) {
                    inimigo.vida -= this.dano
                    criarParticulas(inimigo.x, inimigo.y)
                    if (inimigo.vida === 0) {
                        inimigo.ativo = false;
                        cqt.mate += 1
                        criarParticulas(inimigo.x, inimigo.y)
                        enemigos = enemigos.filter(inimigo => inimigo.ativo == true)
                        choque.play()
                    }

                    if (Math.random() < chanceDrop) {
                        dropar(inimigo.x, inimigo.y);
                    }

                    if (!this.especial) {
                        this.ativo = false;
                        break;
                    }
                }
            }
        }
    });
}

function dropar(x, y) {
    let itens = ['cura', 'raio_bola', 'arco_raio', 'dinheiro', 'dinheiro', 'dinheiro'];
    let nome = itens[Math.floor(Math.random() * itens.length)];
    let novoItem = criarItem(nome, x, y);
    dropsVisiveis.push(novoItem);
}

function spawnInimigo() {
    const posicoes = [
        { x: 500, y: 50 }, { x: 950, y: 500 },
        { x: 500, y: 950 }, { x: 50, y: 500 }
    ];
    let { x, y } = posicoes[Math.floor(Math.random() * posicoes.length)];

    let img = new Image();
    img.src = './jogoImages/rato.png';

    enemigos.push({
        x, y,
        raio: 40,
        ativo: true,
        img,
        velocidade: 2,
        vida: 1,
        tipo: 'n',
        desenha() {
            if (!this.ativo) return;
            ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);

            if (colideComPers(this)) {
                pers.x = 500;
                pers.y = 500;
                pers.vida--;
                enemigos.forEach(inimigo => inimigo.ativo = false);
                enemigos.splice(0, 100)
                dropsVisiveis = [];
                tomi = false
                if (pers.vida <= 0) {
                    pers.vivo = false;
                    jogo.reiniciar = true;
                    jogo.rodando = false;
                    pararParedes();
                    tempoRestante = 0
                    enemigos.forEach(inimigo => inimigo.ativo = false);
                    pararSpawn();
                    cqt.morra = true;
                    muquirana = true;
                    tomi = true;
                    if (fase === 4) { cqt.wajaja = true }
                };
            }
        }
    });
}

function spawnInimigoB() {
    const posicoes = [
        { x: 500, y: 50 }, { x: 950, y: 500 },
        { x: 500, y: 950 }, { x: 50, y: 500 }
    ];
    let { x, y } = posicoes[Math.floor(Math.random() * posicoes.length)];

    let img = new Image();
    img.src = './jogoImages/ratoBomabado.jpg';

    enemigos.push({
        x, y,
        raio: 40,
        ativo: true,
        img,
        velocidade: 1,
        vida: 3,
        bombado: true,
        tipo: 'b',
        desenha() {
            if (!this.ativo) return;
            ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);

            if (colideComPers(this)) {
                pers.x = 500;
                pers.y = 500;
                pers.vida--;
                enemigos.forEach(inimigo => inimigo.ativo = false);
                enemigos.splice(0, 100)
                dropsVisiveis = []
                tomi = false
                if (pers.vida <= 0) {
                    pers.vivo = false
                    jogo.reiniciar = true
                    jogo.rodando = false
                    muquirana = true
                    tomi = true
                    pararParedes();
                    tempoRestante = 0   
                    enemigos.forEach(inimigo => inimigo.ativo = false);
                    pararSpawn();
                    cqt.morra = true;
                    if (fase === 4) { cqt.wajaja = true }
                };
            }
        }
    });
}

function spawnarInimigo() {
    function loop() {
        if (!jogo.rodando == true || pers.vida < 0) return;
        spawnInimigo();
        setTimeout(loop, Math.random() * tmax + tmin)
    }
    loop();
}

function spawnarInimigoB() {
    function loop() {
        if (!jogo.rodando == true || pers.vida < 0 && fase >= 3) return;
        spawnInimigoB();
        for (let i = 0; i < enemigos.length; i++) {
            let inimigo = enemigos[i];
            if (!inimigo.ativo) {
                inimigo.bombado = true;
            }
        };
        setTimeout(loop, Math.random() * (tmax + 1000) + (tmin + 1000))
    }
    loop();
}

function pararSpawn() {
    jogo.rodando = false;
}

function criarParticulas(x, y, quantidade = 15) {
    for (let i = 0; i < quantidade; i++) {
        const angulo = Math.random() * 2 * Math.PI;
        const velocidade = Math.random() * 3 + 1;
        particulas.push({
            x: x,
            y: y,
            vx: Math.cos(angulo) * velocidade,
            vy: Math.sin(angulo) * velocidade,
            raio: Math.random() * 8 + 2,
            cor: '#13B3BE',
            vida: 60
        });
    }
}

function atualizarParticulas() {
    for (let i = particulas.length - 1; i >= 0; i--) {
        const p = particulas[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vida--;
        p.raio *= 0.96; 
        if (p.vida <= 0 || p.raio < 0.5) {
            particulas.splice(i, 1);
        }
    }
}

function desenharParticulas(ctx) {
    for (const p of particulas) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.raio, 0, 2 * Math.PI);
        ctx.fillStyle = p.cor;
        ctx.fill();
    }
}

// define as imagensas
let Curas = new Image();
Curas.src = './jogoImages/chapeu.png';

let dindin = new Image();
dindin.src = './jogoImages/moeda.png';

let rb = new Image();
rb.src = './jogoImages/pilha2.png'
let ar = new Image();
ar.src = './jogoImages/bateria2.png'

let bolof = new Image();
bolof.src = './jogoImages/bolof.jpg';

let bolov = new Image();
bolov.src = './jogoImages/bolov.png'

function Vidas(vida) {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    for (let i = 0; i < vida; i++) {
        ctx2.drawImage(Curas, 0, i * 55, 50, 50);
        ctx2.drawImage(dindin, 0, 460, 50, 50)

        ctx2.beginPath();
        ctx2.fillStyle = '#FBF700'
        ctx2.fillRect(0, 445, 70, 5)
        ctx2.closePath();

        ctx2.beginPath();
        ctx2.font = '30px Comic Sans MS'
        ctx2.fillStyle = 'yellow'
        ctx2.textAlign = 'center'
        ctx2.fillText('X', 25, 545)
        ctx2.closePath()

        ctx2.beginPath();
        ctx2.font = '40px Comic Sans MS'
        ctx2.fillStyle = '#FBF700'
        ctx2.textAlign = 'center'
        ctx2.fillText(pers.dinheiro, 25, 590)
        ctx2.closePath()

        ctx2.beginPath();
        ctx2.fillStyle = '#FBF700'
        ctx2.fillRect(0, 600, 70, 5)
        ctx2.closePath();

        if (fase >= 1) {
            ctx.beginPath()
            ctx2.fillStyle = '#FBF700'
            ctx2.fillRect(0, 610, 50, 50)
            ctx2.closePath()
            ctx2.beginPath();
            ctx2.font = '40px Comic Sans MS'
            ctx2.fillStyle = '#10616B'
            ctx2.textAlign = 'center'
            ctx2.fillText('1', 25, 650)
            ctx2.closePath()
        }
        if (fase >= 2) {
            ctx.beginPath()
            ctx2.fillStyle = '#FBF700'
            ctx2.fillRect(0, 665, 50, 50)
            ctx2.closePath()
            ctx2.beginPath();
            ctx2.font = '40px Comic Sans MS'
            ctx2.fillStyle = '#10616B'
            ctx2.textAlign = 'center'
            ctx2.fillText('2', 25, 705)
            ctx2.closePath()

        }
        if (fase >= 3) {
            ctx.beginPath()
            ctx2.fillStyle = '#FBF700'
            ctx2.fillRect(0, 720, 50, 50)
            ctx2.closePath()
            ctx2.beginPath();
            ctx2.font = '40px Comic Sans MS'
            ctx2.fillStyle = '#10616B'
            ctx2.textAlign = 'center'
            ctx2.fillText('3', 25, 760)
            ctx2.closePath()
        }
        if (fase >= 4) {
            ctx.beginPath()
            ctx2.fillStyle = '#FBF700'
            ctx2.fillRect(0, 775, 50, 50)
            ctx2.closePath()
            ctx2.beginPath();
            ctx2.font = '40px Comic Sans MS'
            ctx2.fillStyle = '#10616B'
            ctx2.textAlign = 'center'
            ctx2.fillText('4', 25, 815)
            ctx2.closePath()
        }
        if (fase >= 5) {
            ctx2.drawImage(bolov, 0, 830, 50, 50)
        }
        if (fase > 5) {
            ctx2.drawImage(bolov, 0, 830, 50, 50)
            ctx2.beginPath();
            ctx2.font = '50px Comic Sans MS'
            ctx2.fillStyle = '#FBF700'
            ctx2.textAlign = 'center'
            ctx2.fillText(fase, 25, 930)
            ctx2.closePath()
        }
    }
}

function special() {
    ctxs.clearRect(0, 0, canvas2.width, canvas2.height);
    if (temRaioBola() && inv[0].nome === 'raio_bola') {
        ctxs.drawImage(rb, 0, 0, 50, 50)
    }
    if (temArcoRaio() && inv[0].nome === 'arco_raio') {
        ctxs.drawImage(ar, 0, 0, 50, 50)
    }
}

document.addEventListener('keydown', e => {
    teclas[e.key] = true;
    if ((e.key.toLowerCase() === 'e' && pers.y >= 600)) {
        texto++
        dialo.play()
    }
})

// document.addEventListener('keydown', e => { // zera o tempo
//     teclas[e.key] = true;
//     if ((e.key.toLowerCase() === 'p')) {
//         tempoRestante = 0
//         // enemigos.forEach(inimigo => inimigo.ativo = false);
//     }
// })

function cutscene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (fase === 0 || fase === 5) {
        if (fase === 0){
            ctx.drawImage(bolof, 450, 660, 100, 100)
        }     
        if (fase ===5){
            ctx.drawImage(bolov, 450, 660, 100, 100)
        }  
        if (pers.y >= 600) {
            pers.velocidade = 0
            if (texto >= 0 && texto <= 17) {
                ctx.beginPath();
                ctx.lineWidth = 5
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'white'
                ctx.fillRect(300, 150, 400, 200)
                ctx.strokeRect(300, 150, 400, 200)
                ctx.closePath();
            }
            if (texto == 0 && cqt.morra === false) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "left"
                ctx.fillText(":o", 350, 200)
                ctx.closePath();
            }
            if (texto == 0 && cqt.morra === true) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "left"
                ctx.fillText("De novo isso?", 350, 200)
                ctx.closePath();
            }
            if (texto == 1) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "left"
                ctx.fillText("Um bolo :D", 350, 200)
                ctx.closePath();
            }
            if (texto == 2) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("...", 350, 200)
                ctx.closePath();
            }
            if (texto == 3) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("Espere um pouco -_-", 350, 200)
                ctx.closePath();
            }
            if (texto == 4) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("...", 350, 200)
                ctx.closePath();
            }
            if (texto == 5) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("É UM PNG FALSO!!! D:<", 350, 200)
                ctx.closePath();
            }
            if (texto == 6) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("Quem poderia ser tão malvado? -_-", 350, 200)
                ctx.closePath();
            }
            if (texto == 7) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText(":o", 350, 200)
                ctx.closePath();
            }
            if (texto == 8) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("Só podem ser eles... ", 350, 200)
                ctx.closePath();
            }
            if (texto == 9) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("Eles estão de volta...", 350, 200)
                ctx.closePath();
            }
            if (texto == 10) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("A mafiadopngfalso.png D:<", 350, 200)
                ctx.closePath();
            }
            if (texto == 11) {
                fase = 1
                pers.velocidade = 2.5
                fase1();
                ultimoTempo = performance.now()
                musicaIntro.pause()
                loop();
            }
            if (texto == 12) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "left"
                ctx.fillText("Outro bolo... -_-", 350, 200)
                ctx.closePath();
            }
            if (texto == 13) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText(":o", 350, 200)
                ctx.closePath();
            }
            if (texto == 14) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("Não é um png falso :D", 350, 200)
                ctx.closePath();
            }
            if (texto == 15) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("O bolo não é uma mentira :D", 350, 200)
                ctx.closePath();
            }
            if (texto == 16) {
                ctx.beginPath();
                ctx.font = '20px Comic Sans MS'
                ctx.fillStyle = 'white'
                ctx.textAlign = "Center"
                ctx.fillText("nhac nhac :3", 350, 200)
                ctx.closePath();
            }
            if (texto >= 17) {
                fase = 5;
                pers.velocidade = 4.5
                ultimoTempo = performance.now()
                tempoRestante = 0
                cqt.bolo = true;
                texto++;
                musicaIntro.pause();
                if (muquirana === true) { cqt.muquirana = true }
                if (tomi === true) { cqt.desvio = true }
            }
        }
    }
}

let vendedor = {
    x: 500,
    y: 25,
    raio: 70,
    ativo: true,
    img: new Image(),
    desenha: function () {
        if (!this.ativo) return;
        this.img.src = './jogoImages/forastero.png';
        ctx.beginPath();
        ctx.drawImage(this.img, this.x - this.raio, this.y - this.raio, 2 * this.raio, 2 * this.raio);
        ctx.closePath();
    }
}

function cutVendedor() {
    if (vendedor.y <= 250) {
        vendedor.y += 3
    }
}

const larguraMax = 1000;
const altura = 60;
const x = 0;
const y = 0;

let tempoTotal = 90000;
let tempoRestante = tempoTotal;

function desenharBarra(porcentagem) {
    ctxb.clearRect(0, 0, canvas.width, canvas.height);

    ctxb.fillStyle = "#404eab";
    ctxb.fillRect(x, y, larguraMax, altura);

    ctxb.fillStyle = "#1ED760";
    ctxb.fillRect(x, y, larguraMax * porcentagem, altura);
}

let ultimoTempo = performance.now();
function loop() {
    const agora = performance.now();
    const delta = agora - ultimoTempo;
    ultimoTempo = agora;

    tempoRestante -= delta;
    if (tempoRestante < 0) tempoRestante = 0;

    const porcentagem = tempoRestante / tempoTotal;
    desenharBarra(porcentagem);

    if (tempoRestante > 0) {
        requestAnimationFrame(loop);
        jogo.rodando = true
        jogo.inicio = false
    } else {
        pararSpawn();
        jogo.passarFase = true
        cajado.ativo = true;
        bota.ativo = true;
        promocao.ativo = true;
        saida.ativo = true
        vendedor.x = 500;
        vendedor.y = 25
        pararParedes()
        loja.currentTime = 0;
    }
}

function passarFase() {
    if (jogo.passarFase == true) {
        fase++
        jogo.passarFase = false
        jogo.rodando = true
        tempoRestante = tempoTotal
        ultimoTempo = performance.now()
        loop()
    }
}


let matoH = new Image()
matoH.src = './jogoImages/arbustoH.png'
let matoV = new Image()
matoV.src = './jogoImages/arbustoV.png'
function desenharParedes() {
    ctx.fillStyle = '#3fb8c8';
    for (let parede of paredes) {
        ctx.fillStyle = '#3fb8c8';
        ctx.fillRect(parede.x, parede.y, parede.w, parede.h);
        if(parede.w > parede.h){
            ctx.drawImage(matoH,parede.x, parede.y, parede.w, parede.h)
        }
        if(parede.h > parede.w){
            ctx.drawImage(matoV,parede.x, parede.y, parede.w, parede.h)
        }
    }
}

function desenharParedesAleatorias() {
    for (let p of paredesAleatorias) {
        if (!p.ativa) continue;
        ctx.fillStyle = "#3fb8c8";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        if(p.w > p.h){
            ctx.drawImage(matoH,p.x, p.y, p.w, p.h)
        }
        if(p.h > p.w){
            ctx.drawImage(matoV,p.x, p.y, p.w, p.h)
        }
    }
}

function reiniciar() {
    document.addEventListener('keydown', e => {
        teclas[e.key] = true;
        if ((e.key === 'r' || e.key === 'R') && jogo.reiniciar === true) {
            jogo.reiniciar = false
            jogo.passarFase = false
            jogo.rodando = true
            pers.vivo = true
            dropsVisiveis = []
            pers.x = 500
            pers.y = 500
            pers.dinheiro = 0
            pers.velocidade = 2.5
            enemigos.forEach(inimigo => inimigo.ativo = false);
            inv.length = 0
            pers.vida = 3
            loop()
            tempoRecarga = 400;
            iVelocidade = 0
            tmax = 1000;
            tmin = 600;
            fase = 0
            inv = []
            cutscene();
            paredes.splice(12, 50)
            tempoRestante = 90000
            jogo.inicio = true;
            ultimoTempo = performance.now()
            texto = 0
            loja.pause()
        }
    })
}

function iniciar() {
    document.addEventListener('keydown', e => {
        teclas[e.key] = true;
        if ((e.key === 'i' || 'I') && jogo.inicio == true) {
            loop();
            jogo.inicio = true
            tempoRestante = tempoTotal
            pers.x = 500;
            pers.y = 70;
            musicaIntro.play();
            console.log("Artes feitas por: Felipe de Aquino Domingo")
            console.log("Vagabundo profissional.")
            console.log("twitter dele: @felipea95255255")
            console.log("Nome do jogo e personagem inspirados pela musica 'The Lord of Lightning vs Balrog' da banda King Gizzard & The Lizard Wizar")
            console.log("link da musica: https://youtu.be/Rd3vwwXArMQ?si=C9EAJHCCJd4aY-NQ")
        }
    })
}

function moverPers() {
    let v = pers.velocidade;
    let nx = pers.x;
    let ny = pers.y;

    if (teclas['ArrowLeft'] || teclas['a'] || teclas['A']) { nx -= v; pers.img.src = './jogoImages/lwA.png'};
    if (teclas['ArrowRight'] || teclas['d'] || teclas['D']) { nx += v; pers.img.src = './jogoImages/lwD.png' };
    if (teclas['ArrowUp'] || teclas['w'] || teclas['W']) { ny -= v; pers.img.src = './jogoImages/lwW.png' };
    if (teclas['ArrowDown'] || teclas['s'] || teclas['S']) { ny += v; pers.img.src = './jogoImages/lwS.png' };

    if (!colisao(nx, pers.y, pers.raio) && !colideComParedesAleatorias({ x: nx, y: pers.y, raio: pers.raio })) {
        pers.x = nx;
    }

    if (!colisao(pers.x, ny, pers.raio) && !colideComParedesAleatorias({ x: pers.x, y: ny, raio: pers.raio })) {
        pers.y = ny;
    }
}

function colideComParedesAleatorias(p) {
    for (let parede of paredesAleatorias) {
        if (!parede.ativa) continue;

        if (
            p.x + p.raio > parede.x &&
            p.x - p.raio < parede.x + parede.w &&
            p.y + p.raio > parede.y &&
            p.y - p.raio < parede.y + parede.h
        ) {
            return true;
        }
    }
    return false;
}

let paredes = [
    { x: 0, y: 0, w: 1000, h: 1 }, { x: 0, y: 1000, w: 1000, h: 1 },
    { x: 0, y: 0, w: 400, h: 50 }, { x: 600, y: 0, w: 400, h: 50 },
    { x: 0, y: 950, w: 400, h: 50 }, { x: 600, y: 950, w: 400, h: 50 },
    { x: 0, y: 0, w: 1, h: 1000 }, { x: 1000, y: 0, w: 1, h: 1000 },
    { x: 0, y: 0, w: 50, h: 400 }, { x: 0, y: 600, w: 50, h: 400 },
    { x: 950, y: 0, w: 50, h: 400 }, { x: 950, y: 600, w: 50, h: 400 }
];

function colisao(x, y, r) {
    return paredes.some(p =>
        x + r > p.x && x - r < p.x + p.w && y + r > p.y && y - r < p.y + p.h
    );
}


function colideComParedes(obj) {
    for (let parede of paredes) {
        if (obj.x + obj.raio > parede.x && obj.x - obj.raio < parede.x + parede.w &&
            obj.y + obj.raio > parede.y && obj.y - obj.raio < parede.y + parede.h) {
            return true;
        }
    }
    for (let p of paredesAleatorias) {
        if (!p.ativa) continue;

        if (
            obj.x + obj.raio > p.x &&
            obj.x - obj.raio < p.x + p.w &&
            obj.y + obj.raio > p.y &&
            obj.y - obj.raio < p.y + p.h
        ) {
            return true;
        }
    }
    return false;
}

function colideInimigos(obj) {
    for (let inimigo of enemigos) {
        if (obj === inimigo) continue;

        const dx = obj.x - inimigo.x;
        const dy = obj.y - inimigo.y;
        const distancia = Math.hypot(dx, dy);

        if (distancia < obj.raio + inimigo.raio && inimigo.x < 900 && inimigo.y < 900 && inimigo.x > 100 && inimigo.y > 100) {
            return true;
        }
    }
    return false;
}

document.addEventListener('keyup', e => teclas[e.key] = false);
document.addEventListener('mousemove', e => {
    let rect = canvas.getBoundingClientRect();
    mira.x = Math.min(canvas.width - mira.raio, Math.max(mira.raio, e.clientX - rect.left));
    mira.y = Math.min(canvas.height - mira.raio, Math.max(mira.raio, e.clientY - rect.top));
});

function animacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharParticulas(ctx)
    atualizarParticulas()
        if (fase >= 6){
            ctx.drawImage(espaco,0,0,1000,1000)
        }

    if (fase === 0 || fase === 5) {
        cutscene()
    }

    if (jogo.passarFase == true && enemigos.length === 0 && fase >= 1 && tempoRestante === 0) {
        flesh.pause();
        flesh.currentTime = 30;
        bfg.pause();
        bfg.currentTime = 0;
        har.pause();
        har.currentTime = 60;
        rip.pause();
        rip.currentTime = 0;
        loja.play();
        paredes.splice(12, 50)
        dropsVisiveis = [];
        if (vendedor.y === 253) {
            ctx.beginPath();
            ctx.strokeStyle ='red'
            ctx.fillStyle = '#ffe4c4';
            ctx.fillRect(270, 330, 450, 200)
            ctx.strokeRect(270, 330, 450, 200)
            ctx.closePath();

            ctx.beginPath();
            ctx.lineWidth = 5
            ctx.fillStyle = 'black';
            ctx.strokeStyle = 'white'
            ctx.fillRect(600, 200, 230, 100)
            ctx.strokeRect(600, 200, 230, 100)
            ctx.closePath();

            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = 'white'
            ctx.textAlign = "Center"
            ctx.fillText("¿Que pasa forastero?", 610, 250)
            ctx.closePath();

            cajado.desenha();
            bota.desenha();
            promocao.desenha()
        }
        saida.desenha();
        vendedor.desenha();
        cutVendedor();
    }

    if (jogo.rodando == true || jogo.passarFase == true) {
        moverPers();
        desenharParedesAleatorias()

        ArcoRaio.desenha();
        pers.desenha();

        [bola, cura, ...dropsVisiveis].forEach(d => d.desenha());

        enemigos.forEach(inimigo => {
            if (!inimigo.ativo) return;

            const dx = pers.x - inimigo.x;
            const dy = pers.y - inimigo.y;
            const dist = Math.hypot(dx, dy);
            if (dist === 0) {
                inimigo.desenha();
                return;
            }

            const passoX = (dx / dist) * (inimigo.velocidade + iVelocidade);
            const oldX = inimigo.x;
            inimigo.x += passoX;
            if (colideComParedes(inimigo) || colideInimigos(inimigo)) {
                inimigo.x = oldX;
            }

            const passoY = (dy / dist) * (inimigo.velocidade + iVelocidade);
            const oldY = inimigo.y;
            inimigo.y += passoY;
            if (colideComParedes(inimigo) || colideInimigos(inimigo)) {
                inimigo.y = oldY;
            }
            inimigo.desenha();
        });

        [...tiros, ...poder].forEach(t => {
            if (t.ativo) {
                t.mover();
                t.desenha();
            }
        });

        tiros = tiros.filter(t => t.ativo);
        poder = poder.filter(p => p.ativo);
    }

    desenharParedes();

    if (jogo.inicio == true) {
        ctx.beginPath();
        ctx.fillStyle = '#0B0D0D';
        ctx.fillRect(0, 0, 1000, 1000)
        ctx.closePath();

        ctx.drawImage(logo, 0, 100, 1000, 298)

        ctx.beginPath();
        ctx.font = '40px Comic Sans MS'
        ctx.fillStyle = 'white'
        ctx.textAlign = "center"
        ctx.fillText("Precione qualquer tecla para iniciar", 500, 500)
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '30px Comic Sans MS'
        ctx.fillStyle = 'white'
        ctx.textAlign = "center"
        ctx.fillText("WASD: andar", 500, 550)
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '30px Comic Sans MS'
        ctx.fillStyle = 'white'
        ctx.textAlign = "center"
        ctx.fillText("Botão direito do mouse: atirar", 500, 600)
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '30px Comic Sans MS'
        ctx.fillStyle = 'white'
        ctx.textAlign = "center"
        ctx.fillText("Espaço: usar item", 500, 650)
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '30px Comic Sans MS'
        ctx.fillStyle = 'white'
        ctx.textAlign = "center"
        ctx.fillText("E: avançar dialogo", 500, 700)
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '30px Comic Sans MS'
        ctx.fillStyle = 'white'
        ctx.textAlign = "center"
        ctx.fillText("C: ver conquistas", 500, 750)
        ctx.closePath();
    }

    if (jogo.reiniciar == true) {
        reiniciar();
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 1000, 1000)
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '40px Comic Sans MS'
        ctx.fillStyle = 'white'
        ctx.textAlign = "center"
        ctx.fillText("Precione 'R' para reiniciar", 500, 500)
        ctx.closePath();
    }

    if (cqt.tela === true) {
        ctx.beginPath();
        ctx.fillStyle = '#10616B';
        ctx.fillRect(0, 0, 1000, 1000)
        ctx.closePath();

        // linha1
        ctx.beginPath();
        ctx.fillStyle = '#FBF700'
        ctx.fillRect(498, 0, 4, 1000)
        ctx.closePath();

        if (cqt.morra === false) {
            ctx.drawImage(sem, 25, 50, 100, 100)
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("???", 150, 75)
            ctx.closePath();
        }
        if (cqt.morra === true) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("Tá facil", 150, 75)
            ctx.closePath();
            ctx.drawImage(morra, 25, 50, 100, 100)

        }
        ctx.beginPath();
        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = '#FBF700'
        ctx.textAlign = "left"
        ctx.fillText("Morra pela primeira vez", 150, 100)
        ctx.closePath()

        ctx.drawImage(sem, 525, 50, 100, 100)
        if (cqt.promo === false) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("???", 650, 75)
            ctx.closePath();
        }
        if (cqt.promo === true) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("Gostaria fazer o cartão da loja?", 650, 75)
            ctx.closePath();
            ctx.drawImage(cupom1, 525, 50, 100, 100)
        }
        ctx.beginPath();
        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = '#FBF700'
        ctx.textAlign = "left"
        ctx.fillText("Compre na promoção", 650, 100)
        ctx.closePath()

        // linha2
        ctx.beginPath();
        ctx.fillStyle = '#FBF700'
        ctx.fillRect(0, 200, 1000, 4)
        ctx.closePath();
        ctx.drawImage(sem, 25, 250, 100, 100)
        if (cqt.mate < 500) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("???", 150, 275)
            ctx.closePath();
        }
        if (cqt.mate >= 500) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("Mate todos eles", 150, 275)
            ctx.closePath();
            ctx.drawImage(mate, 25, 250, 100, 100)
        }
        ctx.beginPath();
        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = '#FBF700'
        ctx.textAlign = "left"
        ctx.fillText("Mate 500 inimigos", 150, 300)
        ctx.closePath()

        ctx.drawImage(sem, 525, 250, 100, 100)
        if (cqt.podendo === false) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("???", 650, 275)
            ctx.closePath();
        }
        if (cqt.podendo === true) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("Hello stranger", 650, 275)
            ctx.closePath();
            ctx.drawImage(cupom2, 525, 250, 100, 100)
        }
        ctx.beginPath();
        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = '#FBF700'
        ctx.textAlign = "left"
        ctx.fillText("Compre todos os itens de uma vez", 650, 300)
        ctx.closePath()

        //linha 3
        ctx.beginPath();
        ctx.fillStyle = '#FBF700'
        ctx.fillRect(0, 400, 1000, 4)
        ctx.closePath();
        ctx.drawImage(sem, 25, 450, 100, 100)
        if (cqt.dez === false) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("???", 150, 475)
            ctx.closePath();
        }
        if (cqt.dez === true) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("Based ", 150, 475)
            ctx.closePath();
            ctx.drawImage(chad, 25, 450, 100, 100)
        }
        ctx.beginPath();
        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = '#FBF700'
        ctx.textAlign = "left"
        ctx.fillText("Chegue na fase 10 no modo infinito", 150, 500)
        ctx.closePath()

        ctx.drawImage(sem, 525, 450, 100, 100)
        if (cqt.muquirana === false) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("???", 650, 475)
            ctx.closePath();
        }
        if (cqt.muquirana === true) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("Muquirana", 650, 475)
            ctx.closePath();
            ctx.drawImage(DINHEIRO, 525, 450, 100, 100)
        }
        ctx.beginPath();
        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = '#FBF700'
        ctx.textAlign = "left"
        ctx.fillText("Termine o jogo sem comprar nada", 650, 500)
        ctx.closePath()

        //linha 4
        ctx.beginPath();
        ctx.fillStyle = '#FBF700'
        ctx.fillRect(0, 600, 1000, 4)
        ctx.closePath();
        ctx.drawImage(sem, 25, 650, 100, 100)
        if (cqt.desvio === false) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("???", 150, 675)
            ctx.closePath();
        }
        if (cqt.desvio === true) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("Desvio e te mato", 150, 675)
            ctx.closePath();
            ctx.drawImage(desvio, 25, 650, 100, 100)
        }
        ctx.beginPath();
        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = '#FBF700'
        ctx.textAlign = "left"
        ctx.fillText("Termine o jogo sem tomar dano", 150, 700)
        ctx.closePath()

        ctx.drawImage(sem, 525, 650, 100, 100)
        if (cqt.wajaja === false) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("???", 650, 675)
            ctx.closePath();
        }
        if (cqt.wajaja === true) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("WAJAJA", 650, 675)
            ctx.closePath();
            ctx.drawImage(wajaja, 525, 650, 100, 100)
        }
        ctx.beginPath();
        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = '#FBF700'
        ctx.textAlign = "left"
        ctx.fillText("Morra na ultima fase", 650, 700)
        ctx.closePath()

        //linha 5
        ctx.beginPath();
        ctx.fillStyle = '#FBF700'
        ctx.fillRect(0, 800, 1000, 4)
        ctx.closePath();
        

        if (cqt.bolo === false) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("???", 150, 875)
            ctx.closePath();
            ctx.drawImage(sem, 25, 850, 100, 100)
        }
        ctx.beginPath();
        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = '#FBF700'
        ctx.textAlign = "left"
        ctx.fillText("Coma o bolo", 150, 900)
        ctx.closePath()
        if (cqt.bolo === true) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("O bolo não é uma mentira", 150, 875)
            ctx.closePath();
            ctx.drawImage(bolov, 25, 850, 100, 100)
        }
      
        if (cqt.platina === false) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("???", 650, 875)
            ctx.closePath();
            ctx.drawImage(sem, 525, 850, 100, 100)
        }
        if (cqt.platina === true) {
            ctx.beginPath();
            ctx.font = '20px Comic Sans MS'
            ctx.fillStyle = '#FBF700'
            ctx.textAlign = "left"
            ctx.fillText("Lord of Lightning shifts his gaze", 650, 875)
            ctx.closePath();
            ctx.drawImage(lord, 525, 850, 100, 100)
        }
        ctx.beginPath();
        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = '#FBF700'
        ctx.textAlign = "left"
        ctx.fillText("Tenha todas as conquistas", 650, 900)
        ctx.closePath()
    }
    mira.desenha();
    requestAnimationFrame(animacao);
}
let sem = new Image();
sem.src = './jogoImages/inte.jpg';
let wajaja = new Image();
wajaja.src = './jogoImages/wajaja.webp'
let morra = new Image();
morra.src = './jogoImages/dies.png'
let mate = new Image();
mate.src = './jogoImages/based.webp'
let desvio = new Image();
desvio.src = './jogoImages/desvio.png'
let lord = new Image();
lord.src = './jogoImages/litining.png'
let cupom1 = new Image();
cupom1.src = './jogoImages/cartaodaloja.jpg'
let cupom2 = new Image();
cupom2.src = './jogoImages/stranger.jpg'
let chad = new Image();
chad.src = './jogoImages/chad.png'
let DINHEIRO = new Image();
DINHEIRO.src = './jogoImages/DINHEIRO.jpg'
let ratov = new Image()
ratov.src = './jogoImages/noiseviado.jpg'

let logo = new Image();
logo.src = './jogoImages/logo.png'

let espaco = new Image()
espaco.src = './jogoImages/espaco2.png'

// cqt.morra = true
// cqt.bolo = true
// cqt.promo = true
// cqt.mate = 500
// cqt.wajaja = true
// cqt.podendo = true
// cqt.dez = true
// cqt.desvio = true
// cqt.muquirana = true

document.addEventListener('keydown', e => {
    teclas[e.key] = true;
    if ((e.key.toLowerCase() === 'c')) {
        if (cqt.tela === false) {
            entrarConquistas()
        } else {
            sairConquistas();
        }
    }
})

function entrarConquistas() {
    if (cqt.tela === false) {
        cqt.tela = true
        platina()
    }
}

function sairConquistas() {
    if (cqt.tela === true)
        cqt.tela = false
}

function animacaoS() {
    special(inv);
    requestAnimationFrame(animacaoS)
}

function animacaoC() {
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    Vidas(pers.vida);
    requestAnimationFrame(animacaoC);
}

animacaoS();
iniciar();
animacao();
animacaoC();
spawnarInimigo();
spawnarInimigoB();