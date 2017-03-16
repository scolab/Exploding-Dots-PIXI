export class ProximityManager {

    constructor(gridSize,bounds) {
        this.gridSize = gridSize;
        this.bounds = bounds;

        this.addItemsImmediately = false;
        this._items = [];
        this.grid = [];
        this.deadItems = {};
        this.checkDead = false;
        this.liveItems = {};
        this.w = 0;
        this.h = 0;
        this.offX = 0;
        this.offY = 0;
        this.length = 0;
        this.lengths = [];
        this.m = 0;
        this.init();
    }

    get items(){
        return this._items;
    }

    set items(value) {
        this._items = value;
        for (var o in this.deadItems) {
            delete(this.deadItems[o]);
        }
        var l = this._items.length;
        for (var i = 0; i < l; i++) {
            this.liveItems[this._items[i]] = true;
        }
    }

    addItem(item) {
        if (!(this.liveItems[item] || this.deadItems[item])) {
            this._items.push(item);
        }
        this.liveItems[item] = true;
        delete(this.deadItems[item]);

        if (this.addItemsImmediately) {
            var pos = ((item.x + this.offX) * this.m | 0) * this.h +( item.y + this.offY) * this.m;
            this.grid[pos][this.lengths[pos]++] = item;
        }
    }

    /**
     * Removes an item from the system. It will not be returned in any subsequent getNeighbors() calls.
     **/
    removeItem(item) {
        if (!this.liveItems[item]) {
            return;
        }
        this.deadItems[item] = true;
        delete(this.liveItems[item]);
        this.checkDead = true;
    }

    /**
     * Updates the positions of all items on the grid. Call this when items have moved, but not after *each* item moves.
     * For example, if you have a number of sprites moving around on screen each frame, move them all, then call update() once per frame.
     **/
    update() {
        // clear grid:
        this.lengths = [];
        for(let i = 0; i < this.length; i++){
            this.lengths.push(0);
        }
        //this.lengths.length = this.length;
        for (var i = 0; i < this.length; ++i) {
            this.grid[i].length = 0;
        }

        // populate grid:
        var l = this._items.length;
        for (i = l; i-->0;) {
            var item = this._items[i];
            if (this.checkDead && this.deadItems[item]) {
                this._items.splice(i,1);
                delete(this.deadItems[item]);
                continue;
            }
            var pos = Math.round(((item.x + this.offX) * this.m | 0) * this.h + (item.y + this.offY) * this.m);
            this.grid[pos][this.lengths[pos]++] = item;
            console.log('update', this.grid[pos], this.lengths[pos], this.grid[pos][this.lengths[pos]++]);
        }
        this.checkDead = false;
    }

    /**
     * Returns the list of neighbors for the specified item. Neighbours are items in grid positions within radius positions away from the item.
     * For example, a radius of 0 returns only items in the same position. A radius of 1 returns 9 positions (the center, + the 8 positions 1 position away).
     * A radius of 2 returns 25 positions. It is generally recommended to only use a radius of 1, but there are occasional use cases that may benefit from using
     * a radius of 2.
     * <br/><br/>
     * It is important to note that this is a coarse set of neighbors. Their distance from the target item varies depending on their location within their grid position.
     * This is allows you to exclude items that are too far away, then use more accurate comparisions (like pythagoram distance calculations or hit tests) on the
     * smaller set of items.
     * <br/><br/>
     * You can specify a resultVector to avoid the need for ProximityManager to instantiate a new Vector each time you call getNeighbors. Results will be appended
     * to the end of the vector. You may want to clear the vector with myVector.length = 0 before reusing it.
     **/
    getNeighbors(item, radius = 1, resultVector=null){
        const itemX = (item.x + this.offX) / this.gridSize | 0;
        const itemY = (item.y + this.offY) / this.gridSize | 0;

        let minX = itemX - radius;
        if (minX < 0) {
            minX = 0;
        }

        let minY = itemY - radius;
        if (minY < 0) {
            minY = 0;
        }

        let maxX = itemX + radius;
        if (maxX > this.w) {
            maxX = this.w;
        }

        let maxY = itemY + radius;
        if (maxY > this.h) {
            maxY = this.h;
        }

        let results = resultVector ? resultVector : [];
        let count = resultVector ? resultVector.length : 0;
        for (let x = minX; x <= maxX; x++) {
            let adjX = x * this.h;
            for (let y = minY; y <= maxY; y++) {
                let itemList = this.grid[adjX + y];
                //console.log(this.grid, itemList, itemList.length);
                let l = itemList.length;
                for (let i = 0; i < l; i++) {
                    let item = itemList[i];
                    if (!this.checkDead || !this.deadItems[item]) {
                        results[count++] = itemList[i];
                    }
                }
            }
        }
        return results;
    }


    init(){
        this.w = Math.ceil(this.bounds.width / this.gridSize) + 1;
        this.h = Math.ceil(this.bounds.height / this.gridSize) + 1;
        this.length = this.w * this.h;
        this.offX = -this.bounds.x;
        this.offY = -this.bounds.y;
        this.m = 1 / this.gridSize;

        this.lengths = [];
        this.grid = [];
        for (let i = 0; i < this.length; i++) {
            this.grid[i] = [];
        }
    }
}
