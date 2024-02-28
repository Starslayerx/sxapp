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
            outer.root.playground.show(); // 展示playground
        });
        this.$multi_mode.click(function() {
            console.log("click multi mode");
        });
        this.$settings.click(function() {
            console.log("click settings");
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
class GameMap extends SxGameObject {
    constructor(playground) {
        super(); // 调用基类的构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d'); // canvas[0]是指匹配到的第一个canvas元素
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        // this.$canvas.focus();
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // 半透明，实现尾部模糊效果
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
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
        this.eps = 1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends SxGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
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
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.9; // 磨擦力
        this.spent_time = 0; // 记录时间

        this.cur_skill = null;

        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }


    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            // random: 0~1
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        }); // 关闭右键菜单
        this.playground.game_map.$canvas.mousedown(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            // 3:右键; 2:左键
            if (e.which === 3) {
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top); // 鼠标坐标 (clientXY 整个屏幕的绝对坐标)
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }
                outer.cur_skill = null;
            }

        });

        // 获取键盘按键
        $(window).keydown(function(e) {
            // keycode 事件表
            // 81: q
            if (e.which === 81) {
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    // 获取鼠标与当前player的角度
    getMouseAngle(tx, ty) {
        return Math.atan2(ty - this.y, tx - this.x);
    }

    shoot_fireball(tx, ty) {
        let x = this.x + this.radius * Math.cos(this.getMouseAngle(tx, ty)); // 火球生成增加偏移
        let y = this.y + this.radius * Math.sin(this.getMouseAngle(tx, ty));
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;

        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
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
        if (this.radius < 10) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 1.15; // 被攻击后速度
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        // 敌人随机发射火球，3s保护期，平均5s一次
        if (!this.is_me && this.spent_time > 3 && Math.random() < 1 / 300.0) {
            // 相互攻击，players[0]则攻击玩家
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            // 预判0.3s后位置
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0; // 离目标很进时，停止移动
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
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
        this.render();
    }

    render() {
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
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
        this.eps = 0.1;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        // 每帧移动的距离
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        // x y方向移动
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        // 更新距离目的地的距离
        this.move_length -= moved;

        this.render();

        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
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
        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class SxGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="sx-game-playground"></div>`);

        this.hide();

        this.start();
    }

    get_random_color() {
        let colors = ["blue", "green", "red", "yellow", "pink"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {
    }

    update() {
    }

    show() { // 打开playground页面
        this.$playground.show();
        this.root.$sx_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = []
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        // 创建5个敌人
        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
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
                            GitHhub登陆
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

        this.root.$sx_game.append(this.$settings);

        this.start();
    }

    start() {
        this.getinfo();
        this.add_listening_events();
    }

    // 绑定监听函数
    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
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
                console.log(resp);
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
                console.log(resp);
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
        if (this.platform === "SXAPP") return false;

        $.ajax({
            url: "https://app6532.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                }
            },
        })
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
                console.log("Response:", resp);
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        })
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
