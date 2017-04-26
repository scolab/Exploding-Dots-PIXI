import {PowerZone} from './Canvas.PIXI.PowerZone';
import {ParticleEmitter} from './ParticleEmitter';
import { TweenMax, Quint, Linear} from "gsap";
import {isPointInRectangle, randomFromTo, convertBase, findQuadrant} from '../../utils/MathUtils'
import {BASE, USAGE_MODE, OPERATOR_MODE, POSITION_INFO, BOX_INFO, SPRITE_COLOR, ERROR_MESSAGE} from '../../Constants'
import {DividerZoneManager} from './DividerZoneManager';
import {Point} from 'pixi.js';
import {SoundManager} from '../../utils/SoundManager';
import explodeJSON from './dot_explode.json';
import implodeJSON from './dot_implode.json';
import redDragJSON from './dot_drag_red.json';
import blueDragJSON from './dot_drag_blue.json';

export class PowerZoneManager extends PIXI.Container{

    constructor(addDot, removeDot, addMultipleDots, removeMultipleDots, rezoneDot, displayUserMessage, soundManager, wantedResult){
        super();
        this.addDot = addDot;
        this.removeDot = removeDot;
        this.addMultipleDots = addMultipleDots;
        this.removeMultipleDots = removeMultipleDots;
        this.rezoneDot = rezoneDot;
        this.displayUserMessage = displayUserMessage;
        this.movingDotsContainer = new PIXI.Container();
        this.dividerZoneManager = null;
        this.soundManager = soundManager;
        // reverse all the wanted result so they are in the same order as our zone.
        wantedResult.positiveDots.reverse();
        wantedResult.negativeDots.reverse();
        wantedResult.positiveDivider.reverse();
        wantedResult.negativeDivider.reverse();
        this.wantedResult = wantedResult;
    }

    init(textures, spritePool, base, usage_mode, operator_mode, totalZoneCount, placeValueOn, negativePresent){
        this.textures = textures;
        this.spritePool = spritePool;
        this.base = base;
        this.usage_mode = usage_mode;
        this.operator_mode = operator_mode;
        this.totalZoneCount = totalZoneCount;
        this.placeValueOn = placeValueOn;
        this.negativePresent = negativePresent;
        this.allZones = [];
        this.isInteractive = usage_mode === USAGE_MODE.FREEPLAY ? true : false;
        this.pendingAction = [];
        this.explodeEmitter = [];
        this.implodeEmitter = [];
        this.dragParticleEmitterRed = null;
        this.dragParticleEmitterBlue = null;
        this.leftMostZone = null;
        window.addEventListener('keyup', this.traceValue.bind(this));
    }

    traceValue(e){
        if ((e.keyCode || e.which) == 32) {
            let dotCount = [];
            let childCount = [];
            this.allZones.forEach(zone => {
                dotCount.push(Object.keys(zone.positiveDots).length);
                childCount.push(zone.positiveDotsContainer.children.length);
            });
            console.log(dotCount, childCount, this.movingDotsContainer.children.length);
        }
        console.log()
    }

    createZones() {
        for(let i = this.totalZoneCount - 1; i >= 0; i--){
            let powerZone = new PowerZone(i,
                this.textures,
                this.base,
                this.negativePresent,
                this.usage_mode,
                this.operator_mode,
                this.totalZoneCount,
                this.spritePool
            );
            this.addChild(powerZone);
            this.allZones.push(powerZone);
            powerZone.eventEmitter.on(PowerZone.CREATE_DOT, this.createDot, this);
            powerZone.eventEmitter.on(PowerZone.DIVIDER_OVERLOAD, this.balanceDivider, this);
            powerZone.setValueTextAlpha(this.placeValueOn ? 1 : 0);
        }
        this.setZoneTextAndAlphaStatus();
        this.dragParticleEmitterRed = new ParticleEmitter(this.movingDotsContainer, this.textures["red_dot.png"], redDragJSON);
        this.dragParticleEmitterBlue = new ParticleEmitter(this.movingDotsContainer, this.textures["blue_dot.png"], blueDragJSON);
        this.addChild(this.movingDotsContainer);
        if(this.operator_mode === OPERATOR_MODE.DIVIDE){
            this.dividerZoneManager = new DividerZoneManager();
            this.dividerZoneManager.init(this.textures);
            this.dividerZoneManager.eventEmitter.on(DividerZoneManager.START_DRAG, this.precalculateForDivision, this);
            this.dividerZoneManager.eventEmitter.on(DividerZoneManager.MOVED, this.checkIfDivisionPossible, this);
            this.dividerZoneManager.eventEmitter.on(DividerZoneManager.END_DRAG, this.checkIfDivisionPossible, this);
        }
    }

