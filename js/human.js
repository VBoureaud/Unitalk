'use strict';

var modelList = {
    humanModel: 'models/human.json',
    womanModel: 'models/woman.json',
    muscleModel: 'models/muscle.json',
    squeletteModel: 'models/squelette.json',
}
var organesMode = false;
var inLoading = false;

var scene, camera, renderer, light, currentSelectedMesh, painMaterial, painTexture, container, controls, loader, orbit, target, organes, currentModel;
var mesh = null;
var move_cam_interval;
var targetList = [];
var mouse = {
    x: 0,
    y: 0
};
var objList = {};
painTexture = [
    new THREE.MeshPhongMaterial({ color: new THREE.Color( 1, 0.738, 0.552 ) }),
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('img/burn.jpg') }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/pimples.jpg') }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/cold.jpg') }),
];
var listMaterial = {
  humanModel: new THREE.MeshPhongMaterial({ color: new THREE.Color( 1, 0.738, 0.552 ) }),
  womanModel: new THREE.MeshPhongMaterial({ color: new THREE.Color( 1, 0.738, 0.552 ) }),
  muscleModel: new THREE.MeshPhongMaterial({ color: new THREE.Color( 0xc18686 ) }),
  squeletteModel: new THREE.MeshPhongMaterial({ color: new THREE.Color( 0xb9986f ) }),
}
painMaterial = [
    new THREE.MeshPhongMaterial({ color: new THREE.Color(1, 0.604, 0.104) }),
    new THREE.MeshPhongMaterial({ color: new THREE.Color(1, 0.604, 0.104) }),
    new THREE.MeshPhongMaterial({ color: new THREE.Color(1, 0.319, 0) }),
    new THREE.MeshPhongMaterial({ color: new THREE.Color(0.904, 0.133, 0.133) }),
    new THREE.MeshPhongMaterial({ color: new THREE.Color(0.262, 0.065, 0.247) }),
    new THREE.MeshBasicMaterial({
      opacity: 0.25,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    }),
];
organes = ["coeur", "poumons", "rein_droit", "rein_gauche", "systeme_digestif", "colon", "estomac", "foie", "petit_intestin", "vessie"];


function initCamera() {
  camera = new THREE.PerspectiveCamera( 60, $(container).width() / (window.innerHeight), 0.01, 50 );
  camera.position.set( 0, 3, -3.5 );
  camera.updateProjectionMatrix();

  orbit = new THREE.OrbitControls(camera, renderer.domElement);
  orbit.addEventListener( 'change', render );
  // OYO
  target = new THREE.Vector3( 0, 1.75, 0 );
  orbit.target = target;
}

function initLights() {
    light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(light);
}

function initRenderer() {
    container = document.getElementById('canvas');

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize($(container).width(), (window.innerHeight));

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;

    container.appendChild( renderer.domElement );
}

var colorChildren = function(mesh, material) {
    var childrens = mesh.children;

    for (var i=0; i<childrens.length; i++) {
        childrens[i].material = material;
        colorChildren(childrens[i], material);
    }
};

function initMesh(model) {
  $('#loader').show();
  window.scrollTo(document.body.scrollHeight,0);
  document.getElementsByClassName('icon-bottom')[0].transform = "rotate(0deg)";
  loader = new THREE.ObjectLoader();
  organesMode = false;
  inLoading = true;
  currentModel = model;

  if (objList[model] != undefined){
    $('#loader').hide();
    $('#loader-result').text('');
    scene.add( objList[model] );
    targetList.push( objList[model] );
    colorChildren(targetList[0], listMaterial[currentModel]);
    render();
    inLoading = false;
  }
  else {
    loader.load( modelList[model],
      function ( obj ) {
        scene.add( obj );
        objList[model] = obj;
        targetList.push( obj );
        colorChildren(targetList[0], listMaterial[currentModel]);
        render();
      },
      function ( xhr ) {
        $('#loader-result').text( parseInt( xhr.loaded / xhr.total * 100 ).toFixed(0)  + '%' );
        if (parseInt( xhr.loaded / xhr.total * 100 ).toFixed(0) == 100) {
          $('#loader').hide();
          $('#loader-result').text('');
          inLoading = false;
        }
      },
      function ( error ) {
        $('#loader').hide();
        $('#loader-result').text('An Error Occured');
      }
    );
  }
  unsetPains();
}

