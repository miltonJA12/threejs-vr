import * as THREE from 'three';

export const PIEZAS = [
    {
        id: 'cubo',
        nombre: 'Cubo',
        color: 0x3498db,
        destino: 'base-cubo'
    },
    {
        id: 'esfera',
        nombre: 'Esfera',
        color: 0xe67e22,
        destino: 'base-esfera'
    },
    {
        id: 'cono',
        nombre: 'Cono',
        color: 0x9b59b6,
        destino: 'base-cono'
    },
    {
        id: 'cilindro',
        nombre: 'Cilindro',
        color: 0x2ecc71,
        destino: 'base-cilindro'
    },
    {
        id: 'prisma',
        nombre: 'Prisma triangular',
        color: 0xf1c40f,
        destino: 'base-prisma'
    }
];

export function crearGeometria(tipo) {

    switch (tipo) {
        case 'cubo':
            return new THREE.BoxGeometry(0.15, 0.15, 0.15);

        case 'esfera':
            return new THREE.SphereGeometry(0.09, 24, 16);

        case 'cono':
            return new THREE.ConeGeometry(0.09, 0.18, 24);

        case 'cilindro':
            return new THREE.CylinderGeometry(
                0.08, 0.08, 0.18, 24
            );

        case 'prisma':
            return new THREE.CylinderGeometry(
                0.10, 0.10, 0.18, 3
            );

        default:
            throw new Error('Geometria desconocida: ' + tipo);
    }
}

export function crearPiezas(escena) {

    const piezas = [];

    PIEZAS.forEach((datos, indice) => {

        const material = new THREE.MeshPhongMaterial({
            color: datos.color
        });

        const objeto = new THREE.Mesh(
            crearGeometria(datos.id),
            material
        );

        objeto.name = datos.id;

        objeto.position.set(
            -0.76 + indice * 0.38,
            0.92,
            -0.55
        );

        objeto.castShadow = true;

        escena.add(objeto);

        piezas.push({
            id: datos.id,
            nombre: datos.nombre,
            mesh: objeto,
            destino: datos.destino,
            estado: 'disponible',
            posicionInicial: objeto.position.clone(),
            rotacionInicial: objeto.quaternion.clone()
        });

    });

    return piezas;
}

export function crearDestinos(escena) {

    const destinos = [];

    PIEZAS.forEach((datos, indice) => {

        // Cada pieza tendrá un destino específico
        const posicion = new THREE.Vector3(
            -0.76 + indice * 0.38,
            0.79,
            -1.20
        );

        // Plataforma circular de destino
        const geometriaBase = new THREE.CylinderGeometry(
            0.13,
            0.13,
            0.025,
            32
        );

        const materialBase = new THREE.MeshPhongMaterial({
            color: datos.color,
            transparent: true,
            opacity: 0.55
        });

        const base = new THREE.Mesh(
            geometriaBase,
            materialBase
        );

        base.position.copy(posicion);
        escena.add(base);

        // Silueta geométrica del objeto esperado
        const materialSilueta = new THREE.MeshBasicMaterial({
            color: datos.color,
            wireframe: true,
            transparent: true,
            opacity: 0.65
        });

        const silueta = new THREE.Mesh(
            crearGeometria(datos.id),
            materialSilueta
        );

        silueta.position.copy(posicion);
        silueta.position.y += 0.11;

        escena.add(silueta);

        // Guardar información del destino
        destinos.push({
            id: datos.destino,
            piezaId: datos.id,
            nombre: datos.nombre,
            posicion: silueta.position.clone(),
            rotacion: silueta.quaternion.clone(),
            base: base,
            silueta: silueta,
            ocupado: false
        });

    });

    return destinos;
}

