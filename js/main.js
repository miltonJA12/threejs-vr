let piezasLaboratorio;
let destinosLaboratorio;
let juegoLaboratorio;
import { crearJuego } from './game.js';
import { crearHUD } from './hud.js';
import { crearPiezas, crearDestinos } from './pieces.js';
import { crearEscena, configurarIluminacion, crearSuelo, crearMesa } from './scene.js';


        import * as THREE from 'three';

        import { VRButton }
            from 'three/addons/webxr/VRButton.js';

        import { XRControllerModelFactory }
            from 'three/addons/webxr/XRControllerModelFactory.js';

        import { OculusHandModel }
            from 'three/addons/webxr/OculusHandModel.js';

        import { OculusHandPointerModel }
            from 'three/addons/webxr/OculusHandPointerModel.js';

        import { createText }
            from 'three/addons/webxr/Text2D.js';


        // ==========================================
        // VARIABLES PRINCIPALES
        // ==========================================

        let camera;
        let scene;
        let renderer;

        let menuMesh;
        let instructionText;

        let controllers;
        let handPointers;

        let needsCalibration = true;

        const intersectables = [];
        const buttons = [];
        const draggables = [];


        // ==========================================
        // INICIAR EXPERIENCIA
        // ==========================================

        init();


        // ==========================================
        // CREAR BOTONES 3D
        // ==========================================

        function makeButtonMesh(x, y, z, color) {

            const geometry = new THREE.BoxGeometry(
                x, y, z
            );

            const material = new THREE.MeshPhongMaterial({
                color: color
            });

            return new THREE.Mesh(
                geometry,
                material
            );

        }


        // ==========================================
        // TRADUCIR BOTÓN DE WEBXR
        // ==========================================

        function traducirBotonVR(boton) {

            const traducciones = {
                'ENTER VR': 'ENTRAR A RV',
                'EXIT VR': 'SALIR DE RV',
                'VR NOT SUPPORTED': 'RV NO COMPATIBLE',
                'VR NOT AVAILABLE': 'RV NO DISPONIBLE',
                'VR NOT ALLOWED': 'RV NO PERMITIDA',
                'WEBXR NOT AVAILABLE': 'WEBXR NO DISPONIBLE'
            };

            function actualizarTexto() {

                const textoActual = boton.textContent.trim();

                const traduccion = traducciones[textoActual];

                if (
                    traduccion &&
                    textoActual !== traduccion
                ) {
                    boton.textContent = traduccion;
                }

            }

            actualizarTexto();

            const observer = new MutationObserver(
                actualizarTexto
            );

            observer.observe(boton, {
                childList: true,
                characterData: true,
                subtree: true
            });

        }


        // ==========================================
        // CONFIGURACIÓN GENERAL
        // ==========================================

        function init() {

            const container = document.createElement('div');

            document.body.appendChild(container);


            // ESCENA

            scene = crearEscena();

            scene.background = new THREE.Color(
                0x444444
            );


            // CÁMARA

            camera = new THREE.PerspectiveCamera(
                50,
                window.innerWidth / window.innerHeight,
                0.1,
                10
            );

            camera.position.set(0, 1.35, 1.75);
            camera.lookAt(0, 0.78, -0.9);


            // ILUMINACIÓN AMBIENTAL

            configurarIluminacion(scene);


            // ======================================
            // RENDERIZADOR
            // ======================================

            renderer = new THREE.WebGLRenderer({
                antialias: true
            });

            renderer.setPixelRatio(
                Math.min(window.devicePixelRatio, 2)
            );

            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );

            renderer.shadowMap.enabled = true;

            renderer.xr.enabled = true;

            renderer.xr.cameraAutoUpdate = false;

            renderer.setAnimationLoop(animate);

            container.appendChild(
                renderer.domElement
            );


            // ======================================
            // CONFIGURACIÓN WEBXR
            // ======================================

            const sessionInit = {
                requiredFeatures: [
                    'hand-tracking'
                ]
            };

            const botonVR = VRButton.createButton(
                renderer,
                sessionInit
            );

            document.body.appendChild(botonVR);

            traducirBotonVR(botonVR);

            renderer.xr.addEventListener(
                'sessionstart',
                function () {
                    needsCalibration = true;
                }
            );

            renderer.xr.addEventListener(
                'sessionend',
                function () {
                    needsCalibration = true;
                }
            );


            // ======================================
            // CONTROLADORES
            // ======================================

            const controller1 = renderer.xr.getController(0);

            scene.add(controller1);

            const controller2 = renderer.xr.getController(1);

            scene.add(controller2);

            const controllerModelFactory =
                new XRControllerModelFactory();


            // ======================================
            // MANO IZQUIERDA
            // ======================================

            const controllerGrip1 =
                renderer.xr.getControllerGrip(0);

            controllerGrip1.add(
                controllerModelFactory.createControllerModel(
                    controllerGrip1
                )
            );

            scene.add(controllerGrip1);

            const hand1 = renderer.xr.getHand(0);

            hand1.add(
                new OculusHandModel(hand1)
            );

            const handPointer1 =
                new OculusHandPointerModel(
                    hand1,
                    controller1
                );

            hand1.add(handPointer1);

            scene.add(hand1);


            // ======================================
            // MANO DERECHA
            // ======================================

            const controllerGrip2 =
                renderer.xr.getControllerGrip(1);

            controllerGrip2.add(
                controllerModelFactory.createControllerModel(
                    controllerGrip2
                )
            );

            scene.add(controllerGrip2);

            const hand2 = renderer.xr.getHand(1);

            hand2.add(
                new OculusHandModel(hand2)
            );

            const handPointer2 =
                new OculusHandPointerModel(
                    hand2,
                    controller2
                );

            hand2.add(handPointer2);

            scene.add(hand2);


            controllers = [
                controllerGrip1,
                controllerGrip2
            ];

            handPointers = [
                handPointer1,
                handPointer2
            ];


            // ======================================
            // SUELO
            // ======================================

            crearSuelo(scene);
            crearMesa(scene);


            // ======================================
            // MENÚ FLOTANTE
            // ======================================

            const menuGeometry =
                new THREE.PlaneGeometry(
                    0.38,
                    0.5
                );

            const menuMaterial =
                new THREE.MeshPhongMaterial({
                    opacity: 0,
                    transparent: true
                });

            menuMesh = new THREE.Mesh(
                menuGeometry,
                menuMaterial
            );

            menuMesh.position.set(1.25, 1.10, -1.0);

            menuMesh.rotation.y = -Math.PI / 12;

            scene.add(menuMesh);


            // ======================================
            // BOTÓN REINICIAR
            // ======================================

            const resetButton = makeButtonMesh(
                0.34,
                0.1,
                0.01,
                0x355c7d
            );

            const resetButtonText = createText(
                'Reiniciar',
                0.045
            );

            resetButton.add(resetButtonText);

            resetButtonText.position.set(
                0,
                0,
                0.0051
            );

            resetButton.position.set(
                0,
                -0.06,
                0
            );

            menuMesh.add(resetButton);


            // ======================================
            // BOTÓN SALIR
            // ======================================

            const exitButton = makeButtonMesh(
                0.34,
                0.1,
                0.01,
                0xff0000
            );

            const exitButtonText = createText(
                'Salir',
                0.06
            );

            exitButton.add(exitButtonText);

            exitButtonText.position.set(
                0,
                0,
                0.0051
            );

            exitButton.position.set(
                0,
                -0.18,
                0
            );

            menuMesh.add(exitButton);


            // ======================================
            // INSTRUCCIONES EN ESPAÑOL
            // ======================================

            instructionText = createText(
                'Usa tus manos para mover los cubos.',
                0.035
            );

            instructionText.position.set(
                0,
                1.6,
                -0.6
            );

            scene.add(instructionText);


            // MENSAJE DE SALIDA

            const exitText = createText(
                'Saliendo de realidad virtual...',
                0.035
            );

            exitText.position.set(
                0,
                1.5,
                -0.6
            );

            exitText.visible = false;

            scene.add(exitText);


            // ======================================
            // CREAR 20 CUBOS INTERACTIVOS
            // ======================================

                        piezasLaboratorio = crearPiezas(scene);
