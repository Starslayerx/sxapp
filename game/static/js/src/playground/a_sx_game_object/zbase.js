let SX_GAME_OBJECTS = [];

class SxGameObject {
    constructor() {
        SX_GAME_OBJECTS.push(this);
        this.has_called_start = false; // 是否执行过start()函数
        this.timedelta = 0; // 当前帧距离上一帧时间间隔，单位ms
        this.uuid = this.create_uuid();
        console.log("uuid" + this.uuid);
    }

    // 创建唯一编号
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10)); // [0,1)之间的数 --> [0,9]
            res += x;
        }
        return res;
    }

    start() { // 只在第一帧执行
    }

    update() { // 每一帧都执行一次
    }

    on_destroy() { // 消毁前执行一次
    }

    destroy() { // 删掉该物体
        this.on_destroy();
        for (let i = 0; i < SX_GAME_OBJECTS.length; i++) {
            if (SX_GAME_OBJECTS[i] === this) {
                SX_GAME_OBJECTS.splice(i, 1); // 删除该物体
                break;
            }
        }
    }
}

// 第一帧不会使用，不用初始化
let last_timestamp;
// 执行动画，每一帧前执行(60次/s)
let SX_GAME_ANIMATION = function(timestamp) {
    for (let i = 0; i < SX_GAME_OBJECTS.length; i++) {
        let obj = SX_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp; // 第一帧后，last_timestamp被赋值

    requestAnimationFrame(SX_GAME_ANIMATION);
}

requestAnimationFrame(SX_GAME_ANIMATION);
