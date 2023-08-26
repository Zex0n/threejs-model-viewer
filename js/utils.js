function stats(modelName, geometry, numOfMeshes) {

    if (geometry !== undefined) {
        statsNode.innerHTML = 'Name of model/file: ' + '<span class="statsText">' + modelName + '</span>'
           + '<br>'
           + 'Number of vertices: ' + '<span class="statsText">' + geometry.attributes.position.count + '</span>'
           + '<br>'
           + 'Number of faces: ' + '<span class="statsText">' + geometry.attributes.position.count / 3 + '</span>'
           + '<br>'
           + 'Number of Meshes: ' + '<span class="statsText">' + numOfMeshes + '</span>';
    }

}

function colladaMerge(dae, filename) {

    dae.traverse(function (child) {

        if (child instanceof THREE.Mesh) {

            numOfMeshes++;
            var geometry = child.geometry;
            stats(filename, geometry, numOfMeshes);

           // console.log(child.geometry); // BufferGeometry

            //child.geometry = new THREE.BufferGeometry().fromGeometry(child.geometry);
            var wireframe2;
            var collada_geometry = new THREE.Geometry();

            if (dae.children.length > 1) {
                for (var i = 0; i < dae.children.length; i++) {
                    var col_child = dae.children[i];

                    //console.log(dae.children.length);

                    if (col_child instanceof THREE.Mesh) {
                        
                        //When there is more than one child BufferGeometry, create a new geometry 
                        //and merge it with the main new geometry (defined above as collada_geometry)
                        var geom = new THREE.Geometry().fromBufferGeometry(col_child.geometry);

                        collada_geometry.merge(geom);
                        console.log(collada_geometry);

                         var buffer_collada_geometry = new THREE.BufferGeometry().fromGeometry(collada_geometry);
                         console.log(buffer_collada_geometry);
                    }
                }

                model = new THREE.Mesh(buffer_collada_geometry, materials.default_material);
                wireframe2 = new THREE.WireframeGeometry(buffer_collada_geometry);
                console.log("More than one Geometry");

                setSmooth(model);   
            }
            else {
               // var single_geom = new THREE.Geometry().fromBufferGeometry(child.geometry);

                model = new THREE.Mesh(child.geometry, materials.default_material);
                wireframe2 = new THREE.WireframeGeometry(child.geometry);
                console.log("One Geometry");

                setSmooth(model);
            }

            child.material = materials.default_material;

            var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
            materials.wireframeAndModel.visible = false;
            model.add(edges);

            setWireFrame(model);
            setWireframeAndModel(model);
            setPhong(model);
            setXray(model);
        }

    });
}

function setCamera(mod) {
    var bbox = new THREE.Box3().setFromObject(mod);

    /*MODELS OF DIFFERENT SIZES TO FIT IN CAMERA VIEW*/
    var height = bbox.getSize().y;
    var dist = height / (2 * Math.tan(camera.fov * Math.PI / 360));
    var pos = scene.position;
    camera.position.set(pos.x, pos.y, dist * 3.50);
    camera.lookAt(pos);
}

$('#glow_check').on('change', function () {

        if (glow.checked) {
            $('input.check').not(this).prop('checked', false);
            outlinePass.enabled = true;
        }
        else {
            outlinePass.enabled = false;
        }
        
});

function setWireFrame(mod) {

    if (modelWithTextures || fbxLoaded || gltfLoaded) {

        $('#wire_check').on('change', function () {

                $('input.check').not(this).prop('checked', false);

                if (wire.checked) {

                    materials.wireframeAndModel.visible = false;
                     if (mod.material.length > 1) {
                         for (var i = 0; i < mod.material.length; i++) {
 
                             mod.material[i].wireframe = true;
                         }
                     }
                     else {
                         mod.material.wireframe = true;
                     }

                }
                else {
                    if (mod.material.length > 1) {
                         for (var i = 0; i < mod.material.length; i++) {
 
                             mod.material[i].wireframe = false;
                         }
                     }
                     else {
                        mod.material.wireframe = false;
                     }
                }
            });
      
        }
    else {

        $('#wire_check').on('change', function () {

            $('input.check').not(this).prop('checked', false);

            if (wire.checked) {
                materials.wireframeAndModel.visible = false;
                mod.material = materials.wireframeMaterial;
            }
            else {
                mod.material = materials.default_material;
            }
        });
    }
}

