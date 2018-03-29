// import Math from 'math';
import React from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three'
// var THREE = require('three-js')(["OBJLoader","AxesHelper"]);
var OBJLoader = require('three-obj-loader')(THREE);
import ReactResizeDetector from 'react-resize-detector';
 
// console.log(typeof THREE.OBJLoader);


export default class Simple extends React.Component {
  constructor(props) {
    super(props)

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.animate = this.animate.bind(this)

    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    // Set width of screen
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    // Create scene and add a camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

    //instantiate load OBJ and TEXTURE
    var loader = new THREE.OBJLoader();
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load( './rocket_models/SIDEWINDER_texture.png' );
    this.rocket = new THREE.Object3D();
    loader.load('./rocket_models/SIDEWINDER.obj', ( object ) => {
        // Add textures to rocket
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.material.map = texture;
            console.log("ADDING TEXTURE")
          }
        });
        // Add pivot to center the rocket's orientation
        object.rotation.x = 180 * Math.PI / 180;
        var box = new THREE.Box3().setFromObject(object);
        box.getCenter(object.position);
        object.position.multiplyScalar(-1);
        var pivot = new THREE.Group();
        pivot.add(object);

        // Add the rocket to the scene
        this.rocket = pivot
        scene.add(this.rocket);
      },
      // called when loading is in progresses
      function ( xhr ) {console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );},
      // called when loading has errors
      function ( error ) {console.log( 'An error happened' );}
    );

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setClearColor('#fff1ff');
    renderer.setSize(width, height);

    // Add light sources
    var directionalLight = new THREE.DirectionalLight(0xffffff,1);
    directionalLight.position.set(100, 0, 100).normalize();
    scene.add(directionalLight);
    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    // Orient the camera
    camera.position.x = 400;
    camera.lookAt(new THREE.Vector3(this.rocket.x, this.rocket.y, this.rocket.z));
    camera.rotation.x = 90 * Math.PI / 180;

    // Add axis for orientation
    var axis = new THREE.AxisHelper(100);
    scene.add(axis);

    // Add vars to state
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.mount.appendChild(this.renderer.domElement)
    this.start()

    // this.material = material
    // const geometry = new THREE.BoxGeometry(1, 1, 1)
    // const material = new THREE.MeshBasicMaterial({ color: 0xff00ff })
    // const cube = new THREE.Mesh(geometry, material)
  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId)
  }

  animate() {
    // this.rocket.rotation.x += 0.01
    // this.rocket.rotation.z += 0.01
    this.rocket.rotation.x = this.props.x;
    this.rocket.rotation.y = this.props.y;
    this.rocket.rotation.z = this.props.z;
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera)
  }

  onResize() {
    console.log("RESIZING");
    this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
    this.camera.aspect = this.mount.clientWidth / this.mount.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  render() {
    return (
        <div
          style={{ display: "flex", justifyContent: "center", alignItems: "center", width: '100%', height: '100%' }}
          ref={(mount) => { this.mount = mount }}>
          <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
        </div>
    )
  }
}