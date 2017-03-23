import {PowerZone} from './Canvas.PIXI.PowerZone';
import {ParticleEmitter} from './ParticleEmitter';
import { TweenMax, Quint} from "gsap";
import {isPointInRectangle, randomFromTo, convertBase, findQuadrant} from '../../utils/MathUtils'
import {BASE, USAGE_MODE, POSITION_INFO, BOX_INFO} from '../../Constants'
import {Point} from 'pixi.js';
import explodeJSON from './dot_explode.json';
import implodeJSON from './dot_implode.json';
import dragJSON from './dot_drag.json';

export class PowerZoneManager extends PIXI.Container{

    constructor(addDot, removeDot, addMultipleDots, removeMultipleDots, rezoneDot, displayUserMessage){
        super();
        this.addDot = addDot;
        this.removeDot = removeDot;
        this.addMultipleDots = addMultipleDots;
        this.removeMultipleDots = removeMultipleDots;
        this.rezoneDot = rezoneDot;
        this.displayUserMessage = displayUserMessage;
        this.movingDotsContainer = new PIXI.Container();
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
        this.isInteractive = true;
        this.pendingAction = [];
        this.explodeEmitter = [];
        this.implodeEmitter = [];
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
                this.spritePool,
                this.allZones.length
            );
            this.addChild(powerZone);
            this.allZones.push(powerZone);
            powerZone.eventEmitter.on(PowerZone.CREATE_DOT, this.createDot, this);
            powerZone.setValueTextAlpha(this.placeValueOn ? 1 : 0);
        }
        this.setZoneTextAndAlphaStatus();
        this.dragParticleEmitter = new ParticleEmitter(this.movingDotsContainer, this.textures["red_dot.png"], dragJSON);
        this.addChild(this.movingDotsContainer);
    }

    createDot(powerZone, position, isPositive){
        if(this.isInteractive) {
            this.addDot(powerZone, position, isPositive);
        }
    }

    setZoneTextAndAlphaStatus(){
        // Don't display leading zeroes
        let zoneIsEmpty = true;
        for(let i = this.totalZoneCount - 1; i >=0; i--){
            zoneIsEmpty = this.allZones[i].checkTextAndAlpha(zoneIsEmpty);
        }
    }

    inititalPopulate(dots){
        dots.forEach((zoneArray) => {
            Object.keys(zoneArray).forEach(key => {
                let dotSprite = this.allZones[zoneArray[key].powerZone].addDot(zoneArray[key]);
                if(dotSprite) {
                    this.addDotSpriteProperty(zoneArray[key], dotSprite);
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

    onDragStart(e, canvas){
        console.log('onDragStart', this.dot.id, this.world.isInteractive);
        if(this.world.isInteractive) {
            let oldParent = this.parent;
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
            this.particleEmitter = this.world.dragParticleEmitter;
            this.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
            this.particleEmitter.start();
        }
    }

    onDragMove(e){
        if(this.world.isInteractive) {
            if (this.dragging) {
                var newPosition = this.data.getLocalPosition(this.parent);
                this.position.x = newPosition.x;
                this.position.y = newPosition.y;
                this.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
            }
        }
    }

    onDragEnd(e){
        if(this.world.isInteractive && this.dragging) {
            this.dragging = false;
            this.data = null;
            this.world.verifyDroppedOnZone(this, e.data);
            this.particleEmitter.stop();
        }
        e.stopPropagation();
    }

    verifyDroppedOnZone(dotSprite, data){
        //console.log('verifyDroppedOnZone', dotSprite, data);
        let originalZoneIndex = dotSprite.dot.powerZone;
        let droppedOnPowerZone = null;
        let droppedOnPowerZoneIndex = -1;

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
                            this.displayUserMessage("Pas assez de points disponibles pour cette opération");
                        }else if(this.base[0] > 1 && Math.abs(diffZone) > 1){
                            this.displayUserMessage("Une case à la fois pour les base avec un dénominateur autre que 1");
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
                            y: randomFromTo(POSITION_INFO.DOT_RAYON, droppedOnPowerZone.hitArea.height - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE)
                        })
                    }
                    if (dotsPos.length > 0) {
                        //console.log('this.addMultipleDots', dotsPos.length);
                        let implosionEmitter = this.getImplosionEmitter();
                        let originalPos = data.getLocalPosition(this.movingDotsContainer);
                        implosionEmitter.updateOwnerPos(originalPos.x, originalPos.y);
                        implosionEmitter.start();
                        TweenMax.delayedCall(0.25, this.stopImplosionEmitter, [implosionEmitter], this);
                        this.addMultipleDots(droppedOnPowerZoneIndex, dotsPos, dotSprite.dot.isPositive, false);
                    }
                } else {
                    if(droppedOnPowerZone.isPositive != dotSprite.dot.isPositive) {
                        this.displayUserMessage("Pas assez de points disponibles pour cette opération");
                        this.isInteractive = false;
                    }else if(this.base[1] === BASE.BASE_X){
                        this.displayUserMessage("Base inconnue, on ne peut pas déplacer des points entre les zones");
                        this.isInteractive = false;
                    }
                    if (dotSprite.dot.isPositive) {
                        this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer]});
                        this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer);
                    } else {
                        this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer]});
                        this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer);
                    }
                }
            }else{
                // dots dropped on the same powerZone
                if(dotSprite.dot.isPositive === droppedOnPowerZone.isPositive) {
                    // just move the dots into the zone
                    droppedOnPowerZone.addChild(dotSprite);
                    let newPosition = data.getLocalPosition(droppedOnPowerZone);
                    dotSprite.position.x = newPosition.x;
                    dotSprite.position.y = newPosition.y;
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
                            this.removeMultipleDots(originalZoneIndex, allRemovedDots, true);
                        }else{
                            this.displayUserMessage('Aucun point à annuler');
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
                            this.removeMultipleDots(originalZoneIndex, allRemovedDots, true);
                        }else{
                            this.displayUserMessage('Aucun point à annuler');
                            this.pendingAction.push({function:this.backIntoPlace, params:[dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer]});
                        }
                    }
                }
            }
        }else{
            if(this.usage_mode == USAGE_MODE.FREEPLAY) {
                this.removeDot(originalZoneIndex, dotSprite.dot.id);
            }else{
                if (dotSprite.dot.isPositive) {
                    this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer);
                } else {
                    this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer);
                }
            }
        }
    }

    backIntoPlace(dotSprite, currentZone){
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
        console.log('addDraggedToNewZone', newZone.powerZone);
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
        this.spritePool.dispose(dotSprite);
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
        for(let i = 0; i < this.allZones.length; i++) {
            var dotsRemoved = this.allZones[i].getOvercrowding(base);
            if(dotsRemoved.length > 0){
                this.removeMultipleDots(i, dotsRemoved, false);
                if(this.negativePresent){
                    if(dotsRemoved[0].isPositive){
                        this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.HALF_BOX_HEIGHT)], true);
                    }else{
                        this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.HALF_BOX_HEIGHT)], false);
                    }
                }else {
                    this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.BOX_HEIGHT)], true);
                }
                break;
            }
        }
        if(dotsRemoved.length == 0 && this.negativePresent){
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
    }


    removeDotsFromStateChange(positivePowerZoneDots, negativePowerZoneDots){
        //console.log('removeDotsFromStateChange');
        for(let i = 0; i < this.allZones.length; i++) {
            //console.log('removeDotsFromStateChange', i, Object.keys(this.props.positivePowerZoneDots[i]).length);
            let removedDots = this.allZones[i].removeDotsIfNeeded(positivePowerZoneDots[i], true);
            removedDots.forEach(dot => {
                if(dot.sprite){
                    this.removeDotSpriteListeners(dot.sprite);
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
            }
        });
    }

    checkInstability() {
        let isOverload;
        this.allZones.forEach(zone => {
            isOverload = zone.checkOvercrowding();
            if(this.negativePresent) {
                zone.checkPositiveNegativePresence(isOverload);
            }
        });
    }

}
