import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'
import { LessDepth } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const flagTexture = textureLoader.load('/textures/gobelins_logo.jpg')



/**
 * Test mesh
 */
// Geometry

const meshesToAnimate = [];

const col = 3;
const row = 2;

const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

const count = geometry.attributes.position.count
const randoms = new Float32Array(count)

for(let i = 0; i < count; i++)
{
    randoms[i] = Math.random()
}

geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));


// Material
const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    uniforms:
    {
        uFrequency: { value: new THREE.Vector2(10, 5) },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('orange') },
        uTexture: { value: flagTexture }
    }
})

gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('frequencyX')
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('frequencyY')

// Mesh
for (let i = 0; i < col; i++) {
    for (let t = 0; t < row; t++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.y = 2 / 3;
        let margin = 0.2;
        mesh.position.set(i + margin * i, t, 0);
        scene.add(mesh);
        meshesToAnimate.push(mesh);
    }
}

function lerp(x, y, a) {
    return (1 - a) * x + a * y;
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start)
};

const animationScripts = [];

animationScripts.push({
    start: 10,
    end: 25,
    func: () => {
        material.uniforms.uFrequency.value.x = lerp(5, 6, scalePercent(10, 25));
        material.uniforms.uFrequency.value.Y = lerp(5, 10, scalePercent(10, 25));
    },
})
animationScripts.push({
    start: 30,
    end: 45,
    func: () => {
        material.uniforms.uFrequency.value.x = lerp(6, 5, scalePercent(30, 45));
        material.uniforms.uFrequency.value.y = lerp(10, 5, scalePercent(30, 45));
    },
})

// //add an animation that moves the camera between 60-80 percent of scroll
animationScripts.push({
    start: 0,
    end: 101,
    func: () => {
        material.uniforms.uTime.value = lerp(0, 5, scalePercent(0, 50));
        // meshesToAnimate[1].position.y = lerp(1, -0.5, scalePercent(0, 101))
        // meshesToAnimate[3].position.y = lerp(-0.5, 1, scalePercent(0, 101));
        // meshesToAnimate[5].position.y = lerp(1, -0.5, scalePercent(0, 101))
    },
})

function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a.start && scrollPercent < a.end) {
            a.func()
        }
    })
}

// scroll
let scrollPercent = 0

window.addEventListener('scroll', () => {
    //calculate the current scroll progress as a percentage
        scrollPercent =((document.documentElement.scrollTop || document.body.scrollTop) / ((document.documentElement.scrollHeight || document.body.scrollHeight) - document.documentElement.clientHeight)) *100;
        (document.getElementById('scrollProgress')).innerText =
            'Scroll Progress : ' + scrollPercent.toFixed(2)
});

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1.25, .4, 2)
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    logarithmicDepthBuffer: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor( 0x090810, 1);

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    // controls.update()

    playScrollAnimations();

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()