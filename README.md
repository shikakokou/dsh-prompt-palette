# dsh-prompt-palette

DSH Web 的提示词面板：保存、搜索、编辑常用 prompt，点一条追加到当前输入框末尾。

## 安装

```bash
dsh plugin --profile web add "file:D:\KokoroAme workspace\dsh-prompt-palette"
```

装完重启对应的 `dsh` profile。

## 使用

- 输入框右侧出现提示词按钮，点开是面板。
- 点条目：追加到当前草稿，草稿非空时另起一行，插入后面板自动关闭。
- 已插入：标记显示在条目名称后面，依据输入框里的文本判定（比较时忽略换行和缩进），而不是点击动作。删改草稿后重新打开面板，标记就会更新。
- 点面板外区域（或按 Esc）关闭面板；点提示词按钮本身可开合。
- 复制：把条目正文写入剪贴板。
- 导入 / 导出：JSON；导入按 `id` 覆盖，没有则新建。
- 搜索匹配名称、正文、标签；标签可筛选。
- 首次运行会写入一条 `task-brief` 模板；删掉后不会自动补回。
- 上限：200 条 / 名称 80 字 / 正文 20000 字 / 标签 10 个。

数据存在浏览器 `localStorage`，键为 `dsh.prompt-palette.v1`，同一源下的 profile 共用。

## 开发

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

测试只保留 `node --test` 的纯逻辑用例（`tests/`），守的是用户能感觉到的行为：草稿追加、已插入判定、搜索、导入合并、上限校验、本地存储、浮窗定位。

`pnpm build` 产出的 `dist/client.js` 已包含 DSH 的 `__ModuleLoader__` 外壳；`index.js` 是宿主入口，不需要构建。

profile 里装的是插件副本（pnpm 注入依赖），不会跟着 workspace 里的 `dist` 变。改完代码重装一次即可，不用重启 profile：

```bash
pnpm build
dsh plugin --profile web remove dsh-prompt-palette
dsh plugin --profile web add "file:D:\KokoroAme workspace\dsh-prompt-palette"
```

重装后已打开的页面会自己换上新 bundle（`client-hmr` 每 500ms 轮询一次已装 bundle 的文件状态）。

## 卸载

```bash
dsh plugin --profile web remove dsh-prompt-palette
```