function setWireframeAndModel(mod) {

    $('#model_wire').on('change', function () {

        $('input.check').not(this).prop('checked', false);

        if (modelWithTextures || fbxLoaded || gltfLoaded) {
            if (mod.material.length > 1) {
                for (var i = 0; i < mod.material.length; i++) {

                    mod.material[i].wireframe = false;
                }
            }
            else {
                mod.material.wireframe = false;
            }

            if (model_wire.checked) {
                materials.wireframeAndModel.visible = true;
            }
            else {
                materials.wireframeAndModel.visible = false;
            }
        }
        //model without textures
        else {
            mod.material = materials.default_material;

            if (model_wire.checked) {
                materials.wireframeAndModel.visible = true;
            }
            else {
                materials.wireframeAndModel.visible = false;
                mod.material = materials.default_material;
            }
        }
       
    });

}

function setSmooth(mod) {

    var smooth_geom;

    mod.traverse(function (child) {

        if (child instanceof THREE.Mesh) {

            $('#smooth').change(function () {
               
                if (child.geometry.isGeometry) {
                    //Merged collada geometry
                    smooth_geom = child.geometry;                   
                }
                else {
                    smooth_geom = new THREE.Geometry().fromBufferGeometry(child.geometry);
                }
                
                if (smooth.checked) {
                    document.getElementById('smooth-model').innerHTML = "Flatten Model";

                    smooth_geom.mergeVertices();
                    smooth_geom.computeVertexNormals();
                    smooth_geom.computeFaceNormals();
                    child.geometry = new THREE.BufferGeometry().fromGeometry(smooth_geom);
                    //console.log(child.geometry);
                }
                else {
                    document.getElementById('smooth-model').innerHTML = "Smooth Model";

                    smooth_geom.computeFlatVertexNormals();
                    child.geometry = new THREE.BufferGeometry().fromGeometry(smooth_geom);
                }
            });

        }

    });

}
    
function setPhong(mod, originalMat) {

    $('#phong_check').on('change', function () {

       if (modelWithTextures || fbxLoaded || gltfLoaded) {
            phong.checked ? mod.material = materials.phongMaterial : mod.material = originalMat;
          }
          else{
              phong.checked ? mod.material = materials.phongMaterial : mod.material = materials.default_material;
          }
     });

}


function setXray(mod, originalMat) {

    $('#xray_check').on('change', function () {
        
       if (modelWithTextures || fbxLoaded || gltfLoaded) {
          xray.checked ? mod.material = materials.xrayMaterial : mod.material = originalMat;
        }
        else{
            xray.checked ? mod.material = materials.xrayMaterial : mod.material = materials.default_material;
        }
    });
}

var bound_box;
function setBoundBox(mod) {
    /*bound_box = new THREE.BoxHelper(mod); //, 0xffffff
    bound_box.visible = false;
    mod.add(bound_box); //Add bounding box helper to model (for when checkbox is checked)*/

    var box = new THREE.Box3().setFromObject(mod);
    bound_box = new THREE.Box3Helper(box);
    bound_box.visible = false;
    mod.add(bound_box);
}

$('#bBox').change(function () {
    if (bBox.checked) {
        bound_box.visible = true;
    }
    else {
        bound_box.visible = false;
    }
});

function setPolarGrid(mod) {

    var bbox = new THREE.Box3().setFromObject(mod);
    console.log(bbox.min.y);

    /*POLAR GRID HELPER*/
    var radius = 10;
    var radials = 16;
    var circles = 8;
    var divisions = 64;

    polar_grid_helper = new THREE.PolarGridHelper(bbox.max.x * 4, radials, circles, divisions);
    polar_grid_helper.position.y = bbox.min.y;
    polar_grid_helper.visible = false;
    mod.add(polar_grid_helper);
}

var polar_grid_helper;
$('#polar_grid').change(function () {
    if (polar_grid.checked) {
        polar_grid_helper.visible = true;
    }
    else {
        polar_grid_helper.visible = false;
    }
});


function setGrid(mod) {

    var bbox2 = new THREE.Box3().setFromObject(mod);

    /*NORMAL GRID HELPER*/
    gridHelper = new THREE.GridHelper(bbox2.max.x * 4, 40, 0xe6e600, 0x808080);
    //Set size of grid to cover objects of all sizes based on the non visible box3() size.
    gridHelper.position.y = bbox2.min.y; //Set grid underneath loaded model object
    gridHelper.visible = false; //Grid visibility initially false, until grid checkbox is selected
    mod.add(gridHelper);
}

