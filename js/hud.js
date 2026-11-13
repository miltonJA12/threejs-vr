import * as THREE from 'three';

export function crearHUD(escena) {

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;

    const contexto = canvas.getContext('2d');

    const textura = new THREE.CanvasTexture(canvas);
    textura.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
        map: textura,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 0.475),
        material
    );

    panel.position.set(0, 1.65, -1.2);
    escena.add(panel);

    function actualizarHUD({
        progreso = 0,
        tiempo = 0,
        estado = 'Pendiente',
        mensaje = 'Selecciona una pieza con la pinza'
    } = {}) {

        contexto.clearRect(0, 0, 1024, 512);

        contexto.fillStyle = '#101c31';
        contexto.fillRect(0, 0, 1024, 512);

        contexto.strokeStyle = '#50e3c2';
        contexto.lineWidth = 8;
        contexto.strokeRect(12, 12, 1000, 488);

        contexto.fillStyle = '#ffffff';
        contexto.textAlign = 'center';

        contexto.font = 'bold 56px Arial';
        contexto.fillText(
            'LABORATORIO VR',
            512,
            90
        );

        contexto.font = 'bold 70px Arial';
        contexto.fillStyle = '#50e3c2';
        contexto.fillText(
            progreso + '/5',
            260,
            225
        );

        const minutos = Math.floor(tiempo / 60);
        const segundos = Math.floor(tiempo % 60);

        const reloj =
            String(minutos).padStart(2, '0') +
            ':' +
            String(segundos).padStart(2, '0');

        contexto.fillStyle = '#ffffff';
        contexto.fillText(
            reloj,
            750,
            225
        );

        contexto.font = '30px Arial';
        contexto.fillStyle = '#a6b9d2';

        contexto.fillText('PROGRESO', 260, 280);
        contexto.fillText('TIEMPO', 750, 280);

        contexto.font = '34px Arial';
        contexto.fillStyle = '#50e3c2';
        contexto.fillText(
            'Estado: ' + estado,
            512,
            365
        );

        contexto.font = '27px Arial';
        contexto.fillStyle = '#ffffff';
        contexto.fillText(
            mensaje,
            512,
            430
        );

        textura.needsUpdate = true;
    }

    actualizarHUD();

    function liberarHUD() {
        escena.remove(panel);
        panel.geometry.dispose();
        material.dispose();
        textura.dispose();
    }

    return {
        panel,
        actualizarHUD,
        liberarHUD
    };
}
