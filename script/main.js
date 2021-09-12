//размер одной ячейки: 30px
document.addEventListener("DOMContentLoaded", () => {
    "use strict";
    const canvasNext = document.querySelector(".canvas__next"),
        style = document.getElementById("style"),
        start = document.querySelector(".start"),
        score = document.querySelector(".score");


    const toLocal = (nickname, score) => {
        let records = new Map(JSON.parse(localStorage.getItem("records")));
        if(records.has(nickname)){
            if(records.get(nickname) < score){
                records.set(nickname, score);
            }
        } else{
            records.set(nickname, score);
        }
        records = [...records.entries()].sort((a, b) => b[1]-a[1]);
        localStorage.setItem("records", JSON.stringify(records));
        return records;
    }
    const setRecordsTable = (newScore)=>{
        const username = localStorage.getItem('username');
        document.querySelector('.popup__records').style.display = 'flex';
        const records = toLocal(username, newScore);
        const popupItems = document.querySelector('.popup__table-item');
        records.forEach((item, index) => {
            popupItems.insertAdjacentHTML('beforeend', `
                <li class="${item[0] === username ? 'popup__you' : ''}">
                    <div class="popup__name">
                        <span>${index+1}.</span>
                        <h3>${item[0]}</h3>
                    </div>
                    <p class="popup__score">${item[1]}</p>
                </li>
            `);
        });
    };

    class TetrisAudio{
        constructor(){
            this.bg = new Audio('../bgMusic.mp3');
            this.fall = new Audio('../fallen.mp3');
            this.delete = new Audio('../deleteline.mp3');
            this.end = new Audio('../end.mp3');
            this.bg.loop = true;
        }
        playFallen(){
            this.fall.play();
        }
        playEnd(){
            this.end.play();
            this.bg.pause();
        }
        playDelete(){
            this.delete.play();
        }
        playBg(){
            this.bg.play();
        }
    }

    class Drawer{
        constructor(){
            this.tetrisColor = {"1": "rgb(238, 241, 36)", "2": "rgb(36, 166, 241)", "3": "rgb(241, 36, 87)", "4": "rgb(142, 36, 241)","5": "rgb(36, 39, 241)", "6": "rgb(36, 241, 197)", "7": "rgb(36, 241, 80)"},
            this.canvas = document.getElementById('canvas'),
            this.ctx = canvas.getContext("2d");
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 1;
        }
        drawAllFigures(matrixMap){
            let curX = 0, curY = -60;
            this.ctx.moveTo(curX, curY);
            for(let i of matrixMap){
                for(let j of i){
                    if(j > 0){
                        this.ctx.fillStyle = this.tetrisColor[j];
                        this.ctx.fillRect(curX, curY, 30, 30);
                        this.ctx.strokeRect(curX, curY, 30, 30);
                    }
                    curX += 30;
                }
                curY += 30;
                curX = 0;
            }
        }
        drawSingleFigure(x, y, matrix){
            let curX = x, curY = y;
            this.ctx.moveTo(x, y);
            for(let i of matrix){
                for(let j of i){
                    if(j > 0){
                        this.ctx.fillStyle = this.tetrisColor[j];
                        this.ctx.fillRect(curX, curY, 30, 30);
                        this.ctx.strokeRect(curX, curY, 30, 30);
                    }
                    curX += 30;
                }
                curY += 30;
                curX = x;
            }
        }
        clearAll(x = 0, y = 0 , w = 300, h = 600){
            this.ctx.clearRect(x, y, w, h);
        };
    };
    
    
    class Logic{
        constructor(n = 10, m = 20){
            this.drawer = new Drawer();
            this.speed = 25;
            this.audio = new TetrisAudio();
            this.nextIndex = 0;
            this.score = 0;
            this.curX = 4;
            this.curY = 0;
            this.curColor = "#000";
            this.matrixMap = this.createMap(n, m);
            this.curFigure = [];
            this.tetrominos = [
                [
                    [0,0,0,0],
                    [1,1,1,1],
                    [0,0,0,0],
                    [0,0,0,0]
                ],
                [
                    [2,0,0],
                    [2,2,2],
                    [0,0,0],
                ],
                [
                    [0,0,3],
                    [3,3,3],
                    [0,0,0],
                ],
                [
                    [4,4],
                    [4,4],
                ],
                [
                    [0,5,5],
                    [5,5,0],
                    [0,0,0],
                ],
                [
                    [6,6,0],
                    [0,6,6],
                    [0,0,0],
                ],
                [
                    [0,7,0],
                    [7,7,7],
                    [0,0,0],
                ]
            ];
            
        }
        getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
        }
        createMap (n, m){
            const arr = [];
            for(let i = 0; i < m + 2; i++){
                arr.push(new Array(n).fill(0));
            }
            return arr;
        }

        createNext(){
            this.nextIndex = this.getRandomInt(0, 7);
            this.curColor = this.drawer.tetrisColor[this.nextIndex+1];
            canvasNext.className = canvasNext.className.replace(/T\d/, `T${this.nextIndex+1}`);
            style.textContent = `
                .block{
                    background: ${this.curColor};
                }
            `;
        }

        setScore(counter){   
            switch(counter){
                case 0:
                    this.score+=0
                    break;
                case 1:
                    this.score+=100
                    break;
                case 2:
                    this.score+=300
                    break;
                case 3:
                    this.score+=700
                    break;
                case 4:
                    this.score+=1500
                    break;
            }
            if(this.score >= 1500){
                this.speed = 7;
            } else if(this.score >= 1000){
                this.speed = 10;
            }else if(this.score >= 500){
                this.speed = 15;
            } else if(this.score >= 300){
                this.speed = 20;
            }
            score.textContent = this.score;
        }

        deleteRow(index){
            for(let i = index; i >= 2; i--){
                this.matrixMap[i] = [...this.matrixMap[i-1]];
            }
        }

        checkLine(){
            let counter = 0;
            this.matrixMap.forEach((item, index)=>{
                if(item.every((item)=> item > 0)){
                    this.deleteRow(index);
                    counter++;
                }
            });
            if(counter > 0){
                this.audio.playDelete();
            }
            this.drawer.clearAll();
            this.drawer.drawAllFigures(this.matrixMap);
            this.setScore(counter);
        }
        controll(){
            document.addEventListener('keydown', e => {
                switch (e.key){
                    case "ArrowUp":
                        e.preventDefault();
                        const prevForm = this.curFigure;
                        this.rotate();
                        if(!this.isValidMove()){
                            this.curFigure = prevForm;
                        }
                        break;
                    case "ArrowDown":
                        e.preventDefault();
                        this.pushDown();
                        break;
                    case "ArrowLeft":
                        e.preventDefault();
                        this.curX--;
                        if(!this.isValidMove()){
                            this.curX++;
                        }
                        break;
                    case "ArrowRight":
                        e.preventDefault();
                        this.curX++;
                        if(!this.isValidMove()){
                            this.curX--;
                        }
                        break;
                };
            });
        }
        rotate(){
            const N = this.curFigure.length - 1;
            this.curFigure = this.curFigure.map((row, i) =>
                row.map((val, j) => this.curFigure[N - j][i])
            );
        }
        pushDown(){
            for(let i = this.curY; i < this.matrixMap.length; i++){
                this.curY++;
                if(!this.isValidMove()){
                    this.curY--;
                    return;
                }
            }
        }
        isValidMove(){
            for(let i = 0; i < this.curFigure.length; i++){
                for(let j = 0; j < this.curFigure[i].length; j++){
                    if(!this.curFigure[i][j] || 
                        (this.curX + j >= 0 && this.curX + j < this.matrixMap[0].length) &&
                        (this.curY + i <= this.matrixMap.length) && (this.matrixMap[this.curY + i] && !this.matrixMap[this.curY + i][this.curX + j])){
                            continue;
                        }
                    else{
                        return false;
                    }
                }
            }
            return true;
        }

        setFigure(color){
            this.drawer.clearAll();
            this.drawer.drawAllFigures(this.matrixMap);
            this.drawer.drawSingleFigure(this.curX * 30, (this.curY-2) * 30, this.curFigure, color);
        }

        start(){
            if(!confirm("Выключить звук игры?"))
                this.audio.playBg();
            let curSpeed = 0;
            let animateId;
            this.createNext();
            let color = this.curColor;
            this.curFigure = this.tetrominos[this.nextIndex];
            this.createNext();
            const animate = () => {
                animateId = requestAnimationFrame(animate);
                if(curSpeed++ >= this.speed){
                    this.setFigure(color);
                    curSpeed = 0;
                    this.curY++;
                    if(!this.isValidMove()){
                        this.audio.playFallen();
                        this.curY--;
                        for(let i = 0; i < this.curFigure.length; i++){
                            for(let j = 0; j < this.curFigure[i].length; j++){
                                if(this.curFigure[i][j] > 0){
                                    this.matrixMap[i + this.curY][j + this.curX] = this.curFigure[i][j];
                                }
                            }
                        }
                        this.checkLine();
                        if(this.curY <= 1){
                            cancelAnimationFrame(animateId);
                            this.audio.playEnd();
                            setRecordsTable(this.score);
                            return;
                        }
                        this.curFigure = this.tetrominos[this.nextIndex];
                        this.curY = 0;
                        this.curX = 4;
                        color = this.curColor;
                        this.createNext();
                    }
                }
            }
            animateId = requestAnimationFrame(animate);  
        }
    };

    let logic;
    start.addEventListener('click', () => {
        logic = new Logic();
        logic.controll();
        logic.start();
    });

    document.querySelector('.nickname').textContent = localStorage.getItem('username');
});
