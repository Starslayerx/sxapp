class SxGameMenu {
    constructor (root) { // root: SxGame对象
        this.root = root;
        // $: html对象
        this.$menu = $(`
            <div class="sx-game-menu">
                <div class="sx-game-menu-field">
                    <div class = "sx-game-menu-field-item sx-game-menu-field-item-single">
                        单人模式
                    </div>
                    </br>
                    <div class = "sx-game-menu-field-item sx-game-menu-field-item-multi">
                        多人模式
                    </div>
                    </br>
                    <div class = "sx-game-menu-field-item sx-game-menu-field-item-settings">
                         退出
                    </div>
                </div>
            </div>
        `);
        this.$menu.hide();
        // 将对象添加到div中
        this.root.$sx_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.sx-game-menu-field-item-single');
        this.$multi_mode = this.$menu.find('.sx-game-menu-field-item-multi');
        this.$settings = this.$menu.find('.sx-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function() {
            outer.hide(); // 隐藏菜单
            outer.root.playground.show("single mode"); // 展示playground
        });
        this.$multi_mode.click(function() {
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function() {
            outer.root.settings.logout_on_remote();
        });
    }

    show() { // 显示menu页面
        this.$menu.show();
    }

    hide() { // 关闭menu页面
        this.$menu.hide();
    }
}
let SX_GAME_OBJECTS = [];

