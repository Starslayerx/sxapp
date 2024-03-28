class GameMap extends SxGameObject {
    constructor(playground) {
        super(); // 调用基类的构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`); // 元素添加监听事件
        this.ctx = this.$canvas[0].getContext('2d'); // canvas[0]是指匹配到的第一个canvas元素
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        this.$canvas.focus(); // 将窗口聚焦
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        this.ctx.fillStyle = "rgba(0, 0, 0, 1)"; //  不透明，无渐变效果
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // 半透明，实现尾部模糊效果
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
