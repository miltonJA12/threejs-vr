import { sonidoAcierto, sonidoError, sonidoFinalizacion } from './audio.js';
import * as THREE from 'three';

export function crearJuego(piezas, destinos, actualizarHUD) {

    const TOLERANCIA = 0.15;

    const estado = {
        progreso: 0,
        tiempo: 0,
        iniciado: false,
        completado: false,
        mensaje: 'Selecciona una pieza con la pinza',
        tipo: 'Pendiente'
    };

    let inicioTiempo = null;

    // PASO 52: RETROALIMENTACION VISUAL
    const coloresOriginales = new Map();
    const coloresBases = new Map();
    const temporizadores = new Map();

    piezas.forEach(pieza => {
        coloresOriginales.set(
            pieza.id,
            pieza.mesh.material.emissive.getHex()
        );
    });

    destinos.forEach(destino => {
        coloresBases.set(
            destino.id,
            destino.base.material.color.getHex()
        );
    });

    function limpiarSenal(pieza) {
        const anterior = temporizadores.get(pieza.id);

        if (anterior !== undefined) {
            clearTimeout(anterior);
            temporizadores.delete(pieza.id);
        }
    }

    function mostrarAcierto(pieza, destino) {
        limpiarSenal(pieza);

        pieza.mesh.material.emissive.setHex(0x008844);
        destino.base.material.color.setHex(0x00ff66);
    }

    function mostrarError(pieza) {
        limpiarSenal(pieza);

        pieza.mesh.material.emissive.setHex(0xaa0000);

        const temporizador = setTimeout(() => {
            if (pieza.estado !== 'colocada') {
                pieza.mesh.material.emissive.setHex(
                    coloresOriginales.get(pieza.id)
                );
            }

            temporizadores.delete(pieza.id);
        }, 900);

        temporizadores.set(pieza.id, temporizador);
    }

    function restaurarVisuales() {
        piezas.forEach(pieza => {
            limpiarSenal(pieza);

            pieza.mesh.material.emissive.setHex(
                coloresOriginales.get(pieza.id)
            );
        });

        destinos.forEach(destino => {
            destino.base.material.color.setHex(
                coloresBases.get(destino.id)
            );
        });
    }


    function notificar() {
        actualizarHUD({
            progreso: estado.progreso,
            tiempo: estado.tiempo,
            estado: estado.tipo,
            mensaje: estado.mensaje
        });
    }

    function iniciar() {
        if (estado.iniciado || estado.completado) return;

        estado.iniciado = true;
        inicioTiempo = performance.now() - estado.tiempo * 1000;
        estado.tipo = 'Activo';
        estado.mensaje = 'Coloca cada pieza en su destino';

        notificar();
    }

    function actualizar() {
        if (!estado.iniciado || estado.completado) return;

        estado.tiempo = Math.floor(
            (performance.now() - inicioTiempo) / 1000
        );

        notificar();
    }

    function validarPieza(pieza, destino) {

        if (!pieza || !destino) return false;

        if (pieza.estado === 'colocada') return false;
        if (destino.ocupado) {
            mostrarError(pieza);
            estado.tipo = 'Error';
            estado.mensaje = 'Este destino ya esta ocupado';
            void sonidoError();
            notificar();
            return false;
        }

        const distancia = pieza.mesh.position.distanceTo(
            destino.posicion
        );

        const identidadCorrecta =
            pieza.destino === destino.id;

        const distanciaCorrecta =
            distancia <= TOLERANCIA;

        if (identidadCorrecta && distanciaCorrecta) {

            pieza.mesh.position.copy(destino.posicion);
            pieza.mesh.quaternion.copy(destino.rotacion);

            mostrarAcierto(pieza, destino);
            pieza.estado = 'colocada';
            destino.ocupado = true;

            estado.progreso++;
            void sonidoAcierto();

            estado.tipo = 'Activo';
            estado.mensaje = 'Pieza colocada correctamente';

            if (estado.progreso === 5) {
                estado.completado = true;
                void sonidoFinalizacion();
                estado.iniciado = false;
                estado.tipo = 'Completado';
                estado.mensaje = 'Laboratorio completado';
            }

            notificar();
            return true;
        }

        mostrarError(pieza);
        estado.tipo = 'Error';
        void sonidoError();
        estado.mensaje = identidadCorrecta
            ? 'Acerca mas la pieza a su destino'
            : 'Destino incorrecto';

        notificar();
        return false;
    }

    function reiniciar() {
        restaurarVisuales();

        piezas.forEach(pieza => {
            pieza.estado = 'disponible';

            pieza.mesh.position.copy(pieza.posicionInicial);
            pieza.mesh.quaternion.copy(pieza.rotacionInicial);

            pieza.mesh.visible = true;
        });

        destinos.forEach(destino => {
            destino.ocupado = false;
        });

        estado.progreso = 0;
        estado.tiempo = 0;
        estado.iniciado = false;
        estado.completado = false;
        estado.tipo = 'Pendiente';
        estado.mensaje = 'Selecciona una pieza con la pinza';

        inicioTiempo = null;

        notificar();
    }

    function obtenerEstado() {
        return {
            ...estado
        };
    }

    notificar();

    return {
        iniciar,
        actualizar,
        validarPieza,
        reiniciar,
        obtenerEstado
    };
}