function painCheck(mesh, painScale = 0, painTextType = 0, target, i, isToSet){
  if (target == false)
    target = targetList;
  if (target == undefined || target[i] == undefined)
    return false;

  var find = false;

  if (!isToSet) {
    target[i].material = listMaterial[currentModel];
    colorChildren(target[i], listMaterial[currentModel]);
  }

  if (mesh === target[i].name && isToSet) {
        currentSelectedMesh = mesh;
        if (painScale != false) {
          if (painTextType > 0) {
              target[i].material = painTexture[painTextType];
              colorChildren(target[i], painTexture[painTextType]);
          } else {
              target[i].material = painMaterial[painScale];
              colorChildren(target[i], painMaterial[painScale]);
          }
        } else {
          target[i].material = listMaterial[currentModel];
          colorChildren(target[i], listMaterial[currentModel]);
        }
        render();
        return true;
      }
  else {
    if (target[i].children.length > 0)
      find = painCheck(mesh, painScale, painTextType, target[i].children, 0, isToSet);
    if (target[i + 1] != undefined && !find)
      painCheck(mesh, painScale, painTextType, target, ++i, isToSet);
  }
  return false;
}

var setPain = function(mesh, painScale, painTextType) {
  mesh = mesh.replace(/ /g,"_");
  currentSelectedMesh = mesh;
  if (organes.indexOf(mesh) != -1) {
    switchToOrganMode(true);
  }
  if (mesh != "corps"){
    if (organesMode){
      if (mesh != "ventre" && mesh != "poitrine" && mesh != "pectoral_gauche" && mesh != "pectoral_droit" && mesh != "dos" && mesh != "colonne_vertebrale"){
        painCheck(mesh, painScale, painTextType, false, 0, true);
        move_camera(mesh);
      }
    }
    else {
        painCheck(mesh, painScale, painTextType, false, 0, true);
        move_camera(mesh);
    }
  }
};


var unsetPain = function(mesh) {
    mesh[0].object.material = listMaterial[currentModel];
    colorChildren(mesh[0].object, listMaterial[currentModel]);
}

var unsetPains = function() {
  var painTransparent = 5;

  painCheck(false, false, false, targetList, 0, false);
  if (organesMode){
    painCheck("ventre", painTransparent, 0, false, 0, true);
    painCheck("poitrine", painTransparent, 0, false, 0, true);
    painCheck("dos", painTransparent, 0, false, 0, true);
  }
  render();
}

/**********************/
/**** CAMERA MOVE ****/
/********************/
function move_camera(target){
  target = target.replace(/ /g, "_");
  target = target.replace(new RegExp(/ê/g), "e");

    function camera_goTo(){
        var targetPosition = body_parts[target];
        var updatePos = false;
        //AXE X
        if (camera.position.x < targetPosition[0] - 0.015 || camera.position.x > targetPosition[0] + 0.015){
            camera.position.set((camera.position.x > targetPosition[0]) ? camera.position.x - 0.01 : camera.position.x + 0.01
                , camera.position.y, camera.position.z);
            updatePos = true;
        }
        //AXE Y
        if (camera.position.y < targetPosition[1] - 0.015 || camera.position.y > targetPosition[1] + 0.015){
            camera.position.set(camera.position.x, (camera.position.y > targetPosition[1]) ? camera.position.y - 0.01 : camera.position.y + 0.01, camera.position.z);
            updatePos = true;
        }
        //AXE Z
        if (camera.position.z < targetPosition[2] - 0.015 || camera.position.z > targetPosition[2] + 0.015){
            camera.position.set(camera.position.x, camera.position.y, (camera.position.z > targetPosition[2]) ? camera.position.z - 0.01 : camera.position.z + 0.01);
            updatePos = true;
        }

        //Delete Interval
        if (updatePos === false){
            clearInterval(move_cam_interval);
        }
        camera.lookAt(target);
        requestAnimationFrame(render);
    }

    if (body_parts[target] !== "" && body_parts[target] !== undefined){
        clearInterval(move_cam_interval);
        move_cam_interval = setInterval(camera_goTo,3);
    }
}

