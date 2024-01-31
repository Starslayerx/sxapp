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
                        设置
                    </div>
                </div>
            </div>
        `);
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
        });
    }

    show() { // 显示menu页面
        this.$menu.show();
    }

    hide() { // 关闭menu页面
        this.$menu.hide();
    }
}
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
// zbase.js 保证文件排列在menu等3个文件后面
export class SxGame {
    constructor (id) {
        this.id = id; // 这里是div的id: sx_game_1
        this.$sx_game = $('#' + id); // jquery查找该id元素
        this.menu = new SxGameMenu(this);
        this.playground = new SxGamePlayground(this);
    }

    start() {
    }
}