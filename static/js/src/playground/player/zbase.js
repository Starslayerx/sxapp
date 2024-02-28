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
