# dsh-prompt-palette

DSH Web 输入框旁的提示词面板：把常用 prompt 存下来，搜索、编辑、点一条追加到当前草稿末尾。

工作方式：常驻在 composer 右侧的一个按钮 + 浮层，数据只存在浏览器 `localStorage`，不联网、不经过任何服务端。

## 安装

插件的前端 bundle 是构建产物，不进版本库（见 [开发](#开发)），所以要先 clone 下来构建一次：

```bash
git clone https://github.com/shikakokou/dsh-prompt-palette.git
cd dsh-prompt-palette
pnpm install
pnpm build
```

然后把**克隆目录的绝对路径**装进 profile：

```bash
# Windows
dsh plugin --profile web add "file:D:\KokoroAme workspace\dsh-prompt-palette"

# macOS / Linux
dsh plugin --profile web add "file:/home/you/dsh-prompt-palette"
```

装完重启对应的 `dsh` profile。profile 里装的是插件副本（pnpm 注入依赖），不是一个软链，所以换目录或重建后要重新 `add` 一次。

> 直接 `dsh plugin --profile web add github:shikakokou/dsh-prompt-palette` 装出来的包不带 `dist/client.js`，前端入口会缺失，不要用——先 clone 再 build。

## 使用

- 输入框右侧出现提示词按钮，点开是面板。
- 点条目：追加到当前草稿，草稿非空时另起一行；插入后面板自动关闭。
- 已插入：标记显示在条目名称后面，依据输入框里的文本判定（比较时忽略换行和缩进），而不是点击动作。删改草稿后重新打开面板，标记就会更新。
- 点面板外区域（或按 Esc）关闭面板；点提示词按钮本身可开合。
- 复制：把条目正文写入剪贴板。
- 导入 / 导出：JSON；导入按 `id` 覆盖，没有则新建，可用于换机器或备份。
- 搜索匹配名称、正文、标签；标签可筛选。
- 界面文案跟随 DSH 的语言设置（中文 / English）。
- 首次运行会写入一条 `task-brief` 模板；删掉后不会自动补回。
- 上限：200 条 / 名称 80 字 / 正文 20000 字 / 标签 10 个；超限时拒绝保存并提示。

## 数据

浏览器 `localStorage`，键 `dsh.prompt-palette.v1`，同一源下的 profile 共用。清站点数据会一起清掉，重要内容请先导出。

## 开发

```bash
pnpm install
pnpm typecheck   # tsc --noEmit
pnpm test        # node --test，18 例
pnpm build       # 产出 dist/client.js
```

测试只保留 `node --test` 的纯逻辑用例（`tests/`），守的是用户能感觉到的行为：草稿追加、已插入判定、搜索、导入合并、上限校验、本地存储、浮窗定位。不造 DOM/React 替身去冒充端到端测试。

### 结构

| 文件 | 作用 |
|---|---|
| `index.js` | 宿主入口（空实现，只为让 profile 认这个是 bundle） |
| `cordis.patch.yml` | 向 profile 注册插件 |
| `src/client.tsx` | 按钮、面板、编辑与增删改查 |
| `src/placement.ts` | 浮窗定位（避免出视口） |
| `src/model.ts` | 上限、追加、匹配、已插入判定、导入合并 |
| `src/storage.ts` | `localStorage` 读写与校验 |
| `src/locales/{zh,en}.json` | 文案 |
| `vite.config.ts` | 打成 CJS，外面包一层 DSH 的 `__ModuleLoader__` 外壳 |

`pnpm build` 产出的 `dist/client.js` 已包含 `__ModuleLoader__` 外壳；`dist/` 是构建产物，已在 `.gitignore` 里，不要提交。`index.js` 是宿主入口，不需要构建。

### 改完怎么生效

profile 里装的是插件副本，不会跟着 workspace 里的 `dist` 变。改完代码重装一次即可，不用重启 profile：

```bash
pnpm build
dsh plugin --profile web remove dsh-prompt-palette
dsh plugin --profile web add "file:<克隆目录的绝对路径>"
```

重装后已打开的页面会自己换上新 bundle（`client-hmr` 每 500ms 轮询一次已装 bundle 的文件状态）。

## 卸载

```bash
dsh plugin --profile web remove dsh-prompt-palette
```