function intersectsCheck(ray, target, i){
  if (target == undefined || target[i] == undefined)
    return false;0

  var intersects = ray.intersectObjects(target, true);
  var find = false;
  var i = 0;
  var isOrgan;
  while (find == false && i < intersects.length){
    isOrgan = organes.indexOf(intersects[i].object.name);
    if (isOrgan == -1 && organesMode){
      // If is not a Organ, Accept only if diff to ventre and poitrine
      if (intersects[i].object.name != "ventre" && intersects[i].object.name != "poitrine" && intersects[i].object.name != "pectoral_gauche" && intersects[i].object.name != "pectoral_droit" && intersects[i].object.name != "dos" && intersects[i].object.name != "colonne_vertebrale"){
          find = intersects[i].object.name;
      }
    }
    else if (isOrgan != -1 && !organesMode){find = false;}
    else if (isOrgan != -1 && organesMode){
      find = intersects[i].object.name;
    }
    else if (isOrgan == -1 && !organesMode){
      find = intersects[i].object.name;
    }

    i++;
  }

  if (find != false && find != "corps"){
    unsetPains();
    setPain(find, 2);
    $('#activated-api').html("Vous avez selectionné : <br /><h3 style=\"margin-bottom:0;\">" + find.replace(/_/g," ")) + "</h3>";
  }

  return find;
}

function onMeshClick(e) {

    e.preventDefault();

    if (mouse.x == ((e.clientX / $(container).width()) * 2 - 1) && mouse.y == (-(e.clientY / (window.innerHeight)) * 2 + 1)){
      var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
      vector.unproject(camera);

      var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

      if (targetList[0] == undefined) { return; }

      intersectsCheck(ray, targetList, 0);
    }
}

function onWindowResize() {
    camera.aspect = $(container).width() / (window.innerHeight);

    renderer.setSize($(container).width(), (window.innerHeight));
}

function switchToOrganMode(isSwitch){
  var painTransparent = 5;

  if (isSwitch && organesMode == false){
    painCheck("ventre", painTransparent, 0, false, 0, true);
    painCheck("poitrine", painTransparent, 0, false, 0, true);
    painCheck("dos", painTransparent, 0, false, 0, true);
  }

  organesMode = isSwitch;
  if (!isSwitch){
    unsetPains();
  }

  document.getElementById(isSwitch ? 'organeVisible' : 'organeNotVisible').checked = true;
}

function init() {

  scene = new THREE.Scene();
  initRenderer();
  initCamera();
  initMesh("humanModel");
  initLights();

  window.addEventListener('resize', onWindowResize, false);

  /* Prevent selection if click behavior does not match with a selection but a simple move */
  document.getElementById('canvas').addEventListener('mousedown', function(e) {
    mouse.x = (e.clientX / $(container).width()) * 2 - 1;
    mouse.y = -(e.clientY / (window.innerHeight)) * 2 + 1;
    clearInterval(move_cam_interval);
  }, false);
  document.getElementById('canvas').addEventListener('mouseup', onMeshClick, false);
}

function render() {
  camera.lookAt( target );
  if (scene !== undefined) {
    renderer.render(scene, camera);
  }
}


function changeModel(model){
    if (!inLoading){
    switchToOrganMode(false);

    /* Remove actual subScene */
    scene.remove( scene.children[1] );

    /* Init & Render new model */
    currentSelectedMesh = undefined;
    mesh = null;
    targetList = [];
    render();
    initMesh(model);
  }
}

/* Gestion Options Demo */
document.getElementById('humanModel').onclick = function() {
  document.getElementById('organeNotVisible').checked = true;
  document.getElementById('organesRadio').style.display = 'inline-block';
  changeModel('humanModel');
}
document.getElementById('womanModel').onclick = function() {
  document.getElementById('organeNotVisible').checked = true;
  document.getElementById('organesRadio').style.display = 'inline-block';
  changeModel('womanModel');
}
document.getElementById('muscleModel').onclick = function() {
  document.getElementById('organesRadio').style.display = 'none';
  changeModel('muscleModel');
}
document.getElementById('squeletteModel').onclick = function() {
  document.getElementById('organesRadio').style.display = 'none';
  changeModel('squeletteModel');
}
document.getElementById('organeNotVisible').onclick = function() {
  switchToOrganMode(false);
}
document.getElementById('organeVisible').onclick = function() {
  switchToOrganMode(true);
}
document.getElementById('tutoriel_button').onclick = function() {
    /* Select Human for Head*/
    document.getElementById('humanModel').checked = true;
    changeModel('humanModel');

    /* Black screen */
    $("body").append("<div id='tutoriel_filter'></div>");
    $("#result-field").val("");

    /* Step */
    tutoriel(0);
}

init();
render();