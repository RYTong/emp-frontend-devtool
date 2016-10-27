# emp-frontend-devtool
EMP Frontend Development Environment

## Lua Debug

`Lua Debug` 是一个 Lua 调试的工具. 支持 Lua 的断点设置 ,单步调试等功能.基于 `Lua Socket` 实现.

### 本地 Lua 调试

1. 需要为 Lua 安装`Lua Socket`的库. [Binary](http://luaforge.net/projects/luabinaries/), 也可以使用源码安装 [Source Code](https://github.com/diegonehab/luasocket.git).

  安装方法参照 [Installation](http://w3.impa.br/~diego/software/luasocket/installation.html)

2. 获取 `mobdebug.lua` 脚本, 并把它放到需要调试的代码路径下.

3. 在需要调试的代码中添加 `require("mobdebug").start()` (如需特意指定 `Host` 和` Port`, 可以通过 `require("mobdebug").start(Host, Port)`, 来启动, 其中` Host` 默认为` localhost`, `Port` 默认为`8172`)

  ![Before Start](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/before_start_01.png)

4. 打开` Lua Debug` 面板.

  ![First Step](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_01.png)

5. 启动调试服务.

  ![Sec Step](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_02.png)

  ![Thi Step](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_03.png)

6. 在需要调试的地方添加断点.

  ![Add BP](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_loc_04.png)

  ![Add BP](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_loc_05.png)


7. 运行程序, 程序会在 添加 `require("mobdebug").start()` 的地方第一次阻塞.

  ![Debug Run](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_loc_06.png)

8. 点击` Run` 运行到断点处,阻塞.

  ![Debug Run](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_loc_07.png)

  ![Debug Run](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_loc_08.png)

9. 之后可以开始通过` Step Into` 进行单步调试.

### EMP Lua 调试

1. 确定你的客户端集成了 `Lua Socket`

2. 在需要调试的代码中添加 `require("mobdebug").start()` (如需特意指定 `Host` 和` Port`, 可以通过 `require("mobdebug").start(Host, Port)`, 来启动, 其中` Host` 默认为` localhost`, `Port` 默认为`8172`) (客户端已经集成` mobdebug.lua`)

3. 打开` Lua Debug` 面板.

  ![First Step](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_01.png)

4. 启动调试服务.

  ![Sec Step](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_02.png)

  ![Thi Step](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_03.png)

5. 在需要调试的地方添加断点.

  ![Add BP](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_04.png)

  ![Add BP](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_05.png)

6. 运行客户端, 程序会在 添加 `require("mobdebug").start()` 的地方第一次阻塞.

  ![Debug Run](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_06.png)

7. 点击` Run` 运行到断点处,阻塞.

  ![Debug Run](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_07.png)

  ![Debug Run](https://raw.githubusercontent.com/wiki/RYTong/emp-frontend-devtool/images/tutorials_08.png)

8. 调试按键从左到右功能如下:

  * `Run` : 运行到断点处阻塞.
  * `Step Over`: 运行下一行, 不会进入函数调用.
  * `Step Into`: 运行下一行, 遇到函数调用,会进入到函数.
  * `Step Out`: 运行到当前函数返回
  * `Step Donw`: 运行到结束, 忽略所有断点
