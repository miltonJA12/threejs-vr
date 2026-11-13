let contextoAudio = null;

function obtenerContexto() {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
        console.warn('Audio no compatible.');
        return null;
    }

    if (!contextoAudio) {
        contextoAudio = new AudioContextClass();
    }

    return contextoAudio;
}

async function reproducirTono(frecuencia, duracion, tipo = 'sine') {
    try {
        const contexto = obtenerContexto();

        if (!contexto) return;

        if (contexto.state === 'suspended') {
            await contexto.resume();
        }

        const oscilador = contexto.createOscillator();
        const volumen = contexto.createGain();

        oscilador.type = tipo;
        oscilador.frequency.value = frecuencia;

        const inicio = contexto.currentTime;
        const fin = inicio + duracion;

        volumen.gain.setValueAtTime(0.0001, inicio);
        volumen.gain.exponentialRampToValueAtTime(0.12, inicio + 0.02);
        volumen.gain.exponentialRampToValueAtTime(0.0001, fin);

        oscilador.connect(volumen);
        volumen.connect(contexto.destination);

        oscilador.start(inicio);
        oscilador.stop(fin);

        oscilador.onended = () => {
            oscilador.disconnect();
            volumen.disconnect();
        };

    } catch (error) {
        console.warn('No fue posible reproducir audio:', error);
    }
}

export function sonidoAcierto() {
    return reproducirTono(880, 0.18, 'sine');
}

export function sonidoError() {
    return reproducirTono(220, 0.22, 'triangle');
}

export function sonidoFinalizacion() {
    return Promise.all([
        reproducirTono(660, 0.28, 'sine'),
        reproducirTono(990, 0.35, 'sine')
    ]);
}
