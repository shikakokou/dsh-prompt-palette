# dsh-prompt-palette

| 规则 | 由什么拦住 |
|---|---|
| 交差前跑 `pnpm test` | `pnpm test`（`node --test`，18 例） |
| 测试只守用户能感觉到的行为 | 见 `README.md` 开发说明：不要自造 DOM/React 替身冒充端到端测试 |
| 改动要在页面上生效 | `pnpm build` + `dsh plugin --profile web remove/add`（profile 里是插件副本，不跟 `dist` 变） |
| e2e 只用隔离实例和合成数据 | 无自动检查：另起端口 + 空 profile + Playwright 临时浏览器上下文；禁止使用用户的登录态、token、cookie、localStorage 或真实数据，也不向用户索取凭证 |