    createLeftmostTestZone(){
        this.leftMostZone = new PIXI.Container();
        this.leftMostZone.x = 0;
        this.leftMostZone.y = BOX_INFO.BOX_Y;
        this.addChild(this.leftMostZone);
        this.leftMostZone.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.LEFT_GUTTER, BOX_INFO.BOX_HEIGHT);
    }

    start(){
        requestAnimationFrame(this.animationCallback.bind(this));
    }

    precalculateForDivision(){
        this.allZones.forEach(zone => {
            zone.precalculateDotsForDivision();
        });
    }

    checkIfDivisionPossible(data, allZonesValue, isDragEnd = false){
        //console.log('checkIfDivisionPossible', allZonesValue);
        if(this.isInteractive) {
            let zoneOverInfo = this.getZoneUnderCursor(data);
            let droppedOnPowerZone = zoneOverInfo.droppedOnPowerZone;
            let droppedOnPowerZoneIndex = zoneOverInfo.droppedOnPowerZoneIndex;

            this.allZones.forEach(zone => {
                zone.setBackgroundColor(PowerZone.BG_NEUTRAL);
            });

            if (droppedOnPowerZoneIndex != -1) {
                //console.log(droppedOnPowerZoneIndex, allZonesValue.length, this.totalZoneCount);
                if (this.totalZoneCount - droppedOnPowerZoneIndex >= allZonesValue.length == false) {
                    if (isDragEnd === false) {
                        droppedOnPowerZone.parent.setBackgroundColor(PowerZone.BG_RED);
                        for (let i = 0; i < allZonesValue.length; i++) {
                            if (this.allZones[droppedOnPowerZoneIndex + i] !== undefined) {
                                this.allZones[droppedOnPowerZoneIndex + i].setBackgroundColor(PowerZone.BG_RED);
                            }
                        }
                    } else {
                        droppedOnPowerZone.parent.setBackgroundColor(PowerZone.BG_NEUTRAL);
                    }
                } else {
                    let success = false;
                    let antiSuccess = false;
                    for (let i = 0; i < allZonesValue.length; i++) {
                        if (allZonesValue[i][0] <= this.allZones[droppedOnPowerZoneIndex + i].positiveDotCount &&
                            allZonesValue[i][1] <= this.allZones[droppedOnPowerZoneIndex + i].negativeDotCount) {
                            success = true;
                        } else {
                            success = false;
                            if (allZonesValue[i][1] <= this.allZones[droppedOnPowerZoneIndex + i].positiveDotCount &&
                                allZonesValue[i][0] <= this.allZones[droppedOnPowerZoneIndex + i].negativeDotCount) {
                                antiSuccess = true;
                            } else {
                                antiSuccess = false;
                            }
                        }
                        if (success === false && antiSuccess === false) {
                            break;
                        }
                    }

                    for (let i = 0; i < allZonesValue.length; i++) {
                        if ((success || antiSuccess) && isDragEnd === false) {
                            this.allZones[droppedOnPowerZoneIndex + i].setBackgroundColor(PowerZone.BG_GREEN);
                        } else {
                            if (this.allZones[droppedOnPowerZoneIndex + i] !== undefined) {
                                this.allZones[droppedOnPowerZoneIndex + i].setBackgroundColor(PowerZone.BG_RED);
                            }
                        }
                    }
                    if (isDragEnd === true) {
                        // apply division
                        this.allZones.forEach(zone => {
                            zone.setBackgroundColor(PowerZone.BG_NEUTRAL);
                        });
                        if (success || antiSuccess) {
                            this.soundManager.playSound(SoundManager.DIVISION_SUCCESS);
                            let dotsRemovedByZone = [];
                            for (let i = 0; i < this.totalZoneCount; i++) {
                                dotsRemovedByZone.push([]);
                            }
                            let dotsToMove = [];
                            let moveToZone = droppedOnPowerZoneIndex;// - allZonesValue.length + 1;
                            for (let i = 0; i < allZonesValue.length; i++) {
                                let thisZoneDots = [];
                                if (success) {
                                    thisZoneDots = thisZoneDots.concat(this.allZones[droppedOnPowerZoneIndex + i].getDotsForDivision(allZonesValue[i][0], true));
                                    thisZoneDots = thisZoneDots.concat(this.allZones[droppedOnPowerZoneIndex + i].getDotsForDivision(allZonesValue[i][1], false));
                                } else if (antiSuccess) {
                                    thisZoneDots = thisZoneDots.concat(this.allZones[droppedOnPowerZoneIndex + i].getDotsForDivision(allZonesValue[i][0], false));
                                    thisZoneDots = thisZoneDots.concat(this.allZones[droppedOnPowerZoneIndex + i].getDotsForDivision(allZonesValue[i][1], true));
                                }
                                dotsToMove = dotsToMove.concat(thisZoneDots);
                                dotsRemovedByZone[droppedOnPowerZoneIndex + i] = dotsRemovedByZone[droppedOnPowerZoneIndex + i].concat(thisZoneDots);
                            }
                            if (dotsToMove.length > 0) {
                                dotsToMove.forEach(dot => {
                                    let newPosition = dot.sprite.parent.toGlobal(dot.sprite.position);
                                    newPosition = this.movingDotsContainer.toLocal(newPosition);
                                    let movingSprite = this.spritePool.getOne(dot.color, dot.isPositive);
                                    movingSprite.anchor.set(0.5);
                                    movingSprite.position.x = newPosition.x;
                                    movingSprite.position.y = newPosition.y;
                                    this.movingDotsContainer.addChild(movingSprite);
                                    dot.sprite.alpha = 0;
                                    let finalPosition;
                                    if (success) {
                                        finalPosition = this.allZones[moveToZone].toGlobal(this.allZones[moveToZone].positiveDivideCounter.position);
                                    } else if (antiSuccess) {
                                        finalPosition = this.allZones[moveToZone].toGlobal(this.allZones[moveToZone].negativeDivideCounter.position);
                                    }
                                    finalPosition = this.movingDotsContainer.toLocal(finalPosition);
                                    TweenMax.to(movingSprite.scale, 0.1, {
                                        x: 1.5,
                                        y: 1.5,
                                        yoyo: true,
                                        repeat: 3,
                                        ease: Linear.easeNone
                                    });
                                    TweenMax.to(movingSprite, 0.2, {
                                        x: finalPosition.x + 15,
                                        y: finalPosition.y + (success ? 15 : 25),
                                        ease: Quint.easeOut,
                                        delay: .4,
                                        onComplete: this.removeDotsAfterTween.bind(this),
                                        onCompleteParams: [movingSprite]
                                    })
                                });
                                TweenMax.delayedCall(.6, this.processDivisionAfterTween.bind(this), [dotsRemovedByZone, moveToZone, success]);
                            }
                        }else{
                            this.soundManager.playSound(SoundManager.DIVISION_IMPOSSIBLE);
                        }
                    }
                }
            }else if (isDragEnd === true) {
                this.soundManager.playSound(SoundManager.DIVISION_BACKINTOPLACE);
            }
        }
    }

    removeDotsAfterTween(sprite) {
        sprite.destroy();
    }

    processDivisionAfterTween(dotsRemovedByZone, moveToZone, isPositive){
        for (let i = 0; i < dotsRemovedByZone.length; i++) {
            if (dotsRemovedByZone[i].length > 0) {
                this.removeMultipleDots(i, dotsRemovedByZone[i], false);
            }
        }
        this.allZones[moveToZone].addDivisionValue(isPositive);
    }

    balanceDivider(zonePos, isPositive){
        this.isInteractive = false;
        let newPosition;
        let finalPosition;
        let allMovingDots = [];
        if(isPositive) {
            // TODO this is impossible for the last box
            newPosition = this.allZones[zonePos].toGlobal(this.allZones[zonePos].positiveDivideCounter.position);
            finalPosition = this.allZones[zonePos + 1].toGlobal(this.allZones[zonePos + 1].positiveDivideCounter.position);
            for(let i = 0; i < this.base[1]; i++) {
                allMovingDots.push(new PIXI.Sprite(this.textures['grouped_dot.png']));
            }
        }else{
            newPosition = this.allZones[zonePos].toGlobal(this.allZones[zonePos].negativeDivideCounter.position);
            finalPosition = this.allZones[zonePos + 1].toGlobal(this.allZones[zonePos + 1].negativeDivideCounter.position);
            for(let i = 0; i < this.base[1]; i++) {
                allMovingDots.push(new PIXI.Sprite(this.textures['grouped_antidot.png']));
            }
        }
        newPosition = this.movingDotsContainer.toLocal(newPosition);
        finalPosition = this.movingDotsContainer.toLocal(finalPosition);
        let delay = 0;
        allMovingDots.forEach(sprite => {
            sprite.anchor.set(0.5);
            sprite.position.x = newPosition.x + 15;
            sprite.position.y = newPosition.y + 15;
            this.movingDotsContainer.addChild(sprite);
            TweenMax.to(sprite, 0.5, {
                x: finalPosition.x + 15,
                y: finalPosition.y + 15,
                ease:Quint.easeOut,
                delay: delay,
                onComplete:this.removeDotsAfterTween.bind(this),
                onCompleteParams: [sprite],
            });
            delay += 0.1;
        });
        this.soundManager.playSound(SoundManager.DIVISION_OVERLOAD);
        TweenMax.delayedCall(delay + 0.5, this.setDividerValueAfterBalance, [zonePos, isPositive], this);
    }

    setDividerValueAfterBalance(zonePos, isPositive){
        //console.log(zonePos, this.allZones[zonePos]);
        this.allZones[zonePos].onDividerOverloadSolved(isPositive);
        this.allZones[zonePos + 1].onDividerAutoPopulated(isPositive);
        this.isInteractive = true;
    }

    createDot(target, position, color){
        //console.log(target.powerZone);
        if(this.isInteractive) {
            if (this.usage_mode === USAGE_MODE.OPERATION && this.operator_mode === OPERATOR_MODE.DIVIDE && this.base[1] === BASE.BASE_X) {
                // Add a opposite value dot in the same zone for division in base X
                this.soundManager.playSound(SoundManager.ADD_DIVISION_DOT);
                if(target.isPositive){
                    this.addDot(target.powerZone, position, target.isPositive, color);
                    let dotPos = [
                        randomFromTo(POSITION_INFO.DOT_RAYON, target.parent.negativeDotsContainer.hitArea.width - POSITION_INFO.DOT_RAYON),
                        randomFromTo(POSITION_INFO.DOT_RAYON, target.parent.negativeDotsContainer.hitArea.height - POSITION_INFO.DOT_RAYON)
                    ];
                    this.addDot(target.powerZone, dotPos, !target.isPositive, color);
                }else {
                    this.addDot(target.powerZone, position, target.isPositive, color);
                    let dotPos = [
                        randomFromTo(POSITION_INFO.DOT_RAYON, target.parent.positiveDotsContainer.hitArea.width - POSITION_INFO.DOT_RAYON),
                        randomFromTo(POSITION_INFO.DOT_RAYON, target.parent.positiveDotsContainer.hitArea.height - POSITION_INFO.DOT_RAYON)
                    ];
                    this.addDot(target.powerZone, dotPos, !target.isPositive, color);
                }
            }else {
                //console.log('here', target.powerZone, position, target.isPositive, color);
                this.soundManager.playSound(SoundManager.ADD_DOT);
                this.addDot(target.powerZone, position, target.isPositive, color);
            }
        }
    }

    setZoneTextAndAlphaStatus(){
        // Don't display leading zeroes
        let zoneIsEmpty = true;
        for(let i = this.totalZoneCount - 1; i >=0; i--){
            zoneIsEmpty = this.allZones[i].checkTextAndAlpha(zoneIsEmpty);
        }
        zoneIsEmpty = true;
        if(this.operator_mode === OPERATOR_MODE.DIVIDE){
            for(let i = this.totalZoneCount - 1; i >=0; i--){
                zoneIsEmpty = this.allZones[i].checkDivideResultText(zoneIsEmpty);
            }
        }
    }

    inititalPopulate(dots, isPositive){
        dots.forEach((zoneArray) => {
            Object.keys(zoneArray).forEach(key => {
                let dotSprite = this.allZones[zoneArray[key].powerZone].addDot(zoneArray[key]);
                if(dotSprite) {
                    this.addDotSpriteProperty(zoneArray[key], dotSprite);
                    if(isPositive){
                        this.allZones[zoneArray[key].powerZone].positiveProximityManager.addItem(dotSprite);
                    }else{
                        this.allZones[zoneArray[key].powerZone].negativeProximityManager.addItem(dotSprite);
                    }
                }
            });
        });
    }

    addDotSpriteProperty(dot, dotSprite){
        dotSprite.anchor.set(0.5);
        dotSprite.x = dot.x;
        dotSprite.y = dot.y;
        dotSprite.interactive = true;
        dotSprite.buttonMode = true;
        dotSprite.world = this;
        dotSprite.on('pointerdown', this.onDragStart);
        dotSprite.on('pointerup', this.onDragEnd);
        dotSprite.on('pointerupoutside', this.onDragEnd);
        dotSprite.on('pointermove', this.onDragMove);
        dotSprite.alpha = 0;
        TweenMax.to(dotSprite, 1, {alpha: 1});
    }

    removeDotSpriteListeners(sprite){
        sprite.off('pointerdown', this.onDragStart);
        sprite.off('pointerup', this.onDragEnd);
        sprite.off('pointerupoutside', this.onDragEnd);
        sprite.off('pointermove', this.onDragMove);
        this.allZones[sprite.dot.powerZone].removeFromProximityManager(sprite);
    }

    onDragStart(e){
        //console.log('onDragStart', this.dot.isPositive);
        if(this.world.isInteractive) {
            let oldParent = this.parent;
            if(this.dot.isPositive) {
                this.world.allZones[this.dot.powerZone].positiveProximityManager.removeItem(this);
            }else{
                this.world.allZones[this.dot.powerZone].negativeProximityManager.removeItem(this);
            }
            this.origin = new Point(this.x, this.y);
            this.data = e.data;
            this.dragging = true;
            this.world.movingDotsContainer.addChild(this);
            var newPosition = this.data.getLocalPosition(this.parent);
            let originDiff = this.data.getLocalPosition(oldParent);
            this.originInMovingContainer = newPosition;
            this.originInMovingContainer.x += this.origin.x - originDiff.x;
            this.originInMovingContainer.y += this.origin.y - originDiff.y;
            this.position.x = newPosition.x;
            this.position.y = newPosition.y;
            if(this.dot.color === SPRITE_COLOR.RED) {
                this.particleEmitter = this.world.dragParticleEmitterRed;
            }else{
                this.particleEmitter = this.world.dragParticleEmitterBlue;
            }
            this.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
            this.particleEmitter.start();
        }
    }

    onDragMove(e){
        if(this.world.isInteractive && this.dragging) {
            var newPosition = this.data.getLocalPosition(this.parent);
            this.position.x = newPosition.x;
            this.position.y = newPosition.y;
            this.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
        }

    }

    onDragEnd(e){
        if(this.world.isInteractive && this.dragging) {
            this.dragging = false;
            this.data = null;
            this.world.verifyDroppedOnZone(this, e.data);
            // dot may have been remove if dropped outside the boxes in freeplay, so verify if it's still have a dot
            if(this.dot) {
                if (this.dot.isPositive) {
                    // wait for the sprite to be back in place if dropped on an edge
                    TweenMax.delayedCall(0.21, this.world.allZones[this.dot.powerZone].positiveProximityManager.addItem, [this], this.world.allZones[this.dot.powerZone].positiveProximityManager);
                } else {
                    TweenMax.delayedCall(0.21, this.world.allZones[this.dot.powerZone].negativeProximityManager.addItem, [this], this.world.allZones[this.dot.powerZone].negativeProximityManager);
                }
            }
            this.particleEmitter.stop();
        }
        e.stopPropagation();
    }

    verifyDroppedOnZone(dotSprite, data){
        //console.log('verifyDroppedOnZone', dotSprite, data);
        let originalZoneIndex = dotSprite.dot.powerZone;
        let zoneOverInfo = this.getZoneUnderCursor(data);
        let droppedOnPowerZone = zoneOverInfo.droppedOnPowerZone;
        let droppedOnPowerZoneIndex = zoneOverInfo.droppedOnPowerZoneIndex;
        //console.log('verifyDroppedOnZone', droppedOnPowerZoneIndex, droppedOnPowerZone);
        if(droppedOnPowerZoneIndex !== -1 && droppedOnPowerZone !== null) {
            // has not been dropped outside a zone
            if (droppedOnPowerZoneIndex !== originalZoneIndex) {
                // impossible to move between different positive value zone (positive to negative)
                // impossible to move between powerZone in base X
                if(droppedOnPowerZone.isPositive === dotSprite.dot.isPositive && this.base[1] != BASE.BASE_X) {
                    let diffZone = originalZoneIndex - droppedOnPowerZoneIndex;
                    let dotsToRemoveCount = 1;
                    //console.log(originalZoneIndex, droppedOnPowerZoneIndex, diffZone);
                    if (diffZone < 0) {
                        dotsToRemoveCount = Math.pow(this.base[1], diffZone * -1);
                    }else{
                        dotsToRemoveCount = this.base[0];
                    }
                    //console.log('dotsToRemoveCount', dotsToRemoveCount);
                    //check if possible
                    let finalNbOfDots = -1;
                    if(dotSprite.dot.isPositive) {
                        finalNbOfDots = Object.keys(this.allZones[originalZoneIndex].positiveDots).length - dotsToRemoveCount;
                    }else{
                        finalNbOfDots = Object.keys(this.allZones[originalZoneIndex].negativeDots).length - dotsToRemoveCount;
                    }
                    //console.log('finalNbOfDots', finalNbOfDots);
                    if (finalNbOfDots < 0 || this.base[0] > 1 && Math.abs(diffZone) > 1) {
                        if(finalNbOfDots < 0) {
                            //alert("Pas assez de points disponibles pour cette opération");
                            this.soundManager.playSound(SoundManager.NOT_ENOUGH_DOTS);
                            this.displayUserMessage(ERROR_MESSAGE.NO_ENOUGH_DOTS);
                        }else if(this.base[0] > 1 && Math.abs(diffZone) > 1){
                            this.soundManager.playSound(SoundManager.INVALID_MOVE);
                            this.displayUserMessage(ERROR_MESSAGE.ONE_BOX_AT_A_TIME);
                        }
                        if (dotSprite.dot.isPositive) {
                            this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer]});
                            this.isInteractive = false;
                        } else {
                            this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer]});
                            this.isInteractive = false;
                        }
                        return false;
                    }
                    // rezone current dot and thus remove it from the amount to be moved
                    this.addDraggedToNewZone(dotSprite, droppedOnPowerZone, data.getLocalPosition(droppedOnPowerZone), false);
                    dotsToRemoveCount--;

                    //console.log('dotsToRemoveCount', dotsToRemoveCount);
                    // animate zone movement and destroy
                    let dataLocalZone = data.getLocalPosition(droppedOnPowerZone);
                    this.tweenDotsToNewZone(originalZoneIndex, droppedOnPowerZone, dotsToRemoveCount, dataLocalZone, dotSprite.dot.isPositive);

                    //Add the new dots
                    let dotsPos = [];
                    let newNbOfDots = Math.pow(this.base[1], diffZone);
                    newNbOfDots -= this.base[0];
                    //console.log('newNbOfDots', newNbOfDots, diffZone);
                    for (let i = 0; i < newNbOfDots; i++) {
                        dotsPos.push({
                            x: randomFromTo(POSITION_INFO.DOT_RAYON, droppedOnPowerZone.hitArea.width - POSITION_INFO.DOT_RAYON),
                            y: randomFromTo(POSITION_INFO.DOT_RAYON, droppedOnPowerZone.hitArea.height - POSITION_INFO.DOT_RAYON)
                        })
                    }
                    if (dotsPos.length > 0) {
                        this.soundManager.playSound(SoundManager.DOT_EXPLODE);
                        //console.log('this.addMultipleDots', dotsPos.length);
                        let implosionEmitter = this.getImplosionEmitter();
                        let originalPos = data.getLocalPosition(this.movingDotsContainer);
                        implosionEmitter.updateOwnerPos(originalPos.x, originalPos.y);
                        implosionEmitter.start();
                        TweenMax.delayedCall(0.25, this.stopImplosionEmitter, [implosionEmitter], this);
                        this.addMultipleDots(droppedOnPowerZoneIndex, dotsPos, dotSprite.dot.isPositive, dotSprite.dot.color, false);
                    }
                } else {
                    if(droppedOnPowerZone.isPositive != dotSprite.dot.isPositive) {
                        this.soundManager.playSound(SoundManager.INVALID_MOVE);
                        this.displayUserMessage(ERROR_MESSAGE.POSITIVE_NEGATIVE_DRAG);
                        this.isInteractive = false;
                    }else if(this.base[1] === BASE.BASE_X){
                        this.soundManager.playSound(SoundManager.INVALID_MOVE);
                        this.displayUserMessage(ERROR_MESSAGE.BASE_X_DRAG);
                        this.isInteractive = false;
                    }
                    if (dotSprite.dot.isPositive) {
                        this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer]});
                    } else {
                        this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer]});
                    }
                }
            }else{
                // dots dropped on the same powerZone
                if(dotSprite.dot.isPositive === droppedOnPowerZone.isPositive) {
                    // just move the dots into the zone
                    droppedOnPowerZone.addChild(dotSprite);
                    let doTween = false;
                    let newPosition = data.getLocalPosition(droppedOnPowerZone);
                    let modifyPosition = newPosition.clone();
                    if(newPosition.x < POSITION_INFO.DOT_RAYON){
                        modifyPosition.x = POSITION_INFO.DOT_RAYON;
                        doTween = true;
                    }else if(newPosition.x > droppedOnPowerZone.hitArea.width - POSITION_INFO.DOT_RAYON){
                        modifyPosition.x = droppedOnPowerZone.hitArea.width - POSITION_INFO.DOT_RAYON;
                        doTween = true;
                    }
                    if(newPosition.y < POSITION_INFO.DOT_RAYON){
                        modifyPosition.y = POSITION_INFO.DOT_RAYON;
                        doTween = true;
                    }else if(newPosition.y > droppedOnPowerZone.hitArea.height - POSITION_INFO.DOT_RAYON){
                        modifyPosition.y = droppedOnPowerZone.hitArea.height - POSITION_INFO.DOT_RAYON;
                        doTween = true;
                    }
                    dotSprite.position.x = newPosition.x;
                    dotSprite.position.y = newPosition.y;
                    if(doTween) {
                        TweenMax.to(dotSprite.position, 0.2, {x: modifyPosition.x, y: modifyPosition.y});
                    }
                }else{
                    // check it possible dot / anti dot destruction
                    if(dotSprite.dot.isPositive) {
                        // Positive dot drag into negative zoe
                        if(Object.keys(this.allZones[originalZoneIndex].negativeDots).length > 0){
                            let allRemovedDots = [];
                            let negativeSprite = this.allZones[originalZoneIndex].negativeDotsContainer.getChildAt(0);
                            allRemovedDots.push(negativeSprite.dot);
                            this.removeDotSpriteListeners(negativeSprite);
                            allRemovedDots.push(dotSprite.dot);
                            this.removeDotSpriteListeners(dotSprite);
                            this.soundManager.playSound(SoundManager.DOT_ANNIHILATION);
                            this.removeMultipleDots(originalZoneIndex, allRemovedDots, true);
                        }else{
                            this.soundManager.playSound(SoundManager.INVALID_MOVE);
                            this.displayUserMessage(ERROR_MESSAGE.NO_OPPOSITE_DOTS);
                            this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer]});
                        }
                    }else{
                        // Negative dot drag into positive zoe
                        if(Object.keys(this.allZones[originalZoneIndex].positiveDots).length > 0){
                            let allRemovedDots = [];
                            let positiveSprite = this.allZones[originalZoneIndex].positiveDotsContainer.getChildAt(0);
                            allRemovedDots.push(positiveSprite.dot);
                            this.removeDotSpriteListeners(positiveSprite);
                            allRemovedDots.push(dotSprite.dot);
                            this.removeDotSpriteListeners(dotSprite);
                            this.soundManager.playSound(SoundManager.DOT_ANNIHILATION);
                            this.removeMultipleDots(originalZoneIndex, allRemovedDots, true);
                        }else{
                            this.soundManager.playSound(SoundManager.INVALID_MOVE);
                            this.displayUserMessage(ERROR_MESSAGE.NO_OPPOSITE_DOTS);
                            this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer]});
                        }
                    }
                }
            }
        }else{
            // Dropped outside any zone
            if(droppedOnPowerZone === this.leftMostZone){
                // Dropped on the fake zone at the left
                this.soundManager.playSound(SoundManager.ERROR);
                this.displayUserMessage(ERROR_MESSAGE.NO_GREATER_ZONE);
                if (dotSprite.dot.isPositive) {
                    this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer]});
                } else {
                    this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer]});
                }
                this.isInteractive = false;
            }else {
                if (this.usage_mode === USAGE_MODE.FREEPLAY) {
                    // Remove dot in freeplay
                    this.soundManager.playSound(SoundManager.DOT_VANISH);
                    this.removeDotSpriteListeners(dotSprite);
                    this.removeDot(originalZoneIndex, dotSprite.dot.id);
                } else {
                    // Put back dot in it's original place
                    if (dotSprite.dot.isPositive) {
                        this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer);
                    } else {
                        this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer);
                    }
                }
            }
        }
    }

    getZoneUnderCursor(data){
        let droppedOnPowerZone = null;
        let droppedOnPowerZoneIndex = -1;
        // verify dropped on left test zone
        let dataLocalZone = data.getLocalPosition(this.leftMostZone);
        if(isPointInRectangle(dataLocalZone, this.leftMostZone.hitArea)){
            droppedOnPowerZone = this.leftMostZone;
            return {droppedOnPowerZone: droppedOnPowerZone, droppedOnPowerZoneIndex: droppedOnPowerZoneIndex};
        }
        this.allZones.forEach(zone => {
            let dataLocalZone = data.getLocalPosition(zone.positiveDotsContainer);
            if(isPointInRectangle(dataLocalZone, zone.positiveDotsContainer.hitArea)){
                droppedOnPowerZone = zone.positiveDotsContainer;
                droppedOnPowerZoneIndex = zone.zonePosition;
            }
            if(zone.negativeDotsContainer != null) {
                dataLocalZone = data.getLocalPosition(zone.negativeDotsContainer);
                if (isPointInRectangle(dataLocalZone, zone.negativeDotsContainer.hitArea)) {
                    droppedOnPowerZone = zone.negativeDotsContainer;
                    droppedOnPowerZoneIndex = zone.zonePosition;
                }
            }
        });
        return {droppedOnPowerZone: droppedOnPowerZone, droppedOnPowerZoneIndex: droppedOnPowerZoneIndex};
    }

    backIntoPlace(dotSprite, currentZone){
        this.soundManager.playSound(SoundManager.BACK_INTO_PLACE);
        this.isInteractive = false;
        TweenMax.to(dotSprite, 1, {
            x:dotSprite.originInMovingContainer.x,
            y:dotSprite.originInMovingContainer.y,
            onComplete: this.backIntoPlaceDone.bind(this),
            onCompleteParams:[dotSprite, currentZone],
            ease:Quint.easeInOut
        });
        TweenMax.to(dotSprite, 0.5, {
            height: dotSprite.height / 2,
            repeat: 1,
            yoyo: true
        });
    }

    backIntoPlaceDone(dotSprite, currentZone){
        currentZone.addChild(dotSprite);
        dotSprite.position = dotSprite.origin;
        this.isInteractive = true;
    }

    addDraggedToNewZone(dotSprite, newZone, positionToBeMovedTo, updateValue){
        //console.log('addDraggedToNewZone', newZone.powerZone);
        newZone.addChild(dotSprite);
        dotSprite.position.x = positionToBeMovedTo.x;
        dotSprite.position.y = positionToBeMovedTo.y;
        // Set the dot into the array here to have his position right.
        this.allZones[dotSprite.dot.powerZone].removeDotFromArray(dotSprite.dot);
        this.allZones[newZone.powerZone].addDotToArray(dotSprite.dot);
        this.rezoneDot(newZone.powerZone, dotSprite.dot, updateValue);
    }

    tweenDotsToNewZone(originalZoneIndex, droppedOnPowerZone, dotsToRemove, positionToBeMovedTo, isPositive){
        //console.log('tweenDotsToNewZone', positionToBeMovedTo);

        // get the original on zone
        let dotContainer;
        if (droppedOnPowerZone.isPositive) {
            dotContainer = this.allZones[originalZoneIndex].positiveDotsContainer;
        } else {
            dotContainer = this.allZones[originalZoneIndex].negativeDotsContainer;
        }
        //  For 2 > 3 base.
        if(this.base[0] > 1){
            dotsToRemove -= (this.base[0] - 1);
            let dotsToRezone = this.base[0] - 1;
            for(let i=0; i < dotsToRezone; i++) {
                let dotSprite = dotContainer.getChildAt(0);
                dotSprite.origin = new Point();
                dotSprite.origin.copy(dotSprite.position);
                var newPosition = this.movingDotsContainer.toLocal(dotSprite.position, dotSprite.parent);
                let adjacentPosition = positionToBeMovedTo.clone();
                let quadrant = findQuadrant(adjacentPosition, droppedOnPowerZone.hitArea);
                switch(quadrant){
                    case 0:
                        adjacentPosition.x += POSITION_INFO.DOT_RAYON * 2;
                        adjacentPosition.y += POSITION_INFO.DOT_RAYON * 2;
                        break;
                    case 1:
                        adjacentPosition.x -= POSITION_INFO.DOT_RAYON * 2;
                        adjacentPosition.y += POSITION_INFO.DOT_RAYON * 2;
                        break;
                    case 2:
                        adjacentPosition.x -= POSITION_INFO.DOT_RAYON * 2;
                        adjacentPosition.y -= POSITION_INFO.DOT_RAYON * 2;
                        break;
                    case 3:
                        adjacentPosition.x += POSITION_INFO.DOT_RAYON * 2;
                        adjacentPosition.y -= POSITION_INFO.DOT_RAYON * 2;
                        break;
                }
                let finalPosition = this.movingDotsContainer.toLocal(adjacentPosition, droppedOnPowerZone);
                this.movingDotsContainer.addChild(dotSprite);
                dotSprite.position.x = newPosition.x;
                dotSprite.position.y = newPosition.y;
                TweenMax.to(dotSprite, 0.5, {
                    x: finalPosition.x,
                    y: finalPosition.y,
                    onComplete: this.addDraggedToNewZone.bind(this),
                    onCompleteParams: [dotSprite, droppedOnPowerZone, adjacentPosition, true]
                });
            }
            //this.checkIfNotDisplayedSpriteCanBe();
        }
        let allRemovedDots = [];
        // tween dots to new zone
        let finalPosition = this.movingDotsContainer.toLocal(positionToBeMovedTo, droppedOnPowerZone);
        let notDisplayedDotCount = 0;
        for(let i=0; i < dotsToRemove; i++){
            let dotSprite;
            let dot;
            if(dotContainer.children.length > 0) {
                dotSprite = dotContainer.getChildAt(0);
                dot = dotSprite.dot;
                this.removeDotSpriteListeners(dotSprite);
                // calculate the position of the sprite in the moving container
                dotSprite.origin = new Point();
                dotSprite.origin.copy(dotSprite.position);
                var newPosition = this.movingDotsContainer.toLocal(dotSprite.position, dotSprite.parent);
                this.movingDotsContainer.addChild(dotSprite);
                dotSprite.position.x = newPosition.x;
                dotSprite.position.y = newPosition.y;

                // start the particles explosion effect
                let explosionEmitter = this.getExplosionEmitter();
                explosionEmitter.updateOwnerPos(newPosition.x, newPosition.y);
                explosionEmitter.start();
                TweenMax.delayedCall(0.2, this.stopExplosionEmitter, [explosionEmitter], this);
                // Move the sprite
                TweenMax.to(dotSprite, 0.5, {
                    x:finalPosition.x,
                    y:finalPosition.y,
                    onComplete: this.tweenDotsToNewZoneDone.bind(this),
                    onCompleteParams:[dotSprite]
                });
                allRemovedDots.push(dot);
                this.allZones[dot.powerZone].removeDotFromArray(dot);
            }else{
                notDisplayedDotCount++;
            }
        }
        let notDisplayedDots = this.allZones[originalZoneIndex].removeNotDisplayedDots(notDisplayedDotCount, isPositive);
        allRemovedDots = allRemovedDots.concat(notDisplayedDots);
        this.removeMultipleDots(originalZoneIndex, allRemovedDots, false);
        if(allRemovedDots.length > 0) {
            this.soundManager.playSound(SoundManager.DOT_IMPLODE);
        }
    }

    getExplosionEmitter(){
        if(this.explodeEmitter.length > 0){
            return this.explodeEmitter.pop();
        }else{
            return new ParticleEmitter(this.movingDotsContainer, this.textures["red_dot.png"], explodeJSON);
        }
    }

    getImplosionEmitter(){
        if(this.implodeEmitter.length > 0){
            return this.implodeEmitter.pop();
        }else{
            return new ParticleEmitter(this.movingDotsContainer, this.textures["red_dot.png"], implodeJSON);
        }
    }

    stopExplosionEmitter(explosionEmitter){
        explosionEmitter.stop();
        this.explodeEmitter.push(explosionEmitter);
    }

    stopImplosionEmitter(implosionEmitter){
        implosionEmitter.stop();
        this.implodeEmitter.push(implosionEmitter);
    }

    tweenDotsToNewZoneDone(dotSprite){
        TweenMax.to(dotSprite, 0.3, {alpha:0, onComplete: this.removeTweenDone.bind(this), onCompleteParams:[dotSprite]});
    }

    removeTweenDone(dotSprite){
        // TODO check this, should it be moved to the PowerZone?
        dotSprite.parent.removeChild(dotSprite);
        this.spritePool.dispose(dotSprite, dotSprite.dot.isPositive, dotSprite.dot.color);
    }

    doBaseChange(base, placeValueOn){
        this.base = base;
        this.allZones.forEach(zone => {
            zone.baseChange(base, placeValueOn);
        });
    }

    setValueTextAlpha(placeValueOn){
        this.allZones.forEach((zone) => {
            zone.setValueTextAlpha(placeValueOn ? 1 : 0);
        });
    }

    checkPendingAction(nextProps){
        if(nextProps.userMessage === ''){
            while(this.pendingAction.length > 0) {
                let action = this.pendingAction.shift();
                action.function.apply(this, action.params);
            }
        }
    }

    magicWand(){
        let base = this.base[1];
        let dotsRemoved = [];
        if(this.negativePresent){
            // check positive / negative
            for(let i = 0; i < this.allZones.length; i++) {
                let positiveDots = this.allZones[i].positiveDots;
                let negativeDots = this.allZones[i].negativeDots;
                let positiveDotsCount = Object.keys(positiveDots).length;
                let negativeDotsCount = Object.keys(negativeDots).length;
                if(positiveDotsCount > 0 && negativeDotsCount){
                    let overdotCount = Math.min(positiveDotsCount, negativeDotsCount);
                    dotsRemoved = dotsRemoved.concat(this.allZones[i].getPositiveNegativeOverdot(overdotCount, true));
                    dotsRemoved = dotsRemoved.concat(this.allZones[i].getPositiveNegativeOverdot(overdotCount, false));
                    this.removeMultipleDots(i, dotsRemoved, false);
                    break;
                }
            }
        }
        if(dotsRemoved.length === 0) {
            for (let i = 0; i < this.allZones.length; i++) {
                dotsRemoved = this.allZones[i].getOvercrowding(base);
                if (dotsRemoved.length > 0) {
                    this.removeMultipleDots(i, dotsRemoved, false);
                    if (this.negativePresent) {
                        if (dotsRemoved[0].isPositive) {
                            this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.HALF_BOX_HEIGHT)], true);
                        } else {
                            this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.HALF_BOX_HEIGHT)], false);
                        }
                    } else {
                        this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.BOX_HEIGHT)], true);
                    }
                    break;
                }
            }
        }
    }

    removeDotsFromStateChange(positivePowerZoneDots, negativePowerZoneDots){
        //console.log('removeDotsFromStateChange');
        for(let i = 0; i < this.allZones.length; i++) {
            //console.log('removeDotsFromStateChange', i, Object.keys(this.props.positivePowerZoneDots[i]).length);
            let removedDots = this.allZones[i].removeDotsIfNeeded(positivePowerZoneDots[i], true);
            removedDots.forEach(dot => {
                if(dot.sprite){
                    this.removeDotSpriteListeners(dot.sprite);
                    this.spritePool.dispose(dot.sprite, dot.isPositive, dot.color);
                    dot.sprite = null;
                }
            });
            removedDots = this.allZones[i].removeDotsIfNeeded(negativePowerZoneDots[i], false);
            removedDots.forEach(dot => {
                if(dot.sprite){
                    this.removeDotSpriteListeners(dot.sprite);
                }
            });
        }
        this.checkIfNotDisplayedSpriteCanBe();
    }

    checkIfNotDisplayedSpriteCanBe(){
        let addedDots = [];
        this.allZones.forEach(zone => {
            addedDots = addedDots.concat(zone.checkIfNotDisplayedSpriteCanBe());
        });
        addedDots.forEach(dot => {
            this.addDotSpriteProperty(dot, dot.sprite);
        });
    }

    addDotsFromStateChange(positivePowerZoneDots, negativePowerZoneDots){
        //console.log('addDotsFromStateChange1');
        let allDots = [];
        for(let i = 0; i < this.allZones.length; i++) {
            allDots = allDots.concat(this.allZones[i].addDotsFromStateChange(positivePowerZoneDots[i], negativePowerZoneDots[i]));
        }
        allDots.forEach(dot =>{
            if(dot.sprite) {
                this.addDotSpriteProperty(dot, dot.sprite);
                if(dot.isPositive) {
                    this.allZones[dot.powerZone].positiveProximityManager.addItem(dot.sprite);
                }else{
                    this.allZones[dot.powerZone].negativeProximityManager.addItem(dot.sprite);
                }
            }
        });
    }

    removeDividerDotFromStateChange(positiveDividerDots, negativeDividerDots){
        this.dividerZoneManager.removeDots(positiveDividerDots, negativeDividerDots);
    }

    addDividerDotFromStateChange(positiveDividerDots, negativeDividerDots){
        this.dividerZoneManager.addDots(positiveDividerDots, negativeDividerDots);
    }

    showDivider(){
        this.dividerZoneManager.x = 957;
        this.dividerZoneManager.y = 375;
        this.addChild(this.dividerZoneManager);
        this.dividerZoneManager.start();
    }

    checkInstability() {
        let isOverload;
        let overloadExist = false;
        let isSignInstability;
        let instabilityExist = false;
        this.allZones.forEach(zone => {
            isOverload = zone.checkOvercrowding();
            overloadExist === false ? overloadExist = isOverload : false;
            if(this.negativePresent) {
                isSignInstability = zone.checkPositiveNegativePresence(isOverload);
                instabilityExist === false ? instabilityExist = isSignInstability : false;
            }
        });
        if(overloadExist){
            this.soundManager.playSound(SoundManager.BOX_OVERLOAD);
        }else if(instabilityExist){
            this.soundManager.playSound(SoundManager.BOX_POSITIVE_NEGATIVE);
        }else{
            this.soundManager.stopSound(SoundManager.BOX_OVERLOAD);
            this.soundManager.stopSound(SoundManager.BOX_POSITIVE_NEGATIVE);
        }
    }

    animationCallback(...args){
        requestAnimationFrame(this.animationCallback.bind(this));
        this.allZones.forEach(zone => {
            zone.update();
        });
    }

    checkResult() {
        console.log('checkResult');
        let zone;
        if(this.wantedResult.positiveDots.length === this.allZones.length &&
            this.wantedResult.negativeDots.length === this.allZones.length &&
            this.wantedResult.positiveDivider.length === this.allZones.length &&
            this.wantedResult.negativeDivider.length === this.allZones.length
        ) {
            let zoneSuccess = 0;
            for (let i = 0; i < this.allZones.length; i++) {
                zone = this.allZones[i];
                zone.precalculateDotsForDivision();
                if (this.wantedResult.positiveDots[i] === zone.positiveDotCount &&
                    this.wantedResult.negativeDots[i] === zone.negativeDotCount &&
                    this.wantedResult.positiveDivider[i] === Number(zone.positiveDividerText) &&
                    this.wantedResult.negativeDivider[i] === Number(zone.negativeDividerText)
                ) {
                    zoneSuccess++;
                }
            }
            console.log('checkResult', zoneSuccess);
            if(zoneSuccess === this.allZones.length){
                console.log('SUCCESS!!!')
            }
        }
    }

    reset(){
        //console.log('PowerZoneManager reset');
        TweenMax.killAll(true);
        this.allZones.forEach(zone => {
           zone.reset();
        });
        if(this.dividerZoneManager){
            this.dividerZoneManager.reset();
        }
        this.soundManager.stopSound(SoundManager.BOX_OVERLOAD);
        this.soundManager.stopSound(SoundManager.BOX_POSITIVE_NEGATIVE);
    }

}
