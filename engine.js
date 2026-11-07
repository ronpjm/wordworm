(function(root){
const DIRS={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
class WormGame {
 constructor(random=Math.random){this.random=random;this.cols=30;this.rows=20;this.reset()}
 reset(){this.snake=Array.from({length:5},(_,i)=>({x:8-i,y:10}));this.dir=DIRS.right;this.queued=null;this.score=0;this.combo=0;this.lives=3;this.correct=0;this.elapsed=0;this.state='ready';this.apple={x:14,y:10};this.bombs=[];this.boss={status:'waiting',remaining:120,correct:0,target:5,threshold:1000};this.result=null;this.placeBombs(4)}
 same(a,b){return a.x===b.x&&a.y===b.y}
 free(){const cells=[];for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){const p={x,y};if(!this.snake.some(s=>this.same(s,p))&&!this.bombs.some(s=>this.same(s,p))&&(!this.apple||!this.same(this.apple,p)))cells.push(p)}return cells.length?cells[Math.floor(this.random()*cells.length)]:null}
 placeApple(){this.apple=null;if(this.boss?.status==='active'){const h=this.snake[0],cells=[];for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){const p={x,y},distance=Math.abs(x-h.x)+Math.abs(y-h.y);if(distance>=3&&distance<=7&&!this.snake.some(s=>this.same(s,p))&&!this.bombs.some(s=>this.same(s,p)))cells.push(p)}this.apple=cells.length?cells[Math.floor(this.random()*cells.length)]:this.free()}else this.apple=this.free()}
 beginBoss(){if(this.state!=='bossIntro')return;this.boss.status='active';this.state='playing';this.placeApple()}
 tick(seconds){const dt=Math.max(0,Number(seconds)||0);if(this.state==='playing')this.elapsed+=dt;if(this.boss.status==='active'&&['playing','quiz'].includes(this.state)){this.boss.remaining=Math.max(0,this.boss.remaining-dt);if(this.boss.remaining===0){this.state='over';this.result='timeout';this.boss.status='failed';return {timeout:true}}}return {}}
 placeBombs(n){while(this.bombs.length<n){const p=this.free();if(!p)break;this.bombs.push(p)}}
 turn(name){const d=DIRS[name];if(!d||this.queued||this.state!=='playing')return false;if(d.x===-this.dir.x&&d.y===-this.dir.y)return false;this.queued=d;return true}
 get interval(){return Math.max(85,230-this.elapsed*1.2)}
 get speed(){return 230/this.interval}
 step(){if(this.state!=='playing')return {};if(this.queued){this.dir=this.queued;this.queued=null}let h=this.snake[0],next={x:h.x+this.dir.x,y:h.y+this.dir.y};let wall=false;
 if(next.x<0||next.x>=this.cols||next.y<0||next.y>=this.rows){const a={x:-this.dir.y,y:this.dir.x},b={x:this.dir.y,y:-this.dir.x};const options=this.random()<.5?[a,b]:[b,a];this.dir=options.find(d=>h.x+d.x>=0&&h.x+d.x<this.cols&&h.y+d.y>=0&&h.y+d.y<this.rows);next={x:h.x+this.dir.x,y:h.y+this.dir.y};wall=true}
 // 몸통은 자유롭게 통과합니다. 목숨은 퀴즈 오답과 폭탄으로만 줄어요.
 this.snake.unshift(next);this.snake.pop();const bombIndex=this.bombs.findIndex(p=>this.same(p,next));if(bombIndex>=0){this.bombs.splice(bombIndex,1);this.lives--;this.combo=0;const tails=this.snake.length-1;this.snake.splice(Math.max(1,this.snake.length-Math.ceil(tails/3)));this.placeBombs(4);if(this.lives<=0)this.state='over';return {bomb:true,wall}}
 if(this.apple&&this.same(next,this.apple)){this.state='quiz';return {apple:true,wall}}return {wall}}
 answer(ok){if(this.state!=='quiz')return 0;let points=0;if(ok){this.combo++;points=100+(this.combo-1)*25;this.score+=points;this.correct++;this.snake.push({...this.snake[this.snake.length-1]});if(this.boss.status==='active')this.boss.correct++}else{this.lives--;this.combo=0}this.placeApple();this.state=this.lives>0?'playing':'over';if(!this.apple)this.state='over';if(this.state!=='over'&&this.boss.status==='active'&&this.boss.correct>=this.boss.target){this.boss.status='cleared';this.state='won';this.result='victory'}else if(this.state!=='over'&&this.boss.status==='waiting'&&this.score>=this.boss.threshold){this.boss.status='intro';this.state='bossIntro'}return points}
}
root.WormGame=WormGame;if(typeof module!=='undefined')module.exports=WormGame;
})(typeof globalThis!=='undefined'?globalThis:window);
