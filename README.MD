# My Online Game

[线上体验]() （服务器已到期）

进入网站后可注册帐号游玩，或使用GitHub授权登陆
> 由于GitHub服务器在国外，通过GitHub授权登陆可能比较卡，需要等待一会儿

游戏介绍：分为单人模式和多人模式，为了便于体验多人模式可使用同一帐号多次进入该模式，满3人后游戏开始

> 【注】单人游玩多人模式时，需要将3个窗口缩小到同一个屏幕内，不可放在后台否则不会进行渲染导致bug

多人模式有匹配系统，玩家默认分数1500，每1s匹配分数范围扩大50分，若分数差距较大需要等待匹配

玩法

- 右键移动
- 火球技能：按q后左键射击
- 闪现技能：按f后左键闪现，有距离限制
- 聊天功能：Enter打开聊天框，Esc关闭聊天框




## 项目结构

**项目系统设计**

-   `menu`：菜单
-   `playground`：对战界面
-   `settings`：设置


**项目文件结构**

-   `templates`目录：管理html文件
-   `urls`目录：管理路由，即链接与函数的对应关系
-   `views`目录：管理`http`函数
-   `models`目录：管理数据库数据
-   `static`目录：管理静态文件
    -   `css`：对象格式，例如位置、长宽、颜色、背景、字体等
    -   `js`：对象的逻辑，例如对象的创建与消毁、事件函数、移动、变色等
    -   `image`：图片
    -   `audio`：声音
-   `consumers`目录：管理`websocket`函数

>   以上项目文件结构，要与项目系统设计一一对应，每个文件夹中都应该有上面3个文件架（css文件不需要）




## 多人联机

需要同步的函数

-   create_player：创建玩家

-   move_to: 玩家移动

-   shoot_fireball: 发射火球
-   attack: 延迟

http：单向协议

websocket：双向协议，其加密协议为wss，在django中使用django_channels实现



-   玩家移动的同步原理

    首先监听函数检测到本窗口玩家的移动，然后调用`move_to()`函数，之后发现是多人模式`mode ==="multi player"`，调用`send_move_to()`函数，该函数通过WebSocket向服务器发送一个事件，在服务器的`consumers/index.py`文件中的`receive()`函数，发现事件是`move_to`，调用`self.move_to()`函数，该函数会向所有的layer群发该玩家移动的信息，每个窗口都在前端接收到信息，接收该信息后会路由到`receive_move_to()`函数，在该函数中，调用该玩家的移动函数`move_to`
