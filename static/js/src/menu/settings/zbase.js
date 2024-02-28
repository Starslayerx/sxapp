class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.SxOS) this.platform = "SXAPP";
    }

    start() {
        this.getinfo();
    }

    register() { // 打开注册界面
    }

    login() { // 打开登陆界面
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
                conosle.log(resp);
                if (resp.result === "success") {
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        })
    }

    hide() {
    }

    show() {
    }
}
