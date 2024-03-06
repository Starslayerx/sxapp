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
                console.log(resp);
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
