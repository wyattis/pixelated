class Pixelated{
    constructor(ctx, size, color, thickness){
        this.ctx = ctx;
        this.thickness = thickness;
        this.size = size;
        this.color = color;
        this.isAnimating = false;
        this.numCols = Math.ceil(ctx.canvas.width / size);
        this.numRows = Math.ceil(ctx.canvas.height / size);
        this.pixels = []; // 2d array
        for(let y=0; y<this.numRows; y++){
            let row = [];
            for(let x=0; x<this.numCols; x++){
                row.push({state:0, alpha: 0});
            }
            this.pixels.push(row);
        }
        this.updateSpread = this.updateSpread.bind(this);
    }
    
    spread(spawnPos, speed){
        this.reset();
        this.speed = speed;
        this.isAnimating = true;
        this.spawnPos = {x: Math.floor(spawnPos.x / this.size), y: Math.floor(spawnPos.y / this.size)};
        this.spreadD = this.thickness;
        
        this._requestId = requestAnimationFrame(this.updateSpread);
    }
       
    reset(){
        cancelAnimationFrame(this._requestId);
        for(let row of this.pixels){
            for(let pixel of row){
                pixel.state = 0;
            }
        }
    }
    
    
    updateSpread(timestamp){
        if(this.isAnimating){
            this._requestId = requestAnimationFrame(this.updateSpread);
        } else{
            this.reset();
            return;
        }
        if(!this.lastTimestamp || timestamp - this.lastTimestamp > this.speed){
            this.isAnimating = false;
            let dSqrd;
            let spreadDSqrd = this.spreadD * this.spreadD;
            let minSpreadDSqrd = (this.spreadD - this.thickness) * (this.spreadD - this.thickness);
            for(let y=0; y<this.pixels.length; y++){
                for(let x=0; x<this.pixels[y].length; x++){
                    let pixel = this.pixels[y][x]
                    if(pixel.state === 3){
                        
                    } else if(pixel.state === 2){
                        pixel.alpha -= .1;
                        if(pixel.alpha <= 0)
                            pixel.state = 3;
                    } else {
                        dSqrd = (this.spawnPos.x - x)*(this.spawnPos.x - x) + (this.spawnPos.y - y)*(this.spawnPos.y - y);
                        if(dSqrd < spreadDSqrd && dSqrd >= minSpreadDSqrd){
                            pixel.state = 1;
                            pixel.alpha = Math.round(Math.random() * 2) / 2;
                        } else if(dSqrd <= minSpreadDSqrd){
                            pixel.state = 2;
                            pixel.alpha += .5;
                        }
                    }

                    // Check to see if the animation is complete
                    if(pixel.state !== 3){
                        this.isAnimating = true;
                    }
                }
            }
            this.lastTimestamp = timestamp + (timestamp - this.lastTimestamp) % this.speed;
            this.spreadD ++;
            this.render();
        }
    }
       
    render(){
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for(let y=0; y<this.pixels.length; y++){
            for(let x=0; x<this.pixels[y].length; x++){
                
                if(this.pixels[y][x].state !== 0){
                    this.ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.pixels[y][x].alpha})`;
                    this.ctx.fillRect(x * this.size, y * this.size, this.size, this.size);
                }
                
            }
        }
    }
}

document.querySelectorAll('.pixelated').forEach(function(el){
    let size = el.getBoundingClientRect();
    let canvas = document.createElement('canvas');
    let span = document.createElement('span');
    span.innerHTML = el.innerHTML;
    el.innerHTML = "";
    el.appendChild(canvas);
    el.appendChild(span);
    canvas.width = size.width;
    canvas.height = size.height;
    let ctx = canvas.getContext('2d');
    let c = el.getAttribute('data-color').split(',');
    let pixelSize = parseInt(el.getAttribute('data-size'),10) || 10;
    let waveThickness = parseInt(el.getAttribute('data-thickness'), 10) || 3;
    let color = {};
    color.r = c[0].replace('rgb(','').replace('rgba(','').replace(' ','');
    color.g = c[1].replace(' ', '');
    color.b = c[2].replace(')', '').replace(' ', '');
    let animation = new Pixelated(ctx, pixelSize, color, waveThickness);
    el.addEventListener('click', function(e){
        let rect = canvas.getBoundingClientRect();
        let pos = {x:e.clientX - rect.left, y:e.clientY - rect.top};
        animation.spread(pos, 1000);
    });
    animation.spread({x:canvas.width/2, y:canvas.height/2}, 40);
});
