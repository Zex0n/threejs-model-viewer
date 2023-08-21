
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

class light {
    constructor(color, intensity, castShadow) {
        this._near = 0.1;
        this._far = 1000;
        this._fov = 90;
        this._side = 150;
        this._cast_shadow = castShadow;

        this.setLight (color, intensity);
        this.setPosition(0,5,5);
        this.setTargetPosition(0,0,0);
    }

    setLight (color, intensity) {
        //shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
        shadowLight = new THREE.DirectionalLight(color, intensity);

        // shadowLight.position.set(0,5,5);
        // shadowLight.target.position.set(0,0,0);
        if (this._cast_shadow)
            this.setShadowParams();
    }

    setPosition (x, y, z) {
        shadowLight.position.set(x,y,z).normalize();
    }

    setTargetPosition (x, y, z) {
        shadowLight.target.position.set(x,y,z);
    }

    setShadowParams () {
        shadowLight.shadow.camera.near = this._near;
        shadowLight.shadow.camera.far = this._far;
        shadowLight.shadow.camera.top = this._side;
        shadowLight.shadow.camera.bottom = -this._side;
        shadowLight.shadow.camera.left = this._side;
        shadowLight.shadow.camera.right = -this._side;
        shadowLight.castShadow = this._cast_shadow;
        shadowLight.shadow.mapSize.width = 2048;
        shadowLight.shadow.mapSize.height = 2048;
    }
}