var gridHelper;
$('#grid').change(function () {
    if (grid.checked) {
        gridHelper.visible = true;
    }
    else {
        gridHelper.visible = false;
    }
});

var axis_view;
function setAxis(mod) {

    var bbox3 = new THREE.Box3().setFromObject(mod);

    /*AXIS HELPER*/
    axis_view = new THREE.AxesHelper(bbox3.max.z * 10); //Set axis size based on the non visible box3() size.
    axis_view.position.y = bbox3.min.y; //Set axis underneath loaded model object
    axis_view.visible = false; //axis visibility initially false, until axis checkbox is selected
    mod.add(axis_view);
}

$('#axis').change(function () {
    if (axis.checked) {
        axis_view.visible = true;
    }
    else {
        axis_view.visible = false;
    }
});

//jQuery slider for phong shininess level
$("#shine").slider({
    orientation: "horizontal",
    min: 10,
    max: 500,
    value: 10,
    slide: function (event, ui) {
        materials.phongMaterial.shininess = ui.value; //Set shininess parameter to the current selected value of slider
    },
    change: function (event, ui) {
        console.log(ui.value);
        materials.phongMaterial.shininess = ui.value; //Set shininess of phong material to value from the slider
    }
});

//Strength of glow outine
$("#edgeStrength").slider({
    orientation: "horizontal",
    min: 1,
    max: 10,
    value: 1,
    slide: function (event, ui) {
        outlinePass.edgeStrength = ui.value;
    },
    change: function (event, ui) {
        outlinePass.edgeStrength = ui.value;
    }
});

//PointLight intensity slider
$("#point_light").slider({
    orientation: "horizontal",
    min: 0,
    max: 1,
    step: 0.1,
    value: 0.5,
    slide: function (event, ui) {
        pointLight.intensity = ui.value;
    },
    change: function (event, ui) {
        pointLight.intensity = ui.value;
    }
});

//Set colour of glow model to value from colour
$(".glow_select").spectrum({
    color: "#fff",
    change: function (color) {
        $("#basic-log").text("Hex Colour Selected: " + color.toHexString()); //Log information
        glow_value = $(".glow_select").spectrum('get').toHexString(); //Get the colour selected
        //Set outlinePass effect edge colour to selected value
        outlinePass.visibleEdgeColor.set(glow_value);
    }
});

/*SCALE FUNCTIONS*/
var loopScale = 0;
scale = 1;

function scaleUp(mod) {

   // User clicks scale button once at a time, scale applied once
    $('#scale_up').click(function (e) {
        if (modelLoaded || sample_model_loaded) {

            if (mod.scale.z < 25) {

                scale += (scale * 0.45);
                mod.scale.x = mod.scale.y = mod.scale.z = scale;
            }         
        }
    });
}

function scaleDown(mod) {

    //User clicks scale button once at a time, scale applied once
    $('#scale_down').click(function (e) {
        if (modelLoaded || sample_model_loaded) {
            
            scale -= (scale * 0.35);
            mod.scale.x = mod.scale.y = mod.scale.z = scale;
        }
    });
}

function fixRotation(mod) {

    $("input:radio[name=rotate]").click(function () {
        var rotAxis = $("input:radio[name=rotate]:checked").val();

        switch (rotAxis) {

            case 'rotateX':
                mod.rotation.x = -Math.PI / 2;
                polar_grid_helper.rotation.x = Math.PI / 2;
                gridHelper.rotation.x = Math.PI / 2;
                axis_view.rotation.x = Math.PI / 2;
                break;

            case 'rotateY':
                mod.rotation.y = -Math.PI / 2;
                polar_grid_helper.rotation.y = Math.PI / 2;
                gridHelper.rotation.y = Math.PI / 2;
                axis_view.rotation.y = Math.PI / 2;
                break;

            case 'rotateZ':
                mod.rotation.z = -Math.PI / 2;
                polar_grid_helper.rotation.z = Math.PI / 2;
                gridHelper.rotation.z = Math.PI / 2;
                axis_view.rotation.z = Math.PI / 2;
                break;
        }

    });
}

