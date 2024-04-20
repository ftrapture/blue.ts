class Filters {

    constructor(player){
       this.player = player;
    }

    updateFilter() {

    }
    
    set8D() {

    }
    
    setNightCore() {

    }

    setReverb() {

    }

    setCustom(params = {}) {
        const { rotation, speed,  } = params;
        if(rotation && typeof rotation === "number" && rotation !== 0) {

        } else if(speed && typeof rotation === "number") {

        } else {
            return this;
        }
    }
}

module.exports = Filters;