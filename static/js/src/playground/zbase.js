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