function resetRotation(mod) {
    $("#reset_rot").click(function () {
        mod.rotation.set(0, 0, 0);
        polar_grid_helper.rotation.set(0, 0, 0);
        gridHelper.rotation.set(0, 0, 0);
        axis_view.rotation.set(0, 0, 0);
        $('input[name="rotate"]').prop('checked', false);
    });
}

/*Animation Controls */
//credit: https://raw.githubusercontent.com/mrdoob/three.js/dev/editor/js/Sidebar.Animation.js

function addAnimation( object, model_animations ) {

    animations[ object.uuid ] = model_animations;

    if(model_animations.length > 0 ){
        animsDiv.style.display = "block";
    }
    else{
        animsDiv.style.display = "none";
    }
}

function animControl( object ) {

    var uuid = object !== null ? object.uuid : '';
    var anims = animations[ uuid ];

    if ( anims !== undefined ) {

        mixer = new THREE.AnimationMixer( object );
        var options = {};
        for ( var animation of anims ) {

            options[ animation.name ] = animation.name;

            var action = mixer.clipAction( animation );
            actions[ animation.name ] = action;
        }

        setOptions( options );
    }
}

function saveAnimationSprites() {
    currentAnimation = actions[ animationsSelect.value ];

    if ( currentAnimation !== undefined ) {
        const animationClip = currentAnimation._clip;

        console.log(currentAnimation);
    }
}
function playAnimation() {

    currentAnimation = actions[ animationsSelect.value ];
    if ( currentAnimation !== undefined ) {

        stopAnimations();
        currentAnimation.play();
      //  updateAnimation();

    }
}

function playAllAnimation(anims) {

    if(anims !== undefined){
        
        document.getElementById("playAll").onclick = function(){
            anims.forEach(function (clip) {               
                 mixer.clipAction(clip).reset().play();
             });
        }
    }
}       

function stopAnimations() {

    if ( mixer !== undefined ) {

        mixer.stopAllAction();

    }
}

 function setOptions( options ) {

    var selected = animationsSelect.value;

    while ( animationsSelect.children.length > 0 ) {

        animationsSelect.removeChild( animationsSelect.firstChild );

    }

    for ( var key in options ) {

        var option = document.createElement( 'option' );
        option.value = key;
        option.innerHTML = options[ key ];
        animationsSelect.appendChild( option );

    }

    animationsSelect.value = selected;
}

document.getElementById("play").onclick = playAnimation;
document.getElementById("stop").onclick = stopAnimations;







class saveSprites {
    constructor(mixer, model) {
        this._fakeDelta = 0;
        this._percentage = 0;
        this.initAnimation(mixer, model)
    }

    initAnimation(mixer, model) {
        if ((mixer) && (model.animations)) {
            this._mixer = mixer;
            this._clips = model.animations;
            this.anims = [];

            for (let i = 0, len = this._clips.length; i < len; i++) {
                const clip = this._clips[i];
                const action = this._mixer.clipAction(clip);
                action.play();
                action.paused = true;
                //
                this.anims.push({clip, action});
            }
        }
    }

   /**
   * Sets the animation to an exact point.
   * @param percentage - A number from 0 to 1, where 0 is 0% and 1 is 100%.
   */
    setPercentage(percentage) {
        if (this._percentage === percentage) {
          return;
        }

        for (let i = 0, len = this.anims.length; i < len; i++) {
          const { clip, action } = this.anims[i];
          action.time = percentage * clip.duration;
          this._mixer.update(++this._fakeDelta);
        }

        this._percentage = percentage;
    }

    setFrame(frameNumber, frameLength) {
      this.setPercentage(((frameNumber * 100) / frameLength) / 100);
    }

