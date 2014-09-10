 var canvasContainer = document.getElementById('canvasContainer');
 var stepUI = document.getElementById('stepUI');

 stepUI.onclick = function() {
     goToNextStep();
 };

 var scene;
 var camera;
 var renderer;
 var cameraControls;
 var isCameraTweenInProgress = false;
 var currentStep = 0;

 //CSS rendering of HTML/CSS
 var rendererCSS;
 var cssScene;

 var data = [{
     x: -13,
     y: 0.6,
     z: 1.67,
     duration: 5000
 }, {
     x: -34,
     y: 0.58,
     z: 6,
     duration: 3000
 }, {
     x: -40,
     y: 0.58,
     z: 6,
     duration: 2000
 }, {
     x: -40,
     y: 0.58,
     z: 0,
     duration: 3000
 }];

 init();
 animate();

 function init() {
     var WIDTH = window.innerWidth;
     var HEIGHT = window.innerHeight;

     // Create the scene and set the scene size.
     scene = new THREE.Scene();

     // Create a renderer and add it to the DOM.
     renderer = new THREE.WebGLRenderer({
         antialias: false,
         alpha: true
     });
     renderer.setSize(WIDTH, HEIGHT);
     // Set the background color of the scene.
     //renderer.setClearColorHex(0x333F47, 1);
     canvasContainer.appendChild(renderer.domElement);

     // Create a camera, zoom it out from the model a bit, and add it to the scene.
     camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
     camera.position.set(-9.253363657895058, 4.25411705629656, 4.762984764081457);
     //camera.position.set(0, 150, 400);
     camera.lookAt(scene.position);
     scene.add(camera);




     addResizeEvent();
     addCameraControls();
     addLight();
     addFloor();
     addSkybox();
     addMeshFiles();
     addAxisHelper();




     // create a new scene to hold CSS
     cssScene = new THREE.Scene();


     // create a renderer for CSS
     rendererCSS = new THREE.CSS3DRenderer();
     rendererCSS.setSize(window.innerWidth, window.innerHeight);
     rendererCSS.domElement.style.position = 'absolute';
     rendererCSS.domElement.style.top = 0;
     rendererCSS.domElement.style.margin = 0;
     rendererCSS.domElement.style.padding = 0;
     document.body.appendChild(rendererCSS.domElement);
     // when window resizes, also resize this renderer
     //THREEx.WindowResize(rendererCSS, camera);

     renderer.domElement.style.position = 'absolute';
     renderer.domElement.style.top = 0;
     // make sure original renderer appears on top of CSS renderer
     renderer.domElement.style.zIndex = 1;
     rendererCSS.domElement.appendChild(renderer.domElement);

     addCssObjects();
 }


 function goToPreviousStep() {
     if (currentStep > 0) {
         currentStep--;
     }
     goToStep(currentStep);
 }

 function goToNextStep() {
     if (currentStep < data.length) {
         currentStep++;
         goToStep(currentStep);
     }

 }

 function goToStep(stepNumber) {
     moveCameraToPosition(data[stepNumber]);
 }

 function addResizeEvent() {
     // Create an event listener that resizes the renderer with the browser window.
     window.addEventListener('resize', function() {
         var WIDTH = window.innerWidth;
         var HEIGHT = window.innerHeight;
         renderer.setSize(WIDTH, HEIGHT);
         rendererCSS.setSize(WIDTH, HEIGHT);
         camera.aspect = WIDTH / HEIGHT;
         camera.updateProjectionMatrix();
     });

 }

 function addLight() {
     //bounding sphere for the light so we can see where it is
     var lightBoundingSphere = new THREE.SphereGeometry(0.5, 16, 8);

     // Create a light, set its position, and add it to the scene.
     var light = new THREE.PointLight(0xffffff);
     light.add(new THREE.Mesh(lightBoundingSphere, new THREE.MeshBasicMaterial({
         color: 0xffffff
     })));
     light.position.set(0, 100, -100);
     scene.add(light);

     //var ambientLight = new THREE.AmbientLight(0x404040); // soft white light
     //scene.add(ambientLight);
 }

 function addFloor() {
     var floorTexture = new THREE.ImageUtils.loadTexture('images/asphalt.jpg');
     //floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
     //floorTexture.repeat.set(4, 4);

     var floorMaterial = new THREE.MeshBasicMaterial({
         map: floorTexture,
         side: THREE.DoubleSide
     });
     var floorGeometry = new THREE.PlaneGeometry(2000, 2000, 10, 10);
     var floor = new THREE.Mesh(floorGeometry, floorMaterial);
     floor.position.y = -0.5;
     floor.rotation.x = Math.PI / 2;
     scene.add(floor);
 }


 function addSkybox() {
     /*var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
     var skyBoxMaterial = new THREE.MeshBasicMaterial({
         color: 0x9999ff,
         side: THREE.BackSide
     });
     var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
     scene.add(skyBox);*/

     var imagePrefix = "images/dawnmountain-";
     var directions = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
     var imageSuffix = ".png";
     var skyGeometry = new THREE.BoxGeometry(5000, 5000, 5000);

     var materialArray = [];
     for (var i = 0; i < 6; i++)
         materialArray.push(new THREE.MeshBasicMaterial({
             map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
             side: THREE.BackSide
         }));
     var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
     skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
     skyBox.position.y = 500;
     scene.add(skyBox);
 }

 function addMeshFiles() {
     // Load in the mesh and add it to the scene.
     var loader = new THREE.JSONLoader();
     loader.load("models/house.js", function(geometry, materials) {
         var material = new THREE.MeshLambertMaterial({
             color: 0x55B663,
             side: THREE.DoubleSide
         });

         //var material = new THREE.MeshFaceMaterial(materials)
         var mesh = new THREE.Mesh(geometry, material);
         scene.add(mesh);
     });
 }

 function addCameraControls() {
     // Add OrbitcameraControls so that we can pan around with the mouse.
     cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
     //cameraControls = new THREE.FirstPersonControls(camera, renderer.domElement);
     /*
     cameraControls.movementSpeed = 0.001;
     cameraControls.lookSpeed = 0.000001;
     cameraControls.noFly = true;
     cameraControls.lookVertical = true;
     cameraControls.activeLook = true;*/
 }

 function addAxisHelper() {
     var axes = new THREE.AxisHelper(100);
     scene.add(axes);
 }

 function moveCameraToPosition(config, callback) {
     var currentValues = {
         x: camera.position.x,
         y: camera.position.y,
         z: camera.position.z
     };

     var endValues = {
         x: config.x,
         y: config.y,
         z: config.z
     };

     camera.lookAt(new THREE.Vector3(config.x, config.y, config.z));

     var tween = new TWEEN.Tween(currentValues).to(endValues, config.duration);
     tween.onUpdate(function() {
         camera.position.x = currentValues.x;
         camera.position.y = currentValues.y;
         camera.position.z = currentValues.z;

     });

     if (callback) {
         tween.onComplete(callback);
     }

     //tween.easing()

     tween.start();
 }

 function addCssObjects() {
     var planeMaterial = new THREE.MeshBasicMaterial({
         color: 0x000000,
         opacity: 0.1,
         side: THREE.DoubleSide
     });
     var planeWidth = 9;
     var planeHeight = 3;
     var planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
     var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
     planeMesh.position.y += planeHeight / 2;

     console.log(planeMesh);
     //var planPosition = new THREE.Vector3(0, 1.5, 0);

     scene.add(planeMesh);
     // create the iframe to contain webpage
     var element = document.getElementById('slide1').cloneNode(true); //document.createElement('iframe');
     element.id = element.id + "_rendered";
     // webpage to be loaded into iframe
     //element.src = "index2.html";
     // width of iframe in pixels
     var elementWidth = 1024;
     // force iframe to have same relative dimensions as planeGeometry
     var aspectRatio = planeHeight / planeWidth;
     var elementHeight = elementWidth * aspectRatio;
     element.style.width = elementWidth + "px";
     element.style.height = elementHeight + "px";

     // create a CSS3DObject to display element
     var cssObject = new THREE.CSS3DObject(element);
     // synchronize cssObject position/rotation with planeMesh position/rotation

     cssObject.position.set(planeMesh.position.x, planeMesh.position.y, planeMesh.position.z);

     cssObject.rotation.set(planeMesh.rotation.x, planeMesh.rotation.y, planeMesh.rotation.z);
     // resize cssObject to same size as planeMesh (plus a border)
     var percentBorder = 0.0;
     cssObject.scale.x /= (1 + percentBorder) * (elementWidth / planeWidth);
     cssObject.scale.y /= (1 + percentBorder) * (elementWidth / planeWidth);
     cssScene.add(cssObject);
 }

 // Renders the scene and updates the render as needed.
 function animate() {

     // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
     var delta = requestAnimationFrame(animate);

     // Render the scene.
     rendererCSS.render(cssScene, camera);
     renderer.render(scene, camera);


     if (cameraControls) {
         cameraControls.update(delta);
     }

     TWEEN.update();
 }