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
