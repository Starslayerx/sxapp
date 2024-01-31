class SxGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
        <div> 游戏界面</div>
        `);

        this.hide();
        this.root.$sx_game.append(this.$playground);

        this.start();
    }

    start() {
    }

    update() {
    }

    show() { // 打开playground页面
        this.$playground.show();
    }

    hide() { // 关闭playground页面
        this.$playground.hide();
    }
}