class SxGameObject {
    constructor() {
        SX_GAME_OBJECTS.push(this);
        this.has_called_start = false; // 是否执行过start()函数
        this.timedelta = 0; // 当前帧距离上一帧时间间隔，单位ms
        this.uuid = this.create_uuid();
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
class ChatField {
    constructor (playground) {
        this.playground = playground;

        this.$history = $('<div class="sx-game-chat-field-history"></div>');
        this.$input = $('<input type="text" class="sx-game-chat-field-input">');

        this.$history.hide();
        this.$input.hide();

        this.func_id = null;

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        this.$input.keydown(function(e) {
            if (e.which === 27) { // Esc
                outer.hide_input();
                return false;
            } else if (e.which === 13) { // Enter
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text) {
                    outer.$input.val(""); // 清空输入框
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(text);
                }
                return false;
            }
        });
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) {
        this.show_history();
        let message = `[${username}] ${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history() {
        let outer = this;
        this.$history.fadeIn(); // 渐变效果

        if (this.func_id) {
            clearTimeout(this.func_id);
        }

        this.func_id = setTimeout(function() {
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000); // 3s后关闭
    }

    show_input() {
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}
class GameMap extends SxGameObject {
    constructor(playground) {
        super(); // 调用基类的构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`); // 元素添加监听事件
        this.ctx = this.$canvas[0].getContext('2d'); // canvas[0]是指匹配到的第一个canvas元素
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        this.$canvas.focus(); // 将窗口聚焦
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        this.ctx.fillStyle = "rgba(0, 0, 0, 1)"; //  不透明，无渐变效果
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // 半透明，实现尾部模糊效果
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class NoticeBoard extends SxGameObject {
    constructor (playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪：0人";
    }

    start() {
    }

    write(text) {
        this.text = text;
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text , this.playground.width / 2, 20);
    }
}
class Particle extends SxGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 0.01;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps || this.speed < this.eps * 1.5) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;

        this.render();
    }

    render() {
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends SxGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0; // 速度
        this.vy = 0;
        this.damage_x = 0;    // 被击中后位置
        this.damage_y = 0;
        this.damage_speed = 0; // 被击中后速度
        this.move_length = 0; // 要移动的距离
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        this.friction = 0.9; // 磨擦力
        this.spent_time = 0; // 记录时间
        this.fireballs = []; // 将发的子弹存下来

        this.cur_skill = null;

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            this.fireball_coldtime = 3; // 火球冷却时间：3s
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 5; // 闪现冷却时间: 5s
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }


    }

    start() {
        this.playground.player_count ++ ;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            // random: 0~1
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        }); // 关闭右键菜单

        this.playground.game_map.$canvas.mousedown(function(e) {
            if (outer.playground.state != "fighting")
                return true;

            const rect = outer.ctx.canvas.getBoundingClientRect();
            // 3:右键; 2:左键
            if (e.which === 3) {
                // 鼠标坐标 (clientXY 整个屏幕的绝对坐标)
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);

                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }

            } else if (e.which === 1) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;

                if (outer.cur_skill === "fireball") {
                    // 火球冷却时间未到
                    if (outer.fireball_coldtime > outer.eps)
                        return false;

                    let fireball = outer.shoot_fireball(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                } else if (outer.cur_skill === "blink") {
                    // 闪现冷却时间未到
                    if (outer.blink_coldtime > outer.eps)
                        return false;

                    outer.blink(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_blink(tx, ty);
                        console.log("Multi Mode Blink!");
                    }
                }
                outer.cur_skill = null;
            }

        });

        // 获取键盘事件
        this.playground.game_map.$canvas.keydown(function(e) {
            // 查看按键多少
            // console.log(e.which);

            if (e.which === 13) { // 回车
                if (outer.playground.mode === "multi mode") { // 打开聊天框
                    outer.playground.chat_field.show_input();
                    return false;
                }
            } else if (e.which === 27) {
                if (outer.playground.mode === "multi mode") { // 关闭聊天框
                    outer.playground.chat_field.hide_input();
                }
            }

            if (outer.playground.state != "fighting")
                return true;

            // keycode 事件表
            // 81: q,   70: f
            if (e.which === 81) {
                if (outer.fireball_coldtime > outer.eps) // 火球技能冷却时间未到
                    return true;
                outer.cur_skill = "fireball";
                return false;
            } else if (e.which === 70) {
                if (outer.blink_coldtime > outer.eps) // 闪现技能冷却时间未到
                    return true;
                outer.cur_skill = "blink";
                return false;
            }
        });
    }

    // 获取鼠标与当前player的角度
    getMouseAngle(tx, ty) {
        return Math.atan2(ty - this.y, tx - this.x);
    }

    shoot_fireball(tx, ty) {
        // let x = this.x, y = this.y;
        let x = this.x + this.radius * Math.cos(this.getMouseAngle(tx, ty)); // 火球生成增加偏移
        let y = this.y + this.radius * Math.sin(this.getMouseAngle(tx, ty));
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;

        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3;

        return fireball;
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;
        this.move_length = 0; // 闪现后停止移动
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx*dx + dy*dy);
    }

    is_attacked(angle, damage) {
        let particle_numbers = 10 + this.radius / 5 * 2 + Math.random() * 5;
        for (let i = 0; i < Math.min(30, particle_numbers); i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 5;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        this.radius -= damage;
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 1.15; // 被攻击后速度
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update() {
        this.spent_time += this.timedelta / 1000;

        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldtime();
        }
        this.update_move();
        this.render();
    }

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_codetime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    // 更新玩家移动
    update_move() {
        // 敌人随机发射火球，3s保护期，平均5s一次
        if (this.character === "robot" && this.spent_time > 3 && Math.random() < 1 / 300.0) {
            // 相互攻击，players[0]则攻击玩家
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            // 预判0.3s后位置
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0; // 离目标很进时，停止移动
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else {
                // 每帧移动距离
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved; // x方向移动距离
                this.y += this.vy * moved; // y方向移动距离
                this.move_length -= moved; // 剩下移动距离
            }
        }
    }

    render() {
        let scale = this.playground.scale;

        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime() {
        let scale = this.playground.scale;

        let x = 1.5, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            // 绘制透明蓝色
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale); // 绘制扇形
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            // 绘制透明蓝色
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale); // 绘制扇形
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    on_destroy() {
        if (this.character === "me")
            this.playground.state = "over";

        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}
class FireBall extends SxGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.01;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        this.update_move();

        // 命中判断仅属于发出者所在窗口
        if (this.player.character !== "enemy") {
            this.update_attack();
        }

        this.render();
    }

    update_move() {
        // 每帧移动的距离
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        // x y方向移动
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        // 更新距离目的地的距离
        this.move_length -= moved;
    }

    update_attack() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
                break; // 这里是为了只攻击到一名玩家
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx*dx + dy*dy);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);

        if (this.playground.mode === "multi mode") {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }

        this.destroy();
    }

    render() {
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i++) {
            if (fireballs[i] === this) {
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}
class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app6532.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }

    // 路由
    receive() {
        let outer = this;

        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            } else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === "attack") {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty);
            } else if (event === "message") {
                outer.receive_message(uuid, data.text);
            }
        };
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.uuid === uuid) {
                return player;
            }
        }
        return null;
    }

    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid; // 统一每个窗口火球的uuid
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);

        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    send_message(text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'text': text,
        }));
    }

    receive_message(uuid, text) {
        let player = this.get_player(uuid);
        if (player) {
            player.playground.chat_field.add_message(player.username, text);
        }
    }
}
class SxGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="sx-game-playground"></div>`);

        this.root.$sx_game.append(this.$playground);
        this.hide();

        this.start();
    }

    get_random_color() {
        let colors = ["blue", "green", "red", "yellow", "pink"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {
        let outer = this;
        // 当用户改变窗口大小的时候触发的事件
        $(window).resize(function() {
            outer.resize();
        });
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;

        if (this.game_map) this.game_map.resize();
    }

    show(mode) {
        let outer = this;
        // 打开playground页面
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.mode = mode;
        this.state = "waiting"; // 玩家状态 waiting --> fighting --> over
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;

        this.resize();

        this.players = []
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "single mode") {
            // 创建5个机器人
            for (let i = 0; i < 5; i++) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        } else if (mode === "multi mode") {
            this.chat_field = new ChatField(this);

            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
    }

    hide() { // 关闭playground页面
        this.$playground.hide();
    }
}
class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.SxOS) this.platform = "SXAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
            <div class="sx-game-settings">

                <div class="sx-game-settings-login">
                    <div class="sx-game-settings-title">
                        登陆
                    </div>

                    <div class="sx-game-settings-username">
                        <div class="sx-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>

                    <div class="sx-game-settings-password">
                        <div class="sx-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>

                    <div class="sx-game-settings-submit">
                        <div class="sx-game-settings-item">
                            <button>登陆</button>
                        </div>
                    </div>

                    <div class="sx-game-settings-error-message">
                    </div>

                    <div class="sx-game-settings-option">
                        注册
                    </div>
                    <br>
                    <div class="sx-game-settings-github">
                        <img width="30" src="https://app6532.acapp.acwing.com.cn/static/image/settings/github_logo.png">
                        <div>
                            GitHub登陆
                        </div>
                    </div>
                </div>


                <div class="sx-game-settings-register">
                    <div class="sx-game-settings-title">
                        注册
                    </div>

                    <div class="sx-game-settings-username">
                        <div class="sx-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>

                    <div class="sx-game-settings-password sx-game-settings-password-first">
                        <div class="sx-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>

                    <div class="sx-game-settings-password sx-game-settings-password-second">
                        <div class="sx-game-settings-item">
                            <input type="password" placeholder="确认密码">
                        </div>
                    </div>

                    <div class="sx-game-settings-submit">
                        <div class="sx-game-settings-item">
                            <button>注册</button>
                        </div>
                    </div>

                    <div class="sx-game-settings-error-message">
                    </div>

                    <div class="sx-game-settings-option">
                        登陆
                    </div>
                    <br>
                    <div class="sx-game-settings-github">
                        <img width="30" src="https://app6532.acapp.acwing.com.cn/static/image/settings/github_logo.png">
                        <div>
                            GitHhub登陆
                        </div>
                    </div>
                </div>

            </div>

        `);

        this.$login = this.$settings.find(".sx-game-settings-login");
        this.$login_username = this.$login.find(".sx-game-settings-username input");
        this.$login_password = this.$login.find(".sx-game-settings-password input");
        this.$login_submit = this.$login.find(".sx-game-settings-submit button");
        this.$login_error_message = this.$login.find(".sx-game-settings-error-message")
        this.$login_register = this.$login.find(".sx-game-settings-option");
        this.$login.hide();

        this.$register = this.$settings.find(".sx-game-settings-register");
        this.$register_username = this.$register.find(".sx-game-settings-username input");
        this.$register_password = this.$register.find(".sx-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".sx-game-settings-password-second input");
        this.$register_submit = this.$register.find(".sx-game-settings-submit button");
        this.$register_error_message = this.$register.find(".sx-game-settings-error-message")
        this.$register_login = this.$register.find(".sx-game-settings-option");
        this.$register.hide();

        this.$github_login = this.$settings.find('.sx-game-settings-github img')

        this.root.$sx_game.append(this.$settings);

        this.start();
    }

    start() {
        this.getinfo();
        this.add_listening_events();
    }

    // 绑定监听函数
    add_listening_events() {
        let outer = this;

        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$github_login.click(function() {
            outer.github_login();
        });
    }

    add_listening_events_login() {
        let outer = this;
        this.$login_register.click(function() {
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;
        this.$register_login.click(function() {
            outer.login();
        });
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    github_login() {
        $.ajax({
            url: "https://app6532.acapp.acwing.com.cn/settings/github/web/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    // 远程登陆
    login_on_remote() {
        let outer = this;

        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "https://app6532.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                if (resp.result == "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    // 远程注册
    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app6532.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload(); // 刷新页面
                } else {
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    // 远程登出
    logout_on_remote() {
        if (this.platform === "SXAPP") {
            this.root.SxOS.api.window.close();
        } else {
            $.ajax({
                url: "https://app6532.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function(resp) {
                    if (resp.result === "success") {
                        location.reload();
                    }
                },
            })
        }

    }

    register() { // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() { // 打开登陆界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo() {
        let outer = this;

        $.ajax({
            url: "https://app6532.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}
// zbase.js 保证文件排列在menu等3个文件后面
export class SxGame {
    constructor (id, SxOS) {
        this.id = id; // 这里是div的id: sx_game_1
        this.$sx_game = $('#' + id); // jquery查找该id元素
        this.SxOS = SxOS; // 判断是从哪个端口打开的

        this.settings = new Settings(this);

        this.menu = new SxGameMenu(this);
        this.playground = new SxGamePlayground(this);

    }

    start() {
    }
}