    saveImage(imagePath, imageName ){
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link)
        link.setAttribute('download', imageName + '.png');
        link.setAttribute('href', imagePath.replace("image/png", "image/octet-stream"));
        link.click();
    }

    saveSprite() {
        currentAnimation = actions[ animationsSelect.value ];
        // console.log(scene);
        // console.log(currentAnimation);
        // console.log(renderer);
        scene.background = null;
        renderer.setClearAlpha( 0 );

        setTimeout(() => {
            let dataImg = renderer.domElement.toDataURL("image/png");
            this.saveImage(dataImg, "frame");
        }, 1000);
    }

    saveSpritesheet() {
        let sprites_cols = $('#sprites_cols').val();
        currentAnimation = actions[ animationsSelect.value ];
        // var output_canvas = document.createElement('canvas');
        var output_canvas = document.getElementById('animation_frames_canvas');
        var context = output_canvas.getContext('2d');
        // var destination = document.getElementById('animation_frames');

        let canvas_width = $('#canvas_width').val(),
            canvas_height = $('#canvas_height').val();
        output_canvas.width = canvas_width  * sprites_cols;
        output_canvas.height = canvas_height;

        scene.background = null;
        renderer.setClearAlpha( 0 );

        console.log(sprites_cols);
        this.initAnimation(mixer, model)

        var c=document.getElementById("animation_frames");

        // let images_data_list = [],
        //     images_list = [];

        for (let i=0; i<=sprites_cols; i++){


            setTimeout(() => {

                this.setFrame(i, sprites_cols);

                setTimeout(() => {
                    let frame_image = new Image;
                    frame_image.src = renderer.domElement.toDataURL("image/png");
                    frame_image.onload = function() {
                        context.drawImage(this, (canvas_width*i), 0, canvas_width, canvas_height);
                    };

                    // images_list.push(frame_image);
                    // images_data_list.push(img_data);

                    if (i === parseInt(sprites_cols)) {
                        let dataImg = output_canvas.toDataURL("image/png");
                        this.saveImage(dataImg, "spritesheet");
                    }
                }, 100);
            }, 100*(i+1));
        }

        // Promise.all(images_list.map(imageObj => this.add2canvas(output_canvas, imageObj)))
        //     .then(() => destination.append(output_canvas));
    }


    add2canvas(canvas, imageObj) {

    }

    add2canvas1(canvas, imageObj) {
       return new Promise( (resolve, reject) => {
          if (!imageObj || typeof imageObj != 'object') return reject();
          var image = new Image();
          image.onload = function () {
              canvas.getContext('2d')
                    .drawImage(this, imageObj.x || 0, imageObj.y || 0);
              resolve();
          };

          image.src = imageObj.src;
       });
    }
}

class lightObject {
    light_value;

    constructor(light_type, color, intensity, castShadow) {
        this._near = 0.1;
        this._far = 1000;
        this._fov = 90;
        this._side = 100;
        this._cast_shadow = castShadow;
        this._light_type = light_type;

        this.setLight (color, intensity);
        //this.setPosition(0,5,5);

        // if (this._light_type !== "PointLight")
        //     this.setTargetPosition(0,0,0);
    }

    getLight() {
        return this.light_value;
    }

    getPosition(axis) {
        return this.light_value.position[axis];
    }

    setLight (color, intensity) {
        //shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
        if (this._light_type === "DirectionalLight")
            this.light_value = new THREE.DirectionalLight(color, intensity);
        else if (this._light_type === "PointLight")
            this.light_value = new THREE.PointLight(color, intensity);
        else if (this._light_type === "AmbientLight")
            this.light_value = new THREE.AmbientLight(color, intensity);

        // shadowLight.position.set(0,5,5);
        // shadowLight.target.position.set(0,0,0);
        if (this._cast_shadow) {
            if (this._light_type !== "PointLight")
                this.setTargetPosition(0,0,0);
            this.setShadowParams();
        }
    }

    setPosition (x, y, z) {
        this.light_value.position.set(x,y,z);
    }

    setTargetPosition (x, y, z) {
        this.light_value.target.position.set(x,y,z);
    }

    setShadowParams () {
        this.light_value.shadow.camera.near = this._near;
        this.light_value.shadow.camera.far = this._far;
        this.light_value.castShadow = this._cast_shadow;
        this.setCameraSize(this._side);
        this.light_value.shadow.mapSize.width = 2048;
        this.light_value.shadow.mapSize.height = 2048;
    }

    setVisible (visible) {
        this.light_value.visible = visible;
    }

