# Release 1.27.1 — publicação npm

Inclui **1.27.0** (`task-flow: split`) + **1.27.1** (`split:N` obrigatório).

## Publicar

```bash
npm publish --otp=SEU_2FA
npm view rbin-task-flow version   # → 1.27.1
```

## Consumidores

```bash
npm install -g rbin-task-flow@1.27.1
cd your-project && rbin-task-flow update
```

## Uso split

```text
task-flow: split:3
task-flow: split:3 50-72
```