destinosLaboratorio = crearDestinos(scene);
            const hudLaboratorio = crearHUD(scene);
            juegoLaboratorio = crearJuego(piezasLaboratorio, destinosLaboratorio, hudLaboratorio.actualizarHUD);

            piezasLaboratorio.forEach(pieza => {

                intersectables.push(pieza.mesh);

                draggables.push({
                    mesh: pieza.mesh,
                    state: 'detached',
                    originalParent: scene,
                    attachedPointer: null
                });

            });


            // ======================================
            // REGISTRAR BOTONES
            // ======================================

            intersectables.push(
                menuMesh,
                resetButton,
                exitButton
            );

            buttons.push(

                {
                    mesh: resetButton,
                    currState: 'none',
                    prevState: 'none',

                    action: function () {

                        reiniciarLaboratorio();

                    }
                },

                {
                    mesh: exitButton,
                    currState: 'none',
                    prevState: 'none',

                    action: function () {

                        exitText.visible = true;

                        setTimeout(function () {

                            exitText.visible = false;

                            const session =
                                renderer.xr.getSession();

                            if (session) {
                                session.end();
                            }

                        }, 2000);

                    }
                }

            );


            window.addEventListener(
                'resize',
                onWindowResize
            );

        }


        // ==========================================
        // AJUSTAR VENTANA
        // ==========================================

        function onWindowResize() {

            camera.aspect =
                window.innerWidth / window.innerHeight;

            camera.updateProjectionMatrix();

            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );

        }


        // ==========================================
        // DISTRIBUIR CUBOS ALEATORIAMENTE
        // ==========================================

                function reiniciarLaboratorio() {

            // Liberar cualquier pieza sujeta
            draggables.forEach(draggable => {

                if (draggable.mesh.parent !== draggable.originalParent) {
                    draggable.originalParent.attach(draggable.mesh);
                }

                if (draggable.attachedPointer) {
                    draggable.attachedPointer.setAttached(false);
                }

                draggable.state = 'detached';
                draggable.attachedPointer = null;
                draggable.mesh.scale.set(1, 1, 1);
            });

            // Restablecer indicadores de las manos
            handPointers.forEach(hp => {
                hp.setAttached(false);
            });

            // Restaurar el estado central del juego
            juegoLaboratorio.reiniciar();
        }
