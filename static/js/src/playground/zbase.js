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
