# Documentacao das rotas `punch` sem `auth`

## Resumo

Atualmente, na area de `punch`, existe 1 rota publica (sem middleware `auth`):

- `POST /punch`

As demais rotas de `punch` continuam protegidas por token e nao fazem parte deste documento.

## Endpoint publico

```http
POST /punch
```

## Objetivo

Registrar uma nova batida de ponto no instante atual (UTC canonico no backend).

## Request Body

```json
{
  "employeeId": "17",
  "password": "123456"
}
```

## Campos

- `employeeId`: `string` obrigatorio
- `password`: `string` obrigatorio

## Resposta de sucesso (`200`)

```json
{
  "punch": {
    "id": 231,
    "employeeId": 17,
    "employeeName": "Matheus",
    "timeStamp": "2026-03-23T14:02:11.000Z",
    "displayTimeBr": "23/03/2026, 11:02:11,000 BRT",
    "reportDayBr": "23/03/2026",
    "reportTimeBr": "11:02:11,000"
  },
  "systemLocalDate": "2026-03-23T14:02:11.000Z",
  "systemDisplayDateBr": "23/03/2026, 11:02:11,000 BRT",
  "punchDisplayTimeBr": "23/03/2026, 11:02:11,000 BRT"
}
```

## Regras importantes

- A senha do funcionario e validada no backend.
- Se a senha estiver incorreta, a batida nao e registrada.
- O sistema permite no maximo 4 batidas por funcionario no mesmo dia (dia de negocio em `America/Sao_Paulo`).
- Persistencia e transporte (`timeStamp`, `systemLocalDate`) sao sempre em UTC (`...Z`).
- Os campos `systemDisplayDateBr` e `punchDisplayTimeBr` sao apenas para exibicao em `America/Sao_Paulo`.
- Cada `punch` agora inclui `reportDayBr` e `reportTimeBr` para o frontend montar relatorio sem converter fuso.

## Integracao recomendada para o frontend

- Para agrupamento diario no relatorio, usar `punch.reportDayBr`.
- Para mostrar horario no relatorio, usar `punch.reportTimeBr` (ou `punch.displayTimeBr` se quiser data+hora juntos).
- Nao usar `timeStamp` diretamente para renderizacao local sem conversao de timezone.

## Erros comuns (`400`)

Exemplos de retorno:

```json
{
  "error": "Invalid input"
}
```

```json
{
  "error": "Employee not found"
}
```

```json
{
  "error": "Senha incorreta"
}
```

```json
{
  "error": "Limite de pontos atingido para hoje"
}
```

## Exemplo com `fetch`

```ts
await fetch('/punch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    employeeId: '17',
    password: '123456'
  })
});
```