function randomizeObjects() {

            draggables.forEach(draggable => {

                const object = draggable.mesh;

                object.material.color.setHex(
                    Math.floor(Math.random() * 0xffffff)
                );

                object.position.x =
                    Math.random() * 2 - 1;

                object.position.y =
                    Math.random() * 2;

                object.position.z =
                    Math.random() * 2 - 1;

                object.rotation.x =
                    Math.random() * 2 * Math.PI;

                object.rotation.y =
                    Math.random() * 2 * Math.PI;

                object.rotation.z =
                    Math.random() * 2 * Math.PI;

                object.scale.x =
                    Math.random() + 0.5;

                object.scale.y =
                    Math.random() + 0.5;

                object.scale.z =
                    Math.random() + 0.5;

            });

        }


        // ==========================================
        // CALIBRAR MENÚ EN REALIDAD VIRTUAL
        // ==========================================

        function calibrateMenu() {

            if (
                needsCalibration &&
                renderer.xr.getSession()
            ) {

                const xrCamera =
                    renderer.xr.getCamera();

                menuMesh.position.x =
                    xrCamera.position.x + 0.4;

                menuMesh.position.y =
                    xrCamera.position.y;

                menuMesh.position.z =
                    xrCamera.position.z - 1;

                needsCalibration = false;

            }

        }


        // ==========================================
        // ACTUALIZAR INSTRUCCIONES
        // ==========================================

        function updateInstructionText() {

            instructionText.visible =
                controllers.some(
                    controller => controller.visible
                );

        }


        // ==========================================
        // ACTUALIZAR OBJETOS ARRASTRABLES
        // ==========================================

        function updateDraggables() {

            draggables.forEach(draggable => {

                const object = draggable.mesh;

                switch (draggable.state) {

                    case 'to-be-attached':

    // Comenzar el reto al agarrar la primera pieza
    juegoLaboratorio.iniciar();

    draggable.attachedPointer
        .children[0]
        .attach(object);

    draggable.state = 'attached';

                        break;


                    case 'to-be-detached':

    // Devolver el objeto a la escena
    draggable.originalParent.attach(object);

    draggable.state = 'detached';

    // Identificar la pieza que se ha soltado
    const piezaSoltada = piezasLaboratorio.find(
        pieza => pieza.mesh === object
    );

    if (piezaSoltada && piezaSoltada.estado !== 'colocada') {

        // Buscar el destino mas cercano
        let destinoCercano = null;
        let distanciaMinima = Infinity;

        destinosLaboratorio.forEach(destino => {

            // Se consideran todos los destinos, incluso los ocupados

            const distancia = object.position.distanceTo(
                destino.posicion
            );

            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                destinoCercano = destino;
            }

        });

        // Validar unicamente al soltar
        if (destinoCercano) {
            juegoLaboratorio.validarPieza(
                piezaSoltada,
                destinoCercano
            );
        }

    }

    break;


                    default:

                        object.scale.set(
                            1,
                            1,
                            1
                        );

                }

            });

        }


        // ==========================================
        // DETECTAR MANOS Y OBJETOS
        // ==========================================

        function updateHandRays() {

            handPointers.forEach(hp => {

                let distance = null;

                let intersectingMesh = null;

                intersectables.forEach(object => {

                    const intersections =
                        hp.intersectObject(
                            object,
                            false
                        );

                    if (
                        intersections &&
                        intersections.length > 0
                    ) {

                        if (
                            distance === null ||
                            intersections[0].distance < distance
                        ) {

                            distance =
                                intersections[0].distance;

                            intersectingMesh = object;

                        }

                    }

                });


                if (distance !== null) {

                    hp.setCursor(distance);

                    const button = buttons.find(
                        button =>
                            button.mesh === intersectingMesh
                    );


                    // DETECTAR BOTONES

                    if (button !== undefined) {

                        if (hp.isPinched()) {

                            button.currState = 'pressed';

                        } else if (
                            button.currState !== 'pressed'
                        ) {

                            button.currState = 'hovered';

                        }

                    }


                    // DETECTAR CUBOS

                    const draggable = draggables.find(
                        draggable =>
                            draggable.mesh === intersectingMesh
                    );

                    if (draggable !== undefined) {

                        intersectingMesh.scale.set(
                            1.1,
                            1.1,
                            1.1
                        );


                        // SUJETAR CUBO

                        if (hp.isPinched()) {

                            if (
                                !hp.isAttached() &&
                                draggable.state === 'detached' &&
                                !piezasLaboratorio.some(
                                    pieza =>
                                        pieza.mesh === draggable.mesh &&
                                        pieza.estado === 'colocada'
                                )
                            ) {

                                draggable.state =
                                    'to-be-attached';

                                draggable.attachedPointer = hp;

                                hp.setAttached(true);

                            }

                        } else {

                            // SOLTAR CUBO

                            if (
                                hp.isAttached() &&
                                draggable.state === 'attached'
                            ) {

                                draggable.state =
                                    'to-be-detached';

                                draggable.attachedPointer = null;

                                hp.setAttached(false);

                            }

                        }

                    }

                } else {

                    hp.setCursor(1.5);

                }

            });

        }


        // ==========================================
        // ACTUALIZAR BOTONES INTERACTIVOS
        // ==========================================

        function updateButtons() {

            buttons.forEach(button => {

                if (button.currState === 'none') {

                    button.mesh.scale.set(
                        1,
                        1,
                        1
                    );

                } else {

                    button.mesh.scale.set(
                        1.1,
                        1.1,
                        1.1
                    );

                }


                // EJECUTAR ACCIÓN

                if (
                    button.currState === 'pressed' &&
                    button.prevState !== 'pressed'
                ) {

                    button.action();

                }


                button.prevState =
                    button.currState;

                button.currState = 'none';

            });

        }


        // ==========================================
        // ANIMACIÓN PRINCIPAL
        // ==========================================

        function animate() {
            juegoLaboratorio.actualizar();

            renderer.xr.updateCamera(camera);

            calibrateMenu();

            updateInstructionText();

            updateDraggables();

            updateHandRays();

            updateButtons();

            renderer.render(
                scene,
                camera
            );

        }

    

















