// 1. Elementos del DOM
const btnIniciar = document.getElementById('btnIniciar');
const btnParar = document.getElementById('btnParar');
const estado = document.getElementById('estado');
const audioAlarma = document.getElementById('audioAlarma');

// 2. Variables de estado
let reconocedor;
let escuchando = false;
let wakeLock = null;

// 3. Configurar el Reconocimiento de Voz
function configurarVoz() {
    // Compatibilidad con navegadores
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        estado.textContent = "Tu navegador no soporta reconocimiento de voz. Usa Chrome.";
        return;
    }

    reconocedor = new SpeechRecognition();
    reconocedor.lang = 'es-ES'; // Español
    reconocedor.continuous = true; // Escucha continuamente
    reconocedor.interimResults = false;

    // ¿Qué pasa cuando reconoce algo?
    reconocedor.onresult = (event) => {
        const ultimoResultado = event.results[event.results.length - 1];
        const texto = ultimoResultado[0].transcript.toLowerCase();
        
        estado.textContent = `Escuché: "${texto}"`;

        // Palabras clave para ACTIVAR la alarma
        if (texto.includes("dónde está") || texto.includes("teléfono") || texto.includes("busca")) {
            dispararAlarma();
        }
        
        // Palabras clave para APAGAR la alarma
        if (texto.includes("parar") || texto.includes("silencio") || texto.includes("basta")) {
            apagarAlarma();
        }
    };

    // Si se detiene por error, volver a iniciarlo si estamos en modo escucha
    reconocedor.onend = () => {
        if (escuchando) {
            reconocedor.start(); 
        }
    };

    reconocedor.onerror = (event) => {
        console.error("Error de voz:", event.error);
    };
}

// 4. Funciones de Alarma
function dispararAlarma() {
    estado.textContent = "🚨 ¡ALARMA ACTIVADA! Di 'PARAR' para silenciar.";
    audioAlarma.play();
    // Opcional: detener el reconocimiento para que el micrófono no interfiera con el audio
    reconocedor.stop(); 
}

function apagarAlarma() {
    audioAlarma.pause();
    audioAlarma.currentTime = 0;
    estado.textContent = "Alarma detenida. Siguiendo escuchando...";
    // Reiniciar el reconocimiento
    if (escuchando) reconocedor.start();
}

// 5. Mantener la pantalla encendida (Wake Lock)
async function mantenerPantallaEncendida() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
        console.log("No se pudo activar Wake Lock:", err);
    }
}

// 6. Event Listeners de los Botones
btnIniciar.addEventListener('click', async () => {
    configurarVoz();
    reconocedor.start();
    escuchando = true;
    
    btnIniciar.classList.add('oculto');
    btnParar.classList.remove('oculto');
    estado.textContent = "👂 Escuchando... Di '¿Dónde está el teléfono?'";
    
    await mantenerPantallaEncendida();
});

btnParar.addEventListener('click', () => {
    escuchando = false;
    reconocedor.stop();
    apagarAlarma();
    
    btnParar.classList.add('oculto');
    btnIniciar.classList.remove('oculto');
    estado.textContent = "Sistema apagado.";
    
    if (wakeLock) wakeLock.release();
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}