    setCameraSize(size) {
        this._side = size;
        this.light_value.shadow.camera.top = size;
        this.light_value.shadow.camera.bottom = -size;
        this.light_value.shadow.camera.left = size;
        this.light_value.shadow.camera.right = -size;
        this.light_value.shadow.camera.updateProjectionMatrix();
    }
}
$(document).ready(function() {
    save_sprites = new saveSprites(mixer, model);

    $('#save_sprite').click(function () {
        save_sprites.saveSprite();
    });

    $('#save_as_sprites').click(function () {
        save_sprites.saveSpritesheet();
    });

    $('#canvas_size').change(function() {
        //console.log(canvas);
        if (canvasSize.checked) {
            let canvas_width = $('#canvas_width').val(),
                canvas_height = $('#canvas_height').val();

            camera.aspect = canvas_width / canvas_height;
            renderer.setSize(canvas_width, canvas_height);
            $('#main_viewer').css('border', '3px #757575 solid');
            $('#main_viewer').css('margin-right', '300px');
        } else {
            camera.aspect = (window.innerWidth / window.innerHeight);
            renderer.setSize(window.innerWidth, window.innerHeight);
            $('#main_viewer').css('border', '0');
            $('#main_viewer').css('margin-right', 'auto');

        }
        camera.updateProjectionMatrix();
    });

    // Drop Shadow block

    $('.light_input').change(function() {
        if (shadowLight) {
            shadowLight.setPosition(parseInt($('#light_x').val()), parseInt($('#light_y').val()), parseInt($('#light_z').val()));
            shadowLight.setCameraSize(parseInt($('#light_area_size').val()));
            shadowLight.setPosition(parseInt($('#plane_x').val()), parseInt($('#plane_y').val()), parseInt($('#plane_z').val()));

            if (shadowHelper)
                shadowHelper.update();

            //plane_x
        }
    });

    $('#drop_shadow').change(function() {
        console.log("drop_shadow");

        console.log(shadowLight);

        if (dropShadow.checked) {
            if (shadowLight === undefined) {
                shadowLight = new lightObject("DirectionalLight", 0xffffff, 0.5, true);
                shadowLight.setPosition(0,15,15);
                shadowLight.setTargetPosition(0,0,0);

                // shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
                // shadowLight.position.set(0,5,5);
                //shadowLight.target.position.set(0,0,0);
                // shadowLight.shadow.camera.near = near;
                // shadowLight.shadow.camera.far = far;
                // shadowLight.shadow.camera.top = side;
                // shadowLight.shadow.camera.bottom = -side;
                // shadowLight.shadow.camera.left = side;
                // shadowLight.shadow.camera.right = -side;
                // shadowLight.castShadow = true;
                // shadowLight.shadow.mapSize.width = 2048;
                // shadowLight.shadow.mapSize.height = 2048;
                scene.add(shadowLight.getLight());
            } else {
                shadowLight.setVisible(true);
            }
            directionalLights[1].setVisible(false);
            directionalLights[2].setVisible(false);

            $('#light_x').val(shadowLight.getPosition('x'));
            $('#light_y').val(shadowLight.getPosition('y'));
            $('#light_z').val(shadowLight.getPosition('z'));

            $('#light_area_size').val(shadowLight._side);
            floorPlane.visible = true;
        } else {
            shadowLight.setVisible(false);
            directionalLights[1].setVisible(true);
            directionalLights[2].setVisible(true);

            $('.light_input').val('');
            floorPlane.visible = false;
        }
    });

    $('#drop_shadow_light_helper').change(function() {
        console.log("drop_shadow_light_helper");
        if (dropShadowLightHelper.checked) {
            if (shadowHelper === undefined) {
                shadowHelper = new THREE.CameraHelper( shadowLight.getLight().shadow.camera );
                scene.add( shadowHelper );
                console.log(shadowHelper);
            }
            shadowHelper.visible = true;
        } else {
            shadowHelper.visible = false;
        }
    });

    $('#drop_shadow_show_plane').change(function() {
        console.log("drop_shadow_show_plane");
        if (dropShadowShowPlane.checked) {
            if (floorPlaneHelper === undefined) {
                floorPlaneHelper = new THREE.GridHelper( 2000, 100 );
                floorPlaneHelper.position.set(0,0,0);
                floorPlaneHelper.material.opacity = 0.9;
                floorPlaneHelper.material.transparent = true;
                scene.add( floorPlaneHelper );
            }
            floorPlaneHelper.visible = true;

            $('#plane_x').val(floorPlaneHelper.getPosition('x'));
            $('#plane_y').val(floorPlaneHelper.getPosition('y'));
            $('#plane_z').val(floorPlaneHelper.getPosition('z'));
            $('#light_area_size').val(floorPlaneHelper.width);
        } else {
            floorPlaneHelper.visible = false;
        }
    });
});

// document.getElementById("save_sprite").onclick = saveSprite;
