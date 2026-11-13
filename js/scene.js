import * as THREE from 'three';

export function crearEscena() {
    const escena = new THREE.Scene();
    escena.background = new THREE.Color(0x444444);
    return escena;
}

export function configurarIluminacion(escena) {

    const luzAmbiente = new THREE.HemisphereLight(
        0xcccccc,
        0x999999,
        3
    );

    escena.add(luzAmbiente);

    const luzDireccional = new THREE.DirectionalLight(
        0xffffff,
        3
    );

    luzDireccional.position.set(0, 6, 0);
    luzDireccional.castShadow = true;

    luzDireccional.shadow.camera.top = 2;
    luzDireccional.shadow.camera.bottom = -2;
    luzDireccional.shadow.camera.right = 2;
    luzDireccional.shadow.camera.left = -2;

    luzDireccional.shadow.mapSize.set(4096, 4096);

    escena.add(luzDireccional);
}

export function crearSuelo(escena) {

    const geometria = new THREE.PlaneGeometry(4, 4);

    const material = new THREE.MeshPhongMaterial({
        color: 0x222222
    });

    const suelo = new THREE.Mesh(
        geometria,
        material
    );

    suelo.rotation.x = -Math.PI / 2;

    suelo.receiveShadow = true;

    escena.add(suelo);

    return suelo;
}

export function crearMesa(escena) {

    const materialMesa = new THREE.MeshPhongMaterial({
        color: 0x253954
    });

    // Superficie de trabajo
    const superficie = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.08, 1.0),
        materialMesa
    );

    superficie.position.set(0, 0.70, -0.9);
    superficie.receiveShadow = true;
    superficie.castShadow = true;

    escena.add(superficie);

    // Soportes de la mesa
    const materialSoportes = new THREE.MeshPhongMaterial({
        color: 0x465b73
    });

    const posiciones = [
        [-0.95, -1.3],
        [0.95, -1.3],
        [-0.95, -0.5],
        [0.95, -0.5]
    ];

    posiciones.forEach(([x, z]) => {

        const soporte = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.66, 0.08),
            materialSoportes
        );

        soporte.position.set(x, 0.33, z);
        soporte.castShadow = true;

        escena.add(soporte);

    });

    return superficie;
}
