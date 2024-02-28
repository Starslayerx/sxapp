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
