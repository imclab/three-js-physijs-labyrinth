var curMouseLeft = -1, curMouseUp = -1;
var woodenMaterial, woodenMaterial2, metalMaterial, finishMaterial;
var board, ball;
//where you promises
woodenMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('content/board-bg.jpg', new THREE.UVMapping(), function () {
    woodenMaterial2 = Physijs.createMaterial(new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('content/board-bg2.jpg', new THREE.UVMapping(), function () {
        metalMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('content/metal.jpg', new THREE.UVMapping(), function () {
            finishMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('content/finish.jpg', new THREE.UVMapping(), function () {
                init();
            })}));
        })}));
    })}));
})}));

function init() {
    var render = function () {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    };
    Physijs.scripts.worker = 'physijs_worker.js';
    Physijs.scripts.ammo = 'js/ammo.js';

    var projector = new THREE.Projector;
    var width = window.innerWidth, height = window.innerHeight;
    var view_angle = 35, aspect = width / height, near = 1, far = 1000;

    var container = $('#container');

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize(width, height);
    container.append(renderer.domElement);

    var camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);
    var scene = new Physijs.Scene;
    scene.setGravity(new THREE.Vector3(0, 0, -50));
    scene.add(camera);
    scene.addEventListener(
        'update',
        function () {
            scene.simulate(undefined, 2);
            if (ball && ball.position.z <= -50) {
                alert('You loose');
                ball = null;
            }
        }
    );

    camera.position.set(0, 0, 450);

    addBall(scene);
    addLight(scene);
    addGround(scene);

    requestAnimationFrame(render);
    scene.simulate();

    $('body').keydown(function (e) {
        board.__dirtyRotation = true;
        board.__dirtyPosition = true;
        switch (e.keyCode) {
            case 38:
                board.rotation.x -= Math.PI * 0.5 / 180;
                break;//up
            case 40:
                board.rotation.x += Math.PI * 0.5 / 180;
                break;//down
            case 37:
                board.rotation.y -= Math.PI * 0.5 / 180;
                break;//left
            case 39:
                board.rotation.y += Math.PI * 0.5 / 180;
                break;//right
        }
        ;
        if (board.rotation.y > Math.PI * 15 / 180) {
            board.rotation.y = Math.PI * 15 / 180
        }
        if (board.rotation.y < Math.PI * -15 / 180) {
            board.rotation.y = Math.PI * -15 / 180
        }
        if (board.rotation.x > Math.PI * 15 / 180) {
            board.rotation.x = Math.PI * 15 / 180
        }
        if (board.rotation.x < Math.PI * -15 / 180) {
            board.rotation.x = Math.PI * -15 / 180
        }
        renderer.render(scene, camera);
    });

}

function addBall(scene) {
    var ballGeometry = new THREE.SphereGeometry(3, 32, 32);
    ball = new Physijs.SphereMesh(ballGeometry, metalMaterial, 50);
    ball.position.set(-65, -55, 50);
    scene.add(ball);
}

function addLight(scene) {
    // Light
    var light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(0, 250, 800);
    light.target.position.copy(scene.position);
    light.castShadow = true;
    light.shadowCameraLeft = -60;
    light.shadowCameraTop = -60;
    light.shadowCameraRight = 60;
    light.shadowCameraBottom = 60;
    light.shadowCameraNear = 20;
    light.shadowCameraFar = 200;
    light.shadowBias = -.0001
    light.shadowMapWidth = light.shadowMapHeight = 2048;
    light.shadowDarkness = .7;
    scene.add(light);
}

function addGround(scene) {
    var boardMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 0x0000ff }), .4, .6);    
    var level = LoadLevel();    
    var ground_geometry = new THREE.CubeGeometry(10, 10, 1);
    board = new Physijs.BoxMesh(
        ground_geometry,
        boardMaterial,
        0 // mass
    );
    board.__dirtyPosition = true;
    board.position.x = -level[0].length * 5;
    board.position.y = -level.length * 5;

    for (var i = 0; i < level.length; i++) {
        for (var j = 0; j < level[i].length; j++) {
            switch (level[i][j]) {
                case 0:
                    addBoardPart(i, j, level.length, level[i].length, scene);
                    break;
                case 1:
                    addWall(i, j, level.length, level[i].length, scene);
                    break;
                case 2:
                    addHole(i, j, level.length, level[i].length, scene);
                    break;
                case 3:
                    addFinish(i, j, level.length, level[i].length, scene);
                    break;
            }
        }
    }    
    scene.add(board);    
}

function addFinish(x, y, rows, cols, scene) {
    addBoardPart(x, y, rows, cols);
    var geometry = new THREE.SphereGeometry(3, 32, 32);    
    var cube = new Physijs.SphereMesh(geometry, finishMaterial, 0);
    cube.position.z = 5;
    cube.position.x = x * 10 - cols * 5;
    cube.position.y = y * 10 - rows * 5;

    cube.addEventListener('collision', function (object) {        
        //console.log(this.id);
        //console.log(object.id);
        alert('You win!');        
    });
    var step = 1;
    setInterval(function () {
        cube.__dirtyPosition = true;
        cube.position.z += step;
        if (cube.position.z >= 20 || cube.position.z <= 5) step *= -1;
    }, 200);

    scene.add(cube);

}
function addBoardPart(x, y, rows, cols, scene) {
    var geometry = new THREE.CubeGeometry(10, 10, 1);
    var boardMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 0x000000 }), .4, .6);    
    var cube = new Physijs.BoxMesh(geometry, woodenMaterial, 0);    
    cube.position.z = 0;
    cube.position.x = x * 10;
    cube.position.y = y * 10;
    board.add(cube);
}

function addWall(x, y, rows, cols, scene) {
    var geometry = new THREE.CubeGeometry(10, 10, 15);    
    var cube = new Physijs.BoxMesh(geometry, woodenMaterial2, 0);
    cube.position.z = 1;
    cube.position.x = x * 10;
    cube.position.y = y * 10;
    board.add(cube);
}
function addHole(x, y, rows, cols, scene) {
	//add nothing :)
}


function LoadLevel() {
    return [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 2, 1, 0, 0, 2, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 2, 0, 0, 1, 1, 1, 0, 2, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 1, 1, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 2, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1],
        [1, 2, 0, 1, 0, 1, 3, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
}

