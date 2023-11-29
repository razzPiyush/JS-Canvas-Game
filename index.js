const canvas =document.querySelector("canvas")
const scoreEle =document.querySelector("#score")
const startGameBtn =document.querySelector("#startGameBtn")
const modal =document.querySelector("#modal")
const bigScore =document.querySelector("#bigScore")
const ctx=canvas.getContext("2d")
canvas.width=innerWidth
canvas.height=innerHeight
// ===============Player Class=====================
class Player{
    constructor(x,y,radius,color){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        ctx.fillStyle=this.color
        ctx.fill()
    }
}
// ===============Player Class=====================
// ===============Projectile Class=====================

class Projectile{

    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        ctx.fillStyle=this.color
        ctx.fill()
    }
    update(){
        this.draw()
        this.x+=this.velocity.x
        this.y+=this.velocity.y
    }
}


// ===============Projectile Class=====================
// ===============Enemy Class=====================

class Enemy{

    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.x,this.y,Math.abs(this.radius),0,Math.PI*2,false)
        ctx.fillStyle=this.color
        ctx.fill()
    }
    update(){
        this.draw()
        this.x+=this.velocity.x
        this.y+=this.velocity.y
    }
}


// ===============Enemy Class=====================
// ===============Particle Class=====================
const friction=0.99
class Particle{

    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.alpha=1
    }
    draw(){
        ctx.save()
        ctx.globalAlpha=0.1
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        ctx.fillStyle=this.color
        ctx.fill()
        ctx.restore()
    }
    update(){
        this.draw()
        this.velocity.x*=friction
        this.velocity.y*=friction
        this.x+=this.velocity.x
        this.y+=this.velocity.y
        this.alpha-=0.01
    }
}


// ===============Particle Class=====================
const x=canvas.width/2
const y=canvas.height/2
let player=new Player(x,y,10,"white");
let projectiles=[]
let enemies=[]
let particles=[]

function init(){
 
    player=new Player(x,y,10,"white");
    projectiles=[]
    enemies=[]
    particles=[]
    score=0
    scoreEle.innerHTML=score
    bigScore.innerHTML=score

}


function spawnEnemy(){
    setInterval(()=>{
        const radius=Math.random() *(25)+5
        let x
        let y
        if(Math.random()<0.5){
            x=Math.random()<0.5 ? 0-radius: canvas.width+radius
            y=Math.random()*canvas.height
        }else{
            x=Math.random()*canvas.width
            y=Math.random()<0.5 ? 0-radius: canvas.width+radius
        }
        const color=`hsl(${Math.random()*360},50%,50%)`
        const angle =Math.atan2(canvas.height/2-y,canvas.width/2-x)
        const velocity={
            x:Math.cos(angle), 
            y:Math.sin(angle)
        }
        enemies.push(new Enemy(x,y,radius,color,velocity))
    },1000)
}

let animationId
let score=0;
function animate(){
    animationId= requestAnimationFrame(animate)
    ctx.fillStyle="rgba(0,0,0,0.1)"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    player.draw()
    particles.forEach((particle,idx)=>{
        if(particle.alpha<=0){
            particles.splice(idx,1)
        }else{
            particle.update()
        }
    })
    projectiles.forEach((projectile,projectileIdx)=>{
        projectile.update()
        // remove from edges of screen 
        if(projectile.x+projectile.radius<0 || projectile.x-projectile.radius>canvas.width || projectile.y+projectile.radius<0 || projectile.y-projectile.radius>canvas.height ){
            projectiles.splice(projectileIdx,1)
        }
    })

    enemies.forEach((enemy,index)=>{
        enemy.update()

        const dist=Math.hypot(player.x-enemy.x,player.y-enemy.y)
        //end the game
        if(dist-enemy.radius-player.radius<1){
            cancelAnimationFrame(animationId)
            modal.style.display="flex"
            bigScore.innerHTML=score

        }

        projectiles.forEach((projectile,projectileIdx)=>{
            const dist=Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y)
            // when projectiles touch enemy
            if(dist-enemy.radius-projectile.radius<1){
               
                //create explosions 
                for(let i=0;i<enemy.radius*2;i++){
                    particles.push(new Particle(projectile.x,projectile.y,Math.random()*2,enemy.color,{x:(Math.random()-0.5)*(Math.random()*6),y:(Math.random()-0.5)*(Math.random()*6)}))
                }

                if(enemy.radius-10  >5){
                     //increase score
                    score+=100;
                    scoreEle.innerHTML=score
                    enemy.radius-=10
                    gsap.to(enemy,{
                        radius:enemy.radius-10
                    })
                    setTimeout(()=>{
                        projectiles.splice(projectileIdx,1)
                    },0)
                }else{
                    //remove from scene altogether
                    //increase score
                    score+=250;
                    scoreEle.innerHTML=score
                    setTimeout(()=>{
                        enemies.splice(index,1)
                        projectiles.splice(projectileIdx,1)
                    },0)
            }
            }
        })
    })
}

addEventListener("click",(event)=>{
    const angle =Math.atan2(event.clientY-canvas.height/2,event.clientX-canvas.width/2)
    const velocity={
        x:Math.cos(angle)*5, 
        y:Math.sin(angle)*5
    }
    projectiles.push(
        new Projectile(canvas.width/2,canvas.height/2,5,"white",velocity))
})
startGameBtn.addEventListener("click",()=>{
    init()
    animate()
    spawnEnemy()
    modal.style.display="none"
})
