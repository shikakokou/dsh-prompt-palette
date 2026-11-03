# dsh-prompt-palette

DSH Web 输入框旁的提示词面板：把常用 prompt 存下来，搜索、编辑、点一条追加到当前草稿末尾。

工作方式：composer 右侧一个按钮 + 浮层；数据存在浏览器 `localStorage`，全程本地。

## 安装

插件的前端入口 `dist/client.js` 是构建产物，仓库里放的是源码，所以先 clone 下来构建一次：

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

装完重启对应的 `dsh` profile。profile 里装的是插件副本（pnpm 注入依赖），换了目录或重新构建之后要再 `add` 一次。

## 使用

- 输入框右侧出现提示词按钮，点开是面板。
- 点条目：追加到当前草稿，草稿非空时另起一行；插入后面板自动关闭。
- 已插入：标记显示在条目名称后面，判定依据是输入框里的文本（比较时忽略换行和缩进）。删改草稿后重新打开面板，标记就会更新。
- 点面板外区域（或按 Esc）关闭面板；点提示词按钮本身可开合。
- 复制：把条目正文写入剪贴板。
- 导入 / 导出：JSON；导入按 `id` 覆盖，没有则新建，可用于换机器或备份。
- 搜索匹配名称、正文、标签；标签可筛选。
- 界面文案跟随 DSH 的语言设置（中文 / English）。
- 首次运行会写入一条 `task-brief` 模板；删掉之后要靠导入恢复。
- 上限：200 条 / 名称 80 字 / 正文 20000 字 / 标签 10 个；超限时拒绝保存并提示。

## 数据

浏览器 `localStorage`，键 `dsh.prompt-palette.v1`，同一源下的 profile 共用。清站点数据会一起清掉，重要内容请先导出。

## 开发

```bash
pnpm install
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest run
pnpm build       # 产出 dist/client.js
```

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

`pnpm build` 产出的 `dist/client.js` 已包含 `__ModuleLoader__` 外壳；`dist/` 是构建产物，已在 `.gitignore` 里。`index.js` 是宿主入口，不需要构建。

### 改完怎么生效

profile 里装的是插件副本，workspace 里的 `dist` 更新之后要重新 `add` 一次：

```bash
pnpm build
dsh plugin --profile web remove dsh-prompt-palette
dsh plugin --profile web add "file:<克隆目录的绝对路径>"
```

重装即时生效，已打开的页面会自己换上新 bundle（`client-hmr` 每 500ms 轮询一次已装 bundle 的文件状态）。

## 卸载

```bash
dsh plugin --profile web remove dsh-prompt-palette
```
