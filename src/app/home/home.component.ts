import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '@/_models';
import { AuthenticationService, GameService } from '@/_services';

@Component({ 
    templateUrl: 'home.component.html',
    //styleUrls: ['./home.component.css']
 })
export class HomeComponent implements OnInit {
    currentUser: User;
    showGame = false;

    playerHealth = 100;
    monsterHealth = 100;
    loading = false;

    playerPerformingAction = false;
    monsterPerformingAction = false;

    gameTime = 60;

    gameTimer = null;
    gameTimerString = '';

    nextPlayerTurnTimer = null;
    nextMonsterTurnTimer = null;

    gameSessionObj = null;
    isGameFinished = false;

    currentPlayerAction = 0;
    currentMonsterAction = 0;

    gameConfig = {};

    gameLogs = [];

    monsterActionsTypes = ['attack','blast','heal'];
    playerActionsTypes = ['attack','blast','heal','giveUp'];

    finishStatuses = ['completed','given_up'];

    constructor(
        private authenticationService: AuthenticationService,
        private gameService: GameService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    ngOnInit() {
        this.getActiveSession();
    }
    
    startTimer(){
        const thisRef = this;
        if(this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        this.gameTimer = setInterval(()=>{
            if(thisRef.gameTime >= 1) {
                thisRef.gameTime = thisRef.gameTime - 1;
                thisRef.gameTimerString = thisRef.getTimerString(thisRef.gameTime);
            } else {
                thisRef.isGameFinished = true;
                clearInterval(thisRef.gameTimer);
                if(thisRef.nextMonsterTurnTimer) {
                    clearInterval(thisRef.nextMonsterTurnTimer);
                }
                thisRef.currentMonsterAction = 0;
            }
        }, 1000);
    }

    startGame() {
        this.loading = true;
        this.gameService.start()
            .pipe(first())
            .subscribe((data: any) => {
                //alert('dd')
                this.loading = false;
                if(!data.error) {
                    //alert('remainingSeconds');
                    this.gameSessionObj = data.gameSessionData;
                    let gameLogData = data.gameSessionLogData;
                    gameLogData['logMessage'] = this.getLogMessage(gameLogData);
                    this.gameLogs = [gameLogData].concat(this.gameLogs);
                    this.gameLogs.length = 10;
                    this.resumeGame(this.gameSessionObj);
                }
            });
    }

    getTimerString(timerSeconds) {
        let hours = parseInt((timerSeconds/3600)+'');
        let minutes = parseInt(((timerSeconds%3600)/60)+'');
        let seconds = parseInt(((timerSeconds%60))+'');
        return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    resumeGame(gameSessionData) {
        this.gameSessionObj = gameSessionData;
        let remainingSeconds = 60 - (+((new Date()).getTime()/1000) - +(this.gameSessionObj['game_start_timestamp'] || 0));
        if(remainingSeconds > 0) {
            this.gameTime = parseInt(remainingSeconds+'');
            this.showGame = true;
            this.startTimer();
        } else {
            this.showGame = false;
        }
        this.playerHealth = +this.gameSessionObj['player_current_health'];
        this.monsterHealth = +this.gameSessionObj['monster_current_health'];

        let nextAction = this.monsterActionsTypes[parseInt((Math.random()*this.monsterActionsTypes.length)+'')];
        this.monsterAttack(nextAction);
    }


    private getActiveSession() {
        this.loading = true;
        this.gameService.getActiveSession()
            .pipe(first())
            .subscribe((data: any) => {
                //alert('dd')
                this.loading = false;
                if(!data.error) {
                    this.gameSessionObj = data.gameSessionData;
                    this.gameConfig = JSON.parse(this.gameSessionObj ? (this.gameSessionObj['game_config'] || '{}') : '{}');
                    this.gameLogs = data.gameLogsData.map((gameLog)=>{
                        let gameLogData = gameLog.GameLog;
                        gameLogData['logMessage'] = this.getLogMessage(gameLogData);
                        return gameLogData;
                    });
                    this.gameLogs.length = 10;
                    this.resumeGame(this.gameSessionObj);
                }
            });
    }

    playerAction(action){
        if(!this.playerPerformingAction) {
            this.playerPerformingAction = true;
            this.currentPlayerAction = this.playerActionsTypes.indexOf(action)+1;
            //this.monsterHealth -= +this.gameSessionObj['next_attack_value_for_player'];
            //this.monsterHealth = this.monsterHealth < 0 ? 0 : this.monsterHealth;
            this.gameService[action]('player')
                .pipe(first())
                .subscribe((data: any) => {
                    //alert('dd')
                    if(!data.error) {
                        this.gameSessionObj = data.gameSessionData;
                        if(action === 'heal') {
                            this.playerHealth = +this.gameSessionObj['player_current_health'];
                        } else {
                            this.monsterHealth = +this.gameSessionObj['monster_current_health'];
                        }
                        let gameLogData = data.gameSessionLogData;
                        gameLogData['logMessage'] = this.getLogMessage(gameLogData);
                        this.gameLogs = [gameLogData].concat(this.gameLogs);
                        this.gameLogs.length = 10;
                    }

                    if(this.gameSessionObj) {
                        if(this.finishStatuses.indexOf(this.gameSessionObj.game_status) !== -1) {
                            this.isGameFinished = true;
                        }
                    }

                    this.playerPerformingAction = false;
                    this.currentPlayerAction = 0;
                });
        }
    }

    monsterAttack(action){
        if(!this.monsterPerformingAction && !this.isGameFinished) {
            this.monsterPerformingAction = true;
            this.currentMonsterAction = this.monsterActionsTypes.indexOf(action) + 1;
            //this.playerHealth -= +this.gameSessionObj['next_attack_value_for_monster'];
            //this.playerHealth = this.playerHealth < 0 ? 0 : this.playerHealth;

            this.gameService[action]('monster')
                .pipe(first())
                .subscribe((data: any) => {
                    //alert('dd')
                    if(!data.error) {
                        this.gameSessionObj = data.gameSessionData;
                        if(action === 'heal') {
                            this.monsterHealth = +this.gameSessionObj['monster_current_health'];
                        } else {
                            this.playerHealth = +this.gameSessionObj['player_current_health'];
                        }
                        let gameLogData = data.gameSessionLogData;
                        gameLogData['logMessage'] = this.getLogMessage(gameLogData);
                        this.gameLogs = [gameLogData].concat(this.gameLogs);
                        this.gameLogs.length = 10;
                    }

                    if(this.gameSessionObj) {
                        if(this.finishStatuses.indexOf(this.gameSessionObj.game_status) !== -1) {
                            this.isGameFinished = true;
                        }
                    }

                    const thisRef = this;
                    
                    this.gameConfig = JSON.parse(this.gameSessionObj ? (this.gameSessionObj['game_config'] || '{}') : '{}');
                    const minIntervalForNextTurn = this.gameConfig['min_interval_for_next_turn'] || 0;

                    if(thisRef.nextMonsterTurnTimer) {
                        clearInterval(thisRef.nextMonsterTurnTimer);
                    }

                    thisRef.nextMonsterTurnTimer = setTimeout(()=>{
                        thisRef.monsterPerformingAction = false;
                        thisRef.currentMonsterAction = 0;
                        let nextActionIndex = parseInt((Math.random()*thisRef.monsterActionsTypes.length)+'');
                        if(thisRef.gameConfig['max_blast_count'] - thisRef.gameSessionObj['player_current_blast_count'] <= 0 && nextActionIndex === 1) {
                            nextActionIndex = 0;
                        }
                        if(thisRef.gameConfig['max_heal_count'] - thisRef.gameSessionObj['player_current_heal_count'] <= 0 && nextActionIndex === 2) {
                            nextActionIndex = 0;
                        }
                        let nextAction = thisRef.monsterActionsTypes[nextActionIndex];
                        thisRef.monsterAttack(nextAction);
                    }, (+minIntervalForNextTurn)*1000);
                });
        }
    }

    restartGame(){
        this.resetGame();
        this.startGame();
    }

    resetGame(){
        this.showGame = false;

        this.playerHealth = 100;
        this.monsterHealth = 100;
        this.loading = false;
    
        this.playerPerformingAction = false;
        this.monsterPerformingAction = false;
    
        this.gameTime = 60;
    
        this.gameTimer = null;
        this.gameTimerString = '';
    
        this.nextPlayerTurnTimer = null;
        this.nextMonsterTurnTimer = null;
    
        this.gameSessionObj = null;
        this.isGameFinished = false;
    
        this.currentPlayerAction = 0;
        this.currentMonsterAction = 0;
    
        this.gameConfig = {};

        this.gameLogs = [];
    }
    getResultMessage(){
        if(this.gameSessionObj.game_winner_type === 'player'){
            return 'You win the game!';
        } else if(this.gameSessionObj.game_winner_type === 'monster'){
            return 'You loose the game!';
        } else if(this.playerHealth < this.monsterHealth) {
            return 'You loose the game!';
        } else if(this.playerHealth > this.monsterHealth) {
            return 'You win the game!';
        } else {
            return 'Game draw!';
        }
    }

    getLogMessage(gameLog){
        const operation_type = gameLog['operation_type'];
        let operation_by = gameLog['operation_by'];
        operation_by = operation_by === 'monster' ? 'Monster' : 'You';
        
        let operation_value = gameLog['operation_value'];

        let message = '';
         
        if(operation_type === 'game_started'){
            message = 'You started game';
        }
        if(operation_type === 'game_ended'){
            message = 'Game ended';
        }
        if(operation_type === 'attack'){
            message = operation_by + ' attacked with a value of '+operation_value;
        }
        if(operation_type === 'blast'){
            message = operation_by + ' attacked with a power blast of value of '+operation_value;
        }
        if(operation_type === 'heal'){
            message = operation_by + ' healed with a value of '+operation_value;
        }
        if(operation_type === 'given_up'){
            message = operation_by + ' gave up as the monster was too strong';
        }
        if(operation_type === 'completed'){
            message = 'Game completed';
        }
        message += ' | Your Health: '+gameLog['player_health']+' | Monster Health: '+gameLog['monster_health'];
        return message;
    }